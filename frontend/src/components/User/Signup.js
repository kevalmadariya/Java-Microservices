import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Form.css';

const SignupForm = ({ error }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    dob: '',
    gender: '',
  });

  const navigate = useNavigate(); // Hook for redirecting after successful registration


  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Enter a valid 10-digit phone number';
    }

    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    }

    if (!formData.gender) {
      errors.gender = 'Gender is required';
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
      let payload = {
        ...formData,
        kycVerified: true,
      };

      try {
        let response = await fetch('http://localhost:8081/user-authentication-microservice/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response;
          console.log(data)

          payload = {
            "userId": data.userId
          }

          response = await fetch('http://localhost:8081/portfolio-microservice/api/portfolio/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          console.log(response)
          // Redirect to login page
          setSuccessMessage('Registration successful!');
          setFormData({
            fullName: '',
            email: '',
            password: '',
            phoneNumber: '',
            dob: '',
            gender: '',
          });
          navigate('/login');
          throw new Error(data.message || 'Registration failed');
        }
      } catch (err) {
        setApiError(err.message);
      }
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-header">Sign Up</h2>
      {(error || apiError) && <p className="error-message">{error || apiError}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-field">
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className={`input ${formErrors.fullName ? 'error' : ''}`}
          />
          {formErrors.fullName && <p className="error-text">{formErrors.fullName}</p>}
        </div>

        <div className="input-field">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail Address"
            className={`input ${formErrors.email ? 'error' : ''}`}
          />
          {formErrors.email && <p className="error-text">{formErrors.email}</p>}
        </div>

        <div className="input-field">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className={`input ${formErrors.password ? 'error' : ''}`}
          />
          {formErrors.password && <p className="error-text">{formErrors.password}</p>}
        </div>

        <div className="input-field">
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            className={`input ${formErrors.phoneNumber ? 'error' : ''}`}
          />
          {formErrors.phoneNumber && <p className="error-text">{formErrors.phoneNumber}</p>}
        </div>

        <div className="input-field">
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className={`input ${formErrors.dob ? 'error' : ''}`}
          />
          {formErrors.dob && <p className="error-text">{formErrors.dob}</p>}
        </div>

        <div className="input-field">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`input ${formErrors.gender ? 'error' : ''}`}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {formErrors.gender && <p className="error-text">{formErrors.gender}</p>}
        </div>

        <button type="submit" className="submit-button">Register</button>
      </form>
      <div className="message">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default SignupForm;
