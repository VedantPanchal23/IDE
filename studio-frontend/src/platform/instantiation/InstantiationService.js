import { BrowserEventEmitter } from '../events/BrowserEventEmitter.js';

export const ServiceIdentifiers = {
  INSTANTIATION_SERVICE: 'instantiationService',
  COMMAND_SERVICE: 'commandService',
  LAYOUT_SERVICE: 'layoutService',
  EDITOR_SERVICE: 'editorService',
  AI_SERVICE: 'aiService',
  NOTIFICATION_SERVICE: 'notificationService',
  CONFIGURATION_SERVICE: 'configurationService',
  KEYBINDING_SERVICE: 'keybindingService',
  THEME_SERVICE: 'themeService',
  FILE_SERVICE: 'fileService',
  EXECUTION_SERVICE: 'executionService',
  SEARCH_SERVICE: 'searchService',
  DEBUG_SERVICE: 'debugService',
  EXTENSION_SERVICE: 'extensionService',
  TERMINAL_SERVICE: 'terminalService',
  SCM_SERVICE: 'scmService',
  TELEMETRY_SERVICE: 'telemetryService'
};

export class ServiceCollection {
  constructor() {
    this.services = new Map();
  }

  set(id, service) {
    this.services.set(id, service);
    return this;
  }

  get(id) {
    return this.services.get(id);
  }

  has(id) {
    return this.services.has(id);
  }

  delete(id) {
    return this.services.delete(id);
  }

  forEach(callback) {
    this.services.forEach(callback);
  }

  clone() {
    const clone = new ServiceCollection();
    this.services.forEach((service, id) => {
      clone.set(id, service);
    });
    return clone;
  }
}

export class InstantiationService extends BrowserEventEmitter {
  constructor(services = new ServiceCollection()) {
    super();
    this.services = services.clone();
    this.children = new Set();
    
    // Register self
    this.services.set(ServiceIdentifiers.INSTANTIATION_SERVICE, this);
  }

  createInstance(ctorOrDescriptor, ...args) {
    if (typeof ctorOrDescriptor === 'function') {
      // Constructor function
      const dependencies = this.resolveDependencies(ctorOrDescriptor);
      return new ctorOrDescriptor(...args, ...dependencies);
    } else if (ctorOrDescriptor && typeof ctorOrDescriptor.create === 'function') {
      // Service descriptor
      return ctorOrDescriptor.create(this);
    } else {
      throw new Error('Invalid constructor or descriptor');
    }
  }

  invokeFunction(fn, ...args) {
    const accessor = {
      get: (serviceId) => this.getService(serviceId)
    };
    return fn(accessor, ...args);
  }

  createChild(services = new ServiceCollection()) {
    const childServices = this.services.clone();
    
    // Overlay child services
    services.forEach((service, id) => {
      childServices.set(id, service);
    });

    const child = new InstantiationService(childServices);
    child.parent = this;
    this.children.add(child);

    return child;
  }

  getService(serviceId) {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service '${serviceId}' not found`);
    }
    return service;
  }

  hasService(serviceId) {
    return this.services.has(serviceId);
  }

  registerService(serviceId, service) {
    this.services.set(serviceId, service);
    this.emit('serviceRegistered', { serviceId, service });
  }

  unregisterService(serviceId) {
    const service = this.services.get(serviceId);
    if (service) {
      this.services.delete(serviceId);
      this.emit('serviceUnregistered', { serviceId, service });
      
      // Dispose if possible
      if (service && typeof service.dispose === 'function') {
        service.dispose();
      }
    }
  }

  resolveDependencies(ctor) {
    // In a full implementation, this would use decorators or metadata
    // For now, we'll use a simple registration system
    const dependencies = ctor.dependencies || [];
    return dependencies.map(dep => this.getService(dep));
  }

  dispose() {
    // Dispose all children
    this.children.forEach(child => {
      if (typeof child.dispose === 'function') {
        child.dispose();
      }
    });
    this.children.clear();

    // Dispose all services
    this.services.forEach((service, id) => {
      if (service !== this && typeof service.dispose === 'function') {
        service.dispose();
      }
    });

    // Remove from parent
    if (this.parent) {
      this.parent.children.delete(this);
    }

    super.dispose?.();
  }
}

// Service descriptor for lazy instantiation
export class ServiceDescriptor {
  constructor(ctor, dependencies = []) {
    this.ctor = ctor;
    this.dependencies = dependencies;
    this.instance = null;
  }

  create(instantiationService) {
    if (!this.instance) {
      const deps = this.dependencies.map(dep => instantiationService.getService(dep));
      this.instance = new this.ctor(...deps);
    }
    return this.instance;
  }
}

// Utility function to create service descriptors
export function createServiceDescriptor(ctor, dependencies = []) {
  return new ServiceDescriptor(ctor, dependencies);
}

// Service registry for global service management
export class ServiceRegistry {
  constructor() {
    this.descriptors = new Map();
  }

  register(serviceId, descriptor) {
    this.descriptors.set(serviceId, descriptor);
  }

  get(serviceId) {
    return this.descriptors.get(serviceId);
  }

  has(serviceId) {
    return this.descriptors.has(serviceId);
  }

  getAllServiceIds() {
    return Array.from(this.descriptors.keys());
  }
}

export const serviceRegistry = new ServiceRegistry();
