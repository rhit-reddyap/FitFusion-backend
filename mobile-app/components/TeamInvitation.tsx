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

interface TeamInvitationProps {
  visible: boolean;
  onClose: () => void;
  onSendInvites: (invites: string[]) => void;
}

export default function TeamInvitation({ visible, onClose, onSendInvites }: TeamInvitationProps) {
  const [inviteMethod, setInviteMethod] = useState('username');
  const [usernames, setUsernames] = useState('');
  const [emails, setEmails] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const inviteMethods = [
    { id: 'username', name: 'Username', icon: 'person', placeholder: 'Enter usernames separated by commas' },
    { id: 'email', name: 'Email', icon: 'mail', placeholder: 'Enter email addresses separated by commas' },
    { id: 'phone', name: 'Phone', icon: 'call', placeholder: 'Enter phone numbers separated by commas' }
  ];

  const handleSendInvites = () => {
    let inviteList: string[] = [];
    
    switch (inviteMethod) {
      case 'username':
        inviteList = usernames.split(',').map(u => u.trim()).filter(u => u.length > 0);
        break;
      case 'email':
        inviteList = emails.split(',').map(e => e.trim()).filter(e => e.length > 0);
        break;
      case 'phone':
        inviteList = phoneNumbers.split(',').map(p => p.trim()).filter(p => p.length > 0);
        break;
    }

    if (inviteList.length === 0) {
      Alert.alert('Error', 'Please enter at least one contact to invite.');
      return;
    }

    onSendInvites(inviteList);
    onClose();
    
    Alert.alert(
      'Invites Sent!',
      `Successfully sent ${inviteList.length} invitation${inviteList.length > 1 ? 's' : ''}.`
    );
  };

  const renderInviteMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.methodButton,
        inviteMethod === method.id && styles.selectedMethod
      ]}
      onPress={() => setInviteMethod(method.id)}
    >
      <Ionicons
        name={method.icon as any}
        size={20}
        color={inviteMethod === method.id ? '#10B981' : '#6B7280'}
      />
      <Text style={[
        styles.methodText,
        inviteMethod === method.id && styles.selectedMethodText
      ]}>
        {method.name}
      </Text>
    </TouchableOpacity>
  );

  const getCurrentInput = () => {
    switch (inviteMethod) {
      case 'username':
        return usernames;
      case 'email':
        return emails;
      case 'phone':
        return phoneNumbers;
      default:
        return '';
    }
  };

  const setCurrentInput = (value: string) => {
    switch (inviteMethod) {
      case 'username':
        setUsernames(value);
        break;
      case 'email':
        setEmails(value);
        break;
      case 'phone':
        setPhoneNumbers(value);
        break;
    }
  };

  const getCurrentPlaceholder = () => {
    return inviteMethods.find(m => m.id === inviteMethod)?.placeholder || '';
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
            <Text style={styles.modalTitle}>Invite to Team</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Invite Method</Text>
            <View style={styles.methodsContainer}>
              {inviteMethods.map(renderInviteMethod)}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {inviteMethods.find(m => m.id === inviteMethod)?.name} Addresses
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={getCurrentPlaceholder()}
                placeholderTextColor="#6B7280"
                value={getCurrentInput()}
                onChangeText={setCurrentInput}
                multiline
              />
              <Text style={styles.inputHint}>
                Separate multiple {inviteMethods.find(m => m.id === inviteMethod)?.name.toLowerCase()}s with commas
              </Text>
            </View>

            <View style={styles.messageSection}>
              <Text style={styles.inputLabel}>Custom Message (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a personal message to your invitation..."
                placeholderTextColor="#6B7280"
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline
              />
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Team Invitation</Text>
                <Text style={styles.previewText}>
                  You've been invited to join the Elite Warriors team!
                </Text>
                {customMessage && (
                  <Text style={styles.previewMessage}>
                    "{customMessage}"
                  </Text>
                )}
                <Text style={styles.previewFooter}>
                  - Alex Thompson (Team Admin)
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.sendButton} onPress={handleSendInvites}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.sendButtonGradient}
              >
                <Ionicons name="send" size={20} color="white" />
                <Text style={styles.sendButtonText}>Send Invitations</Text>
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
    maxHeight: '90%',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  methodsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  selectedMethod: {
    backgroundColor: '#10B98120',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedMethodText: {
    color: '#10B981',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  messageSection: {
    marginBottom: 24,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  previewMessage: {
    fontSize: 14,
    color: '#10B981',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  previewFooter: {
    fontSize: 12,
    color: '#6B7280',
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});









