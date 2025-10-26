const AppController = {
  modelViewer: null,
  video: null,
  canvas: null,
  currentModel: 'office_chair.glb',
  screenshots: [],
  isFullscreen: false,

  // list of available models in the project (add new filenames here)
  models: [
    'office_chair.glb',
    '3d_sofa_rendering.glb',
    'kitchen_table.glb',
    'gertie_2_seater_sofa_dufrene_moss_velvet.glb',
    'ergonomic_mesh_office_chair.glb',
    'dining_tablegame_ready.glb',
    'couch.glb',
    'bedside_table__wardrobe.glb'
  ],

  // optional per-model metadata: friendly label, thumbnail (optional), default scale and camera orbit
  modelsMeta: {
    'office_chair.glb': { label: 'Premium Office Chair', scale: 1.0 },
    '3d_sofa_rendering.glb': { label: 'Modern Sofa', scale: 0.9 },
    'kitchen_table.glb': { label: 'Kitchen Table', scale: 1.2 },
    'gertie_2_seater_sofa_dufrene_moss_velvet.glb': { label: 'Gertie 2-Seater Sofa', scale: 0.85 },
    'ergonomic_mesh_office_chair.glb': { label: 'Ergonomic Mesh Chair', scale: 1.0 },
    'dining_tablegame_ready.glb': { label: 'Dining Table', scale: 1.1 },
    'couch (2).glb': { label: 'Couch', scale: 0.95 },
    'bedside_table__wardrobe.glb': { label: 'Bedside / Wardrobe', scale: 1.0 }
  },

  productData: {
    'office_chair.glb': {
      name: 'Premium Office Chair',
      description: 'This is a high-quality office chair designed for comfort and durability. Features ergonomic support and premium materials.',
      price: 'R20,000',
      size: '40cm'
    },
    '3d_sofa_rendering.glb': {
      name: 'Modern Luxury Sofa',
      description: 'Contemporary sofa with premium upholstery and exceptional comfort. Perfect for modern living spaces.',
      price: 'R45,000',
      size: '220cm'
    }
    // other models will get default product data when selected
  },

  init() {
    this.modelViewer = document.getElementById('modelViewer');
    this.video = document.getElementById('camera');
    this.canvas = document.getElementById('screenshot-canvas');

    this.loadScreenshots();
    this.setupEventListeners();
    this.setupModelLoading();
    this.setupGestureHints();
    this.setupKeyboardShortcuts();
    this.populateModelSelector();
    // initialize preview for current model
    this.updateModelPreview(this.currentModel);
  },

  setupEventListeners() {
    const toggleBtn = document.getElementById('below');
    const footer = document.querySelector('.cover');
    toggleBtn.addEventListener('click', () => {
      footer.classList.toggle('uncover');
    });

    const infoBox = document.getElementById('info');
    const infoModal = document.getElementById('info-modal');
    const closeBtn = document.getElementById('close-btn');
    const modalOverlay = document.getElementById('modal-overlay');

    infoBox.addEventListener('click', () => {
      infoModal.style.display = 'flex';
      this.updateProductInfo();
    });
    closeBtn.addEventListener('click', () => { infoModal.style.display = 'none'; });
    modalOverlay.addEventListener('click', () => { infoModal.style.display = 'none'; });

    document.getElementById('screenshot-btn').addEventListener('click', () => this.captureScreenshot());
    document.getElementById('screenshot-mobile-btn').addEventListener('click', () => this.captureScreenshot());

    const scaleSlider = document.getElementById('model-scale');
    const scaleValue = document.getElementById('scale-value');
    scaleSlider.addEventListener('input', () => {
      const scale = scaleSlider.value;
      this.modelViewer.scale = `${scale} ${scale} ${scale}`;
      scaleValue.textContent = `${parseFloat(scale).toFixed(2)}x`;
    });

    const modelSelect = document.getElementById('model-select');
  modelSelect.addEventListener('change', (e) => this.switchModel(e.target.value));

    const fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

    const galleryBtn = document.getElementById('gallery-btn');
    const galleryModal = document.getElementById('gallery-modal');
    const galleryCloseBtn = document.getElementById('gallery-close-btn');
    const galleryOverlay = document.getElementById('gallery-overlay');

    galleryBtn.addEventListener('click', () => {
      galleryModal.style.display = 'flex';
      this.renderGallery();
    });
    galleryCloseBtn.addEventListener('click', () => { galleryModal.style.display = 'none'; });
    galleryOverlay.addEventListener('click', () => { galleryModal.style.display = 'none'; });

    document.getElementById('clear-gallery-btn').addEventListener('click', () => this.clearGallery());

    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.updateFullscreenIcon();
    });
  },

  setupModelLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    this.modelViewer.addEventListener('progress', (event) => {
      const progress = event.detail.totalProgress * 100;
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;
    });

    this.modelViewer.addEventListener('load', () => {
      setTimeout(() => {
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 500);
      }, 500);
    });

    this.modelViewer.addEventListener('error', () => {
      this.showNotification('Error loading 3D model', 'error');
      loadingOverlay.style.display = 'none';
    });
  },

  setupGestureHints() {
    const hints = document.getElementById('gesture-hints');
    let interactionCount = 0;

    const hideHints = () => {
      interactionCount++;
      if (interactionCount >= 3) {
        hints.classList.add('fade-out');
        setTimeout(() => {
          hints.style.display = 'none';
        }, 500);
      }
    };

    this.modelViewer.addEventListener('camera-change', hideHints);

    setTimeout(() => {
      hints.classList.add('fade-out');
      setTimeout(() => {
        hints.style.display = 'none';
      }, 500);
    }, 10000);
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.captureScreenshot();
      }
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        this.toggleFullscreen();
      }
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        document.getElementById('gallery-btn').click();
      }
      if (e.key === 'i' && !e.ctrlKey && !e.metaKey) {
        document.getElementById('info').click();
      }
      if (e.key === 'Escape') {
        if (this.isFullscreen) {
          this.toggleFullscreen();
        }
      }
    });
  },

  switchModel(modelSrc) {
    this.currentModel = modelSrc;
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    loadingOverlay.classList.remove('fade-out');

    // update the visible model-viewer
    this.modelViewer.src = modelSrc;

    // apply per-model preview settings (scale, camera)
    const meta = this.modelsMeta[modelSrc] || {};
    const preferredScale = typeof meta.scale === 'number' ? meta.scale : 1.0;
    try {
      this.modelViewer.scale = `${preferredScale} ${preferredScale} ${preferredScale}`;
      const scaleValue = document.getElementById('scale-value');
      if (scaleValue) scaleValue.textContent = `${parseFloat(preferredScale).toFixed(2)}x`;
      if (meta.cameraOrbit) {
        this.modelViewer.cameraOrbit = meta.cameraOrbit;
      }
    } catch (e) { /* ignore if model-viewer not ready */ }

    // update preview thumbnail
    this.updateModelPreview(modelSrc);

    // tell the AR/Three.js loader to switch the GLTF used for placement and pass scale
    if (typeof window.setARModel === 'function') {
      window.setARModel(modelSrc, preferredScale);
    }

    this.updateProductInfo();
    this.showNotification('Switching model...', 'info');
  },

  // populate the model select dropdown using the models array
  populateModelSelector() {
    const select = document.getElementById('model-select');
    if (!select) return;
    select.innerHTML = '';
    this.models.forEach((m) => {
      const option = document.createElement('option');
      option.value = m;
      // human-friendly label
      option.textContent = this.friendlyName(m);
      select.appendChild(option);
      // ensure we have basic product data for unknown models
      if (!this.productData[m]) {
        this.productData[m] = {
          name: this.friendlyName(m),
          description: 'High-quality 3D model.',
          price: 'Contact for price',
          size: 'N/A'
        };
      }
    });
    // set current selection
    select.value = this.currentModel;
  },

  // update preview thumbnail and any UI hints for the selected model
  updateModelPreview(modelSrc) {
    const thumbEl = document.getElementById('model-thumb');
    const labelEl = document.getElementById('model-preview-label');
    const meta = this.modelsMeta[modelSrc] || {};
    const label = meta.label || this.friendlyName(modelSrc);
    if (labelEl) labelEl.textContent = label;

    // if there's a provided thumbnail in meta, use it; otherwise generate a simple SVG placeholder
    if (meta.thumbnail) {
      if (thumbEl) thumbEl.style.backgroundImage = `url('${meta.thumbnail}')`;
    } else {
      // generate data-uri svg with initials
      const initials = label.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
      const bg = '#0b6efd';
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'><rect width='100%' height='100%' fill='${bg}' rx='12'/><text x='50%' y='55%' font-size='36' fill='white' text-anchor='middle' font-family='Inter,Arial' dy='.35em'>${initials}</text></svg>`;
      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      if (thumbEl) thumbEl.style.backgroundImage = `url('${dataUri}')`;
    }
  },

  friendlyName(filename) {
    // strip extension and replace underscores/dashes with spaces, capitalize words
    const name = filename.replace(/\.glb$/i, '').replace(/[_\-]+/g, ' ');
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  },

  updateProductInfo() {
    const product = this.productData[this.currentModel];
    if (product) {
      document.getElementById('product-name').textContent = product.name;
      document.getElementById('product-description').textContent = product.description;
      document.getElementById('product-price').textContent = product.price;
      document.getElementById('product-size').textContent = product.size;
    }
  },

  toggleFullscreen() {
    if (!this.isFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        this.showNotification('Fullscreen not available', 'error');
      });
    } else {
      document.exitFullscreen();
    }
  },

  updateFullscreenIcon() {
    const icon = document.querySelector('#fullscreen-btn i');
    icon.className = this.isFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
  },

  captureScreenshot() {
    this.canvas.width = this.video.videoWidth || window.innerWidth;
    this.canvas.height = this.video.videoHeight || window.innerHeight;

    const ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 24px Inter';
    const text = 'CuttingEdgeTech';
    const textWidth = ctx.measureText(text).width;
    const padding = 20;
    const boxHeight = 50;

    ctx.fillRect(
      this.canvas.width - textWidth - padding * 2 - 10,
      this.canvas.height - boxHeight - padding,
      textWidth + padding * 2,
      boxHeight
    );
    ctx.fillStyle = '#0284c7';
    ctx.fillText(
      text,
      this.canvas.width - textWidth - padding - 10,
      this.canvas.height - padding - 15
    );

    this.canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const timestamp = Date.now();

      const screenshot = {
        id: timestamp,
        url: url,
        dataUrl: this.canvas.toDataURL(),
        date: new Date(timestamp).toLocaleString(),
        model: this.currentModel
      };

      this.screenshots.push(screenshot);
      this.saveScreenshots();

      const a = document.createElement('a');
      a.href = url;
      a.download = `ar-view-${timestamp}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      this.showNotification('Screenshot saved!', 'success');
    });
  },

  loadScreenshots() {
    try {
      const saved = localStorage.getItem('ar-screenshots');
      if (saved) {
        this.screenshots = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading screenshots:', error);
    }
  },

  saveScreenshots() {
    try {
      const toSave = this.screenshots.slice(-20);
      localStorage.setItem('ar-screenshots', JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving screenshots:', error);
      this.showNotification('Storage limit reached', 'error');
    }
  },

  renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');

    if (this.screenshots.length === 0) {
      galleryGrid.innerHTML = `
        <div class="empty-gallery">
          <i class="fa-solid fa-camera"></i>
          <p>No screenshots yet</p>
          <span>Take your first screenshot to see it here</span>
        </div>
      `;
      return;
    }

    galleryGrid.innerHTML = this.screenshots.map((screenshot, index) => `
      <div class="gallery-item" data-id="${screenshot.id}">
        <img src="${screenshot.dataUrl}" alt="Screenshot ${index + 1}">
        <div class="gallery-item-overlay">
          <button class="gallery-item-btn" onclick="AppController.downloadScreenshot('${screenshot.id}')">
            <i class="fa-solid fa-download"></i>
          </button>
          <button class="gallery-item-btn" onclick="AppController.deleteScreenshot('${screenshot.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="gallery-item-info">
          <span class="gallery-item-date">${screenshot.date}</span>
        </div>
      </div>
    `).reverse().join('');
  },

  downloadScreenshot(id) {
    const screenshot = this.screenshots.find(s => s.id == id);
    if (screenshot) {
      const a = document.createElement('a');
      a.href = screenshot.dataUrl;
      a.download = `ar-view-${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.showNotification('Screenshot downloaded!', 'success');
    }
  },

  deleteScreenshot(id) {
    this.screenshots = this.screenshots.filter(s => s.id != id);
    this.saveScreenshots();
    this.renderGallery();
    this.showNotification('Screenshot deleted', 'info');
  },

  clearGallery() {
    if (this.screenshots.length === 0) return;

    if (confirm('Are you sure you want to delete all screenshots?')) {
      this.screenshots = [];
      localStorage.removeItem('ar-screenshots');
      this.renderGallery();
      this.showNotification('Gallery cleared', 'info');
    }
  },

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      info: 'fa-info-circle'
    };

    notification.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AppController.init();
});
