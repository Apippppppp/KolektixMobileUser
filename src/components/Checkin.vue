<script setup>
import { ref, onBeforeUnmount, watch, onMounted } from 'vue';

onMounted(() => {
  if (!window.LottiePlayer && !document.getElementById('lottie-player-script')) {
    const script = document.createElement('script');
    script.id = 'lottie-player-script';
    script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
    document.head.appendChild(script);
  }
});

const props = defineProps({
  events: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close-checkin']);

// Scan Results Popup Notification state
const scanPopupVisible = ref(false);
const scanResultStatus = ref('success'); // 'success', 'failed', 'already'
const scanData = ref({
  name: 'Ahmad Fauzi',
  ticketType: 'Presale Regular (#TKT-8841)',
  time: ''
});

let popupTimer = null;

const triggerScan = (status) => {
  scanResultStatus.value = status;
  scanPopupVisible.value = true;
  
  if (status === 'failed') {
    scanData.value = {
      name: 'Tidak Terdaftar',
      ticketType: 'Ticket Invalid/Gagal (#TKT-ERR)',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };
  } else if (status === 'already') {
    scanData.value = {
      name: 'Ahmad Fauzi',
      ticketType: 'Presale Regular (#TKT-8841)',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };
  } else {
    scanData.value = {
      name: 'Ahmad Fauzi',
      ticketType: 'Presale Regular (#TKT-8841)',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };
  }
  
  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = setTimeout(() => {
    scanPopupVisible.value = false;
  }, 8000);
};

const closePopup = () => {
  scanPopupVisible.value = false;
  if (popupTimer) clearTimeout(popupTimer);
  if (checkinMode.value === 'qr' && currentCheckinEvent.value) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(scanQRCode);
  }
};

// Camera Scanner View State
const videoElement = ref(null);
let videoStream = null;
const checkinMode = ref('qr'); // 'qr' or 'manual'
const manualTicketCode = ref('');

const currentCheckinEvent = ref(null); // Selected event for check-in
const checkinTab = ref('aktif'); // 'aktif' or 'lalu'

// jsQR dynamic script loader
let jsScriptLoaded = false;
const loadJsQR = () => {
  return new Promise((resolve, reject) => {
    if (window.jsQR || jsScriptLoaded) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.onload = () => {
      jsScriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const cameraErrorPopupVisible = ref(false);
let canvasElement = null;
let canvasCtx = null;
let animationFrameId = null;

const scanQRCode = () => {
  if (videoElement.value && videoElement.value.readyState === videoElement.value.HAVE_ENOUGH_DATA) {
    if (!canvasElement) {
      canvasElement = document.createElement('canvas');
      canvasCtx = canvasElement.getContext('2d');
    }
    canvasElement.width = videoElement.value.videoWidth;
    canvasElement.height = videoElement.value.videoHeight;
    canvasCtx.drawImage(videoElement.value, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = canvasCtx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const code = window.jsQR ? window.jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    }) : null;
    
    if (code) {
      const qrData = code.data;
      
      let status = 'success';
      if (qrData.toLowerCase().includes('gagal') || qrData.toLowerCase().includes('fail')) {
        status = 'failed';
      } else if (qrData.toLowerCase().includes('sudah') || qrData.toLowerCase().includes('used')) {
        status = 'already';
      }
      
      triggerScan(status);
      scanData.value.ticketType = `Scanned QR (#${qrData.substring(0, 12).toUpperCase()})`;
      
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      return;
    }
  }
  
  if (currentCheckinEvent.value && checkinMode.value === 'qr' && !scanPopupVisible.value) {
    animationFrameId = requestAnimationFrame(scanQRCode);
  }
};

const startCamera = async () => {
  try {
    cameraErrorPopupVisible.value = false;
    await loadJsQR();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      videoStream = stream;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(scanQRCode);
    }
  } catch (err) {
    console.error("Camera access blocked or error:", err);
    cameraErrorPopupVisible.value = true;
  }
};

const retryCamera = () => {
  cameraErrorPopupVisible.value = false;
  startCamera();
};

const stopCamera = () => {
  cameraErrorPopupVisible.value = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
};

// Flashlight toggle control
const isFlashlightOn = ref(false);
watch(isFlashlightOn, async (on) => {
  if (videoStream && checkinMode.value === 'qr') {
    const track = videoStream.getVideoTracks()[0];
    if (track) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: on }]
        });
      } catch (err) {
        console.warn("Torch / Flashlight not supported on this device/browser constraints:", err);
      }
    }
  }
});

