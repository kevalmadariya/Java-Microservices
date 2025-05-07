import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import "./StockList.css";

const StockList = () => {
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [countdown, setCountdown] = useState(5);

    const navigate = useNavigate();

    useEffect(() => {
        fetchStockData(); // Initial fetch
        setCountdown(20);
    
        const fetchInterval = setInterval(() => {
            fetchStockData();
            setCountdown(20);
        }, 20000); // fetch every 10 sec
    
        const countdownInterval = setInterval(() => {
            setCountdown(prev => (prev > 1 ? prev - 1 : 20));
        }, 1000); // ⬅️ decrease every 1 sec
    
        return () => {
            clearInterval(fetchInterval);
            clearInterval(countdownInterval);
        };
    }, []);
    

    const fetchStockData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/all_stock_price');
            console.log("-1", response.data.data); // DEBUG

            let data = response.data.data
            // Ensure it's an array
            setStocks(data);
            setFilteredStocks(data);

        } catch (err) {
            console.error("Error fetching stock prices:", err);
            setStocks([]);
            setFilteredStocks([]);
        }
    };


    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = stocks.filter(stock =>
            stock.symbol.toLowerCase().includes(query) ||
            stock.name.toLowerCase().includes(query)
        );
        setFilteredStocks(filtered);
    };

    return (
        <>
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">📈 Stock List</h1>

                <div className="text-sm text-gray-500 mb-2">
                    🔄 Price updates in {countdown} second{countdown !== 1 ? "s" : ""}
                </div>

                <div className="filter-section mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="🔍 Search stocks..."
                        className="border p-2 mr-2"
                    />
                </div>

                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Ticker</th>
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStocks.map(stock => (
                            <tr key={stock.symbol}
                                onClick={() => navigate(`/stock_details/${stock.symbol}`)}
                                className="cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                                <td className="border p-2">{stock.symbol}</td>
                                <td className="border p-2">{stock.name}</td>
                                <td className="border p-2">{stock.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default StockList;
