import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors, Radius, Spacing } from "../../constants/theme";
import { AppText } from "../ui";

/**
 * Action Button (Deposit, Withdraw, etc.)
 */
export const ActionButton = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionBtnContainer} onPress={onPress}>
    <View style={styles.actionIconWrapper}>
      <Ionicons name={icon} size={24} color={Colors.emerald} />
    </View>
    <AppText variant="caption" style={styles.actionLabel}>
      {label}
    </AppText>
  </TouchableOpacity>
);

/**
 * Summary Card (Total Assets Value)
 */
export const SummaryCard = ({
  totalValue = 0,
  unrealizedGains = 0,
}: {
  totalValue?: number;
  unrealizedGains?: number;
}) => (
  <View style={styles.summaryCard}>
    <View style={styles.summaryHeader}>
      <AppText variant="bodySmall" color={Colors.textSecondary}>
        Total Assets Value
      </AppText>
      <View style={styles.trendBadge}>
        <Ionicons name="trending-up" size={14} color={Colors.emerald} />
        <AppText
          variant="caption"
          color={Colors.emerald}
          style={{ marginLeft: 4, fontWeight: "700" }}
        >
          {totalValue > 0
            ? `+${((unrealizedGains / totalValue) * 100).toFixed(2)}%`
            : "0.00%"}
        </AppText>
      </View>
    </View>

    <AppText variant="h1" style={styles.totalAmount}>
      ₦{totalValue.toLocaleString()}
    </AppText>

    <View style={styles.statsList}>
      <View style={styles.statsListItem}>
        <AppText variant="caption" color={Colors.textSecondary}>
          ESTIMATED MATURITY VALUE
        </AppText>
        <AppText
          variant="h3"
          color={Colors.white}
          style={{ fontWeight: "700", marginTop: 2 }}
        >
          ₦{(totalValue + unrealizedGains).toLocaleString()}
        </AppText>
      </View>

      <View
        style={[
          styles.statsListItem,
          {
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.05)",
            paddingTop: 12,
            marginTop: 12,
          },
        ]}
      >
        <AppText variant="caption" color={Colors.textSecondary}>
          TOTAL PROFIT/LOSS
        </AppText>
        <AppText
          variant="h3"
          color={Colors.emerald}
          style={{ fontWeight: "700", marginTop: 2 }}
        >
          +₦{unrealizedGains.toLocaleString()}
        </AppText>
      </View>
    </View>
  </View>
);

/**
 * Batch Card
 */
