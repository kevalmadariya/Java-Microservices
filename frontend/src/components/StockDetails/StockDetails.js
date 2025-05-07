import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import BuySellButtons from "../Buttons/BuySellButtons";
import BuySellModal from "../Buttons/BuySellModal.js";
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function StockDetails() {
    const { symbol } = useParams();
    const [modalType, setModalType] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    // Check for userId on component mount
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setShowLoginModal(true);
        }
    }, []);

    const openBuyPopup = () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setShowLoginModal(true);
            return;
        }
        setModalType("buy");
    };

    const openSellPopup = () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setShowLoginModal(true);
            return;
        }
        setModalType("sell");
    };

    const closeModal = () => setModalType(null);

    const handleLoginRedirect = () => {
        window.location.href = '/login';
    };

    const handleConfirm = async ({ type, symbol, quantity, price }) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setShowLoginModal(true);
            return;
        }

        console.log(`Confirmed ${type.toUpperCase()} of ${quantity} shares at ₹${price} for ${symbol}`);

        const transaction = {
            transactionType: type.toUpperCase(),
            symbol: symbol,
            shares: quantity,
            price: price,
            userId: userId,
            totalValue: quantity * price,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch("http://localhost:8081/portfolio-microservice/api/transactions", {
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
            setModalMessage(`Successfully ${type.toLowerCase()}ed ${quantity} shares of ${symbol} at $${price}`);
            setShowSuccessModal(true);
            
        } catch (error) {
            console.error("Failed to save transaction:", error);
            setModalMessage(error.message || `Failed to complete ${type.toLowerCase()} transaction`);
            setShowErrorModal(true);
        }
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;

        script.onload = () => {
            if (window.TradingView) {
                new window.TradingView.widget({
                    autosize: true,
                    symbol: `NASDAQ:${symbol}`,
                    interval: "D",
                    timezone: "Asia/Kolkata",
                    theme: "dark",
                    style: "1",
                    locale: "en",
                    withdateranges: true,
                    range: "YTD",
                    hide_side_toolbar: false,
                    allow_symbol_change: true,
                    details: true,
                    hotlist: true,
                    calendar: false,
                    container_id: "tradingview_widget",
                });
            }
        };

        document.getElementById("tradingview_container").appendChild(script);
    }, [symbol]);

    return (
        <>
            <Navbar />
            <div className="ui container">
                <br />
                <h1 className="text-2xl font-bold">
                    <a href="/">
                        <i className="angle left icon"></i>
                    </a>{" "}
                    Stock Details ({symbol})
                </h1>

                <div id="tradingview_container">
                    <div
                        id="tradingview_widget"
                        style={{ height: "500px", width: "100%" }}
                    ></div>
                </div>
            </div>

            <BuySellButtons onBuyClick={openBuyPopup} onSellClick={openSellPopup} />

            <BuySellModal
                type={modalType}
                open={modalType !== null}
                onClose={closeModal}
                onConfirm={handleConfirm}
                symbol={symbol}
                price={100}
            />

            {/* Login Required Modal */}
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Login Required</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You need to be logged in to perform trades. Please login to continue.
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
        </>
    );
}

export default StockDetails;