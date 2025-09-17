import { BrowserEventEmitter } from '../events/BrowserEventEmitter.js';

export const Parts = {
  TITLEBAR: 'workbench.parts.titlebar',
  ACTIVITYBAR: 'workbench.parts.activitybar', 
  SIDEBAR: 'workbench.parts.sidebar',
  EDITOR: 'workbench.parts.editor',
  PANEL: 'workbench.parts.panel',
  STATUSBAR: 'workbench.parts.statusbar'
};

export const Position = {
  LEFT: 'left',
  RIGHT: 'right', 
  BOTTOM: 'bottom',
  TOP: 'top'
};

export const LayoutSettings = {
  ACTIVITY_BAR_LOCATION: 'workbench.activityBar.location',
  EDITOR_TABS_MODE: 'workbench.editor.showTabs',
  SIDEBAR_POSITION: 'workbench.sideBar.location',
  PANEL_POSITION: 'workbench.panel.defaultLocation',
  ZEN_MODE: 'zenMode.enabled'
};

export class LayoutService extends BrowserEventEmitter {
  constructor() {
    super();
    
    this._layout = {
      parts: {
        [Parts.TITLEBAR]: { visible: true, size: 35 },
        [Parts.ACTIVITYBAR]: { visible: true, size: 48, position: Position.LEFT },
        [Parts.SIDEBAR]: { visible: true, size: 300, position: Position.LEFT },
        [Parts.EDITOR]: { visible: true, size: 'auto' },
        [Parts.PANEL]: { visible: false, size: 300, position: Position.BOTTOM },
        [Parts.STATUSBAR]: { visible: true, size: 22 }
      },
      zenMode: false,
      mainEditorCentered: false,
      panelMaximized: false,
      sidebarMaximized: false
    };

    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.setupResizeListener();
  }

  // Layout API
  layout() {
    this.calculateLayout();
    this.emit('layout', this._layout);
  }

  getLayout() {
    return this._layout;
  }

  getDimensions() {
    return this.dimensions;
  }

  // Part visibility management
  isVisible(part) {
    return this._layout.parts[part]?.visible ?? false;
  }

  setPartVisibility(part, visible) {
    if (this._layout.parts[part]) {
      this._layout.parts[part].visible = visible;
      this.layout();
      this.emit('partVisibilityChanged', { part, visible });
    }
  }

  togglePartVisibility(part) {
    const currentVisibility = this.isVisible(part);
    this.setPartVisibility(part, !currentVisibility);
  }

  // Part positioning
  getPartPosition(part) {
    return this._layout.parts[part]?.position ?? Position.LEFT;
  }

  setPartPosition(part, position) {
    if (this._layout.parts[part]) {
      this._layout.parts[part].position = position;
      this.layout();
      this.emit('partPositionChanged', { part, position });
    }
  }

  // Part sizing
  getPartSize(part) {
    return this._layout.parts[part]?.size ?? 0;
  }

  setPartSize(part, size) {
    if (this._layout.parts[part]) {
      this._layout.parts[part].size = size;
      this.layout();
      this.emit('partSizeChanged', { part, size });
    }
  }

  // Zen mode
  isZenModeActive() {
    return this._layout.zenMode;
  }

  toggleZenMode() {
    this._layout.zenMode = !this._layout.zenMode;
    
    if (this._layout.zenMode) {
      this.enableZenMode();
    } else {
      this.disableZenMode();
    }
    
    this.emit('zenModeChanged', this._layout.zenMode);
  }

  enableZenMode() {
    this.previousLayout = JSON.parse(JSON.stringify(this._layout));
    
    // Hide all parts except editor
    this.setPartVisibility(Parts.TITLEBAR, false);
    this.setPartVisibility(Parts.ACTIVITYBAR, false);
    this.setPartVisibility(Parts.SIDEBAR, false);
    this.setPartVisibility(Parts.PANEL, false);
    this.setPartVisibility(Parts.STATUSBAR, false);
    
    this._layout.mainEditorCentered = true;
    this.layout();
  }

  disableZenMode() {
    if (this.previousLayout) {
      this._layout.parts = JSON.parse(JSON.stringify(this.previousLayout.parts));
      this._layout.mainEditorCentered = this.previousLayout.mainEditorCentered;
      this.layout();
    }
  }

  // Panel management
  isPanelMaximized() {
    return this._layout.panelMaximized;
  }

