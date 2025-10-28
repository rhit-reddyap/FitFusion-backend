import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://fitfusion-backend.vercel.app';

export default function StripeCheckoutSimple({ userId, planName = 'Premium', priceId }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Create checkout session
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: userId,
          successUrl: 'fitfusionai://premium-success',
          cancelUrl: 'fitfusionai://premium-cancel',
        }),
      });

      const { url, error } = await response.json();

      if (error || !url) {
        throw new Error(error || 'Failed to create checkout session');
      }

      // Open Stripe Checkout
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open payment page');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', error.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handleCheckout}
      disabled={loading}
    >
      <Ionicons name="card-outline" size={20} color="#fff" />
      <Text style={styles.buttonText}>
        {loading ? 'Loading...' : `Subscribe to ${planName}`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});