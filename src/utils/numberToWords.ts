/**
 * Utility to convert numbers into Indian Rupee words
 * e.g. 25000 -> "Twenty Five Thousand Rupees Only"
 *      150000 -> "One Lakh Fifty Thousand Rupees Only"
 */

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertBelowThousand(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ONES[n % 10] : '');
  } else if (n > 0) {
    str += ONES[n];
  }
  return str.trim();
}

export function numberToWordsIndian(num: number | string): string {
  if (num === '' || num === null || num === undefined) return '';
  const parsed = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(parsed) || parsed < 0) return '';
  if (parsed === 0) return 'Zero Rupees Only';

  const integerPart = Math.floor(parsed);
  const decimalPart = Math.round((parsed - integerPart) * 100);

  let n = integerPart;
  let words = '';

  // Crores (>= 1,00,00,000)
  if (n >= 10000000) {
    const crores = Math.floor(n / 10000000);
    words += convertBelowThousand(crores) + ' Crore ';
    n %= 10000000;
  }

  // Lakhs (>= 1,00,000)
  if (n >= 100000) {
    const lakhs = Math.floor(n / 100000);
    words += convertBelowThousand(lakhs) + ' Lakh ';
    n %= 100000;
  }

  // Thousands (>= 1,000)
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    words += convertBelowThousand(thousands) + ' Thousand ';
    n %= 1000;
  }

  // Hundreds & Remaining (< 1,000)
  if (n > 0) {
    words += convertBelowThousand(n) + ' ';
  }

  words = words.trim() + ' Rupees';

  // Paise
  if (decimalPart > 0) {
    words += ' and ' + convertBelowThousand(decimalPart) + ' Paise';
  }

  return words + ' Only';
}

