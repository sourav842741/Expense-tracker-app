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
import { ArrowLeft, Check } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PaymentCategory, PaymentFrequency, PaymentMethod } from '@/types/payment';

export default function CreatePaymentScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const addPaymentPlan = useAppStore((state) => state.addPaymentPlan);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<PaymentCategory>('emi');
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');
  const [dueDay, setDueDay] = useState('10');
  const [totalCycles, setTotalCycles] = useState('12');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [error, setError] = useState('');

  const categories: { label: string; value: PaymentCategory }[] = [
    { label: 'EMI', value: 'emi' },
    { label: 'Housing', value: 'housing' },
    { label: 'Insurance', value: 'insurance' },
    { label: 'Subscription', value: 'subscription' },
    { label: 'Utility', value: 'utility' },
    { label: 'Contribution', value: 'contribution' },
  ];

  const frequencies: { label: string; value: PaymentFrequency }[] = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Please enter a payment title');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const day = parseInt(dueDay, 10) || 10;
    const cycles = parseInt(totalCycles, 10) || 12;
    const startDate = new Date().toISOString().split('T')[0];

    addPaymentPlan({
      userId: 'user_sourav_1',
      title: title.trim(),
      amount: numAmount,
      category,
      frequency,
      startDate,
      totalCycles: cycles,
      dueDay: day,
      paymentMethod,
      reminderDaysBefore: 3,
      status: 'active',
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
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Add Payment</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Payment name"
          placeholder="e.g. Bike EMI, Flat Rent"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            setError('');
          }}
          error={error}
        />

        <Input
          label="Amount"
          placeholder="5000"
          keyboardType="numeric"
          prefix="₹"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Category Selector */}
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

        {/* Frequency Selector */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Frequency</Text>
        <View style={styles.chipsRow}>
          {frequencies.map((f) => {
            const isSelected = frequency === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setFrequency(f.value)}
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
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.splitRow}>
          <View style={{ flex: 1 }}>
            <Input
              label="Due Day of Month"
              placeholder="10"
              keyboardType="numeric"
              value={dueDay}
              onChangeText={setDueDay}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Input
              label="Total Cycles"
              placeholder="12"
              keyboardType="numeric"
              value={totalCycles}
              onChangeText={setTotalCycles}
            />
          </View>
        </View>

        <Input
          label="Payment Method"
          placeholder="UPI, Bank Transfer, Auto Debit"
          value={paymentMethod}
          onChangeText={(m) => setPaymentMethod(m as PaymentMethod)}
        />

        <Button
          title="Add Payment"
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
  splitRow: {
    flexDirection: 'row',
  },
  submitBtn: {
    marginTop: 20,
  },
});
