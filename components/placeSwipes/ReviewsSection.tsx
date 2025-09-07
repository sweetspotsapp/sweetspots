import { View } from 'react-native'
import React from 'react'
import { SSText } from '../ui/SSText'
import { Card } from '../ui/card'

export default function ReviewsSection() {
  return (
    <Card className='p-4'>
      <SSText className='!text-lg font-bold'>Reviews</SSText>
    </Card>
  )
}