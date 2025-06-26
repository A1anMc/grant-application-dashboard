const Joi = require('joi');

// Grant validation schema
const grantSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  funder: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(2000).required(),
  amount: Joi.string().pattern(/^[\d,.$\s]+$/).optional(),
  deadline: Joi.date().iso().min('now').optional(),
  status: Joi.string().valid('potential', 'drafting', 'submitted', 'successful', 'unsuccessful').optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  source_url: Joi.string().uri().optional(),
  added_by: Joi.string().max(100).optional()
});

// Task validation schema
const taskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  category: Joi.string().valid('Business', 'Team', 'Company', 'Submission', 'First Nations', 'Diversity').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional(),
  assigned_to: Joi.string().max(100).optional(),
  due_date: Joi.date().iso().optional(),
  grant_id: Joi.string().optional()
});

// User validation schema
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('admin', 'manager', 'collaborator', 'viewer').optional()
});

// Login validation schema
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

// Sanitization helpers
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = sanitizeInput(value);
    }
  }
  return sanitized;
};

// Sanitization middleware
const sanitize = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};

module.exports = {
  validate,
  sanitize,
  schemas: {
    grant: grantSchema,
    task: taskSchema,
    user: userSchema,
    login: loginSchema
  }
};
