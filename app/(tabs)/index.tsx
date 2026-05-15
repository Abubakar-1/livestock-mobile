import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  ActionButton,
  BatchCard,
  InsightCard,
  SummaryCard,
} from "../../src/components/Dashboard";
import { AppText } from "../../src/components/ui";
import { Colors, Spacing } from "../../src/constants/theme";
import {
  useGetBatchesQuery,
  useGetPurchasesQuery,
} from "../../src/features/marketplace/marketplaceApi";
import { RootState } from "../../src/store/store";

const healthColor: Record<string, string> = {
  EXCELLENT: Colors.emerald,
  GOOD: Colors.emerald,
  MONITORING: "#FFB800",
  CRITICAL: "#EF4444",
};

function durationMonths(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "0";
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return String(Math.max(1, months));
}

function fundedPercent(batch: any): number {
  const invested = batch._count?.investments
    ? batch.investments?.reduce(
        (a: number, inv: any) => a + (inv.units || 0),
        0,
      )
    : 0;
  return batch.totalUnits > 0
    ? Math.min(100, Math.round((invested / batch.totalUnits) * 100))
    : 0;
}

const TopBatchesList = () => {
  const router = useRouter();
  const { data: response, isLoading } = useGetBatchesQuery();

  if (isLoading) {
    return (
      <ActivityIndicator
        size="small"
        color={Colors.emerald}
        style={{ marginVertical: 20 }}
      />
    );
  }

  const batches: any[] = response?.data || [];
  const availableBatches = batches
    .filter((b) => b.status === "OPEN" || b.status === "ACTIVE")
    .slice(0, 3);

  if (availableBatches.length === 0) {
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <AppText color={Colors.textMuted}>
          No active batches available right now.
        </AppText>
      </View>
    );
  }

  return (
    <>
      {availableBatches.map((batch) => {
        // Use the investments count from the backend _count field if available
        // Note: For real accuracy, the backend should provide sum of units.
        // Assuming 1 investment = X units, but for now using _count as a placeholder for activity.
        const investorCount = batch._count?.investments || 0;
        const progress =
          batch.totalUnits > 0
            ? Math.min(
                100,
                Math.round((investorCount / batch.totalUnits) * 100),
              )
            : 0;

        const cost =
          parseFloat(batch.animalPrice || "0") +
          parseFloat(batch.serviceFee || "0");
        const roi =
          batch.estimatedSalePriceLow &&
          batch.estimatedSalePriceHigh &&
          cost > 0
            ? `${(((parseFloat(batch.estimatedSalePriceLow) - cost) / cost) * 100).toFixed(0)}% - ${(((parseFloat(batch.estimatedSalePriceHigh) - cost) / cost) * 100).toFixed(0)}%`
            : "N/A";
        const sColor = healthColor[batch.healthStatus] || Colors.emerald;
        const location =
          batch.batchFarms?.[0]?.farm?.location || "Multiple Farms";

        return (
          <BatchCard
            key={batch.id}
            title={batch.name}
            location={location}
            price={cost.toFixed(0)}
            estReturn={`${parseFloat(batch.estimatedSalePriceLow || "0").toFixed(0)} - ${parseFloat(batch.estimatedSalePriceHigh || "0").toFixed(0)}`}
            roi={roi}
            duration={durationMonths(batch.startDate, batch.endDate)}
            progress={progress}
            unitsLeft={Math.max(0, batch.totalUnits - investorCount)}
            status={batch.status === "OPEN" ? "Open" : "Active"}
            statusColor={sColor}
            progressColor={sColor}
            icon="paw"
            onPress={() => router.push(`/batch/${batch.id}` as any)}
          />
        );
      })}
    </>
  );
};

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  console.log("user", user);
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";

  const {
    data: response,
    refetch: refetchPurchases,
    isFetching: isFetchingPurchases,
  } = useGetPurchasesQuery();
  const { refetch: refetchBatches, isFetching: isFetchingBatches } =
    useGetBatchesQuery();

  const onRefresh = React.useCallback(() => {
    refetchPurchases();
    refetchBatches();
  }, [refetchPurchases, refetchBatches]);

  const purchases = response?.data || [];
  const confirmedPurchases = purchases.filter(
    (p: any) => p.status === "CONFIRMED",
  );

  const totalValue = confirmedPurchases.reduce((sum: number, p: any) => {
    return (
      sum +
      p.units *
        (parseFloat(p.batch?.animalPrice || "0") +
          parseFloat(p.batch?.serviceFee || "0"))
    );
  }, 0);

  const unrealizedGains = confirmedPurchases.reduce((sum: number, p: any) => {
    const cost =
      p.units *
      (parseFloat(p.batch?.animalPrice || "0") +
        parseFloat(p.batch?.serviceFee || "0"));
    const estimatedEndValue =
      p.units * parseFloat(p.batch?.estimatedSalePriceLow || "0");
    return sum + Math.max(0, estimatedEndValue - cost);
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Custom Header ────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require("../../assets/images/user-avatar.webp")}
              style={styles.avatar}
            />
            <View style={styles.statusDot} />
          </View>
          <View>
            <AppText variant="caption" color={Colors.textSecondary}>
              Welcome back,
            </AppText>
            <AppText variant="body" style={styles.userName}>
              {fullName}
            </AppText>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.white}
          />
          <View style={styles.redDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl
            refreshing={isFetchingPurchases || isFetchingBatches}
            onRefresh={onRefresh}
            tintColor={Colors.emerald}
            colors={[Colors.emerald]}
          />
        }
      >
        {/* ── Summary ───────────────────────────────────────────────────── */}
        <SummaryCard
          totalValue={totalValue}
          unrealizedGains={unrealizedGains}
        />

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <View style={styles.actionsRow}>
          <ActionButton label="Deposit" icon="add" onPress={() => {}} />
          <ActionButton
            label="Withdraw"
            icon="wallet-outline"
            onPress={() => {}}
          />
          <ActionButton
            label="History"
            icon="time-outline"
            onPress={() => {}}
          />
          <ActionButton
            label="Reports"
            icon="bar-chart-outline"
            onPress={() => {}}
          />
        </View>

        {/* ── Available Batches ─────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <AppText variant="h2" style={{ fontSize: 18 }}>
            Available Batches
          </AppText>
          <TouchableOpacity onPress={() => router.push("/marketplace")}>
            <AppText variant="body" color={Colors.emerald}>
              View All
            </AppText>
          </TouchableOpacity>
        </View>

        <TopBatchesList />

        {/* ── Market Insights ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <AppText variant="h2" style={{ fontSize: 18 }}>
            Market Insights
          </AppText>
        </View>

        <InsightCard />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

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
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.emerald,
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.emerald,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: Colors.surfaceElevated,
  },
  scrollBody: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
});

export default HomeScreen;
