import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Star, ChevronLeft, ChevronRight, Eye } from 'lucide-react-native';
import { ReviewCard } from './ReviewCard';
import { IReview } from '@/dto/reviews/review.dto';
import { SSText } from '../ui/SSText';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

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

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const currentReview = reviews[currentIndex];

  return (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <SSText variant="semibold" className="text-xl text-gray-800">
          Reviews
        </SSText>
        
        {/* Navigation Controls */}
        {reviews.length > 1 && (
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className={`w-9 h-9 rounded-full justify-center items-center ${
                currentIndex === 0 
                  ? 'bg-slate-100 border border-slate-200' 
                  : 'bg-orange-50 border border-orange-600'
              }`}
              onPress={goToPrevious}
              disabled={currentIndex === 0}>
              <ChevronLeft 
                size={20} 
                className={cn(currentIndex === 0 ? "text-slate-400" : "text-orange-600")}
              />
            </TouchableOpacity>
            
            <SSText variant="medium" className="text-sm text-slate-500 min-w-15 text-center">
              {currentIndex + 1} of {reviews.length}
            </SSText>
            
            <TouchableOpacity
              className={`w-9 h-9 rounded-full justify-center items-center ${
                currentIndex === reviews.length - 1 
                  ? 'bg-slate-100 border border-slate-200' 
                  : 'bg-orange-50 border border-orange-600'
              }`}
              onPress={goToNext}
              disabled={currentIndex === reviews.length - 1}>
              <ChevronRight 
                size={20} 
                className={cn(currentIndex === reviews.length - 1 ? "text-slate-400" : "text-orange-600")}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Single Review Card */}
      <ReviewCard review={currentReview} hideHelpfulButton/>
      
      {/* Pagination Dots */}
      {reviews.length > 1 && (
        <View className="flex-row justify-center items-center mt-4 gap-2 mb-4">
          {reviews.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToIndex(index)}
              className={`h-2 rounded-full ${
                index === currentIndex 
                  ? 'w-6 bg-orange-600' 
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
          <Eye size={16} className='text-orange-50' />
          <SSText className="text-orange-600">
            See All Reviews ({reviews.length})
          </SSText>
        </Button>
      )}
    </Card>
  );
}