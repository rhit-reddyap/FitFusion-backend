import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import ReferralCodeInput from './ReferralCodeInput';

interface SignUpScreenProps {
  onSwitchToSignIn: () => void;
  onSignUpSuccess: () => void;
}

export default function SignUpScreen({ onSwitchToSignIn, onSignUpSuccess }: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const auth = useAuth();
  const { signUp } = auth || {};

  const handleSignUp = async () => {
    if (!signUp) {
      Alert.alert('Error', 'Authentication not ready. Please try again.');
      return;
    }

    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Check if user is trying too quickly (rate limiting protection)
    const now = Date.now();
    if (now - lastAttemptTime < 5000) { // 5 seconds between attempts
      Alert.alert(
        'Please Wait', 
        'Please wait a moment before trying to sign up again.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLastAttemptTime(now);
    setLoading(true);
    try {
      const success = await signUp(email, password, displayName, referralCode);
      if (success) {
        // Check if user needs to confirm email
        const { data: { user } } = await supabase.auth.getUser();
        
        // Account created successfully - proceed to app
        if (referralCode.trim()) {
          Alert.alert(
            'Welcome! 🎉', 
            'Account created successfully! You\'ll get your first month free thanks to the referral code!',
            [{ text: 'Continue', onPress: onSignUpSuccess }]
          );
        } else {
          onSignUpSuccess();
        }
      } else {
        Alert.alert(
          'Sign Up Failed', 
          'Unable to create account. This might be due to:\n\n• Email already in use\n• Network connection issues\n• Server temporarily unavailable\n\nPlease try again in a moment.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert(
        'Sign Up Error', 
        'Something went wrong. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={['#000000', '#0a0a0a']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/fitfusionicon.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Fit Fusion AI</Text>
            </View>
            <Text style={styles.subtitle}>Create your account to get started</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor="#6B7280"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#6B7280"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>

            {/* Referral Code Input */}
            <ReferralCodeInput
              onReferralApplied={(success, code) => {
                if (success && code) {
                  setReferralCode(code);
                }
              }}
              disabled={loading}
            />

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <Text style={styles.buttonText}>Creating Account...</Text>
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={onSwitchToSignIn}
            >
              <Text style={styles.switchButtonText}>
                Already have an account? <Text style={styles.switchButtonHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#FFFFFF',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  signUpButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1F2937',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    marginHorizontal: 16,
  },
  switchButton: {
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  switchButtonHighlight: {
    color: '#10B981',
    fontWeight: '600',
  },
});