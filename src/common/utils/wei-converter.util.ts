/**
 * Wei Conversion Utility
 *
 * Utilities untuk convert antara amount bersih dan wei format untuk blockchain operations.
 * Database menyimpan amount dalam format bersih (e.g., "10000"),
 * tetapi blockchain memerlukan format wei (e.g., "10000000000000000000000").
 */

/**
 * Default token decimals (sama seperti ETH)
 */
export const DEFAULT_DECIMALS = 18;

/**
 * Convert amount bersih ke wei untuk blockchain operations
 *
 * @param amount - Amount bersih dalam string atau number (e.g., "10000" atau 10000)
 * @param decimals - Token decimals (default: 18)
 * @returns BigInt wei value untuk dikirim ke smart contract
 *
 * @example
 * toWei("10000") // Returns 10000000000000000000000n (10000 * 10^18)
 * toWei(5000, 18) // Returns 5000000000000000000000n
 */
export function toWei(amount: string | number, decimals: number = DEFAULT_DECIMALS): bigint {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  if (amountNum < 0) {
    throw new Error(`Amount cannot be negative: ${amount}`);
  }

  // Convert to string to handle decimal precision
  const amountStr = amountNum.toString();
  const [integerPart, decimalPart = ''] = amountStr.split('.');

  // Pad with zeros to reach desired decimals
  const paddedDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals);

  // Combine integer and decimal parts
  const weiStr = integerPart + paddedDecimal;

  return BigInt(weiStr);
}

/**
 * Convert wei dari blockchain ke amount bersih
 *
 * @param wei - Wei value sebagai bigint atau string
 * @param decimals - Token decimals (default: 18)
 * @returns Number amount bersih
 *
 * @example
 * fromWei(10000000000000000000000n) // Returns 10000
 * fromWei("5000000000000000000000") // Returns 5000
 */
export function fromWei(wei: bigint | string, decimals: number = DEFAULT_DECIMALS): number {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;

  if (weiValue < 0n) {
    throw new Error(`Wei value cannot be negative: ${wei}`);
  }

  const divisor = BigInt(10 ** decimals);
  const result = Number(weiValue) / Number(divisor);

  return result;
}

/**
 * Format amount bersih ke string untuk display/response
 *
 * @param amount - Amount dalam number atau string
 * @returns String representation
 *
 * @example
 * formatAmount(10000.5) // Returns "10000.5"
 * formatAmount("5000") // Returns "5000"
 */
export function formatAmount(amount: number | string): string {
  return typeof amount === 'number' ? amount.toString() : amount;
}
