import { currencyConfig } from '../config/currency.config';

/**
 * Formats a number as a currency string.
 * @param {number} amount - The amount to format.
 * @param {boolean} [showSymbol=true] - Whether to show the currency symbol.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, showSymbol = true) => {
    if (amount === undefined || amount === null) return '';
    
    // Ensure amount is a number
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return amount;

    const formattedNumber = numAmount.toLocaleString(currencyConfig.locale, {
        minimumFractionDigits: currencyConfig.decimals,
        maximumFractionDigits: currencyConfig.decimals,
    });

    return showSymbol ? `${currencyConfig.symbol} ${formattedNumber}` : formattedNumber;
};

/**
 * Formats a number as a currency string with the code (e.g., "BDT 1,234.00").
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrencyWithCode = (amount) => {
    if (amount === undefined || amount === null) return '';

     // Ensure amount is a number
     const numAmount = Number(amount);
     if (isNaN(numAmount)) return amount;

    const formattedNumber = numAmount.toLocaleString(currencyConfig.locale, {
        minimumFractionDigits: currencyConfig.decimals,
        maximumFractionDigits: currencyConfig.decimals,
    });

    return `${currencyConfig.code} ${formattedNumber}`;
};
