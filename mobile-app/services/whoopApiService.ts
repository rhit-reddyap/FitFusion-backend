import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WhoopTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number;
}

export interface WhoopCaloriesData {
  calories: number;
  date: string;
  timestamp: string;
}

export interface WhoopApiError {
  error: string;
  message: string;
  status?: number;
}

class WhoopApiService {
  private static instance: WhoopApiService;
  private readonly baseUrl = 'https://api.prod.whoop.com/developer';
  private readonly clientId = process.env.EXPO_PUBLIC_WHOOP_CLIENT_ID || 'ebdf942b-9a81-48ff-a60c-2e0da4216df5';
  private readonly clientSecret = process.env.EXPO_PUBLIC_WHOOP_CLIENT_SECRET || '39981c03df5669cf3d9d23552e36bc8327f494a9ca5a853da4d8712856c36b15';
  private tokenData: WhoopTokenData | null = null;

  public static getInstance(): WhoopApiService {
    if (!WhoopApiService.instance) {
      WhoopApiService.instance = new WhoopApiService();
    }
    return WhoopApiService.instance;
  }

  /**
   * Initialize the service by loading stored token data
   */
  async initialize(): Promise<void> {
    try {
      const storedToken = await AsyncStorage.getItem('whoop_token_data');
      if (storedToken) {
        this.tokenData = JSON.parse(storedToken);
        
        // Check if token is expired
        if (this.tokenData && Date.now() >= this.tokenData.expires_at) {
          console.log('Whoop token expired, attempting refresh...');
          await this.refreshToken();
        }
      }
    } catch (error) {
      console.error('Error initializing Whoop API service:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenData !== null && Date.now() < (this.tokenData?.expires_at || 0);
  }

  /**
   * Get OAuth2 authorization URL for Whoop
   */
  getAuthorizationUrl(): string {
    const redirectUri = process.env.EXPO_PUBLIC_WHOOP_REDIRECT_URI || 'http://localhost:3001/whoop-callback';
    const scope = 'read:recovery read:workout read:profile read:body_measurement read:cycles read:sleep';
    const state = Math.random().toString(36).substring(7);
    
    // Check if we have real credentials
    if (this.clientId === 'ebdf942b-9a81-48ff-a60c-2e0da4216df5') {
      // Real credentials - use actual OAuth URL
      return `https://api.prod.whoop.com/oauth/oauth2/auth?` +
        `response_type=code&` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}`;
    }
    
    // For demo purposes, we'll use a mock URL that explains the setup
    if (this.clientId === 'fitfusion_mobile_app') {
      return `https://developer.whoop.com/docs/develop/authentication/oauth2#getting-started`;
    }
    
    return `https://api.prod.whoop.com/oauth/oauth2/auth?` +
      `response_type=code&` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<WhoopTokenData> {
    try {
      const redirectUri = process.env.EXPO_PUBLIC_WHOOP_REDIRECT_URI || 'fitfusion://whoop-callback';
      
      const response = await fetch(`https://api.prod.whoop.com/oauth/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
      }

      const tokenData: WhoopTokenData = await response.json();
      tokenData.expires_at = Date.now() + (tokenData.expires_in * 1000);
      
      this.tokenData = tokenData;
      await AsyncStorage.setItem('whoop_token_data', JSON.stringify(tokenData));
      
      return tokenData;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken(): Promise<WhoopTokenData> {
    if (!this.tokenData?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`https://api.prod.whoop.com/oauth/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.tokenData.refresh_token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
      }

      const tokenData: WhoopTokenData = await response.json();
      tokenData.expires_at = Date.now() + (tokenData.expires_in * 1000);
      
      this.tokenData = tokenData;
      await AsyncStorage.setItem('whoop_token_data', JSON.stringify(tokenData));
      
      return tokenData;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear invalid token data
      this.tokenData = null;
      await AsyncStorage.removeItem('whoop_token_data');
      throw error;
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeAuthenticatedRequest(endpoint: string): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Whoop API');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.tokenData!.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token might be expired, try to refresh
        console.log('Token expired, attempting refresh...');
        await this.refreshToken();
        
        // Retry the request with new token
        const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.tokenData!.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.status} ${retryResponse.statusText}`);
        }
        
        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making authenticated request:', error);
      throw error;
    }
  }

  /**
   * Fetch today's calories burned from Whoop API
   */
  async getTodaysCaloriesBurned(): Promise<number> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Whoop API');
      }

      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      // Get today's cycles (physiological cycles) which contain strain and kilojoule data
      const cyclesData = await this.makeAuthenticatedRequest(
        `/v2/cycle?start=${startTime}&end=${endTime}&limit=1`
      );

      if (!cyclesData || !Array.isArray(cyclesData.records) || cyclesData.records.length === 0) {
        console.log('No cycle data found for today');
        return 0;
      }

      // Get the most recent cycle for today
      const todaysCycle = cyclesData.records[0];
      
      // Convert kilojoules to calories (1 kilojoule = 0.239006 calories)
      const kilojoules = todaysCycle.score?.kilojoule || 0;
      const caloriesBurned = Math.round(kilojoules * 0.239006);

      console.log(`Whoop API: Found ${caloriesBurned} calories burned for today (${kilojoules} kJ)`);
      return caloriesBurned;
    } catch (error) {
      console.error('Error fetching today\'s calories burned from Whoop:', error);
      throw error;
    }
  }

  /**
   * Fetch calories burned for a specific date range
   */
  async getCaloriesBurnedForDateRange(startDate: string, endDate: string): Promise<WhoopCaloriesData[]> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Whoop API');
      }

      const startTime = `${startDate}T00:00:00.000Z`;
      const endTime = `${endDate}T23:59:59.999Z`;

      const recoveryData = await this.makeAuthenticatedRequest(
        `/developer/v1/recovery?start=${startTime}&end=${endTime}`
      );

      if (!recoveryData || !Array.isArray(recoveryData.records)) {
        return [];
      }

      return recoveryData.records.map((record: any) => ({
        calories: Math.round(record.score?.calories_burned || record.metrics?.calories_burned || 0),
        date: record.created_at?.split('T')[0] || startDate,
        timestamp: record.created_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching calories burned for date range:', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<any> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Whoop API');
      }

      return await this.makeAuthenticatedRequest('/developer/v1/user/profile/basic');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Get today's recovery data
   */
  async getTodaysRecovery(): Promise<any> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Whoop API');
      }

      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      const recoveryData = await this.makeAuthenticatedRequest(
        `/v2/recovery?start=${startTime}&end=${endTime}&limit=1`
      );

      return recoveryData?.records?.[0] || null;
    } catch (error) {
      console.error('Error fetching recovery data from Whoop:', error);
      throw error;
    }
  }

  /**
   * Get today's sleep data
   */
  async getTodaysSleep(): Promise<any> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Whoop API');
      }

      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      const sleepData = await this.makeAuthenticatedRequest(
        `/v2/activity/sleep?start=${startTime}&end=${endTime}&limit=1`
      );

      return sleepData?.records?.[0] || null;
    } catch (error) {
      console.error('Error fetching sleep data from Whoop:', error);
      throw error;
    }
  }

  /**
   * Get today's workout data
   */
  async getTodaysWorkouts(): Promise<any[]> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Whoop API');
      }

      const today = new Date();
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      const workoutData = await this.makeAuthenticatedRequest(
        `/v2/activity/workout?start=${startTime}&end=${endTime}&limit=10`
      );

      return workoutData?.records || [];
    } catch (error) {
      console.error('Error fetching workout data from Whoop:', error);
      throw error;
    }
  }

  /**
   * Get user profile data
   */
  async getUserProfile(): Promise<any> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Whoop API');
      }

      const profileData = await this.makeAuthenticatedRequest('/v2/user/profile/basic');
      return profileData;
    } catch (error) {
      console.error('Error fetching user profile from Whoop:', error);
      throw error;
    }
  }

  /**
   * Get user body measurements
   */
  async getBodyMeasurements(): Promise<any> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Whoop API');
      }

      const bodyData = await this.makeAuthenticatedRequest('/v2/user/measurement/body');
      return bodyData;
    } catch (error) {
      console.error('Error fetching body measurements from Whoop:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive daily data (recovery, sleep, workouts, calories)
   */
  async getTodaysComprehensiveData(): Promise<any> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Whoop API');
      }

      const [recovery, sleep, workouts, calories] = await Promise.all([
        this.getTodaysRecovery(),
        this.getTodaysSleep(),
        this.getTodaysWorkouts(),
        this.getTodaysCaloriesBurned()
      ]);

      return {
        recovery,
        sleep,
        workouts,
        caloriesBurned: calories,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching comprehensive data from Whoop:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Whoop (clear stored tokens)
   */
  async disconnect(): Promise<void> {
    try {
      if (this.tokenData) {
        // Revoke the access token
        try {
          await this.makeAuthenticatedRequest('/v2/user/access', {
            method: 'DELETE'
          });
        } catch (revokeError) {
          console.warn('Could not revoke token, but continuing with disconnect:', revokeError);
        }
      }
      
      this.tokenData = null;
      await AsyncStorage.removeItem('whoop_token_data');
      console.log('Disconnected from Whoop API');
    } catch (error) {
      console.error('Error disconnecting from Whoop:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: boolean; expiresAt?: number } {
    return {
      connected: this.isAuthenticated(),
      expiresAt: this.tokenData?.expires_at,
    };
  }
}

export default WhoopApiService;
