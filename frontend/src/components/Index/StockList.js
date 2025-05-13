import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { Button, Badge } from 'react-bootstrap';
import "./StockList.css";

const StockList = () => {
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [countdown, setCountdown] = useState(20);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchStockData(); // Initial fetch
        setCountdown(20);

        const fetchInterval = setInterval(() => {
            fetchStockData();
            setCountdown(20);
        }, 20000); // fetch every 20 sec

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
            setIsRefreshing(true);
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
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleManualRefresh = () => {
        fetchStockData();
        setCountdown(20);
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="text-2xl font-bold">📈 Stock List</h1>
                    <div className="d-flex align-items-center">
                        <Button
                            variant="outline-primary"
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            className="me-2"
                        >
                            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                        </Button>
                        <Badge bg="light" text="dark">
                            Next update in: {countdown}s
                        </Badge>
                    </div>
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

                <table className="table-auto w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-left">Ticker</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStocks.map((stock) => (
                            <tr
                                key={stock.symbol}
                                onClick={() => navigate(`/stock_details/${stock.symbol}`)}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="p-3 border border-black">{stock.symbol}</td>
                                <td className="p-3 border border-black">{stock.name}</td>
                                <td className="p-3 border border-black">{stock.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
        </div >
        </>
    );
};

export default StockList;