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
        this.floatingMessages = document.getElementById('floatingMessages');
        this.onlineCount = document.getElementById('onlineCount');
            
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
                this.endBtn, this.sendBtn, this.chatInput, this.statusMessage, this.onlineCount
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
        // Reset UI
        this.statusMessage.textContent = 'Click "Start" to begin';
        this.hideWaiting();
        
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
            this.statusMessage.style.display = 'block';
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
        
        // Hide report button when chat ends
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.style.display = 'none';
        }
        
        // Stop AI monitoring
        this.stopAIMonitoring();
        
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
        
        this.statusMessage.style.display = 'block';
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
        
        this.socket.on('partner-connected', (data) => {
            this.isConnected = true;
            this.partnerId = data.partnerId;
            this.statusMessage.textContent = 'Connected! You can now start chatting.';
            this.statusMessage.style.color = '#4CAF50';
            this.nextBtn.style.display = 'inline-block';
            this.endChatBtn.style.display = 'inline-block';
            this.chatInput.style.display = 'block';
            this.chatInput.focus();
            
            // Show report button when connected
            const reportBtn = document.getElementById('reportBtn');
            if (reportBtn) {
                reportBtn.style.display = 'flex';
                reportBtn.style.visibility = 'visible';
                reportBtn.style.opacity = '1';
                console.log('Report button should now be visible');
            } else {
                console.error('Report button element not found!');
            }
            
            // Start AI monitoring (capture frames periodically)
            this.startAIMonitoring();
        });
        
        this.socket.on('chat-message', (data) => {
            this.displayMessage(data, 'received');
        });
        
        // Handle AI moderation events
        this.socket.on('user-banned', (data) => {
            this.showBanNotification(data);
            this.endChat();
        });
        
        this.socket.on('partner-banned', (data) => {
            this.showPartnerBannedNotification(data);
            this.endChat();
        });
        
        this.socket.on('violation-warning', (data) => {
            this.showViolationWarning(data);
        });
        
        this.socket.on('content-warning', (data) => {
            this.showContentWarning(data);
        });
        
        this.socket.on('being-analyzed', (data) => {
            this.showAnalysisNotification(data);
        });
        
        // Handle report responses
        this.socket.on('report-success', (data) => {
            this.showReportSuccess(data);
        });
        
        this.socket.on('report-error', (data) => {
            this.showReportError(data);
        });
        
        this.socket.on('online-count', (count) => {
            if (this.onlineCount) {
                this.onlineCount.textContent = `Online users: ${count}`;
            }
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
            // Clear any previous status and set connected message
            setTimeout(() => {
                this.statusMessage.textContent = 'Connected! You can now chat.';
                // Hide status message after 3 seconds when connected
                setTimeout(() => {
                    if (this.isConnected) {
                        this.statusMessage.style.display = 'none';
                    }
                }, 3000);
            }, 500);
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
        
        // Update status but don't show "Connection in progress" message
        this.statusMessage.textContent = 'Establishing connection...';
        this.hideWaiting();
        
        this.socket.emit('answer', answer);
    }
    
    async handleAnswer(answer) {
        await this.peerConnection.setRemoteDescription(answer);
        
        // Update status but don't show "Connection in progress" message
        this.statusMessage.textContent = 'Establishing connection...';
        this.hideWaiting();
    }
    
    handleIceCandidate(candidate) {
        if (this.peerConnection) {
            this.peerConnection.addIceCandidate(candidate);
        }
    }
    
    handleUserDisconnected() {
        this.remoteVideo.srcObject = null;
        this.isConnected = false;
        this.statusMessage.style.display = 'block';
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
            this.socket.emit('chat-message', message);
            this.displayMessage(message, 'sent');
            this.chatInput.value = '';
        }
    }
    
    displayMessage(message, type) {
        // Create floating message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `floating-message ${type === 'sent' ? 'own' : 'other'}`;
        messageDiv.textContent = message;
        
        // Position the message randomly on screen
        const randomX = Math.random() * 60 + 10; // 10% to 70% from left
        const randomY = Math.random() * 40 + 20; // 20% to 60% from top
        
        messageDiv.style.left = randomX + '%';
        messageDiv.style.top = randomY + '%';
        
        // Add to floating messages container
        this.floatingMessages.appendChild(messageDiv);
        
        // Remove message after animation completes (8 seconds)
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 8000);
        
        // Limit number of messages on screen (remove oldest if more than 5)
        const existingMessages = this.floatingMessages.children;
        if (existingMessages.length > 5) {
            this.floatingMessages.removeChild(existingMessages[0]);
        }
    }
    
    clearChat() {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
        if (this.floatingMessages) {
            this.floatingMessages.innerHTML = '';
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
        const contactForm = document.getElementById('contactForm');
        const thankYouMessage = document.getElementById('thankYouMessage');
        const closeThankYou = document.getElementById('closeThankYou');
        
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
        
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault(); // Prevent form from submitting normally
                
                // Get form data
                const formData = new FormData(contactForm);
                
                // Send form data via fetch API
                fetch('https://formsubmit.co/fredwisseh@gmail.com', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    // Hide the form and show thank you message
                    contactForm.style.display = 'none';
                    thankYouMessage.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error submitting form:', error);
                });
            });
        }
        
        if (closeThankYou) {
            closeThankYou.addEventListener('click', () => {
                // Hide thank you message, show form again, and close modal
                thankYouMessage.style.display = 'none';
                contactForm.style.display = 'block';
                contactModal.style.display = 'none';
                contactForm.reset(); // Reset form fields
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
    
    showContactModal() {
        document.getElementById('contactModal').style.display = 'block';
    }

    hideContactModal() {
        document.getElementById('contactModal').style.display = 'none';
    }
    
    // AI Monitoring Methods
    startAIMonitoring() {
        // Capture video frames every 10 seconds for AI analysis
        this.aiMonitoringInterval = setInterval(() => {
            this.captureAndAnalyzeFrame();
        }, 10000);
    }
    
    stopAIMonitoring() {
        if (this.aiMonitoringInterval) {
            clearInterval(this.aiMonitoringInterval);
            this.aiMonitoringInterval = null;
        }
    }
    
    captureAndAnalyzeFrame() {
        if (!this.isConnected || !this.localVideo.srcObject) return;
        
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.localVideo.videoWidth;
            canvas.height = this.localVideo.videoHeight;
            
            ctx.drawImage(this.localVideo, 0, 0);
            
            // Convert to blob and send for analysis
            canvas.toBlob((blob) => {
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        this.socket.emit('analyze-frame', {
                            frameData: reader.result,
                            timestamp: Date.now()
                        });
                    };
                    reader.readAsArrayBuffer(blob);
                }
            }, 'image/jpeg', 0.8);
        } catch (error) {
            console.error('Error capturing frame for AI analysis:', error);
        }
    }
    
    // Report functionality
    showReportModal() {
        if (!this.isConnected) {
            this.showNotification('No active chat to report', 'error');
            return;
        }
        document.getElementById('reportModal').style.display = 'block';
    }
    
    hideReportModal() {
        document.getElementById('reportModal').style.display = 'none';
        // Clear form
        const radioButtons = document.querySelectorAll('input[name="reportReason"]');
        radioButtons.forEach(radio => radio.checked = false);
        document.getElementById('reportDetails').value = '';
    }
    
    submitReport() {
        const selectedReason = document.querySelector('input[name="reportReason"]:checked');
        if (!selectedReason) {
            this.showNotification('Please select a reason for reporting', 'error');
            return;
        }
        
        const reason = selectedReason.value;
        const details = document.getElementById('reportDetails').value;
        
        this.socket.emit('report-user', {
            reportedUserId: this.partnerId,
            reason: reason,
            details: details,
            timestamp: Date.now()
        });
        
        this.hideReportModal();
        this.showNotification('Report submitted. Thank you for helping keep our community safe.', 'success');
    }
    
    // AI Moderation Event Handlers
    showBanNotification(data) {
        const message = `You have been banned for ${data.duration}. Reason: ${data.reason}`;
        this.showNotification(message, 'error', 10000);
    }
    
    showPartnerBannedNotification(data) {
        this.showNotification(data.message, 'info', 5000);
    }
    
    showViolationWarning(data) {
        this.showNotification(data.message, 'warning', 8000);
    }
    
    showContentWarning(data) {
        this.showNotification(data.message, 'warning', 5000);
    }
    
    showAnalysisNotification(data) {
        this.showNotification(data.message, 'info', 3000);
    }
    
    showReportSuccess(data) {
        this.showNotification(data.message, 'success', 5000);
    }
    
    showReportError(data) {
        this.showNotification(data.message, 'error', 5000);
    }
    
    // Enhanced notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
        }
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }
}

// Global functions for modal controls
function showWelcomeModal() {
    document.getElementById('welcomeModal').style.display = 'block';
}

function hideWelcomeModal() {
    document.getElementById('welcomeModal').style.display = 'none';
}

function showCategoryModal() {
    hideWelcomeModal();
    document.getElementById('categoryModal').style.display = 'block';
}

function hideCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

function showContactModal() {
    document.getElementById('contactModal').style.display = 'block';
}

function hideContactModal() {
    document.getElementById('contactModal').style.display = 'none';
}

function showDonationModal() {
    // Redirect to donation page or show donation modal
    window.open('https://www.paypal.com/donate/?hosted_button_id=9ANJ4LSGD8UYC', '_blank');
}

// Report functionality global functions
function reportUser() {
    if (window.videoChat) {
        window.videoChat.showReportModal();
    }
}

function hideReportModal() {
    if (window.videoChat) {
        window.videoChat.hideReportModal();
    }
}

function submitReport() {
    if (window.videoChat) {
        window.videoChat.submitReport();
    }
}

// Initialize the video chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing VideoChat application');
    window.videoChat = new VideoChat();
});