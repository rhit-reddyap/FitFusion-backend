import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AIService from '../services/aiService';

interface AISettingsProps {
  visible: boolean;
  onClose: () => void;
}

export default function AISettings({ visible, onClose }: AISettingsProps) {
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'anthropic' | 'google'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // TODO: Load from user preferences
    // For now, we'll use placeholder values
    setIsEnabled(false);
    setApiKey('');
  };

  const saveSettings = async () => {
    try {
      if (isEnabled && !apiKey.trim()) {
        Alert.alert('Error', 'Please enter your API key');
        return;
      }

      if (isEnabled && apiKey.trim()) {
        AIService.setProvider(selectedProvider, apiKey.trim());
      }

      // TODO: Save to user preferences
      Alert.alert('Success', 'AI settings saved successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save AI settings');
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your API key first');
      return;
    }

    setShowTestModal(true);
    setTestResult('Testing connection...');

    try {
      AIService.setProvider(selectedProvider, apiKey.trim());
      
      // Test with a simple query
      const response = await AIService.answerQuery({
        query: 'Hello, can you help me with fitness advice?',
        context: {
          userGoals: ['general fitness'],
          fitnessLevel: 'beginner'
        }
      });

      setTestResult('✅ Connection successful! AI is ready to help you.');
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const providers = [
    {
      id: 'openai' as const,
      name: 'OpenAI (GPT-4)',
      description: 'Most advanced AI for complex fitness and nutrition advice',
      icon: 'logo-openai',
      color: '#10A37F'
    },
    {
      id: 'anthropic' as const,
      name: 'Anthropic (Claude)',
      description: 'Excellent for detailed meal planning and workout analysis',
      icon: 'leaf',
      color: '#D97706'
    },
    {
      id: 'google' as const,
      name: 'Google (Gemini)',
      description: 'Good for general fitness questions and quick advice',
      icon: 'logo-google',
      color: '#4285F4'
    }
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* AI Status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AI Assistant</Text>
              <Switch
                value={isEnabled}
                onValueChange={setIsEnabled}
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor={isEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <Text style={styles.sectionDescription}>
              Enable AI-powered workout and meal plan generation
            </Text>
          </View>

          {isEnabled && (
            <>
              {/* Provider Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI Provider</Text>
                <Text style={styles.sectionDescription}>
                  Choose your preferred AI provider
                </Text>
                
                {providers.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    style={[
                      styles.providerCard,
                      selectedProvider === provider.id && styles.selectedProviderCard
                    ]}
                    onPress={() => setSelectedProvider(provider.id)}
                  >
                    <View style={styles.providerInfo}>
                      <View style={[styles.providerIcon, { backgroundColor: provider.color }]}>
                        <Ionicons name={provider.icon as any} size={24} color="#FFFFFF" />
                      </View>
                      <View style={styles.providerDetails}>
                        <Text style={styles.providerName}>{provider.name}</Text>
                        <Text style={styles.providerDescription}>{provider.description}</Text>
                      </View>
                    </View>
                    {selectedProvider === provider.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* API Key */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>API Key</Text>
                <Text style={styles.sectionDescription}>
                  Enter your {providers.find(p => p.id === selectedProvider)?.name} API key
                </Text>
                
                <TextInput
                  style={styles.apiKeyInput}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Enter your API key"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  multiline
                />
                
                <TouchableOpacity style={styles.testButton} onPress={testConnection}>
                  <Ionicons name="flash" size={20} color="#FFFFFF" />
                  <Text style={styles.testButtonText}>Test Connection</Text>
                </TouchableOpacity>
              </View>

              {/* Features */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI Features</Text>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="barbell" size={20} color="#10B981" />
                    <Text style={styles.featureText}>Personalized workout generation</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="restaurant" size={20} color="#10B981" />
                    <Text style={styles.featureText}>Custom meal plan creation</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="chatbubble" size={20} color="#10B981" />
                    <Text style={styles.featureText}>24/7 fitness and nutrition advice</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="analytics" size={20} color="#10B981" />
                    <Text style={styles.featureText}>Progress analysis and recommendations</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Test Modal */}
        <Modal visible={showTestModal} transparent animationType="fade">
          <View style={styles.testModalOverlay}>
            <View style={styles.testModal}>
              <Text style={styles.testModalTitle}>Testing AI Connection</Text>
              <Text style={styles.testResult}>{testResult}</Text>
              <TouchableOpacity
                style={styles.testModalButton}
                onPress={() => setShowTestModal(false)}
              >
                <Text style={styles.testModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  providerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedProviderCard: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  apiKeyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
    minHeight: 60,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featureList: {
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  testModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  testResult: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  testModalButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  testModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});






