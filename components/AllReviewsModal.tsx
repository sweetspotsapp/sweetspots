import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { X, Star, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SSText } from './ui/SSText';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { getReviews } from '@/api/reviews/endpoints';
import { IReview } from '@/dto/reviews/review.dto';
import { ReviewCard } from './placeSwipes/ReviewCard';

interface AllReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
}

function mapSortKey(
  uiKey: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
): 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful' {
  switch (uiKey) {
    case 'highest': return 'rating_high';
    case 'lowest': return 'rating_low';
    default: return uiKey;
  }
}

export function AllReviewsModal({
  visible,
  onClose,
  placeId,
  placeName,
}: AllReviewsModalProps) {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');

  useEffect(() => {
    if (!visible) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await getReviews({
          placeId,
          rating: selectedRating ?? undefined,
          sortBy: mapSortKey(sortBy),
          page: 1,
          limit: 100,
        });
        setReviews(res.data?.data ?? []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [visible, placeId, selectedRating, sortBy]);

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
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1);

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
                    className={`h-full rounded-full ${selectedRating === rating ? 'bg-orange-600' : 'bg-amber-400'
                      }`}
                    style={{
                      width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / (reviews.length || 1)) * 100}%`
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
          <View className="flex-row items-center gap-2 mb-4">
            <Search size={20} color="#64748b" />
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View className="flex-row items-center gap-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
              <View className="flex-row gap-2 overflow-visible">
                {[
                  { key: 'newest', label: 'Newest' },
                  { key: 'oldest', label: 'Oldest' },
                  { key: 'highest', label: 'Highest Rated' },
                  { key: 'lowest', label: 'Lowest Rated' },
                  { key: 'helpful', label: 'Most Helpful' },
                ].map(option => (
                  <Badge asChild variant={sortBy === option.key ? 'default' : 'outline'} key={option.key}>
                    <TouchableOpacity onPress={() => setSortBy(option.key as any)}>
                      <SSText>{option.label}</SSText>
                    </TouchableOpacity>
                  </Badge>
                ))}
              </View>
            </ScrollView>

            {(searchQuery || selectedRating !== null || sortBy !== 'newest') && (
              <Badge asChild variant='destructive'>
                <TouchableOpacity onPress={clearFilters}>
                  <SSText>Clear</SSText>
                </TouchableOpacity>
              </Badge>
            )}
          </View>
        </View>

        {/* Reviews List */}
        <ScrollView className="flex-1 px-5" contentContainerClassName='gap-3' showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View className="items-center py-20">
              <SSText className="text-base text-slate-500">Loading reviews...</SSText>
            </View>
          ) : reviews.length === 0 ? (
            <View className="items-center py-15">
              <SSText variant="semibold" className="text-xl text-gray-800 mb-2">
                No reviews found
              </SSText>
              <SSText className="text-base text-slate-500 text-center">
                Try adjusting your search or filters
              </SSText>
            </View>
          ) : (
            reviews.map((review) => (
              <ReviewCard review={review} key={review.id}/>
            ))
          )}

          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}