// Declaring the variables here: 
// starting with the global controls
const btnLoadAll = document.getElementById('btn-load-all');
const btnCancelAll = document.getElementById('btn-cancel-all');
const chkSlow = document.getElementById('chk-slow');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');
let usersController = null;


// All the card  variables

const usersCard = document.getElementById('users-card');
const photosCard = document.getElementById('photos-card');
const weatherCard = document.getElementById('weather-card');
const adviceCard = document.getElementById('advice-card');
const jokesCard = document.getElementById('jokes-card'); 
const catsCard = document.getElementById('cats-card');
const unsplashPhotoCard = document.getElementById('unsplashphoto-card');
const photosListCard = document.getElementById('photoslist-card');

//All the section statuses

const usersStatus = document.getElementById('users-status');
const photosStatus = document.getElementById('photos-status');
const weatherStatus = document.getElementById('weather-status');
const adviceStatus = document.getElementById('advice-status');
const jokesStatus = document.getElementById('jokes-status');
const catsStatus = document.getElementById('cats-status');
const unsplashPhotoStatus = document.getElementById('unsplashphoto-status');
const photoslistStatus = document.getElementById('photoslist-status');


// All the body Sections

const usersBody = document.getElementById('users-body');
const photosBody = document.getElementById('photos-body');
const weatherBody = document.getElementById('weather-body');
const adviceBody = document.getElementById('advice-body');
const jokesBody = document.getElementById('jokes-body');
const catsBody = document.getElementById('cats-body');
const unsplashphotoBody = document.getElementById('unsplashphoto-body');
const photoslistBody = document.getElementById('photoslist-body');



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

// Jokes buttons
const jokesLoad = document.getElementById('jokes-load');
const jokesCancel = document.getElementById('jokes-cancel');

// Cats API
const catsLoad = document.getElementById('cats-load');
const catsCancel = document.getElementById('cats-cancel');

//const unsplash photo api buttons

const unsplashPhotoLoad = document.getElementById('unsplashphoto-load');
const unsplashPhotoCancel = document.getElementById('unsplashphoto-cancel');

// const list of photo api buttons

