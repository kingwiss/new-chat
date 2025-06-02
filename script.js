class VideoChat {
    constructor() {
        this.socket = null;
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.isConnected = false;
        this.isSearching = false;
        this.userPreferences = null;
        
        // Initialize DOM elements
        this.initializeDOMElements();
        
        // Initialize event listeners
        if (this.elementsLoaded) {
            this.initializeEventListeners();
            this.connectSocket();
            this.resetToInitialState();
        }
    }
    
    initializeDOMElements() {
        try {
            // Video elements
            this.localVideo = document.getElementById('localVideo');
            this.remoteVideo = document.getElementById('remoteVideo');
            
            // Button elements
            this.startBtn = document.getElementById('startBtn');
            this.nextBtn = document.getElementById('nextBtn');
            this.endBtn = document.getElementById('endBtn');
            this.sendBtn = document.getElementById('sendBtn');
            
            // Input elements
            this.chatInput = document.getElementById('chatInput');
            
            // Status elements
            this.statusMessage = document.getElementById('statusMessage');
            this.waitingMessage = document.getElementById('waitingMessage');
            this.chatMessages = document.getElementById('chatMessages');
            
            // Video labels
            this.localVideoLabel = document.getElementById('localVideoLabel');
            this.remoteVideoLabel = document.getElementById('remoteVideoLabel');
            
            // Debug each element
            console.log('DOM Elements Check:');
            console.log('localVideo:', this.localVideo);
            console.log('remoteVideo:', this.remoteVideo);
            console.log('startBtn:', this.startBtn);
            console.log('nextBtn:', this.nextBtn);
            console.log('endBtn:', this.endBtn);
            console.log('sendBtn:', this.sendBtn);
            console.log('chatInput:', this.chatInput);
            console.log('statusMessage:', this.statusMessage);
            
            // Check if all elements are loaded
            const requiredElements = [
                this.localVideo, this.remoteVideo, this.startBtn, this.nextBtn, 
                this.endBtn, this.sendBtn, this.chatInput, this.statusMessage
            ];
            
            this.elementsLoaded = requiredElements.every(element => element !== null);
            
            if (this.elementsLoaded) {
                console.log('All DOM elements loaded successfully');
            } else {
                console.error('Some DOM elements failed to load');
                requiredElements.forEach((element, index) => {
                    const elementNames = ['localVideo', 'remoteVideo', 'startBtn', 'nextBtn', 'endBtn', 'sendBtn', 'chatInput', 'statusMessage'];
                    if (!element) {
                        console.error(`Missing element: ${elementNames[index]}`);
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing DOM elements:', error);
            this.elementsLoaded = false;
        }
    }
    
    initializeEventListeners() {
        // Start button
        this.startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Start button clicked');
            console.log('Elements loaded:', this.elementsLoaded);
            console.log('Start button element:', this.startBtn);
            console.log('Category modal element:', document.getElementById('categoryModal'));
            this.showCategoryModal();
        });
        
        // Next button
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.nextBtn.disabled) {
                console.log('Next button clicked');
                this.nextUser();
            }
        });
        
        // End button
        this.endBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.endBtn.disabled) {
                console.log('End button clicked');
                this.endChat();
            }
        });
        
        // Chat functionality
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Initialize modals
        this.initializeCategoryModal();
        this.initializeContactModal();
        this.initializeWelcomeModal();
    }
    
    resetToInitialState() {
        console.log('Resetting to initial state');
        
        // Enable start button
        this.startBtn.disabled = false;
        this.startBtn.removeAttribute('disabled');
        this.startBtn.style.pointerEvents = 'auto';
        this.startBtn.style.opacity = '1';
        this.startBtn.style.cursor = 'pointer';
        
        // Disable other buttons
        this.nextBtn.disabled = true;
        this.nextBtn.setAttribute('disabled', 'true');
        this.endBtn.disabled = true;
        this.endBtn.setAttribute('disabled', 'true');
        
        // Disable chat
        this.chatInput.disabled = true;
        this.sendBtn.disabled = true;
        
        // Reset status
        this.statusMessage.textContent = 'Click "Start Chat" to begin';
        this.hideWaiting();
        
        // Clear videos
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        
        // Reset labels
        this.resetVideoLabels();
        
        console.log('Initial state set - Start button enabled, others disabled');
    }
    
    setActiveState() {
        console.log('Setting active chat state');
        
        // Disable start button
        this.startBtn.disabled = true;
        this.startBtn.setAttribute('disabled', 'true');
        
        // Enable next and end buttons
        this.nextBtn.disabled = false;
        this.nextBtn.removeAttribute('disabled');
        this.endBtn.disabled = false;
        this.endBtn.removeAttribute('disabled');
        
        // Enable chat
        this.chatInput.disabled = false;
        this.sendBtn.disabled = false;
        
        console.log('Active state set - Next and End buttons enabled');
    }
    
    async startVideoChat() {
        console.log('Starting video chat');
        
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            
            // Set active state
            this.setActiveState();
            
            // Update status
            this.statusMessage.textContent = 'Looking for someone to chat with...';
            this.showWaiting();
            
            // Start searching
            this.socket.emit('find-user', this.userPreferences);
            
        } catch (error) {
            console.error('Error starting video chat:', error);
            this.statusMessage.textContent = 'Error accessing camera. Please check permissions.';
            this.resetToInitialState();
        }
    }
    
    endChat() {
        console.log('Ending chat');
        
        // Stop all media streams
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        // Reset connection states
        this.isConnected = false;
        this.isSearching = false;
        
        // Clear chat
        this.clearChat();
        
        // Disconnect from socket
        if (this.socket) {
            this.socket.emit('stop-search');
            this.socket.emit('disconnect-user');
        }
        
        // Reset to initial state
        this.resetToInitialState();
        
        console.log('Chat ended successfully');
    }
    
    nextUser() {
        if (this.isSearching) return;
        
        this.isSearching = true;
        this.nextBtn.disabled = true;
        
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        this.remoteVideo.srcObject = null;
        this.isConnected = false;
        this.clearChat();
        this.resetVideoLabels();
        
        this.statusMessage.textContent = 'Looking for next person...';
        this.showWaiting();
        
        this.socket.emit('find-user', this.userPreferences);
        
        setTimeout(() => {
            this.nextBtn.disabled = false;
            this.isSearching = false;
        }, 2000);
    }
    
    // Socket connection
    connectSocket() {
        this.socket = io();
        
        this.socket.on('user-connected', (data) => {
            console.log('User connected:', data);
            this.handleUserConnected(data);
        });
        
        this.socket.on('offer', async (offer) => {
            console.log('Received offer');
            await this.handleOffer(offer);
        });
        
        this.socket.on('answer', async (answer) => {
            console.log('Received answer');
            await this.handleAnswer(answer);
        });
        
        this.socket.on('ice-candidate', (candidate) => {
            console.log('Received ICE candidate');
            this.handleIceCandidate(candidate);
        });
        
        this.socket.on('user-disconnected', () => {
            console.log('User disconnected');
            this.handleUserDisconnected();
        });
        
        this.socket.on('message', (data) => {
            this.displayMessage(data.message, 'received');
        });
        
        this.socket.on('no-users', () => {
            this.statusMessage.textContent = 'No users available. Waiting for someone to join...';
        });
    }
    
    // WebRTC functions
    async createPeerConnection() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });
        
        this.peerConnection.ontrack = (event) => {
            this.remoteVideo.srcObject = event.streams[0];
            this.isConnected = true;
            this.hideWaiting();
            this.statusMessage.textContent = 'Connected! You can now chat.';
        };
        
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', event.candidate);
            }
        };
    }
    
    async handleUserConnected(data) {
        await this.createPeerConnection();
        
        if (data.shouldCreateOffer) {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.socket.emit('offer', offer);
        }
    }
    
    async handleOffer(offer) {
        await this.createPeerConnection();
        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.socket.emit('answer', answer);
    }
    
    async handleAnswer(answer) {
        await this.peerConnection.setRemoteDescription(answer);
    }
    
    handleIceCandidate(candidate) {
        if (this.peerConnection) {
            this.peerConnection.addIceCandidate(candidate);
        }
    }
    
    handleUserDisconnected() {
        this.remoteVideo.srcObject = null;
        this.isConnected = false;
        this.statusMessage.textContent = 'User disconnected. Looking for someone else...';
        this.showWaiting();
        
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        this.socket.emit('find-user', this.userPreferences);
    }
    
    // Chat functions
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (message && this.isConnected) {
            this.socket.emit('message', message);
            this.displayMessage(message, 'sent');
            this.chatInput.value = '';
        }
    }
    
    displayMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    clearChat() {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
    }
    
    // UI helper functions
    showWaiting() {
        if (this.waitingMessage) {
            this.waitingMessage.style.display = 'block';
        }
    }
    
    hideWaiting() {
        if (this.waitingMessage) {
            this.waitingMessage.style.display = 'none';
        }
    }
    
    resetVideoLabels() {
        if (this.localVideoLabel) {
            this.localVideoLabel.textContent = 'You';
        }
        if (this.remoteVideoLabel) {
            this.remoteVideoLabel.textContent = 'Waiting for connection...';
        }
    }
    
    // Modal functions
    initializeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        const closeBtn = document.getElementById('closeCategoryModal');
        const categoryForm = document.getElementById('categoryForm');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Category form submitted');
                
                // Get form values
                const category = document.getElementById('categorySelect').value;
                const userGender = document.getElementById('userGender').value;
                const preferredGender = document.getElementById('preferredGender').value;
                const preferredCategory = document.getElementById('preferredCategory').value;
                
                // Set user preferences
                this.userPreferences = {
                    category,
                    userGender,
                    preferredGender,
                    preferredCategory
                };
                
                console.log('User preferences:', this.userPreferences);
                
                // Hide modal and start chat
                modal.style.display = 'none';
                this.startVideoChat();
            });
        } else {
            console.error('Category form not found');
        }
    }
    
    showCategoryModal() {
        console.log('showCategoryModal called');
        const modal = document.getElementById('categoryModal');
        console.log('Modal element found:', modal);
        if (modal) {
            console.log('Setting modal display to flex');
            modal.style.display = 'flex';
            console.log('Modal display style after setting:', modal.style.display);
        } else {
            console.error('Category modal not found!');
        }
    }
    
    initializeContactModal() {
        const contactBtn = document.getElementById('contactBtn');
        const contactModal = document.getElementById('contactModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (contactBtn && contactModal) {
            contactBtn.addEventListener('click', () => {
                contactModal.style.display = 'flex';
            });
        }
        
        if (closeModal && contactModal) {
            closeModal.addEventListener('click', () => {
                contactModal.style.display = 'none';
            });
        }
        
        if (cancelBtn && contactModal) {
            cancelBtn.addEventListener('click', () => {
                contactModal.style.display = 'none';
            });
        }
    }
    
    initializeWelcomeModal() {
        const welcomeModal = document.getElementById('welcomeModal');
        
        // Show welcome modal on first visit
        if (welcomeModal && !localStorage.getItem('welcomeShown')) {
            welcomeModal.style.display = 'flex';
        }
    }
}

// Initialize the video chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing VideoChat application');
    window.videoChat = new VideoChat();
});