import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
  Linking,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ExerciseApiService, { Exercise, ExerciseSearchFilters } from '../services/exerciseApiService';

const { width, height } = Dimensions.get('window');

interface ExerciseSearchProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export default function ExerciseSearch({ 
  visible, 
  onClose, 
  onSelectExercise 
}: ExerciseSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [popularExercises, setPopularExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<ExerciseSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const exerciseApi = ExerciseApiService.getInstance();

  useEffect(() => {
    if (visible) {
      loadPopularExercises();
      setSearchResults([]);
      setSearchQuery('');
      setSelectedFilters({});
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadPopularExercises = async () => {
    try {
      setIsLoading(true);
      const exercises = await exerciseApi.getPopularExercises(20);
      setPopularExercises(exercises);
    } catch (error) {
      console.error('Error loading popular exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const results = await exerciseApi.searchExercises(query, selectedFilters, 30);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Unable to search exercises. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDetails(true);
  };

  const handleAddExercise = () => {
    if (selectedExercise) {
      onSelectExercise(selectedExercise);
      setShowExerciseDetails(false);
      setSelectedExercise(null);
    }
  };

  const handleWatchVideo = (exercise: Exercise) => {
    if (exercise.youtubeVideoId) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${exercise.youtubeVideoId}`;
      Linking.openURL(youtubeUrl).catch(err => {
        console.error('Error opening YouTube:', err);
        Alert.alert('Error', 'Unable to open YouTube video');
      });
    }
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => handleExerciseSelect(item)}
    >
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.exerciseItemGradient}
      >
        <View style={styles.exerciseItemContent}>
          <View style={styles.exerciseItemHeader}>
            <Text style={styles.exerciseItemName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.exerciseItemMeta}>
              <View style={[styles.difficultyBadge, styles[`difficulty${item.difficulty}`]]}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
              <Text style={styles.exerciseCategory}>{item.category}</Text>
            </View>
          </View>
          
          <View style={styles.exerciseItemStats}>
            <View style={styles.exerciseStat}>
              <Ionicons name="fitness" size={14} color="#10B981" />
              <Text style={styles.exerciseStatText}>{item.primaryMuscles?.join(', ') || item.muscle || 'Full Body'}</Text>
            </View>
            <View style={styles.exerciseStat}>
              <Ionicons name="time" size={14} color="#3B82F6" />
              <Text style={styles.exerciseStatText}>{item.caloriesPerMinute} cal/min</Text>
            </View>
            <View style={styles.exerciseStat}>
              <Ionicons name="barbell" size={14} color="#F59E0B" />
              <Text style={styles.exerciseStatText}>{item.equipment?.join(', ') || 'Bodyweight'}</Text>
            </View>
          </View>

          <View style={styles.exerciseItemTags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.exerciseItemActions}>
          {item.youtubeVideoId && (
            <TouchableOpacity
              style={styles.videoButton}
              onPress={() => handleWatchVideo(item)}
            >
              <Ionicons name="play-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleExerciseSelect(item)}
          >
            <Ionicons name="add-circle" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFilterChip = (label: string, value: string, type: string) => (
    <TouchableOpacity
      key={`${type}_${value}`}
      style={[
        styles.filterChip,
        selectedFilters[type] === value && styles.filterChipActive
      ]}
      onPress={() => {
        const newFilters = { ...selectedFilters };
        if (selectedFilters[type] === value) {
          delete newFilters[type];
        } else {
          newFilters[type] = value;
        }
        setSelectedFilters(newFilters);
        if (searchQuery.length >= 2) {
          handleSearch(searchQuery);
        }
      }}
    >
      <Text style={[
        styles.filterChipText,
        selectedFilters[type] === value && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={['#000000', '#111111']} style={styles.gradient}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Exercise Library</Text>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Ionicons name="filter" size={20} color="#10B981" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search 1000+ exercises..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    handleSearch(text);
                  }}
                  autoFocus
                />
                {isLoading && (
                  <ActivityIndicator size="small" color="#10B981" />
                )}
              </View>
            </View>

            {/* Filters */}
            {showFilters && (
              <View style={styles.filtersContainer}>
                <Text style={styles.filtersTitle}>Filters</Text>
                
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Difficulty</Text>
                  <View style={styles.filterChips}>
                    {['Beginner', 'Intermediate', 'Advanced'].map(difficulty => 
                      renderFilterChip(difficulty, difficulty, 'difficulty')
                    )}
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Category</Text>
                  <View style={styles.filterChips}>
                    {exerciseApi.getCategories().slice(0, 6).map(category => 
                      renderFilterChip(category, category, 'category')
                    )}
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Equipment</Text>
                  <View style={styles.filterChips}>
                    {exerciseApi.getEquipmentTypes().slice(0, 6).map(equipment => 
                      renderFilterChip(equipment, equipment, 'equipment')
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>
              {searchQuery.length < 2 ? (
                // Popular Exercises
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Popular Exercises</Text>
                  <Text style={styles.sectionSubtitle}>
                    Tap any exercise to add to your workout
                  </Text>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#10B981" />
                      <Text style={styles.loadingText}>Loading exercises...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={popularExercises}
                      renderItem={renderExerciseItem}
                      keyExtractor={(item) => item.id}
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </View>
              ) : (
                // Search Results
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {searchResults.length} Results for "{searchQuery}"
                  </Text>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#10B981" />
                      <Text style={styles.loadingText}>Searching exercises...</Text>
                    </View>
                  ) : searchResults.length > 0 ? (
                    <FlatList
                      data={searchResults}
                      renderItem={renderExerciseItem}
                      keyExtractor={(item) => item.id}
                      showsVerticalScrollIndicator={false}
                    />
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="fitness" size={48} color="#6B7280" />
                      <Text style={styles.emptyTitle}>No exercises found</Text>
                      <Text style={styles.emptyDescription}>
                        Try a different search term or adjust your filters
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Exercise Details Modal */}
      <Modal
        visible={showExerciseDetails}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExerciseDetails(false)}
      >
        <View style={styles.detailsModalOverlay}>
          <View style={styles.detailsModal}>
            {selectedExercise && (
              <>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsTitle}>{selectedExercise.name}</Text>
                  <TouchableOpacity
                    style={styles.detailsCloseButton}
                    onPress={() => setShowExerciseDetails(false)}
                  >
                    <Ionicons name="close" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailsContent}>
                  <View style={styles.detailsMeta}>
                    <View style={[styles.difficultyBadge, styles[`difficulty${selectedExercise.difficulty}`]]}>
                      <Text style={styles.difficultyText}>{selectedExercise.difficulty}</Text>
                    </View>
                    <Text style={styles.detailsCategory}>{selectedExercise.category}</Text>
                    <Text style={styles.detailsCalories}>{selectedExercise.caloriesPerMinute} cal/min</Text>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Target Muscles</Text>
                    <Text style={styles.detailsText}>
                      Primary: {selectedExercise.primaryMuscles?.join(', ') || selectedExercise.muscle || 'Full Body'}
                    </Text>
                    {selectedExercise.secondaryMuscles.length > 0 && (
                      <Text style={styles.detailsText}>
                        Secondary: {selectedExercise.secondaryMuscles?.join(', ') || 'None'}
                      </Text>
                    )}
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Equipment</Text>
                    <Text style={styles.detailsText}>{selectedExercise.equipment?.join(', ') || 'Bodyweight'}</Text>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Instructions</Text>
                    {selectedExercise.instructions.map((instruction, index) => (
                      <Text key={index} style={styles.instructionText}>
                        {index + 1}. {instruction}
                      </Text>
                    ))}
                  </View>

                  {selectedExercise.tips.length > 0 && (
                    <View style={styles.detailsSection}>
                      <Text style={styles.detailsSectionTitle}>Tips</Text>
                      {selectedExercise.tips.map((tip, index) => (
                        <Text key={index} style={styles.tipText}>
                          • {tip}
                        </Text>
                      ))}
                    </View>
                  )}

                  {selectedExercise.youtubeVideoId && (
                    <TouchableOpacity
                      style={styles.youtubeButton}
                      onPress={() => handleWatchVideo(selectedExercise)}
                    >
                      <Ionicons name="play-circle" size={24} color="#EF4444" />
                      <Text style={styles.youtubeButtonText}>Watch Video Tutorial</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.detailsActions}>
                  <TouchableOpacity
                    style={styles.detailsCancelButton}
                    onPress={() => setShowExerciseDetails(false)}
                  >
                    <Text style={styles.detailsCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.detailsAddButton}
                    onPress={handleAddExercise}
                  >
                    <Text style={styles.detailsAddText}>Add to Workout</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#10B981',
  },
  filterChipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  exerciseItem: {
    marginBottom: 12,
  },
  exerciseItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseItemContent: {
    flex: 1,
    marginRight: 12,
  },
  exerciseItemHeader: {
    marginBottom: 8,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  difficultyBeginner: {
    backgroundColor: '#10B981',
  },
  difficultyIntermediate: {
    backgroundColor: '#F59E0B',
  },
  difficultyAdvanced: {
    backgroundColor: '#EF4444',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  exerciseItemStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  exerciseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseStatText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  exerciseItemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  exerciseItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoButton: {
    padding: 8,
    marginRight: 4,
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: height * 0.8,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  detailsCloseButton: {
    padding: 8,
  },
  detailsContent: {
    flex: 1,
  },
  detailsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  detailsCalories: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 12,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 4,
  },
  youtubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  youtubeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  detailsCancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  detailsCancelText: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '600',
  },
  detailsAddButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  detailsAddText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});

