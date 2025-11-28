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
  FlatList,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: 'gear' | 'supplements' | 'services' | 'nutrition' | 'coaching' | 'merchandise';
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    sales: number;
  };
  images: string[];
  condition: 'new' | 'like_new' | 'good' | 'fair';
  location: string;
  isAvailable: boolean;
  tags: string[];
  teamDiscount?: number; // percentage
  isTeamExclusive: boolean;
  createdAt: string;
  views: number;
  likes: number;
  isLiked: boolean;
}

interface TeamMarketplaceProps {
  visible: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const screenWidth = Dimensions.get('window').width;

export default function TeamMarketplace({ visible, onClose, teamId, teamName }: TeamMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gear' | 'supplements' | 'services' | 'nutrition' | 'coaching' | 'merchandise'>('all');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');

  // Mock data
  const mockItems: MarketplaceItem[] = [
    {
      id: '1',
      title: 'Adjustable Dumbbells Set (50lbs)',
      description: 'High-quality adjustable dumbbells perfect for home gym. Barely used, excellent condition.',
      price: 299,
      currency: 'USD',
      category: 'gear',
      seller: {
        id: '1',
        name: 'Alex Johnson',
        rating: 4.8,
        sales: 12
      },
      images: ['https://via.placeholder.com/300x200'],
      condition: 'like_new',
      location: 'New York, NY',
      isAvailable: true,
      tags: ['dumbbells', 'home gym', 'adjustable'],
      teamDiscount: 15,
      isTeamExclusive: true,
      createdAt: '2024-01-10',
      views: 45,
      likes: 8,
      isLiked: false
    },
    {
      id: '2',
      title: 'Whey Protein Powder (5lbs)',
      description: 'Premium whey protein isolate. Unopened, still sealed. Great for muscle recovery.',
      price: 49,
      currency: 'USD',
      category: 'supplements',
      seller: {
        id: '2',
        name: 'Sarah Chen',
        rating: 4.9,
        sales: 8
      },
      images: ['https://via.placeholder.com/300x200'],
      condition: 'new',
      location: 'Los Angeles, CA',
      isAvailable: true,
      tags: ['protein', 'whey', 'supplements'],
      teamDiscount: 20,
      isTeamExclusive: true,
      createdAt: '2024-01-08',
      views: 32,
      likes: 12,
      isLiked: true
    },
    {
      id: '3',
      title: 'Personal Training Session',
      description: '1-hour personal training session with certified trainer. Focus on form and technique.',
      price: 80,
      currency: 'USD',
      category: 'services',
      seller: {
        id: '3',
        name: 'Mike Rodriguez',
        rating: 5.0,
        sales: 25
      },
      images: ['https://via.placeholder.com/300x200'],
      condition: 'new',
      location: 'Chicago, IL',
      isAvailable: true,
      tags: ['training', 'personal', 'coaching'],
      teamDiscount: 25,
      isTeamExclusive: true,
      createdAt: '2024-01-12',
      views: 28,
      likes: 5,
      isLiked: false
    },
    {
      id: '4',
      title: 'Team Fitness Apparel Bundle',
      description: 'Official team t-shirt, shorts, and water bottle. Brand new, never worn.',
      price: 35,
      currency: 'USD',
      category: 'merchandise',
      seller: {
        id: '4',
        name: 'Team Store',
        rating: 4.7,
        sales: 50
      },
      images: ['https://via.placeholder.com/300x200'],
      condition: 'new',
      location: 'Online',
      isAvailable: true,
      tags: ['apparel', 'team', 'bundle'],
      teamDiscount: 30,
      isTeamExclusive: true,
      createdAt: '2024-01-05',
      views: 67,
      likes: 15,
      isLiked: true
    }
  ];

