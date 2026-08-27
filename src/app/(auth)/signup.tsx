import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff, IndianRupee, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/services/supabaseService';

export default function SignupScreen() {
  const router = useRouter();
  const { colors, typography, isDark } = useTheme();

  const signup = useAppStore((state) => state.signup);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('1234');
  const [income, setIncome] = useState('45000');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      if (Platform.OS === 'web') {
        window.alert('Please fill in your name, email and password.');
      } else {
        Alert.alert('Required Fields', 'Please fill in your name, email and password.');
      }
      return;
    }

    setLoading(true);
    try {
      const monthlyIncome = parseFloat(income) || 40000;
      const cleanPin = pinCode.trim() || '1234';

      // 1. Direct validation and registration in Supabase database!
      const dbResult = await supabaseService.signupUser({
        name: name.trim(),
        email: email.trim(),
        password: password,
        pinCode: cleanPin,
        monthlyIncome,
      });

      if (!dbResult.success) {
        if (Platform.OS === 'web') {
          window.alert(dbResult.message || 'Signup failed');
        } else {
          Alert.alert('Signup Notice', dbResult.message || 'Signup failed');
        }
        setLoading(false);
        return;
      }

      // 2. Initialize fresh clean state in store
      signup({
        id: dbResult.profile?.id,
        name: name.trim(),
        email: email.trim(),
        pinCode: cleanPin,
        monthlyIncome,
        plannedExpenses: 0,
        savingsTarget: 0,
      });

      if (Platform.OS === 'web') {
        window.alert(`Welcome, ${name.trim()}! Your account is created with PIN: ${cleanPin}.`);
      } else {
        Alert.alert(`Welcome, ${name.trim()}!`, `Your account has been created with PIN: ${cleanPin}.`);
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      console.warn('Signup error:', err);
      if (Platform.OS === 'web') {
        window.alert(err.message || 'Signup error');
      } else {
        Alert.alert('Error', err.message || 'Signup error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.shieldBadge, { backgroundColor: colors.accent + '20' }]}>
              <ShieldCheck size={20} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.shieldText, { color: colors.accent }]}>NEW ACCOUNT SETUP</Text>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Create Your Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Start with a clean financial dashboard & track commitments
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Input
              label="FULL NAME"
              placeholder="e.g. Sourav Kumar"
              value={name}
              onChangeText={setName}
              icon={<User size={18} color={colors.textSecondary} />}
            />

            <Input
              label="EMAIL ADDRESS"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={18} color={colors.textSecondary} />}
            />

            <Input
              label="PASSWORD (MIN 6 CHARACTERS)"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon={<Lock size={18} color={colors.textSecondary} />}
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              label="4-DIGIT SECURITY PIN (FOR QUICK UNLOCK)"
              placeholder="e.g. 1234"
              value={pinCode}
              onChangeText={(text) => setPinCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              maxLength={4}
              icon={<KeyRound size={18} color={colors.textSecondary} />}
              helperText="Set your 4-digit PIN to sign in automatically"
            />

            <Input
              label="ESTIMATED MONTHLY INCOME (₹)"
              placeholder="45000"
              value={income}
              onChangeText={setIncome}
              keyboardType="numeric"
              icon={<IndianRupee size={18} color={colors.textSecondary} />}
              helperText="Used to calculate your real-time Safe-to-Spend limit"
            />

            <Button
              title={loading ? 'Creating Account...' : 'Get Started'}
              variant="primary"
              onPress={handleSignup}
              loading={loading}
              style={{ marginTop: 10 }}
            />
          </View>

          {/* Footer Back to Login */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.loginLink, { color: colors.accent }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  shieldText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
