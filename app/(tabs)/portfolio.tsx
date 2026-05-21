import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AssetCard,
  PortfolioValueCard,
  UnrealizedGainsCard,
} from "../../src/components/Portfolio";
import { AppText } from "../../src/components/ui";
import { Colors, Radius, Spacing } from "../../src/constants/theme";

import { ActivityIndicator } from "react-native";
import { useGetPurchasesQuery } from "../../src/features/marketplace/marketplaceApi";

const unitCost = (batch: any) =>
  parseFloat(batch?.animalPrice || "0") +
  parseFloat(batch?.feedingFee || "0") +
  parseFloat(batch?.medicationFee || "0");

const currentUnitValue = (batch: any) =>
  parseFloat(batch?.currentMarketValueLow || "0") > 0
    ? parseFloat(batch?.currentMarketValueLow || "0")
    : unitCost(batch);

export default function PortfolioScreen() {
  const router = useRouter();
  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useGetPurchasesQuery();

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const allPurchases = response?.data || [];

  // 1. Filter Pending Orders (Shown individually)
  const pendingOrders = allPurchases.filter((p: any) => p.status === "PENDING");

  // 2. Aggregate Confirmed Purchases by batchId (Official Assets)
  const confirmedAssets = React.useMemo(() => {
    const map = new Map();
    allPurchases
      .filter((p: any) => p.status === "CONFIRMED")
      .forEach((p: any) => {
        if (!p.batch) return;
        const existing = map.get(p.batchId);
        if (existing) {
          existing.units += p.units;
          existing.amount = (
            parseFloat(existing.amount) + parseFloat(p.amount)
          ).toString();
        } else {
          map.set(p.batchId, { ...p, amount: p.amount.toString() });
        }
      });
    return Array.from(map.values());
  }, [allPurchases]);

  // Total value only includes confirmed assets
  const totalValue = confirmedAssets.reduce((sum: number, p: any) => {
    return sum + p.units * currentUnitValue(p.batch);
  }, 0);

  const unrealizedGains = confirmedAssets.reduce((sum: number, p: any) => {
    const cost = p.units * unitCost(p.batch);
    const estimatedEndValue =
      p.units * parseFloat(p.batch?.estimatedSalePriceLow || "0");
    return sum + Math.max(0, estimatedEndValue - cost);
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="menu-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
        <AppText variant="h3">Portfolio</AppText>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.white}
          />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={onRefresh}
            tintColor={Colors.emerald}
            colors={[Colors.emerald]}
          />
        }
      >
        <PortfolioValueCard
          value={totalValue.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
          trend="Est. Growth"
        />

        <UnrealizedGainsCard
          value={unrealizedGains.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
          progress={
            totalValue > 0
              ? Math.min(100, Math.round((unrealizedGains / totalValue) * 100))
              : 0
          }
        />

        {/* ── Pending Orders Section ──────────────────────────────────────── */}
        {pendingOrders.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={styles.sectionTitle}>
                Pending Orders
              </AppText>
              <View style={styles.pendingBadge}>
                <AppText
                  variant="caption"
                  style={{ color: "#F59E0B", fontWeight: "700" }}
                >
                  {pendingOrders.length}
                </AppText>
              </View>
            </View>
            {pendingOrders.map((order: any) => {
              const batch = order.batch;
              const maturityDate = new Date(batch?.endDate).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric", year: "numeric" },
              );

              const maturityValueLow =
                order.units * parseFloat(batch?.estimatedSalePriceLow || "0");
              const maturityValueHigh =
                order.units * parseFloat(batch?.estimatedSalePriceHigh || "0");
              const maturityValueRange = `${maturityValueLow.toLocaleString()} - ${maturityValueHigh.toLocaleString()}`;

              const daysLeft = Math.max(
                0,
                Math.ceil(
                  (new Date(batch?.endDate).getTime() - new Date().getTime()) /
                    (1000 * 3600 * 24),
                ),
              );

              return (
                <AssetCard
                  key={order.id}
                  status="PENDING"
                  title={batch?.name || "Asset"}
                  batch={batch?.id?.substring(0, 4)?.toUpperCase() || "---"}
                  qty={order.units.toString()}
                  maturityDate={maturityDate}
                  maturityValue={maturityValueRange}
                  daysLeft={daysLeft.toString()}
                  image={require("../../assets/images/boer-goat-banner.webp")}
                  onPress={() =>
                    router.push(`/asset-details?id=${order.id}` as any)
                  }
                />
              );
            })}
          </>
        )}

        {/* ── Owned Assets Header ─────────────────────────────────────────── */}
        <View
          style={[
            styles.sectionHeader,
            { marginTop: pendingOrders.length > 0 ? Spacing.xl : Spacing.md },
          ]}
        >
          <AppText variant="h3" style={styles.sectionTitle}>
            Confirmed Assets
          </AppText>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.emerald}
            style={{ marginTop: 40 }}
          />
        ) : confirmedAssets.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons
              name="briefcase-outline"
              size={48}
              color={Colors.textMuted}
            />
            <AppText color={Colors.textMuted} style={{ marginTop: 10 }}>
              No confirmed assets yet.
            </AppText>
            {pendingOrders.length === 0 && (
              <TouchableOpacity
                onPress={() => router.push("/marketplace")}
                style={{ marginTop: 20 }}
              >
                <AppText color={Colors.emerald}>Browse Marketplace</AppText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          confirmedAssets.map((asset: any) => {
            const batch = asset.batch;
            const maturityDate = new Date(batch?.endDate).toLocaleDateString(
              undefined,
              { month: "short", day: "numeric", year: "numeric" },
            );

            const maturityValueLow =
              asset.units * parseFloat(batch?.estimatedSalePriceLow || "0");
            const maturityValueHigh =
              asset.units * parseFloat(batch?.estimatedSalePriceHigh || "0");
            const maturityValueRange = `${maturityValueLow.toLocaleString()} - ${maturityValueHigh.toLocaleString()}`;

            const daysLeft = Math.max(
              0,
              Math.ceil(
                (new Date(batch?.endDate).getTime() - new Date().getTime()) /
                  (1000 * 3600 * 24),
              ),
            );

            return (
              <AssetCard
                key={asset.id}
                title={batch?.name || "Asset"}
                batch={batch?.id?.substring(0, 4)?.toUpperCase() || "---"}
                qty={asset.units.toString()}
                maturityDate={maturityDate}
                maturityValue={maturityValueRange}
                daysLeft={daysLeft.toString()}
                image={require("../../assets/images/boer-goat-banner.webp")}
                onPress={() =>
                  router.push(`/asset-details?id=${asset.id}` as any)
                }
              />
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.emerald,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  pendingBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginLeft: 8,
  },
});
