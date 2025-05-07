# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import Optional, List
# import yfinance as yf
# import requests
# import pandas as pd
# import time
# from functools import lru_cache
# from datetime import datetime, timedelta

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# JAVA_WS_ENDPOINT = "http://localhost:8081/api/stock/update"
# TICKERS = ["TSLA", "AAPL", "MSFT"]
# CACHE_DURATION = 60  # Cache data for 60 seconds

# class StockData(BaseModel):
#     symbol: str
#     name: str
#     close: Optional[float]
#     rsi14: Optional[float]
#     sma20: Optional[float]
#     sma50: Optional[float]
#     priceLag1: Optional[float] = None
#     priceLag2: Optional[float] = None

# # Global cache dictionary
# price_cache = {}
# cache_timestamps = {}

# def get_cached_price(symbol):
#     """Get cached price or fetch new one if cache expired"""
#     now = datetime.now()
#     if symbol in price_cache and (now - cache_timestamps.get(symbol, now)).seconds < CACHE_DURATION:
#         return price_cache[symbol]
    
#     # Add delay to prevent rate limiting
#     time.sleep(0.5)
    
#     try:
#         # Try the more efficient Ticker method first
#         ticker = yf.Ticker(symbol)
#         hist = ticker.history(period="1d", interval="1m")
#         if not hist.empty:
#             price = hist["Close"].iloc[-1]
#             price_cache[symbol] = price
#             cache_timestamps[symbol] = now
#             return price
#     except:
#         pass
    
#     # Fallback to download method
#     try:
#         df = yf.download(symbol, period="1d", interval="1m", progress=False)
#         if not df.empty:
#             price = df["Close"].iloc[-1]
#             price_cache[symbol] = price
#             cache_timestamps[symbol] = now
#             return price
#     except:
#         pass
    
#     # Return None if both methods fail
#     return None

# @app.get("/all_stock_price")
# async def fetch_and_send_stock_data():
#     try:
#         stock_data = []
#         for symbol in TICKERS:
#             try:
#                 price = get_cached_price(symbol)
#                 if price is None:
#                     continue
                    
#                 # Get company name (cached separately)
#                 ticker = yf.Ticker(symbol)
#                 name = ticker.info.get("shortName") or ticker.info.get("longName") or "N/A"
                
#                 stock_data.append({
#                     "symbol": symbol,
#                     "name": name,
#                     "price": round(price, 2)
#                 })
#             except Exception as e:
#                 print(f"Error processing {symbol}: {e}")
#                 continue
        
#         if not stock_data:
#             raise HTTPException(status_code=503, detail="Temporarily unavailable - please try again later")
        
#         return {"data": stock_data}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")

# @app.get("/stock_price/{symbol}")
# async def get_stock_price(symbol: str):
#     symbol = symbol.upper()
#     price = get_cached_price(symbol)
    
#     if price is None:
#         raise HTTPException(
#             status_code=404,
#             detail=f"Could not fetch price for {symbol}. Please try again later."
#         )
    
#     return {
#         "symbol": symbol,
#         "price": round(price, 2)
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import requests
import time
from datetime import datetime, timedelta
from functools import lru_cache
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Alpaca API Configuration
# ALPACA_API_KEY = os.getenv('ALPACA_API_KEY', 'YOUR_API_KEY')
# ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY', 'YOUR_SECRET_KEY')
ALPACA_BASE_URL = 'https://data.alpaca.markets/v2'
HEADERS = {
    'APCA-API-KEY-ID': 'PKZHVH23KIC03WRITCIG',
    'APCA-API-SECRET-KEY': 'VZNGeb9dDsTbgcQxQKvXq1Jk8Yzy0pOAcQ2waHnR'
}

TICKERS = ["TSLA", "AAPL", "MSFT"]
CACHE_DURATION = 60  # Cache data for 60 seconds

class StockData(BaseModel):
    symbol: str
    name: str
    close: Optional[float]
    rsi14: Optional[float]
    sma20: Optional[float]
    sma50: Optional[float]
    priceLag1: Optional[float] = None
    priceLag2: Optional[float] = None

@lru_cache(maxsize=32)
def get_cached_price(symbol: str):
    """Get latest price with Alpaca API"""
    try:
        # Get latest trade data
        trades_url = f"{ALPACA_BASE_URL}/stocks/{symbol}/trades/latest"
        response = requests.get(trades_url, headers=HEADERS)
        response.raise_for_status()
        trade_data = response.json()['trade']
        
        # Get company name (from separate endpoint)
        assets_url = f"{ALPACA_BASE_URL}/assets/{symbol}"
        asset_response = requests.get(assets_url, headers=HEADERS)
        name = asset_response.json().get('name', symbol) if asset_response.ok else symbol
        
        return {
            'price': float(trade_data['p']),
            'name': name
        }
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {symbol}: {str(e)}")
        return None

@app.get("/all_stock_price")
async def fetch_all_stock_prices():
    stock_data = []
    
    for symbol in TICKERS:
        cached_data = get_cached_price(symbol)
        if cached_data:
            stock_data.append({
                "symbol": symbol,
                "name": cached_data['name'],
                "price": round(cached_data['price'], 2)
            })
        time.sleep(0.2)  # Rate limit protection
    
    if not stock_data:
        raise HTTPException(
            status_code=503,
            detail="Temporarily unavailable - please try again later"
        )
    
    return {"data": stock_data}

@app.get("/stock_price/{symbol}")
async def get_single_stock_price(symbol: str):
    symbol = symbol.upper()
    if symbol not in TICKERS:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} not supported"
        )
    
    cached_data = get_cached_price(symbol)
    if not cached_data:
        raise HTTPException(
            status_code=404,
            detail=f"Could not fetch price for {symbol}"
        )
    
    return {
        "symbol": symbol,
        "price": round(cached_data['price'], 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)