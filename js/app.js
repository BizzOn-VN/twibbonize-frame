const SIZE = 1000;

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const stepUpload = document.getElementById('step-upload');
const stepPreview = document.getElementById('step-preview');
const canvas = document.getElementById('canvas');
const canvasExport = document.getElementById('canvas-export');
const ctx = canvas.getContext('2d');
const ctxExport = canvasExport.getContext('2d');
const scaleSlider = document.getElementById('scale');
const btnReset = document.getElementById('btn-reset');
const btnDownload = document.getElementById('btn-download');
const iosTooltip = document.getElementById('ios-tooltip');
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

canvas.width = SIZE;
canvas.height = SIZE;
canvasExport.width = SIZE;
canvasExport.height = SIZE;

let userImage = null;
let frameImage = null;

const frameImg = new Image();
frameImg.crossOrigin = 'anonymous';
frameImg.src = 'assets/frame.png';
frameImg.onload = () => { frameImage = frameImg; if (userImage) render(); };

// Upload handlers
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) loadFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadFile(fileInput.files[0]);
});

function loadFile(file) {
  if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh!'); return; }
  if (file.size > 10 * 1024 * 1024) { alert('File quá lớn, tối đa 10MB!'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      userImage = img;
      scaleSlider.value = 1;
      stepUpload.classList.add('hidden');
      stepPreview.classList.remove('hidden');
      render();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function drawComposite(targetCtx) {
  targetCtx.clearRect(0, 0, SIZE, SIZE);

  if (userImage) {
    const scale = parseFloat(scaleSlider.value);
    const ratio = Math.max(SIZE / userImage.width, SIZE / userImage.height);
    const w = userImage.width * ratio * scale;
    const h = userImage.height * ratio * scale;
    const x = (SIZE - w) / 2;
    const y = (SIZE - h) / 2;
    targetCtx.drawImage(userImage, x, y, w, h);
  }

  if (frameImage) {
    targetCtx.drawImage(frameImage, 0, 0, SIZE, SIZE);
  }
}

function render() { drawComposite(ctx); }

scaleSlider.addEventListener('input', render);

btnReset.addEventListener('click', () => {
  userImage = null;
  fileInput.value = '';
  stepPreview.classList.add('hidden');
  stepUpload.classList.remove('hidden');
});

btnDownload.addEventListener('click', () => {
  drawComposite(ctxExport);

  canvasExport.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isIOS) {
      window.open(url, '_blank');
      if (iosTooltip) iosTooltip.classList.remove('hidden');
    } else {
      const link = document.createElement('a');
      link.download = 'google-ai-frame.png';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }, 'image/png');
});
