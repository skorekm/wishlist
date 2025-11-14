import { supabase } from "@/supabaseClient";

const POPULAR_CURRENCY_CODES = [
  'PLN', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
  'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'ZAR', 'TRY', 'BRL',
  'INR', 'KRW'
];

export async function getCurrencies() {
  const { data, error } = await supabase
    .from('currencies')
    .select('id, code, currency')
    .is('withdrawal_date', null)
    .order('code');
  
  if (error) {
    throw error;
  }
  
  const seen = new Set<string>();
  const uniqueCurrencies = data.filter(currency => {
    if (seen.has(currency.code)) {
      return false;
    }
    seen.add(currency.code);
    return true;
  });
  
  const currencyOptions = uniqueCurrencies.map((currency) => ({
    value: String(currency.id),
    label: `${currency.code} (${currency.currency})`,
    code: currency.code,
    isPopular: POPULAR_CURRENCY_CODES.includes(currency.code)
  }));

  return currencyOptions.sort((a, b) => {
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    return a.code.localeCompare(b.code);
  });
}

