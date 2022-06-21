import { toast } from "react-toastify";
import { ethers } from 'ethers';
import APIProvider from "./APIProvider";
import balanceBundleABI from "lib/contracts/BalanceBundle.json";

export default class APIArbitrumProvider extends APIProvider {
  balanceBundleAddress = '0x1b7ad12c73b9fea574cd2320650676c0a0bde8a0';

  accountState = {};
  ethWallet = {};
  evmCompatible = true;
  zksyncCompatible = false;
  balances = {};

  getAccountState = async () => {
    return this.accountState;
  };

  getBalances = async () => {
    if (!this.accountState.address) return {};

    // allways get ETH - generate token list
    const tokens = this.getCurrencies();
    const tokenInfo = [{ decimals: 18, }];
    const tokenList = [ethers.constants.AddressZero];

    for(let i = 1; i < tokens.length; i++) {
      const token = tokens[i];

      tokenInfo.push(this.getCurrencyInfo(token));
      tokenList.push(tokenInfo[token].address);
    }

    // get token balance
    const ethContract = new ethers.Contract(
      this.balanceBundleAddress,
      balanceBundleABI,
      this.api.ethersProvider
    );
    const balanceList = await ethContract.balances(this.accountState.address, tokenList);

    // generate object
    for(let i = 0; i < tokens.length; i++) {
      const balance = balanceList[i];
      const token = tokens[i];
      const currencyInfo = tokenInfo[token];

      this.balances[tokens[i]] = {
        value: balance,
        valueReadable:
          (balance && currencyInfo && balance / 10 ** currencyInfo.decimals) ||
          0,
        allowance: 0,
      }
    }

    return this.balances;
  };

  settleOrderFill = (market, side, baseAmount, quoteAmount) => {
    const marketInfo = this.marketInfo[market];
    const [base, quote] = market.split('-');

    if(side === 's') {
      this.balances[base].valueReadable -= baseAmount;
      this.balances[quote].valueReadable += quoteAmount;
    } else {
      this.balances[base].valueReadable += baseAmount;
      this.balances[quote].valueReadable -= quoteAmount;
    }

    const newBaseAmountBn = ethers.utils.parseUnits(
      (this.balances[base].valueReadable).toFixed(marketInfo.baseAsset.decimals),
      marketInfo.baseAsset.decimals
    );
    const newQuoteAmountBn = ethers.utils.parseUnits(
      (this.balances[quote].valueReadable).toFixed(marketInfo.quoteAsset.decimals),
      marketInfo.quoteAsset.decimals
    );
    this.balances[base].value = newBaseAmountBn.toString();
    this.balances[quote].value = newQuoteAmountBn.toSTring();
  }
  
  submitOrder = async (product, side, price, baseAmount, quoteAmount) => {
      
  }

  signIn = async () => {
    console.log('signing in to arbitrum');
    this.ethWallet = this.api.ethersProvider.getSigner();

    const address = await this.ethWallet.getAddress();
    this.accountState.id = address;
    this.accountState.address = address;

    return this.accountState;
  }

  cacheMarketInfoFromNetwork = async (pairs) => {
  }
  getPairs = () => {
    return Object.keys(this.lastPrices);
  };

  getCurrencyInfo = (currency) => {
    const pairs = this.getPairs();
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const baseCurrency = pair.split("-")[0];
      const quoteCurrency = pair.split("-")[1];
      if (baseCurrency === currency && this.marketInfo[pair]) {
        return this.marketInfo[pair].baseAsset;
      } else if (quoteCurrency === currency && this.marketInfo[pair]) {
        return this.marketInfo[pair].quoteAsset;
      }
    }
    return null;
  };

  getCurrencies = () => {
    const tickers = new Set();
    for (let market in this.lastPrices) {
      tickers.add(this.lastPrices[market][0].split("-")[0]);
      tickers.add(this.lastPrices[market][0].split("-")[1]);
    }
    return [...tickers];
  };
}
