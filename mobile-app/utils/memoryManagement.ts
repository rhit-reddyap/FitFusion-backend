class MemoryManager {
  private static instance: MemoryManager;
  private memoryThreshold = 100 * 1024 * 1024; // 100MB threshold
  private cleanupCallbacks: (() => void)[] = [];

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  public addCleanupCallback(callback: () => void) {
    this.cleanupCallbacks.push(callback);
  }

  public removeCleanupCallback(callback: () => void) {
    const index = this.cleanupCallbacks.indexOf(callback);
    if (index > -1) {
      this.cleanupCallbacks.splice(index, 1);
    }
  }

  public performCleanup() {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Memory cleanup callback failed:', error);
      }
    });
  }

  public checkMemoryUsage(): boolean {
    // In a real implementation, you would check actual memory usage
    // For now, we'll simulate memory checking
    return Math.random() > 0.8; // 20% chance of low memory
  }
}

export default MemoryManager;





