from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
from streamlit import status
import yfinance as yf
import pandas as pd
import numpy as np
import math
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import accuracy_score, mean_squared_error
from fastapi import status  # WRONG if 'status' is also a function in your code

status_code=500

app = FastAPI()

# ======= Fundamental Check Endpoint =======

class FundamentalAnalysis(BaseModel):
    ticker: str
    current_price: float | None
    pe_ratio: float | None
    pb_ratio: float | None
    debt_to_equity: float | None
    eps: float | None
    roe: float | None
    met_conditions: int
    signal: str
    conditions: dict
    is_fundamentally_strong: bool

class FundamentalsResponse(BaseModel):
    results: List[FundamentalAnalysis]
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class TickerRequest(BaseModel):
    ticker_symbols: List[str]
    industry_pe: Optional[float] = None

class FundamentalAnalysis(BaseModel):
    ticker: str
    current_price: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    eps: Optional[float] = None
    roe: Optional[float] = None
    met_conditions: int
    signal: str
    conditions: dict
    is_fundamentally_strong: bool

class FundamentalsResponse(BaseModel):
    results: List[FundamentalAnalysis]
    
class FundamentalAnalysis(BaseModel):
    ticker: str
    current_price: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    eps: Optional[float] = None
    roe: Optional[float] = None
    met_conditions: int
    signal: str
    conditions: dict
    is_fundamentally_strong: bool

class FundamentalsResponse(BaseModel):
    results: List[FundamentalAnalysis]

@app.post("/fundamentals")
async def check_fundamentals(
    ticker_symbols: List[str] = Query(..., alias="ticker_symbols"),
    industry_pe: Optional[float] = Query(None, alias="industry_pe")
):
    results = []
    
    for ticker_symbol in ticker_symbols:
        try:
            stock = yf.Ticker(ticker_symbol)
            info = stock.info

            current_price = info.get('currentPrice') or info.get('regularMarketPrice')
            pe_ratio = info.get('trailingPE')
            pb_ratio = info.get('priceToBook')
            debt_to_equity = info.get('debtToEquity')
            eps = info.get('trailingEps')
            roe = info.get('returnOnEquity')

            if debt_to_equity is not None and debt_to_equity > 1:
                debt_to_equity = debt_to_equity / 100

            conditions = {
                "PE < Industry PE": pe_ratio is not None and industry_pe is not None and pe_ratio < industry_pe,
                "Debt/Equity < 0.5": debt_to_equity is not None and debt_to_equity < 0.5,
                "PB < 10": pb_ratio is not None and pb_ratio < 10,
                "EPS > 0.1×Price": eps is not None and current_price is not None and eps > 0.1 * current_price,
                "ROE > 12%": roe is not None and roe > 0.12
            }

            met = sum(conditions.values())
            signal = "OKAY ✅" if met >= 3 else "NOT OKAY ❌"

            result = FundamentalAnalysis(
                ticker=ticker_symbol,
                current_price=current_price,
                pe_ratio=pe_ratio,
                pb_ratio=pb_ratio,
                debt_to_equity=debt_to_equity,
                eps=eps,
                roe=roe,
                met_conditions=met,
                signal=signal,
                conditions=conditions,
                is_fundamentally_strong=(signal == "OKAY ✅")
            )

        except Exception as e:
            result = FundamentalAnalysis(
                ticker=ticker_symbol,
                current_price=None,
                pe_ratio=None,
                pb_ratio=None,
                debt_to_equity=None,
                eps=None,
                roe=None,
                met_conditions=0,
                signal=f"Error ❌: {str(e)}",
                conditions={},
                is_fundamentally_strong=False
            )

        results.append(result)

    return FundamentalsResponse(results=results)
# ======= Technical + ML Recommendations =======
# INDIAN_STOCKS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS',
#                  'ICICIBANK.NS', 'KOTAKBANK.NS', 'BHARTIARTL.NS', 'LT.NS',
#                  'ITC.NS', 'SBIN.NS', 'ASIANPAINT.NS', 'HINDUNILVR.NS', 'WAAREEENER.NS']

