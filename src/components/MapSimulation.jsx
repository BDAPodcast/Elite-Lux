import React, { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer, Marker } from '@react-google-maps/api';
import './MapSimulation.css';

const LIBRARIES = ['places'];

// Luxury Dark + Gold map style (mirrors image #2 from user's reference)
const DARK_GOLD_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a0a0a0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#333333' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#222222' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c6a87c', lightness: -30 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050505' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0d1a0d' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'administrative', elementType: 'geometry.fill', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#c6a87c' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#888888' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#dddddd' }] },
];

const CENTER = { lat: 40.7128, lng: -74.006 }; // Default: NYC

export default function MapSimulation({ onPickupChange, onDropoffChange, onDistanceChange }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [pickupRef] = useState(React.createRef());
  const [dropoffRef] = useState(React.createRef());
  const pickupAuto = useRef(null);
  const dropoffAuto = useRef(null);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const calculateRoute = () => {
    const pickup = pickupAuto.current?.getPlace()?.formatted_address;
    const dropoff = dropoffAuto.current?.getPlace()?.formatted_address;

    if (!pickup || !dropoff) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickup,
        destination: dropoff,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          const distanceMiles = result.routes[0].legs[0].distance.value / 1609.34;
          if (onDistanceChange) onDistanceChange(parseFloat(distanceMiles.toFixed(2)));
          if (onPickupChange) onPickupChange(pickup);
          if (onDropoffChange) onDropoffChange(dropoff);
        }
      }
    );
  };

  if (!isLoaded) {
    return (
      <div className="map-sim-container">
        <div className="map-loading">
          <div className="gold-spinner"></div>
          <span>Initializing Map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="map-sim-container">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={CENTER}
        zoom={12}
        onLoad={onMapLoad}
        options={{
          styles: DARK_GOLD_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#c6a87c',
                strokeWeight: 4,
                strokeOpacity: 0.9,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Floating address inputs on the map */}
      <div className="map-search-overlay">
        <div className="map-search-input-group">
          <div className="map-search-dot pickup-dot"></div>
          <Autocomplete
            onLoad={(auto) => (pickupAuto.current = auto)}
            onPlaceChanged={calculateRoute}
          >
            <input
              ref={pickupRef}
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
            onPlaceChanged={calculateRoute}
          >
            <input
              ref={dropoffRef}
              type="text"
              placeholder="Drop-off location"
              className="map-search-input"
            />
          </Autocomplete>
        </div>
      </div>

      <div className="map-type-label">DARK TERRAIN</div>
    </div>
  );
}
