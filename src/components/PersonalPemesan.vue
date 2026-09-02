<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  event: {
    type: Object,
    required: true,
    default: () => ({
      id: 1,
      title: 'Ngamen 0.5',
      price: 'Rp124.000',
      organizer: 'Maxpaincompany LTD',
      location: 'Cornerstone Bandung',
      date: 'Sat, 24 Aug 2024',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'
    })
  },
  selectedTickets: {
    type: Object,
    default: () => ({})
  },
  ticketsList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['back', 'proceed-payment']);

// Accordion states
const isBannerExpanded = ref(true);
const isVoucherExpanded = ref(false);
const isOrdererExpanded = ref(true);
const isTicketOwnerExpanded = ref(true);

// Form data pemesan
const ordererForm = ref({
  fullName: 'Afif Prasetyo',
  email: 'afif.prasetyo@gmail.com',
  phone: '081298765432'
});

// Toggle gunakan data pemesan untuk pemilik tiket
const sameAsOrderer = ref(true);

// Form data pemilik tiket
const ownerForm = ref({
  fullName: 'Afif Prasetyo',
  email: 'afif.prasetyo@gmail.com',
  phone: '081298765432'
});

const handleToggleSameAsOrderer = () => {
  sameAsOrderer.value = !sameAsOrderer.value;
  if (sameAsOrderer.value) {
    ownerForm.value.fullName = ordererForm.value.fullName;
    ownerForm.value.email = ordererForm.value.email;
    ownerForm.value.phone = ordererForm.value.phone;
  }
};

// Voucher state
const voucherCodeInput = ref('');
const appliedVoucher = ref(null);
const voucherError = ref('');

const handleApplyVoucher = () => {
  voucherError.value = '';
  if (!voucherCodeInput.value.trim()) {
    voucherError.value = 'Masukkan kode voucher terlebih dahulu';
    return;
  }
  
  if (voucherCodeInput.value.toUpperCase() === 'KOLEKTIX10') {
    appliedVoucher.value = {
      code: 'KOLEKTIX10',
      discountText: 'Diskon 10%',
      discountValue: 12400
    };
    voucherCodeInput.value = '';
  } else {
    voucherError.value = 'Kode voucher tidak valid atau sudah kadaluarsa';
  }
};

const removeVoucher = () => {
  appliedVoucher.value = null;
};

// Countdown timer (15 minutes)
const timeLeftSeconds = ref(15 * 60);
let timerInterval = null;

