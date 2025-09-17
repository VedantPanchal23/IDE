const express = require('express');
const CodeExecutionService = require('../services/CodeExecutionService');
const router = express.Router();

// Initialize code execution service
const codeExecutionService = new CodeExecutionService();

/**
 * POST /api/execute
 * Execute code in specified language
 */
router.post('/execute', async (req, res) => {
  try {
    const { language, code, input = '', options = {} } = req.body;
    
    // Validate request
    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: 'Language and code are required'
      });
    }
    
    // Execute code
    const result = await codeExecutionService.executeCode(language, code, input, options);
    
    res.json(result);
    
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during code execution',
      details: error.message
    });
  }
});

/**
 * GET /api/execute/languages
 * Get list of supported languages
 */
router.get('/languages', (req, res) => {
  try {
    const languages = codeExecutionService.getSupportedLanguages();
    res.json({
      success: true,
      languages: languages
    });
  } catch (error) {
    console.error('Error getting languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported languages'
    });
  }
});

/**
 * POST /api/execute/validate
 * Validate code without executing
 */
router.post('/validate', async (req, res) => {
  try {
    const { language, code } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: 'Language and code are required'
      });
    }
    
    // Perform validation checks
    try {
      codeExecutionService.validateExecution(language, code);
      res.json({
        success: true,
        valid: true,
        message: 'Code validation passed'
      });
    } catch (validationError) {
      res.json({
        success: true,
        valid: false,
        error: validationError.message
      });
    }
    
  } catch (error) {
    console.error('Code validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during validation'
    });
  }
});

/**
 * GET /api/execute/status
 * Get execution service status
 */
router.get('/status', (req, res) => {
  try {
    const supportedLanguages = codeExecutionService.getSupportedLanguages();
    
    res.json({
      success: true,
      status: 'operational',
      supportedLanguages: supportedLanguages.length,
      languages: supportedLanguages.map(lang => lang.id),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting execution status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get execution status'
    });
  }
});

module.exports = router;
