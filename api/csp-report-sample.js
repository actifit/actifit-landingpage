/**
 * Browsers send a CSP violation report for most page views that trip the policy
 * (third-party embeds, extensions), which made /api/csp-report one request in six.
 * The reports are only needed as a sample: this keeps `report-uri` on a fraction
 * of rendered pages (CSP_REPORT_SAMPLE, default 2%) and removes it from the rest.
 * The policy itself is unchanged on every page.
 *
 * Nuxt `render:beforeResponse` hook: it runs after Nuxt has set the CSP header and
 * before the response is sent.
 */

const DEFAULT_SAMPLE = 0.02;

function sampleRate(value = process.env.CSP_REPORT_SAMPLE) {
  const rate = Number(value);
  return value !== undefined && value !== '' && rate >= 0 && rate <= 1 ? rate : DEFAULT_SAMPLE;
}

function withoutReportUri(policy) {
  return policy.split(';').filter((d) => !/^\s*report-uri\b/i.test(d)).join(';');
}

function makeSampler(rate = sampleRate(), random = Math.random) {
  return function sampleCspReports(url, result, context) {
    const res = context && context.res;
    if (!res || typeof res.getHeader !== 'function' || random() < rate) return;
    for (const name of ['Content-Security-Policy-Report-Only', 'Content-Security-Policy']) {
      const value = res.getHeader(name);
      if (typeof value === 'string') res.setHeader(name, withoutReportUri(value));
    }
  };
}

module.exports = { makeSampler, withoutReportUri, sampleRate, sampleCspReports: makeSampler() };
