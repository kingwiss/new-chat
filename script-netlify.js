// Modified script for Netlify deployment without Socket.IO
// Uses polling and REST API instead of WebSocket connections

class NetlifyVideoChat {
    constructor() {
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.startButton = document.getElementById('startButton');
        this.endButton = document.getElementById('endButton');
        this.nextButton = document.getElementById('nextButton');
        this.onlineCount = document.getElementById('onlineCount');
        this.statusDiv = document.getElementById('status');
        
        this.localStream = null;
        this.peerConnection = null;
        this.isConnected = false;
        this.userId = this.generateUserId();
        
        this.init();
    }
    
    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    init() {
        this.startButton.addEventListener('click', () => this.startChat());
        this.endButton.addEventListener('click', () => this.endChat());
        this.nextButton.addEventListener('click', () => this.findNewPartner());
        
        // Start polling for stats
        this.pollStats();
        
        this.updateStatus('Click "Start Chat" to begin');
    }
    
    async pollStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            this.onlineCount.textContent = data.onlineUsers || 0;
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
        
        // Poll every 5 seconds
        setTimeout(() => this.pollStats(), 5000);
    }
    
    async startChat() {
        try {
            this.updateStatus('Getting camera access...');
            
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            
            this.startButton.style.display = 'none';
            this.endButton.style.display = 'inline-block';
            this.nextButton.style.display = 'inline-block';
            
            this.updateStatus('Looking for a partner...');
            
            // For Netlify deployment, we'll use a simplified peer-to-peer connection
            // without Socket.IO signaling server
            this.showNetlifyMessage();
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.updateStatus('Error: Could not access camera. Please check permissions.');
        }
    }
    
    showNetlifyMessage() {
        this.updateStatus(`
            <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3>🚀 Netlify Deployment Notice</h3>
                <p><strong>This app is now configured for Netlify!</strong></p>
                <p>However, real-time video chat requires WebSocket connections which aren't fully supported on Netlify's serverless platform.</p>
                <p><strong>Recommended solutions:</strong></p>
                <ul>
                    <li>Use <strong>Vercel</strong> or <strong>Railway</strong> for full Socket.IO support</li>
                    <li>Integrate with <strong>Agora.io</strong> or <strong>Twilio Video</strong> for Netlify</li>
                    <li>Use <strong>WebRTC</strong> with a STUN/TURN server</li>
                </ul>
                <p>The static files are ready for Netlify deployment, but you'll need a real-time communication service for the video chat functionality.</p>
            </div>
        `);
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
        
        this.startButton.style.display = 'inline-block';
        this.endButton.style.display = 'none';
        this.nextButton.style.display = 'none';
        
        this.isConnected = false;
        this.updateStatus('Chat ended. Click "Start Chat" to begin again.');
    }
    
    findNewPartner() {
        this.updateStatus('Looking for a new partner...');
        // In a full implementation, this would disconnect from current partner
        // and search for a new one
        setTimeout(() => {
            this.showNetlifyMessage();
        }, 1000);
    }
    
    updateStatus(message) {
        this.statusDiv.innerHTML = message;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NetlifyVideoChat();
});

// Report functionality (simplified for Netlify)
function showReportModal() {
    document.getElementById('reportModal').style.display = 'block';
}

function hideReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

function submitReport() {
    const form = document.getElementById('reportForm');
    const formData = new FormData(form);
    
    // In a full implementation, this would send to a serverless function
    console.log('Report submitted:', Object.fromEntries(formData));
    
    alert('Thank you for your report. In a production environment, this would be processed by our moderation system.');
    hideReportModal();
    form.reset();
}

function openDonationLink() {
    window.open('https://www.paypal.com/donate', '_blank');
}