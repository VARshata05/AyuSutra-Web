// CONFIG AND STATE
let GMAPS_KEY = window.GOOGLE_MAPS_KEY || '';
let gmapsLoaded = false;
let placesService = null;

let currentUser = null;
let userLat = null, userLng = null, userDistrict = null, activeDistrict = null;
let symptoms = [], records = [];

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('ayusutra_theme') || 'light';
  if (savedTheme === 'dark') document.body.setAttribute('data-theme', 'dark');
  updateThemeIcon();
}
function toggleTheme() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.body.removeAttribute('data-theme');
    localStorage.setItem('ayusutra_theme', 'light');
  } else {
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('ayusutra_theme', 'dark');
  }
  updateThemeIcon();
}
function updateThemeIcon() {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = document.body.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
}
initTheme();

// Results cache to avoid repeated API calls
const cache = { hospitals: null, diagnostics: null, bloodBanks: null, cacheKey: null };

// Pagination
let hospDisplayed = 0;
const HOSP_PAGE_SIZE = 15;
let filteredHospList = [];

// Pending file for records
let pendingFile = null;
// Chat file
let chatFile = null;
// Voice recognition
let recognition = null;
let isRecording = false;
// Camera stream
let cameraStream = null;
// Debounce timers
const debouncers = {};

// ═══════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════
function debounce(fn, delay = 500) {
  return (...args) => {
    clearTimeout(debouncers[fn.name]);
    debouncers[fn.name] = setTimeout(() => fn(...args), delay);
  };
}
const debounceHospSearch = debounce(renderHospitals, 500);

function haversine(la1,ln1,la2,ln2) {
  const R=6371,dL=(la2-la1)*Math.PI/180,dN=(ln2-ln1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dN/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function distBadgeClass(km) {
  if (km === null) return 'district';
  if (km < 5) return 'near';
  if (km < 15) return 'med';
  return 'far';
}

function cleanSpec(arr) {
  const seen = new Set();
  return (arr||[]).map(s => s.replace(/\s+/g,' ').trim()).filter(s => {
    if (!s || s.length < 3 || s.length > 55 || seen.has(s)) return false;
    seen.add(s); return true;
  });
}

function mapsDirectionsUrl(name, addr, lat, lng) {
  if (userLat && userLng && lat && lng) {
    return `https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name+' '+addr)}`;
}

// ═══════════════════════════════════════════════════
// API KEY MANAGEMENT
// ═══════════════════════════════════════════════════


function loadGoogleMaps() {
  if (gmapsLoaded || !GMAPS_KEY || GMAPS_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') return;
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places&callback=onGMapsLoaded`;
  script.async = true;
  document.head.appendChild(script);
}

window.onGMapsLoaded = function() {
  gmapsLoaded = true;
  const div = document.createElement('div');
  placesService = new google.maps.places.PlacesService(div);
  console.log('Google Maps Places API ready');
  // Re-render if we have location
  if (userLat && userLng) { renderHospitals(); renderDiagnostics(); }
};

// ═══════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════
function switchAuth(m) {
  console.log('Switching auth mode to:', m);
  try {
    document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',(m==='login'&&i===0)||(m==='signup'&&i===1)));
    const lForm = document.getElementById('loginForm');
    const sForm = document.getElementById('signupForm');
    const fForm = document.getElementById('forgotForm');
    const rForm = document.getElementById('resetForm');
    if(lForm) lForm.style.display = m==='login' ? '' : 'none';
    if(sForm) sForm.style.display = m==='signup' ? '' : 'none';
    if(fForm) fForm.style.display = m==='forgot' ? '' : 'none';
    if(rForm) rForm.style.display = m==='reset' ? '' : 'none';
  } catch(e) {
    console.error('Error in switchAuth:', e);
  }
}

async function doForgotPassword() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) return showToast('Please enter your email', 'error');

  try {
    const res = await fetch(`${window.API_BASE}/auth/forgot-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error generating reset code');
    
    // Automatically fill email in reset form
    document.getElementById('resetEmail').value = email;
    
    showToast('Reset code generated! Check your console/alert.', 'success');
    // For prototype purposes, since we don't send emails, we alert the code
    alert(`TEST MODE: Your password reset code is: ${data.test_code}\n\n(In production, this would be emailed to you)`);
    
    switchAuth('reset');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function doResetPassword() {
  const email = document.getElementById('resetEmail').value.trim();
  const token = document.getElementById('resetCode').value.trim();
  const newPassword = document.getElementById('resetPass').value;

  if (!email || !token || !newPassword) return showToast('Please fill all fields', 'error');
  if (newPassword.length < 6) return showToast('Password must be at least 6 characters', 'error');

  try {
    const res = await fetch(`${window.API_BASE}/auth/reset-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error resetting password');
    
    showToast('Password reset successfully! Please sign in.', 'success');
    switchAuth('login');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
async function doLogin() {
  const e=document.getElementById('loginEmail').value.trim(), p=document.getElementById('loginPass').value;
  if(!e||!p){alert('Enter email and password.');return;}
  try {
    const res = await fetch(`${window.API_BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e, password: p })
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message || 'Login failed'); return; }
    localStorage.setItem('ayusutra_token', data.token);
    loginSuccess(data.user);
  } catch (err) { alert('Network error. Please try again.'); }
}
async function doSignup() {
  const n=document.getElementById('signupName').value.trim(), e=document.getElementById('signupEmail').value.trim(),
        b=document.getElementById('signupBlood').value, p=document.getElementById('signupPass').value;
  if(!n||!e||!p){alert('Please fill all required fields.');return;}
  try {
    const res = await fetch(`${window.API_BASE}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: n, email: e, password: p, bloodGroup: b })
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message || 'Signup failed'); return; }
    localStorage.setItem('ayusutra_token', data.token);
    loginSuccess(data.user);
  } catch (err) { alert('Network error. Please try again.'); }
}
function loginSuccess(user) {
  currentUser = user;
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('navName').textContent = user.name.split(' ')[0];
  document.getElementById('navAvatar').textContent = user.name.charAt(0).toUpperCase();
  
  // Populate profile dropdown header
  const ddName = document.getElementById('ddName');
  const ddEmail = document.getElementById('ddEmail');
  if (ddName) ddName.textContent = user.name || 'User';
  if (ddEmail) ddEmail.textContent = user.email || '';
  
  // Update Dashboard fields
  document.getElementById('dashName').value = user.name || '';
  document.getElementById('dashBlood').value = user.bloodGroup || 'A+';
  document.getElementById('dashDOB').value = user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '';
  document.getElementById('dashAllergies').value = user.allergies || '';
  document.getElementById('dashNotes').value = user.medicalNotes || '';
  
  loadGoogleMaps();
  getLocation(false);
  updateDashboardStats();
}
function doLogout() {
  currentUser=null; userLat=null; userLng=null; userDistrict=null;
  localStorage.removeItem('ayusutra_token');
  document.getElementById('authScreen').style.display='flex';
  document.getElementById('app').style.display='none';
}

async function initAuth() {
  const token = localStorage.getItem('ayusutra_token');
  console.log('initAuth token:', token);
  if(!token) return;
  try {
    const url = `${window.API_BASE}/patients/profile`;
    console.log('Fetching profile from:', url);
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    console.log('Profile response status:', res.status);
    if(res.ok) {
      const user = await res.json();
      console.log('Profile loaded, user:', user);
      loginSuccess(user);
    } else {
      console.warn('Profile fetch not ok, removing token');
      localStorage.removeItem('ayusutra_token');
    }
  } catch(e) { console.error('Auto login failed:', e); }
}
initAuth();

// ═══════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════
function show(id, skipHistory = false) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
  const targetPage = document.getElementById('page-'+id);
  if(targetPage) targetPage.classList.add('active');
  const n=document.getElementById('nav-'+id); if(n) n.classList.add('active');
  
  // Sync bottom nav
  document.querySelectorAll('.bnav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === id);
  });
  
  // Show/hide floating chat FAB
  const fab = document.getElementById('floatingChat');
  if (fab) fab.style.display = (id === 'chatbot') ? 'none' : '';
  
  window.scrollTo(0,0);
  if(id==='hospitals') renderHospitals();
  if(id==='diagnostics') renderDiagnostics();
  if(id==='blood') selBlood(document.querySelector('.bg-btn') || {classList:{add:()=>{}}}, 'A+');
  if(id==='history') fetchRecords();
  if(id==='dashboard') updateDashboardStats();

  if (!skipHistory) {
    history.pushState({ pageId: id }, '', `#${id}`);
  }
}

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.pageId) {
    show(event.state.pageId, true);
  } else {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('page-'+hash)) {
      show(hash, true);
    } else {
      show('home', true);
    }
  }
});

