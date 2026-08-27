import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Target,
  Bell,
  CheckCheck,
  Trash2,
  X,
  Mail,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppNotification, NotificationType } from '@/types/notification';
import { emailService } from '@/services/emailService';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, RNStatusBar.currentHeight || 0, Platform.OS === 'android' ? 36 : 10);

  const user = useAppStore((state) => state.user);
  const paymentPlans = useAppStore((state) => state.paymentPlans);
  const notifications = useAppStore((state) => state.notifications);
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead);
  const clearAllNotifications = useAppStore((state) => state.clearAllNotifications);
  const deleteNotification = useAppStore((state) => state.deleteNotification);

  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendTestEmiEmail = async () => {
    setSendingEmail(true);
    try {
      const activePlan = paymentPlans[0] || {
        id: 'plan_bike_emi',
        title: 'Bike EMI',
        amount: 5000,
        cycles: [{ status: 'due_soon', amount: 5000, dueDate: '2026-10-05' }],
      };

      const result = await emailService.sendEmiReminderEmail(
        user.email,
        user.name,
        activePlan as any
      );

      if (Platform.OS === 'web') {
        window.alert(`✅ EMI Alert Generated:\n${result.message}`);
      } else {
        Alert.alert('✅ Gmail EMI Alert Sent', result.message);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(`Email Notice: ${err.message}`);
      } else {
        Alert.alert('Notice', err.message);
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'PAYMENT_PAID':
        return <CheckCircle2 size={20} color={colors.success} />;
      case 'PAYMENT_OVERDUE':
        return <AlertTriangle size={20} color={colors.danger} />;
      case 'PAYMENT_DUE':
      case 'PAYMENT_DUE_TODAY':
        return <Clock size={20} color={colors.warning} />;
      case 'CIRCLE_MEMBER_PAID':
        return <UserCheck size={20} color={colors.info} />;
      case 'SAVINGS_GOAL_UPDATE':
        return <Target size={20} color={colors.accent} />;
      default:
        return <Bell size={20} color={colors.accent} />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingHorizontal: spacing.standard, paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Notifications</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllNotificationsRead}
              style={[styles.markReadBtn, { backgroundColor: colors.accent + '15' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <CheckCheck size={14} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.markReadText, { color: colors.accent }]}>Read all</Text>
            </TouchableOpacity>
          )}

          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={clearAllNotifications}
              style={[styles.clearBtn, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              accessibilityLabel="Clear all notifications"
            >
              <Trash2 size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Gmail EMI Notification Card */}
        <Card style={[styles.gmailCard, { borderColor: colors.border }]}>
          <View style={styles.gmailHeader}>
            <View style={[styles.gmailIconWrap, { backgroundColor: colors.accent + '15' }]}>
              <Mail size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.gmailTitle, { color: colors.textPrimary }]}>
                Gmail EMI Alerts
              </Text>
              <Text style={[styles.gmailSub, { color: colors.textSecondary }]}>
                {user.email || 'No email linked'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.testEmailBtn, { backgroundColor: colors.accent }]}
              onPress={handleSendTestEmiEmail}
              disabled={sendingEmail}
              activeOpacity={0.8}
            >
              <Text style={[styles.testEmailText, { color: colors.accentInverted }]}>
                {sendingEmail ? 'Sending...' : 'Test Gmail Alert'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={28} color={colors.textSecondary} />}
            title="All caught up!"
            description="You have no notifications. We'll alert you when payment due dates or contributions arrive."
          />
        ) : (
          notifications.map((item) => (
            <Card
              key={item.id}
              style={[
                styles.notifCard,
                {
                  backgroundColor: item.read ? colors.card : colors.surfaceSecondary,
                  borderColor: item.read ? colors.border : colors.accent,
                },
              ]}
            >
              <View style={styles.notifRow}>
                <View style={styles.iconWrap}>{getNotificationIcon(item.type)}</View>
                <View style={styles.contentWrap}>
                  <View style={styles.topLine}>
                    <Text
                      style={[
                        styles.notifTitle,
                        { color: colors.textPrimary, fontWeight: item.read ? '600' : '700' },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.timeText, { color: colors.textMuted }]}>
                        {formatRelativeTime(item.date)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteNotification(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={14} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>
                    {item.message}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
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
    paddingBottom: 14,
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
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700',
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 10,
  },
  notifCard: {
    padding: 14,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    marginRight: 12,
    marginTop: 2,
  },
  contentWrap: {
    flex: 1,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
  },
  timeText: {
    fontSize: 11,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  gmailCard: {
    padding: 14,
    marginBottom: 4,
  },
  gmailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gmailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gmailTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  gmailSub: {
    fontSize: 12,
    marginTop: 2,
  },
  testEmailBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  testEmailText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
