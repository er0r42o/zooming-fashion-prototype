// script.js – interactive behaviour for Zooming Fashion prototype

document.addEventListener('DOMContentLoaded', () => {
  /* Zoom In functionality */
  const img = document.getElementById('fabricImage');
  const lens = document.getElementById('zoomLens');
  const result = document.getElementById('zoomResult');

  if (img && lens && result) {
    // Set background image for result
    result.style.backgroundImage = `url('${img.getAttribute('src')}')`;

    // Calculate the ratio between result div and lens size
    const cx = result.offsetWidth / lens.offsetWidth;
    const cy = result.offsetHeight / lens.offsetHeight;
    result.style.backgroundSize = `${img.width * cx}px ${img.height * cy}px`;

    /* Function to get cursor position relative to the image */
    function getCursorPos(e) {
      const rect = img.getBoundingClientRect();
      let x = e.pageX - rect.left - window.pageXOffset;
      let y = e.pageY - rect.top - window.pageYOffset;
      return { x, y };
    }

    function moveLens(e) {
      e.preventDefault();
      const pos = getCursorPos(e);
      let x = pos.x - lens.offsetWidth / 2;
      let y = pos.y - lens.offsetHeight / 2;
      // Prevent the lens from being positioned outside the image
      if (x > img.width - lens.offsetWidth) x = img.width - lens.offsetWidth;
      if (x < 0) x = 0;
      if (y > img.height - lens.offsetHeight) y = img.height - lens.offsetHeight;
      if (y < 0) y = 0;
      // Set lens position
      lens.style.left = x + 'px';
      lens.style.top = y + 'px';
      lens.style.visibility = 'visible';
      // Display corresponding part in the result div
      result.style.backgroundPosition = '-' + (x * cx) + 'px -' + (y * cy) + 'px';
    }

    // Show lens on mouse move over the image
    img.addEventListener('mousemove', moveLens);
    lens.addEventListener('mousemove', moveLens);
    img.addEventListener('touchmove', moveLens);
    lens.addEventListener('touchmove', moveLens);

    // Hide lens when leaving the image
    img.addEventListener('mouseenter', () => {
      lens.style.visibility = 'visible';
    });
    img.addEventListener('mouseleave', () => {
      lens.style.visibility = 'hidden';
    });
  }

  /* Zoom Through functionality */
  const uploadInput = document.getElementById('uploadInput');
  const userPhoto = document.getElementById('userPhoto');
  const tryOnCanvas = document.getElementById('virtualTryOn');
  if (uploadInput && userPhoto && tryOnCanvas) {
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        userPhoto.src = ev.target.result;
        tryOnCanvas.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    });
  }
});