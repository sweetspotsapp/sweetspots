import { View } from 'react-native'
import React from 'react'
import { Dialog, DialogContent } from '../ui/dialog'
import { SSText } from '../ui/SSText';

export default function CreatingItineraryLoadingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <View className='items-center justify-center'>
          <SSText>Creating itinerary...</SSText>
        </View>
      </DialogContent>
    </Dialog>
  )
}