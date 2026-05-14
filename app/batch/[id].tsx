import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText, Button } from "../../src/components/ui";
import { Colors, Radius, Spacing } from "../../src/constants/theme";
import { useGetBankDetailsQuery } from "../../src/features/bank-details/bankDetailsApi";
import {
  useGetBatchByIdQuery,
  usePurchaseAssetMutation,
} from "../../src/features/marketplace/marketplaceApi";

const { width } = Dimensions.get("window");

// Calculate a simple "funded" percentage
function getPurchasedUnits(batch: any): number {
  return batch?._count?.investments
    ? batch.investments?.reduce(
        (a: number, inv: any) => a + (inv.units || 0),
        0,
      )
    : 0;
}

const BatchDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetBatchByIdQuery(id as string, {
    skip: !id,
  });

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);
  const [purchaseAsset, { isLoading: isPurchasing }] =
    usePurchaseAssetMutation();

  const [holdingPeriod, setHoldingPeriod] = useState("12 Mo");
  const [units, setUnits] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const { data: bankResponse } = useGetBankDetailsQuery();
  const bankDetails = bankResponse?.data;

  if (isLoading || !id) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.emerald} />
      </View>
    );
  }

  if (isError || !response?.data) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center", padding: 20 },
        ]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <AppText style={{ textAlign: "center" }}>
          Failed to load batch details.
        </AppText>
        <Button
          label="Go Back"
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  const batch = response.data;

  const marketValuePerUnit =
    parseFloat(batch.animalPrice || "0") + parseFloat(batch.serviceFee || "0");
  const projectedPeakLow = parseFloat(batch.estimatedSalePriceLow || "0");
  const projectedPeakHigh = parseFloat(batch.estimatedSalePriceHigh || "0");
  const projectedPeakPerUnit = `${projectedPeakLow.toFixed(0)} - ${projectedPeakHigh.toFixed(0)}`;
  
  const currentMarketValueLow = parseFloat(String(batch.currentMarketValueLow || "0"));
  const currentMarketValueHigh = parseFloat(String(batch.currentMarketValueHigh || "0"));
  const currentMarketValuePerUnit = currentMarketValueLow > 0 
    ? `₦${currentMarketValueLow.toLocaleString()} - ₦${currentMarketValueHigh.toLocaleString()}`
    : `₦${marketValuePerUnit.toLocaleString()}`;

  const totalAssetValue = units * marketValuePerUnit;

  const purchasedUnits = getPurchasedUnits(batch);
  const unitsLeft = Math.max(0, batch.totalUnits - purchasedUnits);

  const roiLow =
    projectedPeakLow > 0 && marketValuePerUnit > 0
      ? (
          ((projectedPeakLow - marketValuePerUnit) / marketValuePerUnit) *
          100
        ).toFixed(0)
      : "0";
  const roiHigh =
    projectedPeakHigh > 0 && marketValuePerUnit > 0
      ? (
          ((projectedPeakHigh - marketValuePerUnit) / marketValuePerUnit) *
          100
        ).toFixed(0)
      : "0";
  const roi = `${roiLow}% - ${roiHigh}%`;
  
  const isSoldOut = unitsLeft < 1;
  const isComingSoon = batch.status === 'COMING_SOON';
  const isClosed = isSoldOut || (batch.status !== 'OPEN' && batch.status !== 'ACTIVE');

  const handlePurchase = async () => {
    if (units < 1) {
      Alert.alert("Invalid Units", "Please select at least 1 unit.");
      return;
    }
    if (units > unitsLeft) {
      Alert.alert("Not Enough Units", `Only ${unitsLeft} units are available.`);
      return;
    }

    try {
      await purchaseAsset({ batchId: batch.id, units }).unwrap();
      setShowConfirmModal(false);
      setShowBankModal(true);
    } catch (error: any) {
      Alert.alert(
        "Purchase Failed",
        error.data?.message || "Something went wrong.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={onRefresh}
            tintColor={Colors.white}
            colors={[Colors.emerald]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Banner Image & Header ───────────────────────────────────────── */}
        <View style={styles.bannerContainer}>
          <Image
            source={require("../../assets/images/boer-goat-banner.png")}
            style={styles.bannerImage}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent", "rgba(6,20,11,1)"]}
            style={styles.bannerOverlay}
          />

          <SafeAreaView style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBtn}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <AppText variant="h3">
              Batch #{batch.id.substring(0, 4).toUpperCase()}
            </AppText>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons
                name="bookmark-outline"
                size={24}
                color={Colors.white}
              />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.bannerTitleContainer}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <AppText variant="label" style={styles.badgeText}>
                  LIVESTOCK
                </AppText>
              </View>
              {unitsLeft < batch.totalUnits * 0.2 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: "rgba(255,255,255,0.1)" },
                  ]}
                >
                  <AppText
                    variant="label"
                    style={[styles.badgeText, { color: Colors.textSecondary }]}
                  >
                    Selling Fast
                  </AppText>
                </View>
              )}
            </View>
            <AppText variant="display" style={styles.bannerTitle}>
              {batch.name}
            </AppText>
            <AppText variant="bodySmall" color={Colors.textSecondary}>
              {batch.animalType?.name || "Livestock"} • Quality Assets
            </AppText>
          </View>
        </View>

        {/* ── Closed Banner ────────────────────────────────────────────────── */}
        {isClosed && (
          <View style={[styles.closedBanner, isComingSoon && { backgroundColor: Colors.gold }]}>
            <Ionicons name={isComingSoon ? "calendar-outline" : "lock-closed"} size={16} color={Colors.white} />
            <AppText variant="bodySmall" style={styles.closedBannerText}>
              {isComingSoon ? "COMING SOON — Accepting investments shortly" : (isSoldOut ? "BATCH SOLD OUT" : "CAMPAIGN CLOSED")}
            </AppText>
          </View>
        )}

        {/* ── Metric Chips ────────────────────────────────────────────────── */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricChip}>
            <AppText
              variant="h2"
              color={Colors.emerald}
              style={styles.metricValue}
            >
              {roiLow}%
            </AppText>
            <AppText variant="caption">EST. GROWTH</AppText>
          </View>
          <View style={styles.metricChip}>
            <AppText variant="h2" style={styles.metricValue}>
              Low
            </AppText>
            <AppText variant="caption">RISK PROFILE</AppText>
          </View>
          <View style={styles.metricChip}>
            <AppText variant="h2" style={styles.metricValue}>
              {unitsLeft}
            </AppText>
            <AppText variant="caption">UNITS LEFT</AppText>
          </View>
        </View>

        {/* ── Asset Details ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Asset Details
          </AppText>
          <AppText variant="body" style={styles.thesisText}>
            {batch.description ||
              "These assets are meticulously managed to ensure optimal growth and premium market value upon exit."}
          </AppText>
        </View>

        {/* ── Campaign Period ─────────────────────────────────────────────── */}
        {batch.campaignStartDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons
                name="megaphone-outline"
                size={18}
                color={Colors.emerald}
              />
              <AppText
                variant="h3"
                style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}
              >
                Campaign Window
              </AppText>
            </View>
            <View style={styles.campaignCard}>
              <View style={styles.campaignItem}>
                <AppText variant="caption" color={Colors.textMuted}>STARTS</AppText>
                <AppText variant="body" weight="700">
                  {new Date(batch.campaignStartDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </AppText>
              </View>
              <View style={styles.campaignDivider} />
              <View style={styles.campaignItem}>
                <AppText variant="caption" color={Colors.textMuted}>ENDS</AppText>
                <AppText variant="body" weight="700">
                  {new Date(batch.campaignEndDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </AppText>
              </View>
            </View>
          </View>
        )}

        {/* ── Holding Period ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={Colors.emerald}
            />
            <AppText
              variant="h3"
              style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}
            >
              Holding Period
            </AppText>
          </View>

          <View style={styles.holdingRow}>
            <View
              style={[
                styles.holdingItem,
                {
                  backgroundColor: "transparent",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderWidth: 1,
                },
              ]}
            >
              <AppText
                variant="h3"
                style={[
                  styles.holdingValue,
                  { color: Colors.textSecondary, fontSize: 16 },
                ]}
              >
                {new Date(batch.startDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </AppText>
              <AppText
                variant="caption"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Batch Start
              </AppText>
            </View>

            <View style={[styles.holdingItem, styles.holdingItemActive]}>
              <AppText
                variant="h3"
                style={[
                  styles.holdingValue,
                  { color: Colors.white, fontSize: 16 },
                ]}
              >
                {new Date(batch.endDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </AppText>
              <AppText
                variant="caption"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Target Maturity
              </AppText>
              <View style={styles.activeDot} />
            </View>
          </View>
        </View>

        {/* ── Value Chart ────────────────────────────────────────────────── */}
        <View style={styles.chartCard}>
          <View style={styles.valueStack}>
            <View style={styles.valueItem}>
              <AppText variant="caption" color={Colors.textMuted}>Buy For</AppText>
              <AppText variant="h2" style={styles.chartValue}>
                ₦{marketValuePerUnit.toLocaleString()}
                <AppText variant="caption" color={Colors.textMuted}> /unit</AppText>
              </AppText>
            </View>

            <View style={styles.valueItem}>
              <AppText variant="caption" color={Colors.emerald}>Sell For (Projected)</AppText>
              <AppText variant="h2" color={Colors.emerald} style={styles.chartValue}>
                ₦{projectedPeakPerUnit.split(' - ').map(v => Number(v).toLocaleString()).join(' - ')}
              </AppText>
            </View>

            {currentMarketValueLow > 0 && (
              <View style={styles.valueItem}>
                <AppText variant="caption" color={Colors.textMuted}>Current Market Value</AppText>
                <AppText variant="h3" color={Colors.white} style={styles.currentMarketValueText}>
                  {currentMarketValuePerUnit} <AppText variant="caption" color={Colors.textMuted}> /unit</AppText>
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.rangeBarBg}>
            <LinearGradient
              colors={["#4A5568", Colors.emerald]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.rangeBarFill, { width: "80%" }]}
            />
            <View style={[styles.rangeThumb, { left: "75%" }]} />
          </View>

          <View style={styles.rangeLabels}>
            <AppText variant="caption">Entry</AppText>
            <AppText variant="caption">Growth ({roi})</AppText>
          </View>
        </View>
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* ── Bottom Bar ──────────────────────────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(Spacing.xl, insets.bottom + 8) }]}>
        {!isClosed ? (
          <>
            <View style={styles.bottomTopRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption">Total Purchase Amount</AppText>
                <AppText variant="h2" numberOfLines={1} adjustsFontSizeToFit>₦{totalAssetValue.toLocaleString()}</AppText>
              </View>

              <View style={styles.counterContainer}>
                <TouchableOpacity
                  onPress={() => setUnits(Math.max(1, units - 1))}
                  style={styles.counterBtn}
                >
                  <Ionicons name="remove" size={20} color={Colors.white} />
                </TouchableOpacity>
                <AppText variant="body" style={styles.counterValue}>
                  {units}
                </AppText>
                <TouchableOpacity
                  onPress={() => setUnits(Math.min(unitsLeft, units + 1))}
                  style={styles.counterBtn}
                >
                  <Ionicons name="add" size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              label={isPurchasing ? "Processing..." : "Purchase Asset Units"}
              variant="primary"
              fullWidth
              size="lg"
              onPress={() => setShowConfirmModal(true)}
              disabled={isPurchasing || unitsLeft < 1}
            />
          </>
        ) : (
          <View style={styles.closedBottomBar}>
            <AppText variant="h3" align="center" style={{ color: Colors.textMuted }}>
              {isComingSoon ? "Coming Soon" : "Campaign Ended"}
            </AppText>
            <AppText variant="caption" align="center" style={{ color: Colors.textMuted, marginTop: 4 }}>
              {isComingSoon ? "We are not yet accepting investments for this batch." : "This batch is no longer accepting new investments."}
            </AppText>
          </View>
        )}
      </View>

      {/* ── Confirmation Modal ─────────────────────────────────────────── */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="h3">Confirm Order</AppText>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <AppText color={Colors.textSecondary}>Asset</AppText>
                <AppText variant="body" weight="700">
                  {batch.name}
                </AppText>
              </View>
              <View style={styles.summaryRow}>
                <AppText color={Colors.textSecondary}>Units</AppText>
                <AppText variant="body" weight="700">
                  {units}
                </AppText>
              </View>
              <View style={styles.summaryRow}>
                <AppText color={Colors.textSecondary}>Price per Unit</AppText>
                <AppText variant="body" weight="700">
                  ₦{marketValuePerUnit.toLocaleString()}
                </AppText>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <AppText variant="h3">Total Amount</AppText>
                <AppText variant="h3" color={Colors.emerald}>
                  ₦{totalAssetValue.toLocaleString()}
                </AppText>
              </View>
            </View>

            <AppText variant="caption" style={styles.disclaimer}>
              By clicking confirm, you agree to place this order. You will be
              provided with bank details to complete your payment manually.
            </AppText>

            <Button
              label={isPurchasing ? "Initiating..." : "Confirm & Proceed"}
              onPress={handlePurchase}
              disabled={isPurchasing}
              fullWidth
            />
          </View>
        </View>
      </Modal>

      {/* ── Bank Details Modal ─────────────────────────────────────────── */}
      <Modal
        visible={showBankModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors.surfaceElevated },
            ]}
          >
            <View style={styles.successHeader}>
              <View style={styles.successIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color={Colors.emerald}
                />
              </View>
              <AppText variant="h2" align="center">
                Order Placed!
              </AppText>
              <AppText
                variant="body"
                align="center"
                color={Colors.textSecondary}
                style={{ marginTop: 8 }}
              >
                Your order is currently PENDING. Please make a bank transfer to
                the details below to confirm your purchase.
              </AppText>
            </View>

            <View style={styles.bankCard}>
              <View style={styles.bankRow}>
                <AppText variant="caption" color={Colors.textMuted}>
                  BANK NAME
                </AppText>
                <AppText variant="h3">
                  {bankDetails?.bankName || "Loading..."}
                </AppText>
              </View>
              <View style={styles.bankRow}>
                <AppText variant="caption" color={Colors.textMuted}>
                  ACCOUNT NUMBER
                </AppText>
                <AppText variant="h3" selectable>
                  {bankDetails?.accountNumber || "Loading..."}
                </AppText>
              </View>
              <View style={styles.bankRow}>
                <AppText variant="caption" color={Colors.textMuted}>
                  ACCOUNT NAME
                </AppText>
                <AppText variant="h3">
                  {bankDetails?.accountName || "Loading..."}
                </AppText>
              </View>
              <View style={styles.bankRow}>
                <AppText variant="caption" color={Colors.textMuted}>
                  TOTAL AMOUNT
                </AppText>
                <AppText variant="h2" color={Colors.emerald}>
                  ₦{totalAssetValue.toLocaleString()}
                </AppText>
              </View>
            </View>

            <View style={styles.instructionBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={Colors.emerald}
              />
              <AppText variant="caption" style={{ flex: 1, marginLeft: 8 }}>
                After transfer, please keep your receipt. Our admin will verify
                your payment and confirm your asset units within 24 hours.
              </AppText>
            </View>

            <Button
              label="Go to My Portfolio"
              onPress={() => {
                setShowBankModal(false);
                router.push("/(tabs)/portfolio");
              }}
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    gap: 8,
  },
  closedBannerText: {
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closedBottomBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  campaignCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  campaignItem: {
    flex: 1,
    alignItems: "center",
  },
  campaignDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  bannerContainer: {
    height: 400,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    position: "absolute",
    top: 0,
    width: "100%",
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: Radius.full,
  },
  bannerTitleContainer: {
    position: "absolute",
    bottom: Spacing.xl,
    left: Spacing.xl,
    right: Spacing.xl,
  },
  badgeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.emeraldFaint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.2)",
  },
  badgeText: {
    color: Colors.emerald,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 32,
    marginBottom: 4,
  },
  scrollContent: {
    // paddingHorizontal: Spacing.xl,
  },
  metricsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginTop: -15,
    zIndex: 10,
  },
  metricChip: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  thesisText: {
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  holdingRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  holdingItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    position: "relative",
  },
  holdingItemActive: {
    borderColor: Colors.emerald,
    backgroundColor: "rgba(0, 255, 102, 0.05)",
  },
  holdingValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  activeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.emerald,
    shadowColor: Colors.emerald,
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  chartCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  valueStack: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  valueItem: {
    gap: 4,
  },
  chartValue: {
    fontSize: 26,
    fontWeight: "800",
  },
  currentMarketValueText: {
    fontSize: 20,
    fontWeight: "700",
  },
  rangeBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    position: "relative",
    marginBottom: Spacing.sm,
  },
  rangeBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  rangeThumb: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.emerald,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    paddingBottom: Spacing.xl + 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  bottomTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: Radius.full,
    padding: 4,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    marginHorizontal: Spacing.lg,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  orderSummary: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  disclaimer: {
    marginBottom: Spacing.xl,
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: "center",
  },
  successHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  bankCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  bankRow: {
    gap: 4,
  },
  instructionBox: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 255, 102, 0.05)",
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
});

export default BatchDetailsScreen;
