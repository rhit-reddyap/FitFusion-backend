import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Alert,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TeamPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    isAdmin: boolean;
  };
  content: string;
  images?: string[];
  type: 'workout' | 'achievement' | 'motivation' | 'question' | 'tip' | 'general';
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
  tags: string[];
  workoutData?: {
    exercises: string[];
    duration: number;
    calories: number;
    tonnage: number;
  };
  achievementData?: {
    badge: string;
    description: string;
    points: number;
  };
}

interface TeamStory {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  content: string;
  image?: string;
  video?: string;
  timestamp: string;
  views: number;
  isViewed: boolean;
  expiresAt: string;
}

interface TeamSocialFeedProps {
  visible: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const screenWidth = Dimensions.get('window').width;

export default function TeamSocialFeed({ visible, onClose, teamId, teamName }: TeamSocialFeedProps) {
  const [selectedTab, setSelectedTab] = useState<'feed' | 'stories'>('feed');
  const [posts, setPosts] = useState<TeamPost[]>([]);
  const [stories, setStories] = useState<TeamStory[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'workout' | 'achievement' | 'motivation' | 'question' | 'tip' | 'general'>('general');
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStory, setSelectedStory] = useState<TeamStory | null>(null);

  // Mock data
  const mockPosts: TeamPost[] = [
    {
      id: '1',
      author: {
        id: '1',
        name: 'Alex Johnson',
        level: 12,
        isAdmin: true
      },
      content: 'Just crushed a 2-hour powerlifting session! 💪 New PR on deadlifts - 405 lbs!',
      type: 'workout',
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: '2 hours ago',
      isLiked: false,
      tags: ['powerlifting', 'PR', 'deadlift'],
      workoutData: {
        exercises: ['Deadlift', 'Squat', 'Bench Press'],
        duration: 120,
        calories: 450,
        tonnage: 2500
      }
    },
    {
      id: '2',
      author: {
        id: '2',
        name: 'Sarah Chen',
        level: 10,
        isAdmin: false
      },
      content: 'Earned the "Consistent" badge for working out 7 days in a row! 🏆',
      type: 'achievement',
      likes: 18,
      comments: 5,
      shares: 2,
      timestamp: '4 hours ago',
      isLiked: true,
      tags: ['achievement', 'streak', 'badge'],
      achievementData: {
        badge: 'Consistent',
        description: 'Work out 7 days in a row',
        points: 100
      }
    },
    {
      id: '3',
      author: {
        id: '3',
        name: 'Mike Rodriguez',
        level: 8,
        isAdmin: false
      },
      content: 'Pro tip: Focus on form over weight. It\'s better to lift lighter with perfect form than heavy with poor form!',
      type: 'tip',
      likes: 31,
      comments: 12,
      shares: 7,
      timestamp: '6 hours ago',
      isLiked: false,
      tags: ['tip', 'form', 'technique']
    }
  ];

  const mockStories: TeamStory[] = [
    {
      id: '1',
      author: {
        id: '1',
        name: 'Alex Johnson',
        level: 12
      },
      content: 'Morning workout complete!',
      image: 'https://via.placeholder.com/300x400',
      timestamp: '1 hour ago',
      views: 15,
      isViewed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      author: {
        id: '2',
        name: 'Sarah Chen',
        level: 10
      },
      content: 'Meal prep Sunday!',
      image: 'https://via.placeholder.com/300x400',
      timestamp: '3 hours ago',
      views: 22,
      isViewed: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    if (visible) {
      setPosts(mockPosts);
      setStories(mockStories);
    }
  }, [visible]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const createPost = () => {
    if (!newPost.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    const post: TeamPost = {
      id: Date.now().toString(),
      author: {
        id: 'current_user',
        name: 'You',
        level: 12,
        isAdmin: false
      },
      content: newPost.trim(),
      type: postType,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: 'now',
      isLiked: false,
      tags: []
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setShowCreatePost(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workout': return 'fitness';
      case 'achievement': return 'trophy';
      case 'motivation': return 'flame';
      case 'question': return 'help-circle';
      case 'tip': return 'bulb';
      default: return 'chatbubble';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return '#10B981';
      case 'achievement': return '#F59E0B';
      case 'motivation': return '#EF4444';
      case 'question': return '#8B5CF6';
      case 'tip': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  const renderPost = ({ item: post }: { item: TeamPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {post.author.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              {post.author.isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
            <Text style={styles.authorLevel}>Level {post.author.level}</Text>
          </View>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.postTime}>{post.timestamp}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.postText}>{post.content}</Text>
        
        {post.workoutData && (
          <View style={styles.workoutData}>
            <View style={styles.workoutHeader}>
              <Ionicons name="fitness" size={16} color="#10B981" />
              <Text style={styles.workoutTitle}>Workout Details</Text>
            </View>
            <View style={styles.workoutStats}>
              <View style={styles.workoutStat}>
                <Text style={styles.workoutStatValue}>{post.workoutData.duration} min</Text>
                <Text style={styles.workoutStatLabel}>Duration</Text>
              </View>
              <View style={styles.workoutStat}>
                <Text style={styles.workoutStatValue}>{post.workoutData.calories}</Text>
                <Text style={styles.workoutStatLabel}>Calories</Text>
              </View>
              <View style={styles.workoutStat}>
                <Text style={styles.workoutStatValue}>{post.workoutData.tonnage.toLocaleString()}</Text>
                <Text style={styles.workoutStatLabel}>Tonnage</Text>
              </View>
            </View>
          </View>
        )}

        {post.achievementData && (
          <View style={styles.achievementData}>
            <View style={styles.achievementHeader}>
              <Ionicons name="trophy" size={16} color="#F59E0B" />
              <Text style={styles.achievementTitle}>Achievement Unlocked</Text>
            </View>
            <Text style={styles.achievementBadge}>{post.achievementData.badge}</Text>
            <Text style={styles.achievementDescription}>{post.achievementData.description}</Text>
            <Text style={styles.achievementPoints}>+{post.achievementData.points} points</Text>
          </View>
        )}

        {post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <Ionicons 
            name={post.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={post.isLiked ? "#EF4444" : "#6B7280"} 
          />
          <Text style={[styles.actionText, { color: post.isLiked ? "#EF4444" : "#6B7280" }]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStory = ({ item: story }: { item: TeamStory }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => {
        setSelectedStory(story);
        setShowStoryViewer(true);
      }}
    >
      <LinearGradient
        colors={story.isViewed ? ['#6B7280', '#4B5563'] : ['#10B981', '#059669']}
        style={styles.storyGradient}
      >
        <View style={styles.storyAvatar}>
          <Text style={styles.storyInitial}>
            {story.author.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <Text style={styles.storyAuthor}>{story.author.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.title}>Team Social</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowCreatePost(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'feed' && styles.activeTab]}
              onPress={() => setSelectedTab('feed')}
            >
              <Text style={[styles.tabText, selectedTab === 'feed' && styles.activeTabText]}>
                Feed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'stories' && styles.activeTab]}
              onPress={() => setSelectedTab('stories')}
            >
              <Text style={[styles.tabText, selectedTab === 'stories' && styles.activeTabText]}>
                Stories
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'feed' ? (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              style={styles.feed}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.storiesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <FlatList
                  data={stories}
                  renderItem={renderStory}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Create Post Modal */}
      <Modal visible={showCreatePost} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.createPostModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.postInput}
              value={newPost}
              onChangeText={setNewPost}
              placeholder="What's on your mind?"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity style={styles.postButton} onPress={createPost}>
              <Text style={styles.postButtonText}>Post</Text>
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
  createButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  feed: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  adminBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  adminBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  authorLevel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTime: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    marginBottom: 16,
  },
  postText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
  },
  workoutData: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  workoutStat: {
    alignItems: 'center',
  },
  workoutStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  workoutStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  achievementData: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  achievementBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  achievementPoints: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#10B981',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  storiesContainer: {
    flex: 1,
  },
  storyItem: {
    marginRight: 16,
  },
  storyGradient: {
    width: 80,
    height: 100,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  storyInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  storyAuthor: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  createPostModal: {
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
  postInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});







