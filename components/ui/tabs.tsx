// components/ui/tabs.tsx
import React from 'react';
import * as TabsPrimitive from '@rn-primitives/tabs';
import { Platform } from 'react-native';
import { cn } from '@/lib/utils';
import { TextClassContext } from '@/components/ui/SSText';

const TRACK_BG = 'bg-orange-500'; // orange bar
const SELECTED_BG = 'bg-white';
const SELECTED_TEXT = 'text-slate-900'; // dark text when active
const UNSELECTED_TEXT = 'text-white';   // white text when inactive

function Tabs({
  className,
  ...props
}: TabsPrimitive.RootProps & React.RefAttributes<TabsPrimitive.RootRef>) {
  return (
    <TabsPrimitive.Root
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.ListProps & React.RefAttributes<TabsPrimitive.ListRef>) {
  return (
    <TabsPrimitive.List
      className={cn(
        TRACK_BG,
        'flex h-10 flex-row items-center rounded-full p-1',
        Platform.select({ web: 'inline-flex w-fit', native: 'mr-auto' }),
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.TriggerProps & React.RefAttributes<TabsPrimitive.TriggerRef>) {
  const { value } = TabsPrimitive.useRootContext();
  const isSelected = value === props.value;

  return (
    <TextClassContext.Provider
      value={cn('text-base font-medium', isSelected ? SELECTED_TEXT : UNSELECTED_TEXT)}
    >
      <TabsPrimitive.Trigger
        className={cn(
          'relative flex flex-row items-center justify-center rounded-full px-6 py-1',
          'transition-all duration-200',
          isSelected
            ? cn(SELECTED_BG, 'shadow-sm')
            : 'bg-transparent',
          Platform.select({
            web: 'focus-visible:outline-2 focus-visible:outline-white/60',
          }),
          props.disabled && 'opacity-50',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.ContentProps & React.RefAttributes<TabsPrimitive.ContentRef>) {
  return (
    <TabsPrimitive.Content
      className={cn(Platform.select({ web: 'flex-1 outline-none' }), className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };