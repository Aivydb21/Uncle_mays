#!/usr/bin/env node
/**
 * Pull Stripe PaymentIntents for the last 7 days and calculate checkout conversion metrics
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load config
const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'stripe-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const SEVEN_DAYS_AGO = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
const TODAY_START = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

function stripeRequest(path, params = {}) {
  return new Promise((resolve, reject) => {
    const queryString = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const url = `/v1${path}${queryString ? '?' + queryString : ''}`;
    const auth = Buffer.from(`${config.api_key}:`).toString('base64');

    const options = {
      hostname: 'api.stripe.com',
      path: url,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).end();
  });
}

async function getAllPaymentIntents(since) {
  const intents = [];
  let startingAfter = null;

  while (true) {
    const params = {
      'created[gte]': since,
      limit: 100
    };

    if (startingAfter) {
      params.starting_after = startingAfter;
    }

    const resp = await stripeRequest('/payment_intents', params);
    const data = resp.data || [];
    intents.push(...data);

    if (!resp.has_more || data.length === 0) break;
    startingAfter = data[data.length - 1].id;
  }

  return intents;
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toISOString().split('T')[0];
}

function analyzeIntents(intents, startTimestamp) {
  const total = intents.filter(pi => pi.created >= startTimestamp);
  const succeeded = total.filter(pi => pi.status === 'succeeded');
  const failed = total.filter(pi => pi.status !== 'succeeded');

  const totalRevenue = succeeded.reduce((sum, pi) => sum + (pi.amount || 0), 0) / 100;
  const avgOrderValue = succeeded.length > 0 ? totalRevenue / succeeded.length : 0;

  const byDay = {};
  total.forEach(pi => {
    const day = formatDate(pi.created);
    if (!byDay[day]) byDay[day] = { total: 0, succeeded: 0 };
    byDay[day].total++;
    if (pi.status === 'succeeded') byDay[day].succeeded++;
  });

  return {
    total: total.length,
    succeeded: succeeded.length,
    failed: failed.length,
    conversionRate: total.length > 0 ? (succeeded.length / total.length * 100).toFixed(2) : '0.00',
    totalRevenue: totalRevenue.toFixed(2),
    avgOrderValue: avgOrderValue.toFixed(2),
    byDay
  };
}

async function main() {
  console.log('Pulling Stripe PaymentIntents for last 7 days...\n');

  const allIntents = await getAllPaymentIntents(SEVEN_DAYS_AGO);
  console.log(`Total PaymentIntents fetched: ${allIntents.length}\n`);

  // Overall 7-day stats
  const weekStats = analyzeIntents(allIntents, SEVEN_DAYS_AGO);

  // Today's stats
  const todayStats = analyzeIntents(allIntents, TODAY_START);

  // Print report
  console.log('='.repeat(70));
  console.log('CHECKOUT CONVERSION REPORT');
  console.log('='.repeat(70));
  console.log();

  console.log('TODAY (', formatDate(TODAY_START), ')');
  console.log('-'.repeat(70));
  console.log(`Checkout attempts:    ${todayStats.total}`);
  console.log(`Completed checkouts:  ${todayStats.succeeded}`);
  console.log(`Failed/Abandoned:     ${todayStats.failed}`);
  console.log(`Conversion Rate:      ${todayStats.conversionRate}%`);
  console.log(`Revenue:              $${todayStats.totalRevenue}`);
  console.log(`Avg Order Value:      $${todayStats.avgOrderValue}`);
  console.log();

  console.log('LAST 7 DAYS');
  console.log('-'.repeat(70));
  console.log(`Checkout attempts:    ${weekStats.total}`);
  console.log(`Completed checkouts:  ${weekStats.succeeded}`);
  console.log(`Failed/Abandoned:     ${weekStats.failed}`);
  console.log(`Conversion Rate:      ${weekStats.conversionRate}%`);
  console.log(`Revenue:              $${weekStats.totalRevenue}`);
  console.log(`Avg Order Value:      $${weekStats.avgOrderValue}`);
  console.log();

  console.log('DAILY BREAKDOWN (Last 7 Days)');
  console.log('-'.repeat(70));
  console.log('Date          Attempts  Completed  Failed  Conv. Rate');
  console.log('-'.repeat(70));

  const sortedDays = Object.keys(weekStats.byDay).sort().reverse();
  sortedDays.forEach(day => {
    const stats = weekStats.byDay[day];
    const rate = stats.total > 0 ? (stats.succeeded / stats.total * 100).toFixed(1) : '0.0';
    console.log(
      `${day}    ${String(stats.total).padStart(8)}  ${String(stats.succeeded).padStart(9)}  ${String(stats.total - stats.succeeded).padStart(6)}  ${String(rate).padStart(9)}%`
    );
  });

  console.log();
  console.log('='.repeat(70));
  console.log('Phase 1 Targets (from notes/digital-marketing-readiness-2026-05-04.md):');
  console.log('  Checkout completion rate: >15% (current: ' + weekStats.conversionRate + '%)');
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
