const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../mock/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'shadow-goose-grant-secret';

const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  COLLABORATOR: 'collaborator',
  VIEWER: 'viewer'
};

const PERMISSIONS = {
  [ROLES.ADMIN]: ['read', 'write', 'delete', 'manage_users', 'export'],
  [ROLES.MANAGER]: ['read', 'write', 'delete', 'export'],
  [ROLES.COLLABORATOR]: ['read', 'write', 'comment'],
  [ROLES.VIEWER]: ['read']
};

async function initializeUsers() {
  try {
    await fs.access(USERS_FILE);
  } catch (error) {
    const defaultUsers = [
      {
        id: '1',
        username: 'alan',
        email: 'alan@shadowgoose.com',
        password: await bcrypt.hash('admin123', 10),
        role: ROLES.ADMIN,
        name: 'Alan McCarthy',
        specialization: 'Legal & Rights',
        avatar: '👨‍💼'
      },
      {
        id: '2',
        username: 'ursula',
        email: 'ursula@shadowgoose.com',
        password: await bcrypt.hash('admin123', 10),
        role: ROLES.MANAGER,
        name: 'Ursula',
        specialization: 'Admin & Submissions',
        avatar: '👩‍💼'
      }
    ];
    await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }
}

async function loadUsers() {
  await initializeUsers();
  const data = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await loadUsers();
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await loadUsers();
    const user = users.find(u => u.username === username || u.email === username);

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        specialization: user.specialization,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/demo-login', async (req, res) => {
  const users = await loadUsers();
  const user = users[0];
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      specialization: user.specialization,
      avatar: user.avatar
    }
  });
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      specialization: req.user.specialization,
      avatar: req.user.avatar
    }
  });
});


// Get current user info
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      specialization: req.user.specialization,
      avatar: req.user.avatar
    }
  });
});
module.exports = { router, authenticateToken, ROLES, PERMISSIONS };
