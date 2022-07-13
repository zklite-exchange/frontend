import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import useTheme from "components/hooks/useTheme";
import api from "lib/api";

import { DefaultTemplate } from "components";
import ConvertContianer from "./ConvertContianer";

import classNames from "classnames";
import TransactionSettings from "./TransationSettings";
import { Button } from "components/molecules/Button";

import { useCoinEstimator } from "components";
import { userSelector } from "lib/store/features/auth/authSlice";
import { setSlippageValue } from "lib/store/features/api/apiSlice";
import {
  networkSelector,
  balancesSelector,
  lastPricesSelector,
  currentMarketSelector,
  marketInfoSelector,
  liquiditySelector,
  setCurrentMarket,
  resetData,
  settingsSelector,
  userOrdersSelector,
  slippageValueSelector,
} from "lib/store/features/api/apiSlice";
import { formatPrice, formatUSD, formatToken } from "lib/utils";
import { LoadingSpinner } from "components/atoms/LoadingSpinner";

const ConvertPage = () => {
  const coinEstimator = useCoinEstimator();
  const userOrders = useSelector(userOrdersSelector);

  const { isDark } = useTheme();
  const [tType, setTtype] = useState("buy");

  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  const settings = useSelector(settingsSelector);
  const balanceData = useSelector(balancesSelector);
  const pairPrices = useSelector(lastPricesSelector);
  const liquidity = useSelector(liquiditySelector);
  const currentMarket = useSelector(currentMarketSelector);
  const network = useSelector(networkSelector);
  const marketInfo = useSelector(marketInfoSelector);
  const slippageValue = useSelector(slippageValueSelector);

  const [pairs, setGetPairs] = useState([]);
  const [sellTokenList, setSellTokenList] = useState([]);
  const [sellToken, setSellToken] = useState();
  const [buyToken, setBuyToken] = useState();
  const [basePrice, setBasePrice] = useState(0);
  const [loading, setLoading] = useState(false);
  // const [slippageValue, setSlippageValue] = useState(slippage);

  const [sellAmounts, setSellAmounts] = useState();
  const [buyAmounts, setBuyAmounts] = useState();

  const [balances, setBalances] = useState([]);

  const [orderButtonDisabled, setOrderButtonDisabled] = useState(false);
  const [errorMsg, setError] = useState("");

  const estimatedValueSell = sellAmounts * coinEstimator(sellToken?.name) || 0;
  const estimatedValueBuy = buyAmounts * coinEstimator(buyToken?.name) || 0;

  const zkBalances = useMemo(
    () => (balanceData[network] ? balanceData[network] : {}),
    [balanceData, network]
  );

  useEffect(() => {
    setSellTokenList([]);
    setGetPairs([]);
  }, [network]);

  useEffect(() => {
    setLoading(true);
    const timer = setInterval(() => {
      setSellTokenList(api.getCurrencies());
      setGetPairs(api.getPairs());
    }, 500);
    if (sellTokenList.length > 0) {
      clearInterval(timer);
      setLoading(false);
    }
    return () => {
      clearInterval(timer);
    };
  }, [sellTokenList, network, currentMarket]);

  useEffect(async () => {
    if (user.address !== undefined) {
      setBalances(zkBalances);
    }
  }, [user.address, zkBalances]);

  // useEffect(() => {
  //   // this could later be replaced by a better logic to pick a good pair
  //   switch (network) {
  //     case 1:
  //       setSellToken({ id: 0, name: "USDC" });
  //       dispatch(setCurrentMarket("ZZ-USDC"));
  //       break;
  //     case 1000:
  //       setSellToken({ id: 0, name: "USDC" });
  //       dispatch(setCurrentMarket("ETH-USDC"));
  //       break;
  //     case 42161:
  //       setSellToken({ id: 0, name: "USDC" });
  //       dispatch(setCurrentMarket("WETH-USDC"));
  //       break;
  //     default:
  //       setSellToken({ id: 0, name: "USDC" });
  //       dispatch(setCurrentMarket("ZZ-USDC"));
  //   }

  //   setSellTokenList(api.getCurrencies());
  //   setGetPairs(api.getPairs());
  //   document.title = "ZigZag Convert";
  // }, []);

  useEffect(() => {
    if (sellToken && buyToken) {
      const p_name = sellToken.name + "-" + buyToken.name;
      const r_p_name = buyToken.name + "-" + sellToken.name;
      let c = false;
      Object.keys(pairPrices).forEach((pair) => {
        if (pair === p_name) {
          setBasePrice(pairPrices[pair].price);
          const x = sellAmounts * pairPrices[pair].price;
          setBuyAmounts(x);
          setTtype("sell");
          dispatch(setCurrentMarket(p_name));
          c = true;
        }
      });
      if (c === false) {
        Object.keys(pairPrices).forEach((pair) => {
          if (pair === r_p_name) {
            setBasePrice(1 / pairPrices[pair].price);
            const x = (sellAmounts * 1) / pairPrices[pair].price;
            setBuyAmounts(x);
            setTtype("buy");
            dispatch(setCurrentMarket(r_p_name));
          }
        });
      }
    }
    isValid();
  }, [sellToken, buyToken]);

  useEffect(() => {
    if (user.address && !user.id) {
      toast.error(
        "Your zkSync account is not activated. Please use the bridge to deposit funds into zkSync and activate your zkSync wallet.",
        {
          autoClose: 60000,
        }
      );
    }
    const sub = () => {
      dispatch(resetData());
      api.subscribeToMarket(currentMarket, settings.showNightPriceChange);
    };

    if (api.ws && api.ws.readyState === 0) {
      api.on("open", sub);
    } else {
      sub();
    }

    return () => {
      if (api.ws && api.ws.readyState !== 0) {
        api.unsubscribeToMarket(currentMarket);
      } else {
        api.off("open", sub);
      }
    };
  }, [network, currentMarket, api.ws, settings.showNightPriceChange]);

  useEffect(()=>{
    isValid();
  }, [sellAmounts, buyAmounts])

  // useEffect(() => {
  //   setSellTokenList(api.getCurrencies());
  //   setGetPairs(api.getPairs());
  // }, [network]);

  const currentPrice = () => {
    var ladderPrice = getLadderPrice();
    return ladderPrice;
  };

  const getFirstAsk = () => {
    if (!marketInfo) return 0;
    const asks = liquidity.filter((l) => l[0] === "s").map((l) => l[1]);
    return formatPrice(Math.min(...asks));
  };

  const getFirstBid = () => {
    if (!marketInfo) return 0;
    const bids = liquidity.filter((l) => l[0] === "b").map((l) => l[1]);
    return formatPrice(Math.max(...bids));
  };

  const getLadderPrice = () => {
    if (!marketInfo) return 0;
    const side = tType === "buy" ? "b" : "s";
    let baseAmount = sellAmounts;
    if (!baseAmount) baseAmount = 0;

    let price,
      unfilled = baseAmount;
    if (side === "b") {
      const asks = liquidity.filter((l) => l[0] === "s");
      asks.sort((a, b) => a[1] - b[1]);
      for (let i = 0; i < asks.length; i++) {
        if (asks[i][2] >= unfilled || i === asks.length - 1) {
          price = asks[i][1];
          break;
        } else {
          unfilled -= asks[i][2];
        }
      }
    } else if (side === "s") {
      const bids = liquidity.filter((l) => l[0] === "b");

      bids.sort((a, b) => b[1] - a[1]);
      for (let i = 0; i < bids.length; i++) {
        if (bids[i][2] >= unfilled || i === bids.length - 1) {
          price = bids[i][1];
          break;
        } else {
          unfilled -= bids[i][2];
        }
      }
    }
    if (!price) return 0;
    return formatPrice(price);
  };

  const fromTokenOptions = useMemo(() => {
    if (sellTokenList.length > 0) {
      const p = sellTokenList.map((item, index) => {
        const price = balances[item]?.valueReadable
          ? `$ ${formatUSD(
              coinEstimator(item) * balances[item]?.valueReadable
            )}`
          : "";
        return {
          id: index,
          name: item,
          balance: balances[item]?.valueReadable
            ? formatToken(balances[item]?.valueReadable, item)
            : "0.0000000",
          price: price !== "" ? `${price}` : "$ 0.00",
        };
      });
      const s = p.sort((a, b) => {
        return (
          parseFloat(b.price.substring(1).replace(",", "")) -
          parseFloat(a.price.substring(1).replace(",", ""))
        );
      });
      if (!sellToken) {
        const f = s.find((item) => item.name === currentMarket.split("-")[1]);
        setSellToken(f);
      }

      return s;
    } else {
      return [];
    }
  }, [sellTokenList, balances]);

  const buyTokenOptions = useMemo(() => {
    const p = pairs.map((item) => {
      const a = item.split("-")[0];
      const b = item.split("-")[1];
      if (a === sellToken.name) {
        return b;
      } else if (b === sellToken.name) {
        return a;
      } else {
        return null;
      }
    });
    var filtered = p
      .filter(function (el) {
        return el != null;
      })
      .map((item, index) => {
        const price = balances[item]?.valueReadable
          ? `$ ${formatUSD(
              coinEstimator(item) * balances[item]?.valueReadable
            )}`
          : "";

        return {
          id: index,
          name: item,
          balance: balances[item]?.valueReadable
            ? formatToken(balances[item]?.valueReadable, item)
            : "0.0000000",
          price: price !== "" ? `${price}` : "$ 0.00",
        };
      });
    if (buyToken) {
      const d = filtered.find((item) => item.name === buyToken.name);
      if (d === undefined) {
        setBuyToken(filtered[0]);
      } else {
        setBuyToken(d);
      }
    } else {
      const b = filtered.find(
        (item) => item.name === currentMarket.split("-")[0]
      );
      setBuyToken(b);
    }
    filtered = filtered.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.name === value.name)
    );
    const s = filtered.sort((a, b) => {
      return (
        parseFloat(b.price.substring(1).replace(",", "")) -
        parseFloat(a.price.substring(1).replace(",", ""))
      );
    });
    return s;
  }, [sellToken, pairs, balances]);

  const onChangeSellToken = (option) => {
    setSellToken(option);
  };

  const onChangeBuyToken = (option) => {
    setBuyToken(option);
  };

  const onSwitchTokenBtn = () => {
    const p = fromTokenOptions.find((item) => item.name === buyToken.name);
    setSellToken(p);
    setBuyToken(sellToken);
    setSellAmounts(buyAmounts);
  };

  const onChangeSellAmounts = (event) => {
    const amount = event.target.value.replace(/[^0-9.]/g, "");
    setSellAmounts(amount);
    const x = amount * basePrice;
    setBuyAmounts(x.toPrecision(6));
  };

  const onChangeBuyAmounts = (event) => {
    const amount = event.target.value.replace(/[^0-9.]/g, "");
    setBuyAmounts(amount);
    const x = amount / basePrice;
    setSellAmounts(x.toPrecision(6));
  };

  const isValid = () => {
    let baseAmount, quoteAmount;
    if(!sellAmounts || !buyAmounts) {
      setError("")
      return;
    }
    if (typeof sellAmounts === "string") {
      baseAmount = parseFloat(sellAmounts.replace(",", "."));
    } else {
      baseAmount = sellAmounts;
    }
    if (typeof buyAmounts === "string") {
      quoteAmount = parseFloat(buyAmounts.replace(",", "."));
    } else {
      quoteAmount = buyAmounts;
    }
    quoteAmount = isNaN(quoteAmount) ? 0 : quoteAmount;
    baseAmount = isNaN(baseAmount) ? 0 : baseAmount;
    if (!baseAmount && !quoteAmount) {
      setError("No amount available")
      return;
    }

    let price = currentPrice();
    if (!price) {
      setError("No price available")
      return;
    }

    if (price < 0) {
      setError(`Price (${price}) can't be below 0`)
      return;
    }
    const baseBalance = balances[sellToken?.name]?.valueReadable;

    if (tType === "sell") {
      if (baseAmount && baseAmount + marketInfo.baseFee > baseBalance) {
        setError(`Amount exceeds ${marketInfo.baseAsset.symbol} balance`)
        return;
      }

      if (
        (baseAmount && baseAmount < marketInfo.baseFee) ||
        baseBalance === undefined
      ) {
        setError(`Minimum order size is ${marketInfo.baseFee.toPrecision(5)}`)
        return;
      }
    } else {
      if (baseAmount && baseAmount + marketInfo.quoteFee > baseBalance) {
        setError(`Amount exceeds ${marketInfo.quoteAsset.symbol} balance`)
        return;
      }

      if (
        (baseAmount && baseAmount < marketInfo.quoteFee) ||
        baseBalance === undefined
      ) {
        setError(`Minimum order size is ${marketInfo.quoteFee.toPrecision(5)}`)
        return;
      }
    }
    ;
  }

  const onClickExchange = async () => {
    const userOrderArray = Object.values(userOrders);
    if (userOrderArray.length > 0) {
      const openOrders = userOrderArray.filter((o) =>
        ["o", "b", "m"].includes(o[9])
      );
      if ([1, 1000].includes(network) && openOrders.length > 0) {
        toast.error(
          "zkSync 1.0 allows one open order at a time. Please cancel your limit order or wait for it to be filled before converting. Otherwise your limit order will fail.",
          {
            toastId:
              "zkSync 1.0 allows one open order at a time. Please cancel your limit order or wait for it to be filled before converting. Otherwise your limit order will fail.",
            autoClose: 20000,
          }
        );
        return;
      }
    }
    let baseAmount, quoteAmount;
    if (typeof sellAmounts === "string") {
      baseAmount = parseFloat(sellAmounts.replace(",", "."));
    } else {
      baseAmount = sellAmounts;
    }
    if (typeof buyAmounts === "string") {
      quoteAmount = parseFloat(buyAmounts.replace(",", "."));
    } else {
      quoteAmount = buyAmounts;
    }
    quoteAmount = isNaN(quoteAmount) ? 0 : quoteAmount;
    baseAmount = isNaN(baseAmount) ? 0 : baseAmount;
    if (!baseAmount && !quoteAmount) {
      setError("No amount available")
      return;
    }

    let price = currentPrice();
    if (!price) {
      setError("No price available")
      return;
    }

    if (price < 0) {
      setError(`Price (${price}) can't be below 0`)
      return;
    }

    if (tType === "buy") {
      const bidPrice = getFirstBid();
      const delta = ((price - bidPrice) / bidPrice) * 100;
      if (delta > 2 && !settings.disableSlippageWarning) {
        toast.error(
          `You are buying ${delta.toFixed(
            2
          )}% above the current market price. You could lose money when signing this transaction!`,
          {
            toastId: `You are buying ${delta.toFixed(
              2
            )}% above the current market price. You could lose money when signing this transaction!`,
          }
        );
      }
    } else {
      const askPrice = getFirstAsk();
      const delta = ((askPrice - price) / askPrice) * 100;
      if (delta > 2 && !settings.disableSlippageWarning) {
        toast.error(
          `You are selling ${delta.toFixed(
            2
          )}% under the current market price. You could lose money when signing this transaction!`,
          {
            toastId: `You are selling ${delta.toFixed(
              2
            )}% under the current market price. You could lose money when signing this transaction!`,
          }
        );
      }
    }
    const baseBalance = balances[sellToken?.name]?.valueReadable;

    if (tType === "sell") {
      if (baseAmount && baseAmount + marketInfo.baseFee > baseBalance) {
        setError(`Amount exceeds ${marketInfo.baseAsset.symbol} balance`)
        return;
      }

      if (
        (baseAmount && baseAmount < marketInfo.baseFee) ||
        baseBalance === undefined
      ) {
        setError(`Minimum order size is ${marketInfo.baseFee.toPrecision(5)}`)
        return;
      }
    } else {
      if (baseAmount && baseAmount + marketInfo.quoteFee > baseBalance) {
        setError(`Amount exceeds ${marketInfo.quoteAsset.symbol} balance`)
        return;
      }

      if (
        (baseAmount && baseAmount < marketInfo.quoteFee) ||
        baseBalance === undefined
      ) {
        setError(`Minimum order size is ${marketInfo.quoteFee.toPrecision(5)}`)
        return;
      }
    }

    let orderPendingToast;
    setOrderButtonDisabled(true);
    if (api.isZksyncChain()) {
      orderPendingToast = toast.info(
        "Order pending. Sign or Cancel to continue...",
        {
          toastId: "Order pending. Sign or Cancel to continue...",
        }
      );
    }

    console.log(slippageValue, 1 + slippageValue / 100);

    try {
      await api.submitOrder(
        currentMarket,
        tType === "buy" ? "b" : "s",
        tType === "buy"
          ? price * (1 + slippageValue / 100)
          : price * (1 - slippageValue / 100),
        tType === "sell" ? baseAmount : 0,
        tType === "buy" ? baseAmount : 0,
        "market"
      );
      setTimeout(() => {
        setOrderButtonDisabled(false);
      }, 8000);
    } catch (e) {
      console.log(e);
      toast.error(e.message);
      setOrderButtonDisabled(false);
    }
    if (api.isZksyncChain()) {
      toast.dismiss(orderPendingToast);
    }
  };

  const onClickMax = () => {
    const balance = balances[sellToken?.name]?.valueReadable;
    const fees = tType === "sell" ? marketInfo?.baseFee : marketInfo?.quoteFee;
    if (balance && fees) {
      const s_amounts = balance - fees;
      setSellAmounts(s_amounts);
      setBuyAmounts(basePrice * s_amounts);
    }
  };

  const onChangeSlippageValue = (value) => {
    let amount = value.replace(/[^1-9.]/g, ""); //^[1-9][0-9]?$|^100$
    if (parseFloat(amount) < 1 || parseFloat(amount) > 10) {
      dispatch(setSlippageValue({ value: "1.00" }));
    } else {
      dispatch(setSlippageValue({ value: amount }));
    }
  };

  return (
    <DefaultTemplate>
      {loading && (
        <div
          className={classNames("flex justify-center align-center mt-48", {
            dark: isDark,
          })}
        >
          <LoadingSpinner />
        </div>
      )}
      {!loading && (
        <div className={classNames("flex justify-center", { dark: isDark })}>
          <div className="w-full max-w-lg px-1 sm:px-0">
            <p className="mt-10 text-3xl font-semibold font-work ">
              ZigZag Convert
            </p>
            <ConvertContianer
              setTransactionType={(type) => setTtype(type)}
              transactionType={tType}
              balances={balances}
              fromToken={sellToken}
              fromTokenOptions={fromTokenOptions}
              onChangeFromToken={onChangeSellToken}
              onChangeFromAmounts={onChangeSellAmounts}
              fromAmounts={sellAmounts}
              estimatedValueFrom={estimatedValueSell}
              estimatedValueTo={estimatedValueBuy}
              onSwitchTokenBtn={onSwitchTokenBtn}
              basePrice={basePrice}
              toToken={buyToken}
              toTokenOptions={buyTokenOptions}
              onChangeToToken={onChangeBuyToken}
              toAmounts={isNaN(buyAmounts) ? "" : buyAmounts}
              onClickMax={onClickMax}
              onChangeToAmounts={onChangeBuyAmounts}
            />
            <TransactionSettings
              transactionType={tType}
              onSetSlippageValue={onChangeSlippageValue}
              slippageValue={slippageValue}
            />
            {!errorMsg && <Button
              isLoading={false}
              className="w-full py-3 my-3 uppercase"
              scale="imd"
              onClick={onClickExchange}
              disabled={orderButtonDisabled || !user.address}
            >
              Convert
            </Button>}
            {errorMsg && <Button
              isLoading={false}
              className="w-full py-3 my-3 uppercase"
              variant="sell"
              scale="imd"
              disabled
            >
              {errorMsg}
            </Button>}
          </div>
        </div>
      )}
    </DefaultTemplate>
  );
};

export default ConvertPage;