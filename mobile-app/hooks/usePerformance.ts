import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import OfflineManager from '../utils/offlineManager';
import MemoryManager from '../utils/memoryManagement';

export const usePerformance = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [isLowMemory, setIsLowMemory] = useState(false);

  useEffect(() => {
    if (!OfflineManager || !MemoryManager) {
      console.warn('OfflineManager or MemoryManager not available');
      return;
    }
    
    const offlineManager = OfflineManager.getInstance();
    const memoryManager = MemoryManager.getInstance();

    // Set up offline listener
    const handleOnlineChange = (online: boolean) => {
      setIsOnline(online);
    };

    offlineManager.addListener(handleOnlineChange);

    // Check memory periodically
    const checkMemory = () => {
      const lowMemory = memoryManager.checkMemoryUsage();
      setIsLowMemory(lowMemory);
    };

    const memoryInterval = setInterval(checkMemory, 30000); // Check every 30 seconds

    // Cleanup
    return () => {
      offlineManager.removeListener(handleOnlineChange);
      clearInterval(memoryInterval);
    };
  }, []);

  const forceCleanup = () => {
    if (!MemoryManager) {
      console.warn('MemoryManager not available');
      return;
    }
    const memoryManager = MemoryManager.getInstance();
    memoryManager.performCleanup();
  };

  return {
    isOnline,
    memoryInfo,
    isLowMemory,
    forceCleanup,
  };
};