// DASHBOARD & PROFILE
async function updateProfile() {
  const token = localStorage.getItem('ayusutra_token');
  const body = {
    name: document.getElementById('dashName').value,
    dateOfBirth: document.getElementById('dashDOB').value,
    bloodGroup: document.getElementById('dashBlood').value,
    allergies: document.getElementById('dashAllergies').value,
    medicalNotes: document.getElementById('dashNotes').value
  };
  try {
    const res = await fetch(`${window.API_BASE}/patients/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if(res.ok) {
      alert(I18N[getLang()].dashSuccess || 'Profile updated!');
      updateDashboardStats();
    }
  } catch(e) { alert('Failed to update profile.'); }
}

async function updateDashboardStats() {
  const token = localStorage.getItem('ayusutra_token');
  if(!token) return;
  try {
    const res = await fetch(`${window.API_BASE}/patients/history`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) {
      const hist = await res.json();
      document.getElementById('statRecords').textContent = hist.length;
      document.getElementById('statLastSym').textContent = localStorage.getItem('ayusutra_last_sym_date') || 'N/A';
    }
  } catch(e) { console.warn('Stats fetch failed'); }
}

// ═══════════════════════════════════════════════════
// GEOLOCATION + REVERSE GEOCODE
// ═══════════════════════════════════════════════════
function getLocation(showMsg) {
  if(!navigator.geolocation) {if(showMsg) alert(t('errGeoNotSupported')); return;}
  const btn = document.getElementById('locBannerBtn');
  if(btn) {btn.innerHTML='<span class="spinner"></span>Locating…'; btn.disabled=true;}
  document.getElementById('heroLocText').textContent=t('heroLocDetecting');
  navigator.geolocation.getCurrentPosition(
    pos => {
      console.log(`Geolocated: ${userLat}, ${userLng}. Fetching address from Nominatim...`);
      // Reverse geocode (no API key needed — OpenStreetMap Nominatim)
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&accept-language=en`, {
        headers: { 'User-Agent': 'AyuSutra-Health-App' }
      })
        .then(r => {
          console.log('Nominatim response status:', r.status);
          if (!r.ok) throw new Error(`Nominatim error: ${r.status}`);
          return r.json();
        }).then(data => {
          console.log('Nominatim data:', data);
          const addr = data.address||{};
          const rawDist = addr.county||addr.district||addr.state_district||addr.city||'';
          userDistrict = matchDistrict(rawDist);
          const city = addr.suburb||addr.city||addr.town||addr.village||rawDist||'Your location';
          console.log(`Matched district: ${userDistrict}, City: ${city}`);
          document.getElementById('heroLocText').textContent=`✅ ${city}`;
          if(btn){btn.textContent=t('locActive');btn.style.background='var(--forest)';btn.disabled=false;}
          document.getElementById('locBannerTitle').textContent=`📍 ${city}`;
          document.getElementById('locBannerSub').textContent=`Showing hospitals in ${userDistrict} district first`;
          activeDistrict = userDistrict;
          // Clear cache when location changes
          cache.cacheKey = null;
          buildDistrictBar();
          renderHospitals();
          renderDiagnostics();
        }).catch(err => {
          console.error('Nominatim fetch failed:', err);
          userDistrict='Bengaluru'; activeDistrict='Bengaluru';
          document.getElementById('heroLocText').textContent=t('locFound');
          if(btn){btn.textContent=t('locActive');btn.style.background='var(--forest)';btn.disabled=false;}
          buildDistrictBar(); renderHospitals();
        });
    },
    err => {
      console.warn('Geolocation failed or denied:', err);
      userLat=12.9716; userLng=77.5946; userDistrict='Bengaluru'; activeDistrict='Bengaluru';
      document.getElementById('heroLocText').textContent=t('locDefault');
      if(btn){btn.textContent=t('heroLocBtn');btn.disabled=false;}
      buildDistrictBar(); renderHospitals();
    },
    {timeout:9000, enableHighAccuracy:true}
  );
}

function matchDistrict(raw) {
  const r = (raw||'').toLowerCase();
  const map = {'bangalore':'Bengaluru','bengaluru':'Bengaluru','mysore':'Mysuru','mysuru':'Mysuru',
    'belgaum':'Belagavi','belagavi':'Belagavi','shimoga':'Shivamogga','shivamogga':'Shivamogga',
    'gulbarga':'Kalaburagi','kalaburagi':'Kalaburagi','tumkur':'Tumakuru','tumakuru':'Tumakuru',
    'mangalore':'Dakshina Kannada','dakshina kannada':'Dakshina Kannada','hassan':'Hassan',
    'mandya':'Mandya','dharwad':'Dharwad','bellary':'Ballari','ballari':'Ballari',
    'udupi':'Udupi','kolar':'Kolar','bidar':'Bidar','raichur':'Raichur','gadag':'Gadag',
    'haveri':'Haveri','chitradurga':'Chitradurga','davanagere':'Davanagere','vijayapura':'Vijayapura',
    'bagalkote':'Bagalkote','kodagu':'Kodagu','chikkamagaluru':'Chikkamagaluru',
    'chikkaballapur':'Chikkaballapur','chamarajanagara':'Chamarajanagara','yadgir':'Yadgir','koppal':'Koppal'};
  for(const [k,v] of Object.entries(map)) {if(r.includes(k)) return v;}
  return 'Bengaluru';
}

// ═══════════════════════════════════════════════════
// GOOGLE MAPS PLACES SEARCH
// ═══════════════════════════════════════════════════
function fetchNearbyPlaces(keyword, type, callback) {
  if (!gmapsLoaded || !placesService || !userLat || !userLng) { callback(null); return; }

  const cKey = `${keyword}_${userLat.toFixed(3)}_${userLng.toFixed(3)}`;
  if (cache.cacheKey === cKey && cache[keyword]) { callback(cache[keyword]); return; }

  const request = {
    location: new google.maps.LatLng(userLat, userLng),
    radius: 5000, // 5km radius
    keyword: keyword,
    type: type
  };

  placesService.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      const top = results.slice(0, 15).map(p => ({
        name: p.name,
        address: p.vicinity || '',
        rating: p.rating || null,
        totalRatings: p.user_ratings_total || 0,
        placeId: p.place_id,
        lat: p.geometry.location.lat(),
        lng: p.geometry.location.lng(),
        isOpen: p.opening_hours?.open_now,
        phone: null, // Need details call
        source: 'gmaps'
      }));
      cache[keyword] = top;
      cache.cacheKey = cKey;
      callback(top);
    } else {
      callback(null);
    }
  });
}

function fetchPlaceDetails(placeId, callback) {
  if (!gmapsLoaded || !placesService) { callback(null); return; }
  placesService.getDetails(
    { placeId, fields: ['formatted_phone_number','opening_hours','website','formatted_address'] },
    (place, status) => callback(status === 'OK' ? place : null)
  );
}

// ═══════════════════════════════════════════════════
// DISTRICT BAR
// ═══════════════════════════════════════════════════
const DISTRICTS = ['Bengaluru','Mysuru','Belagavi','Tumakuru','Kalaburagi','Dakshina Kannada','Hassan','Mandya','Shivamogga','Dharwad','Ballari','Udupi','Kolar','Davanagere'];

function buildDistrictBar() {
  const bar = document.getElementById('districtBar'); if(!bar) return;
  bar.innerHTML = ['All Districts',...DISTRICTS].map(d =>
    `<span class="dist-chip${(d==='All Districts'&&!activeDistrict)||(d===activeDistrict)?' active':''}" onclick="setDistrict('${d}')">${d}</span>`
  ).join('');
}
function setDistrict(d) {
  activeDistrict = d==='All Districts' ? null : d;
  buildDistrictBar();
  renderHospitals();
}

