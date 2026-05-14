import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Button, Input } from "../../src/components/ui";
import { Colors, Spacing } from "../../src/constants/theme";
import { useLoginMutation } from "../../src/features/auth/authApi";
import { loginSchema } from "../../src/schema/auth.schema";
const LoginScreen = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (data: any) => {
    setLocalError("");
    try {
      await login(data).unwrap();
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log(err);
      setLocalError(err?.data?.message || err?.message || "Login failed");
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
            Sign Up / Login
          </AppText>
          <View style={{ width: 24 }} />
        </View>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <View style={styles.body}>
          <AppText variant="h1" style={styles.welcomeText}>
            Welcome Back
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            Enter your phone number to continue accessing your livestock
            portfolio.
          </AppText>

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

          <View style={{ marginTop: 16 }}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
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
          </View>

          {localError ? (
            <AppText
              style={{ color: Colors.error, marginTop: 8, textAlign: "center" }}
            >
              {localError}
            </AppText>
          ) : null}

          <Button
            label={isLoading ? "Signing In..." : "Login"}
            style={styles.otpButton}
            onPress={handleSubmit(handleLogin)}
            disabled={isLoading}
            fullWidth
          />

          {/* ── Divider ─────────────────────────────────────────────────────── */}
          {/* <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <AppText variant="caption" style={styles.dividerText}>or login with</AppText>
            <View style={styles.dividerLine} />
          </View> */}

          {/* ── Biometrics ──────────────────────────────────────────────────── */}
          {/* <View style={styles.biometricsContainer}>
            <TouchableOpacity style={styles.faceIdButton}>
              <View style={styles.faceIdIconWrapper}>
                <Ionicons name="happy-outline" size={32} color={Colors.emerald} />
              </View>
              <AppText variant="caption" style={styles.faceIdText}>Face ID</AppText>
            </TouchableOpacity>
          </View> */}

          {/* ── Sign Up Link ────────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/register")}
            style={styles.signupLink}
          >
            <AppText variant="bodySmall">
              Don't have an account?{" "}
              <AppText variant="bodySmall" color={Colors.emerald}>
                Sign Up
              </AppText>
            </AppText>
          </TouchableOpacity>
        </View>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <AppText variant="caption" align="center" style={styles.footerText}>
            By continuing, you agree to our{" "}
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
  welcomeText: {
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
    lineHeight: 22,
  },
  otpButton: {
    marginTop: Spacing.lg,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.xxxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.textMuted,
  },
  biometricsContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  faceIdButton: {
    alignItems: "center",
  },
  faceIdIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  faceIdText: {
    color: Colors.textSecondary,
  },
  signupLink: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.xxxl,
    marginTop: "auto",
  },
  footerText: {
    lineHeight: 20,
    color: Colors.textMuted,
  },
});

export default LoginScreen;
