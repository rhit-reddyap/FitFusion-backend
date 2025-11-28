// Wearable Device Integration Service
// Supports: Whoop, Pixel Watch, Fitbit, Apple Watch, Oura Ring, Garmin

export interface WearableDevice {
  id: string;
  name: string;
  type: 'whoop' | 'pixel_watch' | 'fitbit' | 'apple_watch' | 'oura_ring' | 'garmin';
  connected: boolean;
  lastSync: string | null;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
}

export interface WearableData {
  date: string;
  caloriesBurned: number;
  steps: number;
  heartRate: {
    average: number;
    max: number;
    resting: number;
  };
  sleep: {
    duration: number; // in minutes
    quality: number; // 1-10 scale
    deepSleep: number; // in minutes
    remSleep: number; // in minutes
  };
  activity: {
    activeMinutes: number;
    exerciseMinutes: number;
    distance: number; // in meters
  };
  recovery?: {
    score: number; // 1-100
    readiness: number; // 1-100
  };
}

export interface WearableConnection {
  device: WearableDevice;
  isConnected: boolean;
  lastSync: string | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  errorMessage?: string;
}

class WearableIntegrationService {
  private static instance: WearableIntegrationService;
  private connections: Map<string, WearableConnection> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;

  // Supported devices configuration
  private readonly supportedDevices = {
    whoop: {
      name: 'Whoop',
      icon: 'fitness',
      color: '#00D4FF',
      authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
      scopes: ['read:recovery', 'read:workout', 'read:profile', 'read:cycles']
    },
    pixel_watch: {
      name: 'Pixel Watch',
      icon: 'watch',
      color: '#4285F4',
      authUrl: 'https://accounts.google.com/oauth/authorize',
      scopes: ['https://www.googleapis.com/auth/fitness.activity.read', 'https://www.googleapis.com/auth/fitness.body.read']
    },
    fitbit: {
      name: 'Fitbit',
      icon: 'fitness',
      color: '#00B0B9',
      authUrl: 'https://www.fitbit.com/oauth2/authorize',
      scopes: ['activity', 'heartrate', 'sleep', 'profile']
    },
    apple_watch: {
      name: 'Apple Watch',
      icon: 'watch',
      color: '#007AFF',
      authUrl: 'https://appleid.apple.com/auth/authorize',
      scopes: ['fitness.read', 'health.read']
    },
    oura_ring: {
      name: 'Oura Ring',
      icon: 'fitness',
      color: '#00C896',
      authUrl: 'https://cloud.ouraring.com/oauth/authorize',
      scopes: ['personal', 'daily', 'session']
    },
    garmin: {
      name: 'Garmin',
      icon: 'fitness',
      color: '#007CC3',
      authUrl: 'https://connect.garmin.com/oauthConfirm',
      scopes: ['read:activities', 'read:heart_rate', 'read:sleep']
    }
  };

  static getInstance(): WearableIntegrationService {
    if (!WearableIntegrationService.instance) {
      WearableIntegrationService.instance = new WearableIntegrationService();
    }
    return WearableIntegrationService.instance;
  }

  // Get all supported devices
  getSupportedDevices() {
    return Object.entries(this.supportedDevices).map(([key, config]) => ({
      id: key,
      name: config.name,
      icon: config.icon,
      color: config.color,
      authUrl: config.authUrl,
      scopes: config.scopes
    }));
  }