  useEffect(() => {
    if (visible) {
      setItems(mockItems);
    }
  }, [visible]);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'popular':
        return b.views - a.views;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const toggleLike = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1
          }
        : item
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gear': return 'fitness';
      case 'supplements': return 'medical';
      case 'services': return 'person';
      case 'nutrition': return 'restaurant';
      case 'coaching': return 'school';
      case 'merchandise': return 'shirt';
      default: return 'storefront';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gear': return '#10B981';
      case 'supplements': return '#F59E0B';
      case 'services': return '#8B5CF6';
      case 'nutrition': return '#06B6D4';
      case 'coaching': return '#EF4444';
      case 'merchandise': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return '#10B981';
      case 'like_new': return '#8B5CF6';
      case 'good': return '#F59E0B';
      case 'fair': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => {
        setSelectedItem(item);
        setShowItemDetails(true);
      }}
    >
      <View style={styles.itemImageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
        {item.isTeamExclusive && (
          <View style={styles.teamExclusiveBadge}>
            <Text style={styles.teamExclusiveText}>TEAM</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => toggleLike(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={item.isLiked ? "#EF4444" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.itemCategory}>
            <Ionicons name={getCategoryIcon(item.category) as any} size={14} color={getCategoryColor(item.category)} />
            <Text style={[styles.itemCategoryText, { color: getCategoryColor(item.category) }]}>
              {item.category.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>

        <View style={styles.itemDetails}>
          <View style={styles.itemCondition}>
            <Text style={[styles.conditionText, { color: getConditionColor(item.condition) }]}>
              {item.condition.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.itemLocation}>{item.location}</Text>
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.priceContainer}>
            {item.teamDiscount && (
              <Text style={styles.originalPrice}>${item.price}</Text>
            )}
            <Text style={styles.itemPrice}>
              ${Math.round(item.price * (1 - (item.teamDiscount || 0) / 100))}
            </Text>
            {item.teamDiscount && (
              <Text style={styles.discountText}>{item.teamDiscount}% OFF</Text>
            )}
          </View>
          <View style={styles.itemStats}>
            <View style={styles.itemStat}>
              <Ionicons name="eye" size={14} color="#9CA3AF" />
              <Text style={styles.itemStatText}>{item.views}</Text>
            </View>
            <View style={styles.itemStat}>
              <Ionicons name="heart" size={14} color="#9CA3AF" />
              <Text style={styles.itemStatText}>{item.likes}</Text>
            </View>
          </View>
        </View>
      </View>
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
            <Text style={styles.title}>Team Marketplace</Text>
            <TouchableOpacity style={styles.cartButton}>
              <Ionicons name="cart" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search items..."
                placeholderTextColor="#6B7280"
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {['all', 'gear', 'supplements', 'services', 'nutrition', 'coaching', 'merchandise'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.activeCategory
                ]}
                onPress={() => setSelectedCategory(category as any)}
              >
                <Ionicons 
                  name={getCategoryIcon(category) as any} 
                  size={16} 
                  color={selectedCategory === category ? '#FFFFFF' : '#9CA3AF'} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.activeCategoryText
                ]}>
                  {category.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={sortedItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.itemRow}
          />
        </View>
      </View>

      {/* Item Details Modal */}
      <Modal visible={showItemDetails} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.itemDetailsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Item Details</Text>
              <TouchableOpacity onPress={() => setShowItemDetails(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {selectedItem && (
              <ScrollView style={styles.itemDetailsContent}>
                <Image source={{ uri: selectedItem.images[0] }} style={styles.detailImage} />
                
                <Text style={styles.detailTitle}>{selectedItem.title}</Text>
                <Text style={styles.detailDescription}>{selectedItem.description}</Text>
                
                <View style={styles.detailPrice}>
                  {selectedItem.teamDiscount && (
                    <Text style={styles.detailOriginalPrice}>${selectedItem.price}</Text>
                  )}
                  <Text style={styles.detailCurrentPrice}>
                    ${Math.round(selectedItem.price * (1 - (selectedItem.teamDiscount || 0) / 100))}
                  </Text>
                  {selectedItem.teamDiscount && (
                    <Text style={styles.detailDiscount}>{selectedItem.teamDiscount}% OFF</Text>
                  )}
                </View>

                <View style={styles.detailInfo}>
                  <View style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Condition</Text>
                    <Text style={[styles.detailInfoValue, { color: getConditionColor(selectedItem.condition) }]}>
                      {selectedItem.condition.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Location</Text>
                    <Text style={styles.detailInfoValue}>{selectedItem.location}</Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Seller</Text>
                    <Text style={styles.detailInfoValue}>{selectedItem.seller.name}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Buy Now</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  cartButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
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
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 12,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  activeCategory: {
    backgroundColor: '#10B981',
  },
  categoryText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  itemsList: {
    flex: 1,
  },
  itemRow: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: (screenWidth - 80) / 2,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImageContainer: {
    position: 'relative',
    height: 120,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  teamExclusiveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  teamExclusiveText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 6,
  },
  itemContent: {
    padding: 12,
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCategoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 8,
    lineHeight: 16,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemCondition: {
    flex: 1,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  itemLocation: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 10,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  discountText: {
    fontSize: 8,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  itemStats: {
    flexDirection: 'row',
    gap: 8,
  },
  itemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  itemStatText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  itemDetailsModal: {
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
  itemDetailsContent: {
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 24,
  },
  detailPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  detailOriginalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  detailCurrentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  detailDiscount: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  detailInfo: {
    marginBottom: 20,
  },
  detailInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailInfoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  detailInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});








