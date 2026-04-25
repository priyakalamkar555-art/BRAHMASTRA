import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const COLORS = ['#e63946','#7b2d8b','#2ec4b6','#ffd166','#f4a261'];

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'', relation:'', email:'' });
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try { const { data } = await api.getContacts(); setContacts(data.contacts); } catch {}
  };

  const addContact = async () => {
    if (!form.name || !form.phone) { showToast('Name and phone required'); return; }
    setLoading(true);
    try {
      await api.addContact(form);
      setForm({ name:'', phone:'', relation:'', email:'' });
      setShowModal(false);
      fetchContacts();
      showToast('Contact added!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to add contact');
    } finally { setLoading(false); }
  };

  const deleteContact = async (id) => {
    try { await api.deleteContact(id); fetchContacts(); showToast('Contact removed'); } catch {}
  };

  const sendSOS = (name) => showToast(`🚨 SOS sent to ${name}!`);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inp = { width:'100%', background:'#1a1a26', border:'1px solid #2a2a40', borderRadius:10, padding:'0.68rem 1rem', color:'#f0f0f8', fontFamily:"'Inter',sans-serif", fontSize:'0.88rem', marginBottom:'0.75rem', outline:'none' };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)',
          background:'#1a1a26', border:'1px solid #e63946', borderRadius:10,
          padding:'0.65rem 1.3rem', color:'#ff6b6b', fontSize:'0.84rem', zIndex:200, whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div>
          <h2 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:'1.3rem', fontWeight:700 }}>Emergency Contacts</h2>
          <p style={{ fontSize:'0.78rem', color:'#a0a0b8', marginTop:2 }}>One-click SOS to all</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ background:'#e63946', border:'none', borderRadius:8, color:'#fff', padding:'0.42rem 1rem', fontSize:'0.8rem', cursor:'pointer', fontWeight:500 }}>
          + Add
        </button>
      </div>

      {/* Send to all */}
      <button onClick={() => { contacts.forEach(c => sendSOS(c.name)); }}
        style={{ width:'100%', padding:'0.88rem', background:'linear-gradient(135deg,#e63946,#b71c1c)', border:'none', borderRadius:14, color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontSize:'1.08rem', fontWeight:700, cursor:'pointer', letterSpacing:'1px', marginBottom:'1.2rem' }}>
        🚨 SEND SOS TO ALL CONTACTS
      </button>

      {/* Contact list */}
      {contacts.length === 0
        ? <p style={{ textAlign:'center', color:'white',fontweight:'bold', marginTop:'3rem', fontSize:'0.9rem' }}>No contacts yet. Add one above!</p>
        : contacts.map((c, i) => (
          <div key={c._id}
            style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:14, padding:'0.9rem 1.1rem', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.9rem' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:`${COLORS[i % COLORS.length]}22`, color:COLORS[i % COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1rem', flexShrink:0 }}>
              {c.name[0]}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:'0.94rem' }}>{c.name}</div>
              <div style={{ fontSize:'0.78rem', color:'#a0a0b8' }}>{c.phone} · {c.relation || 'Contact'}</div>
            </div>
            <button onClick={() => sendSOS(c.name)}
              style={{ background:'#e63946', border:'none', borderRadius:8, padding:'0.38rem 0.85rem', color:'#fff', fontSize:'0.76rem', cursor:'pointer', fontWeight:700, fontFamily:"'Rajdhani',sans-serif", letterSpacing:'0.5px' }}>
              SOS
            </button>
            <button onClick={() => deleteContact(c._id)}
              style={{ background:'transparent', border:'1px solid #3a3a55', borderRadius:8, padding:'0.38rem 0.6rem', color:'#a0a0b8', fontSize:'0.76rem', cursor:'pointer' }}>
              ✕
            </button>
          </div>
        ))
      }

      {/* Add Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', zIndex:300 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:20, padding:'1.8rem', width:'100%', maxWidth:400 }}>
            <h3 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:'1.25rem', marginBottom:'1.2rem' }}>➕ Add Emergency Contact</h3>
            <input style={inp} placeholder="Full Name *" value={form.name}     onChange={set('name')} />
            <input style={inp} placeholder="Phone Number *" value={form.phone}  onChange={set('phone')} />
            <input style={inp} placeholder="Relation (Mom, Friend…)" value={form.relation} onChange={set('relation')} />
            <input style={inp} placeholder="Email (optional)"  value={form.email} onChange={set('email')} />
            <div style={{ display:'flex', gap:'0.8rem', marginTop:4 }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex:1, padding:'0.7rem', borderRadius:10, border:'1px solid #2a2a40', background:'#1a1a26', color:'#f0f0f8', cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", fontSize:'0.95rem', fontWeight:700 }}>
                Cancel
              </button>
              <button onClick={addContact} disabled={loading}
                style={{ flex:1, padding:'0.7rem', borderRadius:10, border:'none', background:'#e63946', color:'#fff', cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", fontSize:'0.95rem', fontWeight:700 }}>
                {loading ? 'Adding…' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}