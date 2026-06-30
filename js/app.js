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
const posXSlider = document.getElementById('pos-x');
const posYSlider = document.getElementById('pos-y');
const btnReset = document.getElementById('btn-reset');
const btnDownload = document.getElementById('btn-download');

canvas.width = SIZE;
canvas.height = SIZE;
canvasExport.width = SIZE;
canvasExport.height = SIZE;

let userImage = null;
let frameImage = null;

const frameImg = new Image();
frameImg.src = 'assets/frame.png';
frameImg.onload = () => { frameImage = frameImg; if (userImage) render(); };

// Upload handlers
uploadArea.addEventListener('click', () => fileInput.click());

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
      posXSlider.value = 0;
      posYSlider.value = 0;
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
    const offsetX = parseInt(posXSlider.value);
    const offsetY = parseInt(posYSlider.value);
    const ratio = Math.max(SIZE / userImage.width, SIZE / userImage.height);
    const w = userImage.width * ratio * scale;
    const h = userImage.height * ratio * scale;
    const x = (SIZE - w) / 2 + offsetX;
    const y = (SIZE - h) / 2 + offsetY;
    targetCtx.drawImage(userImage, x, y, w, h);
  }

  if (frameImage) {
    targetCtx.drawImage(frameImage, 0, 0, SIZE, SIZE);
  }
}

function render() { drawComposite(ctx); }

[scaleSlider, posXSlider, posYSlider].forEach(el => el.addEventListener('input', render));

btnReset.addEventListener('click', () => {
  userImage = null;
  fileInput.value = '';
  stepPreview.classList.add('hidden');
  stepUpload.classList.remove('hidden');
});

btnDownload.addEventListener('click', () => {
  drawComposite(ctxExport);
  const link = document.createElement('a');
  link.download = 'google-ai-frame.png';
  link.href = canvasExport.toDataURL('image/png');
  link.click();
});
