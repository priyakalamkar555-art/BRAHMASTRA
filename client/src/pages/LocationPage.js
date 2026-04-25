import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { getCurrentPosition } from '../utils/helpers';

const SAFE_ICONS = { hospital:'🏥', police:'👮', fire_station:'🔥', pharmacy:'💊' };

export default function LocationPage() {
  const { emitLocation } = useSocket();
  const [coords,     setCoords]     = useState(null);
  const [places,     setPlaces]     = useState([]);
  const [sharing,    setSharing]    = useState(false);
  const [toast,      setToast]      = useState('');
  const [loadPlaces, setLoadPlaces] = useState(false);
  const watchRef = useRef(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    // Get initial position
    getCurrentPosition()
      .then(({ coords: { latitude, longitude } }) => {
        setCoords({ latitude, longitude });
        fetchSafePlaces(latitude, longitude);
        api.updateLocation(latitude, longitude).catch(() => {});
      })
      .catch(() => showToast('Location permission denied'));

    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  const fetchSafePlaces = async (lat, lng) => {
    setLoadPlaces(true);
    try {
      const { data } = await api.safePlaces(lat, lng);
      setPlaces(data.places);
    } catch {} finally { setLoadPlaces(false); }
  };

  const startSharing = () => {
    if (!navigator.geolocation) { showToast('Geolocation not supported'); return; }
    setSharing(true);
    watchRef.current = navigator.geolocation.watchPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ latitude, longitude });
        api.updateLocation(latitude, longitude).catch(() => {});
        emitLocation(latitude, longitude, []); // pass contact IDs if needed
      },
      () => showToast('Location error'),
      { enableHighAccuracy: true }
    );
    showToast('📍 Live sharing started');
  };

  const stopSharing = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    api.stopLocation().catch(() => {});
    setSharing(false);
    showToast('⏸ Location sharing stopped');
  };

  const navigate = (place) => {
    if (place.lat && place.lng) window.open(`https://maps.google.com/?q=${place.lat},${place.lng}`, '_blank');
    else showToast(`Navigating to ${place.name}…`);
  };

  return (
    <div>
      {toast && (
        <div style={{ position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)',
          background:'#1a1a26', border:'1px solid #2ec4b6', borderRadius:10,
          padding:'0.65rem 1.3rem', color:'#2ec4b6', fontSize:'0.84rem', zIndex:200, whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div>
          <h2 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:'1.3rem', fontWeight:700 }}>Live Location</h2>
          <p style={{ fontSize:'0.78rem', color:'#a0a0b8', marginTop:2 }}>Real-time tracking</p>
        </div>
        <span style={{ padding:'2px 10px', borderRadius:20, background:'rgba(46,196,182,0.15)', color:'#2ec4b6', fontSize:'0.72rem', fontWeight:600 }}>
          {sharing ? '● LIVE' : '○ OFF'}
        </span>
      </div>

      {/* Map placeholder */}
      <div style={{ background:'linear-gradient(135deg,#0d1b2a,#1a2a3a)', border:'1px solid #2a2a40', borderRadius:16, height:240, position:'relative', overflow:'hidden', marginBottom:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(46,196,182,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(46,196,182,0.04) 1px,transparent 1px)', backgroundSize:'38px 38px' }} />
        {/* My location dot */}
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ width:20, height:20, borderRadius:'50%', background:'#2ec4b6', border:'3px solid #fff', position:'relative', zIndex:3 }} />
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:60, height:60, borderRadius:'50%', background:'rgba(46,196,182,0.12)', animation:'pulse 2s infinite' }} />
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:1}50%{transform:translate(-50%,-50%) scale(1.6);opacity:0}}`}</style>

        {/* Coordinate overlay */}
        {coords && (
          <div style={{ position:'absolute', bottom:10, left:12, right:12, background:'rgba(10,10,15,0.75)', borderRadius:8, padding:'6px 10px', fontSize:'0.72rem', color:'#2ec4b6' }}>
            📍 {coords.latitude.toFixed(5)}°N, {coords.longitude.toFixed(5)}°E
          </div>
        )}
      </div>

      {/* Share controls */}
      <div style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:14, padding:'1.1rem', marginBottom:'1.1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.9rem' }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background: sharing ? '#2ec4b6' : '#606078', animation: sharing ? 'blink 1.5s infinite' : 'none' }} />
          <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
          <span style={{ fontSize:'0.88rem', fontWeight:600 }}>{sharing ? 'Sharing live location' : 'Location sharing off'}</span>
        </div>
        <div style={{ display:'flex', gap:'0.8rem' }}>
          {!sharing
            ? <button onClick={startSharing} style={{ padding:'0.62rem 1.15rem', borderRadius:10, border:'none', background:'#2ec4b6', color:'#0a0a0f', fontSize:'0.82rem', fontWeight:700, cursor:'pointer' }}>📤 Start Sharing</button>
            : <button onClick={stopSharing}  style={{ padding:'0.62rem 1.15rem', borderRadius:10, border:'none', background:'#e63946', color:'#fff', fontSize:'0.82rem', fontWeight:700, cursor:'pointer' }}>⏸ Stop Sharing</button>
          }
          <button onClick={() => coords && window.open(`https://maps.google.com/?q=${coords.latitude},${coords.longitude}`,'_blank')}
            style={{ padding:'0.62rem 1.15rem', borderRadius:10, border:'1px solid #2a2a40', background:'#1a1a26', color:'#f0f0f8', fontSize:'0.82rem', cursor:'pointer' }}>
            🗺️ Open Map
          </button>
        </div>
      </div>

      {/* Safe places */}
      <h3 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:'1.1rem', marginBottom:'0.8rem' }}>Nearby Safe Places</h3>
      {loadPlaces
        ? <p style={{ color:'#606078', fontSize:'0.88rem' }}>Finding nearby places…</p>
        : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            {places.map((p, i) => (
              <button key={i} onClick={() => navigate(p)}
                style={{ padding:'0.9rem', borderRadius:12, border:'1px solid #2a2a40', background:'#111118', cursor:'pointer', color:'#f0f0f8', textAlign:'center', transition:'all 0.2s' }}>
                <div style={{ fontSize:'1.7rem', marginBottom:'0.3rem' }}>{SAFE_ICONS[p.type] || '📌'}</div>
                <div style={{ fontSize:'0.8rem', fontWeight:600 }}>{p.name}</div>
                {p.distance && <div style={{ fontSize:'0.7rem', color:'#2ec4b6', marginTop:2 }}>{p.distance}</div>}
              </button>
            ))}
          </div>
      }
    </div>
  );
}