// ═══════════════════════════════════════════════════
// PATIENT DASHBOARD & PROFILE
// ═══════════════════════════════════════════════════
async function updateProfile() {
  const token = localStorage.getItem('ayusutra_token');
  if(!token) return;
  
  const payload = {
    name: document.getElementById('dashName').value,
    dateOfBirth: document.getElementById('dashDOB').value,
    bloodGroup: document.getElementById('dashBlood').value,
    allergies: document.getElementById('dashAllergies').value,
    medicalNotes: document.getElementById('dashNotes').value
  };

  try {
    const res = await fetch(`${window.API_BASE}/patients/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(res.ok) {
      alert(t('dashSuccess'));
      currentUser = data.user;
      loginSuccess(data.user);
    } else {
      alert(data.message || t('errUpdateFailed'));
    }
  } catch(e) { console.error(e); alert(t('errNetwork')); }
}

function updateDashboardStats() {
  document.getElementById('statRecords').textContent = records.length;
  const lastSym = localStorage.getItem('ayusutra_last_sym_date');
  document.getElementById('statLastSym').textContent = lastSym || 'N/A';
}

// ═══════════════════════════════════════════════════
// OPENSTREETMAP (LEAFLET) LOGIC
// ═══════════════════════════════════════════════════
let maps = {};
function initFacilityMap(divId, items) {
  if (!items || !items.length) {
    console.warn(`initFacilityMap called for ${divId} but no items provided.`);
    return;
  }
  
  console.log(`Initializing map for ${divId} with ${items.length} items...`);
  
  if (typeof L === 'undefined') {
    console.error('Leaflet (L) is not defined! Check if script is loaded.');
    return;
  }
  
  if (maps[divId]) { 
    console.log(`Removing existing map for ${divId}`);
    maps[divId].remove(); 
  }

  const map = L.map(divId).setView([userLat || 12.9716, userLng || 77.5946], 13);
  maps[divId] = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // User location marker
  if (userLat && userLng) {
    console.log(`Adding user marker at ${userLat}, ${userLng}`);
    L.circleMarker([userLat, userLng], { color: 'var(--saffron)', radius: 8, fillOpacity: 0.8 })
     .addTo(map).bindPopup(`<b>${t('diagNearMe')}</b>`);
  }

  items.forEach(item => {
    if (item.lat && item.lng) {
      const marker = L.marker([item.lat, item.lng]).addTo(map);
      marker.bindPopup(`<b>${item.name}</b><br>${item.address}<br><button class="btn-fire" style="padding:2px 8px;font-size:10px;margin-top:5px;" onclick="window.open('${mapsDirectionsUrl(item.name, item.address, item.lat, item.lng)}','_blank')">${t('hospDirections')}</button>`);
    }
  });
}

// ═══════════════════════════════════════════════════
// HOSPITAL RENDERING (CSV + optional Google Maps)
// ═══════════════════════════════════════════════════
function hospitalCard(h, highlightSpec='') {
  const isCsv = h.source !== 'gmaps';
  const dist = (userLat&&userLng&&h.lat&&h.lng) ? haversine(userLat,userLng,h.lat,h.lng) : null;
  const distKm = dist ? dist.toFixed(1) : null;
  const distStr = distKm ? (distKm < 1 ? `${Math.round(distKm*1000)} m` : `${distKm} km`) : h.d||'';
  const cls = dist ? distBadgeClass(dist) : 'district';
  const specs = isCsv ? cleanSpec(h.sp||[]).slice(0,5) : [];
  const schemes = isCsv ? (h.s||[]).slice(0,2) : [];
  const phone = h.phone || (isCsv ? h.p : '') || '';
  const mapsUrl = mapsDirectionsUrl(h.name||h.n, h.address||h.a, h.lat, h.lng);

  return `<div class="hcard">
    <div class="hcard-top">
      <div class="hcard-name-row">
        <div class="hcard-name">${h.name||h.n}</div>
        <span class="tag-pill ${isCsv?'tp-csv':'tp-gmaps'}">${isCsv?t('hospGovtDb'):t('hospMaps')}</span>
      </div>
      <div class="hcard-addr">📍 ${(h.address||h.a||'').substring(0,75)}${(h.address||h.a||'').length>75?'…':''}</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;align-items:center;">
        ${distStr?`<span class="dist-badge ${cls}">${dist?'📍 ':'🏙 '}${distStr}</span>`:''}
        ${h.isOpen===true?`<span class="dist-badge near">${t('hospOpen')}</span>`:h.isOpen===false?`<span class="dist-badge far">${t('hospClosed')}</span>`:''}
        <a class="gmaps-link" href="${mapsUrl}" target="_blank">🗺 ${t('hospDirections')}</a>
      </div>
      ${(h.rating)?`<div class="rating-row"><span class="stars">${'★'.repeat(Math.round(h.rating))}${'☆'.repeat(5-Math.round(h.rating))}</span><span class="rating-num">${h.rating} ${h.totalRatings?`(${h.totalRatings})`:''}  </span></div>`:''}
    </div>
    <div class="hcard-body">
      ${specs.length?`<div class="spec-label">${t('hospSpecialities')}</div><div class="spec-chips">${specs.map(s=>`<span class="spec-chip${highlightSpec&&s.toUpperCase().includes(highlightSpec.toUpperCase())?' match':''}">${s}</span>`).join('')}</div>`:''}
      ${schemes.length?`<div class="scheme-chips">${schemes.map(s=>`<span class="scheme-chip">✓ ${s.replace('Ayushman Bharat - Arogya Karnataka','Ayushman Bharat')}</span>`).join('')}</div>`:''}
      ${phone?`<div class="hcard-meta"><span class="meta-item">📞 ${phone}</span></div>`:''}
      <div class="hcard-actions">
        <button class="btn-cp" onclick="window.open('${mapsUrl}','_blank')">🗺 ${t('hospDirections')}</button>
        ${phone?`<button class="btn-co" onclick="window.open('tel:${phone.replace(/[^0-9+]/g,'')}')">📞 ${t('hospCall')}</button>`:`<button class="btn-co" onclick="window.open('${mapsUrl}','_blank')">${t('hospViewOnMaps')}</button>`}
      </div>
    </div>
  </div>`;
}

function renderHospitals() {
  const q = (document.getElementById('hospSearch')?.value||'').toLowerCase();
  const spec = (document.getElementById('hospSpecFilter')?.value||'').toUpperCase();
  const scheme = document.getElementById('hospSchemeFilter')?.value||'';
  const dist = activeDistrict;

  // Try Google Maps first if available
  if (gmapsLoaded && userLat && userLng && !dist && !spec) {
    renderHospitalsBanner('loading');
    const query = spec ? `${spec.toLowerCase()} hospital` : 'hospital';
    fetchNearbyPlaces(query, 'hospital', (results) => {
      if (results && results.length > 0) {
        renderHospitalsBanner('gmaps', results.length);
        document.getElementById('hospCards').innerHTML = results.map(h => hospitalCard(h)).join('');
        const mapEl = document.getElementById('hospMap');
        if (mapEl) {
          mapEl.style.display = 'block';
          if (typeof initFacilityMap === 'function') {
            initFacilityMap('hospMap', results);
          }
        }
        return;
      }
      renderFromCsv(q, spec, scheme, dist);
    });
    return;
  }
  renderFromCsv(q, spec, scheme, dist);
}

function renderHospitalsBanner(type, count=0) {
  const el = document.getElementById('hospCount');
  const badge = document.getElementById('dataSourceBadge');
  if(type==='loading') {
    if(el) el.innerHTML = '<span class="spinner" style="border-color:rgba(28,16,8,.2);border-top-color:var(--saffron)"></span> Searching nearby…';
    return;
  }
  if(badge) badge.innerHTML = type==='gmaps'
    ? '<span class="source-badge source-gmaps">🗺 Google Maps Live</span>'
    : '<span class="source-badge source-csv">📋 Karnataka Govt. Database</span>';
}

function renderFromCsv(q, spec, scheme, dist) {
  let list = [...CSV_HOSPITALS];
  if(dist) list = list.filter(h => h.d===dist || h.d.includes(dist) || dist.split(' ')[0]===h.d.split(' ')[0]);
  else if(userDistrict) {
    const myD = list.filter(h=>h.d===userDistrict||h.d.includes(userDistrict));
    const others = list.filter(h=>!(h.d===userDistrict||h.d.includes(userDistrict)));
    list = [...myD, ...others];
  }
  if(q) list = list.filter(h=>h.n.toLowerCase().includes(q)||h.sp.some(s=>s.toLowerCase().includes(q))||h.a.toLowerCase().includes(q));
  if(spec) list = list.filter(h=>h.sp.some(s=>s.toUpperCase().includes(spec)));
  if(scheme) list = list.filter(h=>h.s.some(s=>s.includes(scheme)));

  filteredHospList = list;
  hospDisplayed = 0;
  const total = list.length;
  const shown = list.slice(0, HOSP_PAGE_SIZE);
  hospDisplayed = shown.length;

  const el = document.getElementById('hospCards');
  const cnt = document.getElementById('hospCount');
  if(cnt) cnt.innerHTML = `Showing <strong>${shown.length}</strong> of <strong>${total}</strong> hospitals`;
  renderHospitalsBanner('csv');
  if(el) el.innerHTML = shown.length
    ? shown.map(h => hospitalCard(h, spec)).join('')
    : '<div class="empty-state"><div class="eico">🏥</div><h3>No hospitals found</h3><p>Try different search terms or district</p></div>';

  const mapEl = document.getElementById('hospMap');
  if (mapEl) {
    if (shown.length) {
      mapEl.style.display = 'block';
      if (typeof initFacilityMap === 'function') {
        initFacilityMap('hospMap', shown);
      }
    } else {
      mapEl.style.display = 'none';
    }
  }

  const lmw = document.getElementById('loadMoreWrap');
  if(lmw) lmw.style.display = total > HOSP_PAGE_SIZE ? 'block' : 'none';
  buildDistrictBar();
}

function loadMoreHospitals() {
  const more = filteredHospList.slice(hospDisplayed, hospDisplayed + HOSP_PAGE_SIZE);
  hospDisplayed += more.length;
  document.getElementById('hospCards').innerHTML += more.map(h => hospitalCard(h)).join('');
  if(hospDisplayed >= filteredHospList.length) document.getElementById('loadMoreWrap').style.display='none';
  const cnt = document.getElementById('hospCount');
  if(cnt) cnt.innerHTML = `Showing <strong>${hospDisplayed}</strong> of <strong>${filteredHospList.length}</strong> hospitals`;
}

// ═══════════════════════════════════════════════════
// DIAGNOSTIC CENTRES
// ═══════════════════════════════════════════════════

function fetchNearbyDiagnostics() {
  if (!userLat || !userLng) { alert(t('errEnableLocation')); getLocation(true); return; }
  if (!gmapsLoaded) { renderDiagnostics(); return; }
  const diagEl = document.getElementById('diagCards');
  const countEl = document.getElementById('diagCount');
  if(diagEl) diagEl.innerHTML = `<div class="loading-card"><div class="skel" style="height:18px;width:60%"></div><div class="skel" style="height:14px;width:90%"></div><div class="skel" style="height:14px;width:75%"></div></div>`.repeat(3);

  fetchNearbyPlaces('diagnostic centre pathology laboratory', 'health', results => {
    if(results && results.length) {
      const mapEl = document.getElementById('diagMap');
      if (mapEl) mapEl.style.display = 'block';
      cache.diagnostics = results;
      initFacilityMap('diagMap', results);
      if(countEl) countEl.innerHTML=`<strong>${results.length}</strong> diagnostic centres found nearby`;
      if(document.getElementById('diagSourceBadge')) document.getElementById('diagSourceBadge').innerHTML='<span class="source-badge source-gmaps">🗺 Google Maps Live</span>';
      diagEl.innerHTML = results.map(c => `<div class="hcard">
        <div class="hcard-top">
          <div class="hcard-name">${c.name}</div>
          <div class="hcard-addr">📍 ${c.address}</div>
          <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;">
            ${haversine(userLat,userLng,c.lat,c.lng)<5?`<span class="dist-badge near">📍 ${haversine(userLat,userLng,c.lat,c.lng).toFixed(1)} km</span>`:`<span class="dist-badge med">📍 ${haversine(userLat,userLng,c.lat,c.lng).toFixed(1)} km</span>`}
            ${c.isOpen===true?`<span class="dist-badge near">${t('hospOpen')}</span>`:c.isOpen===false?`<span class="dist-badge far">${t('hospClosed')}</span>`:''}
            <a class="gmaps-link" href="${mapsDirectionsUrl(c.name,c.address,c.lat,c.lng)}" target="_blank">🗺 ${t('hospDirections')}</a>
          </div>
          ${c.rating?`<div class="rating-row"><span class="stars">${'★'.repeat(Math.round(c.rating))}</span><span class="rating-num">${c.rating} (${c.totalRatings})</span></div>`:''}
        </div>
        <div class="hcard-body">
          <div class="hcard-meta"><span class="meta-item tag-pill tp-gmaps">🗺 ${t('hospMaps')}</span></div>
          <div class="hcard-actions">
            <button class="btn-cp" onclick="window.open('${mapsDirectionsUrl(c.name,c.address,c.lat,c.lng)}','_blank')">🗺 ${t('hospDirections')}</button>
            <button class="btn-co" onclick="window.open('https://www.google.com/maps/place/?q=place_id:${c.placeId}','_blank')">${t('navHospitals')}</button>
          </div>
        </div>
      </div>`).join('');
    } else renderDiagnostics();
  });
}

function renderDiagnostics() {
  const q = (document.getElementById('diagSearch')?.value||'').toLowerCase();
  
  // DIAGNOSTICS_DB comes from diagnostics-data.js
  let list = q ? DIAGNOSTICS_DB.filter(c => 
    c.name.toLowerCase().includes(q) || 
    (c.address && c.address.toLowerCase().includes(q)) || 
    (c.notes && c.notes.toLowerCase().includes(q)) ||
    (c.type && c.type.toLowerCase().includes(q))
  ) : DIAGNOSTICS_DB;
  
  const el = document.getElementById('diagCards'); if(!el) return;
  const mapEl = document.getElementById('diagMap');
  const cnt = document.getElementById('diagCount'); 
  
  if(cnt) cnt.innerHTML=`<strong>${list.length}</strong> ${t('diagTitle')} (${t('hospLiveSearch').replace('🔴 ','')})`;
  
  if(mapEl) mapEl.style.display = 'block';

  if(document.getElementById('diagSourceBadge')) {
    document.getElementById('diagSourceBadge').innerHTML=`<span class="source-badge source-csv">📋 ${t('diagNearMe')}</span>`;
  }
  
  el.innerHTML = list.map(c=>`<div class="hcard">
    <div class="hcard-top">
      <div class="hcard-name-row">
        <div class="hcard-name">${c.name}</div>
        <span style="font-size:.62rem;background:var(--forest-light);color:var(--forest);padding:2px 7px;border-radius:100px;font-weight:700;">${c.type}</span>
      </div>
      <div class="hcard-addr">📍 ${c.address}</div>
      <a class="gmaps-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name+' '+c.address)}" target="_blank">🗺 ${t('hospDirections')}</a>
    </div>
    <div class="hcard-body">
      ${c.notes ? `<div style="font-size:0.8rem; color:var(--ink2); margin-bottom:10px;">ℹ️ ${c.notes}</div>` : ''}
      <div class="rating-row">
        ${c.rating ? `<span class="stars">${'★'.repeat(Math.round(c.rating))}</span><span class="rating-num">${c.rating} (${c.reviews} ${t('navHistory').toLowerCase()})</span>` : `<span style="font-size:0.8rem;color:var(--ink3);">${t('hospNoResults')}</span>`}
      </div>
      <div class="hcard-meta">
        <span class="meta-item">🕐 ${c.status}</span>
        <span class="meta-item">📞 ${c.phone !== 'Unknown' ? c.phone : t('hospNoResults')}</span>
      </div>
      <div class="hcard-actions">
        <button class="btn-cp" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name+' '+c.address)}','_blank')">🗺 ${t('hospDirections')}</button>
        ${c.phone !== 'Unknown' ? `<button class="btn-co" onclick="window.open('tel:${c.phone}')">📞 ${t('hospCall')}</button>` : ''}
      </div>
    </div>
  </div>`).join('');
  
  if(typeof initFacilityMap === 'function') {
    initFacilityMap('diagMap', list);
  }
}

// ═══════════════════════════════════════════════════
// BLOOD BANK — No fake units, show "Call to confirm"
// ═══════════════════════════════════════════════════
// BLOOD_BANKS_DB is loaded from /js/bloodbanks-data.js


function selBlood(el, g) {
  document.querySelectorAll('.bg-btn').forEach(b=>b.classList.remove('sel')); el.classList.add('sel');

  // Try Google Maps for blood banks if available
  if(gmapsLoaded && userLat && userLng) {
    fetchNearbyPlaces('blood bank', 'health', results => {
      const banksToShow = results && results.length ? results : BLOOD_BANKS_DB;
      cache.bloodBanks = banksToShow;
      const mapEl = document.getElementById('bloodMap');
      if (mapEl) mapEl.style.display = 'block';
      initFacilityMap('bloodMap', banksToShow);
      renderBloodCards(banksToShow, g, !!results);
    });
    return;
  }

  let banks = [...BLOOD_BANKS_DB];
  if(userLat&&userLng) banks.sort((a,b)=>haversine(userLat,userLng,a.lat,a.lng)-haversine(userLat,userLng,b.lat,b.lng));
  
  const mapEl = document.getElementById('bloodMap');
  if (mapEl) mapEl.style.display = 'block';
  initFacilityMap('bloodMap', banks);
  renderBloodCards(banks, g, false);
}

function renderBloodCards(banks, g, fromMaps) {
  const el = document.getElementById('bloodResults');
  if(!el) return;
  el.innerHTML = `<div class="cards-grid">${banks.slice(0,8).map(b => {
    const dist = (userLat&&userLng&&b.lat&&b.lng) ? haversine(userLat,userLng,b.lat,b.lng) : null;
    const distStr = dist ? `${dist.toFixed(1)} km ${t('diagNearMe').replace('📍 ','')}` : '';
    const mUrl = mapsDirectionsUrl(b.name||b.n, b.address||b.vicinity||'', b.lat, b.lng);
    const phone = b.phone || b.formatted_phone_number || '';
    return `<div class="hcard">
      <div class="hcard-top">
        <div class="hcard-name">${b.name}</div>
        <div class="hcard-addr">📍 ${b.address||b.vicinity||''}</div>
        <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;">
          ${distStr?`<span class="dist-badge ${distBadgeClass(dist)}">📍 ${distStr}</span>`:''}
          <a class="gmaps-link" href="${mUrl}" target="_blank">🗺 ${t('hospDirections')}</a>
        </div>
        ${b.rating?`<div class="rating-row"><span class="stars">${'★'.repeat(Math.round(b.rating))}</span><span class="rating-num">${b.rating}</span></div>`:''}
      </div>
      <div class="hcard-body">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;background:var(--red-soft);border-radius:10px;padding:10px 14px;">
          <div style="width:46px;height:46px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.92rem;flex-shrink:0;">${g}</div>
          <div>
            <div style="font-size:.82rem;font-weight:700;color:var(--red);">${t('authBlood')}</div>
            <div style="font-size:.72rem;color:var(--ink2);margin-top:3px;">📞 <strong>${t('bloodCallConfirm')}</strong></div>
          </div>
        </div>
        ${b.timings||b.status?`<div class="hcard-meta"><span class="meta-item">🕐 ${b.timings||b.status}</span>${phone?`<span class="meta-item">📞 ${phone}</span>`:''}</div>`:''}
        <div class="hcard-actions">
          ${phone?`<button class="btn-cp" onclick="window.open('tel:${phone.replace(/[^0-9+]/g,'')}')">📞 ${t('bloodCallBank')}</button>`:`<button class="btn-cp" onclick="window.open('tel:1910')">📞 ${t('bloodHelpline')}</button>`}
          <button class="btn-co" onclick="window.open('${mUrl}','_blank')">🗺 ${t('hospDirections')}</button>
        </div>
      </div>
    </div>`;
  }).join('')}</div>
  <div style="background:var(--amber-soft);border-radius:var(--r-sm);padding:12px 16px;margin-top:14px;font-size:.76rem;color:var(--amber);">
    ⚠️ ${t('bloodWarning')}<br/>
    🆘 ${t('bloodHelpline')}: <strong>1910</strong> (Free, 24×7)
  </div>`;
}

// ═══════════════════════════════════════════════════
// SYMPTOM CHECKER — SCORING SYSTEM
// ═══════════════════════════════════════════════════
const SYMPTOM_DB = {
  'fever':         {conditions:['Viral Fever','Malaria','Dengue','Typhoid','COVID-19'],specs:[{name:'General Physician',icon:'👨‍⚕️',desc:'First contact for fever, infections',csvSpec:'GENERAL MEDICINE'},{name:'Infectious Disease Specialist',icon:'🦠',desc:'Tropical diseases — Malaria, Dengue',csvSpec:''}]},
  'headache':      {conditions:['Migraine','Tension Headache','Hypertension','Sinusitis'],specs:[{name:'Neurologist',icon:'🧠',desc:'Brain & nervous system',csvSpec:'NEUROSURGERY'},{name:'General Physician',icon:'👨‍⚕️',desc:'Common headaches, BP-related',csvSpec:'GENERAL MEDICINE'}]},
  'chest pain':    {conditions:['Angina','GERD','Costochondritis','Pericarditis'],specs:[{name:'Cardiologist',icon:'❤️',desc:'Heart conditions — angina, palpitations',csvSpec:'CARDIOLOGY'},{name:'Gastroenterologist',icon:'🫄',desc:'GERD / acid reflux',csvSpec:''}]},
  'cough':         {conditions:['Common Cold','Bronchitis','Asthma','Tuberculosis'],specs:[{name:'Pulmonologist',icon:'🫁',desc:'Lungs — asthma, bronchitis, TB',csvSpec:'PULMONOL'},{name:'General Physician',icon:'👨‍⚕️',desc:'Common cold, mild cough',csvSpec:'GENERAL MEDICINE'}]},
  'breathlessness':{conditions:['Asthma','COPD','Heart Failure','Anemia'],specs:[{name:'Pulmonologist',icon:'🫁',desc:'Respiratory disorders',csvSpec:'PULMONOL'},{name:'Cardiologist',icon:'❤️',desc:'Cardiac causes',csvSpec:'CARDIOLOGY'}]},
  'stomach pain':  {conditions:['Gastritis','Appendicitis','IBS','Peptic Ulcer'],specs:[{name:'Gastroenterologist',icon:'🫄',desc:'Stomach, intestine, liver',csvSpec:'GASTRO'},{name:'General Surgeon',icon:'🔪',desc:'Appendicitis, hernia',csvSpec:'GENERAL SURGERY'}]},
  'joint pain':    {conditions:['Osteoarthritis','Rheumatoid Arthritis','Gout'],specs:[{name:'Orthopedist',icon:'🦴',desc:'Bones, joints, muscles',csvSpec:'ORTHOPAEDICS'},{name:'Rheumatologist',icon:'🤲',desc:'Autoimmune joint diseases',csvSpec:''}]},
  'back pain':     {conditions:['Muscle Strain','Disc Herniation','Spondylitis','Kidney Stone'],specs:[{name:'Orthopedist',icon:'🦴',desc:'Spine, disc problems',csvSpec:'ORTHOPAEDICS'},{name:'Nephrologist',icon:'🫘',desc:'Kidney stone flank pain',csvSpec:'NEPHROLOGY'}]},
  'fatigue':       {conditions:['Anemia','Thyroid Disorder','Diabetes','Depression'],specs:[{name:'General Physician',icon:'👨‍⚕️',desc:'Initial evaluation',csvSpec:'GENERAL MEDICINE'},{name:'Endocrinologist',icon:'⚗️',desc:'Thyroid, diabetes',csvSpec:''}]},
  'skin rash':     {conditions:['Allergy','Eczema','Psoriasis','Chickenpox'],specs:[{name:'Dermatologist',icon:'🧴',desc:'Skin diseases',csvSpec:'DERMATOL'},{name:'Allergist',icon:'🌸',desc:'Allergy-related reactions',csvSpec:''}]},
  'eye problem':   {conditions:['Conjunctivitis','Cataract','Glaucoma','Refractive Error'],specs:[{name:'Ophthalmologist',icon:'👁️',desc:'Eye specialist',csvSpec:'OPHTHALMOLOGY'}]},
  'frequent urination':{conditions:['Diabetes','UTI','Prostate Issues'],specs:[{name:'Urologist',icon:'🫧',desc:'Urinary tract, prostate',csvSpec:'UROLOGY'},{name:'Diabetologist',icon:'💉',desc:'Diabetes-related',csvSpec:''}]},
};

const ALL_SYMPTOMS = ['Fever','Headache','Chest Pain','Cough','Breathlessness','Stomach Pain','Joint Pain','Back Pain','Fatigue','Skin Rash','Eye Problem','Frequent Urination','Nausea','Vomiting','Diarrhoea','Dizziness','Swelling','Weight Loss','Night Sweats','Muscle Pain'];

function showSymSuggestions(val) {
  const ac = document.getElementById('symAutoComplete');
  if(!val || val.length < 2) { ac.style.display='none'; return; }
  const matches = ALL_SYMPTOMS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !symptoms.includes(s)).slice(0,5);
  if(!matches.length) { ac.style.display='none'; return; }
  ac.style.display='block';
  ac.innerHTML = matches.map(s=>`<div onclick="addSym('${s}');document.getElementById('syminput').value='';document.getElementById('symAutoComplete').style.display='none'" style="padding:8px 14px;cursor:pointer;font-size:.83rem;border-bottom:1px solid var(--border)" onmouseover="this.style.background='var(--saffron-light)'" onmouseout="this.style.background=''">${s}</div>`).join('');
}

function updateScoreLabel(sliderId, valId, labels) {
  const val = parseInt(document.getElementById(sliderId).value);
  document.getElementById(valId).textContent = labels[val-1];
}

function symKey(e) {
  if(e.key==='Enter'||e.key===',') { e.preventDefault(); const v=e.target.value.trim(); if(v) addSym(v); e.target.value=''; document.getElementById('symAutoComplete').style.display='none'; }
}
function addSym(s) { if(!symptoms.includes(s)) { symptoms.push(s); renderTags(); } }
function renderTags() {
  const w=document.getElementById('tagWrap'), inp=document.getElementById('syminput');
  w.innerHTML='';
  symptoms.forEach((s,i)=>{const sp=document.createElement('span');sp.className='stag';sp.innerHTML=`${s} <button onclick="removeSym(${i})">×</button>`;w.appendChild(sp);});
  w.appendChild(inp);
}
function removeSym(i) { symptoms.splice(i,1); renderTags(); }
function clearSymptoms() { symptoms=[]; renderTags(); document.getElementById('symResult').style.display='none'; }

function calcScore() {
  const dur = parseInt(document.getElementById('dur').value);
  const pain = parseInt(document.getElementById('pain').value);
  const freq = parseInt(document.getElementById('freq').value);
  const impact = parseInt(document.getElementById('impact').value);
  // Weighted: pain 35%, impact 30%, duration 20%, frequency 15%
  const raw = (pain*35 + impact*30 + dur*20 + freq*15) / 5;
  return { total: Math.round(raw), dur, pain, freq, impact };
}

function analyzeSymptoms() {
  if(!symptoms.length) { alert(t('errEnterSymptom')); return; }
  const condSet=new Set(), specMap=new Map();
  symptoms.forEach(s=>{
    const k=s.toLowerCase();
    Object.keys(SYMPTOM_DB).forEach(key=>{
      if(key.includes(k)||k.includes(key)){
        SYMPTOM_DB[key].conditions.forEach(c=>condSet.add(c));
        SYMPTOM_DB[key].specs.forEach(sp=>{if(!specMap.has(sp.name))specMap.set(sp.name,sp);});
      }
    });
  });
  const conditions = [...condSet].slice(0,5);
  const specList = [...specMap.values()].slice(0,4);
  if(!conditions.length) { conditions.push(t('symNoMatch')); specList.push({name:'General Physician',icon:'👨‍⚕️',desc:t('symFirstContact'),csvSpec:'GENERAL MEDICINE'}); }

  // 1. Deterministic/Basic UI Rendering
  renderSymptomResults(conditions, specList, calcScore());

  // 2. Advanced AI Analysis (with Patient Context)
  const token = localStorage.getItem('ayusutra_token');
  const lang = typeof getLang === 'function' ? getLang() : 'en';
  
  const aiBox = document.getElementById('aiAnalysisContent') || document.createElement('div');
  aiBox.id = 'aiAnalysisContent';
  aiBox.innerHTML = `<div class="thinking">${t('symAiAnalyzing')}</div>`;
  document.getElementById('symResult').querySelector('.result-block:nth-last-child(2)').after(aiBox);

  const currentSymptoms = Array.from(document.querySelectorAll('#tagWrap .stag')).map(t => t.firstChild.textContent.trim());
  if (!currentSymptoms.length) { alert(t('errEnterSymptom')); return; }

  fetch(`${window.API_BASE}/symptoms/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
    body: JSON.stringify({
      symptoms: currentSymptoms,
      scoringFactors: calcScore(),
      location: { lat: userLat, lng: userLng },
      lang
    })
  }).then(r => {
    if(!r.ok) throw new Error('API error');
    return r.json();
  }).then(data => {
    aiBox.innerHTML = `<h4>🤖 Advanced AI Analysis</h4><div class="ai-resp">${data.aiAnalysis.replace(/\n/g,'<br/>')}</div>`;
    localStorage.setItem('ayusutra_last_sym_date', new Date().toLocaleDateString());
  }).catch(e => {
    console.error('AI Analysis failed:', e);
    aiBox.innerHTML = `<h4>🤖 AI Analysis</h4><div class="ai-resp">The AI engine is temporarily busy. Please wait 10 seconds and try again. <br/><br/><small>Status: Network/Timeout</small></div>`;
  });
}


