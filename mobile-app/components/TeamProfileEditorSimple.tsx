import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TeamProfileEditorSimpleProps {
  visible: boolean;
  onClose: () => void;
  onSave: (teamData: any) => void;
  team?: any;
}

export default function TeamProfileEditorSimple({ visible, onClose, onSave, team }: TeamProfileEditorSimpleProps) {
  const [teamData, setTeamData] = useState({
    name: team?.name || '',
    description: team?.description || '',
    category: team?.category || 'Strength Training',
    privacy: team?.privacy || 'Public',
    maxMembers: team?.maxMembers || 30,
    rules: team?.rules || [
      'Be respectful to all team members',
      'Share your progress regularly',
      'Support and encourage others',
      'Follow the team guidelines'
    ],
    color: team?.color || ['#10B981', '#059669']
  });

  const [newRule, setNewRule] = useState('');

  const categories = [
    'Strength Training',
    'Cardio',
    'Yoga & Mindfulness',
    'CrossFit',
    'Bodybuilding',
    'Powerlifting',
    'Running',
    'Cycling',
    'Swimming',
    'Mixed Training',
    'Weight Loss',
    'Muscle Building',
    'Flexibility',
    'Endurance',
    'Sports Specific'
  ];

  const privacyOptions = [
    { id: 'Public', name: 'Public', description: 'Anyone can join', icon: 'globe' },
    { id: 'Private', name: 'Private', description: 'Approval required', icon: 'lock-closed' }
  ];

  const colorOptions = [
    ['#10B981', '#059669'], // Green
    ['#3B82F6', '#2563EB'], // Blue
    ['#8B5CF6', '#7C3AED'], // Purple
    ['#EF4444', '#DC2626'], // Red
    ['#F59E0B', '#D97706'], // Orange
    ['#06B6D4', '#0891B2'], // Cyan
    ['#84CC16', '#65A30D'], // Lime
    ['#F97316', '#EA580C'], // Orange Red
    ['#EC4899', '#DB2777'], // Pink
    ['#6366F1', '#4F46E5']  // Indigo
  ];

  const addRule = () => {
    if (newRule.trim()) {
      setTeamData({
        ...teamData,
        rules: [...teamData.rules, newRule.trim()]
      });
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    const newRules = teamData.rules.filter((_, i) => i !== index);
    setTeamData({ ...teamData, rules: newRules });
  };

  const handleSave = () => {
    if (!teamData.name.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    if (!teamData.description.trim()) {
      Alert.alert('Error', 'Please enter a team description');
      return;
    }

    if (teamData.rules.length === 0) {
      Alert.alert('Error', 'Please add at least one team rule');
      return;
    }

    onSave(teamData);
    onClose();
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {team ? 'Edit Team Profile' : 'Create Team Profile'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Team Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter team name..."
                  placeholderTextColor="#6B7280"
                  value={teamData.name}
                  onChangeText={(text) => setTeamData({ ...teamData, name: text })}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your team's goals and values..."
                  placeholderTextColor="#6B7280"
                  value={teamData.description}
                  onChangeText={(text) => setTeamData({ ...teamData, description: text })}
                  multiline
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        teamData.category === category && styles.selectedCategory
                      ]}
                      onPress={() => setTeamData({ ...teamData, category })}
                    >
                      <Text style={[
                        styles.categoryText,
                        teamData.category === category && styles.selectedCategoryText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Privacy Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy Settings</Text>
              <View style={styles.privacyContainer}>
                {privacyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.privacyOption,
                      teamData.privacy === option.id && styles.selectedPrivacy
                    ]}
                    onPress={() => setTeamData({ ...teamData, privacy: option.id })}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={teamData.privacy === option.id ? '#10B981' : '#6B7280'}
                    />
                    <View style={styles.privacyInfo}>
                      <Text style={[
                        styles.privacyName,
                        teamData.privacy === option.id && styles.selectedPrivacyText
                      ]}>
                        {option.name}
                      </Text>
                      <Text style={styles.privacyDescription}>{option.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Team Color */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Team Color</Text>
              <View style={styles.colorContainer}>
                {colorOptions.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      JSON.stringify(teamData.color) === JSON.stringify(color) && styles.selectedColor
                    ]}
                    onPress={() => setTeamData({ ...teamData, color })}
                  >
                    <LinearGradient colors={color} style={styles.colorGradient} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Max Members */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Team Size</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Maximum Members</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  placeholderTextColor="#6B7280"
                  value={teamData.maxMembers === '' ? '' : teamData.maxMembers.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    if (text === '') {
                      setTeamData({ ...teamData, maxMembers: '' });
                    } else if (!isNaN(num) && num > 0) {
                      setTeamData({ ...teamData, maxMembers: num });
                    }
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Team Rules */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Team Rules</Text>
              <View style={styles.rulesContainer}>
                {teamData.rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={styles.ruleText}>{rule}</Text>
                    <TouchableOpacity
                      style={styles.removeRuleButton}
                      onPress={() => removeRule(index)}
                    >
                      <Ionicons name="close" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addRuleContainer}>
                  <TextInput
                    style={styles.addRuleInput}
                    placeholder="Add a new rule..."
                    placeholderTextColor="#6B7280"
                    value={newRule}
                    onChangeText={setNewRule}
                  />
                  <TouchableOpacity style={styles.addRuleButton} onPress={addRule}>
                    <Ionicons name="add" size={20} color="#10B981" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  {team ? 'Update Team' : 'Create Team'}
                </Text>
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
  scrollContent: {
    paddingBottom: 100, // Extra padding to ensure create button is visible
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
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedCategory: {
    backgroundColor: '#10B981',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  privacyContainer: {
    gap: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  selectedPrivacy: {
    backgroundColor: '#10B98120',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  privacyInfo: {
    flex: 1,
  },
  privacyName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedPrivacyText: {
    color: '#10B981',
  },
  privacyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FFFFFF',
  },
  colorGradient: {
    width: '100%',
    height: '100%',
  },
  rulesContainer: {
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  removeRuleButton: {
    padding: 4,
  },
  addRuleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  addRuleInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  addRuleButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
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

