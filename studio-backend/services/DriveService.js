const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');

class DriveService {
  constructor(accessToken) {
    if (!accessToken) {
      throw new Error('Google Drive API access token is required.');
    }
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    this.codeSpaceFolderId = null; // Cache for the CodeSpace folder ID
  }

  /**
   * Initializes the service by finding or creating the CodeSpace folder.
   * Caches the folder ID for subsequent requests.
   */
  async _initialize() {
    if (this.codeSpaceFolderId) {
      return this.codeSpaceFolderId;
    }
    this.codeSpaceFolderId = await this.findOrCreateCodeSpaceFolder();
    return this.codeSpaceFolderId;
  }

  /**
   * Finds or creates the main "CodeSpace" folder in the user's Google Drive.
   * @returns {Promise<string>} The ID of the CodeSpace folder.
   */
  async findOrCreateCodeSpaceFolder() {
    try {
      const query = "mimeType='application/vnd.google-apps.folder' and name='CodeSpace' and trashed=false";
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      } else {
        const fileMetadata = {
          name: 'CodeSpace',
          mimeType: 'application/vnd.google-apps.folder',
        };
        const folder = await this.drive.files.create({
          resource: fileMetadata,
          fields: 'id',
        });
        return folder.data.id;
      }
    } catch (error) {
      console.error('Error finding or creating CodeSpace folder:', error);
      throw new Error('Failed to initialize CodeSpace folder in Google Drive.');
    }
  }

  /**
   * Finds the ID of a file or folder given a path relative to the CodeSpace folder.
   * @param {string} itemPath - The path to the item.
   * @param {string} parentFolderId - The ID of the folder to search in.
   * @returns {Promise<string|null>} The ID of the item, or null if not found.
   */
  async _findIdByPath(itemPath, parentFolderId) {
    const segments = itemPath.split('/').filter(Boolean);
    let currentId = parentFolderId;

    for (const segment of segments) {
      const query = `'${currentId}' in parents and name='${segment}' and trashed=false`;
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        pageSize: 1,
      });

      if (response.data.files.length === 0) {
        return null; // Not found
      }
      currentId = response.data.files[0].id;
    }
    return currentId;
  }

  /**
   * Lists files and folders within a given path inside the CodeSpace folder.
   * @param {string} dirPath - The path relative to the CodeSpace folder.
   * @returns {Promise<Array>} A list of files and folders.
   */
  async listFiles(dirPath = '/') {
    try {
      await this._initialize();
      const parentFolderId = await this._findIdByPath(dirPath, this.codeSpaceFolderId);

      if (!parentFolderId) {
        throw new Error(`Directory not found at path: ${dirPath}`);
      }

      const query = `'${parentFolderId}' in parents and trashed=false`;
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType)',
        spaces: 'drive',
      });

      return response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      }));
    } catch (error) {
      console.error(`Error listing files for path "${dirPath}":`, error);
      throw new Error(`Could not list files for path: ${dirPath}. ${error.message}`);
    }
  }

  /**
   * Reads the content of a file.
   * @param {string} filePath - The full path to the file.
   * @returns {Promise<string>} The content of the file.
   */
  async readFile(filePath) {
    try {
      await this._initialize();
      const dirPath = path.dirname(filePath);
      const fileName = path.basename(filePath);

      const parentFolderId = await this._findIdByPath(dirPath, this.codeSpaceFolderId);
      if (!parentFolderId) {
        throw new Error(`Directory not found at path: ${dirPath}`);
      }

      const query = `'${parentFolderId}' in parents and name='${fileName}' and mimeType!='application/vnd.google-apps.folder' and trashed=false`;
      const fileListResponse = await this.drive.files.list({
        q: query,
        fields: 'files(id)',
        pageSize: 1,
      });

      if (fileListResponse.data.files.length === 0) {
        throw new Error(`File not found: ${fileName}`);
      }

      const fileId = fileListResponse.data.files[0].id;
      const fileContentResponse = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      // Handle cases where data is a stream
      if (fileContentResponse.data.pipe) {
        return new Promise((resolve, reject) => {
          let data = '';
          fileContentResponse.data.on('data', chunk => data += chunk);
          fileContentResponse.data.on('end', () => resolve(data));
          fileContentResponse.data.on('error', err => reject(err));
        });
      }
      return fileContentResponse.data;

    } catch (error) {
      console.error(`Error reading file "${filePath}":`, error);
      throw new Error(`Could not read file: ${filePath}. ${error.message}`);
    }
  }

  /**
   * Saves content to a file. Creates the file if it doesn't exist, otherwise updates it.
   * @param {string} filePath - The full path to the file.
   * @param {string} content - The content to save.
   * @returns {Promise<Object>} The result of the save operation.
   */
  async saveFile(filePath, content) {
    try {
      await this._initialize();
      const dirPath = path.dirname(filePath);
      const fileName = path.basename(filePath);

      const parentFolderId = await this._findIdByPath(dirPath, this.codeSpaceFolderId);
      if (!parentFolderId) {
        throw new Error(`Cannot save file. Directory not found at path: ${dirPath}`);
      }

      // Check if file exists
      const query = `'${parentFolderId}' in parents and name='${fileName}' and mimeType!='application/vnd.google-apps.folder' and trashed=false`;
      const fileListResponse = await this.drive.files.list({
        q: query,
        fields: 'files(id)',
        pageSize: 1,
      });

      const media = {
        mimeType: 'text/plain',
        body: Readable.from([content]),
      };

      if (fileListResponse.data.files.length > 0) {
        // File exists, update it
        const fileId = fileListResponse.data.files[0].id;
        const response = await this.drive.files.update({
          fileId: fileId,
          media: media,
          fields: 'id, name',
        });
        return response.data;
      } else {
        // File does not exist, create it
        const fileMetadata = {
          name: fileName,
          parents: [parentFolderId],
        };
        const response = await this.drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id, name',
        });
        return response.data;
      }
    } catch (error) {
      console.error(`Error saving file "${filePath}":`, error);
      throw new Error(`Could not save file: ${filePath}. ${error.message}`);
    }
  }

  /**
   * Creates a new folder.
   * @param {string} folderPath - The full path where the folder should be created.
   * @returns {Promise<Object>} The result of the create operation.
   */
  async createFolder(folderPath) {
    try {
      await this._initialize();
      const dirPath = path.dirname(folderPath);
      const folderName = path.basename(folderPath);

      const parentFolderId = await this._findIdByPath(dirPath, this.codeSpaceFolderId);
      if (!parentFolderId) {
        throw new Error(`Cannot create folder. Parent directory not found at path: ${dirPath}`);
      }

      // Check if folder already exists
      const query = `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const folderListResponse = await this.drive.files.list({
        q: query,
        fields: 'files(id)',
        pageSize: 1,
      });

      if (folderListResponse.data.files.length > 0) {
        throw new Error(`Folder '${folderName}' already exists in this location.`);
      }

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      };
      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id, name',
      });
      return response.data;
    } catch (error) {
      console.error(`Error creating folder "${folderPath}":`, error);
      throw new Error(`Could not create folder: ${folderPath}. ${error.message}`);
    }
  }
}

module.exports = DriveService;
