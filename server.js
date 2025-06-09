const express = require('express');
const http = require('http');
require('dotenv').config();
const socketIo = require('socket.io');
const path = require('path');
const AIModeration = require('./ai-moderation');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Store connected users
const users = new Map();
const waitingUsers = new Set();

// Initialize AI Moderation Service
const aiModeration = new AIModeration();
aiModeration.initialize();

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Add user to the users map
    users.set(socket.id, {
        id: socket.id,
        partnerId: null,
        isSearching: false,
        preferences: null
    });
    
    // Broadcast online count to all users
    io.emit('online-count', users.size);
    
    // Handle user preferences
    socket.on('set-preferences', (preferences) => {
        const currentUser = users.get(socket.id);
        if (currentUser) {
            currentUser.preferences = preferences;
            console.log(`User ${socket.id} set preferences:`, preferences);
        }
    });
    
    // Handle user looking for a chat partner
    socket.on('find-user', (preferences) => {
        const currentUser = users.get(socket.id);
        if (!currentUser) return;
        
        // Store preferences if provided
        if (preferences) {
            currentUser.preferences = preferences;
        }
        
        // If user is already connected, disconnect them first
        if (currentUser.partnerId) {
            const partner = users.get(currentUser.partnerId);
            if (partner) {
                partner.partnerId = null;
                io.to(currentUser.partnerId).emit('user-disconnected');
            }
            currentUser.partnerId = null;
        }
        
        currentUser.isSearching = true;
        
        // Find compatible waiting users
        const availableUsers = Array.from(waitingUsers).filter(userId => {
            if (userId === socket.id || !users.has(userId)) return false;
            
            const potentialPartner = users.get(userId);
            if (!potentialPartner || !potentialPartner.preferences || !currentUser.preferences) {
                return true; // Allow matching if preferences not set
            }
            
            // Check gender compatibility
            const genderMatch = (
                currentUser.preferences.preferredGender === 'any' ||
                potentialPartner.preferences.preferredGender === 'any' ||
                (
                    currentUser.preferences.preferredGender === potentialPartner.preferences.userGender &&
                    potentialPartner.preferences.preferredGender === currentUser.preferences.userGender
                )
            );
            
            // Check category compatibility
            const categoryMatch = (
                currentUser.preferences.preferredCategory === 'any' ||
                potentialPartner.preferences.preferredCategory === 'any' ||
                (
                    currentUser.preferences.preferredCategory === potentialPartner.preferences.category &&
                    potentialPartner.preferences.preferredCategory === currentUser.preferences.category
                )
            );
            
            return genderMatch && categoryMatch;
        });
        
        if (availableUsers.length > 0) {
            // Match with the first compatible user
            const partnerId = availableUsers[0];
            const partner = users.get(partnerId);
            
            if (partner && partner.isSearching) {
                // Remove both users from waiting list
                waitingUsers.delete(socket.id);
                waitingUsers.delete(partnerId);
                
                // Set up the connection
                currentUser.partnerId = partnerId;
                partner.partnerId = socket.id;
                currentUser.isSearching = false;
                partner.isSearching = false;
                
                // Notify both users with partner information
                socket.emit('user-connected', { 
                    partnerId, 
                    shouldCreateOffer: true,
                    partnerInfo: {
                        gender: partner.preferences.userGender,
                        category: partner.preferences.category
                    }
                });
                io.to(partnerId).emit('user-connected', { 
                    partnerId: socket.id, 
                    shouldCreateOffer: false,
                    partnerInfo: {
                        gender: currentUser.preferences.userGender,
                        category: currentUser.preferences.category
                    }
                });
                
                console.log(`Matched users: ${socket.id} <-> ${partnerId}`);
                console.log('User 1 preferences:', currentUser.preferences);
                console.log('User 2 preferences:', partner.preferences);
            } else {
                // Add to waiting list
                waitingUsers.add(socket.id);
                socket.emit('searching');
            }
        } else {
            // No compatible users available, add to waiting list
            waitingUsers.add(socket.id);
            socket.emit('no-users');
        }
    });
    
    // Handle WebRTC signaling
    socket.on('offer', (offer) => {
        const currentUser = users.get(socket.id);
        if (currentUser && currentUser.partnerId) {
            io.to(currentUser.partnerId).emit('offer', offer);
        }
    });
    
    socket.on('answer', (answer) => {
        const currentUser = users.get(socket.id);
        if (currentUser && currentUser.partnerId) {
            io.to(currentUser.partnerId).emit('answer', answer);
        }
    });
    
    socket.on('ice-candidate', (candidate) => {
        const currentUser = users.get(socket.id);
        if (currentUser && currentUser.partnerId) {
            io.to(currentUser.partnerId).emit('ice-candidate', candidate);
        }
    });
    
    // Handle chat messages
    socket.on('chat-message', (data) => {
        const currentUser = users.get(socket.id);
        if (currentUser && currentUser.partnerId) {
            // Check if user is banned before allowing messages
            if (aiModeration.isUserBanned(socket.id)) {
                socket.emit('user-banned', {
                    reason: 'You have been banned for inappropriate behavior',
                    duration: '7 days'
                });
                return;
            }
            
            io.to(currentUser.partnerId).emit('chat-message', data);
        }
    });
    
    // Handle user reports
    socket.on('report-user', async (data) => {
        const { reportedUserId, reason } = data;
        const currentUser = users.get(socket.id);
        
        if (!currentUser || !currentUser.partnerId) {
            socket.emit('report-error', { message: 'No active chat to report' });
            return;
        }
        
        if (currentUser.partnerId !== reportedUserId) {
            socket.emit('report-error', { message: 'Can only report current chat partner' });
            return;
        }
        
        try {
            const result = await aiModeration.handleUserReport(
                socket.id, 
                reportedUserId, 
                reason || 'Inappropriate behavior'
            );
            
            if (result.success) {
                socket.emit('report-success', {
                    message: result.message,
                    reportId: result.reportId
                });
                
                // Notify the reported user (optional)
                io.to(reportedUserId).emit('being-analyzed', {
                    message: 'Your behavior is being analyzed due to a report'
                });
            } else {
                socket.emit('report-error', { message: result.message });
            }
        } catch (error) {
            console.error('Error handling user report:', error);
            socket.emit('report-error', { message: 'Failed to submit report' });
        }
    });
    
    // Handle video frame analysis for AI moderation
    socket.on('analyze-frame', async (frameData) => {
        try {
            const result = await aiModeration.analyzeVideoFrame(frameData, socket.id);
            
            if (result.isViolation) {
                console.log(`Violation detected for user ${socket.id}:`, result.violations);
                
                // Take action based on violation severity
                switch (result.action) {
                    case 'immediate_ban':
                        const banInfo = await aiModeration.banUser(socket.id, 'Immediate ban due to critical violation');
                        socket.emit('user-banned', {
                            reason: 'Inappropriate content detected',
                            duration: '7 days',
                            violations: result.violations
                        });
                        
                        // Disconnect the user
                        const currentUser = users.get(socket.id);
                        if (currentUser && currentUser.partnerId) {
                            io.to(currentUser.partnerId).emit('partner-banned', {
                                message: 'Your chat partner has been banned for inappropriate behavior'
                            });
                        }
                        
                        socket.disconnect();
                        break;
                        
                    case 'temporary_ban':
                        socket.emit('violation-warning', {
                            message: 'Warning: Inappropriate content detected. Further violations will result in a ban.',
                            violations: result.violations
                        });
                        break;
                        
                    case 'warning':
                        socket.emit('content-warning', {
                            message: 'Please ensure your behavior follows community guidelines',
                            violations: result.violations
                        });
                        break;
                }
            }
        } catch (error) {
            console.error('Error analyzing frame:', error);
        }
    });
    
    // Handle stopping search for partners
    socket.on('stop-search', () => {
        const currentUser = users.get(socket.id);
        if (currentUser) {
            currentUser.isSearching = false;
            waitingUsers.delete(socket.id);
            console.log(`User ${socket.id} stopped searching`);
        }
    });
    
    // Handle user disconnection from chat
    socket.on('disconnect-user', () => {
        const currentUser = users.get(socket.id);
        if (currentUser && currentUser.partnerId) {
            const partner = users.get(currentUser.partnerId);
            if (partner) {
                partner.partnerId = null;
                io.to(currentUser.partnerId).emit('user-disconnected');
            }
            currentUser.partnerId = null;
        }
        
        // Remove from waiting list
        waitingUsers.delete(socket.id);
        
        if (currentUser) {
            currentUser.isSearching = false;
        }
    });
    
    // Handle socket disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        const currentUser = users.get(socket.id);
        if (currentUser) {
            // Notify partner if connected
            if (currentUser.partnerId) {
                const partner = users.get(currentUser.partnerId);
                if (partner) {
                    partner.partnerId = null;
                    io.to(currentUser.partnerId).emit('user-disconnected');
                }
            }
            
            // Remove from waiting list
            waitingUsers.delete(socket.id);
            
            // Remove from users map
            users.delete(socket.id);
        }
        
        // Broadcast updated online count
        io.emit('online-count', users.size);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});