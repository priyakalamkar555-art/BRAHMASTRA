import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import bgPhoto from '../bg.jpg';
// Change 'logo.jpeg' to match your actual file name (e.g., logo.png or logo.jpg)
import logo from '../logo.jpeg'; 

const S = {
  page: { 
    minHeight:'100vh', 
    backgroundImage: `url(${bgPhoto})`, 
    backgroundSize: 'cover', 
    backgroundPosition: 'center',
    display:'flex', 
    flexDirection:'column', 
    alignItems:'center', 
    justifyContent:'center', 
    padding:'2rem' 
  },
  // ... rest of your S object
  logo:    { textAlign:'center', marginBottom:'2rem' },
  shield:  { fontSize:'3.2rem', display:'block', marginBottom:'0.4rem' },
  h1:      { fontFamily:"'Rajdhani',sans-serif", fontSize:'2.1rem', fontWeight:700, color:'#ff6b6b', letterSpacing:'2px', margin:0 },
  sub:     { color:'#a0a0b8', fontSize:'0.82rem', letterSpacing:'1px' },
 card: {
  background: 'rgba(17, 17, 24, 0.8)', // This makes it 80% see-through (Glassmorphism)
  backdropFilter: 'blur(10px)',        // This blurs the photo behind the box
  padding: '2rem',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  width: '100%',
  maxWidth: '400px'
},
  tabs:    { display:'flex', background:'#1a1a26', borderRadius:12, padding:4, marginBottom:'1.6rem', gap:4 },
  tab:     { flex:1, padding:'0.55rem', border:'none', borderRadius:9, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.84rem', fontWeight:500, transition:'all 0.2s' },
  group:   { marginBottom:'1.1rem' },
  label:   { display:'block', fontSize:'0.75rem', color:'#a0a0b8', marginBottom:'0.4rem', letterSpacing:'0.5px', textTransform:'uppercase' },
  input:   { width:'100%', background:'#1a1a26', border:'1px solid #2a2a40', borderRadius:10, padding:'0.72rem 1rem', color:'#f0f0f8', fontFamily:"'Inter',sans-serif", fontSize:'0.9rem', outline:'none' },
  btn:     { width:'100%', padding:'0.82rem', background:'#CF1020', border:'none', borderRadius:12, color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontSize:'1.08rem', fontWeight:700, letterSpacing:'1px', cursor:'pointer', marginTop:'0.4rem' },
  err:     { background:'rgba(230,57,70,0.12)', border:'1px solid grey', borderRadius:10, padding:'0.65rem 1rem', color:'#ff6b6b', fontSize:'0.83rem', marginBottom:'1rem' },
  sub: { 
  color: '#f0f0f8', // This is a bright orange/gold
  fontSize: '1.1rem', 
  fontFamily: 'Rajdhani, sans-serif',
  fontWeight:'bold',
  letterSpacing: '1px' 
},
};

export default function AuthPage() {
  const { login, register } = useAuth();
  const [tab, setTab]       = useState('login');
  const [err, setErr]       = useState('');
  const [busy, setBusy]     = useState(false);
  const [form, setForm]     = useState({ name:'', email:'', phone:'', password:'' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setErr(''); setBusy(true);
    try {
      if (tab === 'login') {
        if (!form.email || !form.password) { setErr('Email and password required'); return; }
        await login(form.email, form.password);
      } else {
        if (!form.name || !form.email || !form.phone || !form.password) { setErr('All fields required'); return; }
        await register(form.name, form.email, form.phone, form.password);
      }
    } catch (e) {
      setErr(e.response?.data?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.logo}>
        <img src={logo} alt="Logo" style={{ width: '300px', height: '50px', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
        <p style={S.sub}>HER Safety Belongs in HER Hands</p>
      </div>

      <div style={S.card}>
        {/* Tabs */}
        <div style={S.tabs}>
          {['login','signup'].map((t) => (
            <button key={t} style={{ ...S.tab, background: tab===t ? '#CF1020':'transparent', color: tab===t ? '#fff':'#a0a0b8' }}
              onClick={() => { setTab(t); setErr(''); }}>
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {err && <div style={S.err}>{err}</div>}

        {/* Fields */}
        {tab === 'signup' && (
          <div style={S.group}>
            <label style={S.label}>Full Name</label>
            <input style={S.input} placeholder="Priya Sharma" value={form.name} onChange={set('name')} />
          </div>
        )}
        <div style={S.group}>
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} />
        </div>
        {tab === 'signup' && (
          <div style={S.group}>
            <label style={S.label}>Phone</label>
            <input style={S.input} type="tel" placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} />
          </div>
        )}
        <div style={S.group}>
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
        </div>

        <button style={{ ...S.btn, opacity: busy ? 0.7 : 1 }} onClick={handleSubmit} disabled={busy}>
          {busy ? 'Please wait…' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>
      </div>
    </div>
  );
}