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

interface SubscriptionManagementProps {
  visible: boolean;
  onClose: () => void;
  user: any;
}

export default function SubscriptionManagement({ 
  visible, 
  onClose, 
  user 
}: SubscriptionManagementProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadSubscription();
    }
  }, [visible, user]);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch the user's subscription from your backend
      // For now, we'll simulate having an active subscription
      const mockSubscription: Subscription = {
        id: 'sub_mock_123',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan: {
          id: 'price_1RyHEb0yFM5cg5nbtjk5Cnzn',
          name: 'Monthly Premium',
          amount: 500, // $5.00 in cents
          interval: 'month'
        }
      };
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel'
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: confirmCancelSubscription
        }
      ]
    );
  };

  const confirmCancelSubscription = async () => {
    setCanceling(true);
    try {
      const response = await fetch(`${STRIPE_CONFIG.apiUrl}/api/stripe/cancel-subscription-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(data.subscription);
        Alert.alert(
          'Subscription Canceled',
          data.message,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  if (!subscription) {
    return (
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Subscription Management</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading subscription...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Subscription Management</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.subscriptionContainer}>
            <View style={styles.subscriptionHeader}>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  subscription.status === 'active' ? styles.activeBadge : styles.canceledBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    subscription.status === 'active' ? styles.activeText : styles.canceledText
                  ]}>
                    {subscription.status === 'active' ? 'Active' : 'Canceled'}
                  </Text>
                </View>
              </View>
              <Text style={styles.planName}>{subscription.plan.name}</Text>
              <Text style={styles.planPrice}>
                {formatAmount(subscription.plan.amount)}/{subscription.plan.interval}
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={20} color="#6B7280" />
                <Text style={styles.detailLabel}>Next billing date:</Text>
                <Text style={styles.detailValue}>
                  {subscription.status === 'active' 
                    ? formatDate(subscription.current_period_end)
                    : 'N/A'
                  }
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="card" size={20} color="#6B7280" />
                <Text style={styles.detailLabel}>Payment method:</Text>
                <Text style={styles.detailValue}>•••• 4242</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="time" size={20} color="#6B7280" />
                <Text style={styles.detailLabel}>Subscription ID:</Text>
                <Text style={styles.detailValue}>{subscription.id}</Text>
              </View>
            </View>

            {subscription.status === 'active' && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelSubscription}
                  disabled={canceling}
                >
                  {canceling ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={() => {
                    Alert.alert(
                      'Manage Billing',
                      'This would open Stripe\'s customer portal where you can update payment methods, view invoices, and manage your subscription.',
                      [{ text: 'OK' }]
                    );
                  }}
                >
                  <Ionicons name="settings" size={20} color="#10B981" />
                  <Text style={styles.manageButtonText}>Manage Billing</Text>
                </TouchableOpacity>
              </View>
            )}

            {subscription.status === 'canceled' && (
              <View style={styles.canceledContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                <Text style={styles.canceledTitle}>Subscription Canceled</Text>
                <Text style={styles.canceledText}>
                  Your subscription has been canceled. You will retain access until the end of your current billing period.
                </Text>
              </View>
            )}
          </View>
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  subscriptionContainer: {
    gap: 20,
  },
  subscriptionHeader: {
    alignItems: 'center',
    gap: 8,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#10B981',
  },
  canceledBadge: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#FFFFFF',
  },
  canceledText: {
    color: '#FFFFFF',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planPrice: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  manageButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  canceledContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  canceledTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  canceledText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