function renderSymptomResults(conditions, specList, score) {
  const severity = score.total >= 65 ? 'severe' : score.total >= 35 ? 'moderate' : 'mild';
  const sevText = {mild:'Low urgency — monitor at home',moderate:'Moderate — visit a doctor soon',severe:'⚠️ High urgency — seek care immediately'};
  const sevCls = {mild:'sev-mild',moderate:'sev-moderate',severe:'sev-severe'};

  const pill = document.getElementById('sevPill');
  pill.textContent = `${severity.toUpperCase()} — ${sevText[severity]}`;
  pill.className = 'sev-pill ' + sevCls[severity];

  // Score bars
  const factors = {dur: score.dur, pain: score.pain, freq: score.freq, impact: score.impact};
  Object.entries(factors).forEach(([k,v])=>{
    const pct = (v/5)*100;
    const el = document.getElementById('sb-'+k); if(el) {el.style.width=pct+'%'; el.style.background=pct>=80?'var(--red)':pct>=50?'var(--amber)':'var(--saffron)';}
    const sv = document.getElementById('sv-'+k); if(sv) sv.textContent=v+'/5';
  });
  document.getElementById('totalScoreNum').textContent = score.total;
  const reasons = [];
  if(score.pain>=4) reasons.push('high pain level');
  if(score.impact>=4) reasons.push('significant daily impact');
  if(score.dur>=4) reasons.push('prolonged duration');
  if(symptoms.length>=3) reasons.push('multiple symptoms');
  document.getElementById('scoreReason').textContent = reasons.length ? `Elevated due to: ${reasons.join(', ')}` : 'Mild presentation based on your inputs';

  document.getElementById('rConditions').innerHTML = conditions.map(c=>`<span class="r-chip cond">${c}</span>`).join('');
  document.getElementById('specMapList').innerHTML = specList.map(sp=>`<div class="spec-row"><div class="spec-row-icon">${sp.icon}</div><div><div class="spec-row-name">${sp.name}</div><div class="spec-row-desc">${sp.desc}</div></div></div>`).join('');

  // Find matching hospitals from CSV
  const csvKeyword = specList[0]?.csvSpec || '';
  let nearHosp = csvKeyword ? CSV_HOSPITALS.filter(h=>h.sp.some(s=>s.toUpperCase().includes(csvKeyword))) : CSV_HOSPITALS;
  if(userDistrict||activeDistrict) {
    const d=activeDistrict||userDistrict;
    nearHosp=[...nearHosp.filter(h=>h.d===d||h.d.includes(d)),...nearHosp.filter(h=>!(h.d===d||h.d.includes(d)))];
  }
  document.getElementById('symHospitals').innerHTML = nearHosp.slice(0,3).map(h=>hospitalCard(h,csvKeyword)).join('') || '<p style="color:var(--ink2);font-size:.83rem;">No matching hospitals found. Use the Hospitals tab to search manually.</p>';
  document.getElementById('symResult').style.display='block';
  setTimeout(()=>document.getElementById('symResult').scrollIntoView({behavior:'smooth'}),100);
}

