import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../User/Form.css'; // Custom CSS for styling

const BankLogin = ({ error }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Please enter your e-mail';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid e-mail';
    }

    if (!formData.password) {
      errors.password = 'Please enter your password';
    } else if (formData.password.length < 6) {
      errors.password = 'Your password must be at least 6 characters';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch('http://localhost:8081/loan-microservice/api/bank/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data)

          if (data) {
            localStorage.setItem('bankId', data.bankId);
            localStorage.setItem('token', data.token);
            navigate('/bank_dashboard');
          } else {
            console.error('Token not found in response');
          }
        } else {
          console.error('Login failed');
        }
      } catch (err) {
        console.error('Error during login:', err);
      }
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-header">Bank Log-in</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-field">
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail address"
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
        <button type="submit" className="submit-button">Login</button>
      </form>
      <div className="message">
        New to us? <Link to="/bank_signup">Bank Register</Link>
      </div>
      <div className="message">
        For user? <Link to="/login">click here</Link>
      </div>
    </div>
  );
};

export default BankLogin;
