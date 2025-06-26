import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Star, ThumbsUp } from 'lucide-react-native';
import { IReview } from '@/api/reviews/dto/review.dto';
import { SSText } from './ui/SSText';

interface ReviewCardProps {
  review: IReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
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

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
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
              {formatDate(review.createdAt)}
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
  );
}