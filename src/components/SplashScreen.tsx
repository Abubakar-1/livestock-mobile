import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";
import { Colors, Spacing, Typography } from "../constants/theme";
import { AppText } from "./ui";

const { width } = Dimensions.get("window");

/**
 * SplashScreen component following the provided UI design.
 * Features layered emerald glow rings, animated logo, tagline, and progress bar.
 * Uses LinearGradient for a depth-filled background.
 */
const SplashScreen = () => {
  const animatedValue = new Animated.Value(0);
  const progressValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(progressValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // Subtle pulsing animation for the glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const logoScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const contentOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <LinearGradient
      colors={[Colors.background, "#0A1C10", Colors.background]}
      style={styles.container}
    >
      {/* ── Background Glow ────────────────────────────────────────────────── */}
      <Animated.View
        style={[styles.glowContainer, { transform: [{ scale: pulseValue }] }]}
      >
        <View
          style={[
            styles.glowRing,
            { width: 220, height: 220, opacity: 0.05, borderRadius: 110 },
          ]}
        />
        <View
          style={[
            styles.glowRing,
            { width: 180, height: 180, opacity: 0.1, borderRadius: 90 },
          ]}
        />
        <View
          style={[
            styles.glowRing,
            { width: 140, height: 140, opacity: 0.15, borderRadius: 70 },
          ]}
        />
      </Animated.View>

      {/* ── Logo & Title ──────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.centerContent,
          { opacity: contentOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/images/logo-placeholder.webp")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <AppText variant="h1" style={styles.title}>
          Livestock
        </AppText>
      </Animated.View>

      {/* ── Bottom Section ────────────────────────────────────────────────── */}
      <View style={styles.bottomSection}>
        <AppText variant="caption" style={styles.tagline}>
          OWN REAL ASSETS. GROW WITH TIME.
        </AppText>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        <AppText variant="caption" style={styles.version}>
          v1.0.2
        </AppText>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  glowContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: Colors.emerald,
  },
  centerContent: {
    alignItems: "center",
  },
  logoWrapper: {
    width: 110,
    height: 110,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.1)",
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    letterSpacing: 2,
    fontWeight: "700",
    color: Colors.white,
  },
  bottomSection: {
    position: "absolute",
    bottom: 80,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  tagline: {
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.xl,
    fontSize: Typography.fontSize.xs - 1,
    opacity: 0.8,
  },
  progressTrack: {
    width: width * 0.5,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.emerald,
  },
  version: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: Spacing.xs,
  },
});

export default SplashScreen;
