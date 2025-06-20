import React, { useState, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { X, Star, ThumbsUp, Search, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Review } from '@/types/Place';
import { SSText } from './ui/SSText';

interface AllReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  reviews: Review[];
  placeName: string;
}

export function AllReviewsModal({ 
  visible, 
  onClose, 
  reviews, 
  placeName 
}: AllReviewsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews;

    if (searchQuery.trim()) {
      filtered = filtered.filter(review =>
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRating !== null) {
      filtered = filtered.filter(review => review.rating === selectedRating);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

    return sorted;
  }, [reviews, searchQuery, selectedRating, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color="#fbbf24"
        fill={index < rating ? "#fbbf24" : "transparent"}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRating(null);
    setSortBy('newest');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={['#f0fdf4', '#ffffff']}
          className="absolute inset-0"
        />
        
        {/* Header */}
        <View className="flex-row justify-between items-start px-5 pt-5 pb-4 border-b border-slate-100">
          <View className="flex-1">
            <SSText variant="bold" className="text-2xl text-gray-800 mb-1">
              All Reviews
            </SSText>
            <SSText className="text-base text-slate-500">
              {placeName}
            </SSText>
          </View>
          <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center ml-4">
            <X size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {/* Rating Summary */}
        <View className="flex-row bg-white mx-5 mt-4 p-5 rounded-2xl shadow-sm">
          <View className="items-center mr-6">
            <SSText variant="bold" className="text-3xl text-gray-800 mb-2">
              {averageRating.toFixed(1)}
            </SSText>
            <View className="flex-row gap-0.5 mb-2">
              {renderStars(Math.round(averageRating))}
            </View>
            <SSText className="text-xs text-slate-500">
              {reviews.length} reviews
            </SSText>
          </View>
          
          <View className="flex-1 gap-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <TouchableOpacity
                key={rating}
                className="flex-row items-center gap-2"
                onPress={() => setSelectedRating(selectedRating === rating ? null : rating)}>
                <SSText className="text-xs text-slate-500 w-3">
                  {rating}
                </SSText>
                <Star size={12} color="#fbbf24" fill="#fbbf24" />
                <View className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <View 
                    className={`h-full rounded-full ${
                      selectedRating === rating ? 'bg-emerald-600' : 'bg-amber-400'
                    }`}
                    style={{ 
                      width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100}%`
                    }} 
                  />
                </View>
                <SSText className="text-xs text-slate-500 w-5 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </SSText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search and Filters */}
        <View className="px-5 py-4">
          <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-4 gap-3 shadow-sm">
            <Search size={20} color="#64748b" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Search reviews..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
              style={{ fontFamily: 'PlusJakartaSans-Regular' }}
            />
          </View>
          
          <View className="flex-row items-center gap-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
              <View className="flex-row gap-2">
                {[
                  { key: 'newest', label: 'Newest' },
                  { key: 'oldest', label: 'Oldest' },
                  { key: 'highest', label: 'Highest Rated' },
                  { key: 'lowest', label: 'Lowest Rated' },
                  { key: 'helpful', label: 'Most Helpful' },
                ].map(option => (
                  <TouchableOpacity
                    key={option.key}
                    className={`border px-4 py-2 rounded-full ${
                      sortBy === option.key
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'bg-white border-slate-200'
                    }`}
                    onPress={() => setSortBy(option.key as any)}>
                    <SSText 
                      variant="medium" 
                      className={`text-sm ${
                        sortBy === option.key ? 'text-white' : 'text-slate-500'
                      }`}>
                      {option.label}
                    </SSText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            {(searchQuery || selectedRating !== null || sortBy !== 'newest') && (
              <TouchableOpacity className="bg-rose-500 px-4 py-2 rounded-full" onPress={clearFilters}>
                <SSText variant="medium" className="text-sm text-white">
                  Clear
                </SSText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Reviews List */}
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {filteredAndSortedReviews.length === 0 ? (
            <View className="items-center py-15">
              <SSText variant="semibold" className="text-xl text-gray-800 mb-2">
                No reviews found
              </SSText>
              <SSText className="text-base text-slate-500 text-center">
                Try adjusting your search or filters
              </SSText>
            </View>
          ) : (
            filteredAndSortedReviews.map((review, index) => (
              <View key={review.id} className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-slate-100">
                <View className="flex-row items-center mb-3">
                  <Image source={{ uri: review.userAvatar }} className="w-12 h-12 rounded-full mr-3" />
                  <View className="flex-1">
                    <SSText variant="semibold" className="text-base text-gray-800 mb-1">
                      {review.userName}
                    </SSText>
                    <View className="flex-row items-center gap-2">
                      <View className="flex-row gap-0.5">
                        {renderStars(review.rating)}
                      </View>
                      <SSText className="text-xs text-slate-500">
                        {formatDate(review.date)}
                      </SSText>
                    </View>
                  </View>
                </View>
                
                <SSText className="text-sm text-gray-600 leading-5 mb-4">
                  {review.comment}
                </SSText>
                
                <View className="flex-row justify-end">
                  <TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-2xl">
                    <ThumbsUp size={14} color="#64748b" />
                    <SSText variant="medium" className="text-xs text-slate-500">
                      Helpful ({review.helpful})
                    </SSText>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          
          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}