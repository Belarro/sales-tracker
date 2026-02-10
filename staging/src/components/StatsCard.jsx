import React from 'react';
import '../styles/variables.css';

const StatsCard = ({ title, value, icon, type = 'default' }) => {
    // Determine gradient based on type
    let gradient = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
    let iconColor = 'var(--color-text-main)';

    if (type === 'primary') {
        gradient = 'var(--color-gradient-brand)';
        iconColor = '#fff';
    } else if (type === 'success') {
        gradient = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))';
        iconColor = '#34d399';
    } else if (type === 'warning') {
        gradient = 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))';
        iconColor = '#fbbf24';
    } else if (type === 'danger') {
        gradient = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))';
        iconColor = '#f87171';
    }

    return (
        <div style={{
            background: gradient,
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--border-radius-lg)',
            padding: 'var(--spacing-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            minHeight: '100px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>{icon}</span>
            </div>
            <div>
                <div style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: '700',
                    color: 'var(--color-text-main)',
                    marginBottom: '4px'
                }}>
                    {value}
                </div>
                <div style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600'
                }}>
                    {title}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