// Watch for checkinEvent selection to control camera state
watch(currentCheckinEvent, (newEvent) => {
  if (newEvent) {
    if (checkinMode.value === 'qr') {
      startCamera();
    }
  } else {
    stopCamera();
    isFlashlightOn.value = false;
  }
});

// Watch mode switch to start/stop camera stream dynamically
watch(checkinMode, (newMode) => {
  if (currentCheckinEvent.value) {
    if (newMode === 'qr') {
      startCamera();
    } else {
      stopCamera();
      isFlashlightOn.value = false;
    }
  }
});

// Viewfinder tap simulation helper
const handleViewfinderTap = () => {
  const statuses = ['success', 'failed', 'already'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  triggerScan(randomStatus);
  scanData.value.ticketType = `Simulated Tap (#TKT-${Math.floor(1000 + Math.random() * 9000)})`;
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
};

// Manual Input Checker trigger
const handleManualCheckin = () => {
  const code = manualTicketCode.value.trim();
  if (!code) return;
  
  let status = 'success';
  if (code.toLowerCase().includes('gagal') || code.toLowerCase().includes('fail')) {
    status = 'failed';
  } else if (code.toLowerCase().includes('sudah') || code.toLowerCase().includes('used')) {
    status = 'already';
  }
  
  triggerScan(status);
  scanData.value.ticketType = `Manual Input (#${code.toUpperCase()})`;
  manualTicketCode.value = '';
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
};

onBeforeUnmount(() => {
  stopCamera();
  if (popupTimer) clearTimeout(popupTimer);
});
</script>

<template>
  <div class="checkin-list-page">
    <!-- Header Tabs -->
    <div class="checkin-tabs-header">
      <button 
        class="checkin-tab-btn" 
        :class="{ active: checkinTab === 'aktif' }"
        @click="checkinTab = 'aktif'"
      >
        Check-in Aktif
      </button>
      <button 
        class="checkin-tab-btn" 
        :class="{ active: checkinTab === 'lalu' }"
        @click="checkinTab = 'lalu'"
      >
        Check-in Lalu
      </button>
    </div>
    
    <div class="checkin-tab-content">
      <!-- Active checkin events list -->
      <div v-if="checkinTab === 'aktif'">
        <div v-if="events.filter(e => e.status === 'Live').length > 0" class="checkin-events-list">
          <div 
            v-for="event in events.filter(e => e.status === 'Live')" 
            :key="event.id" 
            class="event-card"
          >
            <!-- Card Thumbnail Area -->
            <div class="card-thumbnail-wrapper">
              <img :src="event.image" :alt="event.title" class="event-thumbnail" />
              <div class="status-badge" :class="event.status.toLowerCase()">
                <span class="status-dot"></span>
                <span>{{ event.status }}</span>
              </div>
            </div>

            <!-- Card Info Area -->
            <div class="card-info">
              <h3 class="event-card-title">{{ event.title }}</h3>
              
              <div class="meta-row" v-if="event.location">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                  <path fill-rule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.343 7.587.829.799 1.655 1.381 2.274 1.765.31.193.57.337.757.433.107.054.2.096.28.14a.515.515 0 0 0 .036.017l.006.003ZM10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                </svg>
                <span class="meta-text">{{ event.location }}</span>
              </div>

              <div class="meta-row" v-if="event.date">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                  <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                </svg>
                <span class="meta-text">{{ event.date }}</span>
              </div>

              <!-- Footer Progress bar -->
              <div class="card-footer-row">
                <div class="ticket-sales-info">
                  <div class="sales-text-row">
                    <span class="sales-text">{{ event.sold }}/{{ event.total }} Tiket Terjual</span>
                    <span class="sales-percent">{{ Math.round((event.sold / event.total) * 100) }}%</span>
                  </div>
                  <div class="sales-progress-bar">
                    <div 
                      class="sales-progress-fill" 
                      :style="{ width: `${(event.sold / event.total) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Action Check-in Button -->
              <div class="checkin-action-wrapper" style="margin-top: 14px;">
                <button class="checkin-card-action-btn" @click="currentCheckinEvent = event; checkinMode = 'qr'">
                  Check-in
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state fallback if no active events -->
        <div v-else class="checkin-empty-state">
          <div class="empty-illustration-wrapper">
            <div class="blue-horizontal-line"></div>
            <lottie-player 
              src="/media/sad emotion.json" 
              background="transparent" 
              speed="1" 
              style="width: 120px; height: 120px;" 
              loop 
              autoplay
            ></lottie-player>
          </div>
          <h3>Belum ada check-in aktif</h3>
          <p>Tidak ada event yang sedang berlangsung saat ini. Silakan buat event baru terlebih dahulu.</p>
        </div>
      </div>
      
      <!-- Past checkins (Mockup empty state) -->
      <div v-if="checkinTab === 'lalu'" class="checkin-empty-state">
        <div class="empty-illustration-wrapper">
          <div class="blue-horizontal-line"></div>
          <lottie-player 
            src="/media/sad emotion.json" 
            background="transparent" 
            speed="1" 
            style="width: 120px; height: 120px;" 
            loop 
            autoplay
          ></lottie-player>
        </div>
        
        <h3>Belum ada check-in</h3>
        <p>Klik tombol "Buat Check-in" di bawah</p>
        
        <button class="create-checkin-btn" @click="checkinTab = 'aktif'">
          Buat Check-in
        </button>
      </div>
    </div>
  </div>

  <!-- Full-Screen Scanner View -->
  <div v-if="currentCheckinEvent !== null" class="scanner-fullscreen-container" :class="{ 'manual-bg': checkinMode === 'manual' }">
    <!-- Real Camera Feed Video Element -->
    <video v-show="checkinMode === 'qr'" ref="videoElement" autoplay playsinline class="scanner-camera-feed"></video>
    <div v-show="checkinMode === 'qr'" class="scanner-overlay-dark"></div>
    
    <!-- Scanner Top Bar -->
    <div class="scanner-top-bar">
      <button class="scanner-icon-btn close-btn" @click="currentCheckinEvent = null">
        <!-- Close X Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="scanner-svg-icon">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="scanner-header-title">
        <h3>{{ currentCheckinEvent?.title || 'Scanner' }}</h3>
        <p>{{ currentCheckinEvent?.location || 'Lokasi' }}</p>
      </div>
      
      <!-- Only show flash toggle in QR mode -->
      <button v-show="checkinMode === 'qr'" class="scanner-icon-btn flash-btn" :class="{ active: isFlashlightOn }" @click="isFlashlightOn = !isFlashlightOn">
        <!-- Flash Bolt Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="scanner-svg-icon" :style="{ fill: isFlashlightOn ? '#F5C453' : 'none', stroke: isFlashlightOn ? '#F5C453' : 'currentColor' }">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </button>
      <div v-show="checkinMode === 'manual'" style="width: 40px;"></div> <!-- placeholder for symmetry -->
    </div>
    
    <!-- Check-in Mode Selector Tab Toggle -->
    <div class="checkin-mode-toggle">
      <button class="toggle-btn" :class="{ active: checkinMode === 'qr' }" @click="checkinMode = 'qr'">
        QR Code
      </button>
      <button class="toggle-btn" :class="{ active: checkinMode === 'manual' }" @click="checkinMode = 'manual'">
        Manual (Nomor)
      </button>
    </div>
    
    <!-- Scanning Window Area (QR Mode) -->
    <div v-if="checkinMode === 'qr'" class="scanner-viewfinder" @click="handleViewfinderTap">
      <div class="viewfinder-bracket top-left"></div>
      <div class="viewfinder-bracket top-right"></div>
      <div class="viewfinder-bracket bottom-left"></div>
      <div class="viewfinder-bracket bottom-right"></div>
      <div class="scanner-laser-line"></div>
      <div class="scanner-tap-hint">Ketuk kotak untuk simulasi scan</div>
    </div>
    
    <!-- Manual Input Card (Manual Mode - matching mockup style) -->
    <div v-if="checkinMode === 'manual'" class="manual-checkin-container">
      <div class="manual-form-card">
        <div class="manual-field-group">
          <label class="manual-label">Kode Tiket / Invoice</label>
          <input 
            v-model="manualTicketCode" 
            type="text" 
            placeholder="Masukkan kode tiket" 
            class="manual-input-field"
            @keyup.enter="handleManualCheckin"
          />
          <p class="manual-desc-mockup">Masukkan nomor invoice atau kode tiket untuk diproses scanner</p>
        </div>
        
        <button class="manual-submit-btn" @click="handleManualCheckin">
          Check-in Tiket
        </button>
        
        <div class="manual-tips">
          <span>💡 <strong>Tips Simulasi:</strong> Ketik kata "gagal" untuk simulasi gagal, atau "sudah" untuk simulasi tiket terpakai.</span>
        </div>
      </div>
    </div>
    
    <!-- Bottom Total Audience Progress Bar (Blue theme) -->
    <div class="scanner-bottom-stats">
      <div class="stats-row">
        <span class="stats-label">TOTAL MASUK</span>
        <span class="stats-val">412 / 1.000 Penonton</span>
      </div>
      <div class="stats-progress-container">
        <div class="stats-progress-track">
          <div class="stats-progress-fill" style="width: 41.2%;"></div>
        </div>
      </div>
    </div>

    <!-- Multi-step Sliding Notification Popups -->
    <transition name="popup-slide">
      <div v-if="scanPopupVisible" class="notification-popup-card">
        <!-- Header status block -->
        <div class="notification-header" :class="scanResultStatus">
          <div class="header-icon">
            <svg v-if="scanResultStatus === 'success'" viewBox="0 0 20 20" fill="currentColor" class="status-svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
            </svg>
            <svg v-else-if="scanResultStatus === 'failed'" viewBox="0 0 20 20" fill="currentColor" class="status-svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
            </svg>
            <svg v-else viewBox="0 0 20 20" fill="currentColor" class="status-svg">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="header-text">
            {{ scanResultStatus === 'success' ? 'BERHASIL SCAN' : (scanResultStatus === 'failed' ? 'GAGAL SCAN' : 'SUDAH SCAN') }}
          </span>
        </div>

        <!-- Body content details block -->
        <div class="notification-body">
          <div class="attendee-row">
            <div class="attendee-avatar">
              {{ scanData.name.split(' ').map(n => n[0]).join('') }}
            </div>
            <div class="attendee-info">
              <h4>{{ scanData.name }}</h4>
              <p>{{ scanData.ticketType }}</p>
            </div>
          </div>

          <div class="scan-time-row">
            <div class="scan-time-info">
              <span class="time-label">WAKTU MASUK</span>
              <span class="time-val">{{ scanData.time }}</span>
            </div>
            <button class="continue-btn" @click="closePopup">
              Lanjut Scan
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Slide-up Camera Failure Error Card -->
    <transition name="popup-slide">
      <div v-if="cameraErrorPopupVisible" class="notification-popup-card camera-error-card">
        <div class="notification-header failed">
          <div class="header-icon">
            <svg viewBox="0 0 20 20" fill="currentColor" class="status-svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
            </svg>
          </div>
          <span class="header-text">KAMERA GAGAL DIAKTIFKAN</span>
        </div>
        <div class="notification-body">
          <p class="error-card-desc">Gagal mengakses kamera perangkat. Pastikan izin kamera telah diberikan atau coba gunakan input kode manual sebagai gantinya.</p>
          <div class="error-action-row">
            <button class="continue-btn" @click="retryCamera">Coba Lagi</button>
            <button class="continue-btn manual-switch-btn" @click="checkinMode = 'manual'; cameraErrorPopupVisible = false;">Input Manual</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.checkin-list-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Tab headers matching mockup layout */
.checkin-tabs-header {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  padding: 0 16px; /* kept clean side margin for tab labels */
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
}

.checkin-tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  position: relative;
  text-align: center;
  transition: color 0.2s;
  font-family: var(--font-sans);
}

