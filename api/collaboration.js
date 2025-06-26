const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const DISCUSSIONS_FILE = path.join(__dirname, '../mock/discussions.json');
const COMMENTS_FILE = path.join(__dirname, '../mock/comments.json');

async function loadDiscussions() {
  try {
    const data = await fs.readFile(DISCUSSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveDiscussions(discussions) {
  await fs.writeFile(DISCUSSIONS_FILE, JSON.stringify(discussions, null, 2));
}

async function loadComments() {
  try {
    const data = await fs.readFile(COMMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveComments(comments) {
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

// Create discussion thread
router.post('/discussions', authenticateToken, async (req, res) => {
  try {
    const discussions = await loadDiscussions();
    const discussion = {
      id: `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: req.body.title,
      description: req.body.description,
      grantId: req.body.grantId,
      taskId: req.body.taskId,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      status: 'active',
      priority: req.body.priority || 'medium',
      tags: req.body.tags || [],
      participants: [req.user.id]
    };

    discussions.push(discussion);
    await saveDiscussions(discussions);

    res.json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get discussions
router.get('/discussions', authenticateToken, async (req, res) => {
  try {
    const discussions = await loadDiscussions();
    const { grantId, taskId, status } = req.query;

    let filteredDiscussions = discussions;

    if (grantId) {
      filteredDiscussions = filteredDiscussions.filter(d => d.grantId === grantId);
    }

    if (taskId) {
      filteredDiscussions = filteredDiscussions.filter(d => d.taskId === taskId);
    }

    if (status) {
      filteredDiscussions = filteredDiscussions.filter(d => d.status === status);
    }

    res.json({ success: true, discussions: filteredDiscussions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to discussion
router.post('/discussions/:id/comments', authenticateToken, async (req, res) => {
  try {
    const comments = await loadComments();
    const comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      discussionId: req.params.id,
      content: req.body.content,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      edited: false,
      mentions: req.body.mentions || [],
      attachments: req.body.attachments || []
    };

    comments.push(comment);
    await saveComments(comments);

    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments for discussion
router.get('/discussions/:id/comments', authenticateToken, async (req, res) => {
  try {
    const comments = await loadComments();
    const discussionComments = comments.filter(c => c.discussionId === req.params.id);

    res.json({ success: true, comments: discussionComments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task assignment
router.put('/tasks/:id/assign', authenticateToken, async (req, res) => {
  try {
    // This integrates with the existing tasks API
    const { assignedTo, priority, dueDate } = req.body;
    
    const response = await fetch(`http://localhost:3000/api/tasks/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assigned_to: assignedTo,
        priority,
        due_date: dueDate,
        updated_by: req.user.id,
        updated_at: new Date().toISOString()
      })
    });

    const result = await response.json();
    
    // Create notification for assigned user
    if (assignedTo && assignedTo !== req.user.id) {
      // TODO: Integrate with notification system
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team activity feed
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const discussions = await loadDiscussions();
    const comments = await loadComments();
    
    // Combine and sort recent activity
    const activities = [
      ...discussions.map(d => ({
        type: 'discussion_created',
        id: d.id,
        title: d.title,
        user: d.createdBy,
        timestamp: d.createdAt,
        grantId: d.grantId
      })),
      ...comments.map(c => ({
        type: 'comment_added',
        id: c.id,
        content: c.content.substring(0, 100) + '...',
        user: c.createdBy,
        timestamp: c.createdAt,
        discussionId: c.discussionId
      }))
    ];

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ 
      success: true, 
      activities: activities.slice(0, 20) // Last 20 activities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
