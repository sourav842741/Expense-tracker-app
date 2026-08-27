import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoalCategory } from '@/types/goal';

export default function CreateGoalScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const addSavingsGoal = useAppStore((state) => state.addSavingsGoal);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [category, setCategory] = useState<GoalCategory>('emergency');
  const [error, setError] = useState('');

  const categories: { label: string; value: GoalCategory }[] = [
    { label: 'Emergency Fund', value: 'emergency' },
    { label: 'Gadget / Tech', value: 'gadget' },
    { label: 'Travel & Trips', value: 'travel' },
    { label: 'Vehicle', value: 'vehicle' },
    { label: 'Education', value: 'education' },
    { label: 'Lifestyle', value: 'lifestyle' },
  ];

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Please enter a goal title');
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Please enter a valid target amount');
      return;
    }
    const monthly = parseFloat(monthlyContribution) || Math.round(target / 12);

    addSavingsGoal({
      title: title.trim(),
      targetAmount: target,
      currentAmount: 0,
      targetDate: targetDate || '2026-12-31',
      monthlyContribution: monthly,
      category,
    });

    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingHorizontal: spacing.standard }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Create Goal</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Goal Name"
          placeholder="e.g. Emergency Safety Net, New Phone"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            setError('');
          }}
          error={error}
        />

        <Input
          label="Target Amount (₹)"
          placeholder="50000"
          keyboardType="numeric"
          prefix="₹"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />

        <Input
          label="Target Completion Date (YYYY-MM-DD)"
          placeholder="2026-12-31"
          value={targetDate}
          onChangeText={setTargetDate}
        />

        <Input
          label="Planned Monthly Contribution (₹)"
          placeholder="5000"
          keyboardType="numeric"
          prefix="₹"
          value={monthlyContribution}
          onChangeText={setMonthlyContribution}
        />

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
        <View style={styles.chipsRow}>
          {categories.map((c) => {
            const isSelected = category === c.value;
            return (
              <TouchableOpacity
                key={c.value}
                onPress={() => setCategory(c.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surfaceSecondary,
                    borderRadius: radius.chip,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? colors.accentInverted : colors.textPrimary },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Create Savings Goal"
          onPress={handleCreate}
          variant="primary"
          size="lg"
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 20,
  },
});
