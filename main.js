// Declaring the variables here: 
// starting with the global controls
const btnLoadAll = document.getElementById('btn-load-all');
const btnCancelAll = document.getElementById('btn-cancel-all');
const chkSlow = document.getElementById('chk-slow');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');

// All the card  variables

const usersCard = document.getElementById('users-card');
const photosCard = document.getElementById('photos-card');
const weatherCard = document.getElementById('weather-card');
const adviceCard = document.getElementById('advice-card');

//All the section statuses

const usersStatus = document.getElementById('users-status');
const photosStatus = document.getElementById('photos-status');
const weatherStatus = document.getElementById('weather-status');
const adviceStatus = document.getElementById('advice-status');

// All the body Sections

const usersBody = document.getElementById('users-body');
const photosBody = document.getElementById('photos-body');
const weatherBody = document.getElementById('weather-body');
const adviceBody = document.getElementById('advice-body');


// Users Buttons

const userLoad = document.getElementById('users-load');
const userCancel = document.getElementById('users-cancel');

// Photos Buttons
const photosLoad = document.getElementById('photos-load');
const photosCancel = document.getElementById('photos-cancel');

// Weather Buttons
const weatherLoad = document.getElementById('weather-load');
const weatherCancel = document.getElementById('weather-cancel');

// Advice buttons
const adviceLoad = document.getElementById('advice-load');
const adviceCancel = document.getElementById('advice-cancel');

// Initilizing the timer for the everything
const sleep = (ms) => new Promise(r => setTimeout(r, ms));


// --- UI helpers ---
// Toggle a card's "loading" state (we'll style .loading later)

function setLoading(cardEl, on) {
  cardEl.classList.toggle('loading', !!on);
}

// Update the little status text in a card header
function setStatus(statusEl, text) {
  statusEl.textContent = text;
}

// Onclick Handler- when the user clicks on the buttons we will handle the setloading and setstatus functions

btnLoadAll.onclick = function () {
  const slow = chkSlow.checked
  const lat = parseFloat(latInput.value);       // number (can be 0)
  const lng = parseFloat(lngInput.value); 
  console.log({ slow, lat, lng });

  setLoading(usersCard, true);
  setStatus(usersStatus, 'loading…');
  usersBody.textContent = 'Loading…';

  setLoading(photosCard, true);
  setStatus(photosStatus, 'loading…');
  photosBody.textContent = 'Loading…';

  setLoading(weatherCard, true);
  setStatus(weatherStatus, 'loading…');
  weatherBody.textContent = 'Loading…';

  setLoading(adviceCard, true);
  setStatus(adviceStatus, 'loading…');
  adviceBody.textContent = 'Loading…';
  
  
}

// onClick button for the cancel the API load
btnCancelAll.onclick = function () {
  setLoading(usersCard, false);
  setStatus(usersStatus, 'idle');
  usersBody.textContent = 'Canceled';

  setLoading(photosCard, false);
  setStatus(photosStatus, 'idle');
  photosBody.textContent = 'Canceled';

  setLoading(weatherCard, false);
  setStatus(weatherStatus, 'idle');
  weatherBody.textContent = 'Canceled';

  setLoading(adviceCard, false);
  setStatus(adviceStatus, 'idle');
  adviceBody.textContent = 'Canceled';
}

// User card onclick function - seperate function
userLoad.onclick = async function(){
  setLoading(usersCard, true);
  setStatus(usersStatus, 'loading…');
  usersBody.textContent = 'Loading…';  

  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!res.ok) { 
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (chkSlow.checked) await sleep(700); 
    const names = data.slice(0, 5).map(u => u.name).join('\n');

    usersBody.textContent = names;

    setStatus(usersStatus, 'ok');
  } catch (err) {
    setStatus(usersStatus, 'error');
    usersBody.textContent = `Error: ${err.message || err}`;
  } finally {
    setLoading(usersCard, false);
  }
};


//Usercancel Button
userCancel.onclick = function () {
  setLoading(usersCard, false);
  setStatus(usersStatus, 'idle');
  usersBody.textContent = 'Canceled.';
};