.checkin-tab-btn.active {
  color: var(--primary-base);
  font-weight: 600;
}

.checkin-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--primary-base);
  border-radius: 3px 3px 0 0;
}

.checkin-events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 12px;
}

/* Check-in Card Action Button */
.checkin-card-action-btn {
  width: 100%;
  background-color: var(--primary-base);
  color: var(--white);
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(25, 78, 158, 0.12);
  transition: background-color 0.2s, transform 0.1s;
}

.checkin-card-action-btn:hover {
  background-color: var(--primary-light-700);
}

.checkin-card-action-btn:active {
  transform: scale(0.98);
}

/* Empty Checkin state mockup styles */
.checkin-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 100px 24px 32px 24px; /* shifted down from 64px to 100px */
}

.checkin-empty-state h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--dark);
  margin: 0 0 10px 0;
}

.checkin-empty-state p {
  font-size: 11px;
  color: var(--dark-grey);
  line-height: 1.6;
  margin: 0 0 24px 0;
  max-width: 280px;
}

.create-checkin-btn {
  background-color: var(--primary-base);
  color: var(--white);
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-sans);
  box-shadow: 0 4px 10px rgba(25, 78, 158, 0.25);
  transition: background-color 0.2s, transform 0.1s;
}

.create-checkin-btn:hover {
  background-color: var(--primary-light-700);
  transform: translateY(-1px);
}

