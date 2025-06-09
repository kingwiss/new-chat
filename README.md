# Cerebray Video Chat - AI-Powered Security

A modern video chat application with advanced AI-based content moderation and security features.

## 🚀 Features

### Core Features
- **Random Video Chat**: Connect with strangers worldwide
- **Real-time Messaging**: Text chat alongside video
- **Gender & Category Preferences**: Filter connections based on preferences
- **Responsive Design**: Works on desktop and mobile devices

### 🛡️ AI Security Features
- **Real-time Content Moderation**: AI analyzes video frames for inappropriate content
- **Smart Report System**: Users can report inappropriate behavior
- **Automated Banning**: AI determines ban duration based on violation severity
- **IP-based Bans**: Prevents banned users from creating new connections
- **Multi-level Warnings**: Progressive enforcement system

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Sightengine API account (for AI moderation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cerebray-video-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your Sightengine API credentials:
   ```env
   SIGHTENGINE_USER=your_sightengine_user_id
   SIGHTENGINE_SECRET=your_sightengine_api_secret
   PORT=3000
   ```

4. **Get Sightengine API Credentials**
   - Visit [Sightengine.com](https://sightengine.com/)
   - Sign up for a free account (2,000 API calls/month)
   - Navigate to your dashboard
   - Copy your API User ID and API Secret
   - Add them to your `.env` file

5. **Start the application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open your browser and go to `http://localhost:3000`

## 🤖 AI Moderation System

### How It Works

1. **Real-time Analysis**: Every 10 seconds, the system captures video frames and sends them to Sightengine AI for analysis

2. **Content Detection**: The AI detects:
   - Nudity and sexual content
   - Violence and weapons
   - Offensive gestures
   - Gore and disturbing content
   - Inappropriate behavior

3. **Smart Reporting**: Users can report inappropriate behavior with specific categories:
   - Inappropriate sexual behavior
   - Nudity or explicit content
   - Harassment or bullying
   - Hate speech
   - Violence or threats
   - Spam or unwanted content

4. **Automated Actions**: Based on AI confidence and report history:
   - **Warning**: Low-level violations get warnings
   - **Temporary Ban**: Medium violations get 1-3 day bans
   - **Week Ban**: High-confidence violations get 7-day bans
   - **Immediate Disconnect**: Critical violations disconnect immediately

### Report System Features

- **Report Button**: Appears during active chats (red warning icon)
- **Cooldown Protection**: Prevents spam reporting (1-minute cooldown)
- **AI Trigger**: Multiple reports automatically trigger AI analysis
- **Real-time Feedback**: Users get immediate confirmation of report submission

### Ban System

- **IP-based Banning**: Prevents circumvention by creating new sessions
- **Progressive Enforcement**: Repeat offenders get longer bans
- **Automatic Unbanning**: Bans expire automatically
- **Appeal Process**: Contact system for wrongful ban appeals

## 🎯 Usage

### For Users

1. **Starting a Chat**
   - Click "Start Chat" to begin
   - Allow camera and microphone permissions
   - Set your preferences (optional)
   - Wait for a connection

2. **During a Chat**
   - Video and text chat are available
   - Use "Next" to find a new partner
   - Use "End Chat" to stop chatting
   - **Report inappropriate behavior** using the red report button

3. **Reporting Users**
   - Click the red report button (⚠️) in the bottom-left corner
   - Select the reason for reporting
   - Add additional details (optional)
   - Submit the report
   - AI analysis will be triggered for serious reports

## 🔒 Security Features

- **Real-time AI Monitoring**: Continuous content analysis
- **Progressive Enforcement**: Escalating consequences for violations
- **IP-based Banning**: Prevents ban circumvention
- **Report Cooldowns**: Prevents abuse of reporting system
- **Encrypted Connections**: All communications are encrypted
- **No Data Storage**: No personal data or chat logs are stored

## 🚨 Moderation Policies

### Prohibited Content
- Nudity or sexual content
- Violence or threats
- Harassment or bullying
- Hate speech or discrimination
- Illegal activities
- Spam or unwanted solicitation

### Enforcement Actions
1. **First Warning**: Educational message
2. **Temporary Ban**: 1-3 days depending on severity
3. **Extended Ban**: 7 days for serious violations
4. **Permanent Ban**: For repeated serious violations

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript, WebRTC
- **AI Moderation**: Sightengine API
- **Security**: IP-based banning, Real-time monitoring
- **Dependencies**: form-data, node-fetch, dotenv

## 📄 License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.