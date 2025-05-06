// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import LoginForm from './components/User/Login';
import SignupForm from './components/User/Signup';
import StockList from './components/Index/StockList';
import TransactionHistory from './components/Transaction/TransactionHistory';
import Portfolio from './components/Portfolio/Portfolio';
import TradeStocks from './components/TradeStocks/TradeStocks';
import StockDetails from './components/StockDetails/StockDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/" element={<StockList />} />
        <Route path="/transaction" element={<TransactionHistory />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/trade_stocks" element={<TradeStocks />} />
        <Route path="/stock_details/:symbol" element={<StockDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
