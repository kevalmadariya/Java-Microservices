import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../User/Form.css';

const AddBankForm = () => {
    const [formData, setFormData] = useState({
        bank: {
            name: '',
            email: '',
            password: ''
        },
        securityGuidelines: {
            LTV: '',
            minimumLoan: '',
            maximumLoan: '',
            capType: '',
            interestRateRange: '',
            tenure: ''
        }
    });

    const navigate = useNavigate();
    const [formErrors, setFormErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;


        // Check if the field belongs to bank or securityGuidelines
        if (name.startsWith('bank.')) {
            const fieldName = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                bank: {
                    ...prev.bank,
                    [fieldName]: value
                }
            }));
        } else {
            const fieldName = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                securityGuidelines: {
                    ...prev.securityGuidelines,
                    [fieldName]: value
                }
            }));
        }
    };

    const validate = () => {
        const errors = {};

        // Bank validation
        if (!formData.bank.name.trim()) {
            errors['bank.name'] = 'Bank name is required';
        }

        if (!formData.bank.email) {
            errors['bank.email'] = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.bank.email)) {
            errors['bank.email'] = 'Invalid email format';
        }

        if (!formData.bank.password || formData.bank.password.length < 6) {
            errors['bank.password'] = 'Password must be at least 6 characters';
        }


        // Security Guidelines validation
        if (!formData.securityGuidelines.LTV || isNaN(formData.securityGuidelines.LTV)) {
            errors['securityGuidelines.LTV'] = 'Valid LTV is required';
        }

        if (!formData.securityGuidelines.minimumLoan || isNaN(formData.securityGuidelines.minimumLoan)) {
            errors['securityGuidelines.minimumLoan'] = 'Valid minimum loan is required';
        }

        if (!formData.securityGuidelines.maximumLoan || isNaN(formData.securityGuidelines.maximumLoan)) {
            errors['securityGuidelines.maximumLoan'] = 'Valid maximum loan is required';
        }

        if (!formData.securityGuidelines.capType) {
            errors['securityGuidelines.capType'] = 'Cap type is required';
        }

        if (!formData.securityGuidelines.interestRateRange) {
            errors['securityGuidelines.interestRateRange'] = 'Interest rate range is required';
        }

        if (!formData.securityGuidelines.tenure || isNaN(formData.securityGuidelines.tenure)) {
            errors['securityGuidelines.tenure'] = 'Valid tenure is required';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        setFormErrors(errors);
        setApiError('');
        setSuccessMessage('');

        if (Object.keys(errors).length === 0) {
            try {
                // First create the bank
                const bankResponse = await fetch('http://localhost:8081/loan-microservice/api/bank/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData.bank)
                });

                if (!bankResponse.ok) {
                    throw new Error('Failed to create bank');
                }
                console.log(-1)
                const createdBank = await bankResponse.json();
                console.log(createdBank)

                // Then create security guidelines with the bank reference
                const securityGuidelinesPayload = {
                    ...formData.securityGuidelines,
                    ltv: parseFloat(formData.securityGuidelines.LTV),
                    minimumLoan: parseFloat(formData.securityGuidelines.minimumLoan),
                    maximumLoan: parseFloat(formData.securityGuidelines.maximumLoan),
                    tenure: parseInt(formData.securityGuidelines.tenure),
                    bankId: createdBank.id // Reference to the created bank
                };
                console.log(securityGuidelinesPayload)
                const guidelinesResponse = await fetch('http://localhost:8081/loan-microservice/api/security-guidelines', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(securityGuidelinesPayload)
                });

                if (!guidelinesResponse.ok) {
                    throw new Error('Failed to create security guidelines');
                }
                console.log()
                setSuccessMessage('Bank and security guidelines created successfully!');

                // Reset form
                setFormData({
                    bank: {
                        name: '',
                        email: '',
                        password: ''
                    },
                    securityGuidelines: {
                        LTV: '',
                        minimumLoan: '',
                        maximumLoan: '',
                        capType: '',
                        interestRateRange: '',
                        tenure: ''
                    }
                });

                // Redirect after 2 seconds
                setTimeout(() => {
                    navigate('/bank_login');
                }, 2000);

            } catch (err) {
                setApiError(err.message);
            }
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-header">Add New Bank with Security Guidelines</h2>
            {apiError && <p className="error-message">{apiError}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <form onSubmit={handleSubmit} className="login-form">
                <h3 className="section-header">Bank Information</h3>

                <div className="input-field">
                    <input
                        type="text"
                        name="bank.name"
                        value={formData.bank.name}
                        onChange={handleChange}
                        placeholder="Bank Name"
                        className={`input ${formErrors['bank.name'] ? 'error' : ''}`}
                    />
                    {formErrors['bank.email'] && <p className="error-text">{formErrors['bank.email']}</p>}
                </div>
                <div className="input-field">
                    <input
                        type="text"
                        name="bank.email"
                        value={formData.bank.email}
                        onChange={handleChange}
                        placeholder="Bank Email"
                        className={`input ${formErrors['bank.email'] ? 'error' : ''}`}
                    />
                    {formErrors['bank.email'] && <p className="error-text">{formErrors['bank.email']}</p>}
                </div>
                <div className="input-field">
                    <input
                        type="password"
                        name="bank.password"
                        value={formData.bank.password}
                        onChange={handleChange}
                        placeholder="Bank Password"
                        className={`input ${formErrors['bank.password'] ? 'error' : ''}`}
                    />
                    {formErrors['bank.password'] && <p className="error-text">{formErrors['bank.password']}</p>}
                </div>

                <h3 className="section-header">Security Guidelines</h3>

                <div className="input-field">
                    <input
                        type="number"
                        name="securityGuidelines.LTV"
                        value={formData.securityGuidelines.LTV}
                        onChange={handleChange}
                        placeholder="Loan-to-Value Ratio (LTV)"
                        step="0.01"
                        className={`input ${formErrors['securityGuidelines.LTV'] ? 'error' : ''}`}
                    />
                    {formErrors['securityGuidelines.LTV'] && <p className="error-text">{formErrors['securityGuidelines.LTV']}</p>}
                </div>

                <div className="input-field">
                    <input
                        type="number"
                        name="securityGuidelines.minimumLoan"
                        value={formData.securityGuidelines.minimumLoan}
                        onChange={handleChange}
                        placeholder="Minimum Loan Amount"
                        className={`input ${formErrors['securityGuidelines.minimumLoan'] ? 'error' : ''}`}
                    />
                    {formErrors['securityGuidelines.minimumLoan'] && <p className="error-text">{formErrors['securityGuidelines.minimumLoan']}</p>}
                </div>

                <div className="input-field">
                    <input
                        type="number"
                        name="securityGuidelines.maximumLoan"
                        value={formData.securityGuidelines.maximumLoan}
                        onChange={handleChange}
                        placeholder="Maximum Loan Amount"
                        className={`input ${formErrors['securityGuidelines.maximumLoan'] ? 'error' : ''}`}
                    />
                    {formErrors['securityGuidelines.maximumLoan'] && <p className="error-text">{formErrors['securityGuidelines.maximumLoan']}</p>}
                </div>

                <div className="input-field">
                    <select
                        name="securityGuidelines.capType"
                        value={formData.securityGuidelines.capType}
                        onChange={handleChange}
                        className={`input ${formErrors['securityGuidelines.capType'] ? 'error' : ''}`}
                    >
                        <option value="">Select Cap Type</option>
                        <option value="large">Large Cap</option>
                        <option value="mid">Mid Cap</option>
                        <option value="small">Small Cap</option>
                    </select>
                    {formErrors['securityGuidelines.capType'] && <p className="error-text">{formErrors['securityGuidelines.capType']}</p>}
                </div>

                <div className="input-field">
                    <input
                        type="text"
                        name="securityGuidelines.interestRateRange"
                        value={formData.securityGuidelines.interestRateRange}
                        onChange={handleChange}
                        placeholder="Interest Rate Range (e.g., 5-10%)"
                        className={`input ${formErrors['securityGuidelines.interestRateRange'] ? 'error' : ''}`}
                    />
                    {formErrors['securityGuidelines.interestRateRange'] && <p className="error-text">{formErrors['securityGuidelines.interestRateRange']}</p>}
                </div>

                <div className="input-field">
                    <input
                        type="number"
                        name="securityGuidelines.tenure"
                        value={formData.securityGuidelines.tenure}
                        onChange={handleChange}
                        placeholder="Tenure (months)"
                        className={`input ${formErrors['securityGuidelines.tenure'] ? 'error' : ''}`}
                    />
                    {formErrors['securityGuidelines.tenure'] && <p className="error-text">{formErrors['securityGuidelines.tenure']}</p>}
                </div>

                <button type="submit" className="submit-button">Submit</button>
            </form>

            <div className="message">
                Already have an account? <Link to="/bank_login">Login</Link>
            </div>
            <div className="message">
                For user? <Link to="/signup">click here</Link>
            </div>

        </div>
    );
};

export default AddBankForm;