// ═══════════════════════════════════════════════════
// PATIENT HISTORY + FILE UPLOAD
// ═══════════════════════════════════════════════════
function handleFileDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if(file) processUploadedFile(file);
}
function handleFileUpload(input) {
  const file = input.files[0]; if(!file) return;
  processUploadedFile(file);
}
function processUploadedFile(file) {
  pendingFile = file;
  document.getElementById('attachName').textContent = file.name;
  document.getElementById('addRecBox').style.display = 'block';
  // Pre-fill type based on file name
  const name = file.name.toLowerCase();
  if(name.includes('report')||name.includes('lab')||name.includes('test')) document.getElementById('rType').value='report';
  else if(name.includes('prescription')||name.includes('rx')) document.getElementById('rType').value='prescription';
}

function toggleAddRec() {
  const b = document.getElementById('addRecBox');
  b.style.display = b.style.display==='block' ? 'none' : 'block';
}

async function fetchRecords() {
  const token = localStorage.getItem('ayusutra_token');
  if(!token) return;
  try {
    const res = await fetch(`${window.API_BASE}/patients/history`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) { 
      const data = await res.json(); 
      records = data.history || [];
      console.log('Fetched records:', records);
      renderHistory(); 
    } else {
      console.error('Failed to fetch records, status:', res.status);
    }
  } catch(e) { console.error('fetchRecords error:', e); }
}

