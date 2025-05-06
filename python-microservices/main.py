from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import yfinance as yf
import requests
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JAVA_WS_ENDPOINT = "http://localhost:8081/api/stock/update"
TICKERS = ["TSLA", "AAPL", "MSFT"]

class StockData(BaseModel):
    symbol: str
    name: str
    close: Optional[float]
    rsi14: Optional[float]
    sma20: Optional[float]
    sma50: Optional[float]
    priceLag1: Optional[float] = None
    priceLag2: Optional[float] = None


@app.get("/all_stock_price")
def fetch_and_send_stock_data():
    try:
        # ✅ Use download instead of .info to avoid rate limiting
        data = yf.download(tickers=TICKERS, period="1d", interval="1m", group_by='ticker', threads=True, progress=False)

        stock_data = []
        for symbol in TICKERS:
            try:
                ticker = yf.Ticker(symbol)
                name = ticker.info.get("shortName") or ticker.info.get("longName") or "N/A"

                latest_data = data[symbol].dropna().iloc[-1]
                price = latest_data["Close"]

                stock_data.append({
                    "symbol": symbol,
                    "name": name,
                    "price": round(price, 2)
                })
            except Exception as e:
                print(f"Error processing {symbol}: {e}")
        
        print(stock_data)
        # requests.post(JAVA_WS_ENDPOINT, json=stock_data)  # optionally send
        return { "data": stock_data }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")


@app.get("/stock_price/{symbol}")
def get_stock_price(symbol: str):
    try:
        df = yf.download(tickers=symbol.upper(), period="1d", interval="1m", progress=False)
        if df.empty:
            raise ValueError("No price data found.")
        
        price = df["Close"].dropna().iloc[-1]
        return {
            "symbol": symbol.upper(),
            "price": round(price, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error fetching price for {symbol}: {str(e)}")
