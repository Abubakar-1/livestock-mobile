import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Button, Input } from "../../src/components/ui";
import { Colors, Radius, Spacing } from "../../src/constants/theme";
import { useRegisterMutation } from "../../src/features/auth/authApi";

const COUNTRY_CODES = [
  { label: "🇳🇬 Nigeria (+234)", code: "+234", flag: "🇳🇬" },
  { label: "🇬🇭 Ghana (+233)", code: "+233", flag: "🇬🇭" },
  { label: "🇰🇪 Kenya (+254)", code: "+254", flag: "🇰🇪" },
  { label: "🇿🇦 South Africa (+27)", code: "+27", flag: "🇿🇦" },
  { label: "🇺🇸 United States (+1)", code: "+1", flag: "🇺🇸" },
  { label: "🇬🇧 United Kingdom (+44)", code: "+44", flag: "🇬🇧" },
];

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../../src/schema/auth.schema";

const RegisterScreen = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: "+234",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const countryCode = watch("countryCode");
  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const [register, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState("");

  const handleRegister = async (data: any) => {
    setError("");

    try {
      const res = await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: `${data.countryCode}${data.phoneNumber}`,
        password: data.password,
      }).unwrap();
      console.log("Registration response:", res);

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.data?.message || "Registration failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <AppText variant="label" style={styles.headerTitle}>
            Create Account
          </AppText>
          <View style={{ width: 24 }} />
        </View>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <View style={styles.body}>
          <AppText variant="h1" style={styles.title}>
            Join Livestock
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            Start your journey into digital livestock ownership today.
          </AppText>

          <View style={styles.form}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="First Name"
                  placeholder="Enter your first name"
                  autoComplete="name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.firstName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Last Name"
                  placeholder="Enter your last name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.lastName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="example@mail.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  leftIcon="mail-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />

            <AppText variant="label" style={{ marginBottom: 4, marginLeft: 4 }}>
              Phone Number
            </AppText>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.countryCodeSelector}
                onPress={() => setShowCountryPicker(true)}
              >
                <AppText style={{ fontSize: 16 }}>
                  {selectedCountry.flag} {selectedCountry.code}
                </AppText>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={Colors.textMuted}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="801 234 5678"
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      containerStyle={{ marginBottom: 0 }}
                      error={errors.phoneNumber?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Create a strong password"
                  secureTextEntry={!showPassword}
                  leftIcon="lock-closed-outline"
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  secureTextEntry={!showConfirmPassword}
                  leftIcon="shield-checkmark-outline"
                  rightIcon={
                    showConfirmPassword ? "eye-off-outline" : "eye-outline"
                  }
                  onRightIconPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {error ? (
              <AppText
                style={{
                  color: Colors.error,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {error}
              </AppText>
            ) : null}

            <Button
              label={isLoading ? "Creating Account..." : "Create Account"}
              style={styles.submitButton}
              onPress={handleSubmit(handleRegister)}
              disabled={isLoading}
              fullWidth
            />
          </View>

          {/* ── Login Link ─────────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            style={styles.loginLink}
          >
            <AppText variant="bodySmall">
              Already have an account?{" "}
              <AppText variant="bodySmall" color={Colors.emerald}>
                Login
              </AppText>
            </AppText>
          </TouchableOpacity>
        </View>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <AppText variant="caption" align="center" style={styles.footerText}>
            By creating an account, you agree to our{" "}
            <AppText variant="caption" color={Colors.emerald}>
              Terms of Service
            </AppText>{" "}
            and{" "}
            <AppText variant="caption" color={Colors.emerald}>
              Privacy Policy
            </AppText>
            .
          </AppText>
        </View>
      </ScrollView>

      {/* ── Country Code Modal ────────────────────────────────────────── */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="h2">Select Country</AppText>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setValue("countryCode", item.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <AppText style={{ fontSize: 16 }}>{item.label}</AppText>
                  {countryCode === item.code && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.emerald}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  title: {
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  form: {
    marginTop: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
  loginLink: {
    alignItems: "center",
    marginTop: Spacing.xxl,
  },
  footer: {
    paddingHorizontal: Spacing.xxxl,
    marginTop: Spacing.xxxl,
  },
  footerText: {
    lineHeight: 20,
    color: Colors.textMuted,
  },

  // Phone Row
  phoneRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: Spacing.base,
  },
  countryCodeSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 56,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    height: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
});

export default RegisterScreen;
