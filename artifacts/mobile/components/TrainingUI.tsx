import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export function Page({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'web' ? 67 : 0 }}>
    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: Platform.OS === 'web' ? 50 : 24, gap: 20 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
  </SafeAreaView>;
}
export function Heading({ children, small = false }: { children: React.ReactNode; small?: boolean }) {
  const colors = useColors();
  return <Text style={{ color: colors.foreground, fontSize: small ? 20 : 28, lineHeight: small ? 27 : 36, fontFamily: 'Inter_700Bold' }}>{children}</Text>;
}
export function Body({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return <Text style={{ color: colors.mutedForeground, fontSize: 15, lineHeight: 23, fontFamily: 'Inter_400Regular' }}>{children}</Text>;
}
export function Card({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, gap: 12 }}>{children}</View>;
}
export function Action({ title, onPress, secondary, disabled, label }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; label?: string }) {
  const colors = useColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={label ?? title} testID={label ?? title}
    disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, {
      backgroundColor: secondary ? colors.card : colors.primary, borderColor: colors.border,
      opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
    }]}>
    <Text style={{ color: secondary ? colors.foreground : colors.primaryForeground, fontSize: 15, fontFamily: 'Inter_600SemiBold', textAlign: 'center' }}>{title}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ action: { padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' } });
