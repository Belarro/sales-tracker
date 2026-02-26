// ============================================
// LOADING SCREEN — Light mode
// ============================================

const LoadingScreen = ({ message = "Loading..." }) => {
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
      backgroundColor: 'var(--color-bg-main)',
      zIndex: 'var(--z-loading)',
      fontFamily: 'var(--font-family-base)'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid var(--color-border)',
        borderTop: '3px solid var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 'var(--spacing-md)'
      }} />
      <div style={{
        fontSize: 'var(--font-size-md)',
        fontWeight: '500',
        color: 'var(--color-text-secondary)'
      }}>
        {message}
      </div>

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
