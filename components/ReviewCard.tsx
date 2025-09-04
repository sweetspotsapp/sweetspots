import React from 'react';
import { View, Image, TouchableOpacity, Alert } from 'react-native';
import { ChevronDown, ChevronUp, Star, ThumbsUp } from 'lucide-react-native';
import { SSText } from './ui/SSText';
import { markReviewHelpful } from '@/api/reviews/endpoints';
import { getSavedHelpfulReviews, saveHelpfulReview } from '@/utils/storage';
import { IReview } from '@/dto/reviews/review.dto';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: IReview;
  hideHelpfulButton?: boolean;
}

export function ReviewCard({ review, hideHelpfulButton }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = React.useState(review.helpful);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    const checkLiked = async () => {
      const saved = await getSavedHelpfulReviews();
      if (saved.includes(review.id)) {
        setIsLiked(true);
      }
    };
    checkLiked();
  }, [review.id]);

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
        fill={index < rating ? '#fbbf24' : 'transparent'}
      />
    ));
  };

  const markAsHelpful = async () => {
    if (isLiked) {
      Alert.alert(
        'Already marked',
        'You have already marked this review as helpful.'
      );
      return;
    }

    try {
      const res = await markReviewHelpful(review.id);
      await saveHelpfulReview(review.id);
      setHelpfulCount(res.data?.helpful ?? helpfulCount + 1);
      setIsLiked(true);
    } catch (err) {
      console.error('Error marking review helpful:', err);
    }
  };

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: review.userAvatar }}
          className="w-12 h-12 rounded-full mr-3"
        />
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

      <SSText
        className="text-sm text-gray-600 leading-5 mb-1"
        numberOfLines={isExpanded ? undefined : 3}
      >
        {review.comment}
      </SSText>

      {/* Toggle link */}
      {(review.comment ?? '').length > 100 && (
        <TouchableOpacity className='flex-row items-center mb-3 gap-1' onPress={() => setIsExpanded(!isExpanded)}>
          {
            !isExpanded ? (
              <ChevronDown size={12} className={'text-orange-500'}/>
            ) : (
              <ChevronUp size={12} className={'text-orange-500'}/>
            )
          }
          <SSText className="text-xs !text-orange-500">
            {isExpanded ? 'Read less' : 'Read more'}
          </SSText>
        </TouchableOpacity>
      )}

      {!hideHelpfulButton && (
        <View className="flex-row justify-end">
          <TouchableOpacity
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-2xl ${
              isLiked ? 'bg-orange-100' : 'bg-slate-100'
            }`}
            onPress={markAsHelpful}
            disabled={isLiked}
          >
            <ThumbsUp size={14} color={isLiked ? '#10b981' : '#64748b'} />
            <SSText
              variant="medium"
              className={`text-xs ${
                isLiked ? 'text-orange-600' : 'text-slate-500'
              }`}
            >
              Helpful ({helpfulCount})
            </SSText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}