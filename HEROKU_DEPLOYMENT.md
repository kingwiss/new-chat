# Heroku Deployment Guide for Cerebray Video Chat

This guide will help you deploy your fully functional video chat application to Heroku with automatic matching capabilities.

## Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- Git installed
- Heroku account (free tier available)
- Your code pushed to GitHub

## Step-by-Step Deployment

### 1. Install Heroku CLI

Download and install from: https://devcenter.heroku.com/articles/heroku-cli

### 2. Login to Heroku

```bash
heroku login
```

This will open your browser for authentication.

### 3. Create Heroku Application

```bash
heroku create your-app-name
```

**Note:** Replace `your-app-name` with your desired app name. If you don't specify a name, Heroku will generate one.

### 4. Deploy Your Application

```bash
git push heroku main
```

Heroku will automatically:
- Detect it's a Node.js application
- Install dependencies from `package.json`
- Use the `Procfile` to start the server
- Assign a random port (handled by `process.env.PORT`)

### 5. Open Your Application

```bash
heroku open
```

Or visit: `https://your-app-name.herokuapp.com`

## Configuration Details

### Already Configured Files:

✅ **package.json** - Contains all dependencies and start script
✅ **Procfile** - Tells Heroku how to start the app (`web: node server.js`)
✅ **server.js** - Uses `process.env.PORT || 3000` for dynamic port assignment
✅ **Node.js version** - Specified in package.json engines

### Features Available After Deployment:

🎯 **Automatic User Matching** - Server-side matching algorithm
👥 **Real-time User Count** - See how many people are online
🔄 **Preference-based Matching** - Gender and category preferences
💬 **Real-time Chat** - Text messaging during video calls
📱 **Mobile Responsive** - Works on all devices
🔒 **HTTPS Enabled** - Heroku provides SSL certificates automatically

## Environment Variables (Optional)

You can set environment variables if needed:

```bash
heroku config:set NODE_ENV=production
```

## Monitoring Your App

### View Logs:
```bash
heroku logs --tail
```

### Check App Status:
```bash
heroku ps
```

### Restart App:
```bash
heroku restart
```

## Updating Your App

Whenever you make changes:

1. Commit changes locally:
   ```bash
   git add .
   git commit -m "Your update message"
   ```

2. Push to Heroku:
   ```bash
   git push heroku main
   ```

3. Push to GitHub (optional but recommended):
   ```bash
   git push origin main
   ```

## Troubleshooting

### Common Issues:

1. **App won't start:**
   ```bash
   heroku logs --tail
   ```
   Check for error messages in the logs.

2. **Port issues:**
   Ensure your server.js uses `process.env.PORT || 3000`

3. **Dependencies missing:**
   Make sure all dependencies are in `package.json`, not `devDependencies`

4. **Camera/Microphone not working:**
   - Heroku automatically provides HTTPS, which is required for WebRTC
   - Users need to allow camera/microphone permissions

### Performance Tips:

- **Free tier limitations:** App sleeps after 30 minutes of inactivity
- **Upgrade to Hobby tier** ($7/month) for always-on functionality
- **Add Redis** for session storage if you get high traffic

## Cost Information

- **Free Tier:** 550-1000 dyno hours per month (enough for testing)
- **Hobby Tier:** $7/month for always-on apps
- **Production Tier:** $25+/month for high-traffic apps

## Security Considerations

✅ **HTTPS Enabled** - Automatic SSL certificates
✅ **No API Keys** - App doesn't require external API keys
✅ **WebRTC Security** - Peer-to-peer connections are encrypted
✅ **No Data Storage** - No personal data is stored on servers

## Next Steps After Deployment

1. **Test all features:**
   - Video chat functionality
   - Text messaging
   - User matching
   - Mobile responsiveness

2. **Share your app:**
   - Your app will be available at `https://your-app-name.herokuapp.com`
   - Share the URL with friends to test

3. **Monitor usage:**
   - Check Heroku dashboard for metrics
   - Monitor logs for any issues

4. **Consider upgrades:**
   - Upgrade to Hobby tier for better performance
   - Add custom domain if desired

## Support

If you encounter issues:
- Check Heroku logs: `heroku logs --tail`
- Visit Heroku Dev Center: https://devcenter.heroku.com/
- Check the main DEPLOYMENT.md for alternative platforms

---

**Your app is now ready for production with full automatic matching capabilities!** 🚀