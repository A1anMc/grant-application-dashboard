const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

class NotificationService {
  constructor() {
    this.notifications = [];
    this.emailTransporter = null;
    this.initializeEmailService();
    this.startScheduledTasks();
  }

  // Initialize email service
  initializeEmailService() {
    // For development, we'll use a test account
    // In production, you'd use your actual email service credentials
    this.emailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    console.log('📧 Email notification service initialized');
  }

  // Add in-app notification
  addNotification(notification) {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    console.log(`🔔 New notification: ${notification.title}`);
    return newNotification;
  }

  // Get all notifications
  getNotifications(userId = 'default') {
    return this.notifications.map(notification => ({
      ...notification,
      timeAgo: this.getTimeAgo(notification.timestamp)
    }));
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    return this.notifications.length;
  }

  // Send email notification
  async sendEmail(to, subject, htmlContent, textContent) {
    try {
      if (!this.emailTransporter) {
        console.log('📧 Email service not configured, skipping email send');
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Shadow Goose Grants <noreply@shadowgoose.com>',
        to,
        subject,
        html: htmlContent,
        text: textContent
      };

      // For development, we'll simulate email sending
      console.log(`📧 Simulating email send to: ${to}`);
      console.log(`📧 Subject: ${subject}`);
      console.log(`📧 Content: ${textContent}`);

      // Uncomment below for actual email sending
      // const result = await this.emailTransporter.sendMail(mailOptions);
      // return { success: true, messageId: result.messageId };

      return { success: true, messageId: 'simulated-' + Date.now() };
    } catch (error) {
      console.error('📧 Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check for deadline alerts
  async checkDeadlineAlerts() {
    try {
      const grantsData = await this.loadGrantsData();
      const now = new Date();
      const alerts = [];

      grantsData.grants.forEach(grant => {
        if (!grant.deadline) return;

        const deadline = new Date(grant.deadline);
        const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        // Alert for deadlines in 7 days, 3 days, and 1 day
        if ([7, 3, 1].includes(daysUntil) && daysUntil > 0) {
          const urgency = daysUntil === 1 ? 'urgent' : daysUntil === 3 ? 'warning' : 'info';
          
          const notification = {
            type: 'deadline_alert',
            urgency,
            title: `Grant Deadline ${daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil} days`}`,
            message: `${grant.title} deadline is ${daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}`,
            grantId: grant.id,
            grantTitle: grant.title,
            deadline: grant.deadline,
            daysUntil,
            actionUrl: `/grants/${grant.id}`,
            icon: daysUntil === 1 ? '🚨' : daysUntil === 3 ? '⚠️' : '📅'
          };

          alerts.push(notification);
          this.addNotification(notification);

          // Send email for urgent deadlines (1-3 days)
          if (daysUntil <= 3) {
            this.sendDeadlineEmail(grant, daysUntil);
          }
        }

        // Alert for overdue grants
        if (daysUntil < 0) {
          const daysOverdue = Math.abs(daysUntil);
          const notification = {
            type: 'overdue_alert',
            urgency: 'urgent',
            title: 'Grant Overdue',
            message: `${grant.title} was due ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago`,
            grantId: grant.id,
            grantTitle: grant.title,
            deadline: grant.deadline,
            daysOverdue,
            actionUrl: `/grants/${grant.id}`,
            icon: '🔴'
          };

          alerts.push(notification);
          this.addNotification(notification);
        }
      });

      if (alerts.length > 0) {
        console.log(`🔔 Generated ${alerts.length} deadline alerts`);
      }

      return alerts;
    } catch (error) {
      console.error('Error checking deadline alerts:', error);
      return [];
    }
  }

  // Send deadline email notification
  async sendDeadlineEmail(grant, daysUntil) {
    const subject = `Grant Deadline Alert: ${grant.title}`;
    const urgencyText = daysUntil === 1 ? 'TOMORROW' : `${daysUntil} DAYS`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">⏰ Grant Deadline Alert</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Shadow Goose Entertainment</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 4px solid ${daysUntil === 1 ? '#EF4444' : '#F59E0B'}; margin-bottom: 25px;">
          <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">${grant.title}</h2>
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 15px 0; line-height: 1.6;">
            <strong style="color: ${daysUntil === 1 ? '#EF4444' : '#F59E0B'};">Deadline: ${urgencyText}</strong>
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
            Due Date: ${new Date(grant.deadline).toLocaleDateString('en-AU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">Grant Details</h3>
          <p style="color: #4b5563; margin: 0 0 10px 0;"><strong>Funder:</strong> ${grant.funder}</p>
          <p style="color: #4b5563; margin: 0 0 10px 0;"><strong>Amount:</strong> ${grant.amount_string}</p>
          <p style="color: #4b5563; margin: 0 0 15px 0;"><strong>Eligibility:</strong> ${grant.eligibility?.category || 'To be assessed'}</p>
          ${grant.description ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">${grant.description}</p>` : ''}
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="http://localhost:5174" style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            View Grant Details
          </a>
        </div>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            This is an automated notification from Shadow Goose Grant Management System.<br>
            Visit your dashboard to manage notification preferences.
          </p>
        </div>
      </div>
    `;

    const textContent = `
Grant Deadline Alert: ${grant.title}

Deadline: ${urgencyText}
Due Date: ${new Date(grant.deadline).toLocaleDateString()}

Grant Details:
- Funder: ${grant.funder}
- Amount: ${grant.amount_string}
- Eligibility: ${grant.eligibility?.category || 'To be assessed'}

Visit http://localhost:5174 to view full details.

This is an automated notification from Shadow Goose Grant Management System.
    `;

    return await this.sendEmail(
      process.env.NOTIFICATION_EMAIL || 'admin@shadowgoose.com',
      subject,
      htmlContent,
      textContent
    );
  }

  // Check for new grant opportunities
  async checkNewGrants() {
    try {
      const grantsData = await this.loadGrantsData();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const newGrants = grantsData.grants.filter(grant => {
        const addedDate = new Date(grant.added_date || grant.created_at || Date.now());
        return addedDate > oneDayAgo;
      });

      newGrants.forEach(grant => {
        const notification = {
          type: 'new_grant',
          urgency: 'info',
          title: 'New Grant Opportunity',
          message: `${grant.title} - ${grant.amount_string}`,
          grantId: grant.id,
          grantTitle: grant.title,
          funder: grant.funder,
          amount: grant.amount_string,
          actionUrl: `/grants/${grant.id}`,
          icon: '🆕'
        };

        this.addNotification(notification);
      });

      if (newGrants.length > 0) {
        console.log(`🆕 Found ${newGrants.length} new grants`);
        await this.sendNewGrantsEmail(newGrants);
      }

      return newGrants;
    } catch (error) {
      console.error('Error checking new grants:', error);
      return [];
    }
  }

  // Send new grants email notification
  async sendNewGrantsEmail(newGrants) {
    const subject = `New Grant Opportunities Available (${newGrants.length})`;
    
    const grantsList = newGrants.map(grant => `
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
        <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${grant.title}</h3>
        <p style="color: #4b5563; margin: 0 0 5px 0;"><strong>Funder:</strong> ${grant.funder}</p>
        <p style="color: #4b5563; margin: 0 0 5px 0;"><strong>Amount:</strong> ${grant.amount_string}</p>
        ${grant.deadline ? `<p style="color: #ef4444; margin: 0; font-weight: 600;">Deadline: ${new Date(grant.deadline).toLocaleDateString()}</p>` : ''}
      </div>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🆕 New Grant Opportunities</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${newGrants.length} new grant${newGrants.length > 1 ? 's' : ''} available</p>
        </div>
        
        ${grantsList}

        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5174" style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            View All Grants
          </a>
        </div>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            This is an automated notification from Shadow Goose Grant Management System.
          </p>
        </div>
      </div>
    `;

    const textContent = `
New Grant Opportunities Available (${newGrants.length})

${newGrants.map(grant => `
${grant.title}
Funder: ${grant.funder}
Amount: ${grant.amount_string}
${grant.deadline ? `Deadline: ${new Date(grant.deadline).toLocaleDateString()}` : ''}
`).join('\n---\n')}

Visit http://localhost:5174 to view all grants.
    `;

    return await this.sendEmail(
      process.env.NOTIFICATION_EMAIL || 'admin@shadowgoose.com',
      subject,
      htmlContent,
      textContent
    );
  }

  // Load grants data
  async loadGrantsData() {
    try {
      // Try to load from the API endpoint data
      const mockPath = path.join(__dirname, '../mock/mockGrants.json');
      const manualPath = path.join(__dirname, '../mock/manual_grants.json');
      const discoveredPath = path.join(__dirname, '../mock/discovered_grants.json');

      const [mockData, manualData, discoveredData] = await Promise.all([
        fs.readFile(mockPath, 'utf8').then(JSON.parse).catch(() => ({ grants: [] })),
        fs.readFile(manualPath, 'utf8').then(JSON.parse).catch(() => ({ grants: [] })),
        fs.readFile(discoveredPath, 'utf8').then(JSON.parse).catch(() => ({ grants: [] }))
      ]);

      // Extract grants arrays from the data objects
      const mockGrants = Array.isArray(mockData) ? mockData : (mockData.grants || []);
      const manualGrants = Array.isArray(manualData) ? manualData : (manualData.grants || []);
      const discoveredGrants = Array.isArray(discoveredData) ? discoveredData : (discoveredData.grants || []);

      const allGrants = [...mockGrants, ...manualGrants, ...discoveredGrants];
      
      return {
        grants: allGrants,
        stats: {
          total: allGrants.length,
          mock: mockGrants.length,
          manual: manualGrants.length,
          discovered: discoveredGrants.length
        }
      };
    } catch (error) {
      console.error('Error loading grants data:', error);
      return { grants: [], stats: { total: 0, mock: 0, manual: 0, discovered: 0 } };
    }
  }

  // Start scheduled tasks
  startScheduledTasks() {
    // Check for deadline alerts every hour
    cron.schedule('0 * * * *', () => {
      console.log('🕐 Running hourly deadline check...');
      this.checkDeadlineAlerts();
    });

    // Check for new grants every 6 hours
    cron.schedule('0 */6 * * *', () => {
      console.log('🕕 Running new grants check...');
      this.checkNewGrants();
    });

    // Daily summary at 9 AM
    cron.schedule('0 9 * * *', () => {
      console.log('🌅 Running daily summary...');
      this.sendDailySummary();
    });

    console.log('⏰ Scheduled notification tasks started');
  }

  // Send daily summary
  async sendDailySummary() {
    try {
      const grantsData = await this.loadGrantsData();
      const now = new Date();
      
      // Count deadlines in next 7 days
      const upcomingDeadlines = grantsData.grants.filter(grant => {
        if (!grant.deadline) return false;
        const deadline = new Date(grant.deadline);
        const daysUntil = (deadline - now) / (1000 * 60 * 60 * 24);
        return daysUntil > 0 && daysUntil <= 7;
      });

      // Count eligible grants
      const eligibleGrants = grantsData.grants.filter(grant => 
        grant.eligibility?.category === 'eligible' || 
        grant.eligibility?.category === 'eligible_with_auspice'
      );

      const summary = {
        totalGrants: grantsData.stats.total,
        eligibleGrants: eligibleGrants.length,
        upcomingDeadlines: upcomingDeadlines.length,
        newGrantsToday: grantsData.grants.filter(grant => {
          const addedDate = new Date(grant.added_date || grant.created_at || 0);
          const today = new Date();
          return addedDate.toDateString() === today.toDateString();
        }).length
      };

      const notification = {
        type: 'daily_summary',
        urgency: 'info',
        title: 'Daily Grant Summary',
        message: `${summary.totalGrants} total grants, ${summary.eligibleGrants} eligible, ${summary.upcomingDeadlines} deadlines this week`,
        summary,
        actionUrl: '/analytics',
        icon: '📊'
      };

      this.addNotification(notification);
      console.log('📊 Daily summary generated');

      return summary;
    } catch (error) {
      console.error('Error generating daily summary:', error);
      return null;
    }
  }

  // Utility function to get time ago
  getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  }

  // Test notification system
  async testNotifications() {
    console.log('🧪 Testing notification system...');
    
    // Add test notification
    this.addNotification({
      type: 'test',
      urgency: 'info',
      title: 'Notification System Test',
      message: 'This is a test notification to verify the system is working correctly.',
      icon: '🧪'
    });

    // Test email (simulated)
    await this.sendEmail(
      'test@example.com',
      'Test Notification',
      '<h1>Test Email</h1><p>This is a test email notification.</p>',
      'Test Email: This is a test email notification.'
    );

    console.log('🧪 Test notifications sent');
    return true;
  }
}

module.exports = NotificationService; 