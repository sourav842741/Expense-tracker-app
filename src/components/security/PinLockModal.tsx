import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Delete, Shield, Lock } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';

interface PinLockModalProps {
  visible: boolean;
  onSuccess?: () => void;
  mode?: 'unlock' | 'setup';
  onPinSet?: (pin: string) => void;
  onCancel?: () => void;
}

export function PinLockModal({
  visible,
  onSuccess,
  mode = 'unlock',
  onPinSet,
  onCancel,
}: PinLockModalProps) {
  const { colors, typography, spacing, isDark } = useTheme();
  const unlock = useAppStore((state) => state.unlock);
  const pinCode = useAppStore((state) => state.pinCode);

  const [enteredPin, setEnteredPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setEnteredPin('');
      setConfirmPin('');
      setIsConfirming(false);
      setErrorMsg('');
    }
  }, [visible]);

  const triggerShake = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(100);
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        // Complete 4 digits entered
        setTimeout(() => {
          if (mode === 'unlock') {
            const success = unlock(nextPin);
            if (success) {
              setEnteredPin('');
              onSuccess?.();
            } else {
              triggerShake();
              setErrorMsg('Incorrect PIN. Try again.');
              setEnteredPin('');
            }
          } else if (mode === 'setup') {
            if (!isConfirming) {
              setConfirmPin(nextPin);
              setEnteredPin('');
              setIsConfirming(true);
            } else {
              if (nextPin === confirmPin) {
                onPinSet?.(nextPin);
                setEnteredPin('');
                setConfirmPin('');
                setIsConfirming(false);
              } else {
                triggerShake();
                setErrorMsg('PINs do not match. Start again.');
                setEnteredPin('');
                setConfirmPin('');
                setIsConfirming(false);
              }
            }
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
      setErrorMsg('');
    }
  };

  if (!visible) return null;

  const keypadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Header Icon */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isDark ? colors.surfaceSecondary : '#EAECEF' },
            ]}
          >
            {mode === 'setup' ? (
              <Shield size={32} color={colors.accent} />
            ) : (
              <Lock size={32} color={colors.accent} />
            )}
          </View>

          {/* Title & Instructions */}
          <Text style={[styles.title, { color: colors.textPrimary, ...typography.screenHeading }]}>
            {mode === 'setup'
              ? isConfirming
                ? 'Confirm your 4-Digit PIN'
                : 'Create your 4-Digit PIN'
              : 'MoneyCircle Locked'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === 'setup'
              ? isConfirming
                ? 'Re-enter your 4 digits to confirm'
                : 'Secure your financial commitments'
              : 'Enter your 4-digit security PIN'}
          </Text>

          {/* 4 Dot Indicators with Shake Animation */}
          <Animated.View
            style={[
              styles.dotsContainer,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < enteredPin.length;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      borderColor: colors.accent,
                      backgroundColor: isFilled ? colors.accent : 'transparent',
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          {/* Error Message */}
          {errorMsg ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
          ) : (
            <View style={{ height: 20 }} />
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {keypadNumbers.map((key, idx) => {
              if (key === '') {
                return <View key={idx} style={styles.keyButtonEmpty} />;
              }

              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.keyButton}
                    onPress={handleDelete}
                    activeOpacity={0.6}
                  >
                    <Delete size={26} color={colors.textPrimary} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.keyButton,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceSecondary
                        : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: colors.textPrimary }]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cancel button in setup mode */}
          {mode === 'setup' && onCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 16,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    height: 20,
    marginBottom: 8,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 270,
    justifyContent: 'space-between',
    rowGap: 18,
    marginTop: 16,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyButtonEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 32,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
