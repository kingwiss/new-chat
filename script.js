class VideoChat {
    constructor() {
        this.socket = null;
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.isConnected = false;
        this.isSearching = false;
        
        // Check browser compatibility
        this.checkBrowserCompatibility();
        
        // Initialize DOM elements with error checking
        this.initializeDOMElements();
        
        // Initialize event listeners and socket connection
        if (this.elementsLoaded && this.isCompatible) {
            this.initializeEventListeners();
            this.connectSocket();
        } else if (!this.elementsLoaded) {
            console.error('Failed to initialize DOM elements. Video chat functionality will not work.');
            // Add a visible error message for the user
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Failed to initialize video chat components. Please refresh the page and try again.';
            document.querySelector('.main-content').prepend(errorDiv);
        }
    }
    
    checkBrowserCompatibility() {
        this.isCompatible = true;
        let errorMessage = '';
        
        // Check for WebRTC support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.isCompatible = false;
            errorMessage = 'Your browser does not support video chat functionality. Please use a modern browser like Chrome, Firefox, or Edge.';
            console.error('getUserMedia not supported');
        }
        
        // Check for RTCPeerConnection support
        if (!window.RTCPeerConnection) {
            this.isCompatible = false;
            errorMessage = 'Your browser does not support WebRTC. Please use a modern browser like Chrome, Firefox, or Edge.';
            console.error('RTCPeerConnection not supported');
        }
        
        // Display error message if browser is not compatible
        if (!this.isCompatible) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            
            // Wait for DOM to be ready
            document.addEventListener('DOMContentLoaded', () => {
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.prepend(errorDiv);
                } else {
                    document.body.prepend(errorDiv);
                }
            });
        }
    }
    
    initializeDOMElements() {
        try {
            this.localVideo = document.getElementById('localVideo');
            this.remoteVideo = document.getElementById('remoteVideo');
            this.startBtn = document.getElementById('startBtn');
            this.nextBtn = document.getElementById('nextBtn');
            this.endBtn = document.getElementById('endBtn');
            this.statusMessage = document.getElementById('statusMessage') || document.querySelector('.chat-info');
            this.onlineCount = document.getElementById('onlineCount');
            this.waitingMessage = document.getElementById('waitingMessage');
            this.chatMessages = document.getElementById('chatMessages');
            this.chatInput = document.getElementById('chatInput');
            this.sendBtn = document.getElementById('sendBtn');
            
            // Check if all required elements are loaded
            this.elementsLoaded = !!(this.localVideo && this.remoteVideo && 
                                   this.startBtn && this.nextBtn && this.endBtn && 
                                   this.waitingMessage && this.chatMessages && 
                                   this.chatInput && this.sendBtn);
            
            if (!this.elementsLoaded) {
                console.error('Missing required DOM elements:', {
                    localVideo: !!this.localVideo,
                    remoteVideo: !!this.remoteVideo,
                    startBtn: !!this.startBtn,
                    nextBtn: !!this.nextBtn,
                    endBtn: !!this.endBtn,
                    statusMessage: !!this.statusMessage,
                    waitingMessage: !!this.waitingMessage,
                    chatMessages: !!this.chatMessages,
                    chatInput: !!this.chatInput,
                    sendBtn: !!this.sendBtn
                });
            } else {
                console.log('All DOM elements loaded successfully');
            }
        } catch (error) {
            console.error('Error initializing DOM elements:', error);
            this.elementsLoaded = false;
        }
    }
    
    updateStatusMessage(message, type = 'info') {
        if (this.statusMessage) {
            this.statusMessage.textContent = message;
            
            // Remove existing status classes
            this.statusMessage.classList.remove('error', 'success', 'info');
            
            // Add new status class
            if (type === 'error') {
                this.statusMessage.classList.add('error');
            } else if (type === 'success') {
                this.statusMessage.classList.add('success');
            }
            
            console.log(`Status: ${type} - ${message}`);
        } else {
            console.log(`Status message element not found. ${type}: ${message}`);
        }
    }
    
    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.showCategoryModal());
        this.nextBtn.addEventListener('click', () => this.nextUser());
        this.endBtn.addEventListener('click', () => this.endChat());
        
        // Chat event listeners
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Contact modal event listeners
        this.initializeContactModal();
        
        // Category modal event listeners
        this.initializeCategoryModal();
        
        // Welcome modal event listeners
        this.initializeWelcomeModal();
    }
    
    initializeContactModal() {
        const contactBtn = document.getElementById('contactBtn');
        const contactModal = document.getElementById('contactModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const contactForm = document.getElementById('contactForm');
        
        // Open modal
        contactBtn.addEventListener('click', () => {
            contactModal.classList.add('show');
            contactModal.style.display = 'flex';
        });
        
        // Close modal functions
        const closeModalFunc = () => {
            // Reset modal view to show form
            const contactForm = document.getElementById('contactForm');
            const thankYouMessage = document.getElementById('thankYouMessage');
            
            contactForm.style.display = 'block';
            thankYouMessage.style.display = 'none';
            
            contactModal.classList.remove('show');
            setTimeout(() => {
                contactModal.style.display = 'none';
            }, 300);
        };
        
        closeModal.addEventListener('click', closeModalFunc);
        cancelBtn.addEventListener('click', closeModalFunc);
        
        // Handle thank you close button
        const closeThankYou = document.getElementById('closeThankYou');
        closeThankYou.addEventListener('click', closeModalFunc);
        
        // Close modal when clicking outside
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                closeModalFunc();
            }
        });
        
        // Handle form submission
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Always prevent default form submission
            // Validate and handle submission
            const isValid = this.handleContactFormSubmission();
            if (isValid) {
                // Submit form data via fetch to avoid redirect
                this.submitContactForm();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && contactModal.classList.contains('show')) {
                closeModalFunc();
            }
        });
    }
    
    handleContactFormSubmission() {
        // Validate form fields
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const message = document.getElementById('contactMessage').value;
        
        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return false;
        }
        
        return true;
    }
    
    async submitContactForm() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        
        try {
            // Submit to FormSubmit.co via fetch
            const response = await fetch('https://formsubmit.co/fredwisseh@gmail.com', {
                method: 'POST',
                body: formData
            });
            
            // Show thank you message regardless of response
            this.showThankYouMessage();
            
        } catch (error) {
            console.error('Form submission error:', error);
            // Still show thank you message to user
            this.showThankYouMessage();
        }
    }
    
    showThankYouMessage() {
        const contactForm = document.getElementById('contactForm');
        const thankYouMessage = document.getElementById('thankYouMessage');
        
        // Hide the form and show thank you message
        contactForm.style.display = 'none';
        thankYouMessage.style.display = 'block';
        
        // Reset form for next use
        contactForm.reset();
        
        // Add event listener for close button
        const closeThankYouBtn = document.getElementById('closeThankYou');
        closeThankYouBtn.addEventListener('click', () => {
            thankYouMessage.style.display = 'none';
            contactForm.style.display = 'block';
            const contactModal = document.getElementById('contactModal');
            contactModal.classList.remove('show');
        });
    }
    
    initializeCategoryModal() {
        const categoryModal = document.getElementById('categoryModal');
        const categoryForm = document.getElementById('categoryForm');
        
        // Handle form submission
        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Category form submitted');
            const success = this.handleCategoryFormSubmission();
            if (!success) {
                console.log('Form submission failed validation');
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && categoryModal.classList.contains('show')) {
                this.closeCategoryModal();
            }
        });
    }
    
    initializeWelcomeModal() {
        const welcomeModal = document.getElementById('welcomeModal');
        const closeWelcome = document.getElementById('closeWelcome');
        
        // Close welcome modal
        const closeWelcomeFunc = () => {
            welcomeModal.classList.remove('show');
            setTimeout(() => {
                welcomeModal.style.display = 'none';
            }, 300);
        };
        
        closeWelcome.addEventListener('click', closeWelcomeFunc);
        
        // Close modal when clicking outside
        welcomeModal.addEventListener('click', (e) => {
            if (e.target === welcomeModal) {
                closeWelcomeFunc();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && welcomeModal.classList.contains('show')) {
                closeWelcomeFunc();
            }
        });
    }
    
    showCategoryModal() {
        const categoryModal = document.getElementById('categoryModal');
        categoryModal.classList.add('show');
        categoryModal.style.display = 'flex';
    }
    
    closeCategoryModal() {
        const categoryModal = document.getElementById('categoryModal');
        categoryModal.classList.remove('show');
        setTimeout(() => {
            categoryModal.style.display = 'none';
        }, 300);
    }
    
    handleCategoryFormSubmission() {
        console.log('Form submission started');
        
        const category = document.getElementById('categorySelect').value;
        const userGender = document.getElementById('userGender').value;
        const preferredGender = document.getElementById('preferredGender').value;
        const preferredCategory = document.getElementById('preferredCategory').value;
        
        console.log('Form values:', { category, userGender, preferredGender, preferredCategory });
        
        // Validate all fields are selected
        if (!category || !userGender || !preferredGender || !preferredCategory) {
            alert('Please fill in all fields before continuing.');
            console.log('Validation failed - missing fields');
            return false;
        }
        
        // Handle "same" category preference
        let finalPreferredCategory = preferredCategory;
        if (preferredCategory === 'same') {
            finalPreferredCategory = category;
        }
        
        // Store user preferences (you can send these to server later)
        this.userPreferences = {
            category,
            userGender,
            preferredGender,
            preferredCategory: finalPreferredCategory
        };
        
        console.log('User preferences set:', this.userPreferences);
        
        // Close modal and start video chat
        this.closeCategoryModal();
        console.log('Starting video chat...');
        this.startVideoChat();
        
        return true;
    }
    
    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });
        
        this.socket.on('online-count', (count) => {
            this.onlineCount.textContent = `Online users: ${count}`;
        });
        
        this.socket.on('user-connected', (data) => {
            console.log('User connected:', data);
            this.handleUserConnected(data);
        });
        
        this.socket.on('user-disconnected', () => {
            console.log('User disconnected');
            this.handleUserDisconnected();
        });
        
        this.socket.on('offer', (offer) => {
            console.log('Received offer');
            this.handleOffer(offer);
        });
        
        this.socket.on('answer', (answer) => {
            console.log('Received answer');
            this.handleAnswer(answer);
        });
        
        this.socket.on('ice-candidate', (candidate) => {
            console.log('Received ICE candidate');
            this.handleIceCandidate(candidate);
        });
        
        this.socket.on('searching', () => {
            this.showSearching();
        });
        
        this.socket.on('no-users', () => {
            this.showWaiting();
        });
        
        this.socket.on('chat-message', (data) => {
            this.displayMessage(data.message, false);
        });
    }
    
    async startVideoChat() {
        console.log('startVideoChat called');
        
        try {
            console.log('Requesting camera access...');
            this.updateStatusMessage('Accessing camera...', 'info');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser');
            }
            
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 640 }, 
                    facingMode: 'user' 
                },
                audio: true
            });
            
            console.log('Camera access granted, setting up video...');
            this.localVideo.srcObject = this.localStream;
            
            // Wait for video to load
            await new Promise((resolve) => {
                this.localVideo.onloadedmetadata = () => {
                    this.localVideo.play();
                    resolve();
                };
            });
            
            console.log('Video setup complete');
            
            this.startBtn.disabled = true;
            this.nextBtn.disabled = false;
            this.endBtn.disabled = false;
            
            this.updateStatusMessage('Looking for someone to chat with...', 'success');
             this.showWaiting();
            
            // Send user preferences with find-user request
            console.log('Emitting find-user event with preferences:', this.userPreferences);
            this.socket.emit('find-user', this.userPreferences);
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            
            let errorMessage = 'Error accessing camera. ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera access and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found. Please connect a camera and try again.';
            } else if (error.name === 'NotReadableError') {
                errorMessage += 'Camera is already in use by another application.';
            } else {
                errorMessage += error.message || 'Please check your camera settings and try again.';
            }
            
            this.updateStatusMessage(errorMessage, 'error');
             
             // Re-enable start button so user can try again
             this.startBtn.disabled = false;
        }
    }
    
    async nextUser() {
        if (this.isSearching) return;
        
        this.isSearching = true;
        this.nextBtn.disabled = true;
        
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        this.remoteVideo.srcObject = null;
        this.isConnected = false;
        this.disableChat();
        this.clearChat();
        
        this.statusMessage.textContent = 'Looking for next person...';
        this.showWaiting();
        
        this.socket.emit('find-user', this.userPreferences);
        
        setTimeout(() => {
            this.nextBtn.disabled = false;
            this.isSearching = false;
        }, 2000);
    }
    
    endChat() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        
        this.startBtn.disabled = false;
        this.nextBtn.disabled = true;
        this.endBtn.disabled = true;
        
        this.isConnected = false;
        this.isSearching = false;
        this.disableChat();
        this.clearChat();
        
        this.statusMessage.textContent = 'Click "Start Video Chat" to begin';
        this.hideWaiting();
        
        this.socket.emit('disconnect-user');
    }
    
    async handleUserConnected(data) {
        console.log('Creating peer connection');
        await this.createPeerConnection();
        
        if (data.shouldCreateOffer) {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.socket.emit('offer', offer);
        }
    }
    
    handleUserDisconnected() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        this.remoteVideo.srcObject = null;
        this.isConnected = false;
        this.disableChat();
        this.clearChat();
        
        if (this.localStream) {
            this.statusMessage.textContent = 'User disconnected. Looking for someone new...';
            this.showWaiting();
            this.socket.emit('find-user', this.userPreferences);
        }
    }
    
    async handleOffer(offer) {
        if (!this.peerConnection) {
            await this.createPeerConnection();
        }
        
        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.socket.emit('answer', answer);
    }
    
    async handleAnswer(answer) {
        await this.peerConnection.setRemoteDescription(answer);
    }
    
    async handleIceCandidate(candidate) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(candidate);
        }
    }
    
    async createPeerConnection() {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.peerConnection = new RTCPeerConnection(configuration);
        
        // Add local stream to peer connection
        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });
        
        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            console.log('Received remote stream');
            this.remoteVideo.srcObject = event.streams[0];
            this.isConnected = true;
            this.statusMessage.textContent = 'Connected! Enjoy your chat.';
            this.hideWaiting();
            this.enableChat();
        };
        
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', event.candidate);
            }
        };
        
        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'disconnected' || 
                this.peerConnection.connectionState === 'failed') {
                this.handleUserDisconnected();
            }
        };
    }
    
    showWaiting() {
        this.waitingMessage.style.display = 'block';
        this.remoteVideo.parentElement.classList.add('connecting');
    }
    
    hideWaiting() {
        this.waitingMessage.style.display = 'none';
        this.remoteVideo.parentElement.classList.remove('connecting');
    }
    
    showSearching() {
        this.statusMessage.textContent = 'Searching for users...';
        this.showWaiting();
    }
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (message && this.isConnected) {
            this.socket.emit('chat-message', { message });
            this.displayMessage(message, true);
            this.chatInput.value = '';
        }
    }
    
    displayMessage(message, isOwn) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
        
        const senderSpan = document.createElement('span');
        senderSpan.className = 'message-sender';
        senderSpan.textContent = isOwn ? 'You:' : 'Stranger:';
        
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(document.createTextNode(message));
        
        // Remove info message if it exists
        const infoMessage = this.chatMessages.querySelector('.chat-info');
        if (infoMessage) {
            infoMessage.remove();
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    enableChat() {
        this.chatInput.disabled = false;
        this.sendBtn.disabled = false;
        this.chatInput.placeholder = 'Type a message...';
    }
    
    disableChat() {
        this.chatInput.disabled = true;
        this.sendBtn.disabled = true;
        this.chatInput.placeholder = 'Connect to start chatting...';
        this.chatInput.value = '';
    }
    
    clearChat() {
        this.chatMessages.innerHTML = '<div class="chat-info">Start chatting with your partner!</div>';
    }
}

// Initialize the video chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VideoChat();
});