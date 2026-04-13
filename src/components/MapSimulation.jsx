import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, Navigation, Info, AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './MapSimulation.css';

const LIBRARIES = ['places'];

const DARK_GOLD_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#c6a87c' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#c6a87c', lightness: -60 }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c6a87c', lightness: -40 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#080808' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#c6a87c' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

const CENTER = { lat: 40.7128, lng: -74.006 };

// Mock Locations for Simulation Mode
const MOCK_LOCATIONS = [
  { id: 1, name: 'JFK International Airport', address: 'Queens, NY 11430', pos: { x: 850, y: 750 } },
  { id: 2, name: 'The Plaza Hotel', address: '768 5th Ave, New York, NY 10019', pos: { x: 450, y: 400 } },
  { id: 3, name: 'Centurion Lounge', address: 'Terminal 4, JFK Airport, NY', pos: { x: 880, y: 780 } },
  { id: 4, name: 'Elite Lux HQ', address: '55 Hudson Yards, New York, NY', pos: { x: 380, y: 450 } },
  { id: 5, name: 'Empire State Building', address: '20 W 34th St, New York, NY 10001', pos: { x: 420, y: 480 } },
];

export default function MapSimulation({ onPickupChange, onDropoffChange, onDistanceChange, mini = false }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [useSimulation, setUseSimulation] = useState(false);
  
  // Simulation State
  const [simPickup, setSimPickup] = useState(MOCK_LOCATIONS[0]);
  const [simDropoff, setSimDropoff] = useState(MOCK_LOCATIONS[1]); // Default for mini mode
  const [isRouting, setIsRouting] = useState(false);
  const [showPickupResults, setShowPickupResults] = useState(false);
  const [showDropoffResults, setShowDropoffResults] = useState(false);
  const [eta, setEta] = useState(null);

  const pickupAuto = useRef(null);
  const dropoffAuto = useRef(null);

  // Detect load error and switch to simulation
  useEffect(() => {
    if (loadError) {
      console.warn("Google Maps failed to load. Switching to Elite-Simulation Mode.");
      setUseSimulation(true);
    }
  }, [loadError]);

  // Initial route for mini mode
  useEffect(() => {
    // Only attempt if we have the google object and it has the needed services
    const google = window.google;
    if (mini && isLoaded && !directions && google?.maps?.DirectionsService) {
      try {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
          {
            origin: MOCK_LOCATIONS[0].address,
            destination: MOCK_LOCATIONS[1].address,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK' && result?.routes?.[0]?.legs?.[0]) {
              setDirections(result);
              setEta(result.routes[0].legs[0].duration.text);
            }
          }
        );
      } catch (err) {
        console.error("Failed to initialize directions in mini mode:", err);
      }
    }
  }, [mini, isLoaded, directions]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const calculateRealRoute = () => {
    const pickup = pickupAuto.current?.getPlace();
    const dropoff = dropoffAuto.current?.getPlace();

    if (!pickup?.formatted_address || !dropoff?.formatted_address) return;

    // Use window.google directly since this is only called when isLoaded is true
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickup.formatted_address,
        destination: dropoff.formatted_address,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          const distanceMiles = leg.distance.value / 1609.34;
          setEta(leg.duration.text);
          onDistanceChange?.(parseFloat(distanceMiles.toFixed(2)));
          onPickupChange?.(pickup.formatted_address);
          onDropoffChange?.(dropoff.formatted_address);
        } else {
          console.error("Directions request failed due to " + status);
          setUseSimulation(true); // Fallback on route failure
        }
      }
    );
  };

  const calculateSimRoute = (p, d) => {
    const pickup = p || simPickup;
    const dropoff = d || simDropoff;

    if (!pickup || !dropoff) return;

    setIsRouting(true);
    
    // Simulate distance/ETA calculation
    const dist = Math.sqrt(Math.pow(dropoff.pos.x - pickup.pos.x, 2) + Math.pow(dropoff.pos.y - pickup.pos.y, 2));
    const miles = (dist / 10).toFixed(1);
    const durationMins = Math.round(dist / 5);
    
    setEta(`${durationMins} mins`);
    onDistanceChange?.(parseFloat(miles));
    onPickupChange?.(pickup.name);
    onDropoffChange?.(dropoff.name);

    setTimeout(() => setIsRouting(false), 2000);
  };

  if (!isLoaded && !useSimulation) {
    return (
      <div className="map-sim-container">
        <div className="map-loading">
          <div className="gold-spinner"></div>
          <span>Initializing Elite-Net...</span>
        </div>
      </div>
    );
  }

  // Render Simulation Mode
  if (useSimulation) {
    return (
      <div className="map-sim-container">
        <svg viewBox="0 0 1000 1000" className="map-simulation-svg">
          {/* Grid Background */}
          {Array.from({ length: 20 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 50} y1="0" x2={i * 50} y2="1000" className="map-grid-line" />
              <line x1="0" y1={i * 50} x2="1000" y2={i * 50} className="map-grid-line" />
            </React.Fragment>
          ))}

          {/* Abstract Roads */}
          <path d="M 100 100 L 900 100 L 900 900 L 100 900 Z" className="map-road map-road-main" />
          <path d="M 100 500 L 900 500 M 500 100 L 500 900" className="map-road" />
          <path d="M 300 100 L 300 900 M 700 100 L 700 900" className="map-road" />

          {/* Active Route */}
          <AnimatePresence>
            {simPickup && simDropoff && (
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d={`M ${simPickup.pos.x} ${simPickup.pos.y} L ${simDropoff.pos.x} ${simDropoff.pos.y}`}
                className="active-route-path"
                stroke="#c6a87c"
                strokeWidth="4"
                fill="none"
              />
            )}
          </AnimatePresence>

          {/* Mock Gold Vehicles */}
          {[
            {x: 200, y: 300}, {x: 600, y: 200}, {x: 800, y: 400}, 
            {x: 300, y: 700}, {x: 500, y: 800}, {x: 100, y: 600}
          ].map((v, i) => (
            <motion.g 
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              transform={`translate(${v.x}, ${v.y})`}
            >
              <rect width="16" height="8" rx="2" fill="#c6a87c" />
              <rect width="4" height="4" x="10" y="2" fill="#000" rx="1" />
            </motion.g>
          ))}
        </svg>

        {/* Custom Simulation Inputs - Hidden in Mini mode */}
        {!mini && (
          <div className="map-search-overlay">
            <div className="map-search-input-group">
              <div className="map-search-dot pickup-dot"></div>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Simulated Pickup"
                  className="map-search-input"
                  value={simPickup?.name || ''}
                  onFocus={() => setShowPickupResults(true)}
                  readOnly
                />
                {showPickupResults && (
                  <div className="sim-search-results">
                    {MOCK_LOCATIONS.map(loc => (
                      <div key={loc.id} className="sim-result-item" onClick={() => {
                        setSimPickup(loc);
                        setShowPickupResults(false);
                        calculateSimRoute(loc, simDropoff);
                      }}>
                        {loc.name}
                        <span className="small-text">{loc.address}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="map-search-input-group">
              <div className="map-search-dot dropoff-dot"></div>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Simulated Drop-off"
                  className="map-search-input"
                  value={simDropoff?.name || ''}
                  onFocus={() => setShowDropoffResults(true)}
                  readOnly
                />
                {showDropoffResults && (
                  <div className="sim-search-results">
                    {MOCK_LOCATIONS.map(loc => (
                      <div key={loc.id} className="sim-result-item" onClick={() => {
                        setSimDropoff(loc);
                        setShowDropoffResults(false);
                        calculateSimRoute(simPickup, loc);
                      }}>
                        {loc.name}
                        <span className="small-text">{loc.address}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="map-type-label sim-mode">
          {eta && (
            <div className="eta-badge">
              <Clock size={12} /> {eta}
            </div>
          )}
          {!mini && (
            <>
              <Info size={10} style={{ marginRight: 4 }} />
              Elite Simulation Active
            </>
          )}
        </div>
      </div>
    );
  }

  // Render Real Google Map
  return (
    <div className="map-sim-container">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={CENTER}
        zoom={mini ? 11 : 12} // Slightly wider view for mini mode
        onLoad={onMapLoad}
        options={{
          styles: DARK_GOLD_STYLE,
          disableDefaultUI: true,
          zoomControl: !mini,
        }}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#c6a87c',
                strokeWeight: 4,
              },
            }}
          />
        )}
      </GoogleMap>

      {!mini && (
        <div className="map-search-overlay">
          <div className="map-search-input-group">
            <div className="map-search-dot pickup-dot"></div>
            <Autocomplete
              onLoad={(auto) => (pickupAuto.current = auto)}
              onPlaceChanged={calculateRealRoute}
            >
              <input
                type="text"
                placeholder="Pickup location"
                className="map-search-input"
                defaultValue="JFK International Airport"
              />
            </Autocomplete>
          </div>

          <div className="map-search-input-group">
            <div className="map-search-dot dropoff-dot"></div>
            <Autocomplete
              onLoad={(auto) => (dropoffAuto.current = auto)}
              onPlaceChanged={calculateRealRoute}
            >
              <input
                type="text"
                placeholder="Drop-off location"
                className="map-search-input"
              />
            </Autocomplete>
          </div>
        </div>
      )}

      {(!mini || eta) && (
        <div className="map-type-label">
          {eta && (
            <div className="eta-badge live" style={{ marginBottom: mini ? '0' : '8px', background: 'var(--color-gold)', color: 'black' }}>
              <Clock size={12} /> {eta}
            </div>
          )}
          {!mini && "Elite-Net Live"}
        </div>
      )}
    </div>
  );
}
