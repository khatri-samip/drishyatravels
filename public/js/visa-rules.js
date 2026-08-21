/**
 * Visa Rules Frontend Module
 * Handles loading and displaying visa rules from the API
 */

const API_BASE = '/DRISHYATRAVELS/backend/api';

/**
 * Fetch all published visa rules
 * @returns {Promise<Array>} Array of visa rules
 */
async function fetchVisaRules() {
  try {
    const response = await fetch(`${API_BASE}/visa-rules?status=published`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch visa rules');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('Could not load visa rules:', error);
    return [];
  }
}

/**
 * Fetch a single visa rule by country code
 * @param {string} countryCode - ISO 2-letter country code
 * @returns {Promise<Object|null>} The visa rule data or null if not found
 */
async function fetchVisaRule(countryCode) {
  try {
    const response = await fetch(`${API_BASE}/visa-rules/${encodeURIComponent(countryCode)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch visa rule');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.warn(`Could not load visa rule for "${countryCode}":`, error);
    return null;
  }
}

/**
 * Render the visa fee table from visa rules
 * Extracts unique fee tiers (15/30/90 days) from the rules
 * @param {string} tableSelector - CSS selector for the table body
 */
async function renderVisaFeeTable(tableSelector = '.visa-table tbody') {
  const tbody = document.querySelector(tableSelector);
  if (!tbody) return;

  const rules = await fetchVisaRules();

  // Build fee tiers from rules that have fees
  const feeTiers = [
    { duration: '15 Days', fee: 30 },
    { duration: '30 Days', fee: 50 },
    { duration: '90 Days', fee: 125 },
  ];

  // Use the first rule with a fee as reference (fees are uniform across most nationalities)
  const ruleWithFee = rules.find((r) => r.visa_fee_usd !== null);

  tbody.innerHTML = feeTiers
    .map(
      (tier) => `
      <tr>
        <td>${escapeHTML(tier.duration)}</td>
        <td>US$ ${ruleWithFee ? tier.fee : tier.fee}</td>
      </tr>
    `
    )
    .join('');
}

/**
 * Render a country-specific visa lookup widget
 * @param {string} selectSelector - CSS selector for the country select input
 * @param {string} resultSelector - CSS selector for the result container
 */
async function initVisaLookup(selectSelector, resultSelector) {
  const select = document.querySelector(selectSelector);
  const result = document.querySelector(resultSelector);
  if (!select || !result) return;

  const rules = await fetchVisaRules();

  // Populate the select options
  select.innerHTML =
    '<option value="">Select your country...</option>' +
    rules
      .map((r) => `<option value="${escapeHTML(r.country_code)}">${escapeHTML(r.country_name)}</option>`)
      .join('');

  select.addEventListener('change', async () => {
    const code = select.value;
    if (!code) {
      result.innerHTML = '';
      return;
    }

    const rule = await fetchVisaRule(code);
    if (!rule) {
      result.innerHTML = '<p>No visa information available for this country.</p>';
      return;
    }

    result.innerHTML = `
      <div class="visa-result">
        <h3>${escapeHTML(rule.country_name)}</h3>
        <p><strong>Visa required:</strong> ${rule.visa_required ? 'Yes' : 'No'}</p>
        ${rule.visa_on_arrival ? '<p><strong>Visa on arrival:</strong> Available</p>' : ''}
        ${rule.visa_free_days ? `<p><strong>Visa-free days:</strong> ${escapeHTML(String(rule.visa_free_days))}</p>` : ''}
        ${rule.visa_fee_usd ? `<p><strong>Visa fee:</strong> US$ ${escapeHTML(String(rule.visa_fee_usd))}</p>` : ''}
        ${rule.requirements ? `<p><strong>Requirements:</strong> ${escapeHTML(rule.requirements)}</p>` : ''}
        ${rule.notes ? `<p><strong>Notes:</strong> ${escapeHTML(rule.notes)}</p>` : ''}
        ${
          rule.official_url
            ? `<a href="${escapeHTML(rule.official_url)}" target="_blank" rel="noopener noreferrer">Official information →</a>`
            : ''
        }
      </div>
    `;
  });
}

// Export for use in other modules
window.VisaRules = {
  fetchVisaRules,
  fetchVisaRule,
  renderVisaFeeTable,
  initVisaLookup,
};