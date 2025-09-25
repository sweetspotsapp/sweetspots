import React from 'react';
import { View } from 'react-native';
import {
  DollarSign,
  Clock,
  Calendar,
  MapPin,
  TrendingUp,
} from 'lucide-react-native';
import { TripSummary } from '@/types/Place';
import { SSText } from './ui/SSText';
import { formatCurrency, formatDuration } from '@/utils/formatter';
import { Card } from './ui/card';

interface TripSummaryCardProps {
  summary: TripSummary;
}

export function TripSummaryCard({ summary }: TripSummaryCardProps) {
  return (
    <Card className='p-4'>
      <SSText
        variant="semibold"
        className="text-lg text-gray-800 mb-4 text-center"
      >
        Trip Summary
      </SSText>

      <View className="grid grid-cols-2 gap-4 mb-4">
        <Card className='p-4 justify-center items-center'>
          <View className="w-10 h-10 rounded-full bg-white justify-center items-center mb-2 shadow-sm">
            <DollarSign size={20} className="text-orange-500" />
          </View>
          <SSText variant="bold" className="text-xl text-gray-800 mb-1">
            {formatCurrency(summary.minEstimatedCost)} -{' '}
            {formatCurrency(summary.maxEstimatedCost)}
          </SSText>
          <SSText
            variant="medium"
            className="text-xs text-slate-500 text-center"
          >
            Total Cost
          </SSText>
        </Card>

        <Card className='p-4 justify-center items-center'>
          <View className="w-10 h-10 rounded-full bg-white justify-center items-center mb-2 shadow-sm">
            <Clock size={20} color="#0ea5e9" />
          </View>
          <SSText variant="bold" className="text-xl text-gray-800 mb-1 text-center">
            {formatDuration({ hours: summary.totalDuration, hideSeconds: true })}
          </SSText>
          <SSText
            variant="medium"
            className="text-xs text-slate-500 text-center"
          >
            Total Time
          </SSText>
        </Card>

        <Card className='p-4 justify-center items-center'>
          <View className="w-10 h-10 rounded-full bg-white justify-center items-center mb-2 shadow-sm">
            <Calendar size={20} color="#f59e0b" />
          </View>
          <SSText variant="bold" className="text-xl text-gray-800 mb-1">
            {summary.totalDays || 0}
          </SSText>
          <SSText
            variant="medium"
            className="text-xs text-slate-500 text-center"
          >
            Days
          </SSText>
        </Card>

        <Card className='p-4 justify-center items-center'>
          <View className="w-10 h-10 rounded-full bg-white justify-center items-center mb-2 shadow-sm">
            <TrendingUp size={20} color="#8b5cf6" />
          </View>
          <SSText variant="bold" className="text-xl text-gray-800 mb-1">
            {formatCurrency(summary.averageCostPerDay)}
          </SSText>
          <SSText
            variant="medium"
            className="text-xs text-slate-500 text-center"
          >
            Per Day
          </SSText>
        </Card>
      </View>

      {summary.totalDays > 0 && (
        <View className="border-t border-slate-100 pt-4 gap-2">
          <View className="flex-row items-center gap-2 justify-center">
            <MapPin size={16} color="#64748b" />
            <SSText className="text-sm text-slate-500">
              ~{summary.placesPerDay.toFixed(1)} places per day
            </SSText>
          </View>
          <View className="flex-row items-center gap-2 justify-center">
            <Clock size={16} color="#64748b" />
            <SSText className="text-sm text-slate-500">
              ~
              {formatDuration({
                hours: summary.totalDuration / summary.totalDays,
              })}{' '}
              per day
            </SSText>
          </View>
        </View>
      )}
    </Card>
  );
}
