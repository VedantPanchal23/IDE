import { BrowserEventEmitter } from '../events/BrowserEventEmitter.js';

/**
 * JavaScript Execution Service - Enhanced with Full Debugging Support
 * Provides code execution, step debugging, variable inspection, and breakpoint management
 */
export class JavaScriptExecutionService extends BrowserEventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.isDebugging = false;
    this.isPaused = false;
    this.currentExecution = null;
    this.breakpoints = new Map(); // Changed to Map for better breakpoint management
    this.watchedVariables = new Map();
    this.consoleOutput = [];
    this.isInitialized = false;
    
    // Enhanced debugging state
    this.debugSession = null;
    this.callStack = [];
    this.currentFrame = 0;
    this.variables = {};
    this.stepMode = null; // 'over', 'into', 'out', null
    this.executionContext = null;
    this.sourceMap = new Map(); // Map line numbers to code
    this.currentLine = null;
    this.executionState = 'stopped'; // 'stopped', 'running', 'paused', 'stepping'
    this.variableWatchers = new Set();
    this.frameStack = [];
    this.globalScope = {};
    this.localScopes = new Map();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    // Override console methods to capture output
    this.setupConsoleCapture();
    
    this.isInitialized = true;
    this.emit('initialized');
  }

  setupConsoleCapture() {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    const createCaptureMethod = (type, original) => {
      return (...args) => {
        // Call original method
        original.apply(console, args);
        
        // Capture output
        const output = {
          type,
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: new Date().toISOString()
        };
        
        this.consoleOutput.push(output);
        this.emit('consoleOutput', output);
      };
    };

    console.log = createCaptureMethod('log', originalConsole.log);
    console.error = createCaptureMethod('error', originalConsole.error);
    console.warn = createCaptureMethod('warn', originalConsole.warn);
    console.info = createCaptureMethod('info', originalConsole.info);
  }

  async executeCode(code, options = {}) {
    if (this.isRunning) {
      throw new Error('Code is already running');
    }

    const { debug = false, timeout = 10000 } = options;
    
    this.isRunning = true;
    this.consoleOutput = [];
    
    this.emit('executionStarted', { code, debug });
    
    try {
      let result;
      
      if (debug) {
        result = await this.executeWithDebugger(code, timeout);
      } else {
        result = await this.executeSimple(code, timeout);
      }
      
      this.emit('executionCompleted', { result, output: this.consoleOutput });
      return result;
      
    } catch (error) {
      this.emit('executionError', { error: error.message, output: this.consoleOutput });
      throw error;
    } finally {
      this.isRunning = false;
      this.currentExecution = null;
    }
  }

  async executeSimple(code, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeout}ms`));
      }, timeout);

      try {
        // Create a new function to execute the code in isolated scope
        const wrappedCode = `
          (async function() {
            ${code}
          })()
        `;
        
        const result = eval(wrappedCode);
        
        // Handle promise results
        if (result && typeof result.then === 'function') {
          result
            .then(res => {
              clearTimeout(timeoutId);
              resolve(res);
            })
            .catch(err => {
              clearTimeout(timeoutId);
              reject(err);
            });
        } else {
          clearTimeout(timeoutId);
          resolve(result);
        }
        
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  async executeWithDebugger(code, timeout) {
    // Simple debugger implementation using eval with breakpoint simulation
    const lines = code.split('\n');
    const debuggableCode = this.instrumentCodeForDebugging(lines);
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Debug execution timed out after ${timeout}ms`));
      }, timeout);

      try {
        // Store execution context
        this.currentExecution = {
          code: debuggableCode,
          breakpoints: Array.from(this.breakpoints),
          variables: {},
          currentLine: 0
        };

        const result = eval(debuggableCode);
        
        if (result && typeof result.then === 'function') {
          result
            .then(res => {
              clearTimeout(timeoutId);
              resolve(res);
            })
            .catch(err => {
              clearTimeout(timeoutId);
              reject(err);
            });
        } else {
          clearTimeout(timeoutId);
          resolve(result);
        }
        
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  instrumentCodeForDebugging(lines) {
    // Enhanced code instrumentation with proper breakpoint handling
    const instrumentedLines = lines.map((line, index) => {
      const lineNumber = index + 1;
      this.sourceMap.set(lineNumber, line);
      
      // Check if there's a breakpoint on this line
      const hasBreakpoint = Array.from(this.breakpoints.values()).some(bp => 
        bp.lineNumber === lineNumber && bp.enabled
      );
      
      if (hasBreakpoint) {
        return `
          // Breakpoint check for line ${lineNumber}
          if (this.shouldBreakAtLine('main.js', ${lineNumber})) {
            this.hitBreakpoint('main.js', ${lineNumber});
            if (this.isPaused) {
              // In a real implementation, this would pause execution
              // For now, we'll continue but emit debug events
            }
          }
          ${line}
        `;
      }
      
      return line;
    });

    return instrumentedLines.join('\n');
  }

  // Legacy method compatibility - redirect to new system
  setBreakpoint(lineNumber) {
    return this.addBreakpoint('main.js', lineNumber);
  }

  removeBreakpoint(lineNumber) {
    const id = `main.js:${lineNumber}`;
    return this.removeBreakpoint(id);
  }

  // Legacy watch variable methods - redirect to new system
  addWatchVariable(name, expression) {
    return this.addWatchExpression(expression || name);
  }

  removeWatchVariable(name) {
    // Find watch expression by name and remove
    for (const [id, watchItem] of this.watchedVariables.entries()) {
      if (watchItem.expression === name) {
        return this.removeWatchExpression(id);
      }
    }
    return false;
  }

  evaluateWatchedVariables() {
    const results = {};
    
    for (const [id, watchItem] of this.watchedVariables.entries()) {
      this.evaluateWatchExpression(watchItem);
      results[watchItem.expression] = {
        value: watchItem.value,
        error: watchItem.error
      };
    }
    
    return results;
  }

  captureVariables() {
    // Enhanced variable capture with scope support
    const variables = {};
    
    try {
      // Capture execution context variables if available
      if (this.executionContext && this.executionContext.scope) {
        Object.assign(variables, this.executionContext.scope);
      }
      
      // Capture global variables that are likely user-defined
      for (const key in window) {
        if (window.hasOwnProperty(key) && 
            typeof window[key] !== 'function' && 
            !key.startsWith('_') &&
            typeof window[key] !== 'undefined' &&
            !['document', 'navigator', 'location', 'history', 'screen'].includes(key)) {
          variables[key] = this.serializeValue(window[key]);
        }
      }
    } catch (error) {
      console.warn('Could not capture variables:', error);
    }
    
    return variables;
  }

  // Enhanced debugging methods
  serializeValue(value, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
      return '[Object]';
    }
    
    if (value === null) return null;
    if (value === undefined) return undefined;
    
    const type = typeof value;
    
    if (type === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }
    
    if (type === 'object') {
      if (Array.isArray(value)) {
        return value.slice(0, 100).map(item => 
          this.serializeValue(item, maxDepth, currentDepth + 1)
        );
      }
      
      const serialized = {};
      const keys = Object.keys(value).slice(0, 50); // Limit properties
      
      for (const key of keys) {
        try {
          serialized[key] = this.serializeValue(value[key], maxDepth, currentDepth + 1);
        } catch (e) {
          serialized[key] = '[Error reading property]';
        }
      }
      
      return serialized;
    }
    
    return value;
  }

  // Enhanced breakpoint management
  addBreakpoint(fileName, lineNumber, condition = null) {
    const id = `${fileName}:${lineNumber}`;
    const breakpoint = {
      id,
      fileName,
      lineNumber,
      condition,
      enabled: true,
      hitCount: 0,
      created: new Date().toISOString()
    };
    
    this.breakpoints.set(id, breakpoint);
    this.emit('breakpointAdded', breakpoint);
    return breakpoint;
  }

  removeBreakpoint(id) {
    const breakpoint = this.breakpoints.get(id);
    if (breakpoint) {
      this.breakpoints.delete(id);
      this.emit('breakpointRemoved', breakpoint);
      return true;
    }
    return false;
  }

  toggleBreakpoint(id) {
    const breakpoint = this.breakpoints.get(id);
    if (breakpoint) {
      breakpoint.enabled = !breakpoint.enabled;
      this.emit('breakpointToggled', breakpoint);
      return breakpoint;
    }
    return null;
  }

  clearAllBreakpoints() {
    const breakpoints = Array.from(this.breakpoints.values());
    this.breakpoints.clear();
    this.emit('allBreakpointsCleared', breakpoints);
  }

  getBreakpoints() {
    return Array.from(this.breakpoints.values());
  }

  // Enhanced watch expressions
  addWatchExpression(expression) {
    const id = `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const watchItem = {
      id,
      expression,
      value: undefined,
      error: null,
      created: new Date().toISOString()
    };
    
    this.watchedVariables.set(id, watchItem);
    this.evaluateWatchExpression(watchItem);
    this.emit('watchExpressionAdded', watchItem);
    return watchItem;
  }

  removeWatchExpression(id) {
    const watchItem = this.watchedVariables.get(id);
    if (watchItem) {
      this.watchedVariables.delete(id);
      this.emit('watchExpressionRemoved', watchItem);
      return true;
    }
    return false;
  }

  updateWatchExpression(id, newExpression) {
    const watchItem = this.watchedVariables.get(id);
    if (watchItem) {
      watchItem.expression = newExpression;
      this.evaluateWatchExpression(watchItem);
      this.emit('watchExpressionUpdated', watchItem);
      return watchItem;
    }
    return null;
  }

  evaluateWatchExpression(watchItem) {
    try {
      // Create a safe evaluation context
      const context = { ...this.variables, ...this.captureVariables() };
      const result = this.safeEvaluate(watchItem.expression, context);
      watchItem.value = this.serializeValue(result);
      watchItem.error = null;
    } catch (error) {
      watchItem.value = undefined;
      watchItem.error = error.message;
    }
    return watchItem;
  }

  refreshAllWatchExpressions() {
    for (const watchItem of this.watchedVariables.values()) {
      this.evaluateWatchExpression(watchItem);
    }
    this.emit('watchExpressionsRefreshed', Array.from(this.watchedVariables.values()));
  }

  safeEvaluate(expression, context = {}) {
    // Create a function with the context as parameters
    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);
    
    try {
      const func = new Function(...contextKeys, `return (${expression})`);
      return func(...contextValues);
    } catch (error) {
      // Fallback to simple eval if context approach fails
      return eval(expression);
    }
  }

  // Step debugging implementation
  stepOver() {
    if (!this.isDebugging || !this.isPaused) {
      throw new Error('Not in a debug session or not paused');
    }
    
    this.stepMode = 'over';
    this.executionState = 'stepping';
    this.isPaused = false;
    
    // Simulate stepping to next line
    if (this.currentLine) {
      const nextLine = this.currentLine.lineNumber + 1;
      setTimeout(() => {
        this.pauseAtBreakpoint(this.currentLine.fileName, nextLine, 'step');
      }, 100);
    }
    
    this.emit('stepOver');
    this.captureExecutionState();
  }

  stepInto() {
    if (!this.isDebugging || !this.isPaused) {
      throw new Error('Not in a debug session or not paused');
    }
    
    this.stepMode = 'into';
    this.executionState = 'stepping';
    this.isPaused = false;
    
    // Simulate stepping into function (for demo, same as step over)
    if (this.currentLine) {
      const nextLine = this.currentLine.lineNumber + 1;
      setTimeout(() => {
        // Add a new call stack frame for step into
        this.callStack.unshift({
          functionName: 'innerFunction',
          fileName: this.currentLine.fileName,
          lineNumber: nextLine,
          columnNumber: 1,
          lineContent: `  // Stepped into function at line ${nextLine}`
        });
        this.pauseAtBreakpoint(this.currentLine.fileName, nextLine, 'step');
      }, 100);
    }
    
    this.emit('stepInto');
    this.captureExecutionState();
  }

  stepOut() {
    if (!this.isDebugging || !this.isPaused) {
      throw new Error('Not in a debug session or not paused');
    }
    
    this.stepMode = 'out';
    this.executionState = 'stepping';
    this.isPaused = false;
    
    // Simulate stepping out of function
    if (this.callStack.length > 1) {
      // Remove current frame
      this.callStack.shift();
      const parentFrame = this.callStack[0];
      
      setTimeout(() => {
        this.pauseAtBreakpoint(parentFrame.fileName, parentFrame.lineNumber + 1, 'step');
      }, 100);
    } else if (this.currentLine) {
      // No parent frame, just step to next line
      const nextLine = this.currentLine.lineNumber + 1;
      setTimeout(() => {
        this.pauseAtBreakpoint(this.currentLine.fileName, nextLine, 'step');
      }, 100);
    }
    
    this.emit('stepOut');
    this.captureExecutionState();
  }

  continue() {
    if (!this.isDebugging || !this.isPaused) {
      throw new Error('Not in a debug session or not paused');
    }
    
    this.stepMode = null;
    this.isPaused = false;
    this.executionState = 'running';
    
    this.emit('continue');
    this.resumeExecution();
    this.captureExecutionState();
  }

  pause() {
    if (!this.isDebugging) {
      throw new Error('Not in a debug session');
    }
    
    this.isPaused = true;
    this.executionState = 'paused';
    
    // Simulate pausing at current line
    if (this.currentLine) {
      this.pauseAtBreakpoint(this.currentLine.fileName, this.currentLine.lineNumber, 'manual pause');
    } else {
      this.emit('paused', {
        variables: this.captureVariables(),
        callStack: this.callStack,
        currentFrame: this.currentFrame
      });
    }
    
    this.captureExecutionState();
  }

  continueExecution() {
    // This would be implemented with the actual execution engine
    // For now, we emit events to notify the UI
    this.emit('executionContinued');
  }

  // Debug session management
  startDebugSession(fileName = 'main.js') {
    this.debugSession = {
      id: `debug_${Date.now()}`,
      fileName,
      started: new Date().toISOString(),
      status: 'active'
    };
    
    this.isDebugging = true;
    this.isPaused = false;
    this.callStack = [];
    this.currentFrame = 0;
    this.variables = {};
    
    this.emit('debugSessionStarted', this.debugSession);
    return this.debugSession;
  }

  stopDebugSession() {
    if (this.debugSession) {
      this.debugSession.status = 'stopped';
      this.debugSession.ended = new Date().toISOString();
      
      this.isDebugging = false;
      this.isPaused = false;
      this.stepMode = null;
      this.callStack = [];
      this.currentFrame = 0;
      this.variables = {};
      this.executionContext = null;
      
      this.emit('debugSessionStopped', this.debugSession);
      this.debugSession = null;
    }
  }

  isInDebugSession() {
    return this.isDebugging && this.debugSession !== null;
  }

  // Call stack management
  updateCallStack(stack) {
    this.callStack = stack.map((frame, index) => ({
      id: index,
      functionName: frame.functionName || '<anonymous>',
      fileName: frame.fileName || 'unknown',
      lineNumber: frame.lineNumber || 0,
      columnNumber: frame.columnNumber || 0,
      source: frame.source || ''
    }));
    
    this.emit('callStackUpdated', this.callStack);
  }

  selectCallStackFrame(frameIndex) {
    if (frameIndex >= 0 && frameIndex < this.callStack.length) {
      this.currentFrame = frameIndex;
      this.emit('callStackFrameSelected', {
        frame: this.callStack[frameIndex],
        index: frameIndex
      });
    }
  }

  // Enhanced variable inspection
  getAllVariables() {
    return this.captureVariables();
  }

  getVariableValue(name) {
    const variables = this.captureVariables();
    return variables[name];
  }

  // Real-time debugging methods
  captureExecutionState() {
    const state = {
      isDebugging: this.isDebugging,
      isPaused: this.isPaused,
      executionState: this.executionState,
      currentLine: this.currentLine,
      callStack: this.callStack,
      variables: this.captureVariables(),
      watchExpressions: this.evaluateAllWatchExpressions(),
      breakpoints: Array.from(this.breakpoints.values())
    };
    
    this.emit('executionStateChanged', state);
    return state;
  }

  updateExecutionLine(fileName, lineNumber) {
    this.currentLine = { fileName, lineNumber };
    this.emit('executionLineChanged', this.currentLine);
    
    // Update call stack with current position
    if (this.callStack.length > 0) {
      this.callStack[0] = {
        ...this.callStack[0],
        lineNumber,
        columnNumber: 1
      };
    }
    
    this.captureExecutionState();
  }

  pauseAtBreakpoint(fileName, lineNumber, reason = 'breakpoint') {
    this.isPaused = true;
    this.executionState = 'paused';
    this.updateExecutionLine(fileName, lineNumber);
    
    // Capture variables at pause point
    this.variables = this.captureVariables();
    
    this.emit('debugPaused', {
      reason,
      location: { fileName, lineNumber },
      callStack: this.callStack,
      variables: this.variables
    });
    
    return this.captureExecutionState();
  }

  resumeExecution() {
    this.isPaused = false;
    this.executionState = 'running';
    this.stepMode = null;
    
    this.emit('debugResumed');
    this.captureExecutionState();
  }

  evaluateAllWatchExpressions() {
    const results = [];
    for (const [id, watchItem] of this.watchedVariables.entries()) {
      const result = this.evaluateWatchExpression(watchItem.expression);
      results.push({
        id,
        expression: watchItem.expression,
        value: result.value,
        error: result.error
      });
    }
    return results;
  }

  executeWithDebugging(code, fileName = 'debug-session.js') {
    if (!this.isDebugging) {
      throw new Error('Debug session not active');
    }

    try {
      this.executionState = 'running';
      this.emit('debugStarted', { fileName });
      
      // Parse code into lines for breakpoint checking
      const lines = code.split('\n');
      this.sourceMap.set(fileName, lines);
      
      // Simulate line-by-line execution with breakpoint checking
      for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
        // Check if we should break at this line
        if (this.shouldBreakAtLine(fileName, lineNumber)) {
          this.pauseAtBreakpoint(fileName, lineNumber);
          return { paused: true, lineNumber, fileName };
        }
        
        // Update current execution line
        this.updateExecutionLine(fileName, lineNumber);
        
        // If stepping, pause after each line
        if (this.stepMode === 'over') {
          this.pauseAtBreakpoint(fileName, lineNumber, 'step');
          this.stepMode = null;
          return { paused: true, lineNumber, fileName };
        }
      }
      
      // Execution completed
      this.executionState = 'stopped';
      this.emit('debugCompleted', { fileName });
      return { completed: true };
      
    } catch (error) {
      this.executionState = 'stopped';
      this.emit('debugError', { error: error.message, fileName });
      throw error;
    }
  }

  // Utility methods
  shouldBreakAtLine(fileName, lineNumber) {
    const breakpointId = `${fileName}:${lineNumber}`;
    const breakpoint = this.breakpoints.get(breakpointId);
    
    if (!breakpoint || !breakpoint.enabled) {
      return false;
    }
    
    // Check condition if present
    if (breakpoint.condition) {
      try {
        const shouldBreak = this.safeEvaluate(breakpoint.condition, this.captureVariables());
        return Boolean(shouldBreak);
      } catch (error) {
        console.warn(`Breakpoint condition error: ${error.message}`);
        return true; // Break on condition error
      }
    }
    
    return true;
  }

  hitBreakpoint(fileName, lineNumber) {
    const breakpointId = `${fileName}:${lineNumber}`;
    const breakpoint = this.breakpoints.get(breakpointId);
    
    if (breakpoint) {
      breakpoint.hitCount++;
      this.isPaused = true;
      
      this.emit('breakpointHit', {
        breakpoint,
        variables: this.captureVariables(),
        callStack: this.callStack,
        currentFrame: this.currentFrame
      });
    }
  }

  stopExecution() {
    if (this.isRunning) {
      this.isRunning = false;
      this.currentExecution = null;
      this.emit('executionStopped');
    }
  }

  getConsoleOutput() {
    return [...this.consoleOutput];
  }

  clearConsoleOutput() {
    this.consoleOutput = [];
    this.emit('consoleCleared');
  }

  // Node.js simulation for basic modules
  createNodeEnvironment() {
    if (typeof window !== 'undefined') {
      // Create basic Node.js-like environment in browser
      window.require = (moduleName) => {
        const modules = {
          'fs': {
            readFileSync: () => { throw new Error('File system not available in browser'); },
            writeFileSync: () => { throw new Error('File system not available in browser'); }
          },
          'path': {
            join: (...paths) => paths.join('/'),
            dirname: (path) => path.split('/').slice(0, -1).join('/'),
            basename: (path) => path.split('/').pop()
          },
          'os': {
            platform: () => 'browser',
            arch: () => 'javascript'
          }
        };
        
        if (modules[moduleName]) {
          return modules[moduleName];
        }
        
        throw new Error(`Module '${moduleName}' not found`);
      };

      window.module = { exports: {} };
      window.exports = window.module.exports;
      
      window.process = {
        env: { NODE_ENV: 'development' },
        argv: ['node', 'script.js'],
        exit: (code = 0) => console.log(`Process exited with code ${code}`)
      };
    }
  }

  validateJavaScript(code) {
    try {
      new Function(code);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message,
        line: this.extractLineFromError(error)
      };
    }
  }

  extractLineFromError(error) {
    const match = error.message.match(/line (\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  formatError(error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      line: this.extractLineFromError(error)
    };
  }

  dispose() {
    this.stopExecution();
    this.clearAllBreakpoints();
    this.watchedVariables.clear();
    this.consoleOutput = [];
    this.removeAllListeners();
  }
}

// Export singleton instance
export default new JavaScriptExecutionService();
