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
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Check,
  X,
  Share2,
  Camera,
  Maximize2,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReceiptUploadModal } from '@/components/payments/ReceiptUploadModal';
import { formatINR } from '@/utils/currency';
import { formatDateFull, formatDateShort, getDueStatusInfo } from '@/utils/dates';
import { PaymentMethod } from '@/types/payment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar } from 'react-native';

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, RNStatusBar.currentHeight || 0, Platform.OS === 'android' ? 36 : 10);

  const paymentPlans = useAppStore((state) => state.paymentPlans);
  const markCyclePaid = useAppStore((state) => state.markCyclePaid);

  const plan = paymentPlans.find((p) => p.id === id) || paymentPlans[0];

  // Mark as Paid Modal State
  const [markPaidModalVisible, setMarkPaidModalVisible] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(plan ? plan.paymentMethod : 'UPI');
  const [refNumber, setRefNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [attachedProofUrl, setAttachedProofUrl] = useState<string>('');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!plan) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Text style={{ padding: 20, color: colors.textPrimary }}>Payment not found.</Text>
      </SafeAreaView>
    );
  }

  // Cycle Selection: pick latest paid with proof, or selected cycle, or next due
  const latestPaidWithProof = [...plan.cycles].reverse().find((c) => c.status === 'paid' && c.proofUrl);
  const latestPaidCycle = [...plan.cycles].reverse().find((c) => c.status === 'paid');
  const nextDueCycle = plan.cycles.find((c) => c.status !== 'paid');

  const displayedCycle = selectedCycleId
    ? plan.cycles.find((c) => c.id === selectedCycleId) || nextDueCycle || plan.cycles[0]
    : latestPaidWithProof || nextDueCycle || latestPaidCycle || plan.cycles[0];
  const activeCycle = displayedCycle;

  const isPaid = displayedCycle?.status === 'paid';
  const dueDateStr = displayedCycle?.dueDate || plan.startDate;
  const statusInfo = getDueStatusInfo(dueDateStr, isPaid);

  const paidCyclesCount = plan.cycles.filter((c) => c.status === 'paid').length;
  const totalCycles = plan.totalCycles;
  const progressPct = Math.round((paidCyclesCount / totalCycles) * 100);

  const handleConfirmPaid = () => {
    const cycleToPay = selectedCycleId || displayedCycle?.id || '';
    if (!cycleToPay) return;
    markCyclePaid(plan.id, cycleToPay, {
      method: paymentMethod,
      referenceNumber: refNumber || `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      notes: paymentNotes || 'Manual payment entry',
      proofUrl: attachedProofUrl || undefined,
    });
    setSelectedCycleId(cycleToPay);
    setMarkPaidModalVisible(false);
    setRefNumber('');
    setPaymentNotes('');
    setAttachedProofUrl('');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Custom Nav Bar */}
      <View style={[styles.navBar, { paddingHorizontal: spacing.standard, paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Payment Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Centered Main Summary */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            {plan.title}
          </Text>
          <Text style={[styles.heroAmount, { color: colors.textPrimary }]}>
            {formatINR(plan.amount)}
          </Text>
          <Text style={[styles.heroDate, { color: colors.textSecondary }]}>
            Due {formatDateFull(dueDateStr)}
          </Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            {plan.frequency.toUpperCase()} · {plan.paymentMethod}
          </Text>

          <View style={styles.badgeWrap}>
            <StatusBadge
              status={
                isPaid
                  ? 'paid'
                  : statusInfo.isOverdue
                  ? 'overdue'
                  : statusInfo.isDueToday
                  ? 'due_today'
                  : statusInfo.isDueSoon
                  ? 'due_soon'
                  : 'upcoming'
              }
              label={statusInfo.label}
            />
          </View>
        </View>

        {/* Action Button: Mark as Paid */}
        {!isPaid && (
          <Button
            title="Mark as Paid"
            onPress={() => {
              if (activeCycle) {
                setSelectedCycleId(activeCycle.id);
              }
              setMarkPaidModalVisible(true);
            }}
            variant="primary"
            size="lg"
            icon={<Check size={18} color={colors.accentInverted} />}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Payment Details Card */}
        <Card style={styles.detailCard}>
          <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
            Payment Details
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Payment amount
            </Text>
            <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
              {formatINR(plan.amount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Due date
            </Text>
            <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
              {formatDateShort(dueDateStr)}
            </Text>
          </View>

          {isPaid && activeCycle?.paidAt && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Paid date
              </Text>
              <Text style={[styles.detailVal, { color: colors.success }]}>
                {formatDateShort(activeCycle.paidAt)}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Payment method
            </Text>
            <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
              {activeCycle?.paymentMethod || plan.paymentMethod}
            </Text>
          </View>

          {activeCycle?.referenceNumber && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Reference No.
              </Text>
              <Text style={[styles.detailVal, { color: colors.textPrimary, fontFamily: 'monospace' }]}>
                {activeCycle?.referenceNumber}
              </Text>
            </View>
          )}
        </Card>

        {/* Plan Progress Card */}
        <Card style={styles.detailCard}>
          <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
            Plan Progress
          </Text>

          <View style={styles.progressRow}>
            <Text style={[styles.progressCount, { color: colors.textPrimary }]}>
              {paidCyclesCount} / {totalCycles} payments completed
            </Text>
            <Text style={[styles.progressPct, { color: colors.accent }]}>
              {progressPct}%
            </Text>
          </View>

          <ProgressBar progress={progressPct} height={8} style={{ marginVertical: 12 }} />

          {/* Payment Cycle History Matrix */}
          <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
            Cycle Breakdown
          </Text>

          <View style={styles.cyclesGrid}>
            {plan.cycles.map((cycle) => {
              const cyclePaid = cycle.status === 'paid';
              const isSelected = cycle.id === displayedCycle?.id;
              return (
                <TouchableOpacity
                  key={cycle.id}
                  onPress={() => setSelectedCycleId(cycle.id)}
                  style={[
                    styles.cycleItem,
                    {
                      backgroundColor: cyclePaid ? colors.successBg : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.accent : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cycleMonth,
                      { color: cyclePaid ? colors.success : colors.textPrimary },
                    ]}
                  >
                    Cycle #{cycle.cycleNumber}
                  </Text>
                  <Text style={[styles.cycleAmount, { color: colors.textSecondary }]}>
                    {formatINR(cycle.amount)}
                  </Text>
                  <Text
                    style={[
                      styles.cycleStatus,
                      { color: cyclePaid ? colors.success : colors.warning },
                    ]}
                  >
                    {cyclePaid ? '✓ Paid' : 'Pending'}
                  </Text>
                  {cycle.proofUrl && (
                    <Text style={{ fontSize: 10, color: colors.accent, fontWeight: '700', marginTop: 2 }}>
                      📷 Receipt
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Payment Proof Card */}
        <Card style={styles.detailCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View>
              <Text style={[styles.cardHeading, { color: colors.textPrimary, marginBottom: 0 }]}>
                UPI Payment Receipt Proof
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                Cycle #{displayedCycle?.cycleNumber || 1} · {formatDateShort(displayedCycle?.dueDate || dueDateStr)}
              </Text>
            </View>
            {displayedCycle?.proofUrl ? (
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setReceiptModalVisible(true)}>
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFullscreenImage(displayedCycle?.proofUrl || null)}>
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>View Full</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setReceiptModalVisible(true)}>
                <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>+ Attach</Text>
              </TouchableOpacity>
            )}
          </View>

          {displayedCycle?.proofUrl ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setFullscreenImage(displayedCycle?.proofUrl || null)}
              style={[styles.proofImageWrapper, { borderColor: colors.border }]}
            >
              <Image source={{ uri: displayedCycle?.proofUrl || '' }} style={styles.proofImageThumb} resizeMode="cover" />
              <View style={styles.maximizeBadge}>
                <Maximize2 size={14} color="#FFF" />
                <Text style={styles.maximizeText}>Tap to Zoom Receipt</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.proofBox, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setReceiptModalVisible(true)}
              activeOpacity={0.8}
            >
              <FileText size={24} color={colors.accent} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.proofTitle, { color: colors.textPrimary }]}>
                  {isPaid ? 'UPI Transfer Completed' : 'No receipt attached for this cycle'}
                </Text>
                <Text style={[styles.proofSub, { color: colors.textSecondary }]}>
                  {isPaid && displayedCycle?.referenceNumber
                    ? 'Ref: ' + displayedCycle?.referenceNumber + ' (Tap to attach receipt screenshot)'
                    : 'Tap here to upload UPI confirmation screenshot'}
                </Text>
              </View>
              <View style={[styles.attachMiniBtn, { backgroundColor: colors.accent + '20' }]}>
                <Camera size={16} color={colors.accent} />
              </View>
            </TouchableOpacity>
          )}
        </Card>
      </ScrollView>

      {/* Mark As Paid Modal */}
      <Modal
        visible={markPaidModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMarkPaidModalVisible(false)}
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
                Record Payment
              </Text>
              <TouchableOpacity
                onPress={() => setMarkPaidModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Confirm completion of {plan.title} ({formatINR(plan.amount)}).
            </Text>

            <Input
              label="Payment Method"
              value={paymentMethod}
              onChangeText={(text) => setPaymentMethod(text as PaymentMethod)}
              placeholder="UPI / Bank Transfer / Card"
            />

            <Input
              label="UPI / Transaction Reference Number"
              placeholder="e.g. UPI1234567890"
              value={refNumber}
              onChangeText={setRefNumber}
            />

            {/* Receipt Upload Trigger */}
            <TouchableOpacity
              style={[
                styles.uploadTrigger,
                {
                  backgroundColor: attachedProofUrl ? colors.success + '15' : colors.surfaceSecondary,
                  borderColor: attachedProofUrl ? colors.success : colors.border,
                },
              ]}
              onPress={() => setReceiptModalVisible(true)}
            >
              <Camera size={18} color={attachedProofUrl ? colors.success : colors.accent} style={{ marginRight: 8 }} />
              <Text
                style={[
                  styles.uploadTriggerText,
                  { color: attachedProofUrl ? colors.success : colors.textPrimary },
                ]}
              >
                {attachedProofUrl ? '✓ Receipt Photo Attached (Tap to change)' : 'Attach UPI Screenshot / Receipt'}
              </Text>
            </TouchableOpacity>

            <Input
              label="Notes"
              placeholder="e.g. September payment"
              value={paymentNotes}
              onChangeText={setPaymentNotes}
            />

            <Button
              title="Confirm Payment"
              onPress={handleConfirmPaid}
              variant="primary"
              size="md"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Receipt Upload Modal */}
      <ReceiptUploadModal
        visible={receiptModalVisible}
        currentProofUrl={attachedProofUrl || activeCycle?.proofUrl}
        onSelectProof={(url) => {
          setAttachedProofUrl(url);
          // If already paid, also update the active cycle directly
          if (isPaid && activeCycle) {
            markCyclePaid(plan.id, activeCycle.id, {
              method: activeCycle.paymentMethod || 'UPI',
              referenceNumber: activeCycle.referenceNumber,
              notes: activeCycle.notes,
              proofUrl: url,
            });
          }
        }}
        onClose={() => setReceiptModalVisible(false)}
      />

      {/* Fullscreen Image Preview Modal */}
      <Modal
        visible={!!fullscreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenImage(null)}
      >
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity
            style={styles.fullscreenCloseBtn}
            onPress={() => setFullscreenImage(null)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {fullscreenImage && (
            <Image
              source={{ uri: fullscreenImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
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
    paddingVertical: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginVertical: 6,
  },
  heroDate: {
    fontSize: 14,
  },
  heroSub: {
    fontSize: 13,
    marginTop: 2,
  },
  badgeWrap: {
    marginTop: 12,
  },
  detailCard: {
    padding: 18,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '700',
  },
  subHeading: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
  },
  cyclesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cycleItem: {
    width: '31%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cycleMonth: {
    fontSize: 12,
    fontWeight: '700',
  },
  cycleAmount: {
    fontSize: 11,
    marginVertical: 2,
  },
  cycleStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  proofBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  proofTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  proofSub: {
    fontSize: 11,
    marginTop: 2,
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
  proofImageWrapper: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  proofImageThumb: {
    width: '100%',
    height: '100%',
  },
  maximizeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  maximizeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  attachMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  uploadTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  uploadTriggerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
});
