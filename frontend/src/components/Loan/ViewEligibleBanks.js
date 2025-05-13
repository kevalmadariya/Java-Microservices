import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Spinner, Alert, Button, Modal } from 'react-bootstrap';

function ViewEligibleBanks() {
    const location = useLocation();
    const navigate = useNavigate();
    const { loanId: urlLoanId } = useParams();
    const [eligibleBanks, setEligibleBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pledgedStocks, setPledgedStocks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [applyingBank, setApplyingBank] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [currentLoanId, setCurrentLoanId] = useState(null);

    useEffect(() => {
        console.log("Location state:", location.state);

        if (location.state) {
            const loanId = location.state.loanId || urlLoanId;
            const pledgedStock = location.state.pledgedStock || [];

            console.log("Using loanId:", loanId);
            console.log("Using pledgedStock:", pledgedStock);

            if (!loanId) {
                setError("Loan ID is missing");
                setLoading(false);
                return;
            }

            setCurrentLoanId(loanId);
            setPledgedStocks(pledgedStock);
            fetchEligibleBanks(loanId, pledgedStock);
        } else {
            setError("No loan details provided");
            setLoading(false);
        }
    }, [location.state, urlLoanId]);

    const fetchEligibleBanks = async (userdetailsid, ps) => {
        try {
            setLoading(true);
            setError(null);

            // First fetch eligible banks
            const response = await fetch(
                `http://localhost:8081/loan-microservice/api/loan/eligible-banks/${userdetailsid}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const banks = await response.json();
            console.log("Eligible banks:", banks);

            // Fetch interest rate range for each bank
            const banksWithInterestRates = await Promise.all(
                banks.map(async (bank) => {
                    try {
                        const guidelinesResponse = await fetch(
                            `http://localhost:8081/loan-microservice/api/security-guidelines/bank/${bank.id}`,
                            {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        );

                        if (!guidelinesResponse.ok) {
                            console.warn(`Failed to fetch guidelines for bank ${bank.id}`);
                            return {
                                ...bank,
                                interestRateRange: 'N/A'
                            };
                        }

                        const guidelines = await guidelinesResponse.json();
                        return {
                            ...bank,
                            interestRateRange: guidelines.interestRateRange || 'N/A'
                        };
                    } catch (err) {
                        console.error(`Error fetching guidelines for bank ${bank.id}:`, err);
                        return {
                            ...bank,
                            interestRateRange: 'N/A'
                        };
                    }
                })
            );

            console.log("Banks with interest rates:", banksWithInterestRates);
            setEligibleBanks(banksWithInterestRates);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching eligible banks:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (bank) => {
        setApplyingBank(bank);
        setProcessing(true);
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                throw new Error("User not authenticated");
            }
            if (!currentLoanId) {
                throw new Error("Loan ID is missing");
            }

            const loanStatusData = {
                userId: userId,
                status: "Pending",
                bankId: bank.id,
                userLoanDetailsId: currentLoanId,
                interestRate: parseFloat(bank.interestRateRange.replace('%', '')),
                updatedAt: new Date().toISOString()
            };

            console.log("Submitting loan application with data:", loanStatusData);

            // 1. First submit the loan application
            const loanResponse = await fetch(
                `http://localhost:8081/loan-microservice/api/loan-status`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(loanStatusData)
                }
            );

            const loanData = await loanResponse.json();

            if (!loanResponse.ok) {
                throw new Error(loanData.message || "Failed to submit application");
            }

            // 2. After successful loan submission, calculate stock trust scores
            const scoreResponse = await fetch(
                `http://localhost:8086/scorecalculation-microservice/api/score-trust/calculateStockTrustScore/${currentLoanId}`,
                {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const tradeResponse = await fetch(
                `http://localhost:8086/scorecalculation-microservice/api/trader-trust/user/${userId}`,
                {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!scoreResponse.ok) {
                console.warn("Loan application succeeded but stock score calculation failed:", await scoreResponse.json());
                // Continue with success since loan application was successful
            }
            if (!tradeResponse.ok) {
                console.warn("Loan application succeeded but trader score calculation failed:", await tradeResponse.json());
                // Continue with success since loan application was successful
            }
            setIsSuccess(true);
            setModalMessage(`Application submitted to ${bank.name} successfully!`);
            setShowModal(true);
        } catch (err) {
            setIsSuccess(false);
            setModalMessage(`Application failed: ${err.message}`);
            setShowModal(true);
            console.error("Error applying for loan:", err);
        } finally {
            setProcessing(false);
        }
    }; const handleCloseModal = () => {
        setShowModal(false);
        if (isSuccess) {
            navigate('/my_loan');
        }
    };

    const handleBack = () => {
        navigate(-1);
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
                                        <th>Interest Rate Range</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eligibleBanks.map((bank) => (
                                        <tr key={bank.id}>
                                            <td>{bank.name}</td>
                                            <td>{bank.email}</td>
                                            <td>{bank.interestRateRange}</td>
                                            <td>
                                                <Button
                                                    variant="success"
                                                    onClick={() => handleApply(bank)}
                                                    disabled={processing}
                                                >
                                                    {processing && applyingBank?.id === bank.id ? (
                                                        <Spinner as="span" size="sm" animation="border" role="status">
                                                            <span className="visually-hidden">Applying...</span>
                                                        </Spinner>
                                                    ) : "Apply"}
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

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isSuccess ? "Success!" : "Application Failed"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalMessage}
                    {!isSuccess && applyingBank && (
                        <div className="mt-2">
                            <p>Bank: {applyingBank.name}</p>
                            <p>Please try again later or contact support.</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant={isSuccess ? "success" : "danger"}
                        onClick={handleCloseModal}
                    >
                        {isSuccess ? "View My Loans" : "Close"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ViewEligibleBanks;