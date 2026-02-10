import React from 'react';
import '../styles/variables.css'; // Ensure variables are available if this is mounted in isolation

const LoadingScreen = ({ message = "Loading Sales Tracker..." }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg-main)', // Updated
      zIndex: 'var(--z-loading)',
      color: 'var(--color-text-secondary)', // Updated
      fontFamily: 'var(--font-family-base)'
    }}>
      <div className="spinner" style={{
        width: '50px',
        height: '50px',
        border: '4px solid var(--color-border)', // Updated
        borderTop: '4px solid var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 'var(--spacing-md)'
      }}></div>
      <h2 style={{
        fontSize: 'var(--font-size-lg)',
        fontWeight: '500',
        color: 'var(--color-text-main)' // Updated
      }}>{message}</h2>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
