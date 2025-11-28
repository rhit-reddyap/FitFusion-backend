import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReferralService from '../services/referralService';

interface ReferralCodeInputProps {
  onReferralApplied: (success: boolean, code?: string) => void;
  disabled?: boolean;
}

export default function ReferralCodeInput({ onReferralApplied, disabled = false }: ReferralCodeInputProps) {
  const [referralCode, setReferralCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateReferralCode = async () => {
    if (!referralCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a referral code');
      return;
    }

    try {
      setValidating(true);
      const isValidCode = await ReferralService.validateReferralCode(referralCode.trim().toUpperCase());
      
      if (isValidCode) {
        setIsValid(true);
        Alert.alert(
          'Valid Code! 🎉',
          'You\'ll get a free month when you sign up with this code!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Use Code', onPress: () => onReferralApplied(true, referralCode.trim().toUpperCase()) }
          ]
        );
      } else {
        setIsValid(false);
        Alert.alert('Invalid Code', 'This referral code doesn\'t exist. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      Alert.alert('Error', 'Failed to validate referral code. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const clearCode = () => {
    setReferralCode('');
    setIsValid(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Have a referral code? (Optional)</Text>
      <Text style={styles.description}>
        Enter a friend's referral code to get your first month free! 🎁
      </Text>
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              isValid === true && styles.inputValid,
              isValid === false && styles.inputInvalid,
              disabled && styles.inputDisabled
            ]}
            value={referralCode}
            onChangeText={(text) => {
              setReferralCode(text.toUpperCase());
              setIsValid(null);
            }}
            placeholder="Enter referral code"
            placeholderTextColor="#6B7280"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!disabled}
            maxLength={8}
          />
          
          {referralCode.length > 0 && !disabled && (
            <TouchableOpacity onPress={clearCode} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        {!disabled && (
          <TouchableOpacity
            style={[
              styles.validateButton,
              (!referralCode.trim() || validating) && styles.validateButtonDisabled
            ]}
            onPress={validateReferralCode}
            disabled={!referralCode.trim() || validating}
          >
            {validating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.validateButtonText}>Validate</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {isValid === true && (
        <View style={styles.successMessage}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.successText}>Valid referral code! You'll get 30 days free! 🎉</Text>
        </View>
      )}
      
      {isValid === false && (
        <View style={styles.errorMessage}>
          <Ionicons name="close-circle" size={16} color="#EF4444" />
          <Text style={styles.errorText}>Invalid referral code. Please check and try again.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  inputValid: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  inputInvalid: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  validateButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

