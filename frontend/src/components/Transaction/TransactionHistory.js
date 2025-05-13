// import React, { useEffect, useState } from 'react';
// import ApexCharts from 'apexcharts';
// import './TransactionHistory.css'
// import Navbar from '../Navbar/Navbar';

// const TransactionHistory = () => {
//     const [activeTab, setActiveTab] = useState('graph');
//     const [chartType, setChartType] = useState('bar');
//     const [timeRange, setTimeRange] = useState('individual');
//     const [chart, setChart] = useState(null);

//     const handleTabChange = (tab) => setActiveTab(tab);
//     const toggleChartType = () => setChartType(prev => (prev === 'bar' ? 'line' : 'bar'));

//     const loadChart = async () => {
//         const res = await fetch('/profit_loss_chart');
//         const data = await res.json();

//         let categories = [], profitLossValues = [];

//         if (timeRange === 'individual') {
//             categories = data.timestamps;
//             profitLossValues = data.profit_losses;
//         } else {
//             const groupedData = {};
//             data.timestamps.forEach((timestamp, i) => {
//                 const date = new Date(timestamp);
//                 const key = timeRange === 'monthly'
//                     ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
//                     : `${date.getFullYear()}`;
//                 groupedData[key] = (groupedData[key] || 0) + data.profit_losses[i];
//             });
//             categories = Object.keys(groupedData);
//             profitLossValues = Object.values(groupedData);
//         }

//         const options = {
//             chart: { type: chartType, height: 350 },
//             xaxis: { categories },
//             series: [{ name: "Profit/Loss ($)", data: profitLossValues }],
//             plotOptions: {
//                 bar: {
//                     distributed: true,
//                     columnWidth: '40%',
//                     colors: {
//                         ranges: [
//                             { from: -10000, to: 0, color: "#f46a6a" },
//                             { from: 0, to: 10000, color: "#34c38f" }
//                         ]
//                     }
//                 }
//             },
//             stroke: { width: 2 },
//             tooltip: {
//                 y: { formatter: val => `$ ${val.toFixed(2)}` }
//             }
//         };

//         if (chart) {
//             chart.destroy();
//         }

//         const newChart = new ApexCharts(document.querySelector("#profitLossChart"), options);
//         newChart.render();
//         setChart(newChart);
//     };

//     useEffect(() => {
//         if (activeTab === 'graph') loadChart();
//     }, [timeRange, chartType, activeTab]);

//     return (
//         <>
//             <Navbar />
//             <div className="container mx-auto p-4 text-center">
//                 <h1 className="text-2xl font-bold mb-4">Transaction History</h1>

//                 {/* Tabs */}
//                 <div className="border-b border-gray-200 mb-4">
//                     <div className="flex justify-center space-x-4">
//                         <button onClick={() => handleTabChange('graph')}
//                             className={`px-4 py-2 ${activeTab === 'graph' ? 'border-b-2 font-bold' : ''}`}>
//                             Graph
//                         </button>
//                         <button onClick={() => handleTabChange('transactions')}
//                             className={`px-4 py-2 ${activeTab === 'transactions' ? 'border-b-2 font-bold' : ''}`}>
//                             Transactions
//                         </button>
//                     </div>
//                 </div>

//                 {/* Graph View */}
//                 {activeTab === 'graph' && (
//                     <div className="bg-white p-4 border rounded-lg">
//                         <div className="mb-4 flex items-center justify-center gap-4">
//                             <label htmlFor="timeRange"><b>View By:</b></label>
//                             <select id="timeRange" value={timeRange}
//                                 onChange={e => setTimeRange(e.target.value)}
//                                 className="border p-1 rounded">
//                                 <option value="individual">Daily</option>
//                                 <option value="monthly">Monthly</option>
//                                 <option value="yearly">Yearly</option>
//                             </select>
//                             <button onClick={toggleChartType} className="bg-gray-200 px-3 py-1 rounded">
//                                 Switch to {chartType === 'bar' ? 'Line' : 'Bar'} Chart
//                             </button>
//                         </div>
//                         <div id="profitLossChart" className="h-64 bg-gray-100 flex items-center justify-center" />
//                     </div>
//                 )}

//                 {/* Transactions View */}
//                 {activeTab === 'transactions' && (
//                     <div className="bg-white p-4 border rounded-lg overflow-auto max-h-[400px]">
//                         <table className="min-w-full text-left">
//                             <thead className="bg-gray-200">
//                                 <tr>
//                                     <th className="py-2 px-4 border">Date</th>
//                                     <th className="py-2 px-4 border">Symbol</th>
//                                     <th className="py-2 px-4 border">Type</th>
//                                     <th className="py-2 px-4 border">Shares</th>
//                                     <th className="py-2 px-4 border">Price</th>
//                                     <th className="py-2 px-4 border">Profit/Loss</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {/* Replace with mapped data from props/API */}
//                                 <tr>
//                                     <td className="py-2 px-4 border">2025-05-01</td>
//                                     <td className="py-2 px-4 border">AAPL</td>
//                                     <td className="py-2 px-4 border text-green-600">BUY</td>
//                                     <td className="py-2 px-4 border">10</td>
//                                     <td className="py-2 px-4 border">$150</td>
//                                     <td className="py-2 px-4 border">$100</td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </>
//     );
// };

// export default TransactionHistory;
import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Navbar from "../Navbar/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            setErrorMessage("Please login to view transaction history");
            setShowErrorModal(true);
            setIsLoading(false);
            return;
        }

        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8081/portfolio-microservice/api/transactions/user/${userId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem('token')}`
                          },
                    }
                );
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || `Failed to fetch transactions. Status: ${res.status}`);
                }
                
                const data = await res.json();
                setTransactions(data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setErrorMessage(error.message || "Failed to load transaction history");
                setShowErrorModal(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [userId]);

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
        // Optional: Redirect to login page when closing the error modal
        // if (!userId) {
        //     window.location.href = '/login';
        // }
    };

    return (
        <>
            <Navbar />
            <div className="ui container">
                <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>

                {isLoading ? (
                    <p>Loading transaction history...</p>
                ) : transactions.length === 0 ? (
                    <p>No transactions found</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">Date</th>
                                    <th className="border p-2">Type</th>
                                    <th className="border p-2">Symbol</th>
                                    <th className="border p-2">Shares</th>
                                    <th className="border p-2">Price</th>
                                    <th className="border p-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr 
                                        key={transaction.transactionId} 
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="border p-2">
                                            {new Date(transaction.timestamp).toLocaleString()}
                                        </td>
                                        <td className={`border p-2 capitalize ${
                                            transaction.transactionType === 'BUY' 
                                                ? 'text-green-600' 
                                                : 'text-red-600'
                                        }`}>
                                            {transaction.transactionType}
                                        </td>
                                        <td className="border p-2">{transaction.symbol}</td>
                                        <td className="border p-2">{transaction.shares}</td>
                                        <td className="border p-2">${transaction.price.toFixed(2)}</td>
                                        <td className="border p-2">${transaction.totalValue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Error Modal */}
            <Modal show={showErrorModal} onHide={handleCloseErrorModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseErrorModal}>
                        Close
                    </Button>
                    {!userId && (
                        <Button 
                            variant="success" 
                            onClick={() => window.location.href = '/login'}
                        >
                            Go to Login
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TransactionHistory;