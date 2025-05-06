import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import Navbar from '../Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TradeStocks.css';

const TradeStocks = () => {
    const [symbol, setSymbol] = useState('');
    const [shares, setShares] = useState(1);
    const [price, setPrice] = useState('Fetching price...');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(5);
    const [open, setOpen] = useState(false); // Control to start fetching

    useEffect(() => {
        if (!open || !symbol) return;

        const fetchPrice = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/stock_price/${symbol}`);
                console.log(response.data)
                setPrice(response.data.price);
                setCountdown(5);
            } catch (err) {
                console.error("Error fetching stock price:", err);
                setPrice('Error');
            }
        };

        fetchPrice();

        const priceInterval = setInterval(fetchPrice, 5000);
        const countdownInterval = setInterval(() => {
            setCountdown(prev => (prev > 1 ? prev - 1 : 5));
        }, 1000);

        return () => {
            clearInterval(priceInterval);
            clearInterval(countdownInterval);
        };
    }, [open, symbol]);

    const handleBuy = async () => {
        if (!symbol || shares <= 0) {
            setError('Please enter a valid symbol and number of shares.');
            setSuccess('');
            return;
        }


        const transaction = {
            transactionType: "BUY",  // "BUY" or "SELL"
            symbol: symbol,
            shares: shares,
            price: price,
            userId: "123",          // Replace with actual user ID (e.g., from auth)
            // stockId: "some-stock-id",        // Replace with actual stock ID (e.g., from DB)
            totalValue: shares * price,
            // portfolioValue: 0,               // You can update this from frontend or backend
            // pnlRealized: 0,                  // Optional for BUY; only needed for SELL
            timestamp: new Date().toISOString()
        };

        try {
            console.log(-1)
            console.log(transaction)
            const response = await fetch("http://localhost:8082/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transaction)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Transaction saved:", data);
            // Optionally show success toast or redirect

        } catch (error) {
            console.error("Failed to save transaction:", error);
            // Optionally show error message
        }



        setSuccess(`Successfully bought ${shares} shares of ${symbol} at $${price}.`);
        setError('');
    };

    const handleSell = async () => {
        if (!symbol || shares <= 0) {
            setError('Please enter a valid symbol and number of shares.');
            setSuccess('');
            return;
        }

        const transaction = {
            transactionType: "SELL",
            symbol: symbol,
            shares: shares,
            price: price,
            userId: "123",          // Replace with actual user ID (e.g., from auth)
            // stockId: "some-stock-id",        // Replace with actual stock ID (e.g., from DB)
            totalValue: shares * price,
            // portfolioValue: 0,               // You can update this from frontend or backend
            // pnlRealized: 0,                  // Optional for BUY; only needed for SELL
            timestamp: new Date().toISOString()
        };

        try {
            console.log(-1)
            console.log(transaction)
            const response = await fetch("http://localhost:8082/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transaction)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Transaction saved:", data);
            // Optionally show success toast or redirect

        } catch (error) {
            console.error("Failed to save transaction:", error);
            // Optionally show error message
        }



        setSuccess(`Successfully sold ${shares} shares of ${symbol} at $${price}.`);
        setError('');
    };

    const handleSymbolChange = (e) => {
        const newSymbol = e.target.value.toUpperCase();
        setSymbol(newSymbol);
        setOpen(!!newSymbol); // Only open fetch loop if symbol is valid
    };

    return (
        <>
            <Navbar />
            <div className="ui container mt-5">
                <div className="trade-container">
                    <div className="card p-4">
                        <h2 className="header">Buy / Sell Stocks</h2>

                        <form className="ui form">
                            <div className="field">
                                <label>Stock Symbol</label>
                                <input
                                    type="text"
                                    placeholder="Enter Stock Symbol (e.g. AAPL)"
                                    value={symbol}
                                    onChange={handleSymbolChange}
                                />
                            </div>

                            <div className="field">
                                <label>Shares</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Enter number of shares"
                                    value={shares}
                                    onChange={(e) => setShares(Number(e.target.value))}
                                />
                            </div>

                            <div className="field">
                                <label>Price Per Share ($)</label>
                                <input type="text" readOnly value={price} />
                                {symbol && price !== 'Fetching price...' && (
                                    <div className="text-muted text-sm mt-1">
                                        🔄 Price updates in {countdown} second{countdown !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>

                            <div className="button-group mt-3">
                                <button type="button" className="buy-btn" onClick={handleBuy}>Buy</button>
                                <button type="button" className="sell-btn" onClick={handleSell}>Sell</button>
                            </div>

                            {error && <div className="ui error message mt-3">{error}</div>}
                            {success && <div className="ui success message mt-3">{success}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TradeStocks;
