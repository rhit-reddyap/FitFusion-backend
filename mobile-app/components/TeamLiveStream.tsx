import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LiveStream {
  id: string;
  title: string;
  streamer: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  viewers: number;
  duration: number;
  category: 'workout' | 'nutrition' | 'motivation' | 'education' | 'q&a';
  isLive: boolean;
  thumbnail?: string;
  description: string;
  tags: string[];
  teamId: string;
  startTime: string;
}

interface LiveComment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  message: string;
  timestamp: string;
  isModerator: boolean;
  isStreamer: boolean;
}

interface TeamLiveStreamProps {
  visible: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const screenWidth = Dimensions.get('window').width;

export default function TeamLiveStream({ visible, onClose, teamId, teamName }: TeamLiveStreamProps) {
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showStartStream, setShowStartStream] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamCategory, setStreamCategory] = useState<'workout' | 'nutrition' | 'motivation' | 'education' | 'q&a'>('workout');
  const [streamDescription, setStreamDescription] = useState('');
  const [liveComments, setLiveComments] = useState<LiveComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [viewers, setViewers] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);

  // Mock data
  const mockStreams: LiveStream[] = [
    {
      id: '1',
      title: 'Morning Powerlifting Session',
      streamer: {
        id: '1',
        name: 'Alex Johnson',
        level: 12
      },
      viewers: 45,
      duration: 0,
      category: 'workout',
      isLive: true,
      description: 'Join me for an intense powerlifting session!',
      tags: ['powerlifting', 'strength', 'morning'],
      teamId: teamId,
      startTime: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Nutrition Q&A with Sarah',
      streamer: {
        id: '2',
        name: 'Sarah Chen',
        level: 10
      },
      viewers: 23,
      duration: 0,
      category: 'nutrition',
      isLive: true,
      description: 'Ask me anything about nutrition and meal prep!',
      tags: ['nutrition', 'q&a', 'meal prep'],
      teamId: teamId,
      startTime: new Date().toISOString()
    }
  ];

  const mockComments: LiveComment[] = [
    {
      id: '1',
      user: {
        id: '1',
        name: 'Mike Rodriguez',
        level: 8
      },
      message: 'Great form on that squat! 💪',
      timestamp: '2 min ago',
      isModerator: false,
      isStreamer: false
    },
    {
      id: '2',
      user: {
        id: '2',
      name: 'Emma Wilson',
        level: 6
      },
      message: 'What weight are you using?',
      timestamp: '1 min ago',
      isModerator: false,
      isStreamer: false
    }
  ];

  useEffect(() => {
    if (visible) {
      setLiveComments(mockComments);
      setViewers(45);
    }
  }, [visible]);

  const startStream = () => {
    if (!streamTitle.trim()) {
      Alert.alert('Error', 'Please enter a stream title');
      return;
    }

    const newStream: LiveStream = {
      id: Date.now().toString(),
      title: streamTitle,
      streamer: {
        id: 'current_user',
        name: 'You',
        level: 12
      },
      viewers: 0,
      duration: 0,
      category: streamCategory,
      isLive: true,
      description: streamDescription,
      tags: [],
      teamId: teamId,
      startTime: new Date().toISOString()
    };

    setActiveStream(newStream);
    setIsStreaming(true);
    setShowStartStream(false);
    setStreamTitle('');
    setStreamDescription('');
  };

  const sendComment = () => {
    if (!newComment.trim()) return;

    const comment: LiveComment = {
      id: Date.now().toString(),
      user: {
        id: 'current_user',
        name: 'You',
        level: 12
      },
      message: newComment.trim(),
      timestamp: 'now',
      isModerator: false,
      isStreamer: activeStream?.streamer.id === 'current_user'
    };

    setLiveComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return 'fitness';
      case 'nutrition': return 'restaurant';
      case 'motivation': return 'flame';
      case 'education': return 'school';
      case 'q&a': return 'help-circle';
      default: return 'play';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workout': return '#10B981';
      case 'nutrition': return '#F59E0B';
      case 'motivation': return '#EF4444';
      case 'education': return '#8B5CF6';
      case 'q&a': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.title}>Team Live Streams</Text>
            <TouchableOpacity 
              style={styles.startStreamButton}
              onPress={() => setShowStartStream(true)}
            >
              <Ionicons name="videocam" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {!activeStream ? (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Live Now</Text>
              
              {mockStreams.map((stream) => (
                <TouchableOpacity
                  key={stream.id}
                  style={styles.streamCard}
                  onPress={() => setActiveStream(stream)}
                >
                  <LinearGradient
                    colors={[getCategoryColor(stream.category) + '20', getCategoryColor(stream.category) + '05']}
                    style={styles.streamGradient}
                  >
                    <View style={styles.streamHeader}>
                      <View style={styles.streamerInfo}>
                        <View style={styles.streamerAvatar}>
                          <Text style={styles.streamerInitial}>
                            {stream.streamer.name.split(' ').map(n => n[0]).join('')}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.streamerName}>{stream.streamer.name}</Text>
                          <Text style={styles.streamerLevel}>Level {stream.streamer.level}</Text>
                        </View>
                      </View>
                      <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    </View>

                    <Text style={styles.streamTitle}>{stream.title}</Text>
                    <Text style={styles.streamDescription}>{stream.description}</Text>

                    <View style={styles.streamStats}>
                      <View style={styles.streamStat}>
                        <Ionicons name="eye" size={16} color="#9CA3AF" />
                        <Text style={styles.streamStatText}>{stream.viewers} viewers</Text>
                      </View>
                      <View style={styles.streamStat}>
                        <Ionicons name={getCategoryIcon(stream.category) as any} size={16} color={getCategoryColor(stream.category)} />
                        <Text style={styles.streamStatText}>{stream.category}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}

              <Text style={styles.sectionTitle}>Upcoming Streams</Text>
              <View style={styles.emptyState}>
                <Ionicons name="calendar" size={48} color="#6B7280" />
                <Text style={styles.emptyText}>No upcoming streams</Text>
                <Text style={styles.emptySubtext}>Check back later for scheduled content</Text>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.streamViewer}>
              {/* Stream Video Area */}
              <View style={styles.videoContainer}>
                <LinearGradient
                  colors={['#1F2937', '#374151']}
                  style={styles.videoPlaceholder}
                >
                  <Ionicons name="play-circle" size={64} color="#10B981" />
                  <Text style={styles.videoText}>Live Stream</Text>
                </LinearGradient>
                
                <View style={styles.streamOverlay}>
                  <View style={styles.streamInfo}>
                    <Text style={styles.streamTitle}>{activeStream.title}</Text>
                    <Text style={styles.streamerName}>{activeStream.streamer.name}</Text>
                  </View>
                  <View style={styles.streamStats}>
                    <View style={styles.viewerCount}>
                      <Ionicons name="eye" size={16} color="#FFFFFF" />
                      <Text style={styles.viewerText}>{viewers}</Text>
                    </View>
                    <View style={styles.duration}>
                      <Ionicons name="time" size={16} color="#FFFFFF" />
                      <Text style={styles.durationText}>{formatDuration(streamDuration)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Live Comments */}
              <View style={styles.commentsContainer}>
                <Text style={styles.commentsTitle}>Live Chat</Text>
                <FlatList
                  data={liveComments}
                  renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                      <View style={styles.commentUser}>
                        <Text style={styles.commentUserName}>{item.user.name}</Text>
                        {item.isStreamer && (
                          <View style={styles.streamerBadge}>
                            <Text style={styles.streamerBadgeText}>STREAMER</Text>
                          </View>
                        )}
                        {item.isModerator && (
                          <View style={styles.moderatorBadge}>
                            <Text style={styles.moderatorBadgeText}>MOD</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.commentMessage}>{item.message}</Text>
                      <Text style={styles.commentTime}>{item.timestamp}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                  style={styles.commentsList}
                />
                
                <View style={styles.commentInput}>
                  <TextInput
                    style={styles.commentTextInput}
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Type a message..."
                    placeholderTextColor="#6B7280"
                  />
                  <TouchableOpacity style={styles.sendCommentButton} onPress={sendComment}>
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Start Stream Modal */}
      <Modal visible={showStartStream} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.startStreamModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start Live Stream</Text>
              <TouchableOpacity onPress={() => setShowStartStream(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              value={streamTitle}
              onChangeText={setStreamTitle}
              placeholder="Stream title"
              placeholderTextColor="#6B7280"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              value={streamDescription}
              onChangeText={setStreamDescription}
              placeholder="Description (optional)"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity style={styles.startButton} onPress={startStream}>
              <Text style={styles.startButtonText}>Go Live</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  startStreamButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  streamCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  streamGradient: {
    padding: 20,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streamerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  streamerInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streamerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  streamerLevel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  streamDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
  },
  streamStats: {
    flexDirection: 'row',
    gap: 16,
  },
  streamStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streamStatText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  streamViewer: {
    flex: 1,
  },
  videoContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
  },
  streamOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  streamInfo: {
    marginBottom: 8,
  },
  streamStats: {
    flexDirection: 'row',
    gap: 16,
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewerText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  commentsContainer: {
    flex: 1,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  commentsList: {
    flex: 1,
    marginBottom: 16,
  },
  commentItem: {
    marginBottom: 12,
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  streamerBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  streamerBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  moderatorBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moderatorBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  commentMessage: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  sendCommentButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 8,
    marginLeft: 8,
  },
  startStreamModal: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
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
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});








