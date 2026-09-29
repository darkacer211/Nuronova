/**
 * Precision mathematical utilities for NeuroNova Cognitive Reporting.
 * Computes normal distribution cumulative distribution function (CDF)
 * using the Abramowitz & Stegun (7.1.26) erf approximation.
 */

export function erf(x) {
  // A&S formula 7.1.26 (max error <= 1.5e-7)
  const sign = x >= 0 ? 1 : -1;
  const a = Math.abs(x);
  const p = 0.3275911;
  const t = 1.0 / (1.0 + p * a);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const y = 1.0 - poly * Math.exp(-a * a);
  return sign * y;
}

/**
 * Standard Normal Cumulative Distribution Function Phi(z)
 * Mean = 0, SD = 1
 */
export function standardNormalCdf(z) {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Cumulative Distribution Function for N(mean, sd)
 */
export function normalCdf(mean, sd, x) {
  if (sd <= 0) return x >= mean ? 1.0 : 0.0;
  const z = (x - mean) / sd;
  return standardNormalCdf(z);
}

/**
 * Compute clinical percentile rank calibrated to population baseline (Mean=75, SD=12)
 * Scaled 1.0 to 99.0, rounded to 1 decimal place.
 */
export function computePercentile(cpi, mean = 75.0, sd = 12.0) {
  const cdf = normalCdf(mean, sd, cpi);
  const percentile = Math.min(Math.max(cdf * 100.0, 1.0), 99.0);
  return Number(percentile.toFixed(1));
}

/**
 * Calculate trial-to-trial reaction time variability metrics:
 * - SDRT: sample standard deviation
 * - RTCV: coefficient of variation (SDRT / mean)
 */
export function computeRtVariability(rtArray) {
  if (!Array.isArray(rtArray) || rtArray.length < 2) {
    return {
      mean: rtArray?.[0] || 0,
      sd: 0,
      cv: 0,
      fastCount: 0,
      slowCount: 0,
    };
  }

  const n = rtArray.length;
  const mean = Math.round(rtArray.reduce((acc, v) => acc + v, 0) / n);
  const sumSqDiff = rtArray.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const variance = sumSqDiff / (n - 1);
  const sd = Number(Math.sqrt(variance).toFixed(1));
  const cv = mean > 0 ? Number((sd / mean).toFixed(3)) : 0;
  const fastCount = rtArray.filter((v) => v < 150).length;
  const slowCount = rtArray.filter((v) => v > 500).length;

  return {
    mean,
    sd,
    cv,
    fastCount,
    slowCount,
  };
}
