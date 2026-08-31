import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  X,
  ChevronRight,
  Pencil,
  Trash2,
  UserPlus,
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
  const updateCircle = useAppStore((state) => state.updateCircle);
  const deleteCircle = useAppStore((state) => state.deleteCircle);

  const circle = circles.find((c) => c.id === id) || circles[0];

  // Modals State
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [memberHistoryModal, setMemberHistoryModal] = useState<CircleMember | null>(null);

  // Edit Circle State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(circle ? circle.name : '');
  const [editDescription, setEditDescription] = useState(circle ? circle.description || '' : '');
  const [editTarget, setEditTarget] = useState(circle ? String(circle.targetAmount) : '');
  const [editDueDay, setEditDueDay] = useState(circle ? String(circle.dueDay) : '15');

  // Add Member State
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAmount, setNewMemberAmount] = useState('');

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

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Please enter a circle name.');
      return;
    }
    const target = parseFloat(editTarget);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target amount.');
      return;
    }
    const day = parseInt(editDueDay, 10) || circle.dueDay;

    updateCircle(circle.id, {
      name: editName.trim(),
      description: editDescription.trim(),
      targetAmount: target,
      dueDay: day,
    });
    setEditModalVisible(false);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert('Validation Error', 'Please enter a member name.');
      return;
    }
    const expected = parseFloat(newMemberAmount) || 0;
    const newMember: CircleMember = {
      id: `m_${Date.now()}`,
      name: newMemberName.trim(),
      expectedAmount: expected,
      paidAmount: 0,
      status: 'pending',
      history: [],
    };

    updateCircle(circle.id, {
      members: [...circle.members, newMember],
    });

    setAddMemberModalVisible(false);
    setNewMemberName('');
    setNewMemberAmount('');
  };

  const handleDeleteCircle = () => {
    Alert.alert(
      'Delete Money Circle',
      `Are you sure you want to delete "${circle.name}"? All member records and pool data will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCircle(circle.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Nav Bar */}
      <View style={[styles.navBar, { paddingHorizontal: spacing.standard }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Circle Details</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              setEditName(circle.name);
              setEditDescription(circle.description || '');
              setEditTarget(String(circle.targetAmount));
              setEditDueDay(String(circle.dueDay));
              setEditModalVisible(true);
            }}
            style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
            accessibilityLabel="Edit Circle"
          >
            <Pencil size={16} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteCircle}
            style={[styles.navBtn, { backgroundColor: colors.danger + '15' }]}
            accessibilityLabel="Delete Circle"
          >
            <Trash2 size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Pool Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={{ flex: 1 }}>
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
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Circle Members ({circle.members.length})
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Tap to view history or record payment
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setAddMemberModalVisible(true)}
            style={[styles.addMemberBtn, { backgroundColor: colors.accent + '15' }]}
          >
            <UserPlus size={14} color={colors.accent} />
            <Text style={[styles.addMemberText, { color: colors.accent }]}>Add Member</Text>
          </TouchableOpacity>
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
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.textPrimary }]}>
                      {member.name}
                    </Text>
                    <Text style={[styles.memberSub, { color: colors.textSecondary }]}>
                      Target: {formatINR(member.expectedAmount)}
                      {member.lastPaymentDate ? ` · Paid ${member.lastPaymentDate}` : ''}
                    </Text>
                  </View>

                  <View style={styles.memberRight}>
                    <Text
                      style={[
                        styles.paidAmount,
                        { color: isPaid ? colors.success : colors.textPrimary },
                      ]}
                    >
                      {formatINR(member.paidAmount)}
                    </Text>
                    <StatusBadge
                      status={isPaid ? 'paid' : 'pending'}
                      label={isPaid ? 'Paid' : 'Pending'}
                    />
                  </View>
                </View>

                {/* Quick Record Button */}
                {!isPaid && (
                  <Button
                    title="Record Payment"
                    onPress={() => {
                      setSelectedMember(member);
                      setContributionAmount(String(member.expectedAmount - member.paidAmount));
                    }}
                    variant="outline"
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
                Record Payment for {selectedMember?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedMember(null)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Enter the amount collected from {selectedMember?.name}.
            </Text>

            <Input
              label="Amount (₹)"
              placeholder="e.g. 5000"
              value={contributionAmount}
              onChangeText={setContributionAmount}
              keyboardType="numeric"
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

      {/* Edit Circle Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
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
                Edit Money Circle
              </Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Circle Name"
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Family Monthly Pool"
            />

            <Input
              label="Description"
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="e.g. Joint fund for groceries"
            />

            <Input
              label="Target Amount (₹)"
              value={editTarget}
              onChangeText={setEditTarget}
              keyboardType="numeric"
              placeholder="e.g. 20000"
            />

            <Input
              label="Due Day of Month (1-31)"
              value={editDueDay}
              onChangeText={setEditDueDay}
              keyboardType="numeric"
              placeholder="e.g. 15"
            />

            <Button
              title="Save Changes"
              onPress={handleSaveEdit}
              variant="primary"
              size="md"
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        visible={addMemberModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddMemberModalVisible(false)}
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
                Add Member to Circle
              </Text>
              <TouchableOpacity
                onPress={() => setAddMemberModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Member Name"
              value={newMemberName}
              onChangeText={setNewMemberName}
              placeholder="e.g. Rahul Sharma"
            />

            <Input
              label="Expected Contribution Amount (₹)"
              value={newMemberAmount}
              onChangeText={setNewMemberAmount}
              keyboardType="numeric"
              placeholder="e.g. 5000"
            />

            <Button
              title="Add Member"
              onPress={handleAddMember}
              variant="primary"
              size="md"
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* Member Payment History Modal */}
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
                Total Expected: {formatINR(memberHistoryModal?.expectedAmount || 0)}
              </Text>
              <Text style={[styles.summaryText, { color: colors.success }]}>
                Total Paid: {formatINR(memberHistoryModal?.paidAmount || 0)}
              </Text>
            </View>

            {memberHistoryModal?.history && memberHistoryModal.history.length > 0 ? (
              memberHistoryModal.history.map((h, idx) => (
                <View
                  key={idx}
                  style={[styles.historyRow, { borderColor: colors.border }]}
                >
                  <Text style={[styles.historyMonth, { color: colors.textPrimary }]}>
                    {h.month} ({h.date || 'Recorded'})
                  </Text>
                  <Text style={[styles.historyAmt, { color: colors.success }]}>
                    +{formatINR(h.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textSecondary, paddingVertical: 12, textAlign: 'center' }}>
                No past transactions recorded yet.
              </Text>
            )}
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
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    fontSize: 12,
    fontWeight: '600',
  },
  poolAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 6,
  },
  collectedAmount: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addMemberText: {
    fontSize: 12,
    fontWeight: '700',
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
