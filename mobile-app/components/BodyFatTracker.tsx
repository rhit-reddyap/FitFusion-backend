import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';
import { LineChart } from 'react-native-chart-kit';

interface BodyFatEntry {
  id: string;
  date: string;
  bodyFatPercentage: number;
  weight?: number;
  notes?: string;
}

interface BodyFatTrackerProps {
  visible: boolean;
  onClose: () => void;
}

const screenWidth = Dimensions.get('window').width;

export default function BodyFatTracker({ visible, onClose }: BodyFatTrackerProps) {
  const [bodyFatEntries, setBodyFatEntries] = useState<BodyFatEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    bodyFatPercentage: '',
    weight: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadBodyFatData();
    }
  }, [visible]);

  const loadBodyFatData = async () => {
    try {
      const logs = await DataStorage.getBodyCompositionLogs();
      const bodyFatData = logs
        .filter(log => log.bodyFatPercentage !== undefined)
        .map(log => ({
          id: log.id,
          date: log.date,
          bodyFatPercentage: log.bodyFatPercentage,
          weight: log.weight,
          notes: log.notes
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setBodyFatEntries(bodyFatData);
    } catch (error) {
      console.error('Error loading body fat data:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.bodyFatPercentage.trim()) {
      Alert.alert('Error', 'Please enter your body fat percentage');
      return;
    }

    const bodyFat = parseFloat(newEntry.bodyFatPercentage);
    if (isNaN(bodyFat) || bodyFat < 0 || bodyFat > 50) {
      Alert.alert('Error', 'Please enter a valid body fat percentage (0-50%)');
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        date: new Date().toISOString().split('T')[0],
        bodyFatPercentage: bodyFat,
        weight: newEntry.weight ? parseFloat(newEntry.weight) : undefined,
        notes: newEntry.notes.trim() || undefined
      };

      await DataStorage.addBodyCompositionLog(entryData);
      await loadBodyFatData();
      
      setNewEntry({ bodyFatPercentage: '', weight: '', notes: '' });
      setShowAddModal(false);
      
      Alert.alert('Success', 'Body fat entry added successfully!');
    } catch (error) {
      console.error('Error adding body fat entry:', error);
      Alert.alert('Error', 'Failed to add body fat entry');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBodyFatTrend = () => {
    if (bodyFatEntries.length < 2) return 'No trend data';
    
    const latest = bodyFatEntries[bodyFatEntries.length - 1].bodyFatPercentage;
    const previous = bodyFatEntries[bodyFatEntries.length - 2].bodyFatPercentage;
    const change = latest - previous;
    
    if (change > 0.5) return 'Increasing';
    if (change < -0.5) return 'Decreasing';
    return 'Stable';
  };

  const getTrendColor = () => {
    const trend = getBodyFatTrend();
    if (trend === 'Decreasing') return '#10B981';
    if (trend === 'Increasing') return '#EF4444';
    return '#6B7280';
  };

  const prepareChartData = () => {
    if (bodyFatEntries.length === 0) return null;

    const labels = bodyFatEntries.map(entry => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = bodyFatEntries.map(entry => entry.bodyFatPercentage);

    return {
      labels: labels.slice(-7), // Show last 7 entries
      datasets: [{
        data: data.slice(-7),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const chartData = prepareChartData();

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Body Fat Tracking</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Current Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Current Body Fat</Text>
                <Text style={styles.statValue}>
                  {bodyFatEntries.length > 0 
                    ? `${bodyFatEntries[bodyFatEntries.length - 1].bodyFatPercentage.toFixed(1)}%`
                    : 'No data'
                  }
                </Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Trend</Text>
                <Text style={[styles.statValue, { color: getTrendColor() }]}>
                  {getBodyFatTrend()}
                </Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Entries</Text>
                <Text style={styles.statValue}>{bodyFatEntries.length}</Text>
              </View>
            </View>

            {/* Chart */}
            {chartData && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Body Fat Trend (Last 7 Entries)</Text>
                <LineChart
                  data={chartData}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#1F2937',
                    backgroundGradientFrom: '#1F2937',
                    backgroundGradientTo: '#1F2937',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#10B981'
                    }
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>
            )}

            {/* Recent Entries */}
            <View style={styles.entriesContainer}>
              <View style={styles.entriesHeader}>
                <Text style={styles.entriesTitle}>Recent Entries</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Entry</Text>
                </TouchableOpacity>
              </View>

              {bodyFatEntries.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="fitness" size={48} color="#6B7280" />
                  <Text style={styles.emptyText}>No body fat entries yet</Text>
                  <Text style={styles.emptySubtext}>Start tracking your body fat percentage</Text>
                </View>
              ) : (
                bodyFatEntries.slice(-5).reverse().map((entry) => (
                  <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryLeft}>
                      <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                      <Text style={styles.entryBodyFat}>
                        {entry.bodyFatPercentage.toFixed(1)}%
                      </Text>
                      {entry.weight && (
                        <Text style={styles.entryWeight}>
                          Weight: {entry.weight} lbs
                        </Text>
                      )}
                    </View>
                    {entry.notes && (
                      <View style={styles.entryNotes}>
                        <Text style={styles.notesText}>{entry.notes}</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Add Entry Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.addModalContent}>
            <View style={styles.addHeader}>
              <Text style={styles.addTitle}>Add Body Fat Entry</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Body Fat Percentage *</Text>
              <TextInput
                style={styles.input}
                value={newEntry.bodyFatPercentage}
                onChangeText={(text) => setNewEntry({ ...newEntry, bodyFatPercentage: text })}
                placeholder="e.g., 15.5"
                keyboardType="numeric"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight (lbs) - Optional</Text>
              <TextInput
                style={styles.input}
                value={newEntry.weight}
                onChangeText={(text) => setNewEntry({ ...newEntry, weight: text })}
                placeholder="e.g., 180"
                keyboardType="numeric"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes - Optional</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={newEntry.notes}
                onChangeText={(text) => setNewEntry({ ...newEntry, notes: text })}
                placeholder="Any additional notes..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleAddEntry}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Entry'}
                </Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  entriesContainer: {
    marginBottom: 24,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  entryCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryLeft: {
    flex: 1,
  },
  entryDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  entryBodyFat: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  entryWeight: {
    fontSize: 14,
    color: '#6B7280',
  },
  entryNotes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  notesText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontStyle: 'italic',
  },
  addModalContent: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  addHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  addTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B7280',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});









