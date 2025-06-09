const express = require('express');
const serverless = require('serverless-http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const AIModeration = require('../../ai-moderation');

const app = express();

// Store connected users
const users = new Map();
const waitingUsers = new Set();

// Initialize AI Moderation Service
const aiModeration = new AIModeration();
aiModeration.initialize();

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// API routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/stats', (req, res) => {
    res.json({
        onlineUsers: users.size,
        waitingUsers: waitingUsers.size
    });
});

// Socket.IO will be handled separately in a different approach for Netlify
// Since Netlify doesn't support persistent WebSocket connections,
// we'll need to use a different real-time solution

module.exports.handler = serverless(app);