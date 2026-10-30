import { CameraService } from './cameraService.js';

let cameras = [];
let activeObservers = [];
let hlsInstances = [];

const wall = document.getElementById('camera-wall');
const searchInput = document.getElementById('search-input');
const regionFilter = document.getElementById('region-filter');
const matrixLayout = document.getElementById('matrix-layout');
const refreshBtn = document.getElementById('refresh-all-btn');
const activeCount = document.getElementById('active-count');

const modal = document.getElementById('cam-modal');
const modalClose = document.getElementById('modal-close');
const modalContainer = document.getElementById('modal-player-container');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalGlobeLink = document.getElementById('modal-globe-link');

async function init() {
  cameras = await CameraService.loadAllCameras();
  setupEventListeners();
  render();
  startStaggeredPoller();
}

function createMediaElement(cam, isModal = false) {
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100%';

  if (cam.type === 'hls') {
    const video = document.createElement('video');
    video.className = 'cam-media';
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    if (isModal) video.controls = true;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(CameraService.getProxiedUrl(cam.url));
      hls.attachMedia(video);
      hlsInstances.push(hls);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = CameraService.getProxiedUrl(cam.url);
    }
    container.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.className = 'cam-media';
    img.dataset.rawurl = CameraService.getProxiedUrl(cam.url);
    img.src = `${img.dataset.rawurl}?t=${Date.now()}`;
    container.appendChild(img);
  }
  return container;
}

function render() {
  cleanupStreams();
  wall.innerHTML = '';

  const query = searchInput.value.toLowerCase();
  const region = regionFilter.value;

  const filtered = cameras.filter(cam => {
    const matchesText = cam.name.toLowerCase().includes(query) || cam.id.includes(query);
    const matchesRegion = region === 'ALL' || cam.region === region;
    return matchesText && matchesRegion;
  });

  activeCount.textContent = filtered.length;

  filtered.forEach((cam, index) => {
    const card = document.createElement('div');
    card.className = 'cam-card';
    card.innerHTML = `
      <div class="cam-header">
        <span class="cam-title" title="${cam.name}">${cam.name}</span>
        <span style="color: var(--text-secondary)">${cam.region}</span>
      </div>
      <div class="cam-media-wrapper">
        <span class="stream-tag">${cam.type.toUpperCase()}</span>
      </div>
    `;

    const mediaWrapper = card.querySelector('.cam-media-wrapper');
    mediaWrapper.addEventListener('click', () => openModal(cam));
    wall.appendChild(card);

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setTimeout(() => {
          mediaWrapper.appendChild(createMediaElement(cam, false));
        }, (index % 8) * 100);
        obs.unobserve(mediaWrapper);
      });
    }, { threshold: 0.1 });

    observer.observe(mediaWrapper);
    activeObservers.push(observer);
  });
}

function startStaggeredPoller() {
  setInterval(() => {
    const images = wall.querySelectorAll('img.cam-media');
    images.forEach((img, idx) => {
      if (!img.dataset.rawurl) return;
      setTimeout(() => {
        img.src = `${img.dataset.rawurl}?t=${Date.now()}`;
      }, (idx % 12) * 200);
    });
  }, 5000);
}

function openModal(cam) {
  modalContainer.innerHTML = '';
  modalTitle.textContent = cam.name;
  modalMeta.textContent = `Region: ${cam.region} | Lat: ${cam.lat}, Lon: ${cam.lon}`;
  modalGlobeLink.href = `/?lat=${cam.lat}&lon=${cam.lon}&heading=0&pitch=-35`;
  modalContainer.appendChild(createMediaElement(cam, true));
  modal.classList.remove('hidden');
}

function cleanupStreams() {
  hlsInstances.forEach(hls => hls.destroy());
  hlsInstances = [];
  activeObservers.forEach(obs => obs.disconnect());
  activeObservers = [];
}

function setupEventListeners() {
  searchInput.addEventListener('input', render);
  regionFilter.addEventListener('change', render);
  matrixLayout.addEventListener('change', (e) => { wall.className = e.target.value; });
  refreshBtn.addEventListener('click', () => {
    const images = wall.querySelectorAll('img.cam-media');
    const now = Date.now();
    images.forEach(img => { if (img.dataset.rawurl) img.src = `${img.dataset.rawurl}?t=${now}`; });
  });
  modalClose.addEventListener('click', () => {
    modal.classList.add('hidden');
    modalContainer.innerHTML = '';
  });
}

init();