  togglePanelMaximized() {
    this._layout.panelMaximized = !this._layout.panelMaximized;
    
    if (this._layout.panelMaximized) {
      this._layout.parts[Parts.PANEL].size = this.dimensions.height - 100;
    } else {
      this._layout.parts[Parts.PANEL].size = 300;
    }
    
    this.layout();
    this.emit('panelMaximizedChanged', this._layout.panelMaximized);
  }

  // Main editor centering
  isMainEditorCentered() {
    return this._layout.mainEditorCentered;
  }

  toggleMainEditorCentered() {
    this._layout.mainEditorCentered = !this._layout.mainEditorCentered;
    this.layout();
    this.emit('mainEditorCenteredChanged', this._layout.mainEditorCentered);
  }

  // Private methods
  calculateLayout() {
    let availableWidth = this.dimensions.width;
    let availableHeight = this.dimensions.height;

    // Account for titlebar
    if (this.isVisible(Parts.TITLEBAR)) {
      availableHeight -= this._layout.parts[Parts.TITLEBAR].size;
    }

    // Account for statusbar
    if (this.isVisible(Parts.STATUSBAR)) {
      availableHeight -= this._layout.parts[Parts.STATUSBAR].size;
    }

    // Account for activity bar
    if (this.isVisible(Parts.ACTIVITYBAR)) {
      if (this.getPartPosition(Parts.ACTIVITYBAR) === Position.LEFT || 
          this.getPartPosition(Parts.ACTIVITYBAR) === Position.RIGHT) {
        availableWidth -= this._layout.parts[Parts.ACTIVITYBAR].size;
      }
    }

    // Account for sidebar
    if (this.isVisible(Parts.SIDEBAR)) {
      availableWidth -= this._layout.parts[Parts.SIDEBAR].size;
    }

    // Account for panel
    if (this.isVisible(Parts.PANEL)) {
      if (this.getPartPosition(Parts.PANEL) === Position.BOTTOM || 
          this.getPartPosition(Parts.PANEL) === Position.TOP) {
        availableHeight -= this._layout.parts[Parts.PANEL].size;
      } else {
        availableWidth -= this._layout.parts[Parts.PANEL].size;
      }
    }

    // Set editor dimensions
    this._layout.parts[Parts.EDITOR].calculatedWidth = availableWidth;
    this._layout.parts[Parts.EDITOR].calculatedHeight = availableHeight;
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.dimensions.width = window.innerWidth;
      this.dimensions.height = window.innerHeight;
      this.layout();
      this.emit('windowResized', this.dimensions);
    });
  }

  // Preset layouts
  applyLayout(layoutName) {
    switch (layoutName) {
      case 'default':
        this.applyDefaultLayout();
        break;
      case 'fullscreen':
        this.applyFullscreenLayout();
        break;
      case 'minimal':
        this.applyMinimalLayout();
        break;
      case 'development':
        this.applyDevelopmentLayout();
        break;
    }
  }

  applyDefaultLayout() {
    this.setPartVisibility(Parts.TITLEBAR, true);
    this.setPartVisibility(Parts.ACTIVITYBAR, true);
    this.setPartVisibility(Parts.SIDEBAR, true);
    this.setPartVisibility(Parts.EDITOR, true);
    this.setPartVisibility(Parts.PANEL, false);
    this.setPartVisibility(Parts.STATUSBAR, true);
    
    this._layout.mainEditorCentered = false;
    this._layout.zenMode = false;
  }

  applyFullscreenLayout() {
    this.toggleZenMode();
  }

  applyMinimalLayout() {
    this.setPartVisibility(Parts.TITLEBAR, true);
    this.setPartVisibility(Parts.ACTIVITYBAR, false);
    this.setPartVisibility(Parts.SIDEBAR, false);
    this.setPartVisibility(Parts.EDITOR, true);
    this.setPartVisibility(Parts.PANEL, false);
    this.setPartVisibility(Parts.STATUSBAR, true);
  }

  applyDevelopmentLayout() {
    this.applyDefaultLayout();
    this.setPartVisibility(Parts.PANEL, true);
    this.setPartPosition(Parts.PANEL, Position.BOTTOM);
  }

  // Serialization
  serialize() {
    return {
      layout: this._layout,
      dimensions: this.dimensions
    };
  }

  deserialize(data) {
    if (data.layout) {
      this._layout = { ...this._layout, ...data.layout };
    }
    if (data.dimensions) {
      this.dimensions = { ...this.dimensions, ...data.dimensions };
    }
    this.layout();
  }
}
