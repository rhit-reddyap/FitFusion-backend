import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  FlatList,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface TeamManagementProps {
  team: any;
  onClose: () => void;
  onUpdateTeam: (team: any) => void;
}

export default function TeamManagement({ team, onClose, onUpdateTeam }: TeamManagementProps) {
  const [activeTab, setActiveTab] = useState('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showKickModal, setShowKickModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamSettings, setTeamSettings] = useState({
    name: team.name,
    description: team.description,
    maxMembers: team.maxMembers,
    privacy: team.privacy,
    autoApprove: false,
    allowInvites: true,
    requireApproval: true
  });

  const tabs = [
    { id: 'members', name: 'Members', icon: 'people' },
    { id: 'requests', name: 'Requests', icon: 'person-add' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
    { id: 'analytics', name: 'Analytics', icon: 'analytics' }
  ];

  const mockMembers = [
    {
      id: '1',
      name: 'Alex Thompson',
      role: 'Admin',
      joinedDate: '2024-01-15',
      lastActive: '2 hours ago',
      stats: { workouts: 45, points: 1250, streak: 23 },
      avatar: 'AT',
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Admin',
      joinedDate: '2024-01-20',
      lastActive: '1 hour ago',
      stats: { workouts: 38, points: 980, streak: 15 },
      avatar: 'SJ',
      status: 'active'
    },
    {
      id: '3',
      name: 'Mike Chen',
      role: 'Member',
      joinedDate: '2024-02-01',
      lastActive: '3 hours ago',
      stats: { workouts: 28, points: 720, streak: 8 },
      avatar: 'MC',
      status: 'active'
    },
    {
      id: '4',
      name: 'Emma Wilson',
      role: 'Member',
      joinedDate: '2024-02-10',
      lastActive: '1 day ago',
      stats: { workouts: 22, points: 580, streak: 5 },
      avatar: 'EW',
      status: 'inactive'
    },
    {
      id: '5',
      name: 'David Lee',
      role: 'Member',
      joinedDate: '2024-02-15',
      lastActive: '2 days ago',
      stats: { workouts: 15, points: 420, streak: 2 },
      avatar: 'DL',
      status: 'inactive'
    }
  ];

  const joinRequests = [
    {
      id: '1',
      name: 'Lisa Park',
      message: 'I\'m a serious fitness enthusiast looking to join a dedicated team!',
      requestedDate: '2 days ago',
      stats: { workouts: 35, points: 890, streak: 12 },
      avatar: 'LP'
    },
    {
      id: '2',
      name: 'Tom Wilson',
      message: 'Love the team spirit here, would love to contribute!',
      requestedDate: '1 day ago',
      stats: { workouts: 28, points: 750, streak: 9 },
      avatar: 'TW'
    },
    {
      id: '3',
      name: 'Anna Garcia',
      message: 'Ready to push my limits with this amazing team!',
      requestedDate: '3 hours ago',
      stats: { workouts: 42, points: 1100, streak: 18 },
      avatar: 'AG'
    }
  ];

  const teamAnalytics = {
    totalMembers: 24,
    activeMembers: 22,
    newMembersThisWeek: 3,
    averageWorkoutsPerMember: 4.2,
    totalTeamPoints: 45600,
    teamStreak: 23,
    topPerformers: [
      { name: 'Alex Thompson', points: 1250, workouts: 45 },
      { name: 'Sarah Johnson', points: 980, workouts: 38 },
      { name: 'Mike Chen', points: 720, workouts: 28 }
    ],
    weeklyActivity: [
      { day: 'Mon', workouts: 12, points: 2400 },
      { day: 'Tue', workouts: 15, points: 3000 },
      { day: 'Wed', workouts: 18, points: 3600 },
      { day: 'Thu', workouts: 14, points: 2800 },
      { day: 'Fri', workouts: 16, points: 3200 },
      { day: 'Sat', workouts: 20, points: 4000 },
      { day: 'Sun', workouts: 8, points: 1600 }
    ]
  };

  const handleApproveRequest = (request) => {
    Alert.alert(
      'Approve Request',
      `Are you sure you want to approve ${request.name}'s request to join the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: () => {
            // Add to members, remove from requests
            Alert.alert('Success', `${request.name} has been added to the team!`);
          }
        }
      ]
    );
  };

  const handleRejectRequest = (request) => {
    Alert.alert(
      'Reject Request',
      `Are you sure you want to reject ${request.name}'s request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          onPress: () => {
            Alert.alert('Request Rejected', `${request.name}'s request has been rejected.`);
          }
        }
      ]
    );
  };

  const handleKickMember = (member) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Member Removed', `${member.name} has been removed from the team.`);
          }
        }
      ]
    );
  };

  const handlePromoteToAdmin = (member) => {
    Alert.alert(
      'Promote to Admin',
      `Are you sure you want to promote ${member.name} to admin?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Promote', 
          onPress: () => {
            Alert.alert('Promoted', `${member.name} is now an admin!`);
          }
        }
      ]
    );
  };

  const renderMember = (member) => (
    <View key={member.id} style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>{member.avatar}</Text>
        </View>
        <View style={styles.memberDetails}>
          <View style={styles.memberHeader}>
            <Text style={styles.memberName}>{member.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: member.role === 'Admin' ? '#F59E0B' : '#10B981' }]}>
              <Text style={styles.roleText}>{member.role}</Text>
            </View>
          </View>
          <Text style={styles.memberStats}>
            {member.stats.workouts} workouts • {member.stats.points} points • {member.stats.streak} day streak
          </Text>
          <Text style={styles.memberLastActive}>Last active: {member.lastActive}</Text>
        </View>
      </View>
      <View style={styles.memberActions}>
        {member.role === 'Member' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePromoteToAdmin(member)}
          >
            <Ionicons name="arrow-up" size={16} color="#10B981" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.kickButton]}
          onPress={() => handleKickMember(member)}
        >
          <Ionicons name="person-remove" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderJoinRequest = (request) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <View style={styles.requestAvatar}>
          <Text style={styles.requestAvatarText}>{request.avatar}</Text>
        </View>
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>{request.name}</Text>
          <Text style={styles.requestMessage}>{request.message}</Text>
          <Text style={styles.requestStats}>
            {request.stats.workouts} workouts • {request.stats.points} points • {request.stats.streak} day streak
          </Text>
          <Text style={styles.requestDate}>Requested {request.requestedDate}</Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveRequest(request)}
        >
          <Ionicons name="checkmark" size={16} color="#10B981" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(request)}
        >
          <Ionicons name="close" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>{teamAnalytics.totalMembers}</Text>
          <Text style={styles.analyticsLabel}>Total Members</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>{teamAnalytics.activeMembers}</Text>
          <Text style={styles.analyticsLabel}>Active Members</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>{teamAnalytics.teamStreak}</Text>
          <Text style={styles.analyticsLabel}>Team Streak</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>{teamAnalytics.totalTeamPoints.toLocaleString()}</Text>
          <Text style={styles.analyticsLabel}>Total Points</Text>
        </View>
      </View>

      <View style={styles.topPerformersSection}>
        <Text style={styles.sectionTitle}>Top Performers</Text>
        {teamAnalytics.topPerformers.map((performer, index) => (
          <View key={index} style={styles.performerCard}>
            <Text style={styles.performerRank}>#{index + 1}</Text>
            <View style={styles.performerInfo}>
              <Text style={styles.performerName}>{performer.name}</Text>
              <Text style={styles.performerStats}>
                {performer.workouts} workouts • {performer.points} points
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <View style={styles.settingGroup}>
        <Text style={styles.settingGroupTitle}>Team Information</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Team Name</Text>
          <TextInput
            style={styles.settingInput}
            value={teamSettings.name}
            onChangeText={(text) => setTeamSettings({...teamSettings, name: text})}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Description</Text>
          <TextInput
            style={[styles.settingInput, styles.textArea]}
            value={teamSettings.description}
            onChangeText={(text) => setTeamSettings({...teamSettings, description: text})}
            multiline
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Max Members</Text>
          <TextInput
            style={styles.settingInput}
            value={teamSettings.maxMembers.toString()}
            onChangeText={(text) => setTeamSettings({...teamSettings, maxMembers: parseInt(text) || 0})}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingGroupTitle}>Privacy & Access</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Team Privacy</Text>
          <View style={styles.privacyOptions}>
            <TouchableOpacity
              style={[styles.privacyOption, teamSettings.privacy === 'Public' && styles.selectedOption]}
              onPress={() => setTeamSettings({...teamSettings, privacy: 'Public'})}
            >
              <Text style={[styles.privacyOptionText, teamSettings.privacy === 'Public' && styles.selectedOptionText]}>
                Public
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.privacyOption, teamSettings.privacy === 'Private' && styles.selectedOption]}
              onPress={() => setTeamSettings({...teamSettings, privacy: 'Private'})}
            >
              <Text style={[styles.privacyOptionText, teamSettings.privacy === 'Private' && styles.selectedOptionText]}>
                Private
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.switchItem}>
            <Text style={styles.settingLabel}>Auto-approve new members</Text>
            <Switch
              value={teamSettings.autoApprove}
              onValueChange={(value) => setTeamSettings({...teamSettings, autoApprove: value})}
              trackColor={{ false: '#1F2937', true: '#10B981' }}
              thumbColor={teamSettings.autoApprove ? '#FFFFFF' : '#6B7280'}
            />
          </View>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.switchItem}>
            <Text style={styles.settingLabel}>Allow member invites</Text>
            <Switch
              value={teamSettings.allowInvites}
              onValueChange={(value) => setTeamSettings({...teamSettings, allowInvites: value})}
              trackColor={{ false: '#1F2937', true: '#10B981' }}
              thumbColor={teamSettings.allowInvites ? '#FFFFFF' : '#6B7280'}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.saveButtonGradient}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'members':
        return (
          <View style={styles.tabContent}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Team Members ({mockMembers.length})</Text>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setShowInviteModal(true)}
              >
                <Ionicons name="person-add" size={16} color="white" />
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>
            {mockMembers.map(renderMember)}
          </View>
        );
      case 'requests':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Join Requests ({joinRequests.length})</Text>
            {joinRequests.map(renderJoinRequest)}
          </View>
        );
      case 'settings':
        return renderSettings();
      case 'analytics':
        return renderAnalytics();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Manage Team</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabNavigation}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  activeTab === tab.id && styles.activeTabButton
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={activeTab === tab.id ? '#10B981' : '#6B7280'}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText
                ]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderTabContent()}
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
    maxHeight: height * 0.9,
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
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: '#10B98120',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  memberStats: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  memberLastActive: {
    fontSize: 12,
    color: '#6B7280',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kickButton: {
    backgroundColor: '#EF444420',
  },
  approveButton: {
    backgroundColor: '#10B98120',
  },
  rejectButton: {
    backgroundColor: '#EF444420',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  requestStats: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  analyticsContainer: {
    gap: 24,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  topPerformersSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  performerRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginRight: 12,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  performerStats: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  settingsContainer: {
    gap: 24,
  },
  settingGroup: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  settingGroupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  settingInput: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  privacyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#111111',
  },
  selectedOption: {
    backgroundColor: '#10B981',
  },
  privacyOptionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


















