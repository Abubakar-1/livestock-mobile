import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
import { AppText } from '../../src/components/ui';
import { BatchCard } from '../../src/components/Dashboard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetBatchesQuery, useGetAnimalTypesQuery } from '../../src/features/marketplace/marketplaceApi';



// Map HealthStatus to a color
const healthColor: Record<string, string> = {
  EXCELLENT: Colors.emerald,
  GOOD: Colors.emerald,
  MONITORING: Colors.gold || '#FFB800',
  CRITICAL: '#EF4444',
  COMING_SOON: Colors.gold || '#FFB800',
};

// Map BatchStatus to a display string
const statusLabel: Record<string, string> = {
  OPEN: 'Open',
  FULL: 'Sold Out',
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  COMPLETED: 'Completed',
  COMING_SOON: 'Coming Soon',
};

function durationLabel(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "0";
  const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)));
  if (days < 60) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }
  const months = Math.max(1, Math.round(days / 30));
  return `${months} ${months === 1 ? "month" : "months"}`;
}

const unitCost = (batch: any) =>
  parseFloat(batch?.animalPrice || "0") +
  parseFloat(batch?.feedingFee || "0") +
  parseFloat(batch?.medicationFee || "0");

// Calculate a simple "funded" percentage based on units purchased vs totalUnits
function fundedPercent(batch: any): number {
  const invested = batch._count?.investments
    ? batch.investments?.reduce((a: number, inv: any) => a + (inv.units || 0), 0)
    : 0;
  return batch.totalUnits > 0
    ? Math.min(100, Math.round((invested / batch.totalUnits) * 100))
    : 0;
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: batchesResponse, isLoading: isLoadingBatches, refetch: refetchBatches, isFetching: isFetchingBatches } = useGetBatchesQuery();
  const { data: animalTypesResponse, refetch: refetchTypes, isFetching: isFetchingTypes } = useGetAnimalTypesQuery();
  
  const onRefresh = React.useCallback(() => {
    refetchBatches();
    refetchTypes();
  }, [refetchBatches, refetchTypes]);
  
  const batches: any[] = batchesResponse?.data || [];
  const animalTypes: any[] = animalTypesResponse?.data || [];
  
  // Use all animal types from the DB
  const dynamicCategories = ['All', ...animalTypes.map(type => type.name).filter(Boolean)];

  const now = new Date();

  const available = batches.filter((b) => {
    const matchesSearch =
      !searchQuery ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.animalType?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' ||
      b.animalType?.name?.toLowerCase().includes(activeCategory.toLowerCase());

    return matchesSearch && matchesCategory && b.status !== 'DRAFT' && (b.status === 'OPEN' || b.status === 'ACTIVE');
  });

  const closed = batches.filter((b) => {
    const matchesSearch =
      !searchQuery ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.animalType?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' ||
      b.animalType?.name?.toLowerCase().includes(activeCategory.toLowerCase());

    return matchesSearch && matchesCategory && b.status !== 'DRAFT' && (b.status === 'FULL' || b.status === 'COMPLETED' || b.status === 'COMING_SOON');
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <AppText variant="h1">Marketplace</AppText>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ──────────────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput
            placeholder="Search batches..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {dynamicCategories.map((cat: any) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <AppText
                variant="bodySmall"
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Batch List ──────────────────────────────────────────────────── */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetchingBatches || isFetchingTypes}
            onRefresh={onRefresh}
            tintColor={Colors.emerald}
            colors={[Colors.emerald]}
          />
        }
        contentContainerStyle={styles.listContent}
      >
        <AppText variant="h3" style={styles.sectionTitle}>
          Available Batches
        </AppText>

        {isLoadingBatches ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.emerald} />
            <AppText
              variant="bodySmall"
              color={Colors.textMuted}
              style={{ marginTop: Spacing.md }}
            >
              Loading live batches...
            </AppText>
          </View>
        ) : available.length === 0 && closed.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={48} color={Colors.textMuted} />
            <AppText
              variant="body"
              color={Colors.textMuted}
              style={{ marginTop: Spacing.md, textAlign: 'center' }}
            >
              {searchQuery
                ? 'No batches match your search.'
                : 'No batches are currently open.'}
            </AppText>
          </View>
        ) : (
          <>
            {available.map((batch) => {
              const investorCount = batch._count?.investments || 0;
              const progress = batch.totalUnits > 0 
                ? Math.min(100, Math.round((investorCount / batch.totalUnits) * 100)) 
                : 0;

              const cost = unitCost(batch);
              const roi =
                batch.estimatedSalePriceLow && batch.estimatedSalePriceHigh && cost > 0
                  ? `${(((parseFloat(batch.estimatedSalePriceLow) - cost) / cost) * 100).toFixed(0)}% - ${(((parseFloat(batch.estimatedSalePriceHigh) - cost) / cost) * 100).toFixed(0)}%`
                  : 'N/A';
              const sColor = healthColor[batch.healthStatus] || Colors.emerald;
              const location = batch.batchFarms?.[0]?.farm?.location || 'Multiple Farms';
              const campaignEnd = batch.campaignEndDate 
                ? new Date(batch.campaignEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : null;

              return (
                <BatchCard
                  key={batch.id}
                  title={batch.name}
                  location={location}
                  price={cost.toFixed(0)}
                  estReturn={`${parseFloat(batch.estimatedSalePriceLow || '0').toFixed(0)} - ${parseFloat(batch.estimatedSalePriceHigh || '0').toFixed(0)}`}
                  roi={roi}
                  duration={durationLabel(batch.startDate, batch.endDate)}
                  progress={progress}
                  unitsLeft={Math.max(0, batch.totalUnits - investorCount)}
                  status={statusLabel[batch.status] || batch.status}
                  statusColor={batch.status === 'COMING_SOON' ? Colors.gold : sColor}
                  progressColor={batch.status === 'COMING_SOON' ? Colors.gold : sColor}
                  icon={batch.status === 'COMING_SOON' ? "calendar-outline" : "paw"}
                  campaignEnd={campaignEnd}
                  onPress={() => batch.status !== 'COMING_SOON' && router.push(`/batch/${batch.id}` as any)}
                />
              );
            })}

            {closed.length > 0 && (
              <>
                <AppText variant="h3" style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
                  Closed Batches
                </AppText>
                {closed.map((batch) => {
                  const investorCount = batch._count?.investments || 0;
                  const progress = batch.totalUnits > 0 
                    ? Math.min(100, Math.round((investorCount / batch.totalUnits) * 100)) 
                    : 0;

                  const cost = unitCost(batch);
                  const roi =
                    batch.estimatedSalePriceLow && batch.estimatedSalePriceHigh && cost > 0
                      ? `${(((parseFloat(batch.estimatedSalePriceLow) - cost) / cost) * 100).toFixed(0)}% - ${(((parseFloat(batch.estimatedSalePriceHigh) - cost) / cost) * 100).toFixed(0)}%`
                      : 'N/A';
                  
                  return (
                    <BatchCard
                      key={batch.id}
                      title={batch.name}
                      location={batch.batchFarms?.[0]?.farm?.location || 'Multiple Farms'}
                      price={cost.toFixed(0)}
                      estReturn={`${parseFloat(batch.estimatedSalePriceLow || '0').toFixed(0)} - ${parseFloat(batch.estimatedSalePriceHigh || '0').toFixed(0)}`}
                      roi={roi}
                      duration={durationLabel(batch.startDate, batch.endDate)}
                      progress={progress}
                      unitsLeft={Math.max(0, batch.totalUnits - investorCount)}
                      status={batch.status === 'FULL' ? 'Sold Out' : 'Closed'}
                      statusColor={Colors.textMuted}
                      progressColor={Colors.textMuted}
                      icon="lock-closed"
                      isClosed={true}
                      onPress={() => router.push(`/batch/${batch.id}` as any)}
                    />
                  );
                })}
              </>
            )}
          </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    color: Colors.white,
    fontSize: 15,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryChipActive: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.emerald,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.textOnAccent,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
});
