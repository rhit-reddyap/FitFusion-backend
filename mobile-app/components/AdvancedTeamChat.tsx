import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isAdmin: boolean;
    level: number;
  };
  timestamp: string;
  type: 'text' | 'workout' | 'achievement' | 'challenge' | 'system';
  data?: any;
  isEdited?: boolean;
  editedAt?: string;
  reactions?: Reaction[];
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  isAdmin: boolean;
  level: number;
  isOnline: boolean;
  lastActive: string;
}

interface AdvancedTeamChatProps {
  onBack: () => void;
  teamId: string;
  teamName: string;
}

export default function AdvancedTeamChat({ onBack, teamId, teamName }: AdvancedTeamChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data
  const mockMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      isAdmin: true,
      level: 12,
      isOnline: true,
      lastActive: 'now'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      isAdmin: false,
      level: 10,
      isOnline: true,
      lastActive: '2 min ago'
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      isAdmin: false,
      level: 8,
      isOnline: false,
      lastActive: '1 hour ago'
    }
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      text: 'Great workout today everyone! 💪',
      sender: {
        id: '1',
        name: 'Alex Johnson',
        isAdmin: true,
        level: 12
      },
      timestamp: '2:30 PM',
      type: 'text',
      reactions: [
        { emoji: '💪', users: ['2', '3'], count: 2 },
        { emoji: '🔥', users: ['2'], count: 1 }
      ]
    },
    {
      id: '2',
      text: 'Just completed the March Madness challenge!',
      sender: {
        id: '2',
        name: 'Sarah Chen',
        isAdmin: false,
        level: 10
      },
      timestamp: '2:25 PM',
      type: 'achievement',
      data: {
        challenge: 'March Madness',
        progress: 100,
        reward: 'Champion Badge'
      },
      reactions: [
        { emoji: '🎉', users: ['1', '3'], count: 2 }
      ]
    },
    {
      id: '3',
      text: 'Workout completed: Powerlifting Session',
      sender: {
        id: '3',
        name: 'Mike Rodriguez',
        isAdmin: false,
        level: 8
      },
      timestamp: '2:20 PM',
      type: 'workout',
      data: {
        duration: 90,
        tonnage: 1200,
        exercises: ['Squat', 'Deadlift', 'Bench Press']
      }
    },
    {
      id: '4',
      text: 'Welcome to the team, Emma! 🎉',
      sender: {
        id: 'system',
        name: 'System',
        isAdmin: false,
        level: 0
      },
      timestamp: '2:15 PM',
      type: 'system',
      data: {
        newMember: 'Emma Wilson'
      }
    }
  ];

  useEffect(() => {
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: {
        id: 'current_user',
        name: 'You',
        isAdmin: false,
        level: 12
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    if (!isTyping) {
      setIsTyping(true);
      // Simulate other users seeing typing indicator
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          // Toggle reaction
          const updatedReactions = msg.reactions?.map(r => 
            r.emoji === emoji 
              ? { ...r, users: r.users.includes('current_user') 
                  ? r.users.filter(id => id !== 'current_user')
                  : [...r.users, 'current_user'],
                  count: r.users.includes('current_user') ? r.count - 1 : r.count + 1
                }
              : r
          ) || [];
          return { ...msg, reactions: updatedReactions };
        } else {
          // Add new reaction
          const newReaction: Reaction = {
            emoji,
            users: ['current_user'],
            count: 1
          };
          return { ...msg, reactions: [...(msg.reactions || []), newReaction] };
        }
      }
      return msg;
    }));
  };

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isCurrentUser = message.sender.id === 'current_user';
    const isSystem = message.type === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{message.text}</Text>
          <Text style={styles.systemMessageTime}>{message.timestamp}</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser && styles.currentUserMessage
      ]}>
        {!isCurrentUser && (
          <View style={styles.messageHeader}>
            <View style={styles.senderInfo}>
              <View style={styles.senderAvatar}>
                <Text style={styles.senderInitial}>
                  {message.sender.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View>
                <Text style={styles.senderName}>
                  {message.sender.name}
                  {message.sender.isAdmin && <Text style={styles.adminBadge}> ADMIN</Text>}
                </Text>
                <Text style={styles.senderLevel}>Level {message.sender.level}</Text>
              </View>
            </View>
            <Text style={styles.messageTime}>{message.timestamp}</Text>
          </View>
        )}

        <View style={[
          styles.messageBubble,
          isCurrentUser && styles.currentUserBubble,
          message.type === 'workout' && styles.workoutMessage,
          message.type === 'achievement' && styles.achievementMessage
        ]}>
          {message.type === 'workout' && (
            <View style={styles.workoutHeader}>
              <Ionicons name="fitness" size={16} color="#10B981" />
              <Text style={styles.workoutTitle}>Workout Completed</Text>
            </View>
          )}
          
          {message.type === 'achievement' && (
            <View style={styles.achievementHeader}>
              <Ionicons name="trophy" size={16} color="#F59E0B" />
              <Text style={styles.achievementTitle}>Achievement Unlocked</Text>
            </View>
          )}

          <Text style={[
            styles.messageText,
            isCurrentUser && styles.currentUserText
          ]}>
            {message.text}
          </Text>

          {message.data && (
            <View style={styles.messageData}>
              {message.type === 'workout' && (
                <View style={styles.workoutData}>
                  <Text style={styles.workoutDataText}>
                    Duration: {message.data.duration} min
                  </Text>
                  <Text style={styles.workoutDataText}>
                    Tonnage: {message.data.tonnage.toLocaleString()} lbs
                  </Text>
                </View>
              )}
              {message.type === 'achievement' && (
                <View style={styles.achievementData}>
                  <Text style={styles.achievementDataText}>
                    Challenge: {message.data.challenge}
                  </Text>
                  <Text style={styles.achievementDataText}>
                    Reward: {message.data.reward}
                  </Text>
                </View>
              )}
            </View>
          )}

          {message.reactions && message.reactions.length > 0 && (
            <View style={styles.reactionsContainer}>
              {message.reactions.map((reaction, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.reactionButton}
                  onPress={() => handleReaction(message.id, reaction.emoji)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={styles.reactionCount}>{reaction.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {isCurrentUser && (
          <Text style={styles.currentUserTime}>{message.timestamp}</Text>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <View style={styles.typingIndicator}>
        <Text style={styles.typingText}>
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.teamName}>{teamName}</Text>
          <Text style={styles.memberCount}>{mockMembers.length} members</Text>
        </View>
        <TouchableOpacity 
          style={styles.membersButton}
          onPress={() => setShowMembers(true)}
        >
          <Ionicons name="people" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
        {renderTypingIndicator()}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(true)}
        >
          <Ionicons name="happy" size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor="#6B7280"
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Members Modal */}
      <Modal visible={showMembers} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Team Members</Text>
              <TouchableOpacity onPress={() => setShowMembers(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.membersList}>
              {mockMembers.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                    {member.isOnline && <View style={styles.onlineIndicator} />}
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.name}
                      {member.isAdmin && <Text style={styles.adminBadge}> ADMIN</Text>}
                    </Text>
                    <Text style={styles.memberLevel}>Level {member.level}</Text>
                    <Text style={styles.memberStatus}>
                      {member.isOnline ? 'Online' : `Last active ${member.lastActive}`}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Emoji Picker Modal */}
      <Modal visible={showEmojiPicker} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.emojiModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Reaction</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.emojiGrid}>
              {['💪', '🔥', '🎉', '👏', '💯', '🏆', '⭐', '❤️', '😂', '😮'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiButton}
                  onPress={() => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  membersButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  senderInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  adminBadge: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  senderLevel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  messageTime: {
    fontSize: 10,
    color: '#6B7280',
  },
  messageBubble: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
  },
  currentUserBubble: {
    backgroundColor: '#10B981',
  },
  workoutMessage: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  achievementMessage: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  messageData: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutData: {
    gap: 4,
  },
  workoutDataText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  achievementData: {
    gap: 4,
  },
  achievementDataText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  currentUserTime: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  systemMessageTime: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  typingIndicator: {
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  emojiButton: {
    padding: 8,
    marginRight: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#6B7280',
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
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  membersList: {
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#111111',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberLevel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  memberStatus: {
    fontSize: 10,
    color: '#6B7280',
  },
  emojiModalContent: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emojiText: {
    fontSize: 24,
  },
});








