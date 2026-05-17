export const fnToFixDp = (num: number, dp: number = 6): number =>
  parseFloat(num.toFixed(dp));
