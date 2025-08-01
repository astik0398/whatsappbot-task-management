import React from 'react';
import '../styles/CircularProgressBar.css';

const CircularProgressBar = ({ percentage, taskCount, color, isDarkMode }) => {
  const radius = 85;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-container">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e6e6e6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="progress-ring"
        />
      </svg>
      <div className={`circular-text ${isDarkMode ? 'dark' : ''}`}>
        <strong style={{fontSize:'30px'}}>{percentage}%</strong>
        <div style={{fontSize:'18px'}}><strong>{taskCount} Tasks</strong></div>
      </div>
    </div>
  );
};

export default CircularProgressBar;
