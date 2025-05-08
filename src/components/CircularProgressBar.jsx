import React from 'react';
import '../styles/CircularProgressBar.css';

const CircularProgressBar = ({ percentage, taskCount, color = "#7a5fff" }) => {
  const radius = 85;
  const stroke = 10;
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
      <div className="circular-text">
        <strong>{percentage}%</strong>
        <div>{taskCount} Tasks</div>
      </div>
    </div>
  );
};

export default CircularProgressBar;
