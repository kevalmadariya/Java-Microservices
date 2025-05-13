import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../User/Form.css';
import Navbar from '../Navbar/Navbar';

const LoanApplyForm = () => {
    const [loanAmount, setLoanAmount] = useState('');
    const [stockHoldings, setStockHoldings] = useState([]);
    const [selectedStocks, setSelectedStocks] = useState({});
    const [formErrors, setFormErrors] = useState('');
    const [showStocks, setShowStocks] = useState(false);
    const [inputErrors, setInputErrors] = useState({});
    const [totalCollateralValue, setTotalCollateralValue] = useState(0);
    const [totalHoldingsValue, setTotalHoldingsValue] = useState(0);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    // Calculate total collateral value whenever selectedStocks changes
    useEffect(() => {
        let collateralTotal = 0;
        let holdingsTotal = 0;

        stockHoldings.forEach(holding => {
            const pledgedShares = selectedStocks[holding.holdingId] || 0;
            collateralTotal += pledgedShares * holding.averageBuyPrice;
            holdingsTotal += holding.numberOfShares * holding.averageBuyPrice;
        });

        setTotalCollateralValue(collateralTotal);
        setTotalHoldingsValue(holdingsTotal);
    }, [selectedStocks, stockHoldings]);

    const [loanId, setLoanId] = useState(null); // Add this state for storing the loan ID

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!loanAmount) {
            setFormErrors('Please enter a loan amount');
            return;
        }
        setFormErrors('');

        try {
            // First create the loan application
            const loanData = {
                userId: userId,
                amtLoanNeeded: loanAmount
            };

            const loanResponse = await fetch('http://localhost:8081/loan-microservice/api/user-loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loanData),
            });

            if (!loanResponse.ok) {
                throw new Error('Failed to create loan application');
            }

            const loanResponseData = await loanResponse.json();
            setLoanId(loanResponseData.id); // Store the loan ID for later use
            setShowStocks(true);

            // Then fetch the user's stock holdings
            const holdingsResponse = await fetch(`http://localhost:8081/portfolio-microservice/api/stock-holdings/user/${userId}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
            })
            if (holdingsResponse.ok) {
                const data = await holdingsResponse.json();
                setStockHoldings(data);

                const initialSelected = {};
                data.forEach(holding => {
                    initialSelected[holding.holdingId] = 0;
                });
                setSelectedStocks(initialSelected);
            } else {
                console.error('Failed to fetch stock holdings');
                alert('Failed to fetch your stock holdings. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing your request. Please try again.');
        }
    };



    const handleStockQuantityChange = (holdingId, value) => {
        const numericValue = parseInt(value) || 0;
        const holding = stockHoldings.find(h => h.holdingId === holdingId);

        if (numericValue > holding.numberOfShares) {
            setInputErrors({
                ...inputErrors,
                [holdingId]: `Cannot exceed ${holding.numberOfShares} shares`
            });
            return;
        }

        if (numericValue < 0) {
            setInputErrors({
                ...inputErrors,
                [holdingId]: `Cannot be negative`
            });
            return;
        }

        setInputErrors({
            ...inputErrors,
            [holdingId]: null
        });

        setSelectedStocks({
            ...selectedStocks,
            [holdingId]: numericValue
        });
    };

    const handleViewBanks = async () => {
        if (!loanId) {
            alert('Loan application not found. Please try again.');
            return;
        }

        // Validate if at least one stock has quantity > 0
        const hasSelectedStocks = Object.values(selectedStocks).some(qty => qty > 0);
        if (!hasSelectedStocks) {
            alert('Please select at least one stock with quantity greater than 0');
            return;
        }

        // Validate if total collateral is at least 2x loan amount
        if (totalCollateralValue < 1.4 * loanAmount) {
            alert(`Total collateral value (₹${totalCollateralValue.toFixed(2)}) must be at least 70% of the loan amount (₹${loanAmount})`);
            return;
        }

        try {
            // Prepare pledged stocks data
            const pledgedStocks = Object.entries(selectedStocks)
                .filter(([_, qty]) => qty > 0)
                .map(([holdingId, quantity]) => {
                    const holding = stockHoldings.find(h => h.holdingId === holdingId);
                    return {
                        stockId: holding.stockId,
                        quantity: quantity,
                        userLoanDetailsId: loanId
                    };
                });

            // Submit pledged stocks
            const response = await fetch('http://localhost:8081/loan-microservice/api/pledged-stock-guidelines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pledgedStocks),
            });

            if (!response.ok) {
                throw new Error('Failed to submit pledged stocks');
            }

            const ps = await response.json()
            console.log(-1)
            console.log(loanId, pledgedStocks)
            // Navigate to eligible banks page
            navigate('/eligible_banks', { state: { loanId, pledgedStock: pledgedStocks } });
        } catch (error) {
            console.error('Error submitting pledged stocks:', error);
            alert('Error submitting your pledged stocks. Please try again.');
        }
    };

    const pledgeAllShares = async () => {
        if (!loanId) {
            alert('Loan application not found. Please try again.');
            return;
        }

        const allSelected = {};
        stockHoldings.forEach(holding => {
            allSelected[holding.holdingId] = holding.numberOfShares;
        });
        setSelectedStocks(allSelected);
        setShowInsufficientModal(false);

        try {
            // Prepare pledged stocks data for all shares
            const pledgedStocks = stockHoldings.map(holding => ({
                stockId: holding.stockId,
                quantity: holding.numberOfShares,
                userLoanDetailsId: loanId
            }));

            // Submit pledged stocks
            const response = await fetch('http://localhost:8081/loan-microservice/api/pledged-stock-guidelines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pledgedStocks),
            });

            if (!response.ok) {
                throw new Error('Failed to submit pledged stocks');
            }

            const ps = await response.json()
            console.log(-1)
            console.log(loanId, pledgedStocks)
            // Navigate to eligible banks page
            navigate('/eligible_banks', {
                state: {
                    loanId: loanId,  // Make sure this has a value
                    pledgedStock: pledgedStocks  // Make sure this is properly populated
                }
            });
        } catch (error) {
            console.error('Error submitting pledged stocks:', error);
            alert('Error submitting your pledged stocks. Please try again.');
        }
    };


    const adjustLoanAmount = () => {
        setShowStocks(false);
        setShowInsufficientModal(false);
    };

    return (
        <>
            <Navbar />
            <div className="form-container">
                <h2 className="form-header">Loan Application</h2>
                <form onSubmit={handleSubmit} className="loan-form">
                    <div className="input-field">
                        <input
                            type="number"
                            name="loanAmount"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            placeholder="Loan Amount"
                            className={`input ${formErrors ? 'error' : ''}`}
                            min="1"
                        />
                        {formErrors && <p className="error-text">{formErrors}</p>}
                    </div>
                    <div className="button-group">
                        <button type="submit" className="submit-button">Apply</button>
                    </div>
                </form>
            </div>

            {showStocks && stockHoldings.length > 0 && (
                <>
                    {totalHoldingsValue < 1.4 * loanAmount ? (
                        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Insufficient Holdings</h5>
                                    </div>
                                    <div className="modal-body">
                                        <p>Your total holdings value (₹{totalHoldingsValue.toFixed(2)}) is less than 70% the loan amount (₹{(1.4 * loanAmount).toFixed(2)}).</p>
                                        <p>You can either:</p>
                                        <ol>
                                            <li>Pledge all your shares ({stockHoldings.length} stocks)</li>
                                            <li>Adjust your loan amount</li>
                                        </ol>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            onClick={pledgeAllShares}
                                            className="btn btn-primary"
                                        >
                                            Pledge All Shares
                                        </button>
                                        <button
                                            onClick={adjustLoanAmount}
                                            className="btn btn-secondary"
                                        >
                                            Adjust Loan Amount
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="container my-5">
                            <div className="table-responsive">
                                <h4 className="mb-3">📁 Select Stocks for Collateral</h4>
                                <div className="collateral-summary mb-4">
                                    <div className="summary-item">
                                        <span className="summary-label">Loan Amount:</span>
                                        <span className="summary-value">₹{parseFloat(loanAmount).toFixed(2)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Total Holdings Value:</span>
                                        <span className="summary-value">₹{totalHoldingsValue.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Total Collateral Value:</span>
                                        <span className="summary-value">₹{totalCollateralValue.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Required Collateral (70% Loan):</span>
                                        <span className="summary-value">₹{(1.4 * loanAmount).toFixed(2)}</span>
                                    </div>
                                    <div className={`summary-item ${totalCollateralValue >= 1.4 * loanAmount ? 'text-success' : 'text-danger'}`}>
                                        <span className="summary-label">Status:</span>
                                        <span className="summary-value">
                                            {totalCollateralValue >= 1.4 * loanAmount ? '✓ Sufficient' : '✗ Insufficient'}
                                        </span>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover table-striped custom-table">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Stock</th>
                                                <th>Available Shares</th>
                                                <th>Shares to Pledge</th>
                                                <th>Current Value</th>
                                                <th>Avg Buy Price</th>
                                                {/* <th>PnL</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockHoldings.map((holding) => {
                                                const pledgedShares = selectedStocks[holding.holdingId] || 0;
                                                const pledgedValue = pledgedShares * holding.averageBuyPrice;

                                                return (
                                                    <tr key={holding.holdingId}>
                                                        <td>{holding.stockId}</td>
                                                        <td>{holding.numberOfShares}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={holding.numberOfShares}
                                                                value={pledgedShares}
                                                                onChange={(e) =>
                                                                    handleStockQuantityChange(holding.holdingId, e.target.value)
                                                                }
                                                                className={`form-control ${inputErrors[holding.holdingId] ? 'is-invalid' : ''}`}
                                                            />
                                                            {inputErrors[holding.holdingId] && (
                                                                <div className="invalid-feedback">
                                                                    {inputErrors[holding.holdingId]}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>₹{pledgedValue.toFixed(2)}</td>
                                                        <td>₹{holding.averageBuyPrice.toFixed(2)}</td>
                                                        {/* <td className={holding.pnl >= 0 ? 'text-success' : 'text-danger'}>
                                                            ₹{holding.pnl.toFixed(2)}
                                                        </td> */}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="button-group mt-4">
                                    <button
                                        onClick={handleViewBanks}
                                        className="submit-button"
                                        disabled={totalCollateralValue < 1.4 * loanAmount}
                                    >
                                        View Eligible Banks
                                    </button>
                                </div>
                                {totalCollateralValue < 1.4 * loanAmount && (
                                    <div className="alert alert-warning mt-3">
                                        Total collateral value must be at least 70% the loan amount to proceed.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default LoanApplyForm;