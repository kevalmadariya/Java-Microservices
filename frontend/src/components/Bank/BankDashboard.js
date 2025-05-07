import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
// import "./BankDashboard.css"; // custom styles
import { Modal, Button, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BankDashboard = () => {
  const [loanStatuses, setLoanStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const bankId = localStorage.getItem('bankId');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!bankId) {
      setShowLoginModal(true);
      setIsLoading(false);
      return;
    }

    const fetchLoanStatuses = async () => {
      try {
        // Fetch all loan statuses for this bank
        const response = await fetch(`http://localhost:8081/loan-microservice/api/loan-status/bank/${bankId}`);
        if (!response.ok) throw new Error('Failed to fetch loan statuses');
        
        const data = await response.json();
        setLoanStatuses(data);
      } catch (err) {
        console.error("Error fetching loan statuses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoanStatuses();
  }, [bankId]);

  const handleLoginRedirect = () => {
    window.location.href = '/bank_login';
  };

  const viewLoanDetails = async (loanStatus) => {
    try {
      // Fetch additional details for the selected loan
      const [userRes, loanDetailsRes] = await Promise.all([
        fetch(`http://localhost:8081/user-authentication-microservice/api/users/${loanStatus.userId}`),
        fetch(`http://localhost:8083/loan-microservice/api/user-loans/${loanStatus.userLoanDetailsId}`)
      ]);

      if (!userRes.ok || !loanDetailsRes.ok) {
        throw new Error('Failed to fetch loan details');
      }

      const userData = await userRes.json();
      const loanDetails = await loanDetailsRes.json();

      setSelectedLoan({
        ...loanStatus,
        user: userData,
        loanDetails: loanDetails
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
    try {
      const response = await fetch(`http://localhost:8083/loan-microservice/api/loan-status/${loanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

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
        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Loan Application Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedLoan && (
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
                    <p><strong>Amount Needed:</strong> ${selectedLoan.loanDetails?.amtLoanNeeded?.toFixed(2) || 'N/A'}</p>
                    <p><strong>Purpose:</strong> {selectedLoan.loanDetails?.purpose || 'N/A'}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedLoan.status)}</p>
                    <p><strong>Final Score:</strong> {selectedLoan.finalScore?.toFixed(2) || 'N/A'}</p>
                    <p><strong>Interest Rate:</strong> {selectedLoan.interestRate ? `${selectedLoan.interestRate}%` : 'N/A'}</p>
                  </div>
                </div>


                <div className="d-flex gap-2 mt-3">
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
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading loan applications...</p>
          </div>
        ) : (
          <>
            <h2 className="mb-4 text-primary">🏦 Bank Loan Dashboard</h2>
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Loan Applications</h5>
                  <div>
                    <span className="me-3">
                      <Badge bg="success" className="me-1">{loanStatuses.filter(l => l.status === 'approved').length}</Badge> Approved
                    </span>
                    <span className="me-3">
                      <Badge bg="warning" text="dark" className="me-1">{loanStatuses.filter(l => l.status === 'pending').length}</Badge> Pending
                    </span>
                    <span>
                      <Badge bg="danger" className="me-1">{loanStatuses.filter(l => l.status === 'rejected').length}</Badge> Rejected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Application ID</th>
                    <th>User ID</th>
                    <th>Final Score</th>
                    <th>Status</th>
                    <th>Interest Rate</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loanStatuses.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.id.substring(0, 8)}...</td>
                      <td>{loan.userId.substring(0, 8)}...</td>
                      <td>{loan.finalScore?.toFixed(2) || 'N/A'}</td>
                      <td>{getStatusBadge(loan.status)}</td>
                      <td>{loan.interestRate ? `${loan.interestRate}%` : 'N/A'}</td>
                      <td>{new Date(loan.updatedAt).toLocaleString()}</td>
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
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BankDashboard;