//Building the buttons for the photos API
photosLoad.onclick = async function(){
  setLoading(photosCard, true);
  setStatus(photosStatus, 'loading…');
  photosBody.textContent = 'Loading…';  

  try {
    const res = await fetch('https://picsum.photos/v2/list?page=1&limit=8');
    if (!res.ok) { 
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (chkSlow.checked) await sleep(700); 


    photosBody.textContent = '';
    const frag = document.createDocumentFragment();
    for (const p of data.slice(0, 8)) {
    const img = document.createElement('img');
    img.src = `https://picsum.photos/id/${p.id}/200/120`; 
    img.alt = `photo ${p.id}`;
    img.loading = 'lazy';
    frag.appendChild(img);
}
photosBody.appendChild(frag);

    setStatus(photosStatus, 'ok');
  } catch (err) {
    setStatus(photosStatus, 'error');
    photosBody.textContent = `Error: ${err.message || err}`;
  } finally {
    setLoading(photosCard, false);
  }
};

photosCancel.onclick = async function(){
  setLoading(photosCard, false);
  setStatus(photosStatus, 'idle');
  photosBody.textContent = 'Canceled.';
}

// weather API
// User card onclick function - seperate function
weatherLoad.onclick = async function(){
  setLoading(weatherCard, true);
  setStatus(weatherStatus, 'loading…');
  weatherBody.textContent = 'Loading…';  

  // getting the lat and long 
  const lat = parseFloat(latInput.value)
  const lng = parseFloat(lngInput.value)

  //validating the input values
  const latOk = Number.isFinite(lat) && lat >= -90 && lat <= 90
  const lngOk = Number.isFinite(lng) && lng >= -180 && lng <= 180

  // Checking for the values of coordinates
  if (!latOk || !lngOk){
    setLoading(weatherCard, false);
    setStatus(weatherStatus, 'error')
    weatherBody.textContent = 'Enter latitude -90..90 and longitude -180..180';
    return 
  }

  // creating the url from the values
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`

  try {
    const res = await fetch(url);
    if (!res.ok) { 
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (chkSlow.checked) await sleep(700); 
    

   const temp = data?.current_weather?.temperature;
   const wind = data?.current_weather?.windspeed;

  if (Number.isFinite(temp)) {
  weatherBody.textContent = (wind != null)
    ? `Now: ${temp} °C, wind ${wind} km/h`
    : `Now: ${temp} °C`;
  setStatus(weatherStatus, 'ok');
  } else {
  weatherBody.textContent = 'No weather data.';
  setStatus(weatherStatus, 'error');
  }
}catch(err){
  setStatus(weatherStatus, 'error');
  weatherBody.textContent = `Error: ${err.message || err}`;
} finally{
  setLoading(weatherCard, false);
}


//Weather Cancel Button
weatherCancel.onclick =  function () {
  setLoading(weatherCard, false);
  setStatus(weatherStatus, 'idle');
  weatherBody.textContent = 'Canceled.';
};
}


//onclick functions for the advice API
adviceLoad.onclick = async function () {
  setLoading(adviceCard, true);
  setStatus(adviceStatus, 'loading…');
  adviceBody.textContent = 'Loading…';

  try {
    // cache-buster so you don't get the same advice repeatedly
    const res = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (chkSlow.checked) await sleep(700);

    const text = data?.slip?.advice ?? 'No advice right now.';
    adviceBody.textContent = `“${text}”`;
    setStatus(adviceStatus, 'ok');

  } catch (err) {
    setStatus(adviceStatus, 'error');
    adviceBody.textContent = `Error: ${err.message || err}`;
  } finally {
    setLoading(adviceCard, false);
  }
};


adviceCancel.onclick = function() {
  setLoading(adviceCard, false);
  setStatus(adviceStatus, "idle");
  adviceBody.textContent = 'Canceled.'
}

// //wiring the loadAll button
btnLoadAll.onclick = function(){
  userLoad.click();
  photosLoad.click();
  weatherLoad.click();
  adviceLoad.click();
}

btnCancelAll.onclick = function() {
  userCancel.click();
  photosCancel.click();
  weatherCancel.click();
  adviceCancel.click();
}
