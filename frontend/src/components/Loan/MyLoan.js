import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Badge, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

const MyLoans = () => {
    const navigate = useNavigate()
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            setError('User authentication required');
            setLoading(false);
            return;
        }

        const fetchUserLoans = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `http://localhost:8081/loan-microservice/api/loan-status/user/${userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch loan applications');
                }

                const data = await response.json();
                console.log(data)
                setLoans(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserLoans();
    }, [userId]);

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

    const handleViewDetails = (loan) => {
        setSelectedLoan(loan);
        setShowDetailsModal(true);
    };

    const handleNewLoan = () => {
        navigate('/loan');
    };

    if (!userId) {
        return (
            <div className="container mt-5">
                <Alert variant="danger">
                    You need to be logged in to view your loan applications.
                </Alert>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p>Loading your loan applications...</p>
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>My Loan Applications</h2>
                    <Button variant="primary" onClick={handleNewLoan}>
                        Apply for New Loan
                    </Button>
                </div>

                {loans.length > 0 ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Bank</th>
                                {/* <th>Loan Amount</th> */}
                                <th>Interest Rate</th>
                                <th>Status</th>
                                <th>Applied Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.map((loan) => (
                                <tr key={loan.loanStatus.id}>
                                    <td>{loan.bankName || 'N/A'}</td>
                                    {/* <td>₹{loan.loanStatus.loanDetails?.amtLoanNeeded?.toLocaleString() || 'N/A'}</td> */}
                                    <td>{loan.loanStatus.interestRate ? `${loan.loanStatus.interestRate}%` : 'N/A'}</td>
                                    <td>{getStatusBadge(loan.loanStatus.status)}</td>
                                    <td>{new Date(loan.loanStatus.updatedAt).toLocaleDateString()}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleViewDetails(loan)}
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Alert variant="info">
                        You haven't applied for any loans yet.
                        {/* <div className="mt-2">
                            <Button variant="primary" onClick={handleNewLoan}>
                                Apply for a Loan
                            </Button>
                        </div> */}
                    </Alert>
                )}

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
                                        <h5>Loan Information</h5>
                                        <p><strong>Bank:</strong> {loans.find(l => l.loanStatus.id === selectedLoan.loanStatus.id)?.bankName || 'N/A'}</p>
                                        <p><strong>Loan ID:</strong> {selectedLoan.loanStatus.id || 'N/A'}</p>
                                        <p><strong>Status:</strong> {getStatusBadge(selectedLoan.loanStatus.status)}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h5>Financial Details</h5>
                                        <p><strong>Amount Requested:</strong> ₹{selectedLoan.userLoanDetails?.amtLoanNeeded?.toFixed(2) || 'N/A'}</p>
                                        <p><strong>Interest Rate:</strong> {selectedLoan.loanStatus.interestRate ? `${selectedLoan.loanStatus.interestRate}%` : 'N/A'}</p>
                                        <p><strong>Tenure:</strong> {selectedLoan.tenure || 'N/A'} months</p>
                                        {/* <p><strong>EMI Amount:</strong> ₹{selectedLoan.emiAmt?.toFixed(2) || 'N/A'}</p> */}
                                        <p><strong>Applied On:</strong> {new Date(selectedLoan.loanStatus.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* <div className="row">
                                    <div className="col-md-6">
                                        <h5>Loan Purpose</h5>
                                        <p>{selectedLoan.loanDetails?.purpose || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h5>Collateral Details</h5>
                                        <p>{selectedLoan.loanDetails?.collateralDetails || 'N/A'}</p>
                                    </div>
                                </div> */}

                                {selectedLoan.comments && (
                                    <div className="mt-3">
                                        <h5>Additional Comments</h5>
                                        <p>{selectedLoan.comments}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
};

export default MyLoans;