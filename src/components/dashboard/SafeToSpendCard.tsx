import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Sparkles, ChevronRight, X, Info, Zap } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatINR } from '@/utils/currency';
import { SafeToSpendBreakdown } from '@/utils/safeToSpend';

interface SafeToSpendCardProps {
  breakdown: SafeToSpendBreakdown;
  hideBalance: boolean;
}

export const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  breakdown,
  hideBalance,
}) => {
  const { colors, radius, spacing, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Calculate days remaining in current month
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - today.getDate());
  const dailySafeToSpend = Math.round(breakdown.safeToSpend / daysRemaining);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Card
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#231D2E' : '#FAF5FF',
              borderColor: isDark ? '#4C1D95' : '#E9D5FF',
            },
          ]}
        >
          <View style={styles.content}>
            <View style={styles.leftCol}>
              <View style={styles.headerRow}>
                <View style={[styles.badge, { backgroundColor: '#8B5CF625' }]}>
                  <Sparkles size={12} color="#8B5CF6" style={styles.sparkleIcon} />
                  <Text style={styles.badgeText}>SAFE TO SPEND</Text>
                </View>
                <Text style={[styles.dailyText, { color: colors.textSecondary }]}>
                  ~{formatINR(dailySafeToSpend)} / day
                </Text>
              </View>

              <Text style={[styles.amount, { color: colors.textPrimary }]}>
                {hideBalance ? '••••' : `${formatINR(breakdown.safeToSpend)}`}
                <Text style={[styles.subText, { color: colors.textSecondary }]}> available this month</Text>
              </Text>

              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Fixed bills & savings targets already protected
              </Text>
            </View>

            <View style={[styles.arrowCircle, { backgroundColor: isDark ? '#3B2754' : '#F3E8FF' }]}>
              <ChevronRight size={16} color="#8B5CF6" />
            </View>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Breakdown Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderRadius: 24,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.titleRow}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#8B5CF620' }]}>
                  <Sparkles size={18} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    Safe-to-Spend Breakdown
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    Automated financial safety limit
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: isDark ? '#27272A' : '#F4F4F5' }]}
              >
                <X size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              MoneyCircle calculates how much guilt-free money you can spend after setting aside your fixed commitments and target savings.
            </Text>

            <View
              style={[
                styles.formulaBox,
                { backgroundColor: isDark ? colors.surfaceSecondary : '#F8F9FA', borderRadius: 14 },
              ]}
            >
              <View style={styles.formulaRow}>
                <Text style={[styles.formulaLabel, { color: colors.textSecondary }]}>Monthly Income</Text>
                <Text style={[styles.formulaValue, { color: colors.success }]}>
                  +{formatINR(breakdown.monthlyIncome)}
                </Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={[styles.formulaLabel, { color: colors.textSecondary }]}>Required Payments (EMI / Bills)</Text>
                <Text style={[styles.formulaValue, { color: colors.danger }]}>
                  -{formatINR(breakdown.requiredPayments)}
                </Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={[styles.formulaLabel, { color: colors.textSecondary }]}>Planned Living Expenses</Text>
                <Text style={[styles.formulaValue, { color: colors.textPrimary }]}>
                  -{formatINR(breakdown.plannedExpenses)}
                </Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={[styles.formulaLabel, { color: colors.textSecondary }]}>Savings Target</Text>
                <Text style={[styles.formulaValue, { color: colors.info }]}>
                  -{formatINR(breakdown.savingsTarget)}
                </Text>
              </View>

              <View style={[styles.formulaDivider, { backgroundColor: colors.border }]} />

              <View style={styles.formulaRow}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Safe to Spend</Text>
                <Text style={[styles.totalValue, { color: '#8B5CF6' }]}>
                  {formatINR(breakdown.safeToSpend)}
                </Text>
              </View>
            </View>

            <View style={styles.disclaimerRow}>
              <Info size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
                {daysRemaining} days remaining in this billing month.
              </Text>
            </View>

            <Button
              title="Got it"
              onPress={() => setModalVisible(false)}
              variant="primary"
              size="md"
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingRight: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sparkleIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 0.5,
  },
  dailyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 13,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    padding: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  formulaBox: {
    padding: 14,
    gap: 8,
  },
  formulaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formulaLabel: {
    fontSize: 13,
  },
  formulaValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  formulaDivider: {
    height: 1,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  disclaimerText: {
    fontSize: 12,
    flex: 1,
  },
});
