import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { useSelector } from 'react-redux';
import StoreProvider from '../src/providers/StoreProvider';
import SplashScreen from '../src/components/SplashScreen';
import OnboardingScreen from '../src/components/OnboardingScreen';
import { Colors } from '../src/constants/theme';
import { RootState } from '../src/store/store';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [isAppReady, setIsAppReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    // Set system-wide background color
    SystemUI.setBackgroundColorAsync(Colors.background);

    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Handle Protected Routes Redirects
  useEffect(() => {
    if (!isAppReady || showOnboarding) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to dashboard if authenticated and trying to access auth pages
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isAppReady, showOnboarding]);

  if (!isAppReady) {
    return <SplashScreen />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="batch-details" options={{ presentation: 'modal' }} />
        <Stack.Screen name="asset-details" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <RootLayoutNav />
    </StoreProvider>
  );
}

