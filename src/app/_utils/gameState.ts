// Constants
export const DEATH_COUNT_KEY = 'deathCount';
export const TOTAL_TIME_KEY = 'totalTime';

/**
 * Get the current death count from localStorage
 */
export const getDeathCount = (): number => {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(DEATH_COUNT_KEY) || '0');
};

/**
 * Increment the death count in localStorage
 */
export const incrementDeathCount = (): void => {
  const currentCount = getDeathCount();
  localStorage.setItem(DEATH_COUNT_KEY, (currentCount + 1).toString());
};

/**
 * Reset the death count to zero
 */
export const resetDeathCount = (): void => {
  localStorage.setItem(DEATH_COUNT_KEY, '0');
};