const photosListLoad = document.getElementById('photoslist-load');
const photosListCancel = document.getElementById('photoslist-cancel'); 




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
userLoad.onclick = async function () {
  // Abort any previous Users request, then create a fresh controller
if (usersController) { try { usersController.abort(); } catch {} }
usersController = new AbortController();

// 🔑 capture a local reference for this run
const ctrl = usersController;

try {
  const res = await fetch('https://jsonplaceholder.typicode.com/users', {
    signal: ctrl.signal            // use the local reference
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();

  if (chkSlow.checked) await sleep(700);

  // 🔑 if user canceled during the slow wait, treat as aborted
  if (ctrl.signal.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const names = data.slice(0, 5).map(u => u.name).join('\n');
  usersBody.textContent = names;
  setStatus(usersStatus, 'ok');

} catch (err) {
  if (err.name === 'AbortError') {
    usersBody.textContent = 'Canceled.';
    setStatus(usersStatus, 'idle');
  } else {
    setStatus(usersStatus, 'error');
    usersBody.textContent = `Error: ${err.message || err}`;
  }
} finally {
  setLoading(usersCard, false);
  // 🔑 only clear if this was the active controller
  if (usersController === ctrl) usersController = null;
}

};


//Usercancel Button
userCancel.onclick = function () {
  if (usersController) { try { usersController.abort(); } catch {} }
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

//New API onclick calls ---

jokesLoad.onclick = async function() {
  setLoading(jokesCard, true);
  setStatus(jokesStatus, 'loading…');
  jokesBody.textContent = 'Loading…';
  console.log('jokes: clicked');

    try {
    // cache-buster so you don't get the same advice repeatedly
    const res = await fetch('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json' }, cache: 'no-store'});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (chkSlow.checked) await sleep(700);

    const text = data.joke;
    jokesBody.textContent = `“${text}”`;
    setStatus(jokesStatus, 'ok');

    } catch (err) {
      setStatus(jokesStatus, 'error');
      jokesBody.textContent = `Error: ${err.message || err}`;
    } finally {
      setLoading(jokesCard, false);
    }
}

jokesCancel.onclick = function() {
  setLoading(jokesCard, false);
  setStatus(jokesStatus, 'idle');
  jokesBody.textContent = 'Canceled';
}

// cats Advice
catsLoad.onclick = async function() {
  setLoading(catsCard, true);
  setStatus(catsStatus, 'loading…');
  catsBody.textContent = 'Loading…';
  console.log('cats: clicked');

  

    try {
    // cache-buster so you don't get the same advice repeatedly
    const res = await fetch('https://catfact.ninja/fact');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (chkSlow.checked) await sleep(700);

    const text = data.fact;
    catsBody.textContent = `“${text}”`;
    setStatus(catsStatus, 'ok');

    } catch (err) {
      setStatus(catsStatus, 'error');
      catsBody.textContent = `Error: ${err.message || err}`;
    } finally {
      setLoading(catsCard, false);
    }
}

catsCancel.onclick = function() {
  setLoading(catsCard, false);
  setStatus(catsStatus, 'idle');
  catsBody.textContent = 'Canceled';
}

// Getting the random picture from the unsplash API
unsplashPhotoLoad.onclick = async function() {
  setLoading(unsplashPhotoCard, true);
  setStatus(unsplashPhotoStatus, 'loading…');
  unsplashphotoBody.textContent = 'Loading…';
  console.log('unsplashphoto: clicked');

    try {
    // cache-buster so you don't get the same advice repeatedly
    const res = await fetch('https://api.unsplash.com/photos/random?client_id=0L6HhXK6N5iml12DrTpkNY-OR4jjvgIpak6YeRokZUY');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (chkSlow.checked) await sleep(700);

    const imageUrl = data.urls.raw;
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Random photo from Unsplash';
    img.style.maxWidth = '80%';
    img.style.height = '80%';
    unsplashphotoBody.innerHTML = '';
    unsplashphotoBody.appendChild(img);
    unsplashphotoBody.style.display = 'flex';
    unsplashphotoBody.style.justifyContent = 'center';
    unsplashphotoBody.style.alignItems = 'center';
    unsplashphotoBody.style.minHeight = 'auto';
    setStatus(unsplashPhotoStatus, 'ok');

    } catch (err) {
      setStatus(unsplashPhotoStatus, 'error');
      unsplashphotoBody.textContent = `Error: ${err.message || err}`;
    } finally {
      setLoading(unsplashPhotoCard, false);
    }
}

unsplashPhotoCancel.onclick = function() {
  setLoading(unsplashPhotoCard, false);
  setStatus(unsplashPhotoStatus, 'idle');
  unsplashphotoBody.textContent = 'Canceled';
}

// Photos List API - Opens images in new page
photosListLoad.onclick = async function() {
  setLoading(photosListCard, true);
  setStatus(photoslistStatus, 'loading…');
  photoslistBody.textContent = 'Loading…';
  console.log('photoslist: clicked');

  try {
    // Fetch multiple photos from Unsplash
    const res = await fetch('https://api.unsplash.com/photos/random?count=20&client_id=0L6HhXK6N5iml12DrTpkNY-OR4jjvgIpak6YeRokZUY');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (chkSlow.checked) await sleep(1500);

    // Clear the body and create clickable thumbnails
    photoslistBody.innerHTML = '';
    const frag = document.createDocumentFragment();
    
    for (const photo of data) {
      // Create a container for each photo
      const photoContainer = document.createElement('div');
      photoContainer.style.display = 'inline-block';
      photoContainer.style.margin = '5px';
      photoContainer.style.cursor = 'pointer';
      
      // Create thumbnail image
      const img = document.createElement('img');
      img.src = photo.urls.thumb; // Use thumbnail for better performance
      img.alt = photo.description || 'Photo from Unsplash';
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '5px';
      img.style.border = '2px solid #ddd';
      
      // Add click event to open full image in new page
      img.onclick = function() {
        window.open(photo.urls.full, '_blank');
      };
      
      // Add hover effect
      img.onmouseover = function() {
        img.style.border = '2px solid #007bff';
        img.style.transform = 'scale(1.05)';
        img.style.transition = 'all 0.2s ease';
      };
      
      img.onmouseout = function() {
        img.style.border = '2px solid #ddd';
        img.style.transform = 'scale(1)';
      };
      
      photoContainer.appendChild(img);
      frag.appendChild(photoContainer);
    }
    
    photoslistBody.appendChild(frag);
    setStatus(photoslistStatus, 'ok');

  } catch (err) {
    setStatus(photoslistStatus, 'error');
    photoslistBody.textContent = `Error: ${err.message || err}`;
  } finally {
    setLoading(photosListCard, false);
  }
}

photosListCancel.onclick = function() {
  setLoading(photosListCard, false);
  setStatus(photoslistStatus, 'idle');
  photoslistBody.textContent = 'Canceled';
}



//wiring the loadAll button
btnLoadAll.onclick = function(){
  userLoad.click();
  photosLoad.click();
  weatherLoad.click();
  adviceLoad.click();
  jokesLoad.click();
  catsLoad.click();
  unsplashPhotoLoad.click();
  photosListLoad.click();
}

btnCancelAll.onclick = function() {
  userCancel.click();
  photosCancel.click();
  weatherCancel.click();
  adviceCancel.click();
  jokesCancel.click();
  catsCancel.click();
  unsplashPhotoCancel.click();
  photosListCancel.click();
}

// need to work on this tomorrow. 
