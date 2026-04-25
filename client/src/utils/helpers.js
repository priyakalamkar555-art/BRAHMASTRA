/** Get browser geolocation as a Promise */
export const getCurrentPosition = () =>
  new Promise((resolve, reject) =>
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      : reject(new Error('Geolocation not supported'))
  );

/** Format seconds → mm:ss */
export const fmtTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

/** Get initials from a full name */
export const initials = (name = '') =>
  name.trim().split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

/** Format ISO timestamp → readable */
export const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });