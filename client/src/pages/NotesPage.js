import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { fmtTime, fmtDate } from '../utils/helpers';

export default function NotesPage() {
  const [tab,          setTab]        = useState('voice');
  const [voiceNotes,   setVoiceNotes] = useState([]);
  const [textNotes,    setTextNotes]  = useState([]);
  const [noteText,     setNoteText]   = useState('');
  const [recording,    setRecording]  = useState(false);
  const [seconds,      setSeconds]    = useState(0);
  const [toast,        setToast]      = useState('');

  const mediaRef    = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const playingRef  = useRef({});

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    fetchNotes();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchNotes = async () => {
    try {
      const v = await api.getNotes('voice');
      const t = await api.getNotes('text');
      setVoiceNotes(v.data.notes);
      setTextNotes(t.data.notes);
    } catch {}
  };

  /* ── Voice recording ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRef.current.start();
      setRecording(true); setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch { showToast('Microphone permission denied'); }
  };

  const stopRecording = () => {
    if (!mediaRef.current) return;
    mediaRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio',    blob,        `voice_${Date.now()}.webm`);
      formData.append('duration', fmtTime(seconds));
      formData.append('title',    `Voice Note ${new Date().toLocaleTimeString()}`);
      try { await api.saveVoiceNote(formData); fetchNotes(); showToast('Voice note saved!'); }
      catch { showToast('Failed to save voice note'); }
    };
    mediaRef.current.stop();
    mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    clearInterval(timerRef.current);
    setRecording(false); setSeconds(0);
  };

  const playNote = (note) => {
    if (playingRef.current[note._id]) {
      playingRef.current[note._id].pause();
      delete playingRef.current[note._id];
      return;
    }
    const audio = new Audio(`http://localhost:5000${note.content}`);
    playingRef.current[note._id] = audio;
    audio.play().catch(() => showToast('Could not play audio'));
    audio.onended = () => delete playingRef.current[note._id];
  };

  const saveTextNote = async () => {
    if (!noteText.trim()) { showToast('Note is empty'); return; }
    try {
      await api.saveTextNote(noteText.trim(), `Note ${new Date().toLocaleTimeString()}`);
      setNoteText('');
      fetchNotes();
      showToast('Note saved!');
    } catch { showToast('Failed to save note'); }
  };

  const deleteNote = async (id) => {
    try { await api.deleteNote(id); fetchNotes(); showToast('Note deleted'); } catch {}
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

      <h2 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:'1.3rem', fontWeight:700, marginBottom:'1rem' }}>Voice & Text Notes</h2>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.1rem' }}>
        {[['voice','🎙 Voice Notes'],['text','📝 Text Notes']].map(([key,lbl]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding:'0.42rem 1rem', borderRadius:8, border:`1px solid ${tab===key ? '#2ec4b6':'#2a2a40'}`, background: tab===key ? '#1a1a26':'transparent', color: tab===key ? '#2ec4b6':'#a0a0b8', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.82rem' }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── VOICE TAB ── */}
      {tab === 'voice' && (
        <>
          <div style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:16, padding:'1.4rem', textAlign:'center', marginBottom:'1.1rem' }}>
            <button onClick={recording ? stopRecording : startRecording}
              style={{ width:78, height:78, borderRadius:'50%', background: recording ? '#b71c1c':'#e63946', border:'none', cursor:'pointer', fontSize:'1.9rem', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.9rem', animation: recording ? 'pulse 1s infinite':' none' }}>
              {recording ? '⏹' : '🎙'}
            </button>
            <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
            <p style={{ color: recording ? '#ff6b6b':'#a0a0b8', fontSize:'0.85rem', fontWeight: recording ? 600:400 }}>
              {recording ? `Recording… ${fmtTime(seconds)}` : 'Tap to start recording'}
            </p>
          </div>

          {voiceNotes.length === 0
            ? <p style={{ textAlign:'center', color:'black',fontWeight:'bold', fontSize:'0.88rem' }}>No voice notes yet</p>
            : voiceNotes.map((n) => (
              <div key={n._id} style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:12, padding:'0.9rem 1rem', marginBottom:'0.7rem', display:'flex', alignItems:'center', gap:'0.9rem' }}>
                <button onClick={() => playNote(n)}
                  style={{ width:36, height:36, borderRadius:'50%', background:'#2ec4b6', border:'none', cursor:'pointer', color:'#0a0a0f', fontSize:'0.9rem', flexShrink:0 }}>▶</button>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.84rem', fontWeight:600 }}>{n.title}</div>
                  <div style={{ fontSize:'0.72rem', color:'#606078' }}>{fmtDate(n.createdAt)} · {n.duration}</div>
                </div>
                <button onClick={() => deleteNote(n._id)}
                  style={{ background:'transparent', border:'none', color:'#606078', cursor:'pointer', fontSize:'0.9rem' }}>🗑</button>
              </div>
            ))
          }
        </>
      )}

      {/* ── TEXT TAB ── */}
      {tab === 'text' && (
        <>
          <div style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:14, padding:'1.1rem', marginBottom:'1rem' }}>
            <textarea
              value={noteText} onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a note — cab number, location details, emergency info…"
              style={{ width:'100%', background:'#1a1a26', border:'1px solid #2a2a40', borderRadius:10, padding:'0.72rem', color:'#f0f0f8', fontFamily:"'Inter',sans-serif", fontSize:'0.87rem', resize:'none', outline:'none', minHeight:100 }}
            />
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'0.6rem' }}>
              <button onClick={saveTextNote}
                style={{ background:'#2ec4b6', border:'none', borderRadius:9, padding:'0.58rem 1.3rem', color:'#0a0a0f', fontWeight:700, cursor:'pointer', fontSize:'0.84rem', fontFamily:"'Rajdhani',sans-serif", letterSpacing:'0.5px' }}>
                Save Note
              </button>
            </div>
          </div>

          {textNotes.length === 0
            ? <p style={{ textAlign:'center', color:'black', fontweight:'bold', fontSize:'0.88rem' }}>No text notes yet</p>
            : textNotes.map((n) => (
              <div key={n._id} style={{ background:'#111118', border:'1px solid #2a2a40', borderRadius:12, padding:'0.95rem 1rem', marginBottom:'0.7rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ fontSize:'0.72rem', color:'#606078', marginBottom:'0.35rem' }}>{fmtDate(n.createdAt)}</div>
                  <button onClick={() => deleteNote(n._id)}
                    style={{ background:'transparent', border:'none', color:'#606078', cursor:'pointer', fontSize:'0.85rem', padding:0 }}>🗑</button>
                </div>
                <div style={{ fontSize:'0.87rem', color:'#f0f0f8', lineHeight:1.6 }}>{n.content}</div>
              </div>
            ))
          }
        </>
      )}
    </div>
  );
}