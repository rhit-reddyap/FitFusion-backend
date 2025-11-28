import React from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Memory management class
export class MemoryManager {
  private static instance: MemoryManager;
  private appState: AppStateStatus = 'active';
  private memoryWarnings: number = 0;
  private lastCleanup: number = 0;
  private cleanupInterval: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.setupAppStateListener();
    this.setupMemoryWarningListener();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        this.handleAppForeground();
      } else if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
        // App went to background
        this.handleAppBackground();
      }
      this.appState = nextAppState;
    });
  }

  private setupMemoryWarningListener() {
    // Listen for memory warnings (iOS specific)
    if (Platform.OS === 'ios') {
      // This would be implemented with native modules in a real app
      console.log('Memory warning listener setup for iOS');
    }
  }

  private handleAppForeground() {
    console.log('App came to foreground - performing cleanup');
    this.performCleanup();
  }

  private handleAppBackground() {
    console.log('App went to background - saving state');
    this.saveAppState();
  }

  // Perform memory cleanup
  public performCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupInterval) {
      return; // Too soon for another cleanup
    }

    try {
      // Clear old cached data
      this.clearOldCache();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      this.lastCleanup = now;
      console.log('Memory cleanup completed');
    } catch (error) {
      console.warn('Memory cleanup failed:', error);
    }
  }

  // Clear old cached data
  private async clearOldCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const oldKeys = keys.filter(key => 
        key.includes('temp_') || 
        key.includes('cache_') ||
        key.includes('old_')
      );

      if (oldKeys.length > 0) {
        await AsyncStorage.multiRemove(oldKeys);
        console.log(`Cleared ${oldKeys.length} old cache entries`);
      }
    } catch (error) {
      console.warn('Failed to clear old cache:', error);
    }
  }

  // Save app state before backgrounding
  private async saveAppState() {
    try {
      const appState = {
        timestamp: Date.now(),
        memoryWarnings: this.memoryWarnings,
      };
      await AsyncStorage.setItem('app_state', JSON.stringify(appState));
    } catch (error) {
      console.warn('Failed to save app state:', error);
    }
  }

  // Get memory usage info
  public getMemoryInfo() {
    return {
      memoryWarnings: this.memoryWarnings,
      lastCleanup: this.lastCleanup,
      appState: this.appState,
    };
  }

  // Force cleanup
  public forceCleanup() {
    this.performCleanup();
  }

  // Increment memory warning counter
  public incrementMemoryWarnings() {
    this.memoryWarnings++;
    if (this.memoryWarnings > 3) {
      this.performCleanup();
    }
  }
}

// Component optimization utilities
export const optimizeComponent = (Component: React.ComponentType<any>) => {
  return React.memo(Component, (prevProps, nextProps) => {
    // Custom comparison logic for better performance
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

// Debounce utility for performance
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for performance
export const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function executedFunction(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory usage monitor
export const startMemoryMonitoring = () => {
  const memoryManager = MemoryManager.getInstance();
  
  // Monitor memory every 30 seconds
  setInterval(() => {
    const memoryInfo = memoryManager.getMemoryInfo();
    if (memoryInfo.memoryWarnings > 5) {
      memoryManager.forceCleanup();
    }
  }, 30000);
};
