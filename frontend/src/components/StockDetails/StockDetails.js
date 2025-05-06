// import React from "react";
// import Navbar from "../Navbar/Navbar";

// function StockDetails({ stock = { symbol: "AAPL", name: "Apple inc." }, strategies, bars }) {
//     return (

//         <>
//             <Navbar />
//             <div>

//                 <br />
//                 <div className="ui container">
//                     <table className="ui celled striped table">
//                         <h1 style={{ fontSize: "large" }}>
//                             <a href="/">
//                                 <i className="angle left icon"></i>
//                             </a>{" "}
//                             {stock.name}({stock.symbol})
//                         </h1>

//                         {/* TradingView Widget BEGIN */}
//                         <div className="tradingview-widget-container" style={{ height: "500px", width: "100%" }}>
//                             <div className="tradingview-widget-container__widget" style={{ height: "30px", width: "100%" }}></div>
//                             <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
//                             <script type="text/javascript">
//                                 {`
//                 new TradingView.widget({
//                   "autosize": true,
//                   "symbol": "${stock.exchange}:${stock.symbol}",
//                   "timezone": "Asia/Kolkata",
//                   "theme": "dark",
//                   "style": "1",
//                   "locale": "en",
//                   "withdateranges": true,
//                   "range": "YTD",
//                   "hide_side_toolbar": false,
//                   "allow_symbol_change": true,
//                   "details": true,
//                   "hotlist": true,
//                   "calendar": false,
//                   "show_popup_button": true,
//                   "popup_width": "1000",
//                   "popup_height": "650",
//                   "support_host": "https://www.tradingview.com"
//                 });
//               `}
//                             </script>
//                         </div>
//                         {/* TradingView Widget END */}

//                         <br />
//                         <br />
//                         <br />
//                         <br />

//                         {/* <form method="post" action="/apply_strategy" className="ui form">
//                             <div className="ui grid">
//                                 <div className="six wide column">
//                                     <div className="field">
//                                         <label>Select Strategy</label>
//                                         <select name="strategy_id" className="ui fluid dropdown">
//                                             {strategies.map((strategy) => (
//                                                 <option key={strategy.id} value={strategy.id}>
//                                                     {strategy.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                 </div>

//                                 <div className="six wide column">
//                                     <input type="hidden" name="stock_id" value={stock.id} />
//                                     <button
//                                         type="submit"
//                                         className="ui primary button"
//                                         style={{ marginTop: "24px" }}
//                                     >
//                                         <i className="chart line icon"></i> Apply Strategy
//                                     </button>

//                                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//                                     <a href="/trade_stocks" className="details-btn">
//                                         Trade Manually
//                                     </a>
//                                 </div>
//                             </div>
//                         </form> */}

//                         <br />
//                         <br />

//                         <strong>
//                             <h2 style={{ fontSize: "medium" }}>Prices</h2>
//                         </strong>
//                         {/* <thead>
//                             <tr>
//                                 <th>Date</th>
//                                 <th>Open</th>
//                                 <th>High</th>
//                                 <th>Low</th>
//                                 <th>Close</th>
//                                 <th>Volume</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {bars.map((bar, index) => (
//                                 <tr key={index}>
//                                     <td>{bar.date}</td>
//                                     <td>{bar.open}</td>
//                                     <td>{bar.high}</td>
//                                     <td>{bar.low}</td>
//                                     <td>{bar.close}</td>
//                                     <td>{bar.volume}</td>
//                                 </tr>
//                             ))}
//                         </tbody> */}
//                     </table>
//                 </div>
//             </div>
//         </>
//     );
// }

// export default StockDetails;



import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import BuySellButtons from "../Buttons/BuySellButtons";
import BuySellModal from "../Buttons/BuySellModal.js";

function StockDetails() {
    const { symbol } = useParams(); // ✅ get symbol from URL


    const [modalType, setModalType] = useState(null); // 'buy' or 'sell'

    const openBuyPopup = () => setModalType("buy");
    const openSellPopup = () => setModalType("sell");
    const closeModal = () => setModalType(null);

    const handleConfirm = async ({ type, symbol, quantity, price }) => {
        console.log(`Confirmed ${type.toUpperCase()} of ${quantity} shares at ₹${price} for ${symbol}`);

        const transaction = {
            transactionType: type.toUpperCase(),  // "BUY" or "SELL"
            symbol: symbol,
            shares: quantity,
            price: price,
            userId: "123",          // Replace with actual user ID (e.g., from auth)
            // stockId: "some-stock-id",        // Replace with actual stock ID (e.g., from DB)
            totalValue: quantity * price,
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
    };



    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;

        script.onload = () => {
            if (window.TradingView) {
                new window.TradingView.widget({
                    autosize: true,
                    symbol: `NASDAQ:${symbol}`, // or modify exchange based on real data
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

                {/* TradingView Widget Container */}
                <div id="tradingview_container">
                    <div
                        id="tradingview_widget"
                        style={{ height: "500px", width: "100%" }}
                    ></div>
                </div>
            </div>

            <BuySellButtons onBuyClick={openBuyPopup} onSellClick={openSellPopup} />

            {/* Modal */}
            <BuySellModal
                type={modalType}
                open={modalType !== null}
                onClose={closeModal}
                onConfirm={handleConfirm}
                symbol={symbol}
                price={100} // Replace with actual price
            />
        </>
    );
}

export default StockDetails;
