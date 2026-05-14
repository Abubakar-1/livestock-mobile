import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { AppText, Button, Input } from "../../src/components/ui";
import { Colors, Radius, Spacing } from "../../src/constants/theme";
import { useLogoutMutation } from "../../src/features/auth/authApi";
import { clearAuth } from "../../src/features/auth/authSlice";
import { useGetPurchasesQuery } from "../../src/features/marketplace/marketplaceApi";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../../src/features/users/usersApi";
import { profileSchema } from "../../src/schema/user.schema";
import { RootState } from "../../src/store/store";

const { width } = Dimensions.get("window");

const SettingItem = ({
  icon,
  title,
  subtitle,
  subtitleColor = Colors.textMuted,
  showChevron = false,
  showToggle = false,
  toggleValue = false,
  onToggle = () => {},
  onPress = () => {},
}: any) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!showChevron && !onPress}
  >
    <View style={styles.settingIconWrapper}>
      <Ionicons name={icon} size={20} color={Colors.emerald} />
    </View>
    <View style={styles.settingTextWrapper}>
      <AppText variant="body" style={{ fontWeight: "600" }}>
        {title}
      </AppText>
      <AppText variant="caption" color={subtitleColor}>
        {subtitle}
      </AppText>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    )}
    {showToggle && (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: "rgba(255,255,255,0.1)", true: Colors.emerald }}
        thumbColor={Colors.white}
      />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const profile = useSelector((state: RootState) => state.auth.user);
  const { data: purchasesResponse, refetch: refetchPurchases } =
    useGetPurchasesQuery();
  const { refetch: refetchProfile } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [logout] = useLogoutMutation();

  const [refreshing, setRefreshing] = useState(false);

  const purchases = purchasesResponse?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPurchases(), refetchProfile()]);
    setRefreshing(false);
  };

  const totalInvested = purchases
    .filter((p: any) => p.status === "CONFIRMED")
    .reduce((sum: number, p: any) => sum + (parseFloat(p.totalAmount) || 0), 0);

  const activeAssetsCount = purchases.filter(
    (p: any) => p.status === "CONFIRMED",
  ).length;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      bankName: profile?.bankName || "",
      accountNumber: profile?.accountNumber || "",
      accountName: profile?.accountName || "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        bankName: profile.bankName || "",
        accountNumber: profile.accountNumber || "",
        accountName: profile.accountName || "",
      });
    }
  }, [profile]);

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(clearAuth());
      router.replace("/(auth)/login");
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfile(data).unwrap();
      setIsEditModalVisible(false);
      Alert.alert("Success", "Payout details updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to update profile");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to make this work!",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      Alert.alert(
        "Photo Selected",
        "In a production environment, this photo would be uploaded to our secure servers.",
      );
    }
  };

  // Loading state for purchases is fine, but profile is now from store
  const isLoading = !profile;

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.emerald} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.emerald}
            colors={[Colors.emerald]}
          />
        }
      >
        {/* ── Top Header Section ────────────────────────────────────────── */}
        <LinearGradient
          colors={[Colors.emerald, "transparent"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <SafeAreaView edges={["top"]}>
            <View style={styles.topNav}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.white} />
              </TouchableOpacity>
              <AppText variant="h2" style={{ color: Colors.white }}>
                Profile
              </AppText>
              <TouchableOpacity style={styles.backButton}>
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={Colors.white}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <View style={styles.profileInfoMain}>
            <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <Image
                  source={require("../../assets/images/user-avatar.png")}
                  style={styles.avatar}
                />
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={12} color={Colors.white} />
              </View>
            </TouchableOpacity>

            <AppText variant="h1" align="center" style={styles.userName}>
              {profile?.firstName} {profile?.lastName}
            </AppText>
            <View style={styles.tierBadge}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={Colors.emerald}
              />
              <AppText variant="label" style={styles.tierText}>
                PREMIUM USER
              </AppText>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* ── Financial Stats ──────────────────────────────────────────── */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <AppText variant="caption" color={Colors.textMuted}>
                Portfolio Value
              </AppText>
              <AppText variant="h2">₦{totalInvested.toLocaleString()}</AppText>
            </View>
            <View style={styles.statCard}>
              <AppText variant="caption" color={Colors.textMuted}>
                Active Assets
              </AppText>
              <AppText variant="h2">{activeAssetsCount}</AppText>
            </View>
          </View>

          {/* ── Complete Profile Call to Action ───────────────────────────── */}
          {!profile?.bankName && (
            <TouchableOpacity
              style={styles.ctaCard}
              onPress={() => setIsEditModalVisible(true)}
            >
              <LinearGradient
                colors={["rgba(0, 255, 102, 0.15)", "rgba(0, 255, 102, 0.05)"]}
                style={styles.ctaGradient}
              >
                <View style={styles.ctaContent}>
                  <View style={styles.ctaIcon}>
                    <Ionicons
                      name="wallet-outline"
                      size={24}
                      color={Colors.emerald}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText style={{ fontWeight: "700", fontSize: 16 }}>
                      Complete Your Profile
                    </AppText>
                    <AppText variant="caption" color={Colors.textSecondary}>
                      Link your bank account to receive payouts
                    </AppText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.emerald}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ── Settings Sections ─────────────────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <AppText variant="label" style={styles.sectionLabel}>
              IDENTITY & PAYOUT
            </AppText>
          </View>

          <View style={styles.settingsGroup}>
            <SettingItem
              icon="id-card-outline"
              title="Identity Details"
              subtitle={`${profile?.email} • Verified`}
              subtitleColor={Colors.emerald}
              showChevron
              onPress={() => setIsEditModalVisible(true)}
            />
            <View style={styles.groupDivider} />
            <SettingItem
              icon="business-outline"
              title="Bank Account"
              subtitle={
                profile?.bankName
                  ? `${profile.bankName} (${profile.accountNumber})`
                  : "Add payout account"
              }
              showChevron
              onPress={() => setIsEditModalVisible(true)}
            />
          </View>

          <View style={styles.sectionHeader}>
            <AppText variant="label" style={styles.sectionLabel}>
              PREFERENCES
            </AppText>
          </View>

          <View style={styles.settingsGroup}>
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Email & Push alerts"
              showToggle
              toggleValue={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
            <View style={styles.groupDivider} />
            <SettingItem
              icon="moon-outline"
              title="Dark Appearance"
              subtitle="Sleek fintech look"
              showToggle
              toggleValue={darkModeEnabled}
              onToggle={setDarkModeEnabled}
            />
          </View>

          <View style={styles.sectionHeader}>
            <AppText variant="label" style={styles.sectionLabel}>
              SECURITY & SUPPORT
            </AppText>
          </View>

          <View style={styles.settingsGroup}>
            <SettingItem
              icon="shield-outline"
              title="Security Center"
              subtitle="Password & 2FA"
              showChevron
            />
            <View style={styles.groupDivider} />
            <SettingItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="FAQs & Live Chat"
              showChevron
            />
          </View>

          <TouchableOpacity style={styles.logoutRow} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            <AppText style={styles.logoutText}>Sign Out</AppText>
          </TouchableOpacity>

          <View style={styles.footerInfo}>
            <AppText variant="caption" color={Colors.textMuted}>
              Livestock App v1.0.4
            </AppText>
            <AppText variant="caption" color={Colors.textMuted}>
              © 2024 Livestock Fintech Inc.
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* ── Complete Profile Modal ────────────────────────────────────────── */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <AppText variant="h2">Account Details</AppText>
                <AppText variant="caption" color={Colors.textMuted}>
                  View your identity and manage payouts
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.closeModal}
              >
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ padding: Spacing.xl }}
            >
              <View style={styles.modalSection}>
                <AppText variant="label" style={styles.modalSub}>
                  IDENTITY (READ-ONLY)
                </AppText>
                <View style={styles.readOnlyContainer}>
                  <Input
                    label="Full Name"
                    value={`${profile?.firstName || ""} ${profile?.lastName || ""}`}
                    editable={false}
                    containerStyle={{ marginBottom: Spacing.sm }}
                  />
                  <Input
                    label="Phone Number"
                    value={profile?.phoneNumber || ""}
                    editable={false}
                    containerStyle={{ marginBottom: Spacing.sm }}
                  />
                </View>
                <AppText
                  variant="caption"
                  color={Colors.textMuted}
                  style={{ marginTop: 4 }}
                >
                  Contact support to change your verified identity details.
                </AppText>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalSection}>
                <AppText variant="label" style={styles.modalSub}>
                  PAYOUT BANK DETAILS
                </AppText>
                <Controller
                  control={control}
                  name="bankName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Bank Name"
                      value={value}
                      placeholder="e.g. Zenith Bank"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.bankName?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="accountNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Account Number"
                      value={value}
                      placeholder="10 digits"
                      keyboardType="numeric"
                      maxLength={10}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.accountNumber?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="accountName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Account Name"
                      value={value}
                      placeholder="Full Name on Account"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.accountName?.message}
                    />
                  )}
                />
              </View>

              <Button
                label={isUpdating ? "Saving..." : "Save Payout Details"}
                onPress={handleSubmit(handleUpdateProfile)}
                disabled={isUpdating}
                style={{ marginTop: Spacing.xl, height: 56 }}
                fullWidth
              />
              <View style={{ height: 60 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfoMain: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "rgba(0, 255, 102, 0.3)",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: Colors.emerald,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  userName: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.2)",
  },
  tierText: {
    color: Colors.emerald,
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 6,
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  // CTA
  ctaCard: {
    marginBottom: Spacing.xl,
    borderRadius: Radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.2)",
  },
  ctaGradient: {
    padding: Spacing.md,
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Settings
  sectionHeader: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  settingIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0, 255, 102, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingTextWrapper: {
    flex: 1,
  },
  groupDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    marginLeft: 56,
  },

  // Logout
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: Spacing.xl,
    marginTop: Spacing.md,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: "700",
    fontSize: 16,
  },
  footerInfo: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    opacity: 0.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background, // Use dark background for modal body
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  closeModal: {
    backgroundColor: "rgba(255,255,255,0.05)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSection: {
    marginBottom: Spacing.sm,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.emerald,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },
  readOnlyContainer: {
    marginBottom: Spacing.sm,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: Spacing.xl,
  },
});
