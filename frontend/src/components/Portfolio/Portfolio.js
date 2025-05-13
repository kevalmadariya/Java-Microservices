import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import "./Portfolio.css";
import { Modal, Button, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stockPrices, setStockPrices] = useState({});
  const [countdown, setCountdown] = useState(20);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const userId = localStorage.getItem('userId');

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8081/user-authentication-microservice/api/users/${userId}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  // Fetch real-time stock prices
  const fetchStockPrices = async () => {
    if (!holdings.length) return;

    setIsRefreshing(true);
    try {
      const pricePromises = holdings.map(holding =>
        axios.get(`http://localhost:8000/stock_price/${holding.stockId}`)
      );

      const responses = await Promise.all(pricePromises);
      const newPrices = {};

      responses.forEach((response, index) => {
        newPrices[holdings[index].stockId] = response.data.price;
      });

      setStockPrices(newPrices);

      // Update portfolio PnL based on new prices
      if (portfolio) {
        const totalPnl = holdings.reduce((sum, holding) => {
          const currentPrice = newPrices[holding.stockId] || holding.averageBuyPrice;
          return sum + (currentPrice - holding.averageBuyPrice) * holding.numberOfShares;
        }, 0);

        setPortfolio(prev => ({
          ...prev,
          pnl: totalPnl
        }));
      }
    } catch (err) {
      console.error("Error fetching stock prices:", err);
    } finally {
      setIsRefreshing(false);
      setCountdown(20); // Reset countdown after refresh
    }
  };

  // Countdown timer effect
  useEffect(() => {
    const timer = countdown > 0 && setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    if (countdown === 0) {
      fetchStockPrices();
    }

    return () => clearInterval(timer);
  }, [countdown]);

  // Initial data fetch and setup interval
  useEffect(() => {
    if (!userId) {
      setShowLoginModal(true);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user data first
        await fetchUserData();

        // Then fetch portfolio data
        const [portfolioRes, holdingsRes] = await Promise.all([
          fetch(`http://localhost:8081/portfolio-microservice/api/portfolio/${userId}`),
          fetch(`http://localhost:8081/portfolio-microservice/api/stock-holdings/user/${userId}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
          })
        ]);

        if (!portfolioRes.ok || !holdingsRes.ok) {
          throw new Error('Failed to fetch portfolio data');
        }

        const portfolioData = await portfolioRes.json();
        const holdingsData = await holdingsRes.json();

        setPortfolio(portfolioData);
        setHoldings(holdingsData);

        // Initial price fetch
        await fetchStockPrices();
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up interval for price updates (every 20 seconds)
    const priceInterval = setInterval(fetchStockPrices, 20000);
    return () => clearInterval(priceInterval);
  }, [userId]);

  // Calculate current value and PnL for each holding
  const getHoldingDetails = (holding) => {
    const currentPrice = stockPrices[holding.stockId] || holding.averageBuyPrice;
    const currentValue = currentPrice * holding.numberOfShares;
    const pnl = (currentPrice - holding.averageBuyPrice) * holding.numberOfShares;
    const pnlPercentage = ((currentPrice - holding.averageBuyPrice) / holding.averageBuyPrice) * 100;

    return {
      currentPrice,
      currentValue,
      pnl,
      pnlPercentage
    };
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  const handleManualRefresh = () => {
    if (!isRefreshing) {
      fetchStockPrices();
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Login Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            You need to be logged in to view your portfolio. Please login to continue.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleLoginRedirect}>
              Go to Login
            </Button>
          </Modal.Footer>
        </Modal>

        {!userId ? (
          <div className="text-center py-5">
            <h4>Please login to view your portfolio</h4>
            <Button variant="primary" onClick={handleLoginRedirect} className="mt-3">
              Login
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-muted">Loading your portfolio...</div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="portfolio-header">
                <h2 className="text-primary mb-0">📊 Portfolio Overview</h2>
                <br />
                {userData && (
                  <div className="welcome-message">
                    <span className="welcome-text">Welcome back, </span>
                    <span className="user-name">{userData.fullName}</span>
                    {/* <span className="welcome-emoji">👋</span> */}
                  </div>
                )}
              </div>
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

            {portfolio && (
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Total Invested</h6>
                      <h5 className="card-title text-success">${portfolio.investedAmount.toFixed(2)}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Balance</h6>
                      <h5 className="card-title text-primary">${portfolio.balance.toFixed(2)}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Current Value</h6>
                      <h5 className="card-title text-info">
                        ${(portfolio.investedAmount + portfolio.pnl).toFixed(2)}
                      </h5>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Profit / Loss</h6>
                      <h5 className={`card-title ${portfolio.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                        ${portfolio.pnl.toFixed(2)} ({((portfolio.pnl / portfolio.investedAmount) * 100).toFixed(2)}%)
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h4 className="mb-3">📁 Stock Holdings</h4>
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped custom-table">
                <thead className="table-light">
                  <tr>
                    <th>Stock</th>
                    <th>Current Price</th>
                    <th>Shares</th>
                    <th>Invested</th>
                    <th>Avg Buy Price</th>
                    <th>PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const { currentPrice, currentValue, pnl, pnlPercentage } = getHoldingDetails(holding);

                    return (
                      <tr key={holding.holdingId}>
                        <td>{holding.stockId}</td>
                        <td>${currentPrice.toFixed(2)}</td>
                        <td>{holding.numberOfShares}</td>
                        <td>${holding.investmentAmount.toFixed(2)}</td>
                        <td>${holding.averageBuyPrice.toFixed(2)}</td>
                        <td className={pnl >= 0 ? 'text-success' : 'text-danger'}>
                          ${pnl.toFixed(2)} ({pnlPercentage.toFixed(2)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Portfolio;