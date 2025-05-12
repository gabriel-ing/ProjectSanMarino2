export const targetDistance = 1137;
export const startDate = new Date(2025, 4, 1);
export const targetDate = new Date(2025, 8, 1);
export const targetElevation = targetDistance * 10;

export const nDays = Math.ceil((targetDate - startDate) / (1000 * 3600 * 24));

export const currentDay = Math.ceil(
  (new Date() - startDate) / (1000 * 3600 * 24)
);