const formattedCountdown = computed(() => {
  const m = Math.floor(timeLeftSeconds.value / 60);
  const s = timeLeftSeconds.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

onMounted(() => {
  timerInterval = setInterval(() => {
    if (timeLeftSeconds.value > 0) {
      timeLeftSeconds.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const handleProceedNext = () => {
  if (!ordererForm.value.fullName.trim() || !ordererForm.value.email.trim() || !ordererForm.value.phone.trim()) {
    alert('Mohon lengkapi data pemesan terlebih dahulu');
    return;
  }
  if (!sameAsOrderer.value && (!ownerForm.value.fullName.trim() || !ownerForm.value.email.trim() || !ownerForm.value.phone.trim())) {
    alert('Mohon lengkapi data pemilik tiket terlebih dahulu');
    return;
  }
  
  emit('proceed-payment', {
    orderer: ordererForm.value,
    owner: sameAsOrderer.value ? ordererForm.value : ownerForm.value,
    voucher: appliedVoucher.value
  });
};
</script>

<template>
  <div class="personal-buyer-page">
    <!-- Header Top Bar -->
    <div class="buyer-header">
      <button class="back-btn" @click="emit('back')" title="Kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" style="width: 20px; height: 20px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>

      <h1 class="buyer-header-title">Personal Pemesan</h1>
      
      <div style="width: 36px;"></div>
    </div>

    <!-- Scrollable Content Body -->
    <div class="buyer-content-scroll">
      
      <!-- Unified Single Card for Event Banner Image & Creator Profile -->
      <div class="event-banner-combined-card">
        <div class="banner-image-container">
          <img :src="event.image" :alt="event.title" class="banner-img" />
          <div class="banner-gradient-overlay">
            <div class="banner-overlay-text">
              <span class="banner-event-title">{{ event.title }}</span>
              <span class="banner-event-meta">{{ event.date || 'Sat, 24 Aug 2024' }} • {{ event.location || 'Cornerstone Bandung' }}</span>
            </div>
          </div>
        </div>

        <div class="creator-profile-info-row">
          <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" alt="Creator Avatar" class="creator-avatar-img" />
          <div class="creator-text-group">
            <span class="creator-label-text">Diselenggarakan oleh</span>
            <span class="creator-name-text">{{ event.organizer || 'Maxpaincompany LTD' }}</span>
          </div>
        </div>
      </div>

      <!-- 2. Card Voucher Promo (Accordion, Open by Default) -->
      <div class="accordion-card">
        <div class="accordion-header" @click="isVoucherExpanded = !isVoucherExpanded">
          <div class="header-title-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            <span class="card-heading-text">Voucher & Promo DISKON</span>
          </div>

          <button class="accordion-chevron" :class="{ 'rotated': isVoucherExpanded }">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#194e9e" style="width: 16px; height: 16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        <transition name="accordion-slide">
          <div v-if="isVoucherExpanded" class="accordion-body">
            <div v-if="!appliedVoucher" class="voucher-input-row">
              <input 
                v-model="voucherCodeInput" 
                type="text" 
                class="voucher-text-input" 
                placeholder="Masukkan kode voucher (e.g. KOLEKTIX10)" 
              />
              <button class="btn-use-voucher" @click="handleApplyVoucher">Gunakan</button>
            </div>

            <div v-else class="voucher-applied-box">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="voucher-badge-code">{{ appliedVoucher.code }}</span>
                <span class="voucher-badge-desc">{{ appliedVoucher.discountText }} tersimpan</span>
              </div>
              <button class="btn-remove-voucher" @click="removeVoucher">Batal</button>
            </div>

            <span v-if="voucherError" class="voucher-error-msg">{{ voucherError }}</span>
          </div>
        </transition>
      </div>      <!-- 3. Card Form Input Data Pemesan (Permanent Static Card) -->
      <div class="static-form-card">
        <div class="static-card-header">
          <div class="header-title-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span class="card-heading-text">Data Pemesan</span>
          </div>
        </div>

        <div class="static-card-body">
          <div class="form-field-group">
            <label class="field-label-text">Nama Lengkap</label>
            <input v-model="ordererForm.fullName" type="text" class="field-text-input" placeholder="Masukkan nama lengkap sesuai identitas" />
          </div>

          <div class="form-field-group">
            <label class="field-label-text">Alamat Email</label>
            <input v-model="ordererForm.email" type="email" class="field-text-input" placeholder="contoh: nama@email.com" />
          </div>

          <div class="form-field-group">
            <label class="field-label-text">Nomor Telepon</label>
            <input v-model="ordererForm.phone" type="tel" class="field-text-input" placeholder="contoh: 081234567890" />
          </div>
        </div>
      </div>

      <!-- 4. Card Form Pemilik Tiket (Permanent Static Card) -->
      <div class="static-form-card">
        <div class="static-card-header">
          <div class="header-title-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
            <span class="card-heading-text">Data Pemilik Tiket</span>
          </div>
        </div>

        <div class="static-card-body">
          <!-- Toggle Gunakan Data Pemesan -->
          <div class="toggle-same-data-row" @click="handleToggleSameAsOrderer">
            <div class="toggle-switch-box" :class="{ 'is-active': sameAsOrderer }">
              <div class="toggle-switch-circle"></div>
            </div>
            <span class="toggle-label-text">Samakan data pemilik tiket dengan data pemesan</span>
          </div>

          <!-- Form Input Pemilik Tiket -->
          <div v-if="!sameAsOrderer" class="form-inputs-container">
            <div class="form-field-group">
              <label class="field-label-text">Nama Lengkap Pemilik</label>
              <input v-model="ownerForm.fullName" type="text" class="field-text-input" placeholder="Nama pemilik tiket" />
            </div>

            <div class="form-field-group">
              <label class="field-label-text">Alamat Email Pemilik</label>
              <input v-model="ownerForm.email" type="email" class="field-text-input" placeholder="Email pemilik tiket" />
            </div>

            <div class="form-field-group">
              <label class="field-label-text">Nomor Telepon Pemilik</label>
              <input v-model="ownerForm.phone" type="tel" class="field-text-input" placeholder="Nomor hp pemilik tiket" />
            </div>
          </div>

          <div v-else class="same-data-active-notice">
            <span>Menggunakan data pemesan di atas untuk tiket ini.</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Fixed Bottom Sticky Bar -->
    <div class="buyer-bottom-sticky-bar">
      <div class="sticky-countdown-info">
        <span class="countdown-label-text">Selesaikan pesanan dalam</span>
        <div class="countdown-pill-badge">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#ef4444" style="width: 14px; height: 14px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span class="countdown-timer-num">{{ formattedCountdown }}</span>
        </div>
      </div>

      <button class="btn-next-step-blue" @click="handleProceedNext">
        <span>Selanjutnya</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#ffffff" style="width: 16px; height: 16px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.personal-buyer-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  height: 100%;
  background-color: #f8fafc;
  font-family: var(--font-sans);
  position: relative;
  overflow-x: hidden !important;
  touch-action: pan-y;
  overscroll-behavior: contain;
}

/* Header Top Bar */
.buyer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 52px;
  box-sizing: border-box;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #194e9e;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background-color 0.2s;
  padding: 0;
}

.back-btn:hover {
  background-color: #f1f5f9;
}

.buyer-header-title {
  font-size: 15px;
  font-weight: 700;
  color: #000000;
  margin: 0;
}

/* Scroll Content */
.buyer-content-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 14px 140px 14px !important;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Accordion Card Container */
.accordion-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  background-color: #ffffff;
  user-select: none;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.event-banner-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.card-heading-text {
  font-size: 13.5px;
  font-weight: 500;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.accordion-chevron {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.accordion-chevron.rotated {
  transform: rotate(180deg);
}

/* Static Permanent Form Cards */
.static-form-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.static-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background-color: #ffffff;
}

.static-card-body {
  padding: 14px 16px 16px 16px;
  border-top: 1px solid #f1f5f9;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Accordion Body */
.accordion-body {
  padding: 14px 16px 16px 16px;
  border-top: 1px solid #f1f5f9;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Combined Single Card for Event Banner & Creator Profile */
.event-banner-combined-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  flex-shrink: 0;
}

.banner-image-container {
  width: 100%;
  height: 105px;
  position: relative;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.banner-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(25, 78, 158, 0.65) 0%, rgba(15, 23, 42, 0.88) 100%);
  display: flex;
  align-items: flex-end;
  padding: 12px 14px;
}

.banner-overlay-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
  overflow: hidden;
}

.banner-event-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-event-meta {
  font-size: 11px;
  font-weight: 400;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.creator-profile-info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background-color: #ffffff;
  border-top: 1px solid #f1f5f9;
}

.creator-avatar-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.creator-text-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: left;
  overflow: hidden;
}

.creator-label-text {
  font-size: 9.5px;
  font-weight: 400;
  color: #64748b;
}

.creator-name-text {
  font-size: 12px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-preview-sub {
  font-size: 11px;
  font-weight: 400;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-preview-organizer {
  font-size: 10px;
  font-weight: 400;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Voucher Card */
.voucher-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.voucher-text-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  color: #000000;
  outline: none;
  font-family: var(--font-sans);
}

.voucher-text-input:focus {
  border-color: #194e9e;
}

.btn-use-voucher {
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.voucher-applied-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 8px 12px;
  border-radius: 6px;
}

.voucher-badge-code {
  font-size: 12px;
  font-weight: 600;
  color: #194e9e;
}

.voucher-badge-desc {
  font-size: 11px;
  font-weight: 400;
  color: #000000;
}

.btn-remove-voucher {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
}

.voucher-error-msg {
  font-size: 11px;
  color: #ef4444;
  font-weight: 400;
}

/* Form Fields */
.form-field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.field-label-text {
  font-size: 11.5px;
  font-weight: 400;
  color: #000000;
}

.field-text-input {
  padding: 9px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  color: #000000;
  outline: none;
  font-family: var(--font-sans);
  width: 100%;
  box-sizing: border-box;
}

.field-text-input:focus {
  border-color: #194e9e;
}

/* Toggle Switch Row */
.toggle-same-data-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
}

.toggle-switch-box {
  width: 36px;
  height: 20px;
  background-color: #cbd5e1;
  border-radius: 9999px;
  padding: 2px;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.toggle-switch-box.is-active {
  background-color: #194e9e;
}

.toggle-switch-circle {
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle-switch-box.is-active .toggle-switch-circle {
  transform: translateX(16px);
}

.toggle-label-text {
  font-size: 11.5px;
  font-weight: 400;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-inputs-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 6px;
}

.same-data-active-notice {
  font-size: 11px;
  font-weight: 400;
  color: #64748b;
  text-align: left;
}

/* Sticky Bottom Action Bar */
.buyer-bottom-sticky-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 10px 16px 14px 16px;
  box-sizing: border-box;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
}

.sticky-countdown-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.countdown-label-text {
  font-size: 10.5px;
  font-weight: 400;
  color: #000000;
  white-space: nowrap;
}

.countdown-pill-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #fee2e2;
  padding: 3px 8px;
  border-radius: 6px;
}

.countdown-timer-num {
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
  font-family: monospace, var(--font-sans);
}

.btn-next-step-blue {
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.15s;
  white-space: nowrap;
}

.btn-next-step-blue:hover {
  background-color: #0d3e91;
}

@media (max-width: 480px) {
  .personal-buyer-page {
    width: 100vw;
  }
}
</style>
