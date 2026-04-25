import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { initials } from '../utils/helpers';
import logo from '../logo.jpeg'; // Make sure this extension is correct!
import bgPhoto from '../bg.jpg';

const S = {
// Change line 8 to look like this:
wrap: { 
  display: 'flex', 
  flexDirection: 'column', 
  height: '100vh', 
  backgroundImage: `url(${bgPhoto})`, // Uses the variable from Line 10
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: '#f0f0f8', 
  maxWidth: '480px', 
  margin: '0 auto',
  position: 'relative'
},
  header:  { background:'#111118', borderBottom:'1px solid #2a2a40', padding:'0.9rem 1.4rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  logo:    { display:'flex', alignItems:'center', gap:'0.6rem' },
  logoTxt: { fontFamily:"'Rajdhani',sans-serif", fontSize:'1.25rem', fontWeight:700, color:'#ff6b6b', letterSpacing:'1px', margin:0 },
  avatar:  { width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#e63946,#7b2d8b)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.82rem', color:'#fff', border:'2px solid #e63946', cursor:'pointer', textDecoration:'none' },
  main:    { flex:1, overflowY:'auto', padding:'1.4rem' },
  nav:     { background:'#111118', borderTop:'1px solid #2a2a40', padding:'0.55rem 0.4rem', display:'flex', justifyContent:'space-around', flexShrink:0 },
  sosBar:  { position:'fixed', top:0, left:0, right:0, background:'#c62828', padding:'0.9rem 1.4rem', zIndex:999, textAlign:'center', color:'#fff' },
  dismiss: { marginTop:6, padding:'3px 14px', border:'1px solid #fff', borderRadius:6, background:'transparent', color:'#fff', cursor:'pointer', fontSize:'0.78rem' }
};

const navItems = [
  { to:'/',          exact:true, icon:'🆘', label:'SOS' },
  { to:'/contacts',             icon:'📱', label:'Contacts' },
  { to:'/location',             icon:'📍', label:'Location' },
  { to:'/notes',                icon:'🎙', label:'Notes' },
  { to:'/profile',              icon:'👤', label:'Profile' }
];

export default function Layout() {
  const { user } = useAuth();
  const { incomingSOS, setIncomingSOS } = useSocket();

  return (
    <div style={S.wrap}>
      {/* Incoming SOS Banner */}
      {incomingSOS && (
        <div style={S.sosBar}>
          <p style={{ fontWeight:700 }}>🚨 SOS from {incomingSOS.userName}!</p>
          <p style={{ fontSize:'0.8rem', marginTop:3 }}>{incomingSOS.message}</p>
          <button style={S.dismiss} onClick={() => setIncomingSOS(null)}>Dismiss</button>
        </div>
      )}

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <img src={logo} alt="Logo" style={{ width: '250px', height: '50px', objectFit: 'contain' }} />
        </div>
        <NavLink to="/profile" style={S.avatar}>
          {initials(user?.name)}
        </NavLink>
      </header>

      {/* Page content */}
      <main style={S.main}><Outlet /></main>

      {/* Bottom navigation */}
      <nav style={S.nav}>
        {navItems.map(({ to, exact, icon, label }) => (
          <NavLink
            key={to} to={to} end={exact}
            style={({ isActive }) => ({
              display:'flex', flexDirection:'column', alignItems:'center', gap:2,
              textDecoration:'none', padding:'0.3rem 0.7rem', borderRadius:10,
              color: isActive ? '#ff6b6b' : '#606078',
              background: isActive ? 'rgba(255,107,107,0.1)' : 'transparent',
              transition:'all 0.2s'
            })}
          >
            <span style={{ fontSize:'1.25rem' }}>{icon}</span>
            <span style={{ fontSize:'0.62rem', fontWeight:500, letterSpacing:'0.4px' }}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}