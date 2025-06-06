// Helper function to format price based on currency
export const getPriceFormat = (amount, currency) => {
    const currenciesWithSubunits = ["usd", "eur", "cad", "gbp", "aud"];
    const normalizedCurrency = currency.toLowerCase();
    const divisor = currenciesWithSubunits.includes(normalizedCurrency) ? 100 : 1;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: normalizedCurrency.toUpperCase(),
    }).format(amount / divisor);
};

// Helper function for currency conversion
export function convertFromUSD(amount, toCurrency) {
    if (toCurrency.toLowerCase() === "usd") {
        return amount;
    }
    
    const exchangeRates = {
        eur: 0.93,
        cad: 1.36,
        xof: 610,
    };

    const rate = exchangeRates[toCurrency.toLowerCase()];

    if (!rate) {
        console.warn(`Exchange rate for ${toCurrency} not found. Defaulting to 1.`);
        return amount;
    }

    return amount * rate;
}

// Helper function to create price range objects
export const createRange = (currency, lt = null, gt = null) => {
    if (!currency && lt === null && gt === null) {
        return {};
    }

    const obj = {};
    const convertedLt = convertFromUSD(lt ?? 0, currency);
    const convertedGt = gt !== null ? convertFromUSD(gt, currency) : undefined;

    obj.value = `${convertedLt}-${convertedGt !== undefined ? convertedGt : ""}`;
    obj.lt = convertedLt;
    if (convertedGt !== undefined) {
        obj.gt = convertedGt;
    }

    obj.name = `${convertedLt === 0 ? "Under" : getPriceFormat(convertedLt, currency)} ${convertedGt === undefined ? "and Up" : ` - ${getPriceFormat(convertedGt, currency)}`}`;
    return obj;
};

// Helper function to load predefined price ranges
export const priceRangeFilterLoad = (regionObj) => {
    const ranges = {
        usd: [
            createRange("usd", null, 24.99),
            createRange("usd", 25, 49.99),
            createRange("usd", 50, 99.99),
            createRange("usd", 100)
        ],
        cad: [
            createRange("cad", null, 24.99),
            createRange("cad", 25, 49.99),
            createRange("cad", 50, 99.99),
            createRange("cad", 100)
        ],
        eur: [
            createRange("eur", null, 24.99),
            createRange("eur", 25, 49.99),
            createRange("eur", 50, 99.99),
            createRange("eur", 100)
        ],
        xof: [
            createRange("xof", null, 24.99),
            createRange("xof", 25, 49.99),
            createRange("xof", 50, 99.99),
            createRange("xof", 100)
        ],
    };
    
    return ranges[regionObj?.currency_code?.toLowerCase()] || [];
};