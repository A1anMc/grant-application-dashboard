const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// PDF Analysis endpoint - integrates with Planning Tool's FastAPI backend
router.post('/analyze', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📄 Processing PDF analysis for:', req.file.originalname);

    // Create form data to send to Planning Tool's FastAPI backend
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Call Planning Tool's PDF processing endpoint
    const planningToolResponse = await axios.post(
      'http://localhost:8000/api/v1/upload/process',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000 // 60 second timeout
      }
    );

    // Extract analysis results
    const analysisResults = planningToolResponse.data;

    // Generate tasks based on PDF analysis
    const tasks = await generateTasksFromAnalysis(analysisResults);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return comprehensive analysis
    res.json({
      success: true,
      analysis: {
        ...analysisResults,
        generatedTasks: tasks,
        processedAt: new Date().toISOString(),
        filename: req.file.originalname
      }
    });

  } catch (error) {
    console.error('❌ PDF Analysis Error:', error.message);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'PDF analysis failed',
      details: error.message,
      planningToolAvailable: error.code !== 'ECONNREFUSED'
    });
  }
});

// Task generation from PDF analysis
async function generateTasksFromAnalysis(analysis) {
  const tasks = [];
  
  try {
    // Generate strategic tasks based on analysis
    if (analysis.strategic_elements) {
      const strategicTasks = analysis.strategic_elements.map((element, index) => ({
        id: `strategic_${index}`,
        title: `Address: ${element.type}`,
        description: element.content,
        priority: element.importance || 'medium',
        category: 'strategic',
        dueDate: null,
        status: 'pending',
        createdAt: new Date().toISOString()
      }));
      tasks.push(...strategicTasks);
    }

    // Generate document preparation tasks
    if (analysis.required_documents) {
      const docTasks = analysis.required_documents.map((doc, index) => ({
        id: `doc_${index}`,
        title: `Prepare: ${doc}`,
        description: `Gather and prepare required document: ${doc}`,
        priority: 'high',
        category: 'documentation',
        dueDate: null,
        status: 'pending',
        createdAt: new Date().toISOString()
      }));
      tasks.push(...docTasks);
    }

    // Generate deadline-based tasks
    if (analysis.deadlines) {
      const deadlineTasks = analysis.deadlines.map((deadline, index) => ({
        id: `deadline_${index}`,
        title: `Meet Deadline: ${deadline.title}`,
        description: `Important deadline: ${deadline.description}`,
        priority: 'critical',
        category: 'deadline',
        dueDate: deadline.date,
        status: 'pending',
        createdAt: new Date().toISOString()
      }));
      tasks.push(...deadlineTasks);
    }

    console.log(`✅ Generated ${tasks.length} tasks from PDF analysis`);
    return tasks;

  } catch (error) {
    console.error('❌ Task generation error:', error);
    return [];
  }
}

// Validate document endpoint
router.post('/validate', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Basic validation
    const validation = {
      valid: true,
      filename: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      issues: []
    };

    // Check file size
    if (req.file.size > 50 * 1024 * 1024) {
      validation.valid = false;
      validation.issues.push('File size exceeds 50MB limit');
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      validation.valid = false;
      validation.issues.push('Only PDF and DOCX files are supported');
    }

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.json(validation);

  } catch (error) {
    console.error('❌ File validation error:', error);
    res.status(500).json({ error: 'File validation failed' });
  }
});

// Get processing status
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    planningToolIntegration: 'active',
    supportedFormats: ['PDF', 'DOCX'],
    maxFileSize: '50MB'
  });
});

module.exports = router; 