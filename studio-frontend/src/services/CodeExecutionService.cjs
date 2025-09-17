const { spawn, exec } = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')

class CodeExecutionService {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'vscode-studio-temp')
    this.ensureTempDir()
  }

  async ensureTempDir() {
    try {
      await fs.ensureDir(this.tempDir)
    } catch (error) {
      console.error('Failed to create temp directory:', error)
    }
  }

  async executeCode(code, language, input = '') {
    try {
      const result = await this.runCode(code, language, input)
      return result
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime: 0
      }
    }
  }

  async executeProject(projectType, files = {}) {
    try {
      const result = await this.runProject(projectType, files)
      return result
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime: 0
      }
    }
  }

  async runProject(projectType, files) {
    const startTime = Date.now()
    
    switch (projectType.toLowerCase()) {
      case 'react':
      case 'vite':
        return await this.runReactProject(files, startTime)
      
      case 'node':
      case 'nodejs':
        return await this.runNodeProject(files, startTime)
      
      case 'html':
      case 'web':
        return await this.runHtmlProject(files, startTime)
      
      case 'python':
        return await this.runPythonProject(files, startTime)
      
      default:
        throw new Error(`Unsupported project type: ${projectType}`)
    }
  }

  async runCode(code, language, input) {
    const startTime = Date.now()
    
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return await this.runJavaScript(code, input, startTime)
      
      case 'python':
      case 'py':
        return await this.runPython(code, input, startTime)
      
      case 'java':
        return await this.runJava(code, input, startTime)
      
      case 'cpp':
      case 'c++':
        return await this.runCpp(code, input, startTime)
      
      case 'c':
        return await this.runC(code, input, startTime)
      
      case 'go':
        return await this.runGo(code, input, startTime)
      
      case 'rust':
        return await this.runRust(code, input, startTime)
      
      case 'php':
        return await this.runPhp(code, input, startTime)
      
      case 'ruby':
        return await this.runRuby(code, input, startTime)
      
      case 'shell':
      case 'bash':
        return await this.runShell(code, input, startTime)
      
      case 'powershell':
        return await this.runPowerShell(code, input, startTime)
      
      default:
        throw new Error(`Language ${language} is not supported`)
    }
  }

  async runJavaScript(code, input, startTime) {
    const filename = path.join(this.tempDir, `temp_${Date.now()}.js`)
    
    // Wrap code to handle input and provide console output
    const wrappedCode = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Mock input data
const inputData = ${JSON.stringify(input.split('\n'))};
let inputIndex = 0;

// Override console methods to capture output
const originalLog = console.log;
const originalError = console.error;
const outputs = [];

console.log = (...args) => {
  outputs.push('OUTPUT: ' + args.join(' '));
  originalLog(...args);
};

console.error = (...args) => {
  outputs.push('ERROR: ' + args.join(' '));
  originalError(...args);
};

// Mock readline for input
const mockReadline = (prompt) => {
  return new Promise((resolve) => {
    if (inputIndex < inputData.length) {
      const input = inputData[inputIndex++];
      console.log(prompt + input);
      resolve(input);
    } else {
      resolve('');
    }
  });
};

// Execute user code
(async () => {
  try {
${code}
  } catch (error) {
    console.error('Runtime Error:', error.message);
  }
})();
`

    await fs.writeFile(filename, wrappedCode)

    return new Promise((resolve) => {
      const child = spawn('node', [filename], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 10000
      })

      let output = ''
      let error = ''

      if (input) {
        child.stdin.write(input)
        child.stdin.end()
      }

      child.stdout.on('data', (data) => {
        output += data.toString()
      })

      child.stderr.on('data', (data) => {
        error += data.toString()
      })

      child.on('close', async (code) => {
        await fs.remove(filename)
        const executionTime = Date.now() - startTime

        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim(),
          executionTime,
          exitCode: code
        })
      })

      child.on('error', async (err) => {
        await fs.remove(filename)
        resolve({
          success: false,
          output: '',
          error: `Execution failed: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runPython(code, input, startTime) {
    const filename = path.join(this.tempDir, `temp_${Date.now()}.py`)
    
    // Add input handling to Python code
    const wrappedCode = `
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

# Mock input data
input_data = ${JSON.stringify(input.split('\n'))}
input_index = 0

def mock_input(prompt=""):
    global input_index
    if input_index < len(input_data):
        value = input_data[input_index]
        input_index += 1
        print(prompt + value)
        return value
    return ""

# Replace built-in input with mock
__builtins__['input'] = mock_input

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Runtime Error: {e}", file=sys.stderr)
`

    await fs.writeFile(filename, wrappedCode)

    return new Promise((resolve) => {
      const child = spawn('python', [filename], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 10000
      })

      let output = ''
      let error = ''

      if (input) {
        child.stdin.write(input)
        child.stdin.end()
      }

      child.stdout.on('data', (data) => {
        output += data.toString()
      })

      child.stderr.on('data', (data) => {
        error += data.toString()
      })

      child.on('close', async (code) => {
        await fs.remove(filename)
        const executionTime = Date.now() - startTime

        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim(),
          executionTime,
          exitCode: code
        })
      })

      child.on('error', async (err) => {
        await fs.remove(filename)
        resolve({
          success: false,
          output: '',
          error: `Python not found or execution failed: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runJava(code, input, startTime) {
    const className = this.extractJavaClassName(code) || 'Main'
    const filename = path.join(this.tempDir, `${className}.java`)
    
    await fs.writeFile(filename, code)

    return new Promise((resolve) => {
      // Compile Java code
      const compileChild = spawn('javac', [filename], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let compileError = ''

      compileChild.stderr.on('data', (data) => {
        compileError += data.toString()
      })

      compileChild.on('close', (compileCode) => {
        if (compileCode !== 0) {
          fs.remove(filename)
          resolve({
            success: false,
            output: '',
            error: `Compilation failed:\n${compileError}`,
            executionTime: Date.now() - startTime
          })
          return
        }

        // Run compiled Java code
        const runChild = spawn('java', ['-cp', this.tempDir, className], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 10000
        })

        let output = ''
        let error = ''

        if (input) {
          runChild.stdin.write(input)
          runChild.stdin.end()
        }

        runChild.stdout.on('data', (data) => {
          output += data.toString()
        })

        runChild.stderr.on('data', (data) => {
          error += data.toString()
        })

        runChild.on('close', async (runCode) => {
          await fs.remove(filename)
          await fs.remove(path.join(this.tempDir, `${className}.class`)).catch(() => {})
          
          const executionTime = Date.now() - startTime

          resolve({
            success: runCode === 0,
            output: output.trim(),
            error: error.trim(),
            executionTime,
            exitCode: runCode
          })
        })

        runChild.on('error', async (err) => {
          await fs.remove(filename)
          await fs.remove(path.join(this.tempDir, `${className}.class`)).catch(() => {})
          resolve({
            success: false,
            output: '',
            error: `Java execution failed: ${err.message}`,
            executionTime: Date.now() - startTime
          })
        })
      })

      compileChild.on('error', async (err) => {
        await fs.remove(filename)
        resolve({
          success: false,
          output: '',
          error: `Java compiler not found: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runCpp(code, input, startTime) {
    const filename = path.join(this.tempDir, `temp_${Date.now()}.cpp`)
    const executable = path.join(this.tempDir, `temp_${Date.now()}.exe`)
    
    await fs.writeFile(filename, code)

    return new Promise((resolve) => {
      // Compile C++ code
      const compileChild = spawn('g++', [filename, '-o', executable], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let compileError = ''

      compileChild.stderr.on('data', (data) => {
        compileError += data.toString()
      })

      compileChild.on('close', (compileCode) => {
        if (compileCode !== 0) {
          fs.remove(filename)
          resolve({
            success: false,
            output: '',
            error: `Compilation failed:\n${compileError}`,
            executionTime: Date.now() - startTime
          })
          return
        }

        // Run compiled executable
        const runChild = spawn(executable, [], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 10000
        })

        let output = ''
        let error = ''

        if (input) {
          runChild.stdin.write(input)
          runChild.stdin.end()
        }

        runChild.stdout.on('data', (data) => {
          output += data.toString()
        })

        runChild.stderr.on('data', (data) => {
          error += data.toString()
        })

        runChild.on('close', async (runCode) => {
          await fs.remove(filename)
          await fs.remove(executable).catch(() => {})
          
          const executionTime = Date.now() - startTime

          resolve({
            success: runCode === 0,
            output: output.trim(),
            error: error.trim(),
            executionTime,
            exitCode: runCode
          })
        })

        runChild.on('error', async (err) => {
          await fs.remove(filename)
          await fs.remove(executable).catch(() => {})
          resolve({
            success: false,
            output: '',
            error: `C++ execution failed: ${err.message}`,
            executionTime: Date.now() - startTime
          })
        })
      })

      compileChild.on('error', async (err) => {
        await fs.remove(filename)
        resolve({
          success: false,
          output: '',
          error: `C++ compiler not found: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runC(code, input, startTime) {
    const filename = path.join(this.tempDir, `temp_${Date.now()}.c`)
    const executable = path.join(this.tempDir, `temp_${Date.now()}.exe`)
    
    await fs.writeFile(filename, code)

    return new Promise((resolve) => {
      // Compile C code
      const compileChild = spawn('gcc', [filename, '-o', executable], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let compileError = ''

      compileChild.stderr.on('data', (data) => {
        compileError += data.toString()
      })

      compileChild.on('close', (compileCode) => {
        if (compileCode !== 0) {
          fs.remove(filename)
          resolve({
            success: false,
            output: '',
            error: `Compilation failed:\n${compileError}`,
            executionTime: Date.now() - startTime
          })
          return
        }

        // Run compiled executable
        const runChild = spawn(executable, [], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 10000
        })

        let output = ''
        let error = ''

        if (input) {
          runChild.stdin.write(input)
          runChild.stdin.end()
        }

        runChild.stdout.on('data', (data) => {
          output += data.toString()
        })

        runChild.stderr.on('data', (data) => {
          error += data.toString()
        })

        runChild.on('close', async (runCode) => {
          await fs.remove(filename)
          await fs.remove(executable).catch(() => {})
          
          const executionTime = Date.now() - startTime

          resolve({
            success: runCode === 0,
            output: output.trim(),
            error: error.trim(),
            executionTime,
            exitCode: runCode
          })
        })

        runChild.on('error', async (err) => {
          await fs.remove(filename)
          await fs.remove(executable).catch(() => {})
          resolve({
            success: false,
            output: '',
            error: `C execution failed: ${err.message}`,
            executionTime: Date.now() - startTime
          })
        })
      })

      compileChild.on('error', async (err) => {
        await fs.remove(filename)
        resolve({
          success: false,
          output: '',
          error: `C compiler not found: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runGo(code, input, startTime) {
    const filename = path.join(this.tempDir, `temp_${Date.now()}.go`)
    
    await fs.writeFile(filename, code)

    return new Promise((resolve) => {
      const child = spawn('go', ['run', filename], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 10000
      })

      let output = ''
      let error = ''

      if (input) {
        child.stdin.write(input)
        child.stdin.end()
      }

      child.stdout.on('data', (data) => {
        output += data.toString()
      })

      child.stderr.on('data', (data) => {
        error += data.toString()
      })

      child.on('close', async (code) => {
        await fs.remove(filename)
        const executionTime = Date.now() - startTime

        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim(),
          executionTime,
          exitCode: code
        })
      })

      child.on('error', async (err) => {
        await fs.remove(filename)
        resolve({
          success: false,
          output: '',
          error: `Go not found or execution failed: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runRust(code, input, startTime) {
    const filename = path.join(this.tempDir, `temp_${Date.now()}.rs`)
    const executable = path.join(this.tempDir, `temp_${Date.now()}.exe`)
    
    await fs.writeFile(filename, code)

    return new Promise((resolve) => {
      // Compile Rust code
      const compileChild = spawn('rustc', [filename, '-o', executable], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let compileError = ''

      compileChild.stderr.on('data', (data) => {
        compileError += data.toString()
      })

      compileChild.on('close', (compileCode) => {
        if (compileCode !== 0) {
          fs.remove(filename)
          resolve({
            success: false,
            output: '',
            error: `Compilation failed:\n${compileError}`,
            executionTime: Date.now() - startTime
          })
          return
        }

        // Run compiled executable
        const runChild = spawn(executable, [], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 10000
        })

        let output = ''
        let error = ''

        if (input) {
          runChild.stdin.write(input)
          runChild.stdin.end()
        }

        runChild.stdout.on('data', (data) => {
          output += data.toString()
        })

        runChild.stderr.on('data', (data) => {
          error += data.toString()
        })

        runChild.on('close', async (runCode) => {
          await fs.remove(filename)
          await fs.remove(executable).catch(() => {})
          
          const executionTime = Date.now() - startTime

          resolve({
            success: runCode === 0,
            output: output.trim(),
            error: error.trim(),
            executionTime,
            exitCode: runCode
          })
        })

        runChild.on('error', async (err) => {
          await fs.remove(filename)
          await fs.remove(executable).catch(() => {})
          resolve({
            success: false,
            output: '',
            error: `Rust execution failed: ${err.message}`,
            executionTime: Date.now() - startTime
          })
        })
      })

      compileChild.on('error', async (err) => {
        await fs.remove(filename)
        resolve({
          success: false,
          output: '',
          error: `Rust compiler not found: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runPhp(code, input, startTime) {
    const filename = path.join(this.tempDir, `temp_${Date.now()}.php`)
    
    await fs.writeFile(filename, code)

    return new Promise((resolve) => {
      const child = spawn('php', [filename], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 10000
      })

      let output = ''
      let error = ''

      if (input) {
        child.stdin.write(input)
        child.stdin.end()
      }

      child.stdout.on('data', (data) => {
        output += data.toString()
      })

      child.stderr.on('data', (data) => {
        error += data.toString()
      })

      child.on('close', async (code) => {
        await fs.remove(filename)
        const executionTime = Date.now() - startTime

        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim(),
          executionTime,
          exitCode: code
        })
      })

      child.on('error', async (err) => {
        await fs.remove(filename)
        resolve({
          success: false,
          output: '',
          error: `PHP not found or execution failed: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runRuby(code, input, startTime) {
    const filename = path.join(this.tempDir, `temp_${Date.now()}.rb`)
    
    await fs.writeFile(filename, code)

    return new Promise((resolve) => {
      const child = spawn('ruby', [filename], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 10000
      })

      let output = ''
      let error = ''

      if (input) {
        child.stdin.write(input)
        child.stdin.end()
      }

      child.stdout.on('data', (data) => {
        output += data.toString()
      })

      child.stderr.on('data', (data) => {
        error += data.toString()
      })

      child.on('close', async (code) => {
        await fs.remove(filename)
        const executionTime = Date.now() - startTime

        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim(),
          executionTime,
          exitCode: code
        })
      })

      child.on('error', async (err) => {
        await fs.remove(filename)
        resolve({
          success: false,
          output: '',
          error: `Ruby not found or execution failed: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runShell(code, input, startTime) {
    return new Promise((resolve) => {
      const child = spawn('bash', ['-c', code], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 10000,
        shell: true
      })

      let output = ''
      let error = ''

      if (input) {
        child.stdin.write(input)
        child.stdin.end()
      }

      child.stdout.on('data', (data) => {
        output += data.toString()
      })

      child.stderr.on('data', (data) => {
        error += data.toString()
      })

      child.on('close', (code) => {
        const executionTime = Date.now() - startTime

        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim(),
          executionTime,
          exitCode: code
        })
      })

      child.on('error', (err) => {
        resolve({
          success: false,
          output: '',
          error: `Shell execution failed: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  async runPowerShell(code, input, startTime) {
    return new Promise((resolve) => {
      const child = spawn('powershell', ['-Command', code], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 10000
      })

      let output = ''
      let error = ''

      if (input) {
        child.stdin.write(input)
        child.stdin.end()
      }

      child.stdout.on('data', (data) => {
        output += data.toString()
      })

      child.stderr.on('data', (data) => {
        error += data.toString()
      })

      child.on('close', (code) => {
        const executionTime = Date.now() - startTime

        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim(),
          executionTime,
          exitCode: code
        })
      })

      child.on('error', (err) => {
        resolve({
          success: false,
          output: '',
          error: `PowerShell execution failed: ${err.message}`,
          executionTime: Date.now() - startTime
        })
      })
    })
  }

  extractJavaClassName(code) {
    const match = code.match(/public\s+class\s+(\w+)/)
    return match ? match[1] : null
  }

  getSupportedLanguages() {
    return [
      'javascript', 'python', 'java', 'cpp', 'c', 'go', 
      'rust', 'php', 'ruby', 'shell', 'powershell'
    ]
  }

  // Project execution methods
  async runReactProject(files, startTime) {
    const projectDir = path.join(this.tempDir, `react-${Date.now()}`)
    await fs.ensureDir(projectDir)

    try {
      // Write project files
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(projectDir, filePath.replace(/^\//, ''))
        await fs.ensureDir(path.dirname(fullPath))
        await fs.writeFile(fullPath, content)
      }

      // Create basic package.json if not exists
      const packageJsonPath = path.join(projectDir, 'package.json')
      if (!await fs.pathExists(packageJsonPath)) {
        const packageJson = {
          name: "vscode-studio-project",
          version: "1.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            start: "vite preview"
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0"
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.0.3",
            vite: "^4.4.5"
          }
        }
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
      }

      // Create vite.config.js if not exists
      const viteConfigPath = path.join(projectDir, 'vite.config.js')
      if (!await fs.pathExists(viteConfigPath)) {
        const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})`
        await fs.writeFile(viteConfigPath, viteConfig)
      }

      const executionTime = Date.now() - startTime
      return {
        success: true,
        output: `React project setup complete in ${projectDir}\nRun 'npm install' and 'npm run dev' to start the development server`,
        error: '',
        executionTime: executionTime,
        projectPath: projectDir
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      return {
        success: false,
        output: '',
        error: `Failed to setup React project: ${error.message}`,
        executionTime: executionTime
      }
    }
  }

  async runNodeProject(files, startTime) {
    const projectDir = path.join(this.tempDir, `node-${Date.now()}`)
    await fs.ensureDir(projectDir)

    try {
      // Write project files
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(projectDir, filePath.replace(/^\//, ''))
        await fs.ensureDir(path.dirname(fullPath))
        await fs.writeFile(fullPath, content)
      }

      // Find main file (index.js, app.js, main.js, or server.js)
      const mainFiles = ['index.js', 'app.js', 'main.js', 'server.js']
      let mainFile = null
      
      for (const file of mainFiles) {
        if (files[`/${file}`] || files[file]) {
          mainFile = file
          break
        }
      }

      if (!mainFile) {
        // Use the first .js file found
        mainFile = Object.keys(files).find(f => f.endsWith('.js'))?.replace(/^\//, '')
      }

      if (!mainFile) {
        throw new Error('No JavaScript main file found')
      }

      return new Promise((resolve) => {
        const child = spawn('node', [mainFile], {
          cwd: projectDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 15000
        })

        let output = ''
        let error = ''

        child.stdout.on('data', (data) => {
          output += data.toString()
        })

        child.stderr.on('data', (data) => {
          error += data.toString()
        })

        child.on('close', (code) => {
          const executionTime = Date.now() - startTime
          resolve({
            success: code === 0,
            output: output || 'Node.js project executed successfully',
            error: error,
            executionTime: executionTime
          })
        })

        child.on('error', (err) => {
          const executionTime = Date.now() - startTime
          resolve({
            success: false,
            output: '',
            error: `Node.js execution failed: ${err.message}`,
            executionTime: executionTime
          })
        })
      })
    } catch (error) {
      const executionTime = Date.now() - startTime
      return {
        success: false,
        output: '',
        error: `Failed to run Node.js project: ${error.message}`,
        executionTime: executionTime
      }
    }
  }

  async runHtmlProject(files, startTime) {
    const projectDir = path.join(this.tempDir, `html-${Date.now()}`)
    await fs.ensureDir(projectDir)

    try {
      // Write project files
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(projectDir, filePath.replace(/^\//, ''))
        await fs.ensureDir(path.dirname(fullPath))
        await fs.writeFile(fullPath, content)
      }

      // Find main HTML file
      let mainFile = 'index.html'
      if (!files['/index.html'] && !files['index.html']) {
        // Use the first .html file found
        mainFile = Object.keys(files).find(f => f.endsWith('.html'))?.replace(/^\//, '')
      }

      if (!mainFile) {
        throw new Error('No HTML file found')
      }

      const executionTime = Date.now() - startTime
      const htmlPath = path.join(projectDir, mainFile)
      
      return {
        success: true,
        output: `HTML project ready at: file://${htmlPath}\nOpen this file in your browser to view the project`,
        error: '',
        executionTime: executionTime,
        projectPath: projectDir,
        htmlPath: htmlPath
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      return {
        success: false,
        output: '',
        error: `Failed to setup HTML project: ${error.message}`,
        executionTime: executionTime
      }
    }
  }

  async runPythonProject(files, startTime) {
    const projectDir = path.join(this.tempDir, `python-${Date.now()}`)
    await fs.ensureDir(projectDir)

    try {
      // Write project files
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(projectDir, filePath.replace(/^\//, ''))
        await fs.ensureDir(path.dirname(fullPath))
        await fs.writeFile(fullPath, content)
      }

      // Find main Python file
      const mainFiles = ['main.py', 'app.py', '__main__.py', 'run.py']
      let mainFile = null
      
      for (const file of mainFiles) {
        if (files[`/${file}`] || files[file]) {
          mainFile = file
          break
        }
      }

      if (!mainFile) {
        // Use the first .py file found
        mainFile = Object.keys(files).find(f => f.endsWith('.py'))?.replace(/^\//, '')
      }

      if (!mainFile) {
        throw new Error('No Python main file found')
      }

      return new Promise((resolve) => {
        const child = spawn('python', [mainFile], {
          cwd: projectDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 15000
        })

        let output = ''
        let error = ''

        child.stdout.on('data', (data) => {
          output += data.toString()
        })

        child.stderr.on('data', (data) => {
          error += data.toString()
        })

        child.on('close', (code) => {
          const executionTime = Date.now() - startTime
          resolve({
            success: code === 0,
            output: output || 'Python project executed successfully',
            error: error,
            executionTime: executionTime
          })
        })

        child.on('error', (err) => {
          const executionTime = Date.now() - startTime
          resolve({
            success: false,
            output: '',
            error: `Python execution failed: ${err.message}`,
            executionTime: executionTime
          })
        })
      })
    } catch (error) {
      const executionTime = Date.now() - startTime
      return {
        success: false,
        output: '',
        error: `Failed to run Python project: ${error.message}`,
        executionTime: executionTime
      }
    }
  }
}

module.exports = CodeExecutionService
