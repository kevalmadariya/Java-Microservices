import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import "./Portfolio.css"; // custom styles
import { Modal, Button } from 'react-bootstrap'; // Import modal components
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Check if userId exists
    if (!userId) {
      setShowLoginModal(true);
      setIsLoading(false);
      return;
    }

    const fetchPortfolioData = async () => {
      try {
        const [portfolioRes, holdingsRes] = await Promise.all([
          fetch(`http://localhost:8081/portfolio-microservice/api/portfolio/${userId}`),
          fetch(`http://localhost:8081/portfolio-microservice/api/stock-holdings/user/${userId}`)
        ]);

        if (!portfolioRes.ok || !holdingsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const portfolioData = await portfolioRes.json();
        const holdingsData = await holdingsRes.json();

        setPortfolio(portfolioData);
        setHoldings(holdingsData);
      } catch (err) {
        console.error("Error fetching portfolio data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [userId]);

  const handleLoginRedirect = () => {
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        {/* Login Modal */}
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
            <h2 className="mb-4 text-primary">📊 Portfolio Overview</h2>
            
            {portfolio && (
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Total Invested</h6>
                      <h5 className="card-title text-success">${portfolio.investedAmount.toFixed(2)}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Balance</h6>
                      <h5 className="card-title text-primary">${portfolio.balance.toFixed(2)}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Profit / Loss</h6>
                      <h5 className={`card-title ${portfolio.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                        ${portfolio.pnl.toFixed(2)}
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
                    <th>Shares</th>
                    <th>Investment</th>
                    <th>Avg Buy Price</th>
                    <th>PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.holdingId}>
                      <td>{holding.stockId}</td>
                      <td>{holding.numberOfShares}</td>
                      <td>${holding.investmentAmount.toFixed(2)}</td>
                      <td>${holding.averageBuyPrice.toFixed(2)}</td>
                      <td className={holding.pnl >= 0 ? 'text-success' : 'text-danger'}>
                        ${holding.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
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