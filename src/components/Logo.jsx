import React from 'react';
import './Logo.css';

export default function Logo({ className = '', width = 120 }) {
  return (
    <div className={`logo-container ${className}`} style={{ width: `${width}px` }}>
      <img 
        src={`${import.meta.env.BASE_URL}logo.png`} 
        alt="Elite Lux" 
        className="logo-img" 
      />

    </div>
  );
}
