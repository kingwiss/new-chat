# Random Video Chat

A modern, responsive random video chat application similar to Omegle or ChatAlternative. Connect with random people around the world through video chat!

## Features

- 🎥 **Real-time Video Chat** - High-quality video communication using WebRTC
- 🔀 **Random Matching** - Get connected with random users instantly
- 📱 **Responsive Design** - Works perfectly on all screen sizes
- 🎨 **Modern UI** - Clean, appealing interface with smooth animations
- ⚡ **Fast Switching** - Quickly move to the next person with one click
- 🔒 **Secure** - No data storage, completely anonymous

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- A modern web browser with WebRTC support
- Webcam and microphone

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## How to Use

1. **Start Video Chat** - Click the "Start Video Chat" button and allow camera/microphone access
2. **Wait for Connection** - The app will automatically find and connect you with another user
3. **Chat** - Enjoy your video conversation!
4. **Next User** - Click "Next" to disconnect and find a new person
5. **End Chat** - Click "End Chat" to stop the video chat completely

## Technical Details

### Frontend
- **HTML5** - Semantic markup with video elements
- **CSS3** - Modern styling with flexbox, gradients, and animations
- **JavaScript (ES6+)** - WebRTC implementation with Socket.io client

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time communication for signaling

### Key Features Implementation

- **Perfect Square Videos** - CSS ensures video containers maintain square aspect ratio on all screen sizes
- **Persistent UI Elements** - All buttons remain visible and functional at all times
- **Responsive Design** - Adapts to mobile, tablet, and desktop screens
- **WebRTC Signaling** - Handles offer/answer exchange and ICE candidates
- **User Matching** - Efficient algorithm to pair waiting users

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security Notes

- All video/audio data is transmitted directly between users (peer-to-peer)
- No video or audio data is stored on the server
- Users are completely anonymous
- HTTPS is recommended for production deployment

## Deployment

For production deployment:

1. Set the `PORT` environment variable
2. Use a process manager like PM2
3. Configure HTTPS with SSL certificates
4. Consider using TURN servers for better connectivity

## Troubleshooting

**Camera/Microphone Access Issues:**
- Ensure you're using HTTPS (required for WebRTC in production)
- Check browser permissions for camera and microphone
- Try refreshing the page and allowing access again

**Connection Issues:**
- Check your internet connection
- Disable VPN if experiencing connectivity problems
- Try using a different browser

**No Users Found:**
- The app requires at least 2 users to be online simultaneously
- Try again later when more users are online

## License

MIT License - feel free to use this project for learning or building your own video chat application!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.