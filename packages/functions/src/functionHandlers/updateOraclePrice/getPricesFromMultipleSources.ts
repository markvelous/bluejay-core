/* eslint-disable no-restricted-globals */
import axios from "axios";
import { Static, Record, Array, Number, String, Boolean } from "runtypes";
import UserAgent from "user-agents";
import { config } from "../../config";
import { getLogger } from "../../common/logger";

const { error } = getLogger("create claim");

export const PriceDataYahooFinanceRT = Record({
  quoteResponse: Record({
    result: Array(
      Record({
        ask: Number,
        bid: Number,
        regularMarketPrice: Number,
        regularMarketTime: Number,
        shortName: String
      })
    )
  })
});

export type PriceDataYahooFinance = Static<typeof PriceDataYahooFinanceRT>;

export const priceFromYahooFinance = async () => {
  const url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=MMK=X";
  const response = await axios.get<PriceDataYahooFinance>(url);
  const data = PriceDataYahooFinanceRT.check(response.data);
  const quote = data.quoteResponse.result[0];
  if (!quote || quote.shortName !== "USD/MMK") throw new Error("Not USD/MMK");
  if (Math.abs(Date.now() / 1000 - quote.regularMarketTime) > 60 * 60 * 24 * 2)
    throw new Error("Excessive timeskew in price");
  return quote.regularMarketPrice;
};

export const PriceDataInvestingRT = Record({
  calculatedAmount: String,
  baserate1: String,
  baserate2: String
});
export type PriceDataInvesting = Static<typeof PriceDataInvestingRT>;

export const priceFromInvesting = async () => {
  const url =
    "https://www.investing.com/currencyconverter/service/RunConvert?fromCurrency=12&toCurrency=124&fromAmount=1&currencyType=1";
  const response = await axios.get<PriceDataInvesting>(url, {
    headers: { "x-requested-with": "XMLHttpRequest", "user-agent": new UserAgent().toString() }
  });

  const data = PriceDataInvestingRT.check(response.data);
  const rate = parseFloat(data.calculatedAmount);
  if (isNaN(rate)) throw new Error("Invalid rate");
  return rate;
};

export const PriceDataFixerRT = Record({
  success: Boolean,
  base: String,
  timestamp: Number,
  rates: Record({
    MMK: Number,
    USD: Number
  })
});
export type PriceDataFixer = Static<typeof PriceDataFixerRT>;

const getFixerKey = () => {
  const keys = config.apiKeys.fixerKeys;
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return randomKey;
};

export const priceFromFixer = async () => {
  const url = `http://data.fixer.io/api/latest?access_key=${getFixerKey()}&symbols=MMK,USD`;
  const response = await axios.get<PriceDataFixer>(url, {
    headers: { "user-agent": new UserAgent().toString() }
  });
  const data = PriceDataFixerRT.check(response.data);
  if (!data.success) throw new Error("Invalid response from fixer");
  const rate = data.rates.MMK / data.rates.USD;
  if (isNaN(rate)) throw new Error("Invalid rate");
  return rate;
};

export const getPricesFromMultipleSources = async () => {
  const sources = [
    { name: "FIXER", fn: priceFromFixer },
    { name: "INVESTING", fn: priceFromInvesting },
    { name: "YAHOO", fn: priceFromYahooFinance }
  ];
  const results: { source: string; rate: number }[] = await sources.reduce(async (accum, { name, fn }) => {
    try {
      const rate = await fn();
      return [...(await accum), { source: name, rate }];
    } catch (e) {
      error(e);
      return accum;
    }
  }, Promise.resolve([]) as Promise<{ source: string; rate: number }[]>);
  const sortedRates = results.sort((a, b) => a.rate - b.rate);
  const median = sortedRates[Math.floor(sortedRates.length / 2)];
  return {
    sources: sortedRates,
    median
  };
};
