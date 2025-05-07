import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';

function ViewEligibleBanks() {
    const location = useLocation();
    const navigate = useNavigate();
    const { loanId } = useParams();
    const [eligibleBanks, setEligibleBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pledgedStocks, setPledgedStocks] = useState([]);

    useEffect(() => {
        // Get data from navigation state
        if (location.state) {
            const { loanId: stateLoanId, pledgedStock } = location.state;
            setPledgedStocks(pledgedStock || []);
            
            // Call API to fetch eligible banks
            fetchEligibleBanks(stateLoanId || loanId, pledgedStock);
        } else {
            setError("No loan details provided");
            setLoading(false);
        }
    }, [location.state, loanId]);

    const fetchEligibleBanks = async (userdetailsid, ps) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:8081/loan-microservice/api/loan/eligible-banks/${userdetailsid}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ps),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setEligibleBanks(data);
            
        } catch (err) {
            setError(err.message);
            console.error("Error fetching eligible banks:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <h2 className="mb-4">Eligible Banks for Loan</h2>
                
                {loading && (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p>Finding eligible banks...</p>
                    </div>
                )}

                {error && (
                    <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error}</p>
                        <Button variant="primary" onClick={handleBack}>Go Back</Button>
                    </Alert>
                )}

                {!loading && !error && (
                    <>
                        <div className="mb-3">
                            <h5>Pledged Stocks:</h5>
                            <ul>
                                {pledgedStocks.map((stock, index) => (
                                    <li key={index}>
                                        Stock ID: {stock.stockId}, Quantity: {stock.quantity}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {eligibleBanks.length > 0 ? (
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Bank Name</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eligibleBanks.map((bank) => (
                                        <tr key={bank.id}>
                                            <td>{bank.name}</td>
                                            <td>{bank.email}</td>
                                            <td>
                                                <Button 
                                                    variant="success"
                                                    onClick={() => navigate(`/apply-loan/${bank.id}`, { 
                                                        state: { 
                                                            loanId, 
                                                            pledgedStocks,
                                                            bankDetails: bank 
                                                        } 
                                                    })}
                                                >
                                                    Apply
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <Alert variant="info">
                                No eligible banks found for your loan request.
                                <div className="mt-2">
                                    <Button variant="primary" onClick={handleBack}>Go Back</Button>
                                </div>
                            </Alert>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default ViewEligibleBanks;