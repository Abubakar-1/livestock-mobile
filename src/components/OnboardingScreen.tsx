import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { AppText, Button } from './ui';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
}

interface OnboardingProps {
  onFinish: () => void;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Own Livestock Digitally',
    description: 'Buy goats, cows, fish, or poultry directly through the app and track your assets.',
    image: require('../../assets/images/onboarding-1.png'),
  },
  {
    id: '2',
    title: 'Real-Time Monitoring',
    description: 'Track your assets\' growth and health with live updates and data-driven insights.',
    image: require('../../assets/images/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Wealth Growth',
    description: 'Watch your assets mature and earn significant returns as your livestock grows with time.',
    image: require('../../assets/images/onboarding-3.png'),
  },
];

const OnboardingScreen: React.FC<OnboardingProps> = ({ onFinish }) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      // Final slide: proceed
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>
      
      <View style={styles.textContainer}>
        <AppText variant="h1" align="center" style={styles.title}>
          {item.title}
        </AppText>
        <AppText variant="body" align="center" style={styles.description}>
          {item.description}
        </AppText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <AppText variant="label" color={Colors.textSecondary} style={styles.skipText}>
            Skip
          </AppText>
        </TouchableOpacity>
      </View>

      {/* ── Slides ────────────────────────────────────────────────────────── */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <Button
          label={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          rightIcon={
            currentIndex < SLIDES.length - 1 ? (
              <Ionicons name="arrow-forward" size={20} color={Colors.textOnAccent} />
            ) : undefined
          }
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: Typography.fontSize.sm,
    letterSpacing: 0.5,
  },
  slide: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  imageContainer: {
    width: width - Spacing.xl * 2,
    height: height * 0.45,
    borderRadius: Radius.lg * 2,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginBottom: Spacing.xxxl,
    // Add subtle glow
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  title: {
    color: Colors.white,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.emerald,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: Colors.surfaceElevated,
  },
});

export default OnboardingScreen;
