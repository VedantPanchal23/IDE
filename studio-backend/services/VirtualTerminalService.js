const DriveService = require('./DriveService');
const path = require('path');

class VirtualTerminalService {
  constructor() {
    // In-memory session storage. Key: sessionId, Value: { cwd, driveService }
    this.sessions = new Map();
  }

  /**
   * Creates a new terminal session for a user.
   * @param {string} sessionId - A unique identifier for the user's session (e.g., access token).
   * @param {string} accessToken - The user's Google Drive access token.
   */
  createSession(sessionId, accessToken) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        cwd: '/',
        driveService: new DriveService(accessToken),
      });
    }
  }

  /**
   * Handles a command for a given session.
   * @param {string} sessionId - The user's session ID.
   * @param {string} command - The command string to execute.
   * @returns {Promise<Object>} An object with the output and other info.
   */
  async handleCommand(sessionId, command) {
    if (!this.sessions.has(sessionId)) {
      return { output: 'Error: Session not found. Please re-authenticate.', error: true };
    }

    const session = this.sessions.get(sessionId);
    const [cmd, ...args] = command.trim().split(/\s+/);

    switch (cmd.toLowerCase()) {
      case 'ls':
        return this.ls(session, args[0]);
      case 'cd':
        return this.cd(session, args[0]);
      case 'mkdir':
        return this.mkdir(session, args[0]);
      case 'clear':
        return { output: '', clear: true };
      case 'pwd':
        return { output: session.cwd };
      default:
        return { output: `command not found: ${cmd}`, error: true };
    }
  }

  async ls(session, targetPath = '') {
    const listPath = path.resolve(session.cwd, targetPath);
    try {
      const files = await session.driveService.listFiles(listPath);
      if (files.length === 0) {
        return { output: '' };
      }
      const output = files.map(f => (f.type === 'folder' ? `${f.name}/` : f.name)).join('\n');
      return { output };
    } catch (error) {
      return { output: `ls: ${error.message}`, error: true };
    }
  }

  async cd(session, targetPath) {
    if (!targetPath) {
      session.cwd = '/';
      return { output: '', newCwd: session.cwd };
    }

    const newPath = path.resolve(session.cwd, targetPath);
    try {
      // To check if a directory exists, we try to list its contents.
      await session.driveService.listFiles(newPath);
      session.cwd = newPath;
      return { output: '', newCwd: session.cwd };
    } catch (error) {
      return { output: `cd: no such file or directory: ${targetPath}`, error: true };
    }
  }

  async mkdir(session, newDirName) {
    if (!newDirName) {
      return { output: 'mkdir: missing operand', error: true };
    }

    const newDirPath = path.resolve(session.cwd, newDirName);
    try {
      await session.driveService.createFolder(newDirPath);
      return { output: '' };
    } catch (error) {
      return { output: `mkdir: ${error.message}`, error: true };
    }
  }
}

module.exports = new VirtualTerminalService();