class StockTrustScoreResponse(BaseModel):
    symbol: str
    predictedPrice: float
    cluster_recommendation: str
    indicator_recommendation: str
    indicator_used: str
    final_recommendation: str

class StockRequest(BaseModel):
    stock_symbols: List[str]

class StockRecommendation(BaseModel):
    symbol: str
    price: float
    cluster_recommendation: str
    indicator_recommendation: str
    indicator_used: str
    final_recommendation: str

@app.post("/short_term_analysis")
def get_combined_recommendations_post_loan(request: StockRequest):
    print(request)  
    stock_symbols = request.stock_symbols
    if not stock_symbols:
        return JSONResponse(
            content={"error": "No stock symbols provided"},
            status_code=400
        )
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    try:
        data = yf.download(stock_symbols, start=start_date, end=end_date, group_by='ticker', auto_adjust=False)
    except Exception as e:
        return JSONResponse(
            content={"error": f"Failed to download stock data: {str(e)}"},
            status_code=500
        )

    recommendations = []

    stock_symbols = request.stock_symbols
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    data = yf.download(stock_symbols, start=start_date, end=end_date, group_by='ticker', auto_adjust=False)

    recommendations = []
    cluster_data = []
    tech_data = []

    def calculate_sma(prices, period): return prices.rolling(window=period).mean()
    def calculate_bbands(prices, period=20, stddev=2):
        sma = calculate_sma(prices, period)
        std = prices.rolling(window=period).std()
        return sma + std * stddev, sma, sma - std * stddev
    def calculate_macd(prices, fast=12, slow=26, signal=9):
        ema_fast = prices.ewm(span=fast, adjust=False).mean()
        ema_slow = prices.ewm(span=slow, adjust=False).mean()
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=signal, adjust=False).mean()
        return macd, signal_line
    def calculate_rsi(prices, period=14):
        delta = prices.diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()
        rs = avg_gain / avg_loss
        return 100 - (100 / (1 + rs))

    for symbol in stock_symbols:
        try:
            df = data[symbol].copy()
            if df.empty or len(df) < 50:
                continue
            prices = df['Close']
            current_price = prices.iloc[-1]
            returns = prices.pct_change()
            ma_50 = calculate_sma(prices, 50).iloc[-1]
            ma_200 = calculate_sma(prices, 200).iloc[-1]
            volatility = returns.rolling(50).std().iloc[-1]

            cluster_data.append({
                'symbol': symbol,
                'returns': returns.iloc[-1] if not np.isnan(returns.iloc[-1]) else 0,
                'ma_50': ma_50 if not np.isnan(ma_50) else current_price,
                'ma_200': ma_200 if not np.isnan(ma_200) else current_price,
                'volatility': volatility if not np.isnan(volatility) else 0,
                'price': current_price
            })

            # Technical indicators
            indicator_recommendation = "Hold"
            indicator_used = []
            confidence = 0

            upper, _, lower = calculate_bbands(prices)
            if prices.iloc[-1] > lower.iloc[-1] and prices.iloc[-2] < lower.iloc[-2]:
                indicator_used.append("BB Buy")
                confidence += 0.25
            elif prices.iloc[-1] < upper.iloc[-1] and prices.iloc[-2] > upper.iloc[-2]:
                indicator_used.append("BB Sell")
                confidence += 0.25

            macd, signal = calculate_macd(prices)
            if macd.iloc[-1] > signal.iloc[-1] and macd.iloc[-2] <= signal.iloc[-2]:
                indicator_used.append("MACD Buy")
                confidence += 0.25
            elif macd.iloc[-1] < signal.iloc[-1] and macd.iloc[-2] >= signal.iloc[-2]:
                indicator_used.append("MACD Sell")
                confidence += 0.25

            rsi = calculate_rsi(prices)
            if rsi.iloc[-1] < 30:
                indicator_used.append("RSI Buy")
                confidence += 0.25
            elif rsi.iloc[-1] > 70:
                indicator_used.append("RSI Sell")
                confidence += 0.25

            if confidence >= 0.5:
                buys = sum("Buy" in x for x in indicator_used)
                sells = sum("Sell" in x for x in indicator_used)
                if buys > sells:
                    indicator_recommendation = "Buy"
                elif sells > buys:
                    indicator_recommendation = "Sell"

            tech_data.append({
                'symbol': symbol,
                'indicator_recommendation': indicator_recommendation,
                'indicator_used': ", ".join(indicator_used),
                'confidence': confidence
            })
        except:
            continue

    if cluster_data:
        df = pd.DataFrame(cluster_data)
        features = ['returns', 'ma_50', 'ma_200', 'volatility']
        df[features] = StandardScaler().fit_transform(df[features])
        n_clusters = min(len(df), 9)  # Automatically choose appropriate number of clusters
        df['cluster'] = KMeans(n_clusters=n_clusters, random_state=42, n_init=10).fit_predict(df[features])

        cluster_map = {
            0: "Strong Buy", 1: "Buy", 2: "Weak Buy", 3: "Hold", 4: "Weak Sell",
            5: "Sell", 6: "Strong Sell", 7: "Watchlist", 8: "Volatile"
        }
        df['cluster_recommendation'] = df['cluster'].map(cluster_map)

    for symbol in stock_symbols:
        try:
            c = df[df['symbol'] == symbol]
            t = next(x for x in tech_data if x['symbol'] == symbol)

            if t['indicator_recommendation'] == "Hold":
                if "Strong" in c['cluster_recommendation'].values[0]:
                    final = c['cluster_recommendation'].values[0].replace("Strong ", "")
                elif "Weak" in c['cluster_recommendation'].values[0]:
                    final = "Hold"
                else:
                    final = c['cluster_recommendation'].values[0]
            else:
                if c['cluster_recommendation'].values[0] in ["Strong Buy", "Buy"] and t['indicator_recommendation'] == "Buy":
                    final = "Strong Buy"
                elif c['cluster_recommendation'].values[0] in ["Strong Sell", "Sell"] and t['indicator_recommendation'] == "Sell":
                    final = "Strong Sell"
                elif t['confidence'] >= 0.75:
                    final = "Strong " + t['indicator_recommendation']
                elif t['confidence'] >= 0.5:
                    final = t['indicator_recommendation']
                else:
                    final = c['cluster_recommendation'].values[0]
            print(c['price'].values[0])
            recommendations.append(StockRecommendation(
                symbol=symbol.replace(".NS", ""),
                price=c['price'].values[0],
                cluster_recommendation=c['cluster_recommendation'].values[0],
                indicator_recommendation=t['indicator_recommendation'],
                indicator_used=t['indicator_used'],
                final_recommendation=final
            ))
        except:
            continue
    print(recommendations)
    return recommendations