async function saveRec() {
  const type=document.getElementById('rType').value, date=document.getElementById('rDate').value,
        doc=document.getElementById('rDoctor').value, hosp=document.getElementById('rHosp').value, notes=document.getElementById('rNotes').value;
  if(!date||!doc||!notes) { alert(t('errFillFields')); return; }
  
  const token = localStorage.getItem('ayusutra_token');
  try {
    const res = await fetch(`${window.API_BASE}/patients/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ type, doctorName: doc, hospital: hosp, notes, date: new Date(date).toISOString() })
    });
    if(res.ok) {
      document.getElementById('rDoctor').value=''; document.getElementById('rHosp').value=''; document.getElementById('rNotes').value='';
      fetchRecords(); toggleAddRec();
    } else { alert(t('errSaveRecord')); }
  } catch(e) { alert(t('errNetwork')); }
}

async function delRec(idx) { 
  if(!confirm('Delete this record?')) return;
  const id = records[idx].id;
  const token = localStorage.getItem('ayusutra_token');
  try {
    const res = await fetch(`${window.API_BASE}/patients/history/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.ok) fetchRecords();
  } catch(e) {}
}

async function getAiSummary(idx) {
  const r = records[idx];
  const btn = document.getElementById(`sumBtn${idx}`);
  const box = document.getElementById(`sumBox${idx}`);
  if(r.aiSummary) { box.style.display=box.style.display==='none'?'block':'none'; return; }
  if(btn) { btn.disabled=true; btn.textContent=t('chatSummarizing'); }
  try {
    const API = window.API_BASE || 'http://localhost:5000/api';
    const res = await fetch(`${API}/chatbot`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        message: `Summarize this medical record in 3-4 clear bullet points:\nType: ${r.type}\nDoctor: ${r.doctorName}\nHospital: ${r.hospital}\nDate: ${new Date(r.date).toLocaleDateString()}\nNotes: ${r.notes}`,
        lang: typeof getLang === 'function' ? getLang() : 'en'
      })
    });
    const data = await res.json();
    r.aiSummary = data.reply || data.content?.[0]?.text || 'Unable to summarize.';
  } catch { r.aiSummary = 'Summary unavailable — check your connection.'; }
  if(box) { box.innerHTML=r.aiSummary.replace(/\n/g,'<br/>'); box.style.display='block'; }
  if(btn) { btn.disabled=false; btn.textContent='🤖 AI Summary'; }
}

