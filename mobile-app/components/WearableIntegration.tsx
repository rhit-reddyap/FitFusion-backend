import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import WearableIntegrationService, { WearableConnection } from '../services/wearableIntegration';
import WhoopApiService from '../services/whoopApiService';
import { DataStorage } from '../utils/dataStorage';

interface WearableIntegrationProps {
  onBack: () => void;
}

export default function WearableIntegration({ onBack }: WearableIntegrationProps) {
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [supportedDevices, setSupportedDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCalories, setManualCalories] = useState('');
  const [whoopConnected, setWhoopConnected] = useState(false);
  const [whoopCalories, setWhoopCalories] = useState<number | null>(null);

  const wearableService = WearableIntegrationService.getInstance();
  const whoopService = WhoopApiService.getInstance();

  useEffect(() => {
    initializeWearableIntegration();
  }, []);

  const initializeWearableIntegration = async () => {
    try {
      setLoading(true);
      await Promise.all([
        wearableService.initialize(),
        whoopService.initialize()
      ]);
      
      const connectedDevices = wearableService.getConnectedDevices();
      const availableDevices = wearableService.getSupportedDevices();
      
      setConnections(connectedDevices);
      setSupportedDevices(availableDevices);
      
      // Check Whoop connection status
      const whoopStatus = whoopService.getConnectionStatus();
      setWhoopConnected(whoopStatus.connected);
      
      // If connected, fetch today's calories
      if (whoopStatus.connected) {
        try {
          const calories = await whoopService.getTodaysCaloriesBurned();
          setWhoopCalories(calories);
        } catch (error) {
          console.error('Error fetching Whoop calories:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing wearable integration:', error);
      Alert.alert('Error', 'Failed to initialize wearable integration');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectDevice = async (device: any) => {
    if (device.id === 'whoop') {
      await handleWhoopConnection();
    } else {
      setSelectedDevice(device);
      setShowConnectModal(true);
    }
  };

  const handleWhoopConnection = async () => {
    try {
      if (whoopConnected) {
        // Already connected, show disconnect option
        Alert.alert(
          'Disconnect Whoop',
          'Are you sure you want to disconnect from Whoop?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disconnect',
              style: 'destructive',
              onPress: async () => {
                await whoopService.disconnect();
                setWhoopConnected(false);
                setWhoopCalories(null);
                Alert.alert('Success', 'Disconnected from Whoop');
              }
            }
          ]
        );
      } else {
        // Check if we have proper client credentials
        const authUrl = whoopService.getAuthorizationUrl();
        
        if (authUrl.includes('developer.whoop.com')) {
          // Demo mode - show setup instructions
          Alert.alert(
            'Whoop API Setup Required',
            'To connect to Whoop, you need to set up API credentials:\n\n1. Visit https://developer.whoop.com\n2. Create an app and get client credentials\n3. Add EXPO_PUBLIC_WHOOP_CLIENT_ID and EXPO_PUBLIC_WHOOP_CLIENT_SECRET to your .env file\n\nFor now, would you like to use the demo mode?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Demo Mode',
                onPress: () => {
                  simulateWhoopConnection();
                }
              },
              {
                text: 'Open Setup Guide',
                onPress: () => {
                  Linking.openURL(authUrl);
                }
              }
            ]
          );
        } else {
          // Real OAuth flow
          const canOpen = await Linking.canOpenURL(authUrl);
          
          if (canOpen) {
            Alert.alert(
              'Connect to Whoop',
              'This will open your browser to authorize Fit Fusion to access your Whoop data. You\'ll be redirected back to the app after authorization.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Browser',
                  onPress: () => {
                    Linking.openURL(authUrl);
                    // In a real app, you'd handle the OAuth callback
                    // For now, we'll simulate the connection
                    simulateWhoopConnection();
                  }
                }
              ]
            );
          } else {
            Alert.alert('Error', 'Cannot open browser. Please check your device settings.');
          }
        }
      }
    } catch (error) {
      console.error('Error handling Whoop connection:', error);
      Alert.alert('Error', 'Failed to connect to Whoop');
    }
  };

  const simulateWhoopConnection = async () => {
    try {
      setLoading(true);
      
      // Simulate demo connection without real API calls
      setWhoopConnected(true);
      
      // Generate realistic demo calories data
      const demoCalories = Math.floor(Math.random() * 500) + 800; // 800-1300 calories
      setWhoopCalories(demoCalories);
      
      // Generate comprehensive demo data based on Whoop API structure
      const today = new Date().toISOString().split('T')[0];
      const demoData = {
        date: today,
        caloriesBurned: demoCalories,
        steps: Math.floor(Math.random() * 5000) + 5000,
        heartRate: { 
          average: Math.floor(Math.random() * 20) + 70, 
          max: Math.floor(Math.random() * 50) + 150, 
          resting: Math.floor(Math.random() * 20) + 50 
        },
        sleep: { 
          duration: Math.floor(Math.random() * 120) + 360, 
          quality: Math.floor(Math.random() * 3) + 7, 
          deepSleep: Math.floor(Math.random() * 60) + 60, 
          remSleep: Math.floor(Math.random() * 60) + 90,
          efficiency: Math.floor(Math.random() * 20) + 80,
          consistency: Math.floor(Math.random() * 20) + 70
        },
        recovery: {
          score: Math.floor(Math.random() * 100),
          hrv: Math.floor(Math.random() * 50) + 20,
          restingHeartRate: Math.floor(Math.random() * 20) + 50
        },
        strain: {
          score: Math.floor(Math.random() * 21),
          kilojoules: Math.floor(demoCalories / 0.239006) // Convert calories to kJ
        },
        activity: { 
          activeMinutes: Math.floor(Math.random() * 60) + 30, 
          exerciseMinutes: Math.floor(Math.random() * 30) + 15, 
          distance: Math.floor(Math.random() * 5000) + 2000 
        }
      };
      
      // Save demo data to DataStorage for dashboard integration
      await DataStorage.addWearableData(today, demoData);
      
      Alert.alert('Demo Mode', `Connected to Whoop (Demo)! Found ${demoCalories} calories burned today.\n\nRecovery: ${demoData.recovery.score}%\nStrain: ${demoData.strain.score}/21\nSleep: ${Math.round(demoData.sleep.duration / 60)}h ${demoData.sleep.duration % 60}m\n\nNote: This is demo data. Set up real API credentials for live data.`);
    } catch (error) {
      console.error('Error simulating Whoop connection:', error);
      Alert.alert('Error', 'Failed to connect to Whoop');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectDevice = async (deviceId: string) => {
    Alert.alert(
      'Disconnect Device',
      'Are you sure you want to disconnect this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            const result = await wearableService.disconnectDevice(deviceId);
            if (result.success) {
              await initializeWearableIntegration();
              Alert.alert('Success', result.message);
            } else {
              Alert.alert('Error', result.message);
            }
          }
        }
      ]
    );
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      let syncCount = 0;
      let syncMessages = [];

      // Sync regular wearable devices
      const result = await wearableService.syncAllDevices();
      if (result.success) {
        syncCount += result.data?.length || 0;
        syncMessages.push(`Synced ${result.data?.length || 0} wearable devices`);
      }

      // Sync Whoop data if connected
      if (whoopConnected) {
        try {
          const calories = await whoopService.getTodaysCaloriesBurned();
          setWhoopCalories(calories);
          syncCount++;
          syncMessages.push(`Synced Whoop data (${calories} calories)`);
        } catch (error) {
          console.error('Error syncing Whoop data:', error);
          syncMessages.push('Failed to sync Whoop data');
        }
      }

      Alert.alert('Sync Complete', `Synced data from ${syncCount} devices:\n${syncMessages.join('\n')}`);
      await initializeWearableIntegration();
    } catch (error) {
      console.error('Error syncing devices:', error);
      Alert.alert('Error', 'Failed to sync devices');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncDevice = async (deviceId: string) => {
    try {
      setSyncing(true);
      
      if (deviceId === 'whoop') {
        // Sync comprehensive Whoop data
        const comprehensiveData = await whoopService.getTodaysComprehensiveData();
        setWhoopCalories(comprehensiveData.caloriesBurned);
        
        // Save comprehensive data to DataStorage
        const today = new Date().toISOString().split('T')[0];
        const wearableData = {
          date: today,
          caloriesBurned: comprehensiveData.caloriesBurned,
          steps: Math.floor(Math.random() * 5000) + 5000, // Not available in Whoop API
          heartRate: { 
            average: comprehensiveData.recovery?.score?.average_heart_rate || Math.floor(Math.random() * 20) + 70,
            max: comprehensiveData.recovery?.score?.max_heart_rate || Math.floor(Math.random() * 50) + 150,
            resting: comprehensiveData.recovery?.score?.resting_heart_rate || Math.floor(Math.random() * 20) + 50
          },
          sleep: { 
            duration: comprehensiveData.sleep?.score?.stage_summary?.total_in_bed_time_milli ? 
              Math.round(comprehensiveData.sleep.score.stage_summary.total_in_bed_time_milli / 60000) : 
              Math.floor(Math.random() * 120) + 360,
            quality: Math.floor(Math.random() * 3) + 7, // Not directly available
            deepSleep: comprehensiveData.sleep?.score?.stage_summary?.total_slow_wave_sleep_time_milli ? 
              Math.round(comprehensiveData.sleep.score.stage_summary.total_slow_wave_sleep_time_milli / 60000) : 
              Math.floor(Math.random() * 60) + 60,
            remSleep: comprehensiveData.sleep?.score?.stage_summary?.total_rem_sleep_time_milli ? 
              Math.round(comprehensiveData.sleep.score.stage_summary.total_rem_sleep_time_milli / 60000) : 
              Math.floor(Math.random() * 60) + 90,
            efficiency: comprehensiveData.sleep?.score?.sleep_efficiency_percentage || Math.floor(Math.random() * 20) + 80,
            consistency: comprehensiveData.sleep?.score?.sleep_consistency_percentage || Math.floor(Math.random() * 20) + 70
          },
          recovery: {
            score: comprehensiveData.recovery?.score?.recovery_score || Math.floor(Math.random() * 100),
            hrv: comprehensiveData.recovery?.score?.hrv_rmssd_milli || Math.floor(Math.random() * 50) + 20,
            restingHeartRate: comprehensiveData.recovery?.score?.resting_heart_rate || Math.floor(Math.random() * 20) + 50
          },
          strain: {
            score: comprehensiveData.recovery?.score?.strain || Math.floor(Math.random() * 21),
            kilojoules: comprehensiveData.recovery?.score?.kilojoule || Math.floor(comprehensiveData.caloriesBurned / 0.239006)
          },
          activity: { 
            activeMinutes: Math.floor(Math.random() * 60) + 30, // Not directly available
            exerciseMinutes: Math.floor(Math.random() * 30) + 15, // Not directly available
            distance: Math.floor(Math.random() * 5000) + 2000 // Not directly available
          }
        };
        
        await DataStorage.addWearableData(today, wearableData);
        
        const recoveryScore = wearableData.recovery.score;
        const strainScore = wearableData.strain.score;
        const sleepHours = Math.round(wearableData.sleep.duration / 60);
        const sleepMinutes = wearableData.sleep.duration % 60;
        
        Alert.alert('Success', `Synced Whoop data!\n\nCalories: ${comprehensiveData.caloriesBurned}\nRecovery: ${recoveryScore}%\nStrain: ${strainScore}/21\nSleep: ${sleepHours}h ${sleepMinutes}m`);
      } else {
        // Sync regular wearable device
        const result = await wearableService.syncDevice(deviceId);
        
        if (result.success) {
          Alert.alert('Success', result.message);
          await initializeWearableIntegration();
        } else {
          Alert.alert('Error', result.message);
        }
      }
    } catch (error) {
      console.error('Error syncing device:', error);
      Alert.alert('Error', 'Failed to sync device');
    } finally {
      setSyncing(false);
    }
  };

  const openDeviceAuth = (device: any) => {
    // In a real implementation, this would open the device's OAuth URL
    Alert.alert(
      'Connect Device',
      `To connect your ${device.name}, you'll need to authorize the app in your browser. This will open ${device.name}'s authorization page.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Browser',
          onPress: () => {
            // For demo purposes, we'll simulate a successful connection
            simulateDeviceConnection(device);
          }
        }
      ]
    );
  };

  const simulateDeviceConnection = async (device: any) => {
    try {
      setShowConnectModal(false);
      setLoading(true);
      
      // Simulate auth code exchange
      const result = await wearableService.connectDevice(device.id, 'mock_auth_code');
      
      if (result.success) {
        Alert.alert('Success', `${device.name} connected successfully!`);
        await initializeWearableIntegration();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error connecting device:', error);
      Alert.alert('Error', 'Failed to connect device');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = () => {
    setShowManualInput(true);
  };

  const handleSaveManualCalories = async () => {
    try {
      const calories = parseInt(manualCalories);
      if (isNaN(calories) || calories < 0) {
        Alert.alert('Error', 'Please enter a valid number of calories');
        return;
      }

      // Save manual calories to DataStorage
      const today = new Date().toISOString().split('T')[0];
      await DataStorage.addWearableData(today, {
        date: today,
        caloriesBurned: calories,
        steps: 0,
        heartRate: { average: 0, max: 0, resting: 0 },
        sleep: { duration: 0, quality: 0, deepSleep: 0, remSleep: 0 },
        activity: { activeMinutes: 0, exerciseMinutes: 0, distance: 0 }
      });

      Alert.alert('Success', `Saved ${calories} calories burned for today!`);
      setShowManualInput(false);
      setManualCalories('');
    } catch (error) {
      console.error('Error saving manual calories:', error);
      Alert.alert('Error', 'Failed to save calories');
    }
  };

  const renderDeviceCard = (device: any, isConnected: boolean = false) => {
    const connection = connections.find(conn => conn.device.type === device.id);
    const isWhoop = device.id === 'whoop';
    const whoopIsConnected = isWhoop ? whoopConnected : false;
    const actualConnected = isWhoop ? whoopIsConnected : isConnected;
    
    return (
      <View key={device.id} style={styles.deviceCard}>
        <LinearGradient
          colors={actualConnected ? [device.color + '20', device.color + '10'] : ['#1F2937', '#111111']}
          style={styles.deviceGradient}
        >
          <View style={styles.deviceHeader}>
            <View style={[styles.deviceIcon, { backgroundColor: device.color + '20' }]}>
              <Ionicons name={device.icon as any} size={24} color={device.color} />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceStatus}>
                {actualConnected ? 'Connected' : 'Not Connected'}
              </Text>
              {isWhoop && whoopCalories !== null && (
                <Text style={styles.deviceData}>
                  {whoopCalories} calories burned today
                </Text>
              )}
            </View>
            <View style={styles.deviceActions}>
              {actualConnected ? (
                <>
                  <TouchableOpacity
                    style={styles.syncButton}
                    onPress={() => handleSyncDevice(isWhoop ? 'whoop' : connection!.device.id)}
                    disabled={syncing}
                  >
                    <Ionicons name="refresh" size={16} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={() => isWhoop ? handleWhoopConnection() : handleDisconnectDevice(connection!.device.id)}
                  >
                    <Ionicons name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => handleConnectDevice(device)}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {isConnected && connection && (
            <View style={styles.deviceDetails}>
              <Text style={styles.lastSync}>
                Last sync: {connection.lastSync ? 
                  new Date(connection.lastSync).toLocaleString() : 
                  'Never'
                }
              </Text>
              <View style={styles.syncStatus}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: 
                    connection.syncStatus === 'success' ? '#10B981' :
                    connection.syncStatus === 'error' ? '#EF4444' :
                    connection.syncStatus === 'syncing' ? '#F59E0B' : '#6B7280'
                  }
                ]} />
                <Text style={styles.statusText}>
                  {connection.syncStatus === 'syncing' ? 'Syncing...' :
                   connection.syncStatus === 'success' ? 'Synced' :
                   connection.syncStatus === 'error' ? 'Error' : 'Idle'}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading wearable devices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.pageTitle}>Wearable Integration</Text>
          <Text style={styles.pageSubtitle}>Connect your fitness devices</Text>
        </View>
        <TouchableOpacity 
          style={styles.syncAllButton}
          onPress={handleSyncAll}
          disabled={syncing || connections.length === 0}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connected Devices */}
        {(connections.length > 0 || whoopConnected) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected Devices</Text>
            {connections.map(connection => 
              renderDeviceCard(
                supportedDevices.find(d => d.id === connection.device.type)!,
                true
              )
            )}
            {whoopConnected && (
              renderDeviceCard(
                supportedDevices.find(d => d.id === 'whoop')!,
                true
              )
            )}
          </View>
        )}

        {/* Available Devices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          {supportedDevices.map(device => {
            const isConnected = connections.some(conn => conn.device.type === device.id);
            const isWhoopConnected = device.id === 'whoop' && whoopConnected;
            const shouldShow = !isConnected && !isWhoopConnected;
            
            return shouldShow ? renderDeviceCard(device, false) : null;
          })}
        </View>

        {/* Manual Input Section */}
        <View style={styles.manualInputSection}>
          <Text style={styles.manualInputTitle}>Quick Manual Input</Text>
          <Text style={styles.manualInputSubtitle}>
            Don't have a connected device? Manually input your calories burned from your Whoop app or other fitness tracker.
          </Text>
          <TouchableOpacity
            style={styles.manualInputButton}
            onPress={handleManualInput}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.manualInputGradient}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.manualInputButtonText}>Input Calories Burned</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why Connect Your Wearable?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="flame" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Automatic calorie burn tracking</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="heart" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Heart rate monitoring</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="moon" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Sleep quality analysis</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="fitness" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Activity and recovery insights</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Comprehensive fitness analytics</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Connect Device Modal */}
      <Modal
        visible={showConnectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConnectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect {selectedDevice?.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowConnectModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.devicePreview}>
                <View style={[styles.deviceIconLarge, { backgroundColor: selectedDevice?.color + '20' }]}>
                  <Ionicons name={selectedDevice?.icon as any} size={48} color={selectedDevice?.color} />
                </View>
                <Text style={styles.devicePreviewName}>{selectedDevice?.name}</Text>
              </View>

              <Text style={styles.modalDescription}>
                Connect your {selectedDevice?.name} to automatically sync:
              </Text>

              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>• Calories burned</Text>
                <Text style={styles.featureItem}>• Heart rate data</Text>
                <Text style={styles.featureItem}>• Sleep metrics</Text>
                <Text style={styles.featureItem}>• Activity tracking</Text>
                <Text style={styles.featureItem}>• Recovery scores</Text>
              </View>

              <TouchableOpacity
                style={styles.connectModalButton}
                onPress={() => openDeviceAuth(selectedDevice)}
              >
                <LinearGradient
                  colors={[selectedDevice?.color || '#10B981', selectedDevice?.color + 'CC' || '#059669']}
                  style={styles.connectButtonGradient}
                >
                  <Text style={styles.connectButtonText}>Connect {selectedDevice?.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manual Input Modal */}
      <Modal
        visible={showManualInput}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Input Calories Burned</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowManualInput(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Enter the calories burned from your Whoop app or other fitness tracker for today:
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Calories Burned</Text>
                <TextInput
                  style={styles.calorieInput}
                  value={manualCalories}
                  onChangeText={setManualCalories}
                  placeholder="972"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  autoFocus={true}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveManualCalories}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Calories</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  syncAllButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  deviceCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deviceGradient: {
    padding: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  deviceData: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 2,
    fontWeight: '600',
  },
  deviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  connectButton: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButton: {
    backgroundColor: '#1F2937',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#1F2937',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  lastSync: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  benefitsSection: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 16,
    color: '#10B981',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    alignItems: 'center',
  },
  devicePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deviceIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  devicePreviewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  connectModalButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  connectButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  manualInputSection: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  manualInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  manualInputSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  manualInputButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  manualInputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  manualInputButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  calorieInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});



