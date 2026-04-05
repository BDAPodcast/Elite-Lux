import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import './MapSimulation.css';

export default function MapSimulation({ pickup, dropoff }) {
  const [carProgress, setCarProgress] = useState(0);

  // Simple car animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCarProgress(prev => (prev + 0.005) % 1.2); // Loop slightly beyond 1.0 for a pause
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const pathD = "M 150,450 Q 300,400 400,250 T 650,150"; // Luxury curve

  return (
    <div className="map-sim-container">
      <div className="map-bg-grid"></div>
      
      <svg className="map-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        {/* Terrain Details */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* The Route Line */}
        <path 
          d={pathD}
          className="route-line-bg"
          stroke="rgba(198, 168, 124, 0.1)"
          strokeWidth="6"
          fill="none"
        />
        <motion.path 
          d={pathD}
          className="route-line-main"
          stroke="var(--color-gold)"
          strokeWidth="3"
          strokeDasharray="8,8"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Markers */}
        <g className="marker pickup" transform="translate(150, 450)">
          <circle r="8" fill="var(--color-white)" />
          <foreignObject x="-60" y="-45" width="120" height="40">
            <div className="map-label">
              <Navigation size={10} style={{marginRight: '4px'}} />
              {pickup || 'JFK Airport'}
            </div>
          </foreignObject>
        </g>

        <g className="marker dropoff" transform="translate(650, 150)">
          <circle r="8" fill="var(--color-gold)" filter="url(#glow)" />
          <foreignObject x="-60" y="-45" width="120" height="40">
            <div className="map-label gold">
              <MapPin size={10} style={{marginRight: '4px'}} />
              {dropoff || 'Manhattan'}
            </div>
          </foreignObject>
        </g>

        {/* The Moving Vehicle */}
        {carProgress <= 1.0 && (
          <motion.g 
            className="moving-car"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ 
              offsetPath: `path("${pathD}")`,
              offsetRotate: "auto"
            }}
          >
            <rect x="-10" y="-5" width="20" height="10" rx="2" fill="var(--color-white)" />
            <rect x="2" y="-3" width="6" height="6" rx="1" fill="#000" opacity="0.3" />
          </motion.g>
        )}
      </svg>

      <div className="map-controls">
        <div className="zoom-btns">
          <button>+</button>
          <button>-</button>
        </div>
        <div className="map-type-label">DARK TERRAIN MODE</div>
      </div>
    </div>
  );
}
