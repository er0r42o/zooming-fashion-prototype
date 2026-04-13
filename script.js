// script.js — Zooming Fashion SPA

document.addEventListener('DOMContentLoaded', () => {

  // ── Page navigation ─────────────────────────────────────────
  const pages = document.querySelectorAll('.page');
  const stepDots = document.querySelectorAll('.step-dot');
  const stepLines = document.querySelectorAll('.step-line');

  function showPage(num) {
    pages.forEach((p, i) => {
      p.classList.toggle('active', i + 1 === num);
    });
    stepDots.forEach((dot, i) => {
      dot.classList.toggle('active', i + 1 === num);
      dot.classList.toggle('done', i + 1 < num);
    });
    stepLines.forEach((line, i) => {
      line.classList.toggle('done', i + 1 < num);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Step dots navigate to their page (only if reached)
  stepDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.dataset.page, 10);
      if (dot.classList.contains('active') || dot.classList.contains('done')) {
        showPage(target);
      }
    });
  });

  // ── Page 1: Scan Garment ─────────────────────────────────────
  const garmentInput = document.getElementById('garmentInput');
  const dropZone = document.getElementById('dropZone');
  const scanPreview = document.getElementById('scanPreview');
  const garmentPreview = document.getElementById('garmentPreview');
  const btnRescan = document.getElementById('btnRescan');
  const btnToDetails = document.getElementById('btnToDetails');
  const fabricImage = document.getElementById('fabricImage');

  function loadGarment(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      garmentPreview.src = src;
      fabricImage.src = src;   // feed into zoom on page 2
      dropZone.classList.add('hidden');
      scanPreview.classList.remove('hidden');
      btnToDetails.disabled = false;
      // Re-initialize zoom background once image loads
      fabricImage.onload = () => initZoom();
    };
    reader.readAsDataURL(file);
  }

  // Click on drop zone opens file picker
  dropZone.addEventListener('click', () => garmentInput.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') garmentInput.click();
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    loadGarment(file);
  });

  garmentInput.addEventListener('change', (e) => {
    loadGarment(e.target.files[0]);
  });

  btnRescan.addEventListener('click', () => {
    garmentInput.value = '';
    scanPreview.classList.add('hidden');
    dropZone.classList.remove('hidden');
    btnToDetails.disabled = true;
  });

  btnToDetails.addEventListener('click', () => showPage(2));

  // ── Page 2: Zoom-In (Fabric Explorer) ───────────────────────
  const lens   = document.getElementById('zoomLens');
  const result = document.getElementById('zoomResult');

  function initZoom() {
    if (!fabricImage || !lens || !result) return;
    result.style.backgroundImage = `url('${fabricImage.src}')`;
    updateZoomSize();
  }

  function updateZoomSize() {
    const iw = fabricImage.naturalWidth  || fabricImage.offsetWidth;
    const ih = fabricImage.naturalHeight || fabricImage.offsetHeight;
    const cx = result.offsetWidth  / lens.offsetWidth;
    const cy = result.offsetHeight / lens.offsetHeight;
    result.style.backgroundSize = `${iw * cx}px ${ih * cy}px`;
  }

  function moveLens(e) {
    e.preventDefault();
    const rect = fabricImage.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let x = clientX - rect.left - lens.offsetWidth  / 2;
    let y = clientY - rect.top  - lens.offsetHeight / 2;
    const maxX = fabricImage.offsetWidth  - lens.offsetWidth;
    const maxY = fabricImage.offsetHeight - lens.offsetHeight;
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    lens.style.left = x + 'px';
    lens.style.top  = y + 'px';
    lens.style.visibility = 'visible';
    const cx = result.offsetWidth  / lens.offsetWidth;
    const cy = result.offsetHeight / lens.offsetHeight;
    result.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
  }

  if (fabricImage && lens && result) {
    fabricImage.addEventListener('mousemove', moveLens);
    lens.addEventListener('mousemove', moveLens);
    fabricImage.addEventListener('touchmove', moveLens, { passive: false });

    fabricImage.addEventListener('mouseleave', () => {
      lens.style.visibility = 'hidden';
    });

    fabricImage.addEventListener('load', initZoom);
    if (fabricImage.complete) initZoom();
  }

  // ── Page 2: Info Tabs ────────────────────────────────────────
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('aria-controls');
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(target).classList.add('active');
    });
  });

  // Navigation buttons on page 2
  document.getElementById('btnBackToScan').addEventListener('click', () => showPage(1));
  document.getElementById('btnToTryOn').addEventListener('click', () => showPage(3));

  // ── Page 3: Virtual Try-On ───────────────────────────────────
  const selfieInput = document.getElementById('selfieInput');
  const userPhoto   = document.getElementById('userPhoto');
  const tryOnWrap   = document.getElementById('tryOnWrap');

  selfieInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      userPhoto.src = ev.target.result;
      tryOnWrap.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btnBackToDetails').addEventListener('click', () => showPage(2));

  document.getElementById('btnStartOver').addEventListener('click', () => {
    // Reset all state
    garmentInput.value = '';
    selfieInput.value  = '';
    garmentPreview.src = '';
    userPhoto.src      = '';
    scanPreview.classList.add('hidden');
    dropZone.classList.remove('hidden');
    tryOnWrap.classList.add('hidden');
    btnToDetails.disabled = true;
    fabricImage.src = 'small_pattern.jpg';
    initZoom();
    showPage(1);
  });

  // Initialise from the start
  showPage(1);
});
