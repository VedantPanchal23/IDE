/**
 * Client-side Code Execution Service
 * Handles browser-based code execution for Python (Pyodide), HTML/CSS rendering
 */
class ClientExecutionService {
  constructor() {
    this.pyodideLoaded = false;
    this.pyodide = null;
    this.loadingPyodide = false;
    this.executionHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Execute code on client side
   */
  async executeCode(language, code, input = '', options = {}) {
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (language.toLowerCase()) {
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
          throw new Error(`Client-side execution not supported for: ${language}`);
      }
      
      const executionTime = Date.now() - startTime;
      
      const executionResult = {
        success: true,
        output: result.output || '',
        error: result.error || null,
        executionTime: `${executionTime}ms`,
        language: language,
        timestamp: new Date().toISOString(),
        executedOnClient: true,
        renderType: result.renderType || null
      };
      
      this.addToHistory(executionResult);
      return executionResult;
      
    } catch (error) {
      const errorResult = {
        success: false,
        output: '',
        error: error.message,
        executionTime: `${Date.now() - startTime}ms`,
        language: language,
        timestamp: new Date().toISOString(),
        executedOnClient: true
      };
      
      this.addToHistory(errorResult);
      return errorResult;
    }
  }

  /**
   * Execute Python code using Pyodide
   */
  async executePython(code, input = '', options = {}) {
    try {
      // Load Pyodide if not already loaded
      if (!this.pyodideLoaded) {
        await this.loadPyodide();
      }
      
      const output = [];
      const errors = [];
      
      // Redirect stdout and stderr
      this.pyodide.runPython(`
import sys
from io import StringIO
import contextlib

# Create string buffers for output capture
stdout_buffer = StringIO()
stderr_buffer = StringIO()

# Context manager for capturing output
@contextlib.contextmanager
def capture_output():
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    try:
        sys.stdout = stdout_buffer
        sys.stderr = stderr_buffer
        yield
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
      `);
      
      // Set input if provided
      if (input) {
        this.pyodide.runPython(`
import builtins
input_lines = """${input.replace(/"/g, '\\"')}""".split('\\n')
input_index = 0

def mock_input(prompt=''):
    global input_index
    if input_index < len(input_lines):
        line = input_lines[input_index]
        input_index += 1
        print(prompt + line)
        return line
    return ''

builtins.input = mock_input
        `);
      }
      
      // Execute the user code with output capture
      try {
        const result = this.pyodide.runPython(`
with capture_output():
    exec("""${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}""")

# Get captured output
stdout_content = stdout_buffer.getvalue()
stderr_content = stderr_buffer.getvalue()

# Return as tuple
(stdout_content, stderr_content)
        `);
        
        const [stdout, stderr] = result.toJs();
        
        return {
          output: stdout || '',
          error: stderr || null
        };
        
      } catch (pythonError) {
        return {
          output: '',
          error: pythonError.message
        };
      }
      
    } catch (error) {
      throw new Error(`Python execution failed: ${error.message}`);
    }
  }

  /**
   * Execute HTML code
   */
  async executeHTML(code, options = {}) {
    try {
      // Create iframe for safe HTML execution
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '400px';
      iframe.style.border = '1px solid #ccc';
      iframe.style.borderRadius = '4px';
      iframe.sandbox = 'allow-scripts allow-same-origin';
      
      // Write HTML content to iframe
      iframe.onload = () => {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(code);
        doc.close();
      };
      
      return {
        output: iframe.outerHTML,
        error: null,
        renderType: 'iframe'
      };
      
    } catch (error) {
      throw new Error(`HTML execution failed: ${error.message}`);
    }
  }

  /**
   * Execute CSS code
   */
  async executeCSS(code, options = {}) {
    try {
      // Create style element
      const style = document.createElement('style');
      style.textContent = code;
      
      // Create preview container
      const preview = document.createElement('div');
      preview.innerHTML = `
        <div style="padding: 20px; border: 1px solid #ccc; border-radius: 4px; background: white;">
          <h3>CSS Preview</h3>
          <div class="css-preview-content">
            <div class="example-element">Example Element</div>
            <button class="example-button">Example Button</button>
            <p class="example-text">Example paragraph with some text.</p>
          </div>
        </div>
      `;
      
      preview.appendChild(style);
      
      return {
        output: preview.outerHTML,
        error: null,
        renderType: 'html'
      };
      
    } catch (error) {
      throw new Error(`CSS execution failed: ${error.message}`);
    }
  }

  /**
   * Execute JSX code (placeholder - needs Babel)
   */
  async executeJSX(code, input = '', options = {}) {
    try {
      // This would require Babel for transpilation
      // For now, return a placeholder
      return {
        output: 'JSX execution requires Babel transpilation (coming soon)',
        error: null,
        renderType: 'text'
      };
    } catch (error) {
      throw new Error(`JSX execution failed: ${error.message}`);
    }
  }

  /**
   * Execute TSX code (placeholder - needs TypeScript + Babel)
   */
  async executeTSX(code, input = '', options = {}) {
    try {
      // This would require TypeScript + Babel for transpilation
      // For now, return a placeholder
      return {
        output: 'TSX execution requires TypeScript + Babel transpilation (coming soon)',
        error: null,
        renderType: 'text'
      };
    } catch (error) {
      throw new Error(`TSX execution failed: ${error.message}`);
    }
  }

  /**
   * Load Pyodide for Python execution
   */
  async loadPyodide() {
    if (this.loadingPyodide) {
      // Wait for current loading to complete
      while (this.loadingPyodide && !this.pyodideLoaded) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }
    
    if (this.pyodideLoaded) {
      return;
    }
    
    this.loadingPyodide = true;
    
    try {
      // Load Pyodide from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      
      // Initialize Pyodide
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });
      
      // Install common packages
      await this.pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);
      
      this.pyodideLoaded = true;
      console.log('Pyodide loaded successfully');
      
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      throw new Error('Failed to initialize Python environment');
    } finally {
      this.loadingPyodide = false;
    }
  }

  /**
   * Check if Pyodide is available
   */
  isPyodideLoaded() {
    return this.pyodideLoaded;
  }

  /**
   * Add execution result to history
   */
  addToHistory(result) {
    this.executionHistory.unshift(result);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get execution history
   */
  getHistory() {
    return this.executionHistory;
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.executionHistory = [];
  }

  /**
   * Get supported client-side languages
   */
  getSupportedLanguages() {
    return [
      {
        id: 'python',
        name: 'Python',
        ready: this.pyodideLoaded,
        loading: this.loadingPyodide
      },
      {
        id: 'html',
        name: 'HTML',
        ready: true,
        loading: false
      },
      {
        id: 'css',
        name: 'CSS',
        ready: true,
        loading: false
      },
      {
        id: 'jsx',
        name: 'JSX',
        ready: false,
        loading: false
      },
      {
        id: 'tsx',
        name: 'TSX',
        ready: false,
        loading: false
      }
    ];
  }
}

export default ClientExecutionService;
