import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import AuthButton from '../Buttons/AuthButton';

const Navbar = () => {
  // Check if user or bank is logged in
  const userId = localStorage.getItem('userId');
  const bankId = localStorage.getItem('bankId');
  const isUserLoggedIn = !!userId;
  const isBankLoggedIn = !!bankId;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <div className="navbar-brand">
        <Link className="nav-link" to="/">Trade App</Link>
      </div>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {/* Common links for all users */}
          <li className="nav-item">
            <Link className="nav-link" to="/">Stocks</Link>
          </li>

          {/* Links for regular users */}
          {isUserLoggedIn && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/portfolio">Portfolio Insights</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/trade_stocks">Trade Manually</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/transaction">History</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/loan">Apply for loan</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my_loan">My loan</Link>
              </li>
            </>
          )}

          {/* Links for bank users */}
          {isBankLoggedIn && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/bank_dashboard">Loan Applications</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/bank/transactions">Transaction Approvals</Link>
              </li>
            </>
          )}
        </ul>
        <AuthButton />
      </div>
    </nav>
  );
};

export default Navbar;