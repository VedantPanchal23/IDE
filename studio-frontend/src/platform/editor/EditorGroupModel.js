import { BrowserEventEmitter } from '../events/BrowserEventEmitter.js';

export const EditorGroupChangeKind = {
  EDITOR_OPEN: 'editor-open',
  EDITOR_CLOSE: 'editor-close', 
  EDITOR_MOVE: 'editor-move',
  EDITOR_ACTIVE: 'editor-active',
  EDITOR_PIN: 'editor-pin',
  EDITOR_STICKY: 'editor-sticky',
  EDITOR_TRANSIENT: 'editor-transient',
  EDITOR_DIRTY: 'editor-dirty',
  GROUP_LABEL: 'group-label',
  GROUP_LOCKED: 'group-locked'
};

export const EditorCloseContext = {
  UNKNOWN: 'unknown',
  MOVE: 'move',
  REPLACE: 'replace',
  USER: 'user'
};

export const EditorsOrder = {
  MOST_RECENTLY_ACTIVE: 'mostRecentlyActive',
  SEQUENTIAL: 'sequential'
};

let groupIdCounter = 1;

export class EditorGroupModel extends BrowserEventEmitter {
  constructor(initialEditor = null) {
    super();
    
    this.id = groupIdCounter++;
    this.editors = [];
    this.mru = []; // Most recently used order
    this.active = null; // Active editor index
    this.preview = null; // Preview editor index
    this.sticky = []; // Sticky editor indices
    this.locked = false;
    this.label = '';
    
    if (initialEditor) {
      this.openEditor(initialEditor, { pinned: true });
    }
  }

  // Core editor management
  openEditor(editor, options = {}) {
    const existingIndex = this.findEditor(editor);
    
    if (existingIndex !== -1) {
      // Editor already exists, make it active
      this.setActiveEditor(existingIndex);
      return { editor: this.editors[existingIndex], isNew: false };
    }

    // Determine insertion index
    const index = this.getInsertionIndex(options);
    
    // Create editor entry
    const editorEntry = {
      id: this.generateEditorId(),
      input: editor,
      name: editor.name || 'Untitled',
      path: editor.path || '',
      language: editor.language || 'text',
      isDirty: false,
      isPinned: options.pinned || false,
      isTransient: options.transient || false,
      viewState: null,
      decorations: [],
      createdAt: Date.now(),
      lastActivated: Date.now()
    };

    // Insert editor
    this.editors.splice(index, 0, editorEntry);
    
    // Update MRU
    this.mru.unshift(index);
    this.updateMruIndices(index, 1);

    // Handle preview mode
    if (!options.pinned && !options.transient) {
      this.setPreview(index);
    }

    // Handle sticky
    if (options.sticky) {
      this.setSticky(index, true);
    }

    // Activate if requested
    if (options.active !== false) {
      this.setActiveEditor(index);
    }

    this.emit('change', {
      kind: EditorGroupChangeKind.EDITOR_OPEN,
      editor: editorEntry,
      editorIndex: index
    });

    return { editor: editorEntry, isNew: true };
  }

  closeEditor(indexOrEditor, context = EditorCloseContext.USER) {
    const index = typeof indexOrEditor === 'number' ? 
      indexOrEditor : this.findEditor(indexOrEditor);
    
    if (index === -1 || index >= this.editors.length) {
      return false;
    }

    const editor = this.editors[index];
    const wasActive = this.active === index;
    const wasSticky = this.sticky.includes(index);

    // Remove from arrays
    this.editors.splice(index, 1);
    this.removeMru(index);
    this.removeSticky(index);

    // Update preview
    if (this.preview === index) {
      this.preview = null;
    } else if (this.preview > index) {
      this.preview--;
    }

    // Update active editor
    if (wasActive) {
      this.selectNextActiveEditor(index);
    } else if (this.active > index) {
      this.active--;
    }

    this.emit('change', {
      kind: EditorGroupChangeKind.EDITOR_CLOSE,
      editor,
      editorIndex: index,
      context,
      wasSticky
    });

    return true;
  }

  closeAllEditors(except = []) {
    const editorsToClose = this.editors
      .map((_, index) => index)
      .filter(index => !except.includes(index))
      .reverse(); // Close from right to left to maintain indices

    editorsToClose.forEach(index => {
      this.closeEditor(index, EditorCloseContext.USER);
    });
  }

  closeEditorsToTheRight(editor) {
    const index = typeof editor === 'number' ? editor : this.findEditor(editor);
    if (index === -1) return;

    for (let i = this.editors.length - 1; i > index; i--) {
      this.closeEditor(i, EditorCloseContext.USER);
    }
  }

