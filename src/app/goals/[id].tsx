import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Target,
  Calendar,
  Sparkles,
  Plus,
  X,
  TrendingUp,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatINR } from '@/utils/currency';
import { formatDateFull, formatDateShort } from '@/utils/dates';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const goals = useAppStore((state) => state.goals);
  const depositToGoal = useAppStore((state) => state.depositToGoal);

  const goal = goals.find((g) => g.id === id) || goals[0];

  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  if (!goal) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Text style={{ padding: 20, color: colors.textPrimary }}>Goal not found.</Text>
      </SafeAreaView>
    );
  }

  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleDeposit = () => {
    const amt = parseFloat(amountInput);
    if (!isNaN(amt) && amt > 0) {
      depositToGoal(goal.id, amt, noteInput);
      setDepositModalVisible(false);
      setAmountInput('');
      setNoteInput('');
    }
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
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Goal Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Hero Goal Card */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            {goal.title}
          </Text>
          <Text style={[styles.heroAmount, { color: colors.textPrimary }]}>
            {formatINR(goal.currentAmount)}
          </Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            of {formatINR(goal.targetAmount)} ({pct}%)
          </Text>

          <ProgressBar
            progress={pct}
            height={10}
            style={{ width: '100%', marginVertical: 18 }}
          />

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Remaining
              </Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatINR(remaining)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Monthly Target
              </Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatINR(goal.monthlyContribution)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Target Date
              </Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatDateShort(goal.targetDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <Button
          title="+ Add Savings Deposit"
          onPress={() => setDepositModalVisible(true)}
          variant="primary"
          size="lg"
          style={{ marginBottom: 20 }}
        />

        {/* Transactions / History */}
        <View style={styles.historyHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Deposit History
          </Text>
          <Text style={[styles.historyCount, { color: colors.textSecondary }]}>
            {goal.transactions.length} entries
          </Text>
        </View>

        {goal.transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No deposits recorded yet. Tap "+ Add Savings Deposit" to begin.
            </Text>
          </Card>
        ) : (
          goal.transactions.map((tx) => (
            <Card key={tx.id} style={styles.txCard}>
              <View style={styles.txRow}>
                <View style={styles.txLeft}>
                  <View
                    style={[
                      styles.txIconWrap,
                      { backgroundColor: colors.surfaceSecondary },
                    ]}
                  >
                    <TrendingUp size={16} color={colors.success} />
                  </View>
                  <View>
                    <Text style={[styles.txTitle, { color: colors.textPrimary }]}>
                      {tx.note || 'Deposit'}
                    </Text>
                    <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                      {formatDateShort(tx.date)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.txAmount, { color: colors.success }]}>
                  +{formatINR(tx.amount)}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={depositModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colors.card,
                borderRadius: radius.card,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Add Deposit to {goal.title}
              </Text>
              <TouchableOpacity
                onPress={() => setDepositModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Amount (₹)"
              placeholder="e.g. 5000"
              keyboardType="numeric"
              prefix="₹"
              value={amountInput}
              onChangeText={setAmountInput}
            />

            <Input
              label="Note (optional)"
              placeholder="e.g. Monthly allocation, bonus"
              value={noteInput}
              onChangeText={setNoteInput}
            />

            <Button
              title="Confirm Deposit"
              onPress={handleDeposit}
              variant="primary"
              size="md"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginVertical: 4,
  },
  heroSub: {
    fontSize: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyCount: {
    fontSize: 12,
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  txCard: {
    padding: 14,
    marginBottom: 8,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
