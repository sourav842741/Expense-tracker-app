import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Sparkles, KeyRound, Delete } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabaseService } from '@/services/supabaseService';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, typography, isDark } = useTheme();

  const login = useAppStore((state) => state.login);
  const setUserPlansAndCircles = useAppStore((state) => state.setUserPlansAndCircles);
  const continueAsGuest = useAppStore((state) => state.continueAsGuest);
  const loadDemoData = useAppStore((state) => state.loadDemoData);
  const pinCode = useAppStore((state) => state.pinCode);
  const user = useAppStore((state) => state.user);

  // Tab mode: 'pin' or 'email'
  const [loginMode, setLoginMode] = useState<'pin' | 'email'>('pin');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // PIN state
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(200);
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePinPress = async (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError('');

      // When 4 digits are completed, authenticate strictly for that user
      if (nextPin.length === 4) {
        setLoading(true);
        try {
          // 1. Direct database check for account with this PIN
          const dbResult = await supabaseService.loginWithPin(nextPin);
          if (dbResult.success && dbResult.profile) {
            const prof = dbResult.profile;
            // Load strictly this user's data from cloud
            const [plans, circles, goals] = await Promise.all([
              supabaseService.getUserPaymentPlans(prof.id),
              supabaseService.getUserCircles(prof.id),
              supabaseService.getUserGoals(prof.id),
            ]);

            login(
              prof.email,
              prof.name,
              prof.id,
              prof.pin_code,
              prof.monthly_income,
              prof.available_balance,
              prof.avatar_url
            );
            setUserPlansAndCircles(plans || [], circles || [], goals || []);

            router.replace('/(tabs)');
            return;
          }

          // 2. Check local userVaults on device
          const vaults = useAppStore.getState().userVaults;
          const matchingVault = Object.values(vaults || {}).find(
            (v) => v.pinCode === nextPin
          );
          if (matchingVault) {
            login(
              matchingVault.user.email,
              matchingVault.user.name,
              matchingVault.user.id,
              matchingVault.pinCode || undefined,
              matchingVault.user.monthlyIncome,
              matchingVault.user.availableBalance,
              matchingVault.user.avatarUrl
            );
            setUserPlansAndCircles(
              matchingVault.paymentPlans || [],
              matchingVault.circles || [],
              matchingVault.goals || []
            );
            router.replace('/(tabs)');
            return;
          }

          // 3. Fallback PIN check
          if (nextPin === (pinCode || '1234')) {
            login(user.email, user.name, user.id, pinCode || '1234');
            router.replace('/(tabs)');
            return;
          }

          // Incorrect PIN
          triggerShake();
          setPinError(dbResult.message || 'Incorrect PIN. No registered user found.');
          setTimeout(() => {
            setEnteredPin('');
          }, 500);
        } catch (err) {
          triggerShake();
          setPinError('Verification error. Please try again.');
          setEnteredPin('');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handlePinDelete = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
      setPinError('');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Please enter your email and password.');
      } else {
        Alert.alert('Required Fields', 'Please enter your email and password.');
      }
      return;
    }

    setLoading(true);
    try {
      // 1. Direct database validation against Supabase profiles
      const dbResult = await supabaseService.validateAndLogin(email.trim(), password);

      if (!dbResult.success) {
        if (Platform.OS === 'web') {
          window.alert(dbResult.message || 'Login failed.');
        } else {
          Alert.alert('Login Notice', dbResult.message || 'Login failed.');
        }
        setLoading(false);
        return;
      }

      const prof = dbResult.profile;

      // 2. Fetch THAT specific user's plans, circles, goals (Strict Data Isolation)
      const [plans, circles, goals] = await Promise.all([
        supabaseService.getUserPaymentPlans(prof.id),
        supabaseService.getUserCircles(prof.id),
        supabaseService.getUserGoals(prof.id),
      ]);

      // 3. Set authenticated user and their isolated data
      login(
        prof.email,
        prof.name,
        prof.id,
        prof.pin_code,
        prof.monthly_income,
        prof.available_balance,
        prof.avatar_url
      );
      setUserPlansAndCircles(plans || [], circles || [], goals || []);

      router.replace('/(tabs)');
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert('Connection error. Please try again.');
      } else {
        Alert.alert('Error', 'Connection error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loadDemoData();
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoBadge, { backgroundColor: colors.surfaceSecondary }]}>
              <Sparkles size={28} color={colors.accent} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>MoneyCircle</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your intelligent financial commitments & savings tracker
            </Text>
          </View>

          {/* Mode Switcher */}
          <View style={[styles.switcherContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <TouchableOpacity
              style={[
                styles.switchBtn,
                loginMode === 'pin' && [styles.switchBtnActive, { backgroundColor: colors.card }],
              ]}
              onPress={() => {
                setLoginMode('pin');
                setEnteredPin('');
                setPinError('');
              }}
            >
              <KeyRound size={16} color={loginMode === 'pin' ? colors.textPrimary : colors.textMuted} />
              <Text
                style={[
                  styles.switchText,
                  { color: loginMode === 'pin' ? colors.textPrimary : colors.textMuted },
                ]}
              >
                4-Digit PIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.switchBtn,
                loginMode === 'email' && [styles.switchBtnActive, { backgroundColor: colors.card }],
              ]}
              onPress={() => setLoginMode('email')}
            >
              <Mail size={16} color={loginMode === 'email' ? colors.textPrimary : colors.textMuted} />
              <Text
                style={[
                  styles.switchText,
                  { color: loginMode === 'email' ? colors.textPrimary : colors.textMuted },
                ]}
              >
                Email & Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* PIN Pad Form */}
          {loginMode === 'pin' ? (
            <Animated.View style={[styles.pinSection, { transform: [{ translateX: shakeAnim }] }]}>
              <Text style={[styles.pinInstruction, { color: colors.textSecondary }]}>
                Enter your 4-digit security PIN to access your vault
              </Text>

              {/* PIN Dots */}
              <View style={styles.pinDotsRow}>
                {[0, 1, 2, 3].map((idx) => {
                  const filled = idx < enteredPin.length;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.pinDot,
                        {
                          borderColor: pinError ? colors.danger : colors.border,
                          backgroundColor: filled
                            ? pinError
                              ? colors.danger
                              : colors.accent
                            : colors.surfaceSecondary,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {pinError ? (
                <Text style={[styles.pinErrorText, { color: colors.danger }]}>{pinError}</Text>
              ) : null}

              {/* Number Pad Grid */}
              <View style={styles.keypad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => {
                  if (key === '') {
                    return <View key={i} style={styles.keyEmpty} />;
                  }
                  if (key === 'del') {
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.keyBtn, { backgroundColor: colors.surfaceSecondary }]}
                        onPress={handlePinDelete}
                        accessibilityLabel="Delete digit"
                      >
                        <Delete size={22} color={colors.textPrimary} />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.keyBtn, { backgroundColor: colors.surfaceSecondary }]}
                      onPress={() => handlePinPress(key)}
                      accessibilityLabel={`Digit ${key}`}
                    >
                      <Text style={[styles.keyText, { color: colors.textPrimary }]}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          ) : (
            /* Email & Password Form */
            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ position: 'relative' }}>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              <Button
                title={loading ? 'Signing In...' : 'Sign In'}
                onPress={handleLogin}
                variant="primary"
                size="lg"
                loading={loading}
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={[styles.signupLink, { color: colors.accent }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Login Option */}
          <TouchableOpacity
            style={[styles.demoBtn, { borderColor: colors.border }]}
            onPress={handleDemoLogin}
          >
            <Text style={[styles.demoText, { color: colors.textSecondary }]}>
              Explore as Guest / Demo Mode
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
    lineHeight: 18,
  },
  switcherContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    marginBottom: 24,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  switchBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pinSection: {
    alignItems: 'center',
  },
  pinInstruction: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  pinErrorText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 260,
    justifyContent: 'space-between',
    gap: 14,
  },
  keyBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: 70,
    height: 70,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
  },
  form: {
    gap: 14,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 38,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
  },
  signupLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  demoText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
