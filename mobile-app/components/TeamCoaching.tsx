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

interface Coach {
  id: string;
  name: string;
  avatar?: string;
  specialty: string[];
  experience: number; // years
  rating: number;
  sessionsCompleted: number;
  hourlyRate: number;
  currency: string;
  bio: string;
  certifications: string[];
  languages: string[];
  isAvailable: boolean;
  nextAvailableSlot?: string;
  teamMember: boolean;
  level: number;
}

interface CoachingSession {
  id: string;
  coach: Coach;
  type: 'personal' | 'group' | 'nutrition' | 'form_check' | 'programming';
  title: string;
  description: string;
  duration: number; // minutes
  date: string;
  time: string;
  isVirtual: boolean;
  location?: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  currency: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  isBooked: boolean;
  notes?: string;
}

interface TeamCoachingProps {
  visible: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const screenWidth = Dimensions.get('window').width;

export default function TeamCoaching({ visible, onClose, teamId, teamName }: TeamCoachingProps) {
  const [selectedTab, setSelectedTab] = useState<'coaches' | 'sessions' | 'my_bookings'>('coaches');
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [showCoachDetails, setShowCoachDetails] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    type: 'personal' as const,
    duration: 60,
    date: '',
    time: '',
    notes: ''
  });

  // Mock data
  const mockCoaches: Coach[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      specialty: ['Powerlifting', 'Strength Training', 'Form Correction'],
      experience: 8,
      rating: 4.9,
      sessionsCompleted: 156,
      hourlyRate: 80,
      currency: 'USD',
      bio: 'Certified powerlifting coach with 8 years of experience. Specialized in helping athletes achieve their strength goals safely and effectively.',
      certifications: ['NSCA-CSCS', 'USAW Level 2', 'CPT'],
      languages: ['English', 'Spanish'],
      isAvailable: true,
      nextAvailableSlot: '2024-01-15 10:00 AM',
      teamMember: true,
      level: 12
    },
    {
      id: '2',
      name: 'Sarah Chen',
      specialty: ['Nutrition', 'Weight Management', 'Meal Planning'],
      experience: 6,
      rating: 4.8,
      sessionsCompleted: 89,
      hourlyRate: 60,
      currency: 'USD',
      bio: 'Registered dietitian and nutrition coach. Expert in sports nutrition and helping clients achieve their body composition goals.',
      certifications: ['RD', 'CISSN', 'CPT'],
      languages: ['English', 'Mandarin'],
      isAvailable: true,
      nextAvailableSlot: '2024-01-14 2:00 PM',
      teamMember: true,
      level: 10
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      specialty: ['Bodybuilding', 'Muscle Building', 'Contest Prep'],
      experience: 10,
      rating: 4.9,
      sessionsCompleted: 203,
      hourlyRate: 100,
      currency: 'USD',
      bio: 'IFBB Pro bodybuilder and coach. Specialized in contest preparation and advanced training techniques for serious athletes.',
      certifications: ['IFBB Pro', 'NASM-CPT', 'Precision Nutrition'],
      languages: ['English', 'Spanish'],
      isAvailable: false,
      teamMember: false,
      level: 15
    }
  ];

  const mockSessions: CoachingSession[] = [
    {
      id: '1',
      coach: mockCoaches[0],
      type: 'personal',
      title: 'Personal Training Session',
      description: '1-on-1 training session focused on your specific goals and form improvement.',
      duration: 60,
      date: '2024-01-15',
      time: '10:00 AM',
      isVirtual: false,
      location: 'Downtown Fitness Center',
      maxParticipants: 1,
      currentParticipants: 0,
      price: 80,
      currency: 'USD',
      status: 'scheduled',
      isBooked: false
    },
    {
      id: '2',
      coach: mockCoaches[1],
      type: 'nutrition',
      title: 'Nutrition Consultation',
      description: 'Comprehensive nutrition assessment and meal planning session.',
      duration: 45,
      date: '2024-01-16',
      time: '2:00 PM',
      isVirtual: true,
      maxParticipants: 1,
      currentParticipants: 0,
      price: 60,
      currency: 'USD',
      status: 'scheduled',
      isBooked: false
    },
    {
      id: '3',
      coach: mockCoaches[0],
      type: 'group',
      title: 'Group Form Check Session',
      description: 'Small group session focusing on proper lifting technique and form.',
      duration: 90,
      date: '2024-01-18',
      time: '6:00 PM',
      isVirtual: false,
      location: 'Team Gym',
      maxParticipants: 8,
      currentParticipants: 5,
      price: 25,
      currency: 'USD',
      status: 'scheduled',
      isBooked: true
    }
  ];

  useEffect(() => {
    if (visible) {
      setCoaches(mockCoaches);
      setSessions(mockSessions);
    }
  }, [visible]);

  const bookSession = (coach: Coach) => {
    setSelectedCoach(coach);
    setBookingData({
      type: 'personal',
      duration: 60,
      date: '',
      time: '',
      notes: ''
    });
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!bookingData.date || !bookingData.time) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    const session: CoachingSession = {
      id: Date.now().toString(),
      coach: selectedCoach!,
      type: bookingData.type,
      title: `${bookingData.type} Session with ${selectedCoach!.name}`,
      description: `Booked session with ${selectedCoach!.name}`,
      duration: bookingData.duration,
      date: bookingData.date,
      time: bookingData.time,
      isVirtual: false,
      maxParticipants: 1,
      currentParticipants: 1,
      price: selectedCoach!.hourlyRate,
      currency: selectedCoach!.currency,
      status: 'scheduled',
      isBooked: true,
      notes: bookingData.notes
    };

    setSessions(prev => [session, ...prev]);
    setShowBookingModal(false);
    Alert.alert('Success', 'Session booked successfully!');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'personal': return 'person';
      case 'group': return 'people';
      case 'nutrition': return 'restaurant';
      case 'form_check': return 'checkmark-circle';
      case 'programming': return 'code';
      default: return 'fitness';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return '#10B981';
      case 'group': return '#8B5CF6';
      case 'nutrition': return '#F59E0B';
      case 'form_check': return '#06B6D4';
      case 'programming': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderCoach = ({ item: coach }: { item: Coach }) => (
    <TouchableOpacity
      style={styles.coachCard}
      onPress={() => {
        setSelectedCoach(coach);
        setShowCoachDetails(true);
      }}
    >
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.coachGradient}
      >
        <View style={styles.coachHeader}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachInitial}>
              {coach.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.coachInfo}>
            <View style={styles.coachNameRow}>
              <Text style={styles.coachName}>{coach.name}</Text>
              {coach.teamMember && (
                <View style={styles.teamMemberBadge}>
                  <Text style={styles.teamMemberText}>TEAM</Text>
                </View>
              )}
            </View>
            <Text style={styles.coachSpecialty}>{coach.specialty.join(', ')}</Text>
            <View style={styles.coachRating}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{coach.rating}</Text>
              <Text style={styles.sessionsText}>({coach.sessionsCompleted} sessions)</Text>
            </View>
          </View>
          <View style={styles.coachStatus}>
            <View style={[styles.statusDot, { backgroundColor: coach.isAvailable ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.statusText}>{coach.isAvailable ? 'Available' : 'Busy'}</Text>
          </View>
        </View>

        <Text style={styles.coachBio} numberOfLines={2}>{coach.bio}</Text>

        <View style={styles.coachFooter}>
          <View style={styles.coachRate}>
            <Text style={styles.rateText}>${coach.hourlyRate}/hour</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, !coach.isAvailable && styles.bookButtonDisabled]}
            onPress={() => bookSession(coach)}
            disabled={!coach.isAvailable}
          >
            <Text style={[styles.bookButtonText, !coach.isAvailable && styles.bookButtonTextDisabled]}>
              Book Session
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSession = ({ item: session }: { item: CoachingSession }) => (
    <TouchableOpacity style={styles.sessionCard}>
      <LinearGradient
        colors={[getTypeColor(session.type) + '20', getTypeColor(session.type) + '05']}
        style={styles.sessionGradient}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionType}>
            <Ionicons name={getTypeIcon(session.type) as any} size={16} color={getTypeColor(session.type)} />
            <Text style={[styles.sessionTypeText, { color: getTypeColor(session.type) }]}>
              {session.type.toUpperCase()}
            </Text>
          </View>
          <View style={styles.sessionStatus}>
            <Text style={styles.statusText}>{session.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.sessionTitle}>{session.title}</Text>
        <Text style={styles.sessionDescription}>{session.description}</Text>

        <View style={styles.sessionDetails}>
          <View style={styles.sessionDetail}>
            <Ionicons name="calendar" size={16} color="#9CA3AF" />
            <Text style={styles.sessionDetailText}>
              {new Date(session.date).toLocaleDateString()} at {session.time}
            </Text>
          </View>
          <View style={styles.sessionDetail}>
            <Ionicons name="time" size={16} color="#9CA3AF" />
            <Text style={styles.sessionDetailText}>{session.duration} minutes</Text>
          </View>
          <View style={styles.sessionDetail}>
            <Ionicons name={session.isVirtual ? "videocam" : "location"} size={16} color="#9CA3AF" />
            <Text style={styles.sessionDetailText}>
              {session.isVirtual ? 'Virtual' : session.location}
            </Text>
          </View>
        </View>

        <View style={styles.sessionFooter}>
          <View style={styles.sessionPrice}>
            <Text style={styles.priceText}>${session.price}</Text>
          </View>
          <View style={styles.sessionParticipants}>
            <Ionicons name="people" size={16} color="#9CA3AF" />
            <Text style={styles.participantsText}>
              {session.currentParticipants}/{session.maxParticipants}
            </Text>
          </View>
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
            <Text style={styles.title}>Team Coaching</Text>
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            {['coaches', 'sessions', 'my_bookings'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  selectedTab === tab && styles.activeTab
                ]}
                onPress={() => setSelectedTab(tab as any)}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText
                ]}>
                  {tab.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedTab === 'coaches' && (
            <FlatList
              data={coaches}
              renderItem={renderCoach}
              keyExtractor={(item) => item.id}
              style={styles.coachesList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {selectedTab === 'sessions' && (
            <FlatList
              data={sessions}
              renderItem={renderSession}
              keyExtractor={(item) => item.id}
              style={styles.sessionsList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {selectedTab === 'my_bookings' && (
            <FlatList
              data={sessions.filter(s => s.isBooked)}
              renderItem={renderSession}
              keyExtractor={(item) => item.id}
              style={styles.sessionsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* Booking Modal */}
      <Modal visible={showBookingModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.bookingModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Session</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {selectedCoach && (
              <ScrollView style={styles.bookingForm}>
                <View style={styles.coachInfoCard}>
                  <Text style={styles.coachName}>{selectedCoach.name}</Text>
                  <Text style={styles.coachSpecialty}>{selectedCoach.specialty.join(', ')}</Text>
                  <Text style={styles.coachRate}>${selectedCoach.hourlyRate}/hour</Text>
                </View>

                <TextInput
                  style={styles.input}
                  value={bookingData.date}
                  onChangeText={(text) => setBookingData(prev => ({ ...prev, date: text }))}
                  placeholder="Date (YYYY-MM-DD)"
                  placeholderTextColor="#6B7280"
                />
                
                <TextInput
                  style={styles.input}
                  value={bookingData.time}
                  onChangeText={(text) => setBookingData(prev => ({ ...prev, time: text }))}
                  placeholder="Time (HH:MM AM/PM)"
                  placeholderTextColor="#6B7280"
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bookingData.notes}
                  onChangeText={(text) => setBookingData(prev => ({ ...prev, notes: text }))}
                  placeholder="Notes (optional)"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={3}
                />
              </ScrollView>
            )}
            
            <TouchableOpacity style={styles.confirmButton} onPress={confirmBooking}>
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
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
  helpButton: {
    backgroundColor: '#6B7280',
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
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  coachesList: {
    flex: 1,
  },
  coachCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  coachGradient: {
    padding: 20,
  },
  coachHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coachInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  coachInfo: {
    flex: 1,
  },
  coachNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coachName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamMemberBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  teamMemberText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  coachSpecialty: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  coachRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  sessionsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  coachStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  coachBio: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 20,
  },
  coachFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coachRate: {
    flex: 1,
  },
  rateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  bookButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bookButtonTextDisabled: {
    color: '#9CA3AF',
  },
  sessionsList: {
    flex: 1,
  },
  sessionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sessionGradient: {
    padding: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 20,
  },
  sessionDetails: {
    marginBottom: 16,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sessionDetailText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionPrice: {
    flex: 1,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  sessionParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  bookingModal: {
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
  bookingForm: {
    flex: 1,
    marginBottom: 20,
  },
  coachInfoCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
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
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});








