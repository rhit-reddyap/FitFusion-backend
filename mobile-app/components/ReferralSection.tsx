import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ReferralService, { ReferralData, ReferralReward } from '../services/referralService';
import { useAuth } from './AuthProvider';

interface ReferralSectionProps {
  visible: boolean;
  onClose?: () => void;
}

export default function ReferralSection({ visible, onClose }: ReferralSectionProps) {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get referral code first
      const referralCode = await ReferralService.getUserReferralCode(user.id);
      
      // Get stats and rewards
      const [stats, rewards] = await Promise.all([
        ReferralService.getUserReferralStats(user.id),
        ReferralService.getUserReferralRewards(user.id)
      ]);

      // Ensure we have a referral code
      const finalStats = {
        ...stats,
        referralCode: stats.referralCode || referralCode
      };

      setReferralData(finalStats);
      setReferralRewards(rewards);
    } catch (error) {
      console.error('Error loading referral data:', error);
      // Don't show alert, just set default data
      setReferralData({
        referralCode: 'GENERATING...',
        referralCount: 0,
        totalRewards: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralData?.referralCode && referralData.referralCode !== 'GENERATING...') {
      Clipboard.setString(referralData.referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } else {
      Alert.alert('Generating Code', 'Your referral code is being generated. Please try again in a moment.');
    }
  };

  const shareReferralCode = async () => {
    if (referralData?.referralCode && referralData.referralCode !== 'GENERATING...') {
      try {
        const shareText = ReferralService.getReferralShareText(referralData.referralCode);
        await Share.share({
          message: shareText,
          title: 'Join Fit Fusion AI!'
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      Alert.alert('Generating Code', 'Your referral code is being generated. Please try again in a moment.');
    }
  };

  const getRewardStatusText = (reward: ReferralReward) => {
    const now = new Date();
    const expiresAt = new Date(reward.expiresAt);
    
    if (reward.status === 'applied') {
      return 'Applied';
    } else if (expiresAt < now) {
      return 'Expired';
    } else {
      return 'Pending';
    }
  };

  const getRewardStatusColor = (reward: ReferralReward) => {
    const now = new Date();
    const expiresAt = new Date(reward.expiresAt);
    
    if (reward.status === 'applied') {
      return '#10B981';
    } else if (expiresAt < now) {
      return '#EF4444';
    } else {
      return '#F59E0B';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading referral data...</Text>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Refer Friends</Text>
            <Text style={styles.subtitle}>Earn free months for each friend you refer!</Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

      {/* Referral Code Section */}
      <View style={styles.referralCodeSection}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
          style={styles.referralCodeCard}
        >
          <View style={styles.referralCodeHeader}>
            <Ionicons name="gift" size={24} color="#10B981" />
            <Text style={styles.referralCodeTitle}>Your Referral Code</Text>
          </View>
          
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCode}>
              {referralData?.referralCode || 'Loading...'}
            </Text>
            {referralData?.referralCode === 'GENERATING...' && (
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={loadReferralData}
              >
                <Ionicons name="refresh" size={16} color="#10B981" />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.referralCodeActions}>
            <TouchableOpacity style={styles.copyButton} onPress={copyReferralCode}>
              <Ionicons name="copy" size={16} color="#10B981" />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton} onPress={shareReferralCode}>
              <Ionicons name="share" size={16} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{referralData?.referralCount || 0}</Text>
          <Text style={styles.statLabel}>Friends Referred</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{referralData?.totalRewards || 0}</Text>
          <Text style={styles.statLabel}>Free Months Earned</Text>
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Share your referral code with friends</Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Friend signs up using your code</Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>You get 30 days free! 🎉</Text>
          </View>
        </View>
      </View>

      {/* Rewards History */}
      {referralRewards.length > 0 && (
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Your Rewards</Text>
          {referralRewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardType}>
                  {reward.rewardValue} days free
                </Text>
                <Text style={styles.rewardDate}>
                  {new Date(reward.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.rewardStatus}>
                <Text style={[styles.rewardStatusText, { color: getRewardStatusColor(reward) }]}>
                  {getRewardStatusText(reward)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralCodeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  referralCodeCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  referralCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralCodeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  referralCodeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  referralCode: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 2,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  retryButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  referralCodeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  copyButtonText: {
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  stepContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  rewardsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  rewardCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rewardDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  rewardStatus: {
    alignItems: 'flex-end',
  },
  rewardStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

