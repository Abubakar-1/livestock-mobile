function getConfirmedUnits(batch: any): number {
  const confirmedUnits = Number(batch?.confirmedUnits ?? batch?.purchasedUnits);
  if (Number.isFinite(confirmedUnits)) return confirmedUnits;

  if (Array.isArray(batch?.investments)) {
    return batch.investments.reduce(
      (sum: number, investment: any) =>
        investment?.status === "CONFIRMED"
          ? sum + Number(investment?.units || 0)
          : sum,
      0,
    );
  }

  return 0;
}

export function getAvailableUnits(batch: any): number {
  const availableUnits = Number(batch?.availableUnits);
  if (Number.isFinite(availableUnits)) return Math.max(0, availableUnits);

  return Math.max(0, Number(batch?.totalUnits || 0) - getConfirmedUnits(batch));
}

export function getFundedPercent(batch: any): number {
  const totalUnits = Number(batch?.totalUnits || 0);
  if (totalUnits < 1) return 0;

  return Math.min(100, Math.round((getConfirmedUnits(batch) / totalUnits) * 100));
}
