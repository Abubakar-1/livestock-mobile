import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors, Radius, Spacing } from "../../constants/theme";
import { AppText } from "../ui";

/**
 * Total Portfolio Value Card
 */
export const PortfolioValueCard = ({
  value,
  trend,
}: {
  value: string;
  trend: string;
}) => (
  <View style={styles.statsCard}>
    <View style={styles.walletHeader}>
      <View style={styles.walletIconWrapper}>
        <Ionicons name="wallet-outline" size={24} color={Colors.emerald} />
      </View>
      <AppText
        variant="body"
        color={Colors.textSecondary}
        style={{ marginLeft: 12 }}
      >
        Total Portfolio Value
      </AppText>
    </View>

    <View style={styles.valueContainer}>
      <AppText variant="display" style={styles.statsValue}>
        ₦{value}
      </AppText>
      <View style={styles.trendBadge}>
        <Ionicons name="trending-up" size={14} color={Colors.emerald} />
        <AppText
          variant="caption"
          color={Colors.emerald}
          style={{ marginLeft: 4, fontWeight: "700" }}
        >
          {trend}{" "}

        </AppText>
      </View>
    </View>
  </View>
);

/**
 * Unrealized Gains Card
 */
export const UnrealizedGainsCard = ({
  value,
  progress,
}: {
  value: string;
  progress: number;
}) => (
  <View style={styles.statsCard}>
    <View style={styles.walletHeader}>
      <View style={styles.gainsIconWrapper}>
        <Ionicons name="trending-up" size={24} color={Colors.emerald} />
      </View>
      <AppText
        variant="body"
        color={Colors.textSecondary}
        style={{ marginLeft: 12 }}
      >
        Unrealized Gains
      </AppText>
    </View>

    <View style={styles.valueContainer}>
      <AppText
        variant="display"
        style={[styles.statsValue, { color: Colors.emerald }]}
      >
        +₦{value}
      </AppText>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
      <AppText
        variant="caption"
        color={Colors.textMuted}
        style={{ marginTop: 8 }}
      >
        {progress}% Growth achieved
      </AppText>
    </View>
  </View>
);

/**
 * Asset Card
 */
export const AssetCard = ({
  title,
  batch,
  qty,
  maturityDate,
  maturityValue,
  daysLeft,
  image,
  onPress,
  status,
}: any) => (
  <TouchableOpacity style={styles.assetCard} onPress={onPress}>
    <View style={styles.assetImageWrapper}>
      <Image source={image} style={styles.assetImage} />
      <View style={styles.batchTag}>
        <AppText variant="label" style={styles.batchTagText}>
          BATCH #{batch}
        </AppText>
      </View>
    </View>

    <View style={styles.assetInfo}>
      <View style={styles.assetTitleRow}>
        <AppText variant="h3" style={styles.assetTitle} numberOfLines={1}>
          {title}
        </AppText>
        <View style={styles.qtyBadge}>
          <AppText variant="caption" style={styles.qtyBadgeText}>
            Qty: {qty}
          </AppText>
        </View>
      </View>

      <View style={styles.maturityInfo}>
        <AppText
          variant="caption"
          color={Colors.white}
          style={{ fontSize: 10, letterSpacing: 0.5, marginBottom: 2 }}
        >
          EST. MATURITY VALUE
        </AppText>
        <AppText variant="h2" style={styles.maturityValueText}>
          ₦{maturityValue}
        </AppText>
      </View>

      <View style={styles.assetFooter}>
        <View style={styles.footerItem}>
          <Ionicons
            name="calendar-outline"
            size={12}
            color={Colors.textSecondary}
          />
          <AppText
            variant="caption"
            color={Colors.textSecondary}
            style={{ marginLeft: 4 }}
          >
            {maturityDate}
          </AppText>
        </View>
        <View style={styles.daysLeftBadge}>
          <Ionicons name="time-outline" size={12} color={Colors.gold} />
          <AppText
            variant="caption"
            color={Colors.gold}
            style={{ marginLeft: 4, fontWeight: "700" }}
          >
            {daysLeft}d left
          </AppText>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Stats Cards
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  valueContainer: {
    paddingLeft: 0,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: "flex-start",
  },
  walletIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  gainsIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    marginTop: Spacing.md,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.emerald,
    borderRadius: 3,
  },

  // Asset Card
  assetCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: "row",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  assetImageWrapper: {
    position: "relative",
  },
  assetImage: {
    width: 100,
    height: 100,
    borderRadius: Radius.lg,
  },
  batchTag: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  batchTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.white,
  },
  assetInfo: {
    flex: 1,
    paddingLeft: Spacing.md,
    justifyContent: "center",
  },
  assetTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  assetTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  qtyBadge: {
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.2)",
  },
  qtyBadgeText: {
    color: Colors.emerald,
    fontWeight: "800",
    fontSize: 10,
  },
  maturityInfo: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 8,
    borderRadius: Radius.md,
    marginVertical: 8,
  },
  maturityValueText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.white,
  },
  assetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  daysLeftBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 184, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
});
