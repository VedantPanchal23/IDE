const { VM } = require('vm2');
const axios = require('axios');

/**
 * Code Execution Service - Handles multi-language code execution
 * Supports: JavaScript, Python (via Pyodide), HTML/CSS, TypeScript
 * Uses secure sandboxing and rate limiting
 */
class CodeExecutionService {
  constructor() {
    this.supportedLanguages = [
      'javascript', 'typescript', 'python', 'html', 'css', 'jsx', 'tsx'
    ];
    
    // Execution timeouts (in milliseconds)
    this.timeouts = {
      javascript: 5000,
      typescript: 5000,
      python: 10000,
      html: 3000,
      css: 1000,
      jsx: 5000,
      tsx: 5000
    };

    // Security settings
    this.maxCodeLength = 50000; // 50KB max
    this.maxMemoryUsage = 128 * 1024 * 1024; // 128MB
  }

  /**
   * Execute code based on language
   */
  async executeCode(language, code, input = '', options = {}) {
    try {
      // Validate inputs
      this.validateExecution(language, code);
      
      const startTime = Date.now();
      let result;

      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          result = await this.executeJavaScript(code, input, options);
          break;
          
        case 'typescript':
        case 'ts':
          result = await this.executeTypeScript(code, input, options);
          break;
          
        case 'python':
        case 'py':
          result = await this.executePython(code, input, options);
          break;
          
        case 'html':
          result = await this.executeHTML(code, options);
          break;
          
        case 'css':
          result = await this.executeCSS(code, options);
          break;
          
        case 'jsx':
          result = await this.executeJSX(code, input, options);
          break;
          
        case 'tsx':
          result = await this.executeTSX(code, input, options);
          break;
          
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        output: result.output || '',
        error: result.error || null,
        executionTime: `${executionTime}ms`,
        memoryUsage: result.memoryUsage || 'N/A',
        language: language,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime: '0ms',
        memoryUsage: 'N/A',
        language: language,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute JavaScript code in secure VM
   */
  async executeJavaScript(code, input = '', options = {}) {
    return new Promise((resolve, reject) => {
      const output = [];
      const errors = [];
      
      try {
        const vm = new VM({
          timeout: this.timeouts.javascript,
          sandbox: {
            console: {
              log: (...args) => output.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ')),
              error: (...args) => errors.push(args.join(' ')),
              warn: (...args) => output.push('⚠️ ' + args.join(' ')),
              info: (...args) => output.push('ℹ️ ' + args.join(' '))
            },
            input: input,
            setTimeout: setTimeout,
            setInterval: setInterval,
            clearTimeout: clearTimeout,
            clearInterval: clearInterval,
            Math: Math,
            Date: Date,
            JSON: JSON,
            Array: Array,
            Object: Object,
            String: String,
            Number: Number,
            Boolean: Boolean,
            RegExp: RegExp
          }
        });

        const result = vm.run(code);
        
        // Format the result properly
        let resultOutput = output.join('\n');
        if (result !== undefined) {
          let formattedResult;
          if (typeof result === 'object') {
            formattedResult = JSON.stringify(result, null, 2);
          } else {
            formattedResult = String(result);
          }
          resultOutput += (resultOutput ? '\n' : '') + formattedResult;
        }
        
        resolve({
          output: resultOutput,
          error: errors.length > 0 ? errors.join('\n') : null,
          memoryUsage: 'N/A'
        });
        
      } catch (error) {
        resolve({
          output: output.join('\n'),
          error: error.message,
          memoryUsage: 'N/A'
        });
      }
    });
  }

  /**
   * Execute TypeScript code (transpile then execute)
   */
  async executeTypeScript(code, input = '', options = {}) {
    try {
      // For now, we'll execute as JavaScript (in a real implementation, we'd transpile)
      // TODO: Add TypeScript transpilation using esbuild or similar
      const jsCode = code; // Placeholder - needs actual transpilation
      return await this.executeJavaScript(jsCode, input, options);
    } catch (error) {
      return {
        output: '',
        error: `TypeScript execution error: ${error.message}`,
        memoryUsage: 'N/A'
      };
    }
  }

  /**
   * Execute Python code (placeholder for Pyodide integration)
   */
  async executePython(code, input = '', options = {}) {
    // This will be handled by frontend Pyodide integration
    // Backend returns instructions for frontend execution
    return {
      output: '',
      error: null,
      memoryUsage: 'N/A',
      executeOnClient: true,
      clientEngine: 'pyodide',
      code: code,
      input: input
    };
  }

  /**
   * Execute HTML code
   */
  async executeHTML(code, options = {}) {
    try {
      // Validate HTML and return for client-side rendering
      const htmlContent = this.validateHTML(code);
      
      return {
        output: htmlContent,
        error: null,
        memoryUsage: 'N/A',
        renderType: 'html',
        executeOnClient: true
      };
    } catch (error) {
      return {
        output: '',
        error: `HTML validation error: ${error.message}`,
        memoryUsage: 'N/A'
      };
    }
  }

  /**
   * Execute CSS code
   */
  async executeCSS(code, options = {}) {
    try {
      // Validate CSS and return for client-side application
      const cssContent = this.validateCSS(code);
      
      return {
        output: cssContent,
        error: null,
        memoryUsage: 'N/A',
        renderType: 'css',
        executeOnClient: true
      };
    } catch (error) {
      return {
        output: '',
        error: `CSS validation error: ${error.message}`,
        memoryUsage: 'N/A'
      };
    }
  }

  /**
   * Execute JSX code
   */
  async executeJSX(code, input = '', options = {}) {
    // JSX needs transpilation - placeholder for Babel integration
    return {
      output: '',
      error: null,
      memoryUsage: 'N/A',
      executeOnClient: true,
      clientEngine: 'babel',
      code: code,
      input: input
    };
  }

  /**
   * Execute TSX code
   */
  async executeTSX(code, input = '', options = {}) {
    // TSX needs TypeScript + JSX transpilation
    return {
      output: '',
      error: null,
      memoryUsage: 'N/A',
      executeOnClient: true,
      clientEngine: 'typescript-babel',
      code: code,
      input: input
    };
  }

  /**
   * Validate execution parameters
   */
  validateExecution(language, code) {
    if (!this.supportedLanguages.includes(language.toLowerCase())) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    if (!code || typeof code !== 'string') {
      throw new Error('Code must be a non-empty string');
    }
    
    if (code.length > this.maxCodeLength) {
      throw new Error(`Code too long. Maximum ${this.maxCodeLength} characters allowed`);
    }
    
    // Security checks
    this.performSecurityChecks(code, language);
  }

  /**
   * Perform security checks on code
   */
  performSecurityChecks(code, language) {
    const dangerousPatterns = [
      /require\s*\(\s*['"`]fs['"`]\s*\)/gi,
      /require\s*\(\s*['"`]child_process['"`]\s*\)/gi,
      /require\s*\(\s*['"`]os['"`]\s*\)/gi,
      /require\s*\(\s*['"`]path['"`]\s*\)/gi,
      /process\s*\.\s*exit/gi,
      /process\s*\.\s*kill/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /import\s+.*\s+from\s+['"`]fs['"`]/gi,
      /import\s+.*\s+from\s+['"`]child_process['"`]/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error('Code contains potentially dangerous operations');
      }
    }
  }

  /**
   * Validate HTML content
   */
  validateHTML(html) {
    // Basic HTML validation and sanitization
    // Remove script tags for security
    const cleanHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    return cleanHTML;
  }

  /**
   * Validate CSS content
   */
  validateCSS(css) {
    // Basic CSS validation
    // Remove @import and url() for security
    const cleanCSS = css
      .replace(/@import\s+[^;]+;/gi, '')
      .replace(/url\s*\([^)]*\)/gi, '');
    return cleanCSS;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages.map(lang => ({
      id: lang,
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      extensions: this.getLanguageExtensions(lang),
      supportsInput: ['javascript', 'typescript', 'python', 'jsx', 'tsx'].includes(lang),
      executionMode: ['html', 'css', 'python', 'jsx', 'tsx'].includes(lang) ? 'client' : 'server'
    }));
  }

  /**
   * Get file extensions for language
   */
  getLanguageExtensions(language) {
    const extensions = {
      javascript: ['.js'],
      typescript: ['.ts'],
      python: ['.py'],
      html: ['.html', '.htm'],
      css: ['.css'],
      jsx: ['.jsx'],
      tsx: ['.tsx']
    };
    
    return extensions[language] || [];
  }
}

module.exports = CodeExecutionService;
