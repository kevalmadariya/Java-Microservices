import React from 'react';

const AuthButton = () => {
  const token = localStorage.getItem('jwtToken');

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login'; // or use navigate if using `react-router`
  };

  return token ? (
    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
  ) : (
    <a className="btn btn-primary" href="/login">Login</a>
  );
};

export default AuthButton;