async function sendChat() {
  const input = document.getElementById('chatIn');
  const msg = input.value.trim();
  if(!msg && !chatFile) return;

  const chatMsgs = document.getElementById('chatMsgs');
  const userDiv = document.createElement('div');
  userDiv.className = 'cmsg user';
  userDiv.textContent = msg || (chatFile ? 'Analyzing uploaded document...' : '');
  chatMsgs.appendChild(userDiv);
  input.value = '';
  chatMsgs.scrollTop = chatMsgs.scrollHeight;

  const thinkingDiv = document.createElement('div');
  thinkingDiv.className = 'cmsg bot thinking';
  thinkingDiv.textContent = t('chatThinking');
  chatMsgs.appendChild(thinkingDiv);

  const token = localStorage.getItem('ayusutra_token');
  try {
    const res = await fetch(`${window.API_BASE}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ 
        message: msg, 
        lang: typeof getLang === 'function' ? getLang() : 'en' 
      })
    });
    const data = await res.json();
    chatMsgs.removeChild(thinkingDiv);
    const botDiv = document.createElement('div');
    botDiv.className = 'cmsg bot';
    botDiv.innerHTML = data.reply.replace(/\n/g, '<br/>');
    chatMsgs.appendChild(botDiv);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  } catch(e) {
    thinkingDiv.textContent = t('errGeneral');
    thinkingDiv.classList.remove('thinking');
  }
}

function renderHistory() {
  const tl = document.getElementById('histTimeline'); if(!tl) return;
  if(!records.length) { tl.innerHTML='<div class="empty-state"><div class="eico">📋</div><h3>No records yet</h3><p>Upload a file or add a record above.</p></div>'; return; }
  tl.innerHTML = records.map((r,i) => `
    <div class="tl-item"><div class="tl-dot"></div><div class="tl-card">
      <span class="tl-badge tp-${r.type}">${r.type}</span>
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:3px;">
        <strong style="font-size:.88rem;">${r.doctorName || 'Unknown Doctor'}</strong>
        <span style="font-size:.7rem;color:var(--ink2);white-space:nowrap;">${new Date(r.date).toLocaleDateString()}</span>
      </div>
      <div style="font-size:.72rem;color:var(--ink2);margin-bottom:5px;">🏥 ${r.hospital || 'Unknown Hospital'}</div>
      <p style="font-size:.82rem;line-height:1.5;">${r.notes}</p>
      ${r.file?`<div style="font-size:.7rem;color:var(--blue);margin-top:5px;">📎 ${r.file}</div>`:''}
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
        <button class="ai-summary-btn" id="sumBtn${i}" onclick="getAiSummary(${i})">🤖 AI Summary</button>
        <button onclick="delRec(${i})" style="background:none;border:none;color:var(--red);font-size:.7rem;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;">🗑 Delete</button>
      </div>
      <div class="ai-summary-box" id="sumBox${i}">${r.aiSummary||''}</div>
    </div></div>`).join('');
}

// ═══════════════════════════════════════════════════
// CHATBOT — Mic + Camera + File Upload
// ═══════════════════════════════════════════════════
const CHAT_RULES = [
  {m:/meaning|name|ayu|sanskrit/i, r:'🌿 <strong>Ayu</strong> (आयु) means <strong>lifespan</strong> in Sanskrit. AyuSutra is the "thread of lifespan" — guiding you to protect and extend your health through accessible, accurate healthcare.'},
  {m:/hospital|clinic/i, r:'Use the 🏥 Hospitals tab to find hospitals in your district, sorted by distance. Filter by speciality (Cardiology, Neurology, etc.) and government schemes (Ayushman Bharat).'},
  {m:/blood/i, r:'For blood banks, use the 🩸 Blood Bank tab — pick your blood group. <strong>Always call ahead to confirm availability</strong>. Emergency: call <strong>1910</strong> (National Blood Helpline, free, 24×7).'},
  {m:/ambulance|emergency|urgent/i, r:'🚨 Emergency numbers in India:\n• <strong>112</strong> — Unified Emergency (police/fire/ambulance)\n• <strong>102</strong> — Free Government Ambulance\n• <strong>1298</strong> — Ziqitza Advanced Ambulance\n• <strong>108</strong> — EMRI Ambulance'},
  {m:/fever/i, r:'For fever: rest, stay hydrated, Paracetamol as directed. See a doctor if fever is >103°F, lasts >3 days, or is accompanied by severe headache, rash, or breathing difficulty. ⚠️ I cannot diagnose — please consult a doctor.'},
  {m:/ayushman|pmjay|scheme|insurance/i, r:'Many hospitals in AyuSutra accept Ayushman Bharat/PMJAY. Filter the Hospitals tab by scheme. Carry your Aadhaar card for verification at the hospital.'},
  {m:/specialist|which doctor|see a doctor/i, r:'Use the Symptom Checker (🩺 tab) for a personalized specialist recommendation. It uses a scoring system based on your pain level, duration, frequency, and daily impact.'},
  {m:/diagnos|what disease|what do i have/i, r:'⚠️ I cannot provide medical diagnosis. I can help you understand symptoms and find the right specialist — but only a licensed doctor can diagnose you after a proper examination.'},
];

const chatHist = []; let msgId=0;
function appendMsg(role, text, isLoad=false) {
  const id='m'+(++msgId), div=document.createElement('div');
  div.className=`cmsg ${role}${isLoad?' thinking':''}`;div.id=id;
  div.innerHTML=text.replace(/\n/g,'<br/>');
  document.getElementById('chatMsgs').appendChild(div);
  div.scrollIntoView({behavior:'smooth'}); return id;
}

async function sendChat() {
  const inp = document.getElementById('chatIn');
  const msg = inp.value.trim(); if(!msg && !chatFile) return;
  inp.value='';
  let displayMsg = msg;
  if(chatFile) displayMsg = `📎 ${chatFile.name}${msg?' — '+msg:''}`;
  appendMsg('user', displayMsg);
  document.getElementById('filePreview').classList.remove('show');

  // Check local rules first
  const rule = CHAT_RULES.find(r=>r.m.test(msg));
  if(rule && !chatFile) { setTimeout(()=>{ const id = appendMsg('bot',rule.r); addTTSButton(id, rule.r); },350); return; }

  const tid = appendMsg('bot','…',true);
  try {
    const API = window.API_BASE || 'http://localhost:5000/api';
    const res = await fetch(`${API}/chatbot`, {
      method:'POST', 
      headers:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ayusutra_token')}`
      },
      body:JSON.stringify({
        message: msg || 'Please analyze and summarize this medical document.',
        lang: typeof getLang === 'function' ? getLang() : 'en'
      })
    });
    const data = await res.json();
    const reply = data.reply || 'Please consult a doctor for medical advice.';
    document.getElementById(tid)?.remove();
    const newId = appendMsg('bot', reply);
    addTTSButton(newId, reply);
    chatFile = null;
    // Keep history manageable
    if(chatHist.length > 20) chatHist.splice(0, 2);
  } catch {
    document.getElementById(tid)?.remove();
    appendMsg('bot','Connectivity issue. For urgent medical needs, please call a hospital or 112 directly.');
  }
}

