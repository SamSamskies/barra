import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface PathNodeProps {
  title: string;
  icon: string;
  nodeColor: string;
  status: 'completed' | 'active' | 'locked';
  progress: { completed: number; total: number };
  onPress: () => void;
}

export function PathNode({ title, icon, nodeColor, status, progress, onPress }: PathNodeProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (status === 'active') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 850 }),
          withTiming(1, { duration: 850 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isActive = status === 'active';

  return (
    <Pressable
      onPress={!isLocked ? onPress : undefined}
      style={({ pressed }) => [pressed && !isLocked && styles.pressed]}
    >
      <View style={styles.wrapper}>
        <Animated.View
          style={[
            animatedStyle,
            styles.circle,
            {
              backgroundColor: isCompleted
                ? nodeColor
                : isActive
                ? colors.card
                : colors.muted,
              borderColor: isLocked ? colors.border : nodeColor,
              borderWidth: isActive ? 3.5 : isCompleted ? 0 : 2,
            },
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={30} color="#fff" />
          ) : (
            <Ionicons
              name={icon as any}
              size={26}
              color={isLocked ? colors.mutedForeground : nodeColor}
            />
          )}
        </Animated.View>

        {/* Progress dots */}
        {!isLocked && (
          <View style={styles.dotsRow}>
            {Array.from({ length: progress.total }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i < progress.completed ? nodeColor : colors.border,
                    width: i === progress.completed && !isCompleted ? 10 : 8,
                  },
                ]}
              />
            ))}
          </View>
        )}

        <Text
          style={[
            styles.title,
            {
              color: isLocked ? colors.mutedForeground : colors.foreground,
              fontFamily: isActive ? 'Inter_700Bold' : 'Inter_500Medium',
            },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.75,
  },
  wrapper: {
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 88,
    lineHeight: 16,
  },
});
