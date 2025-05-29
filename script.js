class VideoChat {
    constructor() {
        this.socket = null;
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.isConnected = false;
        this.isSearching = false;
        
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.startBtn = document.getElementById('startBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.endBtn = document.getElementById('endBtn');
        this.statusMessage = document.getElementById('statusMessage');
        this.onlineCount = document.getElementById('onlineCount');
        this.waitingMessage = document.getElementById('waitingMessage');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        
        this.initializeEventListeners();
        this.connectSocket();
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
            // Validate and prepare for submission
            const isValid = this.handleContactFormSubmission();
            if (!isValid) {
                e.preventDefault();
            }
            // If valid, allow natural form submission to FormSubmit.co
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
        
        // Hide the form and show thank you message
        const contactForm = document.getElementById('contactForm');
        const thankYouMessage = document.getElementById('thankYouMessage');
        
        contactForm.style.display = 'none';
        thankYouMessage.style.display = 'block';
        
        // Reset form for next use
        contactForm.reset();
        
        // Allow form to submit naturally to FormSubmit.co
        return true;
    }
    
    initializeCategoryModal() {
        const categoryModal = document.getElementById('categoryModal');
        const categoryForm = document.getElementById('categoryForm');
        
        // Handle form submission
        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategoryFormSubmission();
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && categoryModal.classList.contains('show')) {
                this.closeCategoryModal();
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
        const category = document.getElementById('categorySelect').value;
        const userGender = document.getElementById('userGender').value;
        const preferredGender = document.getElementById('preferredGender').value;
        const preferredCategory = document.getElementById('preferredCategory').value;
        
        // Validate all fields are selected
        if (!category || !userGender || !preferredGender || !preferredCategory) {
            alert('Please fill in all fields before continuing.');
            return;
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
        
        console.log('User preferences:', this.userPreferences);
        
        // Close modal and start video chat
        this.closeCategoryModal();
        this.startVideoChat();
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
        try {
            this.statusMessage.textContent = 'Accessing camera...';
            
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 640, facingMode: 'user' },
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            
            this.startBtn.disabled = true;
            this.nextBtn.disabled = false;
            this.endBtn.disabled = false;
            
            this.statusMessage.textContent = 'Looking for someone to chat with...';
            this.showWaiting();
            
            // Send user preferences with find-user request
            this.socket.emit('find-user', this.userPreferences);
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            this.statusMessage.textContent = 'Error accessing camera. Please allow camera access and try again.';
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