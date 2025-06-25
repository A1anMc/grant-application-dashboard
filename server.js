const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const NotificationService = require('./api/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize notification service
const notificationService = new NotificationService();

// CORS configuration for React frontend
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
  'https://sge-grant-frontend.onrender.com'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// API routes
app.use('/api/grants', require('./api/grants'));

// Eligibility assessment endpoint
const eligibilityAssessor = require('./api/eligibility');
app.post('/api/eligibility/assess', (req, res) => {
  try {
    const assessment = eligibilityAssessor.assessGrant(req.body);
    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual grants endpoints
const ManualGrantManager = require('./api/manual-grants');
const manualGrantManager = new ManualGrantManager();

app.get('/api/manual-grants', async (req, res) => {
  try {
    const data = await manualGrantManager.getAllGrants();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/manual-grants', async (req, res) => {
  try {
    const grant = await manualGrantManager.addGrant(req.body);
    res.status(201).json(grant);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/manual-grants/:id', async (req, res) => {
  try {
    const grant = await manualGrantManager.updateGrant(req.params.id, req.body);
    res.json(grant);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/manual-grants/:id', async (req, res) => {
  try {
    const grant = await manualGrantManager.deleteGrant(req.params.id);
    res.json({ success: true, grant });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Notification API Routes
app.get('/api/notifications', (req, res) => {
  try {
    const notifications = notificationService.getNotifications();
    res.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/:id/read', (req, res) => {
  try {
    const success = notificationService.markAsRead(req.params.id);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/read-all', (req, res) => {
  try {
    const count = notificationService.markAllAsRead();
    res.json({ success: true, markedCount: count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/test', async (req, res) => {
  try {
    await notificationService.testNotifications();
    res.json({ success: true, message: 'Test notifications sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/test-diverse', async (req, res) => {
  try {
    // Create diverse test notifications for showcasing filtering
    const testNotifications = [
      {
        type: 'deadline_alert',
        urgency: 'urgent',
        title: 'Grant Deadline Tomorrow',
        message: 'Screen Australia Documentary Fund deadline is tomorrow',
        grantTitle: 'Documentary Development Fund',
        icon: '🚨'
      },
      {
        type: 'new_grant',
        urgency: 'info',
        title: 'New Grant Opportunity',
        message: 'Creative Victoria has announced a new Indigenous Arts Grant',
        grantTitle: 'Indigenous Arts Development Grant',
        icon: '🆕'
      },
      {
        type: 'deadline_alert',
        urgency: 'warning',
        title: 'Grant Deadline in 3 Days',
        message: 'Australia Council deadline approaching',
        grantTitle: 'Arts Project Fund',
        icon: '⚠️'
      },
      {
        type: 'daily_summary',
        urgency: 'info',
        title: 'Daily Grant Summary',
        message: '16 total grants, 11 eligible, 2 deadlines this week',
        icon: '📊'
      },
      {
        type: 'system',
        urgency: 'info',
        title: 'System Update',
        message: 'Grant discovery system has been updated with new features',
        icon: '🔧'
      }
    ];

    testNotifications.forEach(notification => {
      notificationService.addNotification(notification);
    });

    res.json({ 
      success: true, 
      message: `Created ${testNotifications.length} diverse test notifications` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/check-deadlines', async (req, res) => {
  try {
    const alerts = await notificationService.checkDeadlineAlerts();
    res.json({ success: true, alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/check-new-grants', async (req, res) => {
  try {
    const newGrants = await notificationService.checkNewGrants();
    res.json({ success: true, newGrants, count: newGrants.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Serve static HTML frontend
app.use(express.static(__dirname));
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ SGE Grant Portal running at http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/grants`);
  console.log(`🔔 Notifications API at http://localhost:${PORT}/api/notifications`);
  console.log(`🎯 React frontend should connect from http://localhost:5173`);
  
  // Initialize notifications with a welcome message
  setTimeout(() => {
    notificationService.addNotification({
      type: 'system',
      urgency: 'info',
      title: 'Notification System Active',
      message: 'Smart notifications are now monitoring your grants for deadlines and opportunities.',
      icon: '🔔'
    });
    
    // Run initial checks
    notificationService.checkDeadlineAlerts();
    notificationService.checkNewGrants();
  }, 2000);
}); 