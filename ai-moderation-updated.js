// AI Content Moderation System for Video Chat Application
// Integrates with Sightengine API for real-time video content analysis

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
        console.log('AI Moderation Service initialized with Sightengine API');
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

    // Process the analysis result from Sightengine
    processAnalysisResult(result, userId) {
        const analysis = {
            safe: true,
            confidence: 0,
            violations: [],
            reason: 'SAFE'
        };

        // Check nudity
        if (result.nudity) {
            const nudityScore = Math.max(
                result.nudity.sexual_activity || 0,
                result.nudity.sexual_display || 0,
                result.nudity.erotica || 0
            );
            
            if (nudityScore > this.thresholds.nudity) {
                analysis.safe = false;
                analysis.confidence = Math.max(analysis.confidence, nudityScore);
                analysis.violations.push('NUDITY');
                analysis.reason = 'INAPPROPRIATE_CONTENT';
            }
        }

        // Check weapon/alcohol/drugs
        if (result.weapon > this.thresholds.violence) {
            analysis.safe = false;
            analysis.confidence = Math.max(analysis.confidence, result.weapon);
            analysis.violations.push('WEAPON');
            analysis.reason = 'DANGEROUS_CONTENT';
        }

        // Check offensive content
        if (result.offensive && result.offensive.prob > this.thresholds.offensive) {
            analysis.safe = false;
            analysis.confidence = Math.max(analysis.confidence, result.offensive.prob);
            analysis.violations.push('OFFENSIVE');
            analysis.reason = 'OFFENSIVE_CONTENT';
        }

        // Check gore content
        if (result.gore && result.gore.prob > this.thresholds.gore) {
            analysis.safe = false;
            analysis.confidence = Math.max(analysis.confidence, result.gore.prob);
            analysis.violations.push('GORE');
            analysis.reason = 'VIOLENT_CONTENT';
        }

        console.log(`AI Analysis for user ${userId}:`, {
            safe: analysis.safe,
            confidence: analysis.confidence,
            violations: analysis.violations,
            reason: analysis.reason
        });

        return analysis;
    }

    // Handle user report
    async handleUserReport(reporterId, reportedUserId, reason, additionalInfo = {}) {
        const timestamp = Date.now();
        
        // Check report cooldown to prevent spam
        const cooldownKey = `${reporterId}_${reportedUserId}`;
        const lastReport = this.reportCooldown.get(cooldownKey);
        if (lastReport && timestamp - lastReport < 60000) { // 1 minute cooldown
            return {
                success: false,
                message: 'Please wait before reporting the same user again.'
            };
        }
        
        this.reportCooldown.set(cooldownKey, timestamp);
        
        // Initialize reported user data if not exists
        if (!this.reportedUsers.has(reportedUserId)) {
            this.reportedUsers.set(reportedUserId, {
                reports: [],
                lastReportTime: 0,
                totalReports: 0
            });
        }

        const reportedUserData = this.reportedUsers.get(reportedUserId);
        
        // Add the report
        const report = {
            reporterId,
            reason,
            timestamp,
            additionalInfo
        };
        
        reportedUserData.reports.push(report);
        reportedUserData.lastReportTime = timestamp;
        reportedUserData.totalReports++;

        console.log(`User ${reportedUserId} reported by ${reporterId} for: ${reason}`);
        console.log(`Total reports for user ${reportedUserId}: ${reportedUserData.totalReports}`);

        // Trigger AI analysis if multiple reports or serious allegation
        const shouldAnalyze = (
            reportedUserData.totalReports >= 2 || 
            reason === 'INAPPROPRIATE_SEXUAL_BEHAVIOR' ||
            reason === 'NUDITY' ||
            reason === 'HARASSMENT'
        );

        if (shouldAnalyze) {
            const analysisResult = await this.triggerAIAnalysis(reportedUserId, report);
            return {
                success: true,
                message: 'Report submitted. AI analysis has been initiated.',
                analysisTriggered: true,
                ...analysisResult
            };
        }

        return {
            success: true,
            message: 'Report has been recorded. Thank you for helping keep our community safe.',
            analysisTriggered: false
        };
    }

    // Trigger AI analysis for reported user
    async triggerAIAnalysis(userId, report) {
        if (this.activeAnalysis.has(userId)) {
            return {
                action: 'ANALYSIS_IN_PROGRESS',
                message: 'Analysis already in progress for this user.'
            };
        }

        this.activeAnalysis.set(userId, {
            startTime: Date.now(),
            report: report,
            status: 'ANALYZING'
        });

        console.log(`Starting AI analysis for reported user: ${userId}`);
        
        // In a real implementation, you would capture video frames here
        // For now, we'll simulate the analysis
        setTimeout(async () => {
            await this.completeAnalysis(userId);
        }, 5000); // 5 second analysis simulation

        return {
            action: 'ANALYSIS_STARTED',
            message: 'AI analysis has been initiated. The user will be monitored for inappropriate behavior.',
            analysisId: `analysis_${userId}_${Date.now()}`
        };
    }

    // Complete the AI analysis and take action
    async completeAnalysis(userId) {
        const analysisData = this.activeAnalysis.get(userId);
        if (!analysisData) return;

        // Simulate AI analysis result
        // In real implementation, this would be based on actual video frame analysis
        const mockAnalysisResult = {
            safe: Math.random() > 0.3, // 70% chance of being safe for simulation
            confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
            violations: Math.random() > 0.5 ? ['INAPPROPRIATE_CONTENT'] : [],
            reason: Math.random() > 0.3 ? 'SAFE' : 'INAPPROPRIATE_BEHAVIOR'
        };

        const reportedUserData = this.reportedUsers.get(userId);
        const action = this.determineAction(mockAnalysisResult, reportedUserData);

        console.log(`AI Analysis completed for user ${userId}:`, {
            result: mockAnalysisResult,
            action: action.type,
            duration: action.duration
        });

        // Execute the action
        if (action.type === 'BAN') {
            await this.banUser(userId, action.duration, action.reason);
        }

        // Clean up
        this.activeAnalysis.delete(userId);

        return {
            analysisResult: mockAnalysisResult,
            action: action
        };
    }

    // Determine what action to take based on AI analysis and report history
    determineAction(analysisResult, reportedUserData) {
        const totalReports = reportedUserData.totalReports;
        const recentReports = reportedUserData.reports.filter(
            report => Date.now() - report.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
        ).length;

        // If AI detected inappropriate content with high confidence
        if (!analysisResult.safe && analysisResult.confidence > 0.8) {
            return {
                type: 'BAN',
                duration: 7 * 24 * 60 * 60 * 1000, // 7 days
                reason: `AI detected ${analysisResult.violations.join(', ')} with ${Math.round(analysisResult.confidence * 100)}% confidence`
            };
        }

        // If AI detected inappropriate content with medium confidence and multiple reports
        if (!analysisResult.safe && analysisResult.confidence > 0.6 && totalReports >= 3) {
            return {
                type: 'BAN',
                duration: 3 * 24 * 60 * 60 * 1000, // 3 days
                reason: `AI detected potential inappropriate behavior with multiple user reports`
            };
        }

        // If many recent reports even if AI didn't detect issues
        if (recentReports >= 5) {
            return {
                type: 'BAN',
                duration: 24 * 60 * 60 * 1000, // 1 day
                reason: `Multiple user reports in short timeframe`
            };
        }

        // Continue monitoring
        return {
            type: 'MONITOR',
            reason: 'Continue monitoring user behavior'
        };
    }

    // Ban user by IP address
    async banUser(userId, duration, reason) {
        const banExpiry = Date.now() + duration;
        
        // In a real implementation, you would get the user's IP from the socket connection
        // For now, we'll store the ban by userId
        this.bannedIPs.add(userId);
        
        console.log(`User ${userId} banned for ${Math.round(duration / (24 * 60 * 60 * 1000))} days. Reason: ${reason}`);
        
        // Schedule unban
        setTimeout(() => {
            this.unbanUser(userId);
        }, duration);

        return {
            banned: true,
            userId,
            duration,
            reason,
            expiryTime: banExpiry
        };
    }

    // Unban user
    unbanUser(userId) {
        this.bannedIPs.delete(userId);
        console.log(`User ${userId} has been unbanned`);
    }

    // Check if user/IP is banned
    isUserBanned(userId) {
        return this.bannedIPs.has(userId);
    }

    // Get user report history
    getUserReportHistory(userId) {
        return this.reportedUsers.get(userId) || {
            reports: [],
            lastReportTime: 0,
            totalReports: 0
        };
    }

    // Clean up old reports (run periodically)
    cleanupOldReports() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        for (const [userId, userData] of this.reportedUsers.entries()) {
            userData.reports = userData.reports.filter(
                report => report.timestamp > oneWeekAgo
            );
            
            if (userData.reports.length === 0) {
                this.reportedUsers.delete(userId);
            } else {
                userData.totalReports = userData.reports.length;
            }
        }
    }
}

module.exports = AIModeration;