// ═══════════════════════════════════════════════════
// TTS — Read AI responses aloud
// ═══════════════════════════════════════════════════
let currentTTS = null;
function addTTSButton(msgId, text) {
  const el = document.getElementById(msgId);
  if(!el || !window.speechSynthesis) return;
  const btn = document.createElement('button');
  btn.className = 'tts-btn';
  btn.innerHTML = '🔊 Listen';
  btn.onclick = () => toggleTTS(btn, text);
  el.appendChild(btn);
}
function toggleTTS(btn, text) {
  if(currentTTS && speechSynthesis.speaking) {
    speechSynthesis.cancel();
    currentTTS = null;
    btn.innerHTML = '🔊 Listen';
    return;
  }
  // Clean HTML tags from text
  const clean = text.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ');
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = typeof getTTSLang === 'function' ? getTTSLang() : 'en-IN';
  utter.rate = 0.9;
  utter.onend = () => { btn.innerHTML = '🔊 Listen'; currentTTS = null; };
  btn.innerHTML = '🔇 Stop';
  currentTTS = utter;
  speechSynthesis.speak(utter);
}

function fileToBase64(file) {
  return new Promise((res,rej) => {
    const r = new FileReader();
    r.onload=()=>res(r.result.split(',')[1]);
    r.onerror=()=>rej(new Error('Read failed'));
    r.readAsDataURL(file);
  });
}

function handleChatFile(input) {
  const file = input.files[0]; if(!file) return;
  chatFile = file;
  document.getElementById('filePreviewName').textContent = `📎 ${file.name}`;
  document.getElementById('filePreview').classList.add('show');
  input.value='';
}
function clearChatFile() {
  chatFile=null;
  document.getElementById('filePreview').classList.remove('show');
}

// Voice Input
function toggleVoice() {
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert(t('errVoiceNotSupported'));
    return;
  }
  if(isRecording) {
    recognition?.stop(); isRecording=false;
    document.getElementById('micBtn').classList.remove('recording');
    document.getElementById('voiceStatus').style.display='none';
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = typeof getSpeechLang === 'function' ? getSpeechLang() : 'en-IN'; recognition.continuous=false; recognition.interimResults=false;
  recognition.onresult = e => {
    const txt = e.results[0][0].transcript;
    document.getElementById('chatIn').value = txt;
    isRecording=false;
    document.getElementById('micBtn').classList.remove('recording');
    document.getElementById('voiceStatus').style.display='none';
  };
  recognition.onerror = () => {
    isRecording=false;
    document.getElementById('micBtn').classList.remove('recording');
    document.getElementById('voiceStatus').style.display='none';
  };
  recognition.onend = () => {
    isRecording=false;
    document.getElementById('micBtn').classList.remove('recording');
    document.getElementById('voiceStatus').style.display='none';
  };
  recognition.start();
  isRecording=true;
  document.getElementById('micBtn').classList.add('recording');
  document.getElementById('voiceStatus').style.display='block';
}

// Camera
async function openCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    document.getElementById('cameraVideo').srcObject = cameraStream;
    const m = document.getElementById('cameraModal'); m.style.display='flex';
  } catch(e) { alert(t('errCameraDenied')); }
}
function capturePhoto() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');
  canvas.width=video.videoWidth; canvas.height=video.videoHeight;
  canvas.getContext('2d').drawImage(video,0,0);
  canvas.toBlob(blob => {
    const file = new File([blob],'camera_capture.jpg',{type:'image/jpeg'});
    chatFile=file;
    document.getElementById('filePreviewName').textContent='📷 camera_capture.jpg';
    document.getElementById('filePreview').classList.add('show');
    closeCamera();
  },'image/jpeg',0.9);
}
function closeCamera() {
  cameraStream?.getTracks().forEach(t=>t.stop());
  cameraStream=null;
  document.getElementById('cameraModal').style.display='none';
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
document.getElementById('rDate').valueAsDate = new Date();
buildDistrictBar();
// Initialize score labels
updateScoreLabel('dur','durVal',['<1 day','1–3 days','4–7 days','1–2 weeks','>2 weeks']);
updateScoreLabel('pain','painVal',['Minimal','Mild','Moderate','Severe','Unbearable']);
updateScoreLabel('freq','freqVal',['Rare','Occasional','Daily','Very frequent','Constant']);
updateScoreLabel('impact','impactVal',['None','Mild','Moderate','Significant','Cannot function']);

// Initialize i18n if available
try {
  if(typeof initLanguage === 'function') initLanguage();
} catch(e) {
  console.warn('Language init failed - continuing...', e);
}

// ═══════════════════════════════════════════════════
// PROFILE DROPDOWN
// ═══════════════════════════════════════════════════
function toggleProfileDropdown() {
  const dd = document.getElementById('profileDropdown');
  const toggle = document.getElementById('profileToggle');
  const isOpen = dd.classList.contains('open');
  if (isOpen) {
    closeProfileDropdown();
  } else {
    dd.classList.add('open');
    toggle.classList.add('open');
  }
}
function closeProfileDropdown() {
  const dd = document.getElementById('profileDropdown');
  const toggle = document.getElementById('profileToggle');
  if (dd) dd.classList.remove('open');
  if (toggle) toggle.classList.remove('open');
}
// Close dropdown on click outside or Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProfileDropdown();
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.profile-dropdown-wrapper')) {
    closeProfileDropdown();
  }
});

// ═══════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span>${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Override alert() with toast for non-blocking UX
const _originalAlert = window.alert;
window.alert = function(msg) {
  if (msg && typeof msg === 'string') {
    const isErr = msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('invalid');
    const isOk = msg.toLowerCase().includes('success') || msg.toLowerCase().includes('updated') || msg.toLowerCase().includes('saved');
    showToast(msg, isErr ? 'error' : isOk ? 'success' : 'info');
  } else {
    _originalAlert(msg);
  }
};

// ═══════════════════════════════════════════════════
// BUTTON RIPPLE EFFECTS
// ═══════════════════════════════════════════════════
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn-fire, .btn-outline, .btn-loc, .auth-btn, .btn-cp');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});
