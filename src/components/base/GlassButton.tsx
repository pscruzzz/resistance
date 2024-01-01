import React from 'react';

interface Props {
  message: string
}

const GlassButton: React.FC<Props> = ({message}) => {
  const baseStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.31)',
    boxShadow: '4px 4px 30px rgba(0, 0, 0, 0.1)',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    outline: 'none',
    fontWeight: '500',
  };

  return (
    <button
      style={baseStyle}
      className='text-base rounded-lg'
    >
      {message}
    </button>
  );
};

export default GlassButton;