export const BatchCard = ({
  title,
  location,
  price,
  roi,
  estReturn,
  duration,
  progress,
  unitsLeft,
  status,
  statusColor,
  progressColor,
  icon,
  campaignEnd,
  isClosed,
  onPress,
}: any) => (
  <TouchableOpacity
    style={[styles.batchCard, isClosed && { opacity: 0.6 }]}
    onPress={onPress}
    activeOpacity={isClosed ? 0.8 : 0.7}
  >
    <View style={styles.batchHeader}>
      <View
        style={[
          styles.batchIconWrapper,
          {
            backgroundColor: isClosed
              ? "rgba(255,255,255,0.05)"
              : "rgba(255, 184, 0, 0.1)",
          },
        ]}
      >
        <Ionicons
          name={isClosed ? "lock-closed" : icon}
          size={20}
          color={
            isClosed
              ? Colors.textMuted
              : statusColor === Colors.emerald
                ? Colors.emerald
                : "#FFB800"
          }
        />
      </View>
      <View style={styles.batchTitleWrapper}>
        <AppText
          variant="body"
          style={[styles.batchTitle, isClosed && { color: Colors.textMuted }]}
        >
          {title}
        </AppText>
        <View style={styles.locationWrapper}>
          <Ionicons
            name="location-outline"
            size={12}
            color={Colors.textMuted}
          />
          <AppText
            variant="caption"
            color={Colors.textMuted}
            style={{ marginLeft: 2 }}
          >
            {location}
          </AppText>
        </View>
      </View>
      <View style={styles.headerRight}>
        {!isClosed && campaignEnd && (
          <View style={styles.campaignEndBadge}>
            <Ionicons name="time-outline" size={10} color={Colors.emerald} />
            <AppText
              variant="caption"
              color={Colors.emerald}
              style={{ fontSize: 9, marginLeft: 2, fontWeight: "700" }}
            >
              ENDS {campaignEnd}
            </AppText>
          </View>
        )}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: "rgba(0, 0, 0, 0.2)" },
          ]}
        >
          <AppText
            variant="caption"
            color={isClosed ? Colors.textMuted : statusColor}
          >
            {status}
          </AppText>
        </View>
      </View>
    </View>

    <View style={styles.batchDetailsList}>
      <View style={styles.batchDetailRow}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption" color={Colors.textMuted}>
            BUY PRICE
          </AppText>
          <AppText
            variant="h3"
            style={[
              styles.batchDetailValue,
              isClosed && { color: Colors.textMuted },
            ]}
          >
            ₦{Number(price).toLocaleString()}
          </AppText>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <AppText variant="caption" color={Colors.textMuted}>
            DURATION
          </AppText>
          <AppText
            variant="h3"
            style={[
              styles.batchDetailValue,
              isClosed && { color: Colors.textMuted },
            ]}
          >
            {duration} Months
          </AppText>
        </View>
      </View>

      <View style={styles.batchDetailRow}>
        <View style={{ flex: 1 }}>
          <AppText variant="caption" color={Colors.textMuted}>
            ESTIMATED SALE PRICE
          </AppText>
          <AppText
            variant="h2"
            color={isClosed ? Colors.textMuted : Colors.emerald}
            style={[styles.batchDetailValue, { fontSize: 20 }]}
          >
            ₦
            {estReturn
              ? estReturn
                  .split(" - ")
                  .map((v: string) => Number(v).toLocaleString())
                  .join(" - ")
              : "---"}
          </AppText>
          {!isClosed && (
            <View style={styles.roiBadge}>
              <AppText
                variant="caption"
                color={Colors.emerald}
                style={{ fontWeight: "800", fontSize: 10 }}
              >
                +{roi} PROFIT
              </AppText>
            </View>
          )}
        </View>
      </View>
    </View>

    <View style={styles.progressContainer}>
      <View style={styles.progressLabelRow}>
        <AppText variant="caption" color={Colors.textMuted}>
          {progress}% Funded
        </AppText>
        <AppText variant="caption" color={Colors.textMuted}>
          {unitsLeft} Units Left
        </AppText>
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progress}%`,
              backgroundColor: isClosed ? Colors.textMuted : progressColor,
            },
          ]}
        />
      </View>
    </View>
  </TouchableOpacity>
);

/**
 * Insight Card
 */
export const InsightCard = () => (
  <TouchableOpacity style={styles.insightCard}>
    <Image
      source={require("../../../assets/images/insight-beef.png")}
      style={styles.insightImage}
    />
    <View style={styles.insightOverlay}>
      <View style={styles.trendLabel}>
        <AppText
          variant="label"
          color={Colors.emerald}
          style={{ fontSize: 10 }}
        >
          TREND REPORT
        </AppText>
      </View>
      <AppText variant="body" style={styles.insightTitle}>
        Global Demand for Sustainable Beef Rises in Q3
      </AppText>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Action Button
  actionBtnContainer: {
    alignItems: "center",
    width: 70,
  },
  actionIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.1)",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalAmount: {
    fontSize: 32,
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  // Batch Card
  batchCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  batchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  batchIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  batchTitleWrapper: {
    flex: 1,
  },
  batchTitle: {
    color: Colors.white,
    fontWeight: "600",
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  campaignEndBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statsList: {
    marginTop: Spacing.md,
  },
  statsListItem: {
    paddingVertical: 4,
  },
  batchDetailsList: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    gap: Spacing.lg,
  },
  batchDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  batchDetailValue: {
    fontWeight: "800",
    marginTop: 4,
    color: Colors.white,
    fontSize: 18,
  },
  roiBadge: {
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  progressContainer: {},
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Insight Card
  insightCard: {
    height: 180,
    borderRadius: Radius.xl,
    overflow: "hidden",
    marginTop: Spacing.md,
  },
  insightImage: {
    width: "100%",
    height: "100%",
  },
  insightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    padding: Spacing.xl,
  },
  trendLabel: {
    backgroundColor: "rgba(0,0,0,0.5)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  insightTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
