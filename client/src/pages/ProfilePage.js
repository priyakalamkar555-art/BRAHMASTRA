import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { initials } from '../utils/helpers';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ name: user?.name || '', phone: user?.phone || '', bloodGroup: user?.bloodGroup || '', address: user?.address || '' });
  const [toast,   setToast]   = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.updateProfile(form);
      setUser(data.user);
      setEditing(false);
      showToast('Profile updated!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const inp = { width:'100%', background:'#1a1a26', border:'1px solid #2a2a40', borderRadius:10, padding:'0.68rem 1rem', color:'#f0f0f8', fontFamily:"'Inter',sans-serif", fontSize:'0.88rem', marginBottom:'0.75rem', outline:'none' };

  const settings = [
    { icon:'🔔', title:'Notifications',       sub:'Alert preferences' },
    { icon:'🔒', title:'Privacy & Security',   sub:'Passcode, biometrics' },
    { icon:'📍', title:'Location Settings',    sub:'Auto-share on SOS' },
    { icon:'📋', title:'SOS History',          sub:'Past emergency logs' },
    { icon:'ℹ️', title:'About SafeGuard',      sub:'Version 1.0.0' }
  ];

  return (
    <div>
      {toast && (
        <div style={{ position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)',
          background:'#1a1a26', border:'1px solid #2ec4b6', borderRadius:10,
          padding:'0.65rem 1.3rem', color:'#2ec4b6', fontSize:'0.84rem', zIndex:200, whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      {/* Profile card */}
      <div style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:18, padding:'1.8rem', textAlign:'center', marginBottom:'1.1rem' }}>
        <div style={{ width:88, height:88, borderRadius:'50%', background:'linear-gradient(135deg,#e63946,#7b2d8b)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Rajdhani',sans-serif", fontSize:'1.9rem', fontWeight:700, margin:'0 auto 0.9rem', border:'3px solid #e63946' }}>
          {initials(user?.name)}
        </div>
        <h2 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:'1.5rem', fontWeight:700, margin:0 }}>{user?.name}</h2>
        <p style={{ fontSize:'0.82rem', color:'#a0a0b8', marginTop:4 }}>{user?.email}</p>
        {user?.phone && <p style={{ fontSize:'0.82rem', color:'#a0a0b8' }}>{user.phone}</p>}
        {user?.bloodGroup && <span style={{ display:'inline-block', marginTop:6, padding:'2px 10px', borderRadius:20, background:'rgba(230,57,70,0.15)', color:'#ff6b6b', fontSize:'0.75rem', fontWeight:600 }}>{user.bloodGroup}</span>}
      </div>

      {/* Edit profile form */}
      {editing ? (
        <div style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:16, padding:'1.4rem', marginBottom:'1.1rem' }}>
          <h3 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:'1.15rem', marginBottom:'1.1rem' }}>Edit Profile</h3>
          <input style={inp} placeholder="Full Name" value={form.name}       onChange={set('name')} />
          <input style={inp} placeholder="Phone"     value={form.phone}      onChange={set('phone')} />
          <input style={inp} placeholder="Blood Group (A+, O-, etc.)" value={form.bloodGroup} onChange={set('bloodGroup')} />
          <input style={inp} placeholder="Home Address" value={form.address} onChange={set('address')} />
          <div style={{ display:'flex', gap:'0.8rem' }}>
            <button onClick={() => setEditing(false)}
              style={{ flex:1, padding:'0.68rem', borderRadius:10, border:'1px solid #2a2a40', background:'#1a1a26', color:'#f0f0f8', cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", fontWeight:700 }}>
              Cancel
            </button>
            <button onClick={saveProfile} disabled={loading}
              style={{ flex:1, padding:'0.68rem', borderRadius:10, border:'none', background:'#2ec4b6', color:'#0a0a0f', cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", fontWeight:700 }}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)}
          style={{ width:'100%', padding:'0.75rem', marginBottom:'1.1rem', borderRadius:12, border:'1px solid #2a2a40', background:'#111118', color:'#f0f0f8', cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", fontSize:'1rem', fontWeight:600 }}>
          ✏️ Edit Profile
        </button>
      )}

      {/* Settings list */}
      <div style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:16, overflow:'hidden', marginBottom:'1rem' }}>
        {settings.map(({ icon, title, sub }, i) => (
          <div key={i} style={{ padding:'0.95rem 1.1rem', display:'flex', alignItems:'center', gap:'0.9rem', borderBottom:'1px solid #2a2a40', cursor:'pointer' }}>
            <div style={{ width:36, height:36, borderRadius:9, background:'#1a1a26', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.9rem', fontWeight:500 }}>{title}</div>
              <div style={{ fontSize:'0.75rem', color:'#a0a0b8' }}>{sub}</div>
            </div>
            <span style={{ color:'#606078' }}>›</span>
          </div>
        ))}

        {/* Sign out */}
        <div onClick={logout} style={{ padding:'0.95rem 1.1rem', display:'flex', alignItems:'center', gap:'0.9rem', cursor:'pointer' }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'rgba(230,57,70,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>🚪</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'0.9rem', fontWeight:500, color:'#e63946' }}>Sign Out</div>
            <div style={{ fontSize:'0.75rem', color:'#a0a0b8' }}>Log out of SafeGuard</div>
          </div>
          <span style={{ color:'#606078' }}>›</span>
        </div>
      </div>
    </div>
  );
}