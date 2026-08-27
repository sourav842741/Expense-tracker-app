import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { CreditCard, Users, Target, ArrowDownLeft, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';

interface AddActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectAction: (action: 'payment' | 'circle' | 'goal' | 'expense') => void;
}

export const AddActionSheet: React.FC<AddActionSheetProps> = ({
  visible,
  onClose,
  onSelectAction,
}) => {
  const { colors, radius, spacing } = useTheme();

  const options = [
    {
      id: 'payment' as const,
      title: 'Payment / EMI Plan',
      description: 'Track recurring loan, rent, or bill commitments',
      icon: <CreditCard size={20} color={colors.accent} />,
    },
    {
      id: 'circle' as const,
      title: 'Money Circle',
      description: 'Shared group pool with friends or family',
      icon: <Users size={20} color={colors.accent} />,
    },
    {
      id: 'goal' as const,
      title: 'Savings Goal',
      description: 'Save toward emergency fund, gadget, or trip',
      icon: <Target size={20} color={colors.accent} />,
    },
    {
      id: 'expense' as const,
      title: 'Record Expense / Income',
      description: 'Log monthly cash flow to recalculate safe-to-spend',
      icon: <ArrowDownLeft size={20} color={colors.accent} />,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.card,
                  borderTopLeftRadius: radius.sheet,
                  borderTopRightRadius: radius.sheet,
                  padding: spacing.large,
                  borderColor: colors.border,
                  borderTopWidth: 1,
                },
              ]}
            >
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    What do you want to add?
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Choose an action to record
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <X size={18} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.list}>
                {options.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      onSelectAction(item.id);
                    }}
                    style={[
                      styles.item,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderRadius: radius.card,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        {
                          backgroundColor: colors.card,
                          borderRadius: radius.smallCard,
                        },
                      ]}
                    >
                      {item.icon}
                    </View>
                    <View style={styles.textWrap}>
                      <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  itemDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
