const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const TASKS_FILE = path.join(__dirname, '../mock/tasks.json');

async function loadTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveTasks(tasks) {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

router.get('/', async (req, res) => {
  try {
    const tasks = await loadTasks();
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const newTask = {
      id: Math.max(0, ...tasks.map(t => t.id || 0)) + 1,
      title: req.body.title,
      category: req.body.category || 'General',
      priority: req.body.priority || 'medium',
      status: 'todo',
      created_at: new Date().toISOString()
    };
    tasks.push(newTask);
    await saveTasks(tasks);
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
