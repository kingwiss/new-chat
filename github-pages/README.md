# Cerebray - GitHub Pages Version

🌟 **Static Peer-to-Peer Video Chat Application**

This is a simplified version of Cerebray that works on GitHub Pages without requiring a Node.js server. It uses WebRTC for direct peer-to-peer connections.

## 🚀 Quick Start

### Option 1: Deploy to GitHub Pages

1. **Fork or create a new repository**
2. **Upload the `index.html` file** to your repository
3. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select source: "Deploy from a branch"
   - Choose branch: `main` (or `master`)
   - Choose folder: `/ (root)` or `/github-pages`
4. **Access your site** at `https://yourusername.github.io/repositoryname`

### Option 2: Run Locally

1. **Download the `index.html` file**
2. **Open it in a web browser**
3. **Allow camera/microphone permissions**

## 🎯 How to Connect with Someone

Since this version doesn't have a server for automatic matching, you need to manually exchange connection codes:

### Step-by-Step Connection Process:

1. **Both users open the application**
2. **Both users click "Start Camera"** and allow permissions
3. **User A creates an offer**:
   - Click "Create Offer"
   - Copy the generated offer code
   - Share it with User B (via text, email, etc.)
4. **User B accepts the offer**:
   - Paste User A's offer in the "Paste Partner's Offer" field
   - Click "Accept"
   - Copy the generated answer code
   - Share it with User A
5. **User A completes the connection**:
   - Paste User B's answer in the "Paste Partner's Answer" field
   - Click "Connect"
6. **Start chatting!** 🎉

## ✨ Features

- 📹 **Real-time video chat** with WebRTC
- 💬 **Text messaging** via data channels
- 📱 **Mobile responsive** design
- 🔒 **Peer-to-peer** - no data goes through servers
- 🌐 **Works on GitHub Pages** - completely static
- 🎨 **Beautiful UI** with modern design

## 🔧 Technical Details

- **Pure HTML/CSS/JavaScript** - no external dependencies
- **WebRTC** for peer-to-peer video/audio
- **RTCDataChannel** for text messaging
- **STUN servers** for NAT traversal
- **No backend required** - works entirely in the browser

## 🌐 Browser Compatibility

- ✅ Chrome 56+
- ✅ Firefox 51+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Privacy & Security

- **Direct peer-to-peer connections** - no data stored on servers
- **HTTPS required** for camera/microphone access
- **Local processing** - all video/audio stays between users
- **No tracking** - completely client-side application

## 🆚 Differences from Full Version

| Feature | GitHub Pages Version | Full Node.js Version |
|---------|---------------------|---------------------|
| Automatic matching | ❌ Manual codes | ✅ Automatic |
| User preferences | ❌ Not available | ✅ Gender/category |
| Online user count | ❌ Not available | ✅ Real-time count |
| Server requirements | ✅ None | ❌ Node.js server |
| Deployment | ✅ GitHub Pages | ❌ Heroku/Railway |
| Setup complexity | ✅ Very simple | ❌ More complex |

## 🚀 Upgrade to Full Version

For the complete experience with automatic user matching, deploy the full Node.js version:

- **Heroku**: [Deploy to Heroku](https://heroku.com)
- **Railway**: [Deploy to Railway](https://railway.app)
- **Render**: [Deploy to Render](https://render.com)
- **Vercel**: [Deploy to Vercel](https://vercel.com)

See the main `DEPLOYMENT.md` file for detailed instructions.

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Ensure you're using **HTTPS** (required for media access)
- Check browser permissions for camera/microphone
- Try refreshing the page and allowing permissions again

### Connection Not Establishing
- Make sure both users have completed all 4 steps
- Check that offer/answer codes are copied completely
- Try refreshing and starting over if connection fails
- Ensure both users are on stable internet connections

### Chat Not Working
- Chat only works after video connection is established
- Make sure the data channel is open (check browser console)

## 📝 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Contributions welcome! This is a simplified version, but improvements are always appreciated.

---

**Enjoy connecting with people around the world! 🌍**