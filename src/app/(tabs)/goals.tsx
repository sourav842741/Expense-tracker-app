import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Target, Flame, ChevronRight, X } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR } from '@/utils/currency';
import { formatDateShort } from '@/utils/dates';

export default function GoalsScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const goals = useAppStore((state) => state.goals);
  const achievements = useAppStore((state) => state.achievements);
  const depositToGoal = useAppStore((state) => state.depositToGoal);

  // Deposit Quick Modal state
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const handleDeposit = () => {
    const num = parseFloat(depositAmount);
    if (selectedGoalId && !isNaN(num) && num > 0) {
      depositToGoal(selectedGoalId, num, depositNote);
      setSelectedGoalId(null);
      setDepositAmount('');
      setDepositNote('');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { paddingHorizontal: spacing.standard }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Savings Goals</Text>
          <TouchableOpacity
            onPress={() => router.push('/goals/create')}
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
            accessibilityLabel="Add Goal"
          >
            <Plus size={18} color={colors.accentInverted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Savings Streak Gamification Card */}
          <Card style={[styles.streakCard, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.streakHeader}>
              <View style={styles.streakTitleRow}>
                <Flame size={20} color="#E86C38" style={{ marginRight: 6 }} />
                <Text style={[styles.streakTitle, { color: colors.textPrimary }]}>
                  7 Month Savings Streak
                </Text>
              </View>
              <Text style={[styles.totalSaved, { color: colors.accent }]}>
                {formatINR(totalSaved)}
              </Text>
            </View>
            <Text style={[styles.streakDesc, { color: colors.textSecondary }]}>
              You saved money every month for the last 7 months. Keep momentum!
            </Text>

            {/* Badges */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
              {achievements.map((ach) => (
                <View
                  key={ach.id}
                  style={[
                    styles.badgeChip,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: ach.unlocked ? 1 : 0.45,
                    },
                  ]}
                >
                  <Text style={styles.badgeIcon}>{ach.icon}</Text>
                  <Text style={[styles.badgeTitle, { color: colors.textPrimary }]}>
                    {ach.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Card>

          {/* Goals List Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Active Goals
            </Text>
            <Text style={[styles.goalsCount, { color: colors.textSecondary }]}>
              {goals.length} goals
            </Text>
          </View>

          {goals.length === 0 ? (
            <EmptyState
              icon={<Target size={28} color={colors.textSecondary} />}
              title="Start your first savings goal"
              description="Small monthly savings build toward something meaningful. Emergency fund, vacation, or gadget."
              actionTitle="+ Create Goal"
              onAction={() => router.push('/goals/create')}
            />
          ) : (
            goals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <Card
                  key={goal.id}
                  onPress={() => router.push(`/goals/${goal.id}`)}
                  style={styles.goalCard}
                >
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleWrap}>
                      <View
                        style={[
                          styles.iconBadge,
                          {
                            backgroundColor: colors.surfaceSecondary,
                            borderRadius: radius.smallCard,
                          },
                        ]}
                      >
                        <Target size={18} color={colors.accent} />
                      </View>
                      <View>
                        <Text style={[styles.goalTitle, { color: colors.textPrimary }]}>
                          {goal.title}
                        </Text>
                        <Text style={[styles.goalTargetDate, { color: colors.textSecondary }]}>
                          Target: {formatDateShort(goal.targetDate)}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </View>

                  <View style={styles.amountSection}>
                    <View style={styles.amountRow}>
                      <Text style={[styles.savedAmount, { color: colors.textPrimary }]}>
                        {formatINR(goal.currentAmount)}
                      </Text>
                      <Text style={[styles.targetAmount, { color: colors.textSecondary }]}>
                        / {formatINR(goal.targetAmount)}
                      </Text>
                      <Text style={[styles.pctText, { color: colors.accent }]}>
                        {pct}%
                      </Text>
                    </View>

                    <ProgressBar progress={pct} height={8} style={{ marginVertical: 10 }} />
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.goalFooter}>
                    <Text style={[styles.remainingText, { color: colors.textSecondary }]}>
                      {formatINR(remaining)} remaining
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedGoalId(goal.id)}
                      style={[styles.depositBtn, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <Text style={[styles.depositBtnText, { color: colors.textPrimary }]}>
                        + Add Savings
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Deposit Quick Modal */}
        <Modal
          visible={!!selectedGoalId}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedGoalId(null)}
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
                  Add Savings Deposit
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedGoalId(null)}
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <X size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Input
                label="Deposit Amount (₹)"
                placeholder="e.g. 5000"
                keyboardType="numeric"
                prefix="₹"
                value={depositAmount}
                onChangeText={setDepositAmount}
              />

              <Input
                label="Note (optional)"
                placeholder="e.g. Monthly contribution"
                value={depositNote}
                onChangeText={setDepositNote}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 40,
    gap: 14,
  },
  streakCard: {
    padding: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalSaved: {
    fontSize: 16,
    fontWeight: '700',
  },
  streakDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  badgesScroll: {
    flexDirection: 'row',
    marginTop: 12,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalsCount: {
    fontSize: 12,
  },
  goalCard: {
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  goalTargetDate: {
    fontSize: 12,
    marginTop: 2,
  },
  amountSection: {
    marginTop: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  savedAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  targetAmount: {
    fontSize: 13,
    marginLeft: 4,
    flex: 1,
  },
  pctText: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  depositBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  depositBtnText: {
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 16,
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
