import React from "react";

const BuySellButtons = ({ onBuyClick, onSellClick }) => {
    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <button
                className="ui green button"
                style={{ width: "150px", fontSize: "1.2em", marginRight: "10px" }}
                onClick={onBuyClick}
            >
                Buy
            </button>
            <button
                className="ui red button"
                style={{ width: "150px", fontSize: "1.2em" }}
                onClick={onSellClick}
            >
                Sell
            </button>
        </div>
    );
};

export default BuySellButtons;
