import React, { useState, useRef } from 'react';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { getCurrentPosition } from '../utils/helpers';
// STEP 1: Import your siren sound
import sirenSound from '../SOS.mp3'; 

export default function SOSPage() {
  const { triggerSOSSocket } = useSocket();
  const [active,  setActive]  = useState(false);
  const [sosId,   setSosId]   = useState(null);
  const [msg,     setMsg]     = useState('');
  const [loading, setLoading] = useState(false);

  // STEP 2: Create a reference for the audio player
  const audioRef = useRef(new Audio(sirenSound));

  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const handleSOS = async () => {
    const audio = audioRef.current;

    if (active) {
      // STOP THE ALARM
      audio.pause();
      audio.currentTime = 0; // Reset sound to the start

      // Resolve SOS
      if (sosId) { try { await api.resolveSOS(sosId); } catch {} }
      setActive(false); setSosId(null);
      toast('✅ SOS cancelled and marked resolved');
      return;
    }

    setLoading(true);
    try {
      // START THE ALARM
      audio.loop = true; // Keep it ringing
      audio.play().catch(e => console.log("Audio playback blocked/failed:", e));

      const pos = await getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      const { data } = await api.triggerSOS({ latitude, longitude });
      triggerSOSSocket(latitude, longitude, []);
      setActive(true);
      setSosId(data.sosLogId);
      toast(`🚨 SOS sent to ${data.message}`);
      if (navigator.vibrate) navigator.vibrate([500,200,500,200,1000]);
    } catch (e) {
      toast(e.response?.data?.message || 'Could not send SOS');
      // If the SOS fails, you might want to stop the alarm too:
      audio.pause();
    } finally {
      setLoading(false);
    }
  };

  const quickAction = (label) => toast(`📞 ${label} activated!`);

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', minHeight:'65vh', gap:'1.8rem', paddingTop:'1rem' }}>
      {/* Toast */}
      {msg && (
        <div style={{ position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)',
          background:'#1a1a26', border:'1px solid #e63946', borderRadius:10,
          padding:'0.65rem 1.3rem', color:'#ff6b6b', fontSize:'0.84rem', zIndex:200, whiteSpace:'nowrap' }}>
          {msg}
        </div>
      )}

      {/* Outer rings + SOS button */}
      <div style={{ width:220, height:220, borderRadius:'50%', background:'rgba(230,57,70,0.07)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(230,57,70,0.18)' }}>
        <div style={{ width:170, height:170, borderRadius:'50%', background:'rgba(230,57,70,0.11)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(230,57,70,0.28)' }}>
          <button
            onClick={handleSOS}
            disabled={loading}
            style={{
              width:128, height:128, borderRadius:'50%',
              background: active ? 'linear-gradient(135deg,#b71c1c,#c62828)' : 'linear-gradient(135deg,#c62828,#e63946)',
              border:'none', cursor:'pointer', display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              fontFamily:"'Rajdhani',sans-serif", fontSize:'1.55rem', fontWeight:700,
              color:'#fff', letterSpacing:'2px',
              animation: active ? 'pulse 0.8s infinite' : 'none',
              boxShadow: active ? '0 0 30px rgba(230,57,70,0.6)' : '0 4px 20px rgba(230,57,70,0.35)',
              transition:'all 0.2s'
            }}
          >
            <span style={{ fontSize:'2rem', marginBottom:2 }}></span>
            {loading ? '…' : active ? 'STOP' : 'SOS'}
          </button>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}`}</style>

      <div style={{ textAlign:'center' }}>
        <h3 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:'1.35rem', marginBottom:4, color:'Black', fontWeight:'bold' }}>
          {active ? '🚨 SOS ACTIVE' : 'Emergency SOS'}
        </h3>
        <p style={{ fontSize:'0.95rem', color:'white', fontWeight:'bold' }}>
          {active ? 'Tap again to stop alarm and resolve' : 'Tap to send alert to all emergency contacts'}
        </p>
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem', width:'100%', maxWidth:360 }}>
        {[
          { icon:'👮', label:'Call Police (100)' },
          { icon:'🚑', label:'Ambulance (102)' },
          { icon:'🔔', label:'Loud Alarm' },
          { icon:'📞', label:'Fake Call' }
        ].map(({ icon, label }) => (
          <button key={label} onClick={() => quickAction(label)}
            style={{ padding:'0.8rem', borderRadius:12, border:'1px solid #2a2a40',
              background:'#111118', cursor:'pointer', color:'#f0f0f8',
              fontFamily:"'Inter',sans-serif", fontSize:'0.78rem',
              display:'flex', flexDirection:'column', alignItems:'center', gap:'0.35rem', transition:'all 0.2s' }}>
            <span style={{ fontSize:'1.55rem' }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}