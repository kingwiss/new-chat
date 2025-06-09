// AI Content Moderation System for Video Chat Application
// Integrates with Sightengine API for real-time video content analysis

const fetch = require('node-fetch');
const FormData = require('form-data');

class AIModeration {
    constructor() {
        // Sightengine API configuration
        this.apiUser = process.env.SIGHTENGINE_USER || 'your_sightengine_user';
        this.apiSecret = process.env.SIGHTENGINE_SECRET || 'your_sightengine_secret';
        this.baseUrl = 'https://api.sightengine.com/1.0';
        
        // Moderation thresholds
        this.thresholds = {
            nudity: 0.5,
            violence: 0.6,
            inappropriate: 0.7,
            offensive: 0.7,
            gore: 0.6
        };
        
        // User violation tracking
        this.userViolations = new Map();
        this.bannedIPs = new Set();
        this.reportedUsers = new Map();
        
        // Report tracking
        this.pendingReports = new Map();
        this.reportCooldown = new Map(); // Prevent spam reporting
        this.activeAnalysis = new Map(); // Track ongoing analyses
    }
    
    // Initialize moderation service
    async initialize() {
        console.log('AI Moderation Service initialized');
        return true;
    }
    
    // Analyze video frame for inappropriate content
    async analyzeVideoFrame(imageBuffer, userId) {
        try {
            const FormData = require('form-data');
            const form = new FormData();
            
            form.append('media', imageBuffer, { filename: 'frame.jpg' });
            form.append('models', 'nudity-2.0,wad,offensive,scam,gore,qr-content');
            form.append('api_user', this.apiUser);
            form.append('api_secret', this.apiSecret);

            const response = await fetch(`${this.baseUrl}/check.json`, {
                method: 'POST',
                body: form
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                return this.processAnalysisResult(result, userId);
            } else {
                console.error('Sightengine API error:', result);
                return { safe: true, confidence: 0, reason: 'API_ERROR' };
            }
        } catch (error) {
            console.error('Error analyzing video frame:', error);
            return { safe: true, confidence: 0, reason: 'ANALYSIS_ERROR' };
        }
    }
    
    // Prepare image data for API call
    prepareImageData(frameData) {
        // Convert canvas/video frame to base64 image
        if (typeof frameData === 'string') {
            return frameData;
        }
        
        // If it's a canvas or video element, extract image data
        if (frameData instanceof HTMLCanvasElement) {
            return frameData.toDataURL('image/jpeg', 0.8).split(',')[1];
        }
        
        return frameData;
    }
    
    // Call WebPurify API for content analysis
    async callWebPurifyAPI(imageData) {
        const formData = new FormData();
        formData.append('api_key', this.apiKey);
        formData.append('method', 'webpurify.live.imgcheck');
        formData.append('format', 'json');
        formData.append('imgdata', imageData);
        
        // Add specific detection categories
        formData.append('customimgid', Date.now().toString());
        formData.append('categories', 'nudity,violence,hate,weapons,drugs');
        
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`WebPurify API error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    // Process API analysis results
    processAnalysisResults(analysis, userId) {
        const violations = [];
        
        if (analysis.rsp && analysis.rsp.imgid) {
            const result = analysis.rsp;
            
            // Check for nudity
            if (result.nudity && parseFloat(result.nudity) > this.thresholds.nudity) {
                violations.push({
                    type: 'nudity',
                    confidence: parseFloat(result.nudity),
                    severity: 'high'
                });
            }
            
            // Check for violence
            if (result.violence && parseFloat(result.violence) > this.thresholds.violence) {
                violations.push({
                    type: 'violence',
                    confidence: parseFloat(result.violence),
                    severity: 'high'
                });
            }
            
            // Check for hate symbols
            if (result.hate && parseFloat(result.hate) > this.thresholds.hate) {
                violations.push({
                    type: 'hate',
                    confidence: parseFloat(result.hate),
                    severity: 'critical'
                });
            }
            
            // Check for weapons
            if (result.weapons && parseFloat(result.weapons) > this.thresholds.inappropriate) {
                violations.push({
                    type: 'weapons',
                    confidence: parseFloat(result.weapons),
                    severity: 'high'
                });
            }
            
            // Check for drugs
            if (result.drugs && parseFloat(result.drugs) > this.thresholds.inappropriate) {
                violations.push({
                    type: 'drugs',
                    confidence: parseFloat(result.drugs),
                    severity: 'medium'
                });
            }
        }
        
        return violations;
    }
    
    // Handle detected violations
    async handleViolations(userId, violations) {
        // Track user violations
        if (!this.userViolations.has(userId)) {
            this.userViolations.set(userId, []);
        }
        
        const userHistory = this.userViolations.get(userId);
        userHistory.push({
            timestamp: Date.now(),
            violations: violations
        });
        
        // Log violation
        console.log(`Violation detected for user ${userId}:`, violations);
        
        // Determine if user should be banned
        const shouldBan = this.shouldBanUser(userId, violations);
        if (shouldBan) {
            await this.banUser(userId, 'Automatic ban due to inappropriate content');
        }
    }
    
    // Determine action based on violations
    determineAction(userId, violations) {
        const criticalViolations = violations.filter(v => v.severity === 'critical');
        const highViolations = violations.filter(v => v.severity === 'high');
        
        if (criticalViolations.length > 0) {
            return 'immediate_ban';
        }
        
        if (highViolations.length > 0) {
            const userHistory = this.userViolations.get(userId) || [];
            const recentViolations = userHistory.filter(v => 
                Date.now() - v.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
            );
            
            if (recentViolations.length >= 2) {
                return 'temporary_ban';
            }
            
            return 'warning';
        }
        
        return 'continue';
    }
    
    // Check if user should be banned
    shouldBanUser(userId, violations) {
        const criticalViolations = violations.filter(v => v.severity === 'critical');
        if (criticalViolations.length > 0) {
            return true;
        }
        
        const userHistory = this.userViolations.get(userId) || [];
        const recentHighViolations = userHistory.filter(v => {
            const hasHighSeverity = v.violations.some(violation => violation.severity === 'high');
            const isRecent = Date.now() - v.timestamp < 24 * 60 * 60 * 1000; // Last 24 hours
            return hasHighSeverity && isRecent;
        });
        
        return recentHighViolations.length >= 3;
    }
    
    // Ban user by IP address
    async banUser(userId, reason) {
        this.bannedUsers.add(userId);
        
        const banDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
        const banExpiry = Date.now() + banDuration;
        
        // Store ban information
        const banInfo = {
            userId: userId,
            reason: reason,
            timestamp: Date.now(),
            expiry: banExpiry,
            violations: this.userViolations.get(userId) || []
        };
        
        // In a real implementation, store this in a database
        console.log(`User ${userId} banned:`, banInfo);
        
        return banInfo;
    }
    
    // Handle user report
    async handleUserReport(reporterId, reportedUserId, reason) {
        // Check report cooldown to prevent spam
        const cooldownKey = `${reporterId}-${reportedUserId}`;
        const lastReport = this.reportCooldown.get(cooldownKey);
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
        
        if (lastReport && Date.now() - lastReport < cooldownPeriod) {
            return {
                success: false,
                message: 'Please wait before reporting the same user again'
            };
        }
        
        // Record the report
        this.reportCooldown.set(cooldownKey, Date.now());
        
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const report = {
            id: reportId,
            reporterId: reporterId,
            reportedUserId: reportedUserId,
            reason: reason,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        this.pendingReports.set(reportId, report);
        
        console.log(`User report filed:`, report);
        
        // Trigger AI analysis of the reported user's recent activity
        await this.analyzeReportedUser(reportedUserId, reportId);
        
        return {
            success: true,
            reportId: reportId,
            message: 'Report submitted successfully. AI analysis in progress.'
        };
    }
    
    // Analyze reported user with AI
    async analyzeReportedUser(userId, reportId) {
        try {
            // In a real implementation, this would analyze recent video frames
            // For now, we'll simulate the analysis
            
            const report = this.pendingReports.get(reportId);
            if (!report) return;
            
            // Simulate AI analysis delay
            setTimeout(async () => {
                const userHistory = this.userViolations.get(userId) || [];
                const recentViolations = userHistory.filter(v => 
                    Date.now() - v.timestamp < 10 * 60 * 1000 // Last 10 minutes
                );
                
                if (recentViolations.length > 0) {
                    // User has recent violations, ban them
                    await this.banUser(userId, `Reported by user and confirmed by AI analysis (Report ID: ${reportId})`);
                    report.status = 'confirmed';
                    report.action = 'banned';
                } else {
                    // No recent violations found
                    report.status = 'no_violation_found';
                    report.action = 'no_action';
                }
                
                console.log(`Report ${reportId} analysis complete:`, report);
            }, 2000); // 2 second delay for analysis
            
        } catch (error) {
            console.error('Error analyzing reported user:', error);
            const report = this.pendingReports.get(reportId);
            if (report) {
                report.status = 'analysis_failed';
                report.error = error.message;
            }
        }
    }
    
    // Check if user is banned
    isUserBanned(userId) {
        return this.bannedUsers.has(userId);
    }
    
    // Get user violation history
    getUserViolations(userId) {
        return this.userViolations.get(userId) || [];
    }
    
    // Get report status
    getReportStatus(reportId) {
        return this.pendingReports.get(reportId) || null;
    }
}

module.exports = AIModeration;