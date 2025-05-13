import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { Modal, Button, Badge, Table, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BankDashboard = () => {
  const [loanStatuses, setLoanStatuses] = useState([]);
  const [users, setUsers] = useState({}); // Store users by ID
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const bankId = localStorage.getItem('bankId');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [bank, setBank] = useState({})

  const getTrustScoreStatus = (score) => {
    if (score >= 75) return { text: 'Excellent', color: 'success' };
    if (score >= 55) return { text: 'Good', color: 'primary' };
    if (score >= 35) return { text: 'Average', color: 'warning' };
    return { text: 'Poor', color: 'danger' };
  };

  useEffect(() => {
    if (!bankId) {
      setShowLoginModal(true);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:8081/loan-microservice/api/bank/" + bankId)
        const data = await response.json()
        // console.log(-1,response)
        setBank(data)
        // Fetch all loan statuses for this bank
        const statusResponse = await fetch(
          `http://localhost:8081/loan-microservice/api/loan-status/bank/${bankId}`
        );
        if (!statusResponse.ok) throw new Error('Failed to fetch loan statuses');

        const statusData = await statusResponse.json();
        setLoanStatuses(statusData);

        // Extract unique user IDs
        const userIds = [...new Set(statusData.map(loan => loan.userId))];

        // Fetch user details for all unique users
        setLoadingUsers(true);
        const userPromises = userIds.map(userId =>
          fetch(`http://localhost:8081/user-authentication-microservice/api/users/${userId}`)
            .then(res => res.ok ? res.json() : null)
        );

        const userResults = await Promise.all(userPromises);

        // Create users map
        const usersMap = {};
        userResults.forEach((user, index) => {
          if (user) {
            usersMap[userIds[index]] = user;
          }
        });

        setUsers(usersMap);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, [bankId]);

  const handleLoginRedirect = () => {
    window.location.href = '/bank_login';
  };

  const viewLoanDetails = async (loanStatus) => {
    try {
      // Fetch loan details and stock trust scores in parallel
      const [loanDetailsRes, stockScoresRes, traderTrust] = await Promise.all([
        fetch(`http://localhost:8081/loan-microservice/api/user-loans/${loanStatus.userLoanDetailsId}`),
        fetch(`http://localhost:8086/api/stock-trust/score/${loanStatus.userLoanDetailsId}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`http://localhost:8086/api/trader-trust/user/${loanStatus.userId}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      ]);

      if (!loanDetailsRes.ok) throw new Error('Failed to fetch loan details');
      if (!stockScoresRes.ok) throw new Error('Failed to fetch stock scores');
      if (!traderTrust.ok) throw new Error('Failed to fetch trust scores');

      const loanDetails = await loanDetailsRes.json();
      const stockScores = await stockScoresRes.json();
      const tradeScores = await traderTrust.json();

      setSelectedLoan({
        ...loanStatus,
        user: users[loanStatus.userId],
        loanDetails: loanDetails,
        stockScores: stockScores,
        tradeScores: tradeScores // Add stock scores to selected loan
      });
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching loan details:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleStatusUpdate = async (loanId, newStatus) => {
    console.log(-2, loanId)
    try {
      const response = await fetch(
        `http://localhost:8081/loan-microservice/api/loan-status/${loanId}/${newStatus}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',

          },
          body: JSON.stringify({})
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setLoanStatuses(loanStatuses.map(loan =>
        loan.id === loanId ? { ...loan, status: newStatus } : loan
      ));

      if (selectedLoan?.id === loanId) {
        setSelectedLoan({ ...selectedLoan, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating loan status:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        {/* Login Modal */}
        <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Bank Login Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            You need to be logged in as a bank to view this dashboard.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleLoginRedirect}>
              Bank Login
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Loan Details Modal */}
        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Loan Application Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedLoan && (
              <div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h5>User Information</h5>
                    <p><strong>Name:</strong> {selectedLoan.user?.fullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedLoan.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedLoan.user?.phoneNumber || 'N/A'}</p>
                    <p>
                      <strong>User trust score:</strong> {selectedLoan.tradeScores?.score || 'N/A'}
                      {selectedLoan.tradeScores?.score && (
                        <>
                          {' '}
                          <Badge bg={getTrustScoreStatus(selectedLoan.tradeScores.score).color}>
                            {getTrustScoreStatus(selectedLoan.tradeScores.score).text}
                          </Badge>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h5>Loan Details</h5>
                    <p><strong>Amount Needed:</strong> ₹{selectedLoan.loanDetails?.amtLoanNeeded?.toFixed(2) || 'N/A'}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedLoan.status)}</p>
                    <p><strong>Interest Rate:</strong> {selectedLoan.interestRate ? `${selectedLoan.interestRate}%` : 'N/A'}</p>
                    {/* <p><strong>Applied On:</strong> {new Date(selectedLoan.loanDetails?.createdAt).toLocaleString()}</p> */}
                  </div>
                </div>

                {/* Stock Trust Scores Section */}
                <div className="mt-4">
                  <h5>Stock Trust Analysis</h5>
                  {selectedLoan.stockScores?.length > 0 ? (
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Stock Symbol</th>
                            <th>Fundamentally Strong</th>
                            <th>Current Price</th>
                            {/* <th>Predicted Price</th> */}
                            <th>Long Term Forecast</th>
                            <th>Arima Forecast</th>
                            {/* <th>Short Term Recommendation</th> */}
                            <th>Analysis Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedLoan.stockScores.map((score) => (
                            <tr key={score.id}>
                              <td>{score.symbol}</td>
                              <td>{score.is_fundamently_strong ? '✅ Yes' : '❌ No'}</td>
                              <td>{score.current_price}</td>
                              {/* <td>{score.predictedPrice?.toFixed(2)}</td> */}
                              <td>{score.is_long_term}</td>
                              <td>{score.arima_forcast}</td>
                              {/* <td>{score.recommendation}</td> */}
                              <td>{new Date(score.date).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="alert alert-info">No stock analysis available for this loan</div>
                  )}
                </div>

                <div className="d-flex gap-2 mt-4">
                  <Button
                    variant="success"
                    onClick={() => handleStatusUpdate(selectedLoan.id, 'approved')}
                    disabled={selectedLoan.status === 'approved'}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleStatusUpdate(selectedLoan.id, 'rejected')}
                    disabled={selectedLoan.status === 'rejected'}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => handleStatusUpdate(selectedLoan.id, 'pending')}
                    disabled={selectedLoan.status === 'pending'}
                  >
                    Set Pending
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>

        {!bankId ? (
          <div className="text-center py-5">
            <h4>Please login as a bank to view this dashboard</h4>
            <Button variant="primary" onClick={handleLoginRedirect} className="mt-3">
              Bank Login
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading loan applications...</p>
          </div>
        ) : (
          <>
            <h2 className="mb-4">Bank Loan Dashboard</h2>
            <br />
            {bank && (
              <div className="welcome-message">
                <span className="welcome-text">Welcome back, </span>
                <span className="user-name">{bank.name}</span>
                {/* <span className="welcome-emoji">👋</span> */}
              </div>
            )}
            <br />
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Loan Applications</h5>
                  <div>
                    <span className="me-3">
                      <Badge bg="success" className="me-1">
                        {loanStatuses.filter(l => l.status === 'approved').length}
                      </Badge> Approved
                    </span>
                    <span className="me-3">
                      <Badge bg="warning" text="dark" className="me-1">
                        {loanStatuses.filter(l => l.status === 'pending').length}
                      </Badge> Pending
                    </span>
                    <span>
                      <Badge bg="danger" className="me-1">
                        {loanStatuses.filter(l => l.status === 'rejected').length}
                      </Badge> Rejected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading user details...</span>
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loanStatuses.map((loan) => (
                    <tr key={loan.id}>
                      <td>{users[loan.userId]?.email || 'Loading...'}</td>
                      <td>{getStatusBadge(loan.status)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => viewLoanDetails(loan)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BankDashboard;