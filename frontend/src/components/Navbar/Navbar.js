import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // external CSS file
import AuthButton from '../Buttons/AuthButton';

const Navbar = () => {
    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <div className="navbar-brand"><a className="nav-link" href="/">Trade App</a></div>
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto">
                    <li className="nav-item"><a className="nav-link" href="/">Stocks</a></li>
                    <li className="nav-item"><a className="nav-link" href="/portfolio">Portfolio Insights</a></li>
                    {/* <li className="nav-item"><a className="nav-link" href="/strategies">Strategies</a></li> */}
                    {/* <li className="nav-item"><a className="nav-link" href="/orders">Ordered by Algorithms</a></li> */}
                    <li className="nav-item"><a className="nav-link" href="/trade_stocks">Trade Manually</a></li>
                    {/* <li className="nav-item"><a className="nav-link" href="/recommendations">Recommendation</a></li> */}
                    {/* <li className="nav-item"><a className="nav-link" href="/predictions">Predict Future</a></li> */}
                    <li className="nav-item"><a className="nav-link" href="/transaction">History</a></li>
                    <li className="nav-item"><a className="nav-link" href="/loan">Apply for loan</a></li>
                </ul>
                <AuthButton />
            </div>
        </nav>
    );
};

export default Navbar;
