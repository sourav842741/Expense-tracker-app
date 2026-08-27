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
import {
  ArrowLeft,
  Search as SearchIcon,
  X,
  CreditCard,
  Users,
  Target,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatINR } from '@/utils/currency';
import { formatDateShort } from '@/utils/dates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar } from 'react-native';

export default function SearchScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, RNStatusBar.currentHeight || 0, Platform.OS === 'android' ? 36 : 10);

  const paymentPlans = useAppStore((state) => state.paymentPlans);
  const circles = useAppStore((state) => state.circles);
  const goals = useAppStore((state) => state.goals);

  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterChips = ['All', 'EMI', 'Housing', 'Insurance', 'Circles', 'Goals'];

  const normalizedQuery = query.toLowerCase().trim();

  // Search Payments
  const matchedPayments = paymentPlans.filter((p) => {
    if (selectedFilter === 'Circles' || selectedFilter === 'Goals') return false;
    if (selectedFilter === 'EMI' && p.category !== 'emi') return false;
    if (selectedFilter === 'Housing' && p.category !== 'housing') return false;
    if (selectedFilter === 'Insurance' && p.category !== 'insurance') return false;

    if (!normalizedQuery) return true;
    return (
      p.title.toLowerCase().includes(normalizedQuery) ||
      p.category.toLowerCase().includes(normalizedQuery) ||
      p.paymentMethod.toLowerCase().includes(normalizedQuery)
    );
  });

  // Search Circles
  const matchedCircles = circles.filter((c) => {
    if (
      selectedFilter !== 'All' &&
      selectedFilter !== 'Circles'
    )
      return false;

    if (!normalizedQuery) return true;
    return (
      c.name.toLowerCase().includes(normalizedQuery) ||
      c.category.toLowerCase().includes(normalizedQuery)
    );
  });

  // Search Goals
  const matchedGoals = goals.filter((g) => {
    if (
      selectedFilter !== 'All' &&
      selectedFilter !== 'Goals'
    )
      return false;

    if (!normalizedQuery) return true;
    return (
      g.title.toLowerCase().includes(normalizedQuery) ||
      g.category.toLowerCase().includes(normalizedQuery)
    );
  });

  const totalResults =
    matchedPayments.length + matchedCircles.length + matchedGoals.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingHorizontal: spacing.standard, paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Search</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={[styles.searchBarWrap, { paddingHorizontal: spacing.standard }]}>
        <Input
          placeholder="Search payments, circles, goals..."
          value={query}
          onChangeText={setQuery}
          leftIcon={<SearchIcon size={18} color={colors.textSecondary} />}
          rightIcon={
            query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : undefined
          }
          containerStyle={{ marginBottom: 10 }}
        />

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
        >
          {filterChips.map((chip) => {
            const isSelected = selectedFilter === chip;
            return (
              <TouchableOpacity
                key={chip}
                onPress={() => setSelectedFilter(chip)}
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
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        {totalResults === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No matching records
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Try searching with a different keyword or select "All".
            </Text>
          </View>
        ) : (
          <>
            {/* Payments Results */}
            {matchedPayments.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                  PAYMENTS ({matchedPayments.length})
                </Text>
                {matchedPayments.map((p) => (
                  <Card
                    key={p.id}
                    onPress={() => router.push(`/payments/${p.id}`)}
                    style={styles.resultCard}
                  >
                    <View style={styles.cardRow}>
                      <View style={styles.rowLeft}>
                        <View
                          style={[
                            styles.iconBox,
                            { backgroundColor: colors.surfaceSecondary },
                          ]}
                        >
                          <CreditCard size={18} color={colors.accent} />
                        </View>
                        <View>
                          <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                            {p.title}
                          </Text>
                          <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                            Due {formatDateShort(p.cycles[0]?.dueDate || p.startDate)} ·{' '}
                            {p.category.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>
                        {formatINR(p.amount)}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* Circles Results */}
            {matchedCircles.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                  MONEY CIRCLES ({matchedCircles.length})
                </Text>
                {matchedCircles.map((c) => (
                  <Card
                    key={c.id}
                    onPress={() => router.push(`/circles/${c.id}`)}
                    style={styles.resultCard}
                  >
                    <View style={styles.cardRow}>
                      <View style={styles.rowLeft}>
                        <View
                          style={[
                            styles.iconBox,
                            { backgroundColor: colors.surfaceSecondary },
                          ]}
                        >
                          <Users size={18} color={colors.accent} />
                        </View>
                        <View>
                          <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                            {c.name}
                          </Text>
                          <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                            {c.members.length} members · Target {formatINR(c.targetAmount)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>
                        {formatINR(c.collectedAmount)}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* Goals Results */}
            {matchedGoals.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                  SAVINGS GOALS ({matchedGoals.length})
                </Text>
                {matchedGoals.map((g) => (
                  <Card
                    key={g.id}
                    onPress={() => router.push(`/goals/${g.id}`)}
                    style={styles.resultCard}
                  >
                    <View style={styles.cardRow}>
                      <View style={styles.rowLeft}>
                        <View
                          style={[
                            styles.iconBox,
                            { backgroundColor: colors.surfaceSecondary },
                          ]}
                        >
                          <Target size={18} color={colors.accent} />
                        </View>
                        <View>
                          <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                            {g.title}
                          </Text>
                          <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                            Target: {formatDateShort(g.targetDate)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.itemAmount, { color: colors.textPrimary }]}>
                        {formatINR(g.currentAmount)}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </>
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
  searchBarWrap: {
    paddingBottom: 4,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionBlock: {
    marginBottom: 20,
    gap: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
    marginLeft: 4,
  },
  resultCard: {
    padding: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 13,
    marginTop: 4,
  },
});
