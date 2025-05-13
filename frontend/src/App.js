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
import AddBankForm from './components/Bank/AddBankForm';
import BankLogin from './components/Bank/BankLogin';
import BankDashboard from './components/Bank/BankDashboard';
import LoanApplyForm from './components/Loan/LoanApplyForm';
import ViewEligibleBanks from './components/Loan/ViewEligibleBanks';
import BankTransactions from './components/Bank/BankTransactions';
import MyLoans from './components/Loan/MyLoan';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/bank_login" element={< BankLogin />} />

          <Route path="/signup" element={<SignupForm />} />
          <Route path="/bank_signup" element={<AddBankForm />} />

          <Route path="/" element={<StockList />} />

          <Route path="/bank_dashboard" element={<BankDashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />

          <Route path="/my_loan" element={<MyLoans />} />
          <Route path="/loan" element={<LoanApplyForm />} />
          <Route path="/eligible_banks" element={<ViewEligibleBanks />} />

          <Route path="/bank/transactions" element={<BankTransactions />} />
          <Route path="/transaction" element={<TransactionHistory />} />
          <Route path="/trade_stocks" element={<TradeStocks />} />
          <Route path="/stock_details/:symbol" element={<StockDetails />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
