const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('./auth');
const router = express.Router();

// Configure multer for file uploads with versioning
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

const DOCUMENTS_FILE = path.join(__dirname, '../mock/documents.json');

async function loadDocuments() {
  try {
    const data = await fs.readFile(DOCUMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveDocuments(documents) {
  await fs.writeFile(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
}

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documents = await loadDocuments();
    const document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename: req.file.originalname,
      storedFilename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      grantId: req.body.grantId || null,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      version: 1,
      description: req.body.description || '',
      category: req.body.category || 'general'
    };

    documents.push(document);
    await saveDocuments(documents);

    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const documents = await loadDocuments();
    const { grantId, category, tag } = req.query;

    let filteredDocs = documents;

    if (grantId) {
      filteredDocs = filteredDocs.filter(doc => doc.grantId === grantId);
    }

    if (category) {
      filteredDocs = filteredDocs.filter(doc => doc.category === category);
    }

    if (tag) {
      filteredDocs = filteredDocs.filter(doc => doc.tags.includes(tag));
    }

    res.json({ success: true, documents: filteredDocs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const documents = await loadDocuments();
    const document = documents.find(doc => doc.id === req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.download(document.path, document.filename);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update document metadata
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const documents = await loadDocuments();
    const docIndex = documents.findIndex(doc => doc.id === req.params.id);

    if (docIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updatedDoc = {
      ...documents[docIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    };

    documents[docIndex] = updatedDoc;
    await saveDocuments(documents);

    res.json({ success: true, document: updatedDoc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const documents = await loadDocuments();
    const docIndex = documents.findIndex(doc => doc.id === req.params.id);

    if (docIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documents[docIndex];
    
    // Delete physical file
    try {
      await fs.unlink(document.path);
    } catch (error) {
      console.warn('Could not delete physical file:', error.message);
    }

    documents.splice(docIndex, 1);
    await saveDocuments(documents);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