/* Folder illustration mockup matching the user mockup drawing */
.empty-illustration-wrapper {
  margin-bottom: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.blue-horizontal-line {
  width: 130px;
  height: 4px;
  background-color: #194E9E; /* main theme blue */
  border-radius: 4px;
  margin-bottom: 0px; /* raised slightly up */
  position: relative;
  z-index: 10;
}

.folder-illustration {
  width: 140px;
  height: 120px;
  position: relative;
}

.folder-cloud {
  position: absolute;
  top: -10px;
  left: -20px;
  right: -20px;
  bottom: -10px;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.8;
}

.cloud-svg {
  width: 100%;
  height: 100%;
}

.folder-container {
  position: absolute;
  width: 90px;
  height: 70px;
  left: 25px;
  top: 25px;
  z-index: 2;
}

.doc-card {
  position: absolute;
  width: 36px;
  height: 48px;
  background-color: var(--white);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.doc-card.doc1 {
  top: -12px;
  left: 12px;
  transform: rotate(-10deg);
  background-color: #ffd8a8;
}

.doc-card.doc2 {
  top: -15px;
  left: 42px;
  transform: rotate(8deg);
  background-color: var(--white);
}

.folder-box {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 52px;
  background-color: #fdba74;
  border-radius: 6px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
}

.folder-tab {
  position: absolute;
  top: -6px;
  left: 6px;
  width: 24px;
  height: 8px;
  background-color: #fdba74;
  border-radius: 4px 4px 0 0;
}

.folder-front {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background-color: #f97316;
  border-radius: 0 0 6px 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.folder-circle-arrow {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.arrow-svg {
  width: 10px;
  height: 10px;
  color: var(--white);
  transform: rotate(0deg);
}

/* ==========================================
   SCANNER INTERFACE STYLES (FULL-SCREEN)
   ========================================== */

.scanner-fullscreen-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: 999;
  display: flex;
  flex-direction: column;
  color: var(--white);
  font-family: var(--font-sans);
  overflow: hidden;
}

.scanner-camera-feed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.scanner-overlay-dark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.scanner-top-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
}

.scanner-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.scanner-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.scanner-svg-icon {
  width: 20px;
  height: 20px;
}

.scanner-header-title {
  text-align: center;
}

.scanner-header-title h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--white);
}

