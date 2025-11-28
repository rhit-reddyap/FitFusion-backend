import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TeamChallengeCreatorProps {
  visible: boolean;
  onClose: () => void;
  onCreateChallenge: (challenge: any) => void;
}

export default function TeamChallengeCreator({ visible, onClose, onCreateChallenge }: TeamChallengeCreatorProps) {
  const [challengeData, setChallengeData] = useState({
    title: '',
    description: '',
    type: 'workout',
    duration: 7,
    reward: '',
    requirements: {
      minWorkouts: 0,
      minPoints: 0,
      minStreak: 0
    },
    settings: {
      isPublic: true,
      allowLateJoin: true,
      requireApproval: false,
      maxParticipants: 50
    }
  });

  const challengeTypes = [
    { id: 'workout', name: 'Workout Challenge', icon: 'fitness', color: '#10B981' },
    { id: 'nutrition', name: 'Nutrition Challenge', icon: 'restaurant', color: '#F59E0B' },
    { id: 'cardio', name: 'Cardio Challenge', icon: 'heart', color: '#EF4444' },
    { id: 'strength', name: 'Strength Challenge', icon: 'fitness', color: '#8B5CF6' },
    { id: 'flexibility', name: 'Flexibility Challenge', icon: 'body', color: '#06B6D4' },
    { id: 'endurance', name: 'Endurance Challenge', icon: 'flame', color: '#F97316' }
  ];

  const durationOptions = [
    { value: 1, label: '1 Day' },
    { value: 3, label: '3 Days' },
    { value: 7, label: '1 Week' },
    { value: 14, label: '2 Weeks' },
    { value: 30, label: '1 Month' },
    { value: 60, label: '2 Months' }
  ];

  const rewardTypes = [
    { id: 'points', name: 'Team Points', icon: 'diamond' },
    { id: 'badge', name: 'Team Badge', icon: 'trophy' },
    { id: 'xp', name: 'Experience Points', icon: 'star' },
    { id: 'custom', name: 'Custom Reward', icon: 'gift' }
  ];

  const handleCreateChallenge = () => {
    if (!challengeData.title.trim()) {
      Alert.alert('Error', 'Please enter a challenge title.');
      return;
    }

    if (!challengeData.description.trim()) {
      Alert.alert('Error', 'Please enter a challenge description.');
      return;
    }

    const challenge = {
      id: Date.now().toString(),
      ...challengeData,
      createdAt: new Date().toISOString(),
      participants: 0,
      status: 'active'
    };

    onCreateChallenge(challenge);
    onClose();
    
    Alert.alert(
      'Challenge Created!',
      'Your team challenge has been created and is now active.'
    );
  };

  const renderChallengeType = (type: any) => (
    <TouchableOpacity
      key={type.id}
      style={[
        styles.typeButton,
        challengeData.type === type.id && styles.selectedType,
        { borderColor: type.color }
      ]}
      onPress={() => setChallengeData({...challengeData, type: type.id})}
    >
      <Ionicons
        name={type.icon as any}
        size={24}
        color={challengeData.type === type.id ? type.color : '#6B7280'}
      />
      <Text style={[
        styles.typeText,
        challengeData.type === type.id && { color: type.color }
      ]}>
        {type.name}
      </Text>
    </TouchableOpacity>
  );

  const renderDurationOption = (option: any) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.durationButton,
        challengeData.duration === option.value && styles.selectedDuration
      ]}
      onPress={() => setChallengeData({...challengeData, duration: option.value})}
    >
      <Text style={[
        styles.durationText,
        challengeData.duration === option.value && styles.selectedDurationText
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderRewardType = (reward: any) => (
    <TouchableOpacity
      key={reward.id}
      style={[
        styles.rewardButton,
        challengeData.reward === reward.id && styles.selectedReward
      ]}
      onPress={() => setChallengeData({...challengeData, reward: reward.id})}
    >
      <Ionicons
        name={reward.icon as any}
        size={20}
        color={challengeData.reward === reward.id ? '#10B981' : '#6B7280'}
      />
      <Text style={[
        styles.rewardText,
        challengeData.reward === reward.id && styles.selectedRewardText
      ]}>
        {reward.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Team Challenge</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Challenge Details</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Challenge Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter challenge title..."
                  placeholderTextColor="#6B7280"
                  value={challengeData.title}
                  onChangeText={(text) => setChallengeData({...challengeData, title: text})}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the challenge goals and rules..."
                  placeholderTextColor="#6B7280"
                  value={challengeData.description}
                  onChangeText={(text) => setChallengeData({...challengeData, description: text})}
                  multiline
                />
              </View>
            </View>

            {/* Challenge Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Challenge Type</Text>
              <View style={styles.typesGrid}>
                {challengeTypes.map(renderChallengeType)}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <View style={styles.durationGrid}>
                {durationOptions.map(renderDurationOption)}
              </View>
            </View>

            {/* Requirements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              <View style={styles.requirementsGrid}>
                <View style={styles.requirementItem}>
                  <Text style={styles.requirementLabel}>Min Workouts</Text>
                  <TextInput
                    style={styles.requirementInput}
                    placeholder="0"
                    placeholderTextColor="#6B7280"
                    value={challengeData.requirements.minWorkouts.toString()}
                    onChangeText={(text) => setChallengeData({
                      ...challengeData,
                      requirements: {...challengeData.requirements, minWorkouts: parseInt(text) || 0}
                    })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.requirementItem}>
                  <Text style={styles.requirementLabel}>Min Points</Text>
                  <TextInput
                    style={styles.requirementInput}
                    placeholder="0"
                    placeholderTextColor="#6B7280"
                    value={challengeData.requirements.minPoints.toString()}
                    onChangeText={(text) => setChallengeData({
                      ...challengeData,
                      requirements: {...challengeData.requirements, minPoints: parseInt(text) || 0}
                    })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.requirementItem}>
                  <Text style={styles.requirementLabel}>Min Streak</Text>
                  <TextInput
                    style={styles.requirementInput}
                    placeholder="0"
                    placeholderTextColor="#6B7280"
                    value={challengeData.requirements.minStreak.toString()}
                    onChangeText={(text) => setChallengeData({
                      ...challengeData,
                      requirements: {...challengeData.requirements, minStreak: parseInt(text) || 0}
                    })}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Rewards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rewards</Text>
              <View style={styles.rewardsGrid}>
                {rewardTypes.map(renderRewardType)}
              </View>
            </View>

            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Challenge Settings</Text>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Public Challenge</Text>
                  <Switch
                    value={challengeData.settings.isPublic}
                    onValueChange={(value) => setChallengeData({
                      ...challengeData,
                      settings: {...challengeData.settings, isPublic: value}
                    })}
                    trackColor={{ false: '#1F2937', true: '#10B981' }}
                    thumbColor={challengeData.settings.isPublic ? '#FFFFFF' : '#6B7280'}
                  />
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Allow Late Join</Text>
                  <Switch
                    value={challengeData.settings.allowLateJoin}
                    onValueChange={(value) => setChallengeData({
                      ...challengeData,
                      settings: {...challengeData.settings, allowLateJoin: value}
                    })}
                    trackColor={{ false: '#1F2937', true: '#10B981' }}
                    thumbColor={challengeData.settings.allowLateJoin ? '#FFFFFF' : '#6B7280'}
                  />
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Require Approval</Text>
                  <Switch
                    value={challengeData.settings.requireApproval}
                    onValueChange={(value) => setChallengeData({
                      ...challengeData,
                      settings: {...challengeData.settings, requireApproval: value}
                    })}
                    trackColor={{ false: '#1F2937', true: '#10B981' }}
                    thumbColor={challengeData.settings.requireApproval ? '#FFFFFF' : '#6B7280'}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Max Participants</Text>
                <TextInput
                  style={styles.input}
                  placeholder="50"
                  placeholderTextColor="#6B7280"
                  value={challengeData.settings.maxParticipants.toString()}
                  onChangeText={(text) => setChallengeData({
                    ...challengeData,
                    settings: {...challengeData.settings, maxParticipants: parseInt(text) || 50}
                  })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateChallenge}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.createButtonGradient}
              >
                <Ionicons name="trophy" size={20} color="white" />
                <Text style={styles.createButtonText}>Create Challenge</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
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
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    width: '48%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedType: {
    backgroundColor: '#10B98120',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectedDuration: {
    backgroundColor: '#10B981',
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedDurationText: {
    color: '#FFFFFF',
  },
  requirementsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  requirementItem: {
    flex: 1,
  },
  requirementLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  requirementInput: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  selectedReward: {
    backgroundColor: '#10B98120',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  rewardText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedRewardText: {
    color: '#10B981',
  },
  settingsList: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
