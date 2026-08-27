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
  Users,
  CheckCircle2,
  Clock,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR } from '@/utils/currency';
import { CircleMember } from '@/types/circle';

export default function CircleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const circles = useAppStore((state) => state.circles);
  const recordMemberPayment = useAppStore((state) => state.recordMemberPayment);

  const circle = circles.find((c) => c.id === id) || circles[0];

  // Member Contribution Modal State
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [memberHistoryModal, setMemberHistoryModal] = useState<CircleMember | null>(null);

  if (!circle) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Text style={{ padding: 20, color: colors.textPrimary }}>Circle not found.</Text>
      </SafeAreaView>
    );
  }

  const pct = Math.round((circle.collectedAmount / circle.targetAmount) * 100);
  const remaining = Math.max(0, circle.targetAmount - circle.collectedAmount);

  const handleRecordContribution = () => {
    if (selectedMember && contributionAmount) {
      const amt = parseFloat(contributionAmount);
      if (!isNaN(amt) && amt > 0) {
        recordMemberPayment(circle.id, selectedMember.id, amt);
        setSelectedMember(null);
        setContributionAmount('');
      }
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
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Circle Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Pool Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.circleTitle, { color: colors.textPrimary }]}>
                {circle.name}
              </Text>
              <Text style={[styles.circleDesc, { color: colors.textSecondary }]}>
                {circle.description || `${circle.category} Pool`}
              </Text>
            </View>
            <View
              style={[
                styles.categoryChip,
                { backgroundColor: colors.surfaceSecondary, borderRadius: radius.chip },
              ]}
            >
              <Text style={[styles.categoryText, { color: colors.textPrimary }]}>
                {circle.category}
              </Text>
            </View>
          </View>

          <View style={styles.poolAmountRow}>
            <Text style={[styles.collectedAmount, { color: colors.textPrimary }]}>
              {formatINR(circle.collectedAmount)}
            </Text>
            <Text style={[styles.targetAmount, { color: colors.textSecondary }]}>
              / {formatINR(circle.targetAmount)}
            </Text>
            <Text style={[styles.pctText, { color: colors.accent }]}>{pct}%</Text>
          </View>

          <ProgressBar progress={pct} height={8} style={{ marginVertical: 12 }} />

          <View style={styles.poolFooter}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Remaining: {formatINR(remaining)}
            </Text>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Due day: {circle.dueDay}th
            </Text>
          </View>
        </Card>

        {/* Member Contributions Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Circle Members ({circle.members.length})
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Tap to view history or record payment
          </Text>
        </View>

        {/* Members List */}
        <View style={styles.membersList}>
          {circle.members.map((member) => {
            const isPaid = member.status === 'paid';
            return (
              <Card
                key={member.id}
                onPress={() => setMemberHistoryModal(member)}
                style={styles.memberCard}
              >
                <View style={styles.memberRow}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: isPaid ? colors.successBg : colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarLetter,
                        { color: isPaid ? colors.success : colors.textPrimary },
                      ]}
                    >
                      {member.name.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.textPrimary }]}>
                      {member.name}
                    </Text>
                    <Text style={[styles.memberSub, { color: colors.textSecondary }]}>
                      Expected: {formatINR(member.expectedAmount)}
                    </Text>
                  </View>

                  <View style={styles.memberRight}>
                    <Text style={[styles.paidAmount, { color: colors.textPrimary }]}>
                      {formatINR(member.paidAmount)}
                    </Text>
                    <StatusBadge
                      status={isPaid ? 'paid' : 'pending'}
                      label={isPaid ? '✓ Paid' : 'Pending'}
                      size="sm"
                    />
                  </View>
                </View>

                {!isPaid && (
                  <Button
                    title="Record Contribution"
                    onPress={() => {
                      setSelectedMember(member);
                      setContributionAmount(String(member.expectedAmount - member.paidAmount));
                    }}
                    variant="secondary"
                    size="sm"
                    style={{ marginTop: 10 }}
                  />
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Record Contribution Modal */}
      <Modal
        visible={!!selectedMember}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMember(null)}
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
                Record Member Payment
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedMember(null)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Recording contribution for {selectedMember?.name}
            </Text>

            <Input
              label="Contribution Amount (₹)"
              placeholder="5000"
              keyboardType="numeric"
              prefix="₹"
              value={contributionAmount}
              onChangeText={setContributionAmount}
            />

            <Button
              title="Confirm Payment"
              onPress={handleRecordContribution}
              variant="primary"
              size="md"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Member History Modal */}
      <Modal
        visible={!!memberHistoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setMemberHistoryModal(null)}
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
                {memberHistoryModal?.name}'s History
              </Text>
              <TouchableOpacity
                onPress={() => setMemberHistoryModal(null)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.historySummary}>
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                Total Expected: {formatINR(memberHistoryModal?.expectedAmount || 0)} · Paid:{' '}
                {formatINR(memberHistoryModal?.paidAmount || 0)}
              </Text>
            </View>

            {memberHistoryModal?.history && memberHistoryModal.history.length > 0 ? (
              memberHistoryModal.history.map((h, i) => (
                <View key={i} style={[styles.historyRow, { borderColor: colors.border }]}>
                  <Text style={[styles.historyMonth, { color: colors.textPrimary }]}>
                    {h.month}
                  </Text>
                  <Text style={[styles.historyAmt, { color: colors.textPrimary }]}>
                    {formatINR(h.amount)}
                  </Text>
                  <StatusBadge
                    status={h.status === 'paid' ? 'paid' : 'pending'}
                    label={h.status === 'paid' ? '✓ Paid' : 'Pending'}
                    size="sm"
                  />
                </View>
              ))
            ) : (
              <Text style={{ marginVertical: 12, color: colors.textSecondary }}>
                No prior cycle history recorded for this member.
              </Text>
            )}

            <Button
              title="Close"
              onPress={() => setMemberHistoryModal(null)}
              variant="outline"
              size="sm"
              style={{ marginTop: 14 }}
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
  heroCard: {
    padding: 18,
    marginBottom: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  circleTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  circleDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  poolAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
  },
  collectedAmount: {
    fontSize: 26,
    fontWeight: '800',
  },
  targetAmount: {
    fontSize: 15,
    marginLeft: 6,
    flex: 1,
  },
  pctText: {
    fontSize: 18,
    fontWeight: '700',
  },
  poolFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  membersList: {
    gap: 10,
  },
  memberCard: {
    padding: 14,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberSub: {
    fontSize: 12,
    marginTop: 2,
  },
  memberRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paidAmount: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 13,
    marginBottom: 16,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historySummary: {
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  historyMonth: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyAmt: {
    fontSize: 13,
    fontWeight: '500',
  },
});
