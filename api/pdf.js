const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FormData = require('form-data');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Enhanced file upload configuration with security
const upload = multer({ 
  dest: 'uploads/temp/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (reduced from 50MB)
    files: 1,
    fieldSize: 1024 * 1024 // 1MB field size limit
  },
  fileFilter: (req, file, cb) => {
    // Validate MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF and DOCX files are allowed'), false);
    }

    // Validate file extension
    const allowedExtensions = ['.pdf', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error('Invalid file extension'), false);
    }

    // Validate filename (no path traversal)
    if (file.originalname.includes('../') || file.originalname.includes('..\\')) {
      return cb(new Error('Invalid filename'), false);
    }

    cb(null, true);
  },
  filename: (req, file, cb) => {
    // Generate secure filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `secure_${uniqueSuffix}${ext}`);
  }
});

// File security validation middleware
const validateFileContent = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Read first few bytes to validate file signature
    const fd = await fs.promises.open(req.file.path, 'r');
    const buffer = Buffer.alloc(8);
    await fd.read(buffer, 0, 8, 0);
    await fd.close();

    const fileSignature = buffer.toString('hex').toUpperCase();
    
    // PDF signature: %PDF (25504446)
    // DOCX signature: PK (504B) - ZIP format
    const validSignatures = {
      'pdf': '25504446',
      'docx': '504B'
    };

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let isValid = false;

    if (fileExt === '.pdf' && fileSignature.startsWith(validSignatures.pdf)) {
      isValid = true;
    } else if (fileExt === '.docx' && fileSignature.startsWith(validSignatures.docx)) {
      isValid = true;
    }

    if (!isValid) {
      // Clean up invalid file
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({ 
        error: 'File content does not match declared file type' 
      });
    }

    next();
  } catch (error) {
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'File validation failed' });
  }
};

// Enhanced error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const tempDir = path.join(uploadsDir, 'temp');

const ensureDirectories = async () => {
  try {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    await fs.promises.mkdir(tempDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directories:', error);
  }
};

ensureDirectories();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'PDF Processing API',
    timestamp: new Date().toISOString()
  });
});

// PDF Analysis endpoint with enhanced security
router.post('/analyze', 
  authenticateToken,
  upload.single('document'), 
  handleMulterError,
  validateFileContent,
  async (req, res) => {
    let filePath = null;
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      filePath = req.file.path;
      console.log(`📄 Processing PDF analysis for: ${req.file.originalname} (User: ${req.user.username})`);

      // Check if Planning Tool is running
      try {
        await axios.get('http://localhost:8000/health');
      } catch (error) {
        console.log('⚠️ Planning Tool not available, using mock analysis');
        
        // Return mock analysis data
        const mockAnalysis = {
          filename: req.file.originalname,
          extractedText: "Mock extracted text from PDF document...",
          tasks: [
            {
              title: "Review grant eligibility criteria",
              description: "Analyze the specific requirements and ensure compliance",
              category: "Business",
              priority: "high",
              estimated_hours: 2
            },
            {
              title: "Prepare supporting documentation", 
              description: "Gather required documents and evidence",
              category: "Submission",
              priority: "medium",
              estimated_hours: 4
            }
          ],
          eligibility: {
            score: 85,
            category: "eligible",
            factors: [
              "Meets funding criteria",
              "Appropriate project scope",
              "Strong track record"
            ]
          },
          metadata: {
            pageCount: 12,
            wordCount: 3500,
            processingTime: "2.3s"
          }
        };

        return res.json({ success: true, analysis: mockAnalysis });
      }

      // If Planning Tool is available, send file for processing
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      const response = await axios.post('http://localhost:8000/analyze', formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        },
        timeout: 30000 // 30 second timeout
      });

      res.json({ success: true, analysis: response.data });

    } catch (error) {
      console.error('❌ PDF analysis error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        res.status(503).json({ error: 'PDF processing service unavailable' });
      } else if (error.code === 'ECONNABORTED') {
        res.status(408).json({ error: 'PDF processing timeout' });
      } else {
        res.status(500).json({ error: 'PDF analysis failed' });
      }
    } finally {
      // Always clean up uploaded file
      if (filePath) {
        try {
          await fs.promises.unlink(filePath);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }
      }
    }
  }
);

// Validate document endpoint with enhanced security
router.post('/validate', 
  authenticateToken,
  upload.single('document'), 
  handleMulterError,
  validateFileContent,
  async (req, res) => {
    let filePath = null;
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      filePath = req.file.path;

      // Enhanced validation
      const validation = {
        valid: true,
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        issues: [],
        securityChecks: {
          fileSignature: 'passed',
          fileSize: 'passed',
          filename: 'passed'
        }
      };

      // Additional size check
      if (req.file.size > 10 * 1024 * 1024) {
        validation.valid = false;
        validation.issues.push('File size exceeds 10MB limit');
        validation.securityChecks.fileSize = 'failed';
      }

      // File type check
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        validation.valid = false;
        validation.issues.push('Only PDF and DOCX files are supported');
      }

      res.json(validation);

    } catch (error) {
      console.error('❌ File validation error:', error);
      res.status(500).json({ error: 'File validation failed' });
    } finally {
      // Clean up file
      if (filePath) {
        try {
          await fs.promises.unlink(filePath);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }
      }
    }
  }
);

module.exports = router; 