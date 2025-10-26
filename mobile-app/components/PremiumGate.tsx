import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthProvider';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  description: string;
  onUpgrade?: () => void;
}

export default function PremiumGate({ children, feature, description, onUpgrade }: PremiumGateProps) {
  const { isPremium, applyPromoCode } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      const success = await applyPromoCode(promoCode.trim());
      if (success) {
        Alert.alert('Success!', 'Promo code applied successfully! You now have premium access.');
        setShowUpgradeModal(false);
        setPromoCode('');
      } else {
        Alert.alert('Error', 'Invalid or already used promo code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply promo code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Blurred Content */}
      <View style={styles.blurredContent}>
        {children}
      </View>

      {/* Premium Overlay */}
      <View style={styles.overlay}>
        <View style={styles.premiumCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color="#F59E0B" />
          </View>
          
          <Text style={styles.title}>Unlock {feature}</Text>
          <Text style={styles.description}>
            {description} with a premium subscription.
          </Text>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Access to all premium features</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.benefitText}>AI-powered recommendations</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Advanced analytics and insights</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Priority customer support</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => onUpgrade ? onUpgrade() : setShowUpgradeModal(true)}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
            >
              <Ionicons name="star" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Upgrade to Premium</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.promoButton}
            onPress={() => setShowUpgradeModal(true)}
          >
            <Text style={styles.promoText}>Have a promo code? Enter it here</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upgrade Modal */}
      <Modal
        visible={showUpgradeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upgrade to Premium</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUpgradeModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.pricingContainer}>
              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>Monthly</Text>
                <Text style={styles.pricingPrice}>$5<Text style={styles.pricingPeriod}>/month</Text></Text>
                <Text style={styles.pricingDescription}>Full access to all features</Text>
              </View>
              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>Yearly</Text>
                <Text style={styles.pricingPrice}>$50<Text style={styles.pricingPeriod}>/year</Text></Text>
                <Text style={styles.pricingDescription}>Save 17% with yearly billing</Text>
              </View>
            </View>

            <View style={styles.promoSection}>
              <Text style={styles.promoSectionTitle}>Have a promo code?</Text>
              <View style={styles.promoInputContainer}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter promo code"
                  placeholderTextColor="#6B7280"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.applyButton, loading && styles.disabledButton]}
                  onPress={handlePromoCode}
                  disabled={loading}
                >
                  <Text style={styles.applyButtonText}>
                    {loading ? 'Applying...' : 'Apply'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.promoHint}>
                Try: <Text style={styles.promoCodeHint}>Enter a valid code</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => {
                onUpgrade();
                setShowUpgradeModal(false);
              }}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Start Free Trial</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  blurredContent: {
    flex: 1,
    opacity: 0.3,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  premiumCard: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#1F2937',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  benefits: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  promoButton: {
    paddingVertical: 8,
  },
  promoText: {
    color: '#10B981',
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111111',
    borderRadius: 20,
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  pricingPeriod: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: 'normal',
  },
  pricingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  promoSection: {
    marginBottom: 24,
  },
  promoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
  },
  applyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  promoHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  promoCodeHint: {
    color: '#10B981',
    fontWeight: '600',
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
