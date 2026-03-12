export const SIMULATION_CADENCE_LABEL = 'Review cycle';

export function formatReviewCycle(index: number) {
  return `${SIMULATION_CADENCE_LABEL} ${index + 1}`;
}

export function formatReviewCycleCount(count: number) {
  return `${count} ${count === 1 ? 'review cycle' : 'review cycles'}`;
}