  // Connect to a wearable device
  async connectDevice(deviceType: string, authCode: string): Promise<{ success: boolean; message: string; device?: WearableDevice }> {
    try {
      const deviceConfig = this.supportedDevices[deviceType];
      if (!deviceConfig) {
        return { success: false, message: 'Unsupported device type' };
      }

      // Exchange auth code for access token
      const tokens = await this.exchangeAuthCode(deviceType, authCode);
      if (!tokens) {
        return { success: false, message: 'Failed to authenticate with device' };
      }

      const device: WearableDevice = {
        id: `${deviceType}_${Date.now()}`,
        name: deviceConfig.name,
        type: deviceType as any,
        connected: true,
        lastSync: new Date().toISOString(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };

      // Store device connection
      this.connections.set(device.id, {
        device,
        isConnected: true,
        lastSync: device.lastSync,
        syncStatus: 'idle'
      });

      // Save to local storage
      await this.saveConnections();

      return { success: true, message: 'Device connected successfully', device };
    } catch (error) {
      console.error('Error connecting device:', error);
      return { success: false, message: 'Failed to connect device' };
    }
  }

  // Disconnect a device
  async disconnectDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const connection = this.connections.get(deviceId);
      if (!connection) {
        return { success: false, message: 'Device not found' };
      }

      // Revoke tokens if possible
      if (connection.device.accessToken) {
        await this.revokeTokens(connection.device.type, connection.device.accessToken);
      }

      // Remove from connections
      this.connections.delete(deviceId);
      await this.saveConnections();

      return { success: true, message: 'Device disconnected successfully' };
    } catch (error) {
      console.error('Error disconnecting device:', error);
      return { success: false, message: 'Failed to disconnect device' };
    }
  }

  // Sync data from all connected devices
  async syncAllDevices(): Promise<{ success: boolean; message: string; data?: WearableData[] }> {
    try {
      const allData: WearableData[] = [];
      const syncPromises = Array.from(this.connections.values())
        .filter(conn => conn.isConnected)
        .map(conn => this.syncDevice(conn.device.id));

      const results = await Promise.allSettled(syncPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          allData.push(...result.value.data || []);
        }
      });

      // Update analytics with synced data
      await this.updateAnalyticsWithWearableData(allData);

      return { success: true, message: 'Data synced successfully', data: allData };
    } catch (error) {
      console.error('Error syncing devices:', error);
      return { success: false, message: 'Failed to sync devices' };
    }
  }

  // Sync data from a specific device
  async syncDevice(deviceId: string): Promise<{ success: boolean; message: string; data?: WearableData[] }> {
    try {
      const connection = this.connections.get(deviceId);
      if (!connection || !connection.isConnected) {
        return { success: false, message: 'Device not connected' };
      }

      connection.syncStatus = 'syncing';

      const data = await this.fetchDeviceData(connection.device);
      if (data) {
        connection.lastSync = new Date().toISOString();
        connection.syncStatus = 'success';
        await this.saveConnections();
        return { success: true, message: 'Data synced successfully', data };
      } else {
        connection.syncStatus = 'error';
        connection.errorMessage = 'Failed to fetch data';
        return { success: false, message: 'Failed to fetch data from device' };
      }
    } catch (error) {
      console.error('Error syncing device:', error);
      const connection = this.connections.get(deviceId);
      if (connection) {
        connection.syncStatus = 'error';
        connection.errorMessage = error.message;
      }
      return { success: false, message: 'Failed to sync device' };
    }
  }

  // Get all connected devices
  getConnectedDevices(): WearableConnection[] {
    return Array.from(this.connections.values());
  }

  // Start automatic syncing
  startAutoSync(intervalMinutes: number = 60) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncAllDevices();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop automatic syncing
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Private methods
  private async exchangeAuthCode(deviceType: string, authCode: string): Promise<{ accessToken: string; refreshToken?: string } | null> {
    // This would typically make API calls to exchange auth codes for tokens
    // For now, we'll simulate this process
    return {
      accessToken: `mock_token_${deviceType}_${Date.now()}`,
      refreshToken: `mock_refresh_${deviceType}_${Date.now()}`
    };
  }

  private async revokeTokens(deviceType: string, accessToken: string): Promise<void> {
    // This would typically make API calls to revoke tokens
    console.log(`Revoking tokens for ${deviceType}`);
  }

  private async fetchDeviceData(device: WearableDevice): Promise<WearableData[] | null> {
    try {
      // Try to get real data from DataStorage first
      const { DataStorage } = await import('../utils/dataStorage');
      const today = new Date().toISOString().split('T')[0];
      const existingData = await DataStorage.getWearableData(today);
      
      if (existingData && existingData.length > 0) {
        // Return existing data if available
        return existingData;
      }
      
      // If no existing data, return mock data for demo purposes
      return [{
        date: today,
        caloriesBurned: Math.floor(Math.random() * 500) + 200,
        steps: Math.floor(Math.random() * 5000) + 3000,
        heartRate: {
          average: Math.floor(Math.random() * 30) + 70,
          max: Math.floor(Math.random() * 50) + 150,
          resting: Math.floor(Math.random() * 20) + 50
        },
        sleep: {
          duration: Math.floor(Math.random() * 120) + 360, // 6-8 hours
          quality: Math.floor(Math.random() * 3) + 7, // 7-10
          deepSleep: Math.floor(Math.random() * 60) + 60, // 1-2 hours
          remSleep: Math.floor(Math.random() * 60) + 90 // 1.5-2.5 hours
        },
        activity: {
          activeMinutes: Math.floor(Math.random() * 60) + 30,
          exerciseMinutes: Math.floor(Math.random() * 30) + 15,
          distance: Math.floor(Math.random() * 5000) + 2000 // 2-7km
        },
        recovery: device.type === 'whoop' || device.type === 'oura_ring' ? {
          score: Math.floor(Math.random() * 30) + 70,
          readiness: Math.floor(Math.random() * 30) + 70
        } : undefined
      }];
    } catch (error) {
      console.error('Error fetching device data:', error);
      return null;
    }
  }

  private async updateAnalyticsWithWearableData(data: WearableData[]): Promise<void> {
    try {
      // Import DataStorage here to avoid circular dependencies
      const { DataStorage } = await import('../utils/dataStorage');
      
      for (const dayData of data) {
        // Update daily stats with wearable data
        await DataStorage.updateUserStats({
          totalCaloriesBurned: (await DataStorage.getUserStats()).totalCaloriesBurned + dayData.caloriesBurned,
          steps: dayData.steps,
          heartRate: dayData.heartRate.average,
          sleepHours: dayData.sleep.duration / 60
        });
      }
    } catch (error) {
      console.error('Error updating analytics with wearable data:', error);
    }
  }

  private async saveConnections(): Promise<void> {
    try {
      const { DataStorage } = await import('../utils/dataStorage');
      const connectionsArray = Array.from(this.connections.values());
      await DataStorage.saveData('wearable_connections', connectionsArray);
    } catch (error) {
      console.error('Error saving connections:', error);
    }
  }

  private async loadConnections(): Promise<void> {
    try {
      const { DataStorage } = await import('../utils/dataStorage');
      const connections = await DataStorage.getData('wearable_connections') || [];
      
      this.connections.clear();
      connections.forEach((conn: WearableConnection) => {
        this.connections.set(conn.device.id, conn);
      });
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  }

  // Initialize the service
  async initialize(): Promise<void> {
    await this.loadConnections();
    // Start auto-sync every hour
    this.startAutoSync(60);
  }
}

export default WearableIntegrationService;



