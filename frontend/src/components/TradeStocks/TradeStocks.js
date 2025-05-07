import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import Navbar from '../Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TradeStocks.css';
import { Modal, Button } from 'react-bootstrap';

const TradeStocks = () => {
    const [symbol, setSymbol] = useState('');
    const [shares, setShares] = useState(1);
    const [price, setPrice] = useState('Enter symbol to fetch price');
    const [countdown, setCountdown] = useState(5);
    const [open, setOpen] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isFetchingPrice, setIsFetchingPrice] = useState(false);

    // Check for userId when component mounts
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setShowLoginModal(true);
        }
    }, []);

    useEffect(() => {
        if (!open || !symbol) return;

        const fetchPrice = async () => {
            setIsFetchingPrice(true);
            try {
                const response = await axios.get(`http://localhost:8000/stock_price/${symbol}`);
                setPrice(response.data.price);
                setCountdown(5);
            } catch (err) {
                console.error("Error fetching stock price:", err);
                setPrice('Error fetching price');
            } finally {
                setIsFetchingPrice(false);
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

    const showError = (message) => {
        setModalMessage(message);
        setShowErrorModal(true);
    };

    const showSuccess = (message) => {
        setModalMessage(message);
        setShowSuccessModal(true);
    };

    const handleLoginRedirect = () => {
        window.location.href = '/login';
    };

    const handleTransaction = async (transactionType) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            showError('Please login to perform trades');
            setShowLoginModal(true);
            return;
        }

        if (!symbol) {
            showError('Please enter a stock symbol');
            return;
        }

        if (shares <= 0) {
            showError('Please enter a valid number of shares');
            return;
        }

        if (price === 'Error fetching price' || price === 'Enter symbol to fetch price') {
            showError('Please wait for valid price data');
            return;
        }

        if (isFetchingPrice) {
            showError('Price is still being fetched. Please wait a moment');
            return;
        }

        const transaction = {
            transactionType,
            symbol,
            shares,
            price,
            userId,
            totalValue: shares * price,
            timestamp: new Date().toISOString()
        };

        try {
            const endpoint = transactionType === "BUY" 
                ? "http://localhost:8081/portfolio-microservice/api/transactions" 
                : "http://localhost:8082/api/transactions";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transaction)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Transaction failed');
            }

            const data = await response.json();
            console.log("Transaction saved:", data);
            showSuccess(`Successfully ${transactionType.toLowerCase()}ed ${shares} shares of ${symbol} at $${price}.`);
            
        } catch (error) {
            console.error("Failed to save transaction:", error);
            showError(error.message || `Failed to complete ${transactionType.toLowerCase()} transaction`);
        }
    };

    const handleBuy = () => handleTransaction("BUY");
    const handleSell = () => handleTransaction("SELL");

    const handleSymbolChange = (e) => {
        const newSymbol = e.target.value.toUpperCase();
        setSymbol(newSymbol);
        setOpen(!!newSymbol);
        if (!newSymbol) {
            setPrice('Enter symbol to fetch price');
        }
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
                                {symbol && price !== 'Enter symbol to fetch price' && price !== 'Error fetching price' && (
                                    <div className="text-muted text-sm mt-1">
                                        🔄 Price updates in {countdown} second{countdown !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>

                            <div className="button-group mt-3">
                                <button type="button" className="buy-btn" onClick={handleBuy}>Buy</button>
                                <button type="button" className="sell-btn" onClick={handleSell}>Sell</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Login Required Modal */}
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Login Required</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You need to be logged in to trade stocks. Please login to continue.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleLoginRedirect}>
                        Go to Login
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Error Modal */}
            <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowErrorModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={() => setShowSuccessModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TradeStocks;