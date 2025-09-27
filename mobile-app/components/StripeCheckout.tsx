import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import { SUBSCRIPTION_PLANS, STRIPE_CONFIG } from '../config/stripe';
import { useAuth } from './AuthProvider';

interface StripeCheckoutProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (subscriptionId: string) => void;
  selectedPlan: 'monthly' | 'yearly';
}

export default function StripeCheckout({ 
  visible, 
  onClose, 
  onSuccess, 
  selectedPlan 
}: StripeCheckoutProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);

  const plan = SUBSCRIPTION_PLANS[selectedPlan];

  // Initialize payment sheet when component mounts or plan changes
  useEffect(() => {
    if (visible && user) {
      initializePaymentSheet();
    }
  }, [visible, selectedPlan, user]);

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);

      // Create payment intent on your backend
      const response = await fetch(`${STRIPE_CONFIG.apiUrl}/api/stripe/create-payment-intent-working`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(plan.price * 100), // Convert to cents
          currency: plan.currency,
          planId: plan.id,
          customerId: user?.id,
        }),
      });

      const { clientSecret, customerId, ephemeralKey } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Initialize payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Fit Fusion AI',
        customerId: customerId,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        returnURL: 'fitfusionai://stripe-return',
      });

      if (error) {
        console.error('Payment sheet initialization error:', error);
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        return;
      }

      setPaymentSheetEnabled(true);
    } catch (error) {
      console.error('Initialize payment sheet error:', error);
      Alert.alert('Error', 'Failed to set up payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!paymentSheetEnabled) {
      Alert.alert('Error', 'Payment not ready. Please wait and try again.');
      return;
    }

    try {
      setProcessing(true);

      // Present payment sheet
      const { error } = await presentPaymentSheet();

      if (error) {
        console.error('Payment sheet error:', error);
        if (error.code === 'Canceled') {
          // User canceled, no need to show error
          return;
        }
        Alert.alert('Payment Failed', error.message || 'Payment was not completed. Please try again.');
        return;
      }

      // Payment succeeded
      Alert.alert(
        'Success!', 
        `Welcome to ${plan.name}! You now have access to all premium features.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess('sub_stripe_subscription_id');
              onClose();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePromoCode = () => {
    Alert.alert(
      'Promo Code',
      'Enter "freshmanfriday" in the profile section to get free premium access!',
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.planContainer}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                ${plan.price}
                <Text style={styles.planPeriod}>/{plan.interval}</Text>
              </Text>
            </View>
            <Text style={styles.planDescription}>{plan.description}</Text>

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>What you get:</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.benefitText}>AI-powered meal planning</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="fitness" size={16} color="#8B5CF6" />
              <Text style={styles.benefitText}>Advanced workout tracking</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="analytics" size={16} color="#3B82F6" />
              <Text style={styles.benefitText}>Comprehensive analytics</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="people" size={16} color="#EF4444" />
              <Text style={styles.benefitText}>Community features</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="headset" size={16} color="#10B981" />
              <Text style={styles.benefitText}>Priority support</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.subscribeButton, (loading || processing) && styles.disabledButton]}
              onPress={handleSubscribe}
              disabled={loading || processing}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : processing ? (
                  <Text style={styles.buttonText}>Processing...</Text>
                ) : (
                  <Text style={styles.buttonText}>
                    Subscribe for ${plan.price}/{plan.interval}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.promoButton} onPress={handlePromoCode}>
              <Text style={styles.promoText}>
                Have a promo code? Get free access!
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            You can cancel anytime. No commitment required.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  planContainer: {
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  planPeriod: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: 'normal',
  },
  planDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  benefitsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  subscribeButton: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  promoButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  promoText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
