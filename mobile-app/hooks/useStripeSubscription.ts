import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../components/AuthProvider';
import { STRIPE_CONFIG } from '../config/stripe';

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_end: string;
  plan: {
    id: string;
    name: string;
    amount: number;
    interval: string;
  };
}

export const useStripeSubscription = () => {
  const { user, isPremium } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock subscription data - replace with real API calls
  useEffect(() => {
    if (isPremium && user) {
      // Simulate fetching subscription data
      const mockSubscription: Subscription = {
        id: 'sub_mock_123',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan: {
          id: 'monthly_premium',
          name: 'Monthly Premium',
          amount: 500, // $5.00 in cents
          interval: 'month'
        }
      };
      setSubscription(mockSubscription);
    }
  }, [isPremium, user]);

  const createSubscription = async (planId: string, paymentMethodId: string) => {
    setLoading(true);
    try {
      // Call your backend API to create subscription
      const response = await fetch(`${STRIPE_CONFIG.apiUrl}/api/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          paymentMethodId,
          customerId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSubscription(data.subscription);
      return { success: true, subscription: data.subscription };
    } catch (error) {
      console.error('Create subscription error:', error);
      Alert.alert('Error', 'Failed to create subscription. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      // Call your backend API to cancel subscription
      const response = await fetch(`${STRIPE_CONFIG.apiUrl}/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSubscription(null);
      Alert.alert('Success', 'Subscription canceled successfully.');
      return { success: true };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethod = async (paymentMethodId: string) => {
    if (!subscription) return;

    setLoading(true);
    try {
      // Call your backend API to update payment method
      const response = await fetch(`${STRIPE_CONFIG.apiUrl}/api/update-payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          paymentMethodId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      Alert.alert('Success', 'Payment method updated successfully.');
      return { success: true };
    } catch (error) {
      console.error('Update payment method error:', error);
      Alert.alert('Error', 'Failed to update payment method. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getBillingPortalUrl = async () => {
    try {
      // Call your backend API to get billing portal URL
      const response = await fetch(`${STRIPE_CONFIG.apiUrl}/api/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user?.id,
          returnUrl: 'fitfusionai://billing-return',
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.url;
    } catch (error) {
      console.error('Get billing portal error:', error);
      Alert.alert('Error', 'Failed to open billing portal. Please try again.');
      return null;
    }
  };

  return {
    subscription,
    loading,
    createSubscription,
    cancelSubscription,
    updatePaymentMethod,
    getBillingPortalUrl,
  };
};

