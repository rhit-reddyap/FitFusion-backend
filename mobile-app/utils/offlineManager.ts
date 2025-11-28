class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private offlineQueue: any[] = [];
  private listeners: ((isOnline: boolean) => void)[] = [];

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  public setOnlineStatus(isOnline: boolean) {
    this.isOnline = isOnline;
    this.listeners.forEach(listener => listener(isOnline));
    
    if (isOnline && this.offlineQueue.length > 0) {
      this.processOfflineQueue();
    }
  }

  public addListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
  }

  public removeListener(listener: (isOnline: boolean) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public queueAction(action: any) {
    if (this.isOnline) {
      // Execute immediately if online
      return action();
    } else {
      // Queue for later if offline
      this.offlineQueue.push(action);
    }
  }

  private async processOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const action = this.offlineQueue.shift();
      try {
        await action();
      } catch (error) {
        console.warn('Failed to process offline action:', error);
      }
    }
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }
}

export default OfflineManager;