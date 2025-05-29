# Deployment Guide

This guide covers how to deploy the Random Video Chat application to various platforms.

## Prerequisites

- Node.js 14+ installed
- Git installed
- GitHub account
- Deployment platform account (Heroku, Railway, Render, etc.)

## GitHub Repository Setup

1. **Initialize Git Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Random Video Chat Application"
   ```

2. **Create GitHub Repository:**
   - Go to GitHub and create a new repository
   - Name it something like "random-video-chat" or "peer-to-peer-video-chat"
   - Don't initialize with README (we already have one)

3. **Connect Local Repository to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Deployment Options

### Option 1: Heroku Deployment

1. **Install Heroku CLI** (if not already installed)

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create Heroku App:**
   ```bash
   heroku create your-app-name
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

5. **Open App:**
   ```bash
   heroku open
   ```

### Option 2: Railway Deployment

1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub account
3. Select your repository
4. Railway will automatically detect it's a Node.js app
5. Deploy automatically

### Option 3: Render Deployment

1. Go to [Render.com](https://render.com)
2. Connect your GitHub account
3. Create a new Web Service
4. Select your repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Deploy

### Option 4: Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

## Environment Variables

For production deployment, you may want to set:

- `PORT` - Server port (automatically set by most platforms)
- `NODE_ENV=production` - Production environment

## HTTPS Requirements

**Important:** WebRTC requires HTTPS in production. All major deployment platforms (Heroku, Railway, Render, Vercel) provide HTTPS by default.

## Post-Deployment Checklist

- ✅ App loads without errors
- ✅ Video chat functionality works
- ✅ Text messaging works
- ✅ User matching system functions
- ✅ Mobile responsiveness
- ✅ HTTPS is enabled
- ✅ Camera/microphone permissions work

## Troubleshooting

### Common Issues:

1. **Camera/Microphone not working:**
   - Ensure HTTPS is enabled
   - Check browser permissions

2. **Connection issues:**
   - Verify WebRTC is supported
   - Check firewall settings

3. **Build failures:**
   - Ensure Node.js version compatibility
   - Check package.json dependencies

## Monitoring

Consider adding:
- Error logging (e.g., Sentry)
- Analytics (e.g., Google Analytics)
- Uptime monitoring (e.g., UptimeRobot)

## Scaling Considerations

For high traffic:
- Use Redis for session storage
- Implement load balancing
- Add TURN servers for better connectivity
- Consider CDN for static assets