.scanner-header-title p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 2px 0 0 0;
  letter-spacing: 0.5px;
}

.scanner-tap-hint {
  position: absolute;
  bottom: -28px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  text-align: center;
  width: 240px;
}

.scanner-viewfinder {
  position: relative;
  z-index: 2;
  width: 240px;
  height: 240px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewfinder-bracket {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: var(--white);
  border-style: solid;
  border-width: 0;
}

.viewfinder-bracket.top-left {
  top: 0;
  left: 0;
  border-top-width: 3px;
  border-left-width: 3px;
  border-top-left-radius: 12px;
}

.viewfinder-bracket.top-right {
  top: 0;
  right: 0;
  border-top-width: 3px;
  border-right-width: 3px;
  border-top-right-radius: 12px;
}

.viewfinder-bracket.bottom-left {
  bottom: 0;
  left: 0;
  border-bottom-width: 3px;
  border-left-width: 3px;
  border-bottom-left-radius: 12px;
}

.viewfinder-bracket.bottom-right {
  bottom: 0;
  right: 0;
  border-bottom-width: 3px;
  border-right-width: 3px;
  border-bottom-right-radius: 12px;
}

.scanner-laser-line {
  position: absolute;
  left: 8px;
  right: 8px;
  height: 2px;
  background-color: var(--primary-base);
  box-shadow: 0 0 12px 2px var(--primary-base);
  animation: scan-anim 2.5s infinite ease-in-out;
}

@keyframes scan-anim {
  0% { top: 8px; }
  50% { top: 232px; }
  100% { top: 8px; }
}

/* Checkin Mode Toggle Switcher */
.checkin-mode-toggle {
  position: relative;
  z-index: 2;
  display: flex;
  align-self: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 30px;
  gap: 4px;
  margin-top: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
}

.checkin-mode-toggle .toggle-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkin-mode-toggle .toggle-btn.active {
  background-color: var(--primary-base);
  color: var(--white);
  box-shadow: 0 2px 8px rgba(25, 78, 158, 0.4);
}

.scanner-bottom-stats {
  position: relative;
  z-index: 2;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.stats-val {
  font-size: 12px;
  font-weight: 700;
}

.stats-progress-container {
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.stats-progress-track {
  width: 100%;
  height: 100%;
}

.stats-progress-fill {
  height: 100%;
  background-color: var(--primary-base);
  border-radius: 3px;
}

/* Manual Mode Card Form - Custom Mockup Style (Light Theme) */
.scanner-fullscreen-container.manual-bg {
  background-color: #fcfcfd; /* main app background */
  color: var(--dark);
}

.scanner-fullscreen-container.manual-bg .scanner-top-bar {
  background: none; /* remove black gradient background */
}

.scanner-fullscreen-container.manual-bg .scanner-header-title h3 {
  color: var(--dark);
}

.scanner-fullscreen-container.manual-bg .scanner-header-title p {
  color: var(--dark-grey);
}

.scanner-fullscreen-container.manual-bg .scanner-icon-btn {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--dark);
}

.scanner-fullscreen-container.manual-bg .checkin-mode-toggle {
  background-color: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.08);
}

.scanner-fullscreen-container.manual-bg .checkin-mode-toggle .toggle-btn {
  color: var(--dark-grey);
}

.scanner-fullscreen-container.manual-bg .checkin-mode-toggle .toggle-btn.active {
  color: var(--white);
  background-color: var(--primary-base);
}

.scanner-fullscreen-container.manual-bg .scanner-bottom-stats {
  background: linear-gradient(to top, rgba(253, 253, 253, 0.95), transparent);
}

.scanner-fullscreen-container.manual-bg .stats-label {
  color: var(--dark-grey);
}

.scanner-fullscreen-container.manual-bg .stats-val {
  color: var(--dark);
}

.scanner-fullscreen-container.manual-bg .stats-progress-container {
  background-color: rgba(0, 0, 0, 0.08);
}

.manual-checkin-container {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0 20px;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.manual-form-card {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.manual-field-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  text-align: left;
}

.manual-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--dark);
  font-family: var(--font-sans);
}

