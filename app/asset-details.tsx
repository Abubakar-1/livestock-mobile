import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useGetPurchaseByIdQuery, useGetPurchasesQuery, useCancelPurchaseMutation } from '../src/features/marketplace/marketplaceApi';
import { useGetBankDetailsQuery } from '../src/features/bank-details/bankDetailsApi';
import { ActivityIndicator } from 'react-native';
import { Colors, Spacing, Radius } from '../src/constants/theme';
import { AppText, Button } from '../src/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AssetDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: purchaseResponse, isLoading: isPurchaseLoading } = useGetPurchaseByIdQuery(id as string);
  const { data: allPurchasesResponse, isLoading: isAllLoading } = useGetPurchasesQuery();
  const { data: bankResponse } = useGetBankDetailsQuery();
  const [cancelPurchase, { isLoading: isCancelling }] = useCancelPurchaseMutation();
  
  const purchase = purchaseResponse?.data;
  const batch = purchase?.batch;
  const allPurchases = allPurchasesResponse?.data || [];
  const bankDetails = bankResponse?.data;

  const totalUnits = React.useMemo(() => {
    if (!batch) return 0;
    return allPurchases
      .filter((p: any) => p.batchId === batch.id && p.status === 'CONFIRMED')
      .reduce((sum: number, p: any) => sum + p.units, 0);
  }, [allPurchases, batch]);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              await cancelPurchase(id as string).unwrap();
              Alert.alert("Success", "Order cancelled successfully");
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.data?.message || "Failed to cancel order");
            }
          }
        }
      ]
    );
  };

  if (isPurchaseLoading || isAllLoading || !purchase) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.emerald} />
      </View>
    );
  }

  const isPending = purchase.status === 'PENDING';
  const isCancelled = purchase.status === 'CANCELLED';
  const isConfirmed = purchase.status === 'CONFIRMED';
  
  const costPerUnit = parseFloat(batch.animalPrice) + parseFloat(batch.serviceFee);
  const purchaseAmount = purchase.units * costPerUnit;

  const marketValueLow = (isConfirmed ? totalUnits : purchase.units) * parseFloat(batch.estimatedSalePriceLow);
  const marketValueHigh = (isConfirmed ? totalUnits : purchase.units) * parseFloat(batch.estimatedSalePriceHigh);
  const marketValueRange = `${marketValueLow.toLocaleString()} - ${marketValueHigh.toLocaleString()}`;
  
  const currentValLow = parseFloat(String(batch.currentMarketValueLow || "0"));
  const currentValHigh = parseFloat(String(batch.currentMarketValueHigh || "0"));
  const currentMarketValueRange = currentValLow > 0 
    ? `${(currentValLow * (isConfirmed ? totalUnits : purchase.units)).toLocaleString()} - ${(currentValHigh * (isConfirmed ? totalUnits : purchase.units)).toLocaleString()}`
    : null;

  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);
  const today = new Date();
  
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const daysElapsed = Math.max(0, (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const progressPercent = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
  
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));
  const weeksRemaining = Math.ceil(daysRemaining / 7);

  const healthColor = {
    EXCELLENT: Colors.emerald,
    GOOD: '#48BB78',
    MONITORING: Colors.gold,
    CRITICAL: '#F56565',
  };

  const currentHealthColor = healthColor[batch.healthStatus as keyof typeof healthColor] || Colors.emerald;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <AppText variant="h3">Order Details</AppText>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Status Banner ────────────────────────────────────────────── */}
        <View style={[
          styles.statusBanner, 
          isPending && styles.statusPending,
          isCancelled && styles.statusCancelled,
          isConfirmed && styles.statusConfirmed
        ]}>
          <Ionicons 
            name={isPending ? "time" : isCancelled ? "close-circle" : "checkmark-circle"} 
            size={20} 
            color={isPending ? "#F59E0B" : isCancelled ? "#EF4444" : Colors.emerald} 
          />
          <AppText style={[
            styles.statusText, 
            { color: isPending ? "#F59E0B" : isCancelled ? "#EF4444" : Colors.emerald }
          ]}>
            STATUS: {purchase.status}
          </AppText>
        </View>

        {/* ── Asset Card ────────────────────────────────────────────────── */}
        <View style={styles.assetCard}>
          <Image 
            source={require('../assets/images/boer-goat-banner.png')} 
            style={styles.assetImage} 
          />
          <View style={styles.assetInfo}>
            <View style={styles.badge}>
              <AppText variant="label" style={styles.badgeText}>{batch.animalType?.name?.toUpperCase() || 'LIVESTOCK'}</AppText>
            </View>
            <AppText variant="h2" style={styles.assetTitle}>{batch.name}{"\n"}Batch #{batch.id.substring(0, 4).toUpperCase()}</AppText>
            <AppText variant="caption" color={Colors.textSecondary}>Order Date: {new Date(purchase.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</AppText>
          </View>
        </View>

        {/* ── Pending Payment Section ───────────────────────────────────── */}
        {isPending && (
          <View style={styles.section}>
            <AppText variant="h3" style={styles.sectionTitle}>Complete Your Payment</AppText>
            <View style={styles.paymentCard}>
              <AppText variant="bodySmall" color={Colors.textSecondary} style={{ marginBottom: 12 }}>
                Please transfer the total amount to the account below to confirm your purchase.
              </AppText>
              
              <View style={styles.bankDetailRow}>
                <AppText variant="caption" color={Colors.textMuted}>BANK NAME</AppText>
                <AppText variant="h3" style={styles.bankValue}>{bankDetails?.bankName || 'Loading...'}</AppText>
              </View>
              
              <View style={styles.bankDetailRow}>
                <AppText variant="caption" color={Colors.textMuted}>ACCOUNT NUMBER</AppText>
                <AppText variant="h3" style={styles.bankValue} selectable>{bankDetails?.accountNumber || 'Loading...'}</AppText>
              </View>
              
              <View style={styles.bankDetailRow}>
                <AppText variant="caption" color={Colors.textMuted}>ACCOUNT NAME</AppText>
                <AppText variant="h3" style={styles.bankValue}>{bankDetails?.accountName || 'Loading...'}</AppText>
              </View>

              <View style={[styles.bankDetailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <AppText variant="caption" color={Colors.textMuted}>TOTAL AMOUNT</AppText>
                <AppText variant="h2" color={Colors.emerald}>₦{purchaseAmount.toLocaleString()}</AppText>
              </View>
            </View>
            
            <Button 
              label={isCancelling ? "Cancelling..." : "Cancel Order"} 
              variant="outline" 
              onPress={handleCancel}
              style={{ marginTop: 16, borderColor: '#EF4444' }}
              labelStyle={{ color: '#EF4444' }}
              disabled={isCancelling}
            />
          </View>
        )}

        {/* ── Growth Stage (Only for Confirmed) ─────────────────────────── */}
        {isConfirmed && (
          <View style={styles.section}>
            <AppText variant="h3" style={styles.sectionTitle}>Maturity Progress</AppText>
            <View style={styles.card}>
              <View style={styles.maturityRow}>
                <AppText variant="body" style={{ fontWeight: '600', color: Colors.white }}>Stage</AppText>
                <AppText variant="body" color={Colors.emerald} style={{ fontWeight: '700' }}>{progressPercent}%</AppText>
              </View>
              
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={[Colors.emerald, '#00FFCC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                />
              </View>

              <View style={styles.timerRow}>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                <AppText variant="bodySmall" style={{ marginLeft: 8 }}>
                  {daysRemaining > 0 ? (
                    <>Ready for market in <AppText variant="bodySmall" style={{ color: Colors.white, fontWeight: '600' }}>{weeksRemaining} {weeksRemaining === 1 ? 'week' : 'weeks'}</AppText></>
                  ) : (
                    <AppText variant="bodySmall" style={{ color: Colors.emerald, fontWeight: '600' }}>Ready for Market</AppText>
                  )}
                </AppText>
              </View>
            </View>
          </View>
        )}

        {/* ── Estimated Value ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="h3" style={styles.sectionTitle}>Financial Outlook</AppText>
          </View>

          <View style={styles.card}>
            <View style={styles.valueHeaderRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={styles.valueLabel}>ORDER VALUE</AppText>
                <AppText variant="h2" style={styles.valueText}>₦{purchaseAmount.toLocaleString()}</AppText>
              </View>
              <View style={{ alignItems: 'flex-end', flex: 1, marginLeft: 8 }}>
                <AppText variant="caption" style={styles.valueLabel}>EST. MATURITY VALUE</AppText>
                <AppText variant="h2" color={Colors.emerald} style={[styles.valueText, { fontSize: 18 }]}>₦{marketValueRange}</AppText>
              </View>
            </View>

            {/* Range Bar */}
            <View style={styles.rangeBarBg}>
               <LinearGradient
                 colors={['#4A5568', Colors.emerald]}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 0 }}
                 style={[styles.rangeBarFill, { width: isConfirmed ? `${progressPercent}%` : '0%' }]}
               />
            </View>
            <View style={styles.chartXLabels}>
                <AppText variant="caption">Purchase</AppText>
                <AppText variant="caption">Target Maturity</AppText>
            </View>

            {currentMarketValueRange && (
              <View style={styles.currentValContainer}>
                <View style={styles.divider} />
                <View style={styles.currentValRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" color={Colors.textMuted}>CURRENT MARKET VALUE</AppText>
                    <AppText variant="h3" color={Colors.white}>₦{currentMarketValueRange}</AppText>
                  </View>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <AppText variant="caption" color={Colors.emerald} style={{ fontWeight: '700' }}>LIVE</AppText>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── Payout Summary (Only for Completed Batches) ─────────────────── */}
        {batch.status === 'COMPLETED' && (
          <View style={styles.section}>
            <AppText variant="h3" style={styles.sectionTitle}>Payout Summary</AppText>
            <View style={[styles.card, { borderColor: Colors.emerald, borderWidth: 1 }]}>
              <View style={styles.payoutHeader}>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" color={Colors.textMuted}>FINAL SALE PRICE</AppText>
                  <AppText variant="h2" color={Colors.white} numberOfLines={1} adjustsFontSizeToFit>
                    {batch.finalSalePrice ? `₦${Number(batch.finalSalePrice).toLocaleString()}` : 'Pending...'}
                  </AppText>
                </View>
                {purchase.payoutStatus === 'PAID' && (
                  <View style={styles.paidStamp}>
                    <Ionicons name="checkmark-done-circle" size={24} color={Colors.emerald} />
                    <AppText variant="label" color={Colors.emerald} style={{ marginLeft: 4 }}>PAID OUT</AppText>
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.payoutDetailRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" color={Colors.textMuted}>TOTAL PAYOUT</AppText>
                  <AppText variant="h1" color={purchase.payoutStatus === 'PAID' ? Colors.emerald : Colors.white} numberOfLines={1} adjustsFontSizeToFit>
                    {purchase.payoutAmount ? `₦${Number(purchase.payoutAmount).toLocaleString()}` : 'Calculating...'}
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="caption" color={Colors.textMuted}>STATUS</AppText>
                  <View style={[
                    styles.statusTag, 
                    { backgroundColor: purchase.payoutStatus === 'PAID' ? 'rgba(0, 255, 102, 0.1)' : 'rgba(245, 158, 11, 0.1)' }
                  ]}>
                    <AppText variant="label" color={purchase.payoutStatus === 'PAID' ? Colors.emerald : '#F59E0B'}>
                      {purchase.payoutStatus || 'AWAITING FINAL PRICE'}
                    </AppText>
                  </View>
                </View>
              </View>

              {purchase.paidAt && (
                <AppText variant="caption" color={Colors.textMuted} style={{ marginTop: 12, fontStyle: 'italic' }}>
                  Disbursed on {new Date(purchase.paidAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </AppText>
              )}
            </View>
          </View>
        )}

        {/* ── Stats Row ────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { marginRight: Spacing.md }]}>
            <View style={styles.statIconHeader}>
              <Ionicons name="apps-outline" size={20} color={Colors.emerald} />
              <AppText variant="label" style={{ marginLeft: 8 }}>UNITS</AppText>
            </View>
            <AppText variant="h3" style={styles.statValue}>{isConfirmed ? totalUnits : purchase.units} Units</AppText>
            <AppText variant="caption" color={Colors.textMuted}>{isConfirmed ? 'Consolidated' : 'Single Order'}</AppText>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconHeader}>
              <Ionicons name="medical-outline" size={20} color={currentHealthColor} />
              <AppText variant="label" style={{ marginLeft: 8 }}>HEALTH</AppText>
            </View>
            <AppText variant="h3" style={[styles.statValue, { color: currentHealthColor }]}>{batch.healthStatus}</AppText>
            <AppText variant="caption">Live tracking</AppText>
          </View>
        </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusConfirmed: {
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  assetCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  assetImage: {
    width: 100,
    height: 100,
    borderRadius: Radius.md,
  },
  assetInfo: {
    flex: 1,
    paddingLeft: Spacing.lg,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: Colors.emerald,
    fontSize: 10,
    fontWeight: '700',
  },
  assetTitle: {
    fontSize: 22,
    lineHeight: 26,
    marginBottom: 4,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  paymentCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.emeraldFaint,
  },
  bankDetailRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  bankValue: {
    marginTop: 4,
  },
  maturityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  valueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  valueLabel: {
    letterSpacing: 1,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 24,
    fontWeight: '700',
  },
  rangeBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  rangeBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartXLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 20,
    marginBottom: 4,
  },
  currentValContainer: {
    marginTop: Spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.lg,
  },
  currentValRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  payoutDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  paidStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.emerald,
  },
});

export default AssetDetailsScreen;
