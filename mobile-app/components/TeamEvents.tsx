import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TeamEvent {
  id: string;
  title: string;
  description: string;
  type: 'workout' | 'meetup' | 'competition' | 'education' | 'social' | 'virtual';
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  isVirtual: boolean;
  maxParticipants: number;
  currentParticipants: number;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  requirements: string[];
  tags: string[];
  isJoined: boolean;
  isHost: boolean;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  image?: string;
  price?: number;
  currency?: string;
}

interface TeamEventsProps {
  visible: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const screenWidth = Dimensions.get('window').width;

export default function TeamEvents({ visible, onClose, teamId, teamName }: TeamEventsProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'live' | 'my_events'>('upcoming');
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'workout' as const,
    date: '',
    time: '',
    duration: 60,
    location: '',
    isVirtual: false,
    maxParticipants: 20,
    requirements: [] as string[],
    tags: [] as string[],
    price: 0
  });

  // Mock data
  const mockEvents: TeamEvent[] = [
    {
      id: '1',
      title: 'Team Powerlifting Meet',
      description: 'Join us for a friendly powerlifting competition! All skill levels welcome.',
      type: 'competition',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: 180,
      location: 'Downtown Fitness Center',
      isVirtual: false,
      maxParticipants: 30,
      currentParticipants: 18,
      organizer: {
        id: '1',
        name: 'Alex Johnson',
        level: 12
      },
      requirements: ['Basic lifting experience', 'Team membership'],
      tags: ['powerlifting', 'competition', 'team'],
      isJoined: true,
      isHost: false,
      status: 'upcoming',
      price: 25,
      currency: 'USD'
    },
    {
      id: '2',
      title: 'Virtual HIIT Challenge',
      description: 'High-intensity interval training session via Zoom. Bring your energy!',
      type: 'virtual',
      date: '2024-01-12',
      time: '7:00 PM',
      duration: 45,
      location: 'Zoom Meeting',
      isVirtual: true,
      maxParticipants: 50,
      currentParticipants: 32,
      organizer: {
        id: '2',
        name: 'Sarah Chen',
        level: 10
      },
      requirements: ['Stable internet connection', 'Workout space'],
      tags: ['HIIT', 'virtual', 'cardio'],
      isJoined: false,
      isHost: true,
      status: 'upcoming',
      price: 0
    },
    {
      id: '3',
      title: 'Nutrition Workshop',
      description: 'Learn about meal prep, macro counting, and healthy eating habits.',
      type: 'education',
      date: '2024-01-20',
      time: '2:00 PM',
      duration: 90,
      location: 'Community Center Room 2',
      isVirtual: false,
      maxParticipants: 25,
      currentParticipants: 15,
      organizer: {
        id: '3',
        name: 'Mike Rodriguez',
        level: 8
      },
      requirements: ['Notebook', 'Pen'],
      tags: ['nutrition', 'education', 'workshop'],
      isJoined: false,
      isHost: false,
      status: 'upcoming',
      price: 15,
      currency: 'USD'
    },
    {
      id: '4',
      title: 'Team Social Night',
      description: 'Casual meetup at the local sports bar. Food, drinks, and team bonding!',
      type: 'social',
      date: '2024-01-18',
      time: '6:00 PM',
      duration: 120,
      location: 'The Athletic Bar & Grill',
      isVirtual: false,
      maxParticipants: 40,
      currentParticipants: 22,
      organizer: {
        id: '1',
        name: 'Alex Johnson',
        level: 12
      },
      requirements: ['21+ only'],
      tags: ['social', 'team building', 'casual'],
      isJoined: true,
      isHost: false,
      status: 'upcoming',
      price: 0
    }
  ];

  useEffect(() => {
    if (visible) {
      setEvents(mockEvents);
    }
  }, [visible]);

  const filteredEvents = events.filter(event => {
    switch (selectedFilter) {
      case 'upcoming':
        return event.status === 'upcoming';
      case 'live':
        return event.status === 'live';
      case 'my_events':
        return event.isJoined || event.isHost;
      default:
        return true;
    }
  });

  const joinEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            isJoined: true,
            currentParticipants: event.currentParticipants + 1
          }
        : event
    ));
    Alert.alert('Success', 'You\'ve joined the event!');
  };

  const leaveEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            isJoined: false,
            currentParticipants: event.currentParticipants - 1
          }
        : event
    ));
    Alert.alert('Success', 'You\'ve left the event');
  };

  const createEvent = () => {
    if (!newEvent.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    const event: TeamEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time,
      duration: newEvent.duration,
      location: newEvent.location,
      isVirtual: newEvent.isVirtual,
      maxParticipants: newEvent.maxParticipants,
      currentParticipants: 0,
      organizer: {
        id: 'current_user',
        name: 'You',
        level: 12
      },
      requirements: newEvent.requirements,
      tags: newEvent.tags,
      isJoined: false,
      isHost: true,
      status: 'upcoming',
      price: newEvent.price
    };

    setEvents(prev => [event, ...prev]);
    setShowCreateEvent(false);
    setNewEvent({
      title: '',
      description: '',
      type: 'workout',
      date: '',
      time: '',
      duration: 60,
      location: '',
      isVirtual: false,
      maxParticipants: 20,
      requirements: [],
      tags: [],
      price: 0
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workout': return 'fitness';
      case 'meetup': return 'people';
      case 'competition': return 'trophy';
      case 'education': return 'school';
      case 'social': return 'wine';
      case 'virtual': return 'videocam';
      default: return 'calendar';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return '#10B981';
      case 'meetup': return '#8B5CF6';
      case 'competition': return '#F59E0B';
      case 'education': return '#06B6D4';
      case 'social': return '#EF4444';
      case 'virtual': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderEvent = ({ item: event }: { item: TeamEvent }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => {
        setSelectedEvent(event);
        setShowEventDetails(true);
      }}
    >
      <LinearGradient
        colors={[getTypeColor(event.type) + '20', getTypeColor(event.type) + '05']}
        style={styles.eventGradient}
      >
        <View style={styles.eventHeader}>
          <View style={styles.eventType}>
            <Ionicons name={getTypeIcon(event.type) as any} size={16} color={getTypeColor(event.type)} />
            <Text style={[styles.eventTypeText, { color: getTypeColor(event.type) }]}>
              {event.type.toUpperCase()}
            </Text>
          </View>
          {event.price && event.price > 0 && (
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>${event.price}</Text>
            </View>
          )}
        </View>

        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDescription}>{event.description}</Text>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Ionicons name="calendar" size={16} color="#9CA3AF" />
            <Text style={styles.eventDetailText}>
              {formatDate(event.date)} at {event.time}
            </Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons name="time" size={16} color="#9CA3AF" />
            <Text style={styles.eventDetailText}>{event.duration} minutes</Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons name={event.isVirtual ? "videocam" : "location"} size={16} color="#9CA3AF" />
            <Text style={styles.eventDetailText}>{event.location}</Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <View style={styles.participants}>
            <Ionicons name="people" size={16} color="#9CA3AF" />
            <Text style={styles.participantsText}>
              {event.currentParticipants}/{event.maxParticipants}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.joinButton,
              event.isJoined ? styles.leaveButton : styles.joinButton
            ]}
            onPress={() => event.isJoined ? leaveEvent(event.id) : joinEvent(event.id)}
          >
            <Text style={[
              styles.joinButtonText,
              event.isJoined ? styles.leaveButtonText : styles.joinButtonText
            ]}>
              {event.isJoined ? 'Leave' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.title}>Team Events</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowCreateEvent(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterContainer}>
            {['upcoming', 'live', 'my_events'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.activeFilter
                ]}
                onPress={() => setSelectedFilter(filter as any)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText
                ]}>
                  {filter.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredEvents}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id}
            style={styles.eventsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Create Event Modal */}
      <Modal visible={showCreateEvent} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.createEventModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Event</Text>
              <TouchableOpacity onPress={() => setShowCreateEvent(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.createForm}>
              <TextInput
                style={styles.input}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
                placeholder="Event title"
                placeholderTextColor="#6B7280"
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newEvent.description}
                onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
                placeholder="Description"
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={3}
              />
              
              <TextInput
                style={styles.input}
                value={newEvent.location}
                onChangeText={(text) => setNewEvent(prev => ({ ...prev, location: text }))}
                placeholder="Location"
                placeholderTextColor="#6B7280"
              />
              
              <TextInput
                style={styles.input}
                value={newEvent.maxParticipants.toString()}
                onChangeText={(text) => setNewEvent(prev => ({ ...prev, maxParticipants: parseInt(text) || 20 }))}
                placeholder="Max participants"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
            </ScrollView>
            
            <TouchableOpacity style={styles.createButton} onPress={createEvent}>
              <Text style={styles.createButtonText}>Create Event</Text>
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventGradient: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceTag: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  joinButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  leaveButton: {
    backgroundColor: '#EF4444',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  leaveButtonText: {
    color: '#FFFFFF',
  },
  createEventModal: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
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
  createForm: {
    flex: 1,
    marginBottom: 20,
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
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});








