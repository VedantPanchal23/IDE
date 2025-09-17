/**
 * Browser-compatible EventEmitter implementation
 * Replaces Node.js EventEmitter for client-side use
 */
export class BrowserEventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push(listener)
    return this
  }

  emit(event, ...args) {
    if (!this.events.has(event)) {
      return false
    }
    
    const listeners = this.events.get(event)
    listeners.forEach(listener => {
      try {
        listener.apply(this, args)
      } catch (error) {
        console.error('Event listener error:', error)
      }
    })
    
    return listeners.length > 0
  }

  off(event, listener) {
    if (!this.events.has(event)) {
      return this
    }
    
    const listeners = this.events.get(event)
    const index = listeners.indexOf(listener)
    
    if (index !== -1) {
      listeners.splice(index, 1)
    }
    
    if (listeners.length === 0) {
      this.events.delete(event)
    }
    
    return this
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
    return this
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper)
      listener.apply(this, args)
    }
    
    this.on(event, onceWrapper)
    return this
  }

  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0
  }

  eventNames() {
    return Array.from(this.events.keys())
  }
}
