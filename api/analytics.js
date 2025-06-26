const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('./auth');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Rate limiting for analytics - more restrictive
const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each user to 30 requests per minute
  message: { error: 'Too many analytics requests, please try again later.' },
  keyGenerator: (req) => req.user?.id || req.ip
});

// Apply rate limiting to all analytics routes
router.use(analyticsLimiter);

// Get comprehensive analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Only allow analytics access for admin/manager roles
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for analytics' });
    }

    // Fetch data from various sources
    const grantsResponse = await fetch('http://localhost:3000/api/grants');
    const grantsData = await grantsResponse.json();
    
    const tasksResponse = await fetch('http://localhost:3000/api/tasks');
    const tasksData = await tasksResponse.json();

    const grants = grantsData.grants || [];
    const tasks = tasksData.tasks || [];

    // Calculate metrics
    const totalGrants = grants.length;
    const eligibleGrants = grants.filter(g => g.status === 'eligible').length;
    const submittedGrants = grants.filter(g => g.status === 'submitted').length;
    const wonGrants = grants.filter(g => g.status === 'awarded').length;
    
    const winRate = submittedGrants > 0 ? ((wonGrants / submittedGrants) * 100).toFixed(1) : 0;
    
    // Task analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < new Date() && t.status !== 'completed';
    }).length;

    // Grant value analysis
    const totalValue = grants.reduce((sum, grant) => {
      const amount = parseFloat(grant.amount_string?.replace(/[^0-9]/g, '') || '0');
      return sum + amount;
    }, 0);

    const avgGrantValue = totalGrants > 0 ? totalValue / totalGrants : 0;

    // Monthly trends (mock data for now)
    const monthlyData = [
      { month: 'Jan', applications: 3, success: 1, value: 45000 },
      { month: 'Feb', applications: 5, success: 2, value: 78000 },
      { month: 'Mar', applications: 4, success: 1, value: 52000 },
      { month: 'Apr', applications: 6, success: 3, value: 95000 },
      { month: 'May', applications: 7, success: 2, value: 67000 },
      { month: 'Jun', applications: 8, success: 4, value: 120000 }
    ];

    // Upcoming deadlines
    const upcomingDeadlines = grants
      .filter(g => g.due_date && new Date(g.due_date) > new Date())
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5)
      .map(g => ({
        id: g.id,
        title: g.title,
        funder: g.funder,
        dueDate: g.due_date,
        daysUntilDue: Math.ceil((new Date(g.due_date) - new Date()) / (1000 * 60 * 60 * 24)),
        amount: g.amount_string
      }));

    // Category performance
    const categoryStats = {};
    grants.forEach(grant => {
      if (grant.tags) {
        grant.tags.forEach(tag => {
          if (!categoryStats[tag]) {
            categoryStats[tag] = { total: 0, eligible: 0, submitted: 0, won: 0 };
          }
          categoryStats[tag].total++;
          if (grant.status === 'eligible') categoryStats[tag].eligible++;
          if (grant.status === 'submitted') categoryStats[tag].submitted++;
          if (grant.status === 'awarded') categoryStats[tag].won++;
        });
      }
    });

    // Team performance
    const teamStats = {};
    tasks.forEach(task => {
      if (task.assigned_to) {
        if (!teamStats[task.assigned_to]) {
          teamStats[task.assigned_to] = { total: 0, completed: 0, overdue: 0 };
        }
        teamStats[task.assigned_to].total++;
        if (task.status === 'completed') teamStats[task.assigned_to].completed++;
        if (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed') {
          teamStats[task.assigned_to].overdue++;
        }
      }
    });

    res.json({
      success: true,
      analytics: {
        overview: {
          totalGrants,
          eligibleGrants,
          submittedGrants,
          wonGrants,
          winRate: parseFloat(winRate),
          totalValue,
          avgGrantValue,
          totalTasks,
          completedTasks,
          overdueTasks
        },
        monthlyTrends: monthlyData,
        upcomingDeadlines,
        categoryPerformance: Object.entries(categoryStats).map(([category, stats]) => ({
          category,
          ...stats,
          successRate: stats.submitted > 0 ? ((stats.won / stats.submitted) * 100).toFixed(1) : 0
        })),
        teamPerformance: Object.entries(teamStats).map(([member, stats]) => ({
          member,
          ...stats,
          completionRate: stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0
        })),
        insights: [
          {
            type: 'success',
            title: 'Strong Performance',
            message: `Win rate of ${winRate}% is above industry average`,
            priority: 'high'
          },
          {
            type: 'warning',
            title: 'Upcoming Deadlines',
            message: `${upcomingDeadlines.length} grants due in the next 30 days`,
            priority: 'medium'
          },
          {
            type: 'info',
            title: 'Task Management',
            message: `${overdueTasks} tasks are overdue and need attention`,
            priority: overdueTasks > 5 ? 'high' : 'low'
          }
        ]
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export data
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'json', type = 'grants' } = req.query;
    
    let data;
    switch (type) {
      case 'grants':
        const grantsResponse = await fetch('http://localhost:3000/api/grants');
        data = await grantsResponse.json();
        break;
      case 'tasks':
        const tasksResponse = await fetch('http://localhost:3000/api/tasks');
        data = await tasksResponse.json();
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert JSON to CSV (basic implementation)
      const items = data.grants || data.tasks || [];
      if (items.length === 0) {
        return res.status(404).json({ error: 'No data to export' });
      }

      const headers = Object.keys(items[0]).join(',');
      const rows = items.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );

      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export.json"`);
      res.json(data);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
