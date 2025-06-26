import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Star, ThumbsUp, ChevronLeft, ChevronRight, Eye } from 'lucide-react-native';
import { Review } from '@/types/Place';
import { SSText } from './ui/SSText';
import { Button } from './ui/button';
import { IReview } from '@/api/reviews/dto/review.dto';

const { width: screenWidth } = Dimensions.get('window');

interface ReviewCarouselProps {
  reviews: IReview[];
  onSeeAll?: () => void;
}

export function ReviewCarousel({ reviews, onSeeAll }: ReviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < reviews.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

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
        size={14}
        color="#fbbf24"
        fill={index < rating ? "#fbbf24" : "transparent"}
      />
    ));
  };

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const currentReview = reviews[currentIndex];

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <SSText variant="semibold" className="text-xl text-gray-800">
          Recent Reviews
        </SSText>
        
        {/* Navigation Controls */}
        {reviews.length > 1 && (
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className={`w-9 h-9 rounded-full justify-center items-center ${
                currentIndex === 0 
                  ? 'bg-slate-100 border border-slate-200' 
                  : 'bg-emerald-50 border border-emerald-600'
              }`}
              onPress={goToPrevious}
              disabled={currentIndex === 0}>
              <ChevronLeft 
                size={20} 
                color={currentIndex === 0 ? "#94a3b8" : "#10b981"} 
              />
            </TouchableOpacity>
            
            <SSText variant="medium" className="text-sm text-slate-500 min-w-15 text-center">
              {currentIndex + 1} of {reviews.length}
            </SSText>
            
            <TouchableOpacity
              className={`w-9 h-9 rounded-full justify-center items-center ${
                currentIndex === reviews.length - 1 
                  ? 'bg-slate-100 border border-slate-200' 
                  : 'bg-emerald-50 border border-emerald-600'
              }`}
              onPress={goToNext}
              disabled={currentIndex === reviews.length - 1}>
              <ChevronRight 
                size={20} 
                color={currentIndex === reviews.length - 1 ? "#94a3b8" : "#10b981"} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Single Review Card */}
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <View className="flex-row items-center mb-3">
          <Image source={{ uri: currentReview.userAvatar }} className="w-12 h-12 rounded-full mr-3" />
          <View className="flex-1">
            <SSText variant="semibold" className="text-base text-gray-800 mb-1">
              {currentReview.userName}
            </SSText>
            <View className="flex-row items-center gap-2">
              <View className="flex-row gap-0.5">
                {renderStars(currentReview.rating)}
              </View>
              <SSText className="text-xs text-slate-500">
                {formatDate(currentReview.createdAt)}
              </SSText>
            </View>
          </View>
        </View>
        
        <SSText className="text-sm text-gray-600 leading-5 mb-4">
          {currentReview.comment}
        </SSText>
        
        <View className="flex-row justify-end">
          <TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-2xl">
            <ThumbsUp size={14} color="#64748b" />
            <SSText variant="medium" className="text-xs text-slate-500">
              Helpful ({currentReview.helpful})
            </SSText>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Pagination Dots */}
      {reviews.length > 1 && (
        <View className="flex-row justify-center items-center mt-4 gap-2">
          {reviews.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToIndex(index)}
              className={`h-2 rounded-full ${
                index === currentIndex 
                  ? 'w-6 bg-emerald-600' 
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </View>
      )}

      {/* See All Button */}
      {onSeeAll && (
        <Button 
          variant='outline'
          onPress={onSeeAll}>
          <Eye size={16} color="#10b981" />
          <SSText className="text-emerald-600">
            See All Reviews ({reviews.length})
          </SSText>
        </Button>
      )}
    </View>
  );
}