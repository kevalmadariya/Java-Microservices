import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Badge, Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../Navbar/Navbar';

const BankTransactions = () => {
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [users, setUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const bankId = localStorage.getItem('bankId');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bankId) {
      setShowLoginModal(true);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch approved loans for this bank
        const response = await fetch(
          `http://localhost:8081/loan-microservice/api/bank/${bankId}/approved`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch approved loans');
        
        const loansData = await response.json();
        setApprovedLoans(loansData);
        
        // Extract unique user IDs
        const userIds = [...new Set(loansData.map(loan => loan.userId))];
        
        // Fetch user details for all unique users
        setLoadingUsers(true);
        const userPromises = userIds.map(userId => 
          fetch(`http://localhost:8081/user-authentication-microservice/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
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
        setError(err.message);
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

  const viewLoanDetails = async (loan) => {
    try {
      setSelectedLoan({
        ...loan,
        user: users[loan.userId],
        loanDetails: null // Initialize as null while loading
      });
      setShowDetailsModal(true);

      // Fetch additional loan details
      const loanDetailsRes = await fetch(
        `http://localhost:8081/loan-microservice/api/user-loans/${loan.userLoanDetailsId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!loanDetailsRes.ok) {
        throw new Error('Failed to fetch loan details');
      }

      const loanDetails = await loanDetailsRes.json();

      setSelectedLoan(prev => ({
        ...prev,
        loanDetails: loanDetails
      }));
    } catch (err) {
      console.error("Error fetching loan details:", err);
      setError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'disbursed':
        return <Badge bg="primary">Disbursed</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleDisburseLoan = async (loanId) => {
    try {
      const response = await fetch(
        `http://localhost:8081/loan-microservice/api/loan-status/${loanId}/disburse`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to disburse loan');
      }

      // Refresh the list after disbursement
      const updatedResponse = await fetch(
        `http://localhost:8081/loan-microservice/api/loan-status/bank/${bankId}/approved`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!updatedResponse.ok) {
        throw new Error('Failed to refresh loan data');
      }

      const updatedData = await updatedResponse.json();
      setApprovedLoans(updatedData);

      // Close details modal if open
      setShowDetailsModal(false);
    } catch (err) {
      console.error("Error disbursing loan:", err);
      setError(err.message);
    }
  };

  if (!bankId) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          You need to be logged in as a bank to view this page.
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading approved loans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

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
        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Loan Application Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedLoan ? (
              <div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h5>User Information</h5>
                    <p><strong>Name:</strong> {selectedLoan.user?.fullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedLoan.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedLoan.user?.phoneNumber || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h5>Loan Details</h5>
                    {selectedLoan.loanDetails ? (
                      <>
                        <p><strong>Amount Needed:</strong> ₹{selectedLoan.loanDetails.amtLoanNeeded?.toFixed(2) || 'N/A'}</p>
                        <p><strong>Status:</strong> {getStatusBadge(selectedLoan.status)}</p>
                        <p><strong>Final Score:</strong> {selectedLoan.finalScore?.toFixed(2) || 'N/A'}</p>
                        <p><strong>Interest Rate:</strong> {selectedLoan.interestRate ? `${selectedLoan.interestRate}%` : 'N/A'}</p>
                        <p><strong>Approved On:</strong> {new Date(selectedLoan.updatedAt).toLocaleString()}</p>
                      </>
                    ) : (
                      <Spinner animation="border" size="sm" />
                    )}
                  </div>
                </div>

                {selectedLoan.status.toLowerCase() === 'approved' && (
                  <div className="d-flex gap-2 mt-3">
                    <Button 
                      variant="primary" 
                      onClick={() => handleDisburseLoan(selectedLoan.id)}
                    >
                      Disburse Loan
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Spinner animation="border" />
            )}
          </Modal.Body>
        </Modal>

        <h2 className="mb-4">Approved Loan Transactions</h2>
        
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Approved Loans</h5>
              <div>
                <Badge bg="success" className="me-1">
                  {approvedLoans.filter(l => l.status === 'approved').length}
                </Badge> Ready for Disbursement
                <Badge bg="primary" className="ms-2 me-1">
                  {approvedLoans.filter(l => l.status === 'disbursed').length}
                </Badge> Disbursed
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
                {/* <th>Loan Amount</th> */}
                <th>Interest Rate</th>
                <th>Status</th>
                <th>Approved Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedLoans.length > 0 ? (
                approvedLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{users[loan.userId]?.email || 'Loading...'}</td>
                    {/* <td>₹{loan.loanDetails?.amtLoanNeeded?.toFixed(2) || 'N/A'}</td> */}
                    <td>{loan.interestRate ? `${loan.interestRate}%` : 'N/A'}</td>
                    <td>{getStatusBadge(loan.status)}</td>
                    <td>{new Date(loan.updatedAt).toLocaleDateString()}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No approved loans found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

export default BankTransactions;