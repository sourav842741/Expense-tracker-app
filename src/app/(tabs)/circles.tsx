import React from 'react';
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
import { Plus, Users, ChevronRight, Check } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR } from '@/utils/currency';

export default function CirclesScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const circles = useAppStore((state) => state.circles);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { paddingHorizontal: spacing.standard }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Money Circles</Text>
          <TouchableOpacity
            onPress={() => router.push('/circles/create')}
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
            accessibilityLabel="Add Circle"
          >
            <Plus size={18} color={colors.accentInverted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage shared group recurring funds and family pools
        </Text>

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {circles.length === 0 ? (
            <EmptyState
              icon={<Users size={28} color={colors.textSecondary} />}
              title="No money circles yet"
              description="Create a circle with your family, friends, or roommates to track collective monthly payments."
              actionTitle="+ Create Circle"
              onAction={() => router.push('/circles/create')}
            />
          ) : (
            circles.map((circle) => {
              const pct = Math.round((circle.collectedAmount / circle.targetAmount) * 100);
              const paidMembers = circle.members.filter((m) => m.status === 'paid').length;

              return (
                <Card
                  key={circle.id}
                  onPress={() => router.push(`/circles/${circle.id}`)}
                  style={styles.circleCard}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.titleWrap}>
                      <View
                        style={[
                          styles.iconBadge,
                          {
                            backgroundColor: colors.surfaceSecondary,
                            borderRadius: radius.smallCard,
                          },
                        ]}
                      >
                        <Users size={18} color={colors.accent} />
                      </View>
                      <View>
                        <Text style={[styles.circleName, { color: colors.textPrimary }]}>
                          {circle.name}
                        </Text>
                        <Text style={[styles.circleCat, { color: colors.textSecondary }]}>
                          {circle.category} · {circle.frequency}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </View>

                  <View style={styles.amountSection}>
                    <View style={styles.amountRow}>
                      <Text style={[styles.collected, { color: colors.textPrimary }]}>
                        {formatINR(circle.collectedAmount)}
                      </Text>
                      <Text style={[styles.target, { color: colors.textSecondary }]}>
                        / {formatINR(circle.targetAmount)}
                      </Text>
                      <Text style={[styles.percentage, { color: colors.accent }]}>
                        {pct}%
                      </Text>
                    </View>

                    <ProgressBar progress={pct} height={8} style={{ marginVertical: 10 }} />
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {/* Members Avatars & Info */}
                  <View style={styles.membersRow}>
                    <View style={styles.memberChips}>
                      {circle.members.slice(0, 4).map((member) => (
                        <View
                          key={member.id}
                          style={[
                            styles.memberAvatar,
                            {
                              backgroundColor:
                                member.status === 'paid' ? colors.successBg : colors.surfaceSecondary,
                              borderColor: colors.card,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.avatarText,
                              {
                                color: member.status === 'paid' ? colors.success : colors.textSecondary,
                              },
                            ]}
                          >
                            {member.name.charAt(0)}
                          </Text>
                          {member.status === 'paid' && (
                            <View
                              style={[styles.checkCircle, { backgroundColor: colors.success }]}
                            >
                              <Check size={8} color="#FFF" />
                            </View>
                          )}
                        </View>
                      ))}
                    </View>

                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {paidMembers}/{circle.members.length} paid · Due {circle.dueDay}th
                    </Text>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
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
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
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
  circleCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
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
  circleName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  circleCat: {
    fontSize: 12,
    marginTop: 2,
  },
  amountSection: {
    marginTop: 14,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  collected: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  target: {
    fontSize: 13,
    marginLeft: 4,
    flex: 1,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberChips: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginLeft: -6,
    position: 'relative',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
