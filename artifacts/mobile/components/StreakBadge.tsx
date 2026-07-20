import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface StreakBadgeProps {
  streak: number;
  size?: 'small' | 'large';
}

export function StreakBadge({ streak, size = 'small' }: StreakBadgeProps) {
  const colors = useColors();
  const isLarge = size === 'large';
  const hasStreak = streak > 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: hasStreak ? colors.card : colors.muted },
      ]}
    >
      <Ionicons
        name={hasStreak ? 'flame' : 'flame-outline'}
        size={isLarge ? 26 : 18}
        color={hasStreak ? colors.primary : colors.mutedForeground}
      />
      <Text
        style={[
          styles.count,
          {
            color: hasStreak ? colors.foreground : colors.mutedForeground,
            fontSize: isLarge ? 22 : 15,
          },
        ]}
      >
        {streak}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  count: {
    fontFamily: 'Inter_700Bold',
  },
});
