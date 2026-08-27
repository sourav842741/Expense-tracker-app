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
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CircleMember } from '@/types/circle';

export default function CreateCircleScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const addCircle = useAppStore((state) => state.addCircle);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState('Family');
  const [dueDay, setDueDay] = useState('15');
  const [members, setMembers] = useState<{ id: string; name: string; amount: string }[]>([
    { id: '1', name: 'Sourav', amount: '5000' },
    { id: '2', name: 'Rahul', amount: '5000' },
  ]);
  const [error, setError] = useState('');

  const categories = ['Family', 'Roommates', 'Friends', 'Travel', 'Society'];

  const addMemberRow = () => {
    setMembers((prev) => [
      ...prev,
      { id: String(Date.now()), name: '', amount: '5000' },
    ]);
  };

  const removeMemberRow = (id: string) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, field: 'name' | 'amount', val: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Please enter a circle name');
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Please enter a valid target amount');
      return;
    }

    const day = parseInt(dueDay, 10) || 15;
    const now = new Date();
    const dueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const formattedMembers: CircleMember[] = members.map((m, idx) => ({
      id: `m_${Date.now()}_${idx}`,
      name: m.name.trim() || `Member ${idx + 1}`,
      expectedAmount: parseFloat(m.amount) || 0,
      paidAmount: 0,
      status: 'pending',
      history: [],
    }));

    addCircle({
      name: name.trim(),
      description: description.trim(),
      targetAmount: target,
      collectedAmount: 0,
      frequency: 'monthly',
      dueDay: day,
      dueDate,
      category,
      members: formattedMembers,
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
        <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Create Circle</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.standard }]}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Circle Name"
          placeholder="e.g. Family Monthly Pool, Flat Rent"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError('');
          }}
          error={error}
        />

        <Input
          label="Target Amount (Total Pool)"
          placeholder="20000"
          keyboardType="numeric"
          prefix="₹"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />

        <Input
          label="Description (optional)"
          placeholder="e.g. Joint fund for monthly groceries & cook"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
        <View style={styles.chipsRow}>
          {categories.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
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
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Due Day of Month"
          placeholder="15"
          keyboardType="numeric"
          value={dueDay}
          onChangeText={setDueDay}
        />

        {/* Member Allocation */}
        <View style={styles.memberSectionHeader}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
            Initial Members & Share
          </Text>
          <TouchableOpacity onPress={addMemberRow} style={styles.addMemberRowBtn}>
            <Plus size={14} color={colors.accent} />
            <Text style={[styles.addMemberText, { color: colors.accent }]}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {members.map((m, idx) => (
          <View key={m.id} style={styles.memberInputRow}>
            <View style={{ flex: 1.5 }}>
              <Input
                placeholder={`Member ${idx + 1} Name`}
                value={m.name}
                onChangeText={(val) => updateMember(m.id, 'name', val)}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <View style={{ width: 8 }} />
            <View style={{ flex: 1 }}>
              <Input
                placeholder="₹ Amount"
                keyboardType="numeric"
                prefix="₹"
                value={m.amount}
                onChangeText={(val) => updateMember(m.id, 'amount', val)}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            {members.length > 1 && (
              <TouchableOpacity
                onPress={() => removeMemberRow(m.id)}
                style={styles.removeBtn}
              >
                <Trash2 size={16} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <Button
          title="Create Money Circle"
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
  memberSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 10,
  },
  addMemberRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMemberText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  memberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeBtn: {
    padding: 8,
    marginLeft: 4,
  },
  submitBtn: {
    marginTop: 20,
  },
});