  closeEditorsToTheLeft(editor) {
    const index = typeof editor === 'number' ? editor : this.findEditor(editor);
    if (index === -1) return;

    for (let i = index - 1; i >= 0; i--) {
      this.closeEditor(i, EditorCloseContext.USER);
    }
  }

  closeOtherEditors(editor) {
    const index = typeof editor === 'number' ? editor : this.findEditor(editor);
    if (index === -1) return;

    this.closeAllEditors([index]);
  }

  // Editor state management
  setActiveEditor(index) {
    if (index === -1 || index >= this.editors.length) {
      this.active = null;
      return;
    }

    const previousActive = this.active;
    this.active = index;

    // Update MRU
    this.updateMru(index);
    
    // Update last activated
    if (this.editors[index]) {
      this.editors[index].lastActivated = Date.now();
    }

    // Clear preview if activating a different editor
    if (this.preview !== null && this.preview !== index) {
      this.clearPreview();
    }

    this.emit('change', {
      kind: EditorGroupChangeKind.EDITOR_ACTIVE,
      editor: this.editors[index],
      editorIndex: index,
      previousActive
    });
  }

  moveEditor(from, to) {
    if (from === to || from < 0 || from >= this.editors.length || 
        to < 0 || to >= this.editors.length) {
      return false;
    }

    const editor = this.editors[from];
    
    // Remove from original position
    this.editors.splice(from, 1);
    
    // Insert at new position
    const insertIndex = to > from ? to - 1 : to;
    this.editors.splice(insertIndex, 0, editor);

    // Update indices
    this.updateIndicesAfterMove(from, insertIndex);

    this.emit('change', {
      kind: EditorGroupChangeKind.EDITOR_MOVE,
      editor,
      editorIndex: insertIndex,
      oldEditorIndex: from
    });

    return true;
  }

  pinEditor(index) {
    if (index < 0 || index >= this.editors.length) return false;
    
    const editor = this.editors[index];
    if (editor.isPinned) return false;

    editor.isPinned = true;
    this.clearPreview();

    this.emit('change', {
      kind: EditorGroupChangeKind.EDITOR_PIN,
      editor,
      editorIndex: index
    });

    return true;
  }

  unpinEditor(index) {
    if (index < 0 || index >= this.editors.length) return false;
    
    const editor = this.editors[index];
    if (!editor.isPinned) return false;

    editor.isPinned = false;

    this.emit('change', {
      kind: EditorGroupChangeKind.EDITOR_PIN,
      editor,
      editorIndex: index
    });

    return true;
  }

  setSticky(index, sticky) {
    if (index < 0 || index >= this.editors.length) return false;

    const isCurrentlySticky = this.sticky.includes(index);
    
    if (sticky && !isCurrentlySticky) {
      this.sticky.push(index);
      this.sticky.sort((a, b) => a - b);
    } else if (!sticky && isCurrentlySticky) {
      this.sticky = this.sticky.filter(i => i !== index);
    } else {
      return false;
    }

    this.emit('change', {
      kind: EditorGroupChangeKind.EDITOR_STICKY,
      editor: this.editors[index],
      editorIndex: index,
      sticky
    });

    return true;
  }

  setPreview(index) {
    if (index < 0 || index >= this.editors.length) return false;

    // Clear existing preview
    this.clearPreview();
    
    // Set new preview
    this.preview = index;
    this.editors[index].isTransient = true;

    return true;
  }

  clearPreview() {
    if (this.preview !== null && this.preview < this.editors.length) {
      this.editors[this.preview].isTransient = false;
      this.preview = null;
    }
  }

  setDirty(index, dirty) {
    if (index < 0 || index >= this.editors.length) return false;

    const editor = this.editors[index];
    if (editor.isDirty === dirty) return false;

    editor.isDirty = dirty;

    this.emit('change', {
      kind: EditorGroupChangeKind.EDITOR_DIRTY,
      editor,
      editorIndex: index,
      dirty
    });

    return true;
  }

  // Getters
  getActiveEditor() {
    return this.active !== null ? this.editors[this.active] : null;
  }

  getActiveIndex() {
    return this.active;
  }

  getEditors(order = EditorsOrder.SEQUENTIAL) {
    if (order === EditorsOrder.MOST_RECENTLY_ACTIVE) {
      return this.mru.map(index => this.editors[index]).filter(Boolean);
    }
    return [...this.editors];
  }

