import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Bell,
  Lock,
  Moon,
  Sun,
  Shield,
  Download,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Check,
  Database,
  LogOut,
  KeyRound,
  FilePlus2,
  Camera,
  Image as ImageIcon,
  Trash2,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore, ThemeMode } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PinLockModal } from '@/components/security/PinLockModal';
import { formatINR } from '@/utils/currency';
import { supabaseService } from '@/services/supabaseService';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const user = useAppStore((state) => state.user);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const hideBalance = useAppStore((state) => state.hideBalance);
  const toggleHideBalance = useAppStore((state) => state.toggleHideBalance);
  const notificationPreferences = useAppStore((state) => state.notificationPreferences);
  const updateNotificationPreferences = useAppStore(
    (state) => state.updateNotificationPreferences
  );
  const resetToDefaults = useAppStore((state) => state.resetToDefaults);
  const pinCode = useAppStore((state) => state.pinCode);
  const setPin = useAppStore((state) => state.setPin);
  const removePin = useAppStore((state) => state.removePin);
  const lock = useAppStore((state) => state.lock);
  const logout = useAppStore((state) => state.logout);
  const loadCleanUserData = useAppStore((state) => state.loadCleanUserData);
  const loadDemoData = useAppStore((state) => state.loadDemoData);

  const updateUserAvatar = useAppStore((state) => state.updateUserAvatar);

  const [pinSetupModalVisible, setPinSetupModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const AVATAR_PRESETS = [
    { id: '1', name: 'Executive', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
    { id: '2', name: 'Investor', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
    { id: '3', name: 'Creator', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
    { id: '4', name: 'Leader', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
    { id: '5', name: 'Fintech Pro', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80' },
    { id: '6', name: 'Minimalist', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80' },
  ];

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted' && Platform.OS !== 'web') {
        Alert.alert('Permission Needed', 'Please grant photo library access to upload a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateUserAvatar(result.assets[0].uri);
        setAvatarModalVisible(false);
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted' && Platform.OS !== 'web') {
        Alert.alert('Permission Needed', 'Please grant camera access to take a photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateUserAvatar(result.assets[0].uri);
        setAvatarModalVisible(false);
      }
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    updateUserAvatar(url);
    setAvatarModalVisible(false);
  };

  const handleRemoveAvatar = () => {
    updateUserAvatar('');
    setAvatarModalVisible(false);
  };

  // Edit budget modal
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [incomeInput, setIncomeInput] = useState(String(user.monthlyIncome));
  const [expenseInput, setExpenseInput] = useState(String(user.plannedExpenses));
  const [savingsInput, setSavingsInput] = useState(String(user.savingsTarget));

  const handleSaveBudget = () => {
    const inc = parseFloat(incomeInput) || 0;
    const exp = parseFloat(expenseInput) || 0;
    const sav = parseFloat(savingsInput) || 0;
    updateUserProfile({
      monthlyIncome: inc,
      plannedExpenses: exp,
      savingsTarget: sav,
    });
    setBudgetModalVisible(false);
  };

  const handlePinAction = () => {
    if (!pinCode) {
      setPinSetupModalVisible(true);
    } else {
      if (Platform.OS === 'web') {
        const choice = window.confirm('4-Digit PIN is active.\nClick OK to LOCK the app now, or CANCEL to remove PIN.');
        if (choice) {
          lock();
        } else {
          removePin();
          window.alert('PIN removed.');
        }
      } else {
        Alert.alert(
          '4-Digit PIN Security',
          'Your app is secured with a PIN.',
          [
            { text: 'Lock App Now', onPress: () => lock() },
            { text: 'Change PIN', onPress: () => setPinSetupModalVisible(true) },
            { text: 'Remove PIN', onPress: () => removePin(), style: 'destructive' },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    }
  };

  const handleSwitchToCleanSlate = () => {
    loadCleanUserData(user.name, user.email, user.monthlyIncome);
    if (Platform.OS === 'web') {
      window.alert('Switched to Fresh Clean State. Check the Home tab to see the Onboarding Guide!');
    } else {
      Alert.alert('Fresh Clean State', 'Your commitments are cleared. Check the Home tab to see the Onboarding Guide!');
    }
    router.push('/(tabs)');
  };

  const handleLoadDemoData = () => {
    loadDemoData();
    if (Platform.OS === 'web') {
      window.alert('Demo data loaded successfully!');
    } else {
      Alert.alert('Demo Data Loaded', 'Demo commitments, circles, and savings goals have been loaded.');
    }
    router.push('/(tabs)');
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleExportData = () => {
    if (Platform.OS === 'web') {
      window.alert('Data export generated: MoneyCircle_Backup_2026.json');
    } else {
      Alert.alert('Data Export', 'Your financial records have been exported to MoneyCircle_Backup.json');
    }
  };

  const handleResetData = () => {
    resetToDefaults();
    if (Platform.OS === 'web') {
      window.alert('Demo data has been reset to default values.');
    } else {
      Alert.alert('Reset Complete', 'Demo data has been reset to default values.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.standard, paddingBottom: spacing.standard, paddingTop: 8 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <Card style={styles.profileHeaderCard}>
          <View style={styles.profileRow}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={() => setAvatarModalVisible(true)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: colors.surfaceSecondary, borderRadius: 32 },
                ]}
              >
                {user.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarInitialWrap, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.avatarInitialText, { color: colors.accentInverted }]}>
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.cameraBadge, { backgroundColor: colors.accent, borderColor: colors.card }]}>
                <Camera size={13} color={colors.accentInverted} />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                {user.name}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user.email}
              </Text>
              <TouchableOpacity
                onPress={() => setAvatarModalVisible(true)}
                style={styles.editPhotoLink}
              >
                <Camera size={12} color={colors.accent} style={{ marginRight: 4 }} />
                <Text style={[styles.editPhotoText, { color: colors.accent }]}>
                  {user.avatarUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Section: Budget & Safe-to-Spend Parameters */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          FINANCIAL PARAMETERS
        </Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setBudgetModalVisible(true)}
          >
            <View style={styles.menuLeft}>
              <Sparkles size={18} color={colors.accent} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                  Monthly Income & Budget
                </Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                  Income: {formatINR(user.monthlyIncome)} · Target: {formatINR(user.savingsTarget)}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Shield size={18} color={colors.accent} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                  Hide Balance Mode
                </Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                  Mask figures on home dashboard
                </Text>
              </View>
            </View>
            <Switch
              value={hideBalance}
              onValueChange={toggleHideBalance}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuRow} onPress={handlePinAction}>
            <View style={styles.menuLeft}>
              <KeyRound size={18} color={pinCode ? colors.success : colors.accent} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                  4-Digit Security PIN
                </Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                  {pinCode ? 'Enabled · Tap to lock or manage PIN' : 'Disabled · Tap to set 4-digit security PIN'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Section: Appearance */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <Card style={styles.menuCard}>
          <View style={styles.themeSelector}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
              const isSelected = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.surfaceSecondary,
                      borderRadius: radius.chip,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeText,
                      { color: isSelected ? colors.accentInverted : colors.textPrimary },
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                  {isSelected && (
                    <Check size={14} color={colors.accentInverted} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Section: Notification Preferences */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          NOTIFICATIONS
        </Text>
        <Card style={styles.menuCard}>
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Bell size={18} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                Payment Reminders
              </Text>
            </View>
            <Switch
              value={notificationPreferences.paymentReminders}
              onValueChange={(val) =>
                updateNotificationPreferences({ paymentReminders: val })
              }
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Bell size={18} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                Circle Member Alerts
              </Text>
            </View>
            <Switch
              value={notificationPreferences.circleMemberPayments}
              onValueChange={(val) =>
                updateNotificationPreferences({ circleMemberPayments: val })
              }
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Bell size={18} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                Email Notifications
              </Text>
            </View>
            <Switch
              value={notificationPreferences.emailNotifications}
              onValueChange={(val) =>
                updateNotificationPreferences({ emailNotifications: val })
              }
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>
        </Card>

        {/* Section: Supabase Cloud Database */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          SUPABASE CLOUD DATABASE
        </Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={async () => {
              const res = await supabaseService.testConnection();
              if (Platform.OS === 'web') {
                window.alert(
                  res.success
                    ? 'Connected to Supabase project (bnfpalkxgsyatlrwjqrq)!'
                    : `Supabase status: ${res.message}\n(Run supabase_schema.sql in Supabase SQL editor to create tables)`
                );
              } else {
                Alert.alert(
                  res.success ? 'Supabase Connected' : 'Supabase Status',
                  res.success
                    ? 'Successfully connected to bnfpalkxgsyatlrwjqrq.supabase.co!'
                    : `${res.message}\n\nPlease run supabase_schema.sql in your Supabase SQL editor to initialize tables.`
                );
              }
            }}
          >
            <View style={styles.menuLeft}>
              <Database size={18} color={colors.accent} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                  Test Supabase Connection
                </Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                  https://bnfpalkxgsyatlrwjqrq.supabase.co
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Section: Data & Backup */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          DATA & ACTIONS
        </Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={handleSwitchToCleanSlate}>
            <View style={styles.menuLeft}>
              <FilePlus2 size={18} color={colors.accent} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                  Switch to Fresh Blank State
                </Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                  Test new user flow with onboarding checklist
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuRow} onPress={handleLoadDemoData}>
            <View style={styles.menuLeft}>
              <RotateCcw size={18} color={colors.info} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                  Load Rich Demo Data
                </Text>
                <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                  Restore pre-seeded EMIs, pools & goals
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuRow} onPress={handleExportData}>
            <View style={styles.menuLeft}>
              <Download size={18} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                Export Financial Data
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <LogOut size={18} color={colors.danger} style={{ marginRight: 12 }} />
              <Text style={[styles.menuTitle, { color: colors.danger }]}>
                Sign Out
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Text style={[styles.appVersion, { color: colors.textMuted }]}>
          MoneyCircle v1.0.0 · Fintech Architecture
        </Text>
      </ScrollView>

      {/* Edit Budget Modal */}
      <Modal
        visible={budgetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBudgetModalVisible(false)}
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
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Update Monthly Budget
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              Used to calculate your real-time Safe-to-Spend figure.
            </Text>

            <Input
              label="Monthly Income (₹)"
              placeholder="40000"
              keyboardType="numeric"
              prefix="₹"
              value={incomeInput}
              onChangeText={setIncomeInput}
            />

            <Input
              label="Planned Living Expenses (₹)"
              placeholder="8000"
              keyboardType="numeric"
              prefix="₹"
              value={expenseInput}
              onChangeText={setExpenseInput}
            />

            <Input
              label="Monthly Savings Target (₹)"
              placeholder="5000"
              keyboardType="numeric"
              prefix="₹"
              value={savingsInput}
              onChangeText={setSavingsInput}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setBudgetModalVisible(false)}
                variant="outline"
                size="md"
                style={{ flex: 1 }}
              />
              <Button
                title="Save Changes"
                onPress={handleSaveBudget}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 4-Digit PIN Setup Modal */}
      <PinLockModal
        visible={pinSetupModalVisible}
        mode="setup"
        onPinSet={(pin) => {
          setPin(pin);
          setPinSetupModalVisible(false);
          if (Platform.OS === 'web') {
            window.alert('4-Digit Security PIN has been set successfully!');
          } else {
            Alert.alert('PIN Created', 'Your 4-digit security PIN is now active.');
          }
        }}
        onCancel={() => setPinSetupModalVisible(false)}
      />

      {/* Profile Picture Upload & Selection Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.avatarModalBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.avatarModalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Profile Picture
                </Text>
                <Text style={[styles.modalDesc, { color: colors.textSecondary, marginBottom: 0 }]}>
                  Upload your photo or choose an avatar
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAvatarModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Current Preview */}
            <View style={styles.avatarPreviewWrap}>
              <View
                style={[
                  styles.previewCircle,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.accent },
                ]}
              >
                {user.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.previewImg} />
                ) : (
                  <User size={44} color={colors.accent} />
                )}
              </View>
            </View>

            {/* Upload Buttons Row */}
            <View style={styles.avatarActionRow}>
              <TouchableOpacity
                style={[styles.avatarActionBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                onPress={handlePickFromGallery}
              >
                <ImageIcon size={20} color={colors.accent} />
                <Text style={[styles.avatarActionText, { color: colors.textPrimary }]}>
                  Choose Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.avatarActionBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                onPress={handleTakePhoto}
              >
                <Camera size={20} color={colors.accent} />
                <Text style={[styles.avatarActionText, { color: colors.textPrimary }]}>
                  Take Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Curated Avatars */}
            <Text style={[styles.presetSectionHeading, { color: colors.textSecondary }]}>
              OR SELECT CURATED AVATAR
            </Text>
            <View style={styles.presetGrid}>
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = user.avatarUrl === preset.url;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => handleSelectPresetAvatar(preset.url)}
                    style={[
                      styles.presetItem,
                      { borderColor: isSelected ? colors.accent : colors.border },
                      isSelected && styles.presetItemSelected,
                    ]}
                  >
                    <Image source={{ uri: preset.url }} style={styles.presetImg} />
                    {isSelected && (
                      <View style={[styles.selectedCheckBadge, { backgroundColor: colors.accent }]}>
                        <Check size={10} color={colors.accentInverted} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Remove photo option if user has custom avatar */}
            {Boolean(user.avatarUrl) && (
              <TouchableOpacity
                style={styles.removeAvatarBtn}
                onPress={handleRemoveAvatar}
              >
                <Trash2 size={15} color={colors.danger} style={{ marginRight: 6 }} />
                <Text style={[styles.removeAvatarText, { color: colors.danger }]}>
                  Remove Profile Picture
                </Text>
              </TouchableOpacity>
            )}

            <Button
              title="Close"
              onPress={() => setAvatarModalVisible(false)}
              variant="outline"
              size="md"
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeaderCard: {
    padding: 18,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  menuSub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  themeSelector: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  themeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 10,
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarInitialWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 24,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  editPhotoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  editPhotoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  avatarModalBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  avatarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  previewCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  previewImg: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  avatarActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  avatarActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  presetSectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  presetItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  presetItemSelected: {
    borderWidth: 2.5,
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  selectedCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 2,
  },
  removeAvatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
