import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BuySellModal.css";

const BuySellModal = ({ type, open, onClose, onConfirm, symbol }) => {
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState(0);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!open) return;

        const fetchPrice = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/stock_price/${symbol}`);
                setPrice(response.data.price);
                setCountdown(5); // reset countdown after price update
            } catch (err) {
                console.error("Error fetching stock price:", err);
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

    const handleConfirm = () => {
        console.log()
        onConfirm({
            type,
            symbol,
            quantity: Number(quantity),
            price,
        });
        setQuantity("");
        onClose();
    };

    if (!open) return null;

    return (
        <div className="ui modal active custom-modal">
            <div className="header">{type === "buy" ? "Buy Stock" : "Sell Stock"}</div>
            <div className="content">
                <div style={{ textAlign: "center" }}>
                    <label style={{ display: "block", fontSize: "1.2em", marginBottom: 10 }}>Stock Symbol:</label>
                    <input
                        type="text"
                        value={symbol}
                        readOnly
                        className="ui input"
                        style={{
                            width: "50%",
                            textAlign: "center",
                            border: "1px solid black",
                        }}
                    />

                    <label style={{ display: "block", fontSize: "1.2em", margin: "10px 0" }}>Enter Quantity:</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="ui input"
                        style={{
                            width: "50%",
                            textAlign: "center",
                            border: "1px solid black",
                        }}
                    />

                    <label style={{ display: "block", fontSize: "1.2em", margin: "10px 0" }}>Price:</label>
                    <input
                        type="number"
                        value={price}
                        readOnly
                        className="ui input"
                        style={{
                            width: "50%",
                            textAlign: "center",
                            border: "1px solid black",
                        }}
                    />
                    <div style={{ fontSize: "0.9em", marginTop: "5px", color: "#666" }}>
                        Price updates in {countdown} second{countdown !== 1 ? "s" : ""}
                    </div>
                </div>
            </div>
            <div className="actions" style={{ textAlign: "center" }}>
                <button className="ui button" onClick={onClose}>Cancel</button>
                <button
                    className={`ui ${type === "buy" ? "green" : "red"} button`}
                    onClick={handleConfirm}
                >
                    Confirm {type === "buy" ? "Buy" : "Sell"}
                </button>
            </div>
        </div>
    );
};

export default BuySellModal;