  getEditor(index) {
    return this.editors[index] || null;
  }

  getEditorCount() {
    return this.editors.length;
  }

  isEmpty() {
    return this.editors.length === 0;
  }

  contains(editor) {
    return this.findEditor(editor) !== -1;
  }

  indexOf(editor) {
    return this.findEditor(editor);
  }

  // Group properties
  setLabel(label) {
    if (this.label === label) return;
    
    this.label = label;
    this.emit('change', {
      kind: EditorGroupChangeKind.GROUP_LABEL,
      label
    });
  }

  getLabel() {
    return this.label;
  }

  setLocked(locked) {
    if (this.locked === locked) return;
    
    this.locked = locked;
    this.emit('change', {
      kind: EditorGroupChangeKind.GROUP_LOCKED,
      locked
    });
  }

  isLocked() {
    return this.locked;
  }

  // Utility methods
  findEditor(editor) {
    if (typeof editor === 'string') {
      return this.editors.findIndex(e => e.path === editor || e.name === editor);
    }
    
    if (editor && typeof editor === 'object') {
      return this.editors.findIndex(e => 
        e.input === editor || 
        e.path === editor.path || 
        e.id === editor.id
      );
    }
    
    return -1;
  }

  generateEditorId() {
    return `editor-${this.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getInsertionIndex(options) {
    if (typeof options.index === 'number') {
      return Math.max(0, Math.min(options.index, this.editors.length));
    }

    // Default: insert at end
    return this.editors.length;
  }

  updateMru(index) {
    // Remove from current position
    this.mru = this.mru.filter(i => i !== index);
    // Add to front
    this.mru.unshift(index);
  }

  removeMru(removedIndex) {
    this.mru = this.mru
      .filter(i => i !== removedIndex)
      .map(i => i > removedIndex ? i - 1 : i);
  }

  updateMruIndices(insertedIndex, offset) {
    this.mru = this.mru.map(i => i >= insertedIndex ? i + offset : i);
  }

  removeSticky(removedIndex) {
    this.sticky = this.sticky
      .filter(i => i !== removedIndex)
      .map(i => i > removedIndex ? i - 1 : i);
  }

  updateIndicesAfterMove(from, to) {
    // Update active index
    if (this.active === from) {
      this.active = to;
    } else if (this.active > from && this.active <= to) {
      this.active--;
    } else if (this.active < from && this.active >= to) {
      this.active++;
    }

    // Update preview index
    if (this.preview === from) {
      this.preview = to;
    } else if (this.preview > from && this.preview <= to) {
      this.preview--;
    } else if (this.preview < from && this.preview >= to) {
      this.preview++;
    }

    // Update sticky indices
    this.sticky = this.sticky.map(index => {
      if (index === from) {
        return to;
      } else if (index > from && index <= to) {
        return index - 1;
      } else if (index < from && index >= to) {
        return index + 1;
      }
      return index;
    }).sort((a, b) => a - b);

    // Update MRU indices
    this.mru = this.mru.map(index => {
      if (index === from) {
        return to;
      } else if (index > from && index <= to) {
        return index - 1;
      } else if (index < from && index >= to) {
        return index + 1;
      }
      return index;
    });
  }

  selectNextActiveEditor(closedIndex) {
    if (this.editors.length === 0) {
      this.active = null;
      return;
    }

    // Try to activate next editor in MRU order
    for (const mruIndex of this.mru) {
      if (mruIndex < this.editors.length) {
        this.setActiveEditor(mruIndex);
        return;
      }
    }

    // Fallback: activate the editor at the closed position or the last one
    const targetIndex = Math.min(closedIndex, this.editors.length - 1);
    this.setActiveEditor(targetIndex);
  }

  // Serialization
  serialize() {
    return {
      id: this.id,
      locked: this.locked,
      label: this.label,
      editors: this.editors.map(editor => ({
        id: editor.id,
        name: editor.name,
        path: editor.path,
        language: editor.language,
        isPinned: editor.isPinned,
        isTransient: editor.isTransient,
        isDirty: editor.isDirty,
        viewState: editor.viewState
      })),
      mru: [...this.mru],
      active: this.active,
      preview: this.preview,
      sticky: [...this.sticky]
    };
  }

  deserialize(data) {
    this.id = data.id;
    this.locked = data.locked || false;
    this.label = data.label || '';
    this.mru = data.mru || [];
    this.active = data.active;
    this.preview = data.preview;
    this.sticky = data.sticky || [];
    
    // Note: Editors would need to be restored through editor service
    // This method sets up the structure for restoration
  }
}
