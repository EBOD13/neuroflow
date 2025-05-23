import { useEffect, useState } from 'react';
import '../styles/TemperatureDial.css';

export default function TemperatureDial() {
  const [temperature, setTemperature] = useState(24); // Default temp
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const min = 16;
  const max = 38;
  const percentage = (temperature - min) / (max - min);

  // Dynamic sizing
  const radius = 10;
  const centerX = 13;
  const centerY = 15;

  const angle = Math.PI * (1 - percentage);
  const x = centerX + radius * Math.cos(angle);
  const y = centerY - radius * Math.sin(angle);

  // Fetch temperature from FastAPI backend
  const fetchTemperature = async () => {
    try {
      const response = await fetch('http://localhost:8000/temperature');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      setTemperature(data.temperature);
      setError(null);
    } catch (err) {
      console.error('Error fetching temperature:', err);
      setError('Failed to get temperature data');
      // Optional: implement retry logic or fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTemperature();
    
    // Set up polling every 5 seconds
    const intervalId = setInterval(fetchTemperature, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const getLabel = (temp) => {
    if (temp < 22) return "Cold";
    if (temp < 30) return "Warm";
    return "Hot";
  };

  // Calculate gradient color based on exact position
  const getGradientColor = (percent) => {
    if (percent <= 0) return "#00cfff";
    if (percent >= 1) return "#ff9a00";
    
    // Interpolate between gradient stops
    if (percent <= 0.5) {
      // Between blue (#00cfff) and green (#7dd56f)
      const t = percent * 2;
      return interpolateColor("#00cfff", "#7dd56f", t);
    } else {
      // Between green (#7dd56f) and orange (#ff9a00)
      const t = (percent - 0.5) * 2;
      return interpolateColor("#7dd56f", "#ff9a00", t);
    }
  };

  // Helper function to interpolate between two colors
  const interpolateColor = (color1, color2, factor) => {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  if (loading) return <div className="dial-container">Loading temperature...</div>;
  if (error) return <div className="dial-container">{error}</div>;

  return (
    <div className="dial-container">
      <svg className="dial-svg" viewBox="0 0 26 18">
        <defs>
          <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00cfff" />
            <stop offset="50%" stopColor="#7dd56f" />
            <stop offset="100%" stopColor="#ff9a00" />
          </linearGradient>
        </defs>

        <path
          d={`M3,15 A10,10 0 0,1 23,15`}
          fill="none"
          stroke="url(#tempGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <circle
          cx={x}
          cy={y}
          r="2.2"
          fill={getGradientColor(percentage)}
          stroke="#fff"
          strokeWidth="0.3"
        />
      </svg>

      <div className="temperature-text">
        <div className="label">{getLabel(temperature)}</div>
        <div className="temp">{temperature}°</div>
        <div className="unit">Celsius</div>
      </div>

      <div className="scale">
        <span>16°C</span>
        <span>38°C</span>
      </div>
    </div>
  );
}