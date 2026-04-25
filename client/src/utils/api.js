import axios from 'axios';

// All paths are relative – CRA proxy forwards them to http://localhost:5000
export const api = {
  // Auth
  login:       (email, password)        => axios.post('/api/auth/login',    { email, password }),
  register:    (name, email, phone, pw) => axios.post('/api/auth/register', { name, email, phone, password: pw }),
  getMe:       ()                       => axios.get('/api/auth/me'),
  updateProfile: (data)                 => axios.put('/api/auth/profile', data),

  // Contacts
  getContacts:    ()        => axios.get('/api/contacts'),
  addContact:     (data)    => axios.post('/api/contacts', data),
  updateContact:  (id, data)=> axios.put(`/api/contacts/${id}`, data),
  deleteContact:  (id)      => axios.delete(`/api/contacts/${id}`),

  // SOS
  triggerSOS: (data)  => axios.post('/api/sos/trigger', data),
  resolveSOS: (id)    => axios.post(`/api/sos/resolve/${id}`),
  sosHistory: ()      => axios.get('/api/sos/history'),

  // Location
  updateLocation: (lat, lng)         => axios.post('/api/location/update',  { latitude: lat, longitude: lng }),
  stopLocation:   ()                 => axios.post('/api/location/stop'),
  safePlaces:     (lat, lng, r=2000) => axios.get(`/api/location/safe-places?latitude=${lat}&longitude=${lng}&radius=${r}`),

  // Notes
  getNotes:       (type) => axios.get(`/api/notes${type ? `?type=${type}` : ''}`),
  saveTextNote:   (content, title) => axios.post('/api/notes/text', { content, title }),
  saveVoiceNote:  (formData)       => axios.post('/api/notes/voice', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteNote:     (id)             => axios.delete(`/api/notes/${id}`)
};