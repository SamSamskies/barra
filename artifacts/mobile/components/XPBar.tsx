import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { getLevelInfo } from '@/constants/track';

interface XPBarProps {
  xp: number;
  compact?: boolean;
}

export function XPBar({ xp, compact = false }: XPBarProps) {
  const colors = useColors();
  const { level, progress } = getLevelInfo(xp);
  const widthPct = useSharedValue(0);

  useEffect(() => {
    widthPct.value = withTiming(progress * 100, { duration: 900 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%`,
  }));

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <View style={[styles.levelPill, { backgroundColor: colors.primary }]}>
          <Text style={[styles.levelPillText, { color: colors.primaryForeground }]}>
            {level}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.muted, flex: 1 }]}>
          <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, barStyle]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.levelText, { color: colors.primaryForeground }]}>
            Lv {level}
          </Text>
        </View>
        <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>
          {xp.toLocaleString()} XP
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  xpLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelPillText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
});
