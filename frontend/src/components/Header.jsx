import React from 'react';
import './Header.css';
import logo from '../assets/PT.png';  

function Header() {
  return (
    <header className="header">
      <img src={logo} alt="App Logo" className="header-logo" />
      <h1>PDF Talk</h1>
    </header>
  );
}

export default Header;