.manual-input-field {
  width: 100%;
  background-color: var(--white);
  border: 1px solid #bfdbfe; /* soft light-blue border */
  border-radius: 8px;
  color: var(--dark);
  padding: 12px 14px;
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: 500;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
  transition: border-color 0.2s;
}

.manual-input-field:focus {
  border-color: var(--primary-base);
}

.manual-input-field::placeholder {
  color: #94a3b8;
}

.manual-desc-mockup {
  font-size: 11px;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.manual-submit-btn {
  background-color: var(--primary-base);
  color: var(--white);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background-color 0.2s;
  box-shadow: 0 4px 10px rgba(25, 78, 158, 0.15);
}

.manual-submit-btn:hover {
  background-color: var(--primary-light-700);
}

.manual-tips {
  margin-top: 10px;
  font-size: 9px;
  color: #64748b;
  line-height: 1.4;
  text-align: left;
}

/* ==========================================
   NOTIFICATION POPUP CARD (VERIFICATION STATUS)
   ========================================== */

.notification-popup-card {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background-color: var(--white);
  border-radius: 12px;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.notification-header {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-header.success {
  background-color: #d1fae5;
  color: #065f46;
  border-bottom: 1px solid #a7f3d0;
}

.notification-header.failed {
  background-color: #fee2e2;
  color: #991b1b;
  border-bottom: 1px solid #fecaca;
}

.notification-header.already {
  background-color: #fef3c7;
  color: #92400e;
  border-bottom: 1px solid #fde68a;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-svg {
  width: 16px;
  height: 16px;
}

.header-text {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.notification-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attendee-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attendee-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #475569;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attendee-info h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

.attendee-info p {
  font-size: 11px;
  color: var(--dark-grey);
  margin: 4px 0 0 0;
}

.scan-time-row {
  border-top: 1px dashed var(--light-grey);
  padding-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scan-time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-label {
  font-size: 10px;
  color: var(--grey);
  font-weight: 600;
}

.time-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--dark);
}

.continue-btn {
  background-color: var(--primary-base);
  color: var(--white);
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.continue-btn:hover {
  background-color: var(--primary-light-700);
  opacity: 0.95;
}

/* Camera Error Card Styles */
.error-card-desc {
  font-size: 11px;
  color: var(--dark-grey);
  line-height: 1.5;
  margin: 0 0 16px 0;
  text-align: left;
}

.error-action-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.error-action-row .continue-btn {
  flex: 1;
  text-align: center;
  padding: 10px;
}

.error-action-row .manual-switch-btn {
  background-color: #f1f5f9;
  color: #475569;
}

.error-action-row .manual-switch-btn:hover {
  background-color: #e2e8f0;
}

.popup-slide-enter-active,
.popup-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.popup-slide-enter-from,
.popup-slide-leave-to {
  transform: translateY(120%);
  opacity: 0;
}

.popup-slide-enter-to,
.popup-slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Card Layout Styles copied to Checkin Component */
.event-card {
  background-color: var(--white);
  border: 1px solid var(--light-grey);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

.card-thumbnail-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
  background-color: var(--light-grey);
}

.event-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: var(--white);
  border-radius: 20px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.status-badge.live {
  color: #16a34a;
}

.status-badge.live .status-dot {
  background-color: #16a34a;
  animation: live-dot-blink 1s infinite alternate;
}

@keyframes live-dot-blink {
  0% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.status-badge.upcoming {
  color: #ea580c;
}

.status-badge.upcoming .status-dot {
  background-color: #ea580c;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dark);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--dark);
  margin-top: 2px;
}

.meta-icon {
  width: 14px;
  height: 14px;
  color: var(--primary-base);
}

.meta-text {
  font-size: 12px;
  color: var(--dark);
}

.card-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--light-grey);
}

.ticket-sales-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.sales-text-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.sales-text {
  font-size: 11px;
  font-weight: 500;
  color: var(--dark);
}

.sales-percent {
  font-size: 11px;
  font-weight: 700;
  color: var(--dark);
}

.sales-progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--light-grey);
  border-radius: 10px;
  overflow: hidden;
}

.sales-progress-fill {
  height: 100%;
  background-color: var(--primary-base);
  border-radius: 10px;
}
</style>