@app.post("/long_term_analysis")
def long_term_analysis(request: StockRequest):
    print(request)
    stock_symbols = request.stock_symbols

    """
    API endpoint for long-term combined recommendations (ARIMA + Technical Indicators)
    """
    """
    Combined ARIMA + Technical Indicators Analysis with Training/Test Accuracy
    Returns: Dict with forecasts, technical signals, and accuracy metrics
    """
    # ================== 1. Data Fetching ==================
    end_date = datetime.now()
    start_date = end_date - timedelta(days=2*365)  # 2 years data

    print(f"Fetching data for {stock_symbols}...")
    data = yf.download(stock_symbols, start=start_date, end=end_date, group_by='ticker')

    results = {}

    for symbol in stock_symbols:
        try:
            stock_df = data[symbol].copy()
            if stock_df.empty or len(stock_df) < 50:
                continue

            close_prices = stock_df['Close'].dropna()
            current_price = close_prices.iloc[-1]

            # ================== 2. ARIMA Forecasting ==================
            def arima_model(series):
                size = int(len(series) * 0.8)
                train, test = series[:size], series[size:]

                # ===== TRAINING PHASE =====
                model = ARIMA(train, order=(5,1,0)).fit()
                train_pred = model.predict(start=1, end=len(train)-1)

                # Training accuracy
                train_actual_directions = [1 if train.iloc[i] > train.iloc[i-1] else 0 for i in range(1, len(train))]
                train_pred_directions = [1 if train_pred.iloc[i] > train.iloc[i-1] else 0 for i in range(1, len(train_pred))]

                # Align lengths
                min_length = min(len(train_actual_directions), len(train_pred_directions))
                train_accuracy = accuracy_score(train_actual_directions[:min_length], train_pred_directions[:min_length])

                # ===== TESTING PHASE =====
                history = [x for x in train]
                predictions = []
                for t in range(len(test)):
                    model = ARIMA(history, order=(5,2,0)).fit()
                    yhat = model.forecast()[0]
                    predictions.append(yhat)
                    history.append(test.iloc[t])

                # Testing accuracy
                test_actual_directions = [1 if test.iloc[i] > test.iloc[i-1] else 0 for i in range(1, len(test))]
                test_pred_directions = [1 if predictions[i] > test.iloc[i-1] else 0 for i in range(1, len(predictions))]
                test_accuracy = accuracy_score(test_actual_directions, test_pred_directions)

                return {
                    'prediction': predictions[-1],
                    'last_close': test.iloc[-1],
                    'train_accuracy': round(train_accuracy, 4),
                    'test_accuracy': round(test_accuracy, 4),
                    'rmse': round(math.sqrt(mean_squared_error(test, predictions)), 4)
                }

            arima_results = arima_model(close_prices)

            # ================== 3. Technical Indicators ==================
            def calculate_rsi(prices, period=14):
                delta = prices.diff()
                gain = delta.where(delta > 0, 0)
                loss = -delta.where(delta < 0, 0)
                avg_gain = gain.rolling(period).mean()
                avg_loss = loss.rolling(period).mean()
                rs = avg_gain / avg_loss
                return 100 - (100 / (1 + rs))

            # Bollinger Bands (20,2)
            sma_20 = close_prices.rolling(20).mean()
            std_20 = close_prices.rolling(20).std()
            upper_bb = sma_20 + 2*std_20
            lower_bb = sma_20 - 2*std_20

            # MACD (12,26,9)
            ema12 = close_prices.ewm(span=12, adjust=False).mean()
            ema26 = close_prices.ewm(span=26, adjust=False).mean()
            macd = ema12 - ema26
            signal = macd.ewm(span=9, adjust=False).mean()

            # RSI (14)
            rsi = calculate_rsi(close_prices)

            # Generate signals
            signals = []
            if current_price > lower_bb.iloc[-1] and close_prices.iloc[-2] < lower_bb.iloc[-2]:
                signals.append("BB Buy")
            if current_price < upper_bb.iloc[-1] and close_prices.iloc[-2] > upper_bb.iloc[-2]:
                signals.append("BB Sell")
            if macd.iloc[-1] > signal.iloc[-1] and macd.iloc[-2] <= signal.iloc[-2]:
                signals.append("MACD Buy")
            if macd.iloc[-1] < signal.iloc[-1] and macd.iloc[-2] >= signal.iloc[-2]:
                signals.append("MACD Sell")
            if rsi.iloc[-1] < 30:
                signals.append("RSI Buy")
            if rsi.iloc[-1] > 70:
                signals.append("RSI Sell")

            # ================== 4. Combined Recommendation ==================
            final_rec = "Hold"
            if len(signals) > 0:
                buy_signals = sum(1 for s in signals if 'Buy' in s)
                sell_signals = sum(1 for s in signals if 'Sell' in s)

                if buy_signals > sell_signals:
                    final_rec = "Buy" if (arima_results['prediction'] > arima_results['last_close']) else "Weak Buy"
                elif sell_signals > buy_signals:
                    final_rec = "Sell" if (arima_results['prediction'] < arima_results['last_close']) else "Weak Sell"

            # ================== 5. Store Results ==================
            results[symbol] = {
                'current_price': round(current_price, 2),
                'arima_forecast': round(arima_results['prediction'], 2),
                'train_accuracy': arima_results['train_accuracy'],
                'test_accuracy': arima_results['test_accuracy'],
                'technical_signals': signals if signals else ["None"],
                'recommendation': final_rec,
                'last_updated': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

        except Exception as e:
            print(f"Error processing {symbol}: {str(e)}")
            continue
    return JSONResponse(content=results)


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )