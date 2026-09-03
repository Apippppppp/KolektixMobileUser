<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

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

// Language i18n state and translations
const currentLang = ref(localStorage.getItem('kolektix_lang') || 'ID');

const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'ID' ? 'EN' : 'ID';
  localStorage.setItem('kolektix_lang', currentLang.value);
};

const translations = {
  ID: {
    headerStep1: 'Personal Pemesan',
    headerStep2: 'Metode Pembayaran',
    timerBanner: 'Segera Selesaikan Pesananmu',
    voucherHeading: 'Voucher & Promo DISKON',
    voucherPlaceholder: 'Masukkan kode voucher (Opsional)',
    voucherUse: 'Gunakan',
    voucherApplied: 'Voucher Berhasil Dipasang!',
    voucherCancel: 'Batal',
    ordererTitle: 'Data Pemesan',
    fullNameLabel: 'Nama Lengkap',
    fullNamePlaceholder: 'Masukkan nama lengkap sesuai identitas',
    emailLabel: 'Alamat Email',
    emailPlaceholder: 'contoh: nama@email.com',
    phoneLabel: 'Nomor Telepon',
    phonePlaceholder: '81234567890',
    phoneZeroError: 'Nomor HP tidak perlu diawali 0, langsung mulai dari angka 8',
    fullNameRequired: 'Nama lengkap wajib diisi',
    emailRequired: 'Alamat email wajib diisi',
    emailInvalid: 'Format email tidak valid (e.g. nama@email.com)',
    phoneRequired: 'Nomor telepon wajib diisi',
    phoneInvalid: 'Nomor telepon tidak valid (8-13 digit angka)',
    ownersTitle: 'Data Pemilik Tiket',
    sameAsOrdererToggle: 'Gunakan Data Pemesan',
    ticketHolderPrefix: 'Pemilik Tiket',
    ownerFullNameLabel: 'Nama Lengkap Pemilik',
    ownerFullNamePlaceholder: 'Nama pemilik tiket sesuai identitas',
    ownerEmailLabel: 'Alamat Email Pemilik',
    ownerEmailPlaceholder: 'contoh: email.pemilik@email.com',
    ownerPhoneLabel: 'Nomor Telepon Pemilik',
    ownerFullNameRequired: 'Nama pemilik tiket wajib diisi',
    ownerEmailRequired: 'Email pemilik tiket wajib diisi',
    ownerPhoneRequired: 'Nomor telepon pemilik wajib diisi',
    totalBillLabel: 'Total Tagihan Pembayaran',
    nextBtn: 'Selanjutnya',
    payNowBtn: 'Bayar Sekarang',
    confirmModalTitle: 'Konfirmasi',
    confirmSubtitle: 'Pastikan data kamu sudah benar yaa!',
    confirmEmailInfo: 'Invoice dan e-Tiket akan dikirim ke alamat email berikut:',
    confirmWaInfo: 'e-Tiket juga akan dikirim melalui whatsapp dengan nomor:',
    confirmHelpInfo: 'Jika belum menerima notifikasi email setelah melakukan pembayaran hubungi:',
    btnEdit: 'Edit',
    btnUnderstand: 'Saya Mengerti'
  },
  EN: {
    headerStep1: 'Order Details',
    headerStep2: 'Payment Method',
    timerBanner: 'Please Complete Your Order Soon',
    voucherHeading: 'Voucher & Promo DISCOUNT',
    voucherPlaceholder: 'Enter voucher code (Optional)',
    voucherUse: 'Apply',
    voucherApplied: 'Voucher Applied Successfully!',
    voucherCancel: 'Cancel',
    ordererTitle: 'Orderer Details',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Enter full name as on ID',
    emailLabel: 'Email Address',
    emailPlaceholder: 'example: name@email.com',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '81234567890',
    phoneZeroError: 'Phone number should not start with 0, start directly with 8',
    fullNameRequired: 'Full name is required',
    emailRequired: 'Email address is required',
    emailInvalid: 'Invalid email format (e.g. name@email.com)',
    phoneRequired: 'Phone number is required',
    phoneInvalid: 'Invalid phone number (8-13 digits)',
    ownersTitle: 'Ticket Holder Details',
    sameAsOrdererToggle: 'Use Orderer Details',
    ticketHolderPrefix: 'Ticket Holder',
    ownerFullNameLabel: 'Owner Full Name',
    ownerFullNamePlaceholder: 'Ticket owner name as on ID',
    ownerEmailLabel: 'Owner Email Address',
    ownerEmailPlaceholder: 'example: owner.email@email.com',
    ownerPhoneLabel: 'Owner Phone Number',
    ownerFullNameRequired: 'Ticket owner full name is required',
    ownerEmailRequired: 'Ticket owner email is required',
    ownerPhoneRequired: 'Ticket owner phone is required',
    totalBillLabel: 'Total Amount Payable',
    nextBtn: 'Next',
    payNowBtn: 'Pay Now',
    confirmModalTitle: 'Confirmation',
    confirmSubtitle: 'Please make sure your details are correct!',
    confirmEmailInfo: 'Invoice and e-Ticket will be sent to this email address:',
    confirmWaInfo: 'e-Ticket will also be sent via WhatsApp to number:',
    confirmHelpInfo: 'If you haven\'t received email notification after payment, contact:',
    btnEdit: 'Edit',
    btnUnderstand: 'I Understand'
  }
};

const t = computed(() => translations[currentLang.value]);

// 2-Step Flow state: 1 = Personal Pemesan, 2 = Metode Pembayaran
const currentStep = ref(1);

// Safe fallback for display event
const displayEvent = computed(() => {
  const ev = props.event && Object.keys(props.event).length > 0 ? props.event : {};
  return {
    title: ev.title || 'sukasukaaja',
    date: ev.date || '6 Nov 2025',
    location: ev.location || 'sukasuka',
    organizer: ev.organizer || 'Kolektix Organizer',
    image: ev.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
    creatorLogo: ev.creatorLogo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80'
  };
});

// Accordion states
const isVoucherExpanded = ref(false);
const isOrdererExpanded = ref(true);

// Form data pemesan
const ordererForm = ref({
  fullName: 'Afif Prasetyo',
  email: 'afif.prasetyo@gmail.com',
  phone: '81298765432'
});

// Per-Ticket Owners List
const ticketOwnersList = ref([
  {
    id: 1,
    ticketName: 'TIKET MELAWAN ( FREE STICKER PACK )',
    priceText: '1 Tiket x Rp 100.000',
    sameAsOrderer: true,
    isExpanded: true,
    fullName: 'Afif Prasetyo',
    email: 'afif.prasetyo@gmail.com',
    phone: '81298765432'
  },
  {
    id: 2,
    ticketName: 'TIKET MELAWAN ( FREE STICKER PACK )',
    priceText: '1 Tiket x Rp 100.000',
    sameAsOrderer: true,
    isExpanded: true,
    fullName: 'Afif Prasetyo',
    email: 'afif.prasetyo@gmail.com',
    phone: '81298765432'
  },
  {
    id: 3,
    ticketName: 'TIKET MELAWAN ( FREE STICKER PACK )',
    priceText: '1 Tiket x Rp 100.000',
    sameAsOrderer: true,
    isExpanded: true,
    fullName: 'Afif Prasetyo',
    email: 'afif.prasetyo@gmail.com',
    phone: '81298765432'
  }
]);

const toggleOwnerSameAsOrderer = (owner, idx) => {
  owner.sameAsOrderer = !owner.sameAsOrderer;
  if (owner.sameAsOrderer) {
    owner.fullName = ordererForm.value.fullName;
    owner.email = ordererForm.value.email;
    owner.phone = ordererForm.value.phone;
    validateOwnerField(idx, 'fullName');
    validateOwnerField(idx, 'email');
    validateOwnerField(idx, 'phone');
  } else {
    // Reset form fields when toggle is turned OFF
    owner.fullName = '';
    owner.email = '';
    owner.phone = '';
    if (ownerErrors.value[idx]) {
      ownerErrors.value[idx] = { fullName: '', email: '', phone: '' };
    }
  }
};

// Errors state for orderer form
const ordererErrors = ref({
  fullName: '',
  email: '',
  phone: ''
});

// Errors state for ticket owners list
const ownerErrors = ref([
  { fullName: '', email: '', phone: '' },
  { fullName: '', email: '', phone: '' },
  { fullName: '', email: '', phone: '' }
]);

// Validation helpers
const validateEmailFormat = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhoneNumFormat = (phone) => {
  const clean = phone.replace(/\D/g, '');
  return clean.length >= 8 && clean.length <= 13;
};

// Validate individual orderer fields
const validateOrdererField = (field) => {
  if (field === 'fullName') {
    if (!ordererForm.value.fullName.trim()) {
      ordererErrors.value.fullName = t.value.fullNameRequired;
    } else {
      ordererErrors.value.fullName = '';
    }
  } else if (field === 'email') {
    if (!ordererForm.value.email.trim()) {
      ordererErrors.value.email = t.value.emailRequired;
    } else if (!validateEmailFormat(ordererForm.value.email.trim())) {
      ordererErrors.value.email = t.value.emailInvalid;
    } else {
      ordererErrors.value.email = '';
    }
  } else if (field === 'phone') {
    const rawVal = ordererForm.value.phone.trim();
    if (!rawVal) {
      ordererErrors.value.phone = t.value.phoneRequired;
    } else if (rawVal.startsWith('0')) {
      ordererErrors.value.phone = t.value.phoneZeroError;
    } else if (!validatePhoneNumFormat(rawVal)) {
      ordererErrors.value.phone = t.value.phoneInvalid;
    } else {
      ordererErrors.value.phone = '';
    }
  }
};

// Validate individual owner fields
const validateOwnerField = (idx, field) => {
  const owner = ticketOwnersList.value[idx];
  if (!owner) return;
  if (!ownerErrors.value[idx]) {
    ownerErrors.value[idx] = { fullName: '', email: '', phone: '' };
  }
  
  if (field === 'fullName') {
    if (!owner.fullName.trim()) {
      ownerErrors.value[idx].fullName = t.value.ownerFullNameRequired;
    } else {
      ownerErrors.value[idx].fullName = '';
    }
  } else if (field === 'email') {
    if (!owner.email.trim()) {
      ownerErrors.value[idx].email = t.value.ownerEmailRequired;
    } else if (!validateEmailFormat(owner.email.trim())) {
      ownerErrors.value[idx].email = t.value.emailInvalid;
    } else {
      ownerErrors.value[idx].email = '';
    }
  } else if (field === 'phone') {
    const rawVal = owner.phone.trim();
    if (!rawVal) {
      ownerErrors.value[idx].phone = t.value.ownerPhoneRequired;
    } else if (rawVal.startsWith('0')) {
      ownerErrors.value[idx].phone = t.value.phoneZeroError;
    } else if (!validatePhoneNumFormat(rawVal)) {
      ownerErrors.value[idx].phone = t.value.phoneInvalid;
    } else {
      ownerErrors.value[idx].phone = '';
    }
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

// Step 2 Payment Methods state
const selectedPaymentMethod = ref('bca_va');

const paymentCategories = ref([
  {
    categoryTitle: 'Virtual Account (Transfer Bank)',
    methods: [
      { id: 'bca_va', name: 'BCA Virtual Account', icon: '🏦' },
      { id: 'mandiri_va', name: 'Mandiri Virtual Account', icon: '🏦' },
      { id: 'bni_va', name: 'BNI Virtual Account', icon: '🏦' },
      { id: 'bri_va', name: 'BRI Virtual Account', icon: '🏦' },
    ]
  },
  {
    categoryTitle: 'E-Wallet & QRIS',
    methods: [
      { id: 'qris', name: 'QRIS (BCA, GoPay, OVO, ShopeePay)', icon: '📱' },
      { id: 'gopay', name: 'GoPay / GoPay Later', icon: '💳' },
      { id: 'shopeepay', name: 'ShopeePay', icon: '🛒' },
    ]
  },
  {
    categoryTitle: 'Kartu Kredit / Debit',
    methods: [
      { id: 'credit_card', name: 'Kartu Kredit / Debit Visa & MasterCard', icon: '💳' }
    ]
  }
]);

// Countdown timer (15 minutes)
const totalTimerSeconds = 15 * 60;
const timeLeftSeconds = ref(15 * 60);
let timerInterval = null;

const timerProgressPercent = computed(() => {
  return ((timeLeftSeconds.value / totalTimerSeconds) * 100).toFixed(1);
});

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

// Step Navigation
const handleHeaderBack = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1;
  } else {
    emit('back');
  }
};

// Draggable Confirmation Bottom Sheet Modal state
const isConfirmationModalOpen = ref(false);
const dragY = ref(0);
const isDragging = ref(false);
const startY = ref(0);

const onTouchStart = (e) => {
  isDragging.value = true;
  startY.value = e.touches ? e.touches[0].clientY : e.clientY;
};

const onTouchMove = (e) => {
  if (!isDragging.value) return;
  const currentY = e.touches ? e.touches[0].clientY : e.clientY;
  const delta = currentY - startY.value;
  if (delta > 0) {
    dragY.value = delta;
  }
};

const onTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (dragY.value > 90) {
    closeConfirmationModal();
  } else {
    dragY.value = 0;
  }
};

const onMouseDown = (e) => {
  onTouchStart(e);
  const onMouseMove = (moveEvent) => onTouchMove(moveEvent);
  const onMouseUp = () => {
    onTouchEnd();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const closeConfirmationModal = () => {
  isConfirmationModalOpen.value = false;
  setTimeout(() => {
    dragY.value = 0;
  }, 360);
};

const confirmAndProceedToStep2 = () => {
  closeConfirmationModal();
  currentStep.value = 2;
};

// Prevent background page touch and scroll when modal is active
watch(isConfirmationModalOpen, (isOpen) => {
  if (isOpen) {
    document.documentElement.classList.add('no-scroll-lock');
    document.body.classList.add('no-scroll-lock');
  } else {
    document.documentElement.classList.remove('no-scroll-lock');
    document.body.classList.remove('no-scroll-lock');
  }
});

const goToStep2 = () => {
  validateOrdererField('fullName');
  validateOrdererField('email');
  validateOrdererField('phone');

  let hasError = Boolean(ordererErrors.value.fullName || ordererErrors.value.email || ordererErrors.value.phone);

  ticketOwnersList.value.forEach((owner, idx) => {
    validateOwnerField(idx, 'fullName');
    validateOwnerField(idx, 'email');
    validateOwnerField(idx, 'phone');
    if (ownerErrors.value[idx]?.fullName || ownerErrors.value[idx]?.email || ownerErrors.value[idx]?.phone) {
      hasError = true;
    }
  });

  if (hasError) {
    setTimeout(() => {
      const firstErrorElem = document.querySelector('.field-text-input.has-error');
      if (firstErrorElem) {
        firstErrorElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorElem.focus();
      }
    }, 50);
    return;
  }

  // Open Draggable Confirmation Card!
  isConfirmationModalOpen.value = true;
};

const handleFinalPaymentSubmit = () => {
  emit('proceed-payment', {
    orderer: ordererForm.value,
    owners: ticketOwnersList.value,
    voucher: appliedVoucher.value,
    paymentMethod: selectedPaymentMethod.value
  });
};
</script>

<template>
  <div class="personal-buyer-page">
    <!-- Header Top Bar -->
    <div class="buyer-header">
      <button class="back-btn" @click="handleHeaderBack" title="Kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" style="width: 20px; height: 20px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>

      <h1 class="buyer-header-title">{{ currentStep === 1 ? t.headerStep1 : t.headerStep2 }}</h1>
    </div>

    <!-- Timer Banner Pill Attached Right Below Header -->
    <div class="timer-banner-pill-top">
      <div class="timer-white-circle-badge">
        <svg class="timer-progress-ring-svg" viewBox="0 0 36 36">
          <path
            class="timer-ring-bg"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            class="timer-ring-fill"
            :stroke-dasharray="`${timerProgressPercent}, 100`"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span class="timer-badge-text">{{ formattedCountdown }}</span>
      </div>
      <span class="timer-banner-text">{{ t.timerBanner }}</span>
    </div>

    <!-- Scrollable Content Area with Smooth Step Transition -->
    <transition name="step-slide-fade" mode="out-in">
      
      <!-- STEP 1: Personal Pemesan Content -->
      <div v-if="currentStep === 1" key="step1" class="buyer-content-scroll">
        
        <!-- 1. Prominent Card Event Banner -->
        <div class="event-banner-card-container">
          <div class="event-banner-hero-image">
            <img :src="displayEvent.image" :alt="displayEvent.title" class="banner-img-element" />
            <div class="banner-overlay-dark">
              <div></div> <!-- Spacer for top alignment -->
              <div class="banner-text-details">
                <h2 class="banner-title-text">{{ displayEvent.title }}</h2>
                <div class="banner-meta-info-row">
                  <span class="meta-item-badge">{{ displayEvent.date }}</span>
                  <span class="meta-dot-divider">•</span>
                  <span class="meta-item-badge">{{ displayEvent.location }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashed Divider Line -->
        <div class="dashed-section-divider"></div>

        <!-- 2. Section Voucher & Promo -->
        <div class="soft-section-block voucher-section">
          <div class="section-header-row" @click="isVoucherExpanded = !isVoucherExpanded">
            <div class="header-title-group">
              <div class="icon-circle-blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
              </div>
              <span class="card-heading-text">{{ t.voucherHeading }}</span>
            </div>

            <button class="accordion-chevron-btn" :class="{ 'rotated': isVoucherExpanded }" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#194e9e" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          <transition name="accordion-slide">
            <div v-if="isVoucherExpanded" class="section-body-content">
              <div v-if="!appliedVoucher" class="voucher-input-group">
                <input 
                  v-model="voucherCodeInput" 
                  type="text" 
                  class="field-text-input voucher-input" 
                  :placeholder="t.voucherPlaceholder" 
                />
                <button 
                  class="btn-apply-voucher" 
                  :class="{ 'disabled-btn': !voucherCodeInput.trim() }"
                  :disabled="!voucherCodeInput.trim()"
                  @click="handleApplyVoucher" 
                  type="button"
                >{{ t.voucherUse }}</button>
              </div>

              <div v-else class="voucher-applied-box">
                <div class="voucher-applied-left">
                  <span class="voucher-badge-code">{{ appliedVoucher.code }}</span>
                  <span class="voucher-badge-desc">{{ appliedVoucher.discountText }} {{ t.voucherApplied }}</span>
                </div>
                <button class="btn-remove-voucher" @click="removeVoucher" type="button">{{ t.voucherCancel }}</button>
              </div>

              <span v-if="voucherError" class="voucher-error-msg">{{ voucherError }}</span>
            </div>
          </transition>
        </div>

        <!-- Dashed Divider Line -->
        <div class="dashed-section-divider"></div>

        <!-- 3. Section Data Pemesan (Accordion) -->
        <div class="soft-section-block orderer-section">
          <div class="section-header-row" @click="isOrdererExpanded = !isOrdererExpanded">
            <div class="header-title-group">
              <div class="icon-circle-blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <span class="card-heading-text">{{ t.ordererTitle }}</span>
            </div>

            <button class="accordion-chevron-btn" :class="{ 'rotated': isOrdererExpanded }" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#494a4a" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          <transition name="accordion-slide">
            <div v-if="isOrdererExpanded" class="section-body-content">
              <div class="form-field-group">
                <label class="field-label-text">{{ t.fullNameLabel }} <span class="required-star">*</span></label>
                <input 
                  v-model="ordererForm.fullName" 
                  type="text" 
                  class="field-text-input" 
                  :class="{ 'has-error': ordererErrors.fullName }"
                  :placeholder="t.fullNamePlaceholder" 
                  @input="validateOrdererField('fullName')"
                  @blur="validateOrdererField('fullName')"
                />
                <span v-if="ordererErrors.fullName" class="field-error-text">{{ ordererErrors.fullName }}</span>
              </div>

              <div class="form-field-group">
                <label class="field-label-text">{{ t.emailLabel }} <span class="required-star">*</span></label>
                <input 
                  v-model="ordererForm.email" 
                  type="email" 
                  class="field-text-input" 
                  :class="{ 'has-error': ordererErrors.email }"
                  :placeholder="t.emailPlaceholder" 
                  @input="validateOrdererField('email')"
                  @blur="validateOrdererField('email')"
                />
                <span v-if="ordererErrors.email" class="field-error-text">{{ ordererErrors.email }}</span>
              </div>

              <div class="form-field-group">
                <label class="field-label-text">{{ t.phoneLabel }} <span class="required-star">*</span></label>
                <div class="phone-input-row">
                  <div class="country-code-selector">
                    <span class="code-text">+62</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#151416" class="chevron-icon">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  <input 
                    v-model="ordererForm.phone" 
                    type="tel" 
                    class="field-text-input" 
                    :class="{ 'has-error': ordererErrors.phone }"
                    :placeholder="t.phonePlaceholder" 
                    @input="validateOrdererField('phone')"
                    @blur="validateOrdererField('phone')"
                  />
                </div>
                <span v-if="ordererErrors.phone" class="field-error-text">{{ ordererErrors.phone }}</span>
              </div>
            </div>
          </transition>
        </div>

        <!-- 4. Section Data Pemilik Tiket Per Tiket -->
        <template v-for="(owner, idx) in ticketOwnersList" :key="owner.id">
          <!-- Dashed Divider Line -->
          <div class="dashed-section-divider"></div>
          <div class="soft-section-block owner-ticket-section">
            <div class="section-header-row" @click="owner.isExpanded = !owner.isExpanded">
              <div class="header-title-group">
                <div class="icon-circle-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 0 1 2.25 2.25v1.875a1.5 1.5 0 0 0 0 3V18a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 18v-1.875a1.5 1.5 0 0 0 0-3V8.25A2.25 2.25 0 0 1 4.5 6Z" />
                  </svg>
                </div>
                <div class="ticket-header-text-col">
                  <div class="title-marquee-wrapper">
                    <div 
                      class="title-marquee-content"
                      :class="{ 'marquee-loop-active': (`${idx + 1}. ${t.ticketHolderPrefix} ${owner.ticketName}`).length > 26 }"
                    >
                      <span class="owner-ticket-title">{{ idx + 1 }}. {{ t.ticketHolderPrefix }} {{ owner.ticketName }}</span>
                      <span v-if="(`${idx + 1}. ${t.ticketHolderPrefix} ${owner.ticketName}`).length > 26" class="owner-ticket-title">{{ idx + 1 }}. {{ t.ticketHolderPrefix }} {{ owner.ticketName }}</span>
                    </div>
                  </div>
                  <span class="owner-ticket-subtext">{{ owner.priceText }}</span>
                </div>
              </div>

              <button class="accordion-chevron-btn" :class="{ 'rotated': owner.isExpanded }" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#494a4a" style="width: 16px; height: 16px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            <transition name="accordion-slide">
              <div v-if="owner.isExpanded" class="section-body-content">
                <!-- Toggle Switch Row: Gunakan Data Pemesan -->
                <div class="toggle-same-data-row" @click="toggleOwnerSameAsOrderer(owner, idx)">
                  <span class="toggle-label-right">{{ t.sameAsOrdererToggle }}</span>
                  <div class="toggle-switch-box" :class="{ 'is-active': owner.sameAsOrderer }">
                    <div class="toggle-switch-circle"></div>
                  </div>
                </div>

                <!-- Form Inputs ALWAYS DISPLAYED -->
                <div class="owner-form-fields">
                  <div class="form-field-group">
                    <label class="field-label-text">{{ t.ownerFullNameLabel }} <span class="required-star">*</span></label>
                    <input 
                      v-model="owner.fullName" 
                      type="text" 
                      class="field-text-input" 
                      :class="{ 'has-error': ownerErrors[idx]?.fullName }"
                      :placeholder="t.ownerFullNamePlaceholder" 
                      @input="validateOwnerField(idx, 'fullName')"
                      @blur="validateOwnerField(idx, 'fullName')"
                    />
                    <span v-if="ownerErrors[idx]?.fullName" class="field-error-text">{{ ownerErrors[idx].fullName }}</span>
                  </div>

                  <div class="form-field-group">
                    <label class="field-label-text">{{ t.ownerEmailLabel }} <span class="required-star">*</span></label>
                    <input 
                      v-model="owner.email" 
                      type="email" 
                      class="field-text-input" 
                      :class="{ 'has-error': ownerErrors[idx]?.email }"
                      :placeholder="t.ownerEmailPlaceholder" 
                      @input="validateOwnerField(idx, 'email')"
                      @blur="validateOwnerField(idx, 'email')"
                    />
                    <span v-if="ownerErrors[idx]?.email" class="field-error-text">{{ ownerErrors[idx].email }}</span>
                  </div>

                  <div class="form-field-group">
                    <label class="field-label-text">{{ t.ownerPhoneLabel }} <span class="required-star">*</span></label>
                    <div class="phone-input-row">
                      <div class="country-code-selector">
                        <span class="code-text">+62</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#151416" class="chevron-icon">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                      <input 
                        v-model="owner.phone" 
                        type="tel" 
                        class="field-text-input" 
                        :class="{ 'has-error': ownerErrors[idx]?.phone }"
                        :placeholder="t.phonePlaceholder" 
                        @input="validateOwnerField(idx, 'phone')"
                        @blur="validateOwnerField(idx, 'phone')"
                      />
                    </div>
                    <span v-if="ownerErrors[idx]?.phone" class="field-error-text">{{ ownerErrors[idx].phone }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </template>

      </div>

      <!-- STEP 2: Metode Pembayaran Content -->
      <div v-else key="step2" class="buyer-content-scroll">
        
        <!-- Summary Total Payable Banner -->
        <div class="payment-total-summary-block">
          <div class="total-summary-left">
            <span class="total-summary-label">{{ t.totalBillLabel }}</span>
            <span class="total-summary-price">Rp 300.000</span>
          </div>
          <div class="total-summary-timer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#ef4444" style="width: 14px; height: 14px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>{{ formattedCountdown }}</span>
          </div>
        </div>

        <!-- Payment Categories -->
        <div 
          v-for="cat in paymentCategories" 
          :key="cat.categoryTitle"
          class="soft-section-block payment-category-section"
        >
          <span class="payment-category-title">{{ cat.categoryTitle }}</span>
          
          <div class="payment-methods-list">
            <div 
              v-for="method in cat.methods" 
              :key="method.id"
              class="payment-method-row-item"
              :class="{ 'selected': selectedPaymentMethod === method.id }"
              @click="selectedPaymentMethod = method.id"
            >
              <div class="payment-method-left">
                <span class="payment-method-icon">{{ method.icon }}</span>
                <span class="payment-method-name">{{ method.name }}</span>
              </div>
              <div class="payment-radio-circle" :class="{ 'checked': selectedPaymentMethod === method.id }">
                <div class="radio-inner-dot"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </transition>

    <!-- Fixed Bottom Sticky Action Bar -->
    <div class="buyer-bottom-sticky-bar">
      <div class="sticky-buttons-row">
        <button 
          v-if="currentStep === 1" 
          class="btn-sticky-solid-next full-flex" 
          @click="goToStep2" 
          type="button"
        >
          {{ t.nextBtn }}
        </button>

        <button 
          v-else 
          class="btn-sticky-solid-next full-flex" 
          @click="handleFinalPaymentSubmit" 
          type="button"
        >
          {{ t.payNowBtn }}
        </button>
      </div>
    </div>

    <!-- Draggable Confirmation Bottom Sheet Modal (Matching Reference Image) -->
    <transition name="sheet-slide-up">
      <div 
        v-if="isConfirmationModalOpen" 
        class="modal-backdrop-overlay"
        @click.self="closeConfirmationModal"
        @touchmove.prevent
        @scroll.prevent
        @wheel.prevent
      >
        <div 
          class="draggable-bottom-sheet-card"
          :style="{ transform: `translateY(${dragY}px)` }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @mousedown="onMouseDown"
        >
          <!-- Drag Handle Bar -->
          <div class="bottom-sheet-drag-bar">
            <div class="drag-pill-handle"></div>
          </div>

          <!-- Modal Header -->
          <div class="confirm-modal-header">
            <div class="confirm-title-left">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" class="warning-triangle-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <h3 class="confirm-title-text">{{ t.confirmModalTitle }}</h3>
            </div>
            <button class="confirm-close-btn" @click="closeConfirmationModal" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#64748b" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body Content -->
          <div class="confirm-modal-body">
            <p class="confirm-subtitle-text">{{ t.confirmSubtitle }}</p>

            <!-- Orderer Data Summary Fields -->
            <div class="confirm-data-summary-group">
              <div class="summary-item-block">
                <span class="summary-item-label">{{ t.fullNameLabel }}</span>
                <span class="summary-item-value">{{ ordererForm.fullName }}</span>
              </div>

              <div class="summary-item-block">
                <span class="summary-item-label">{{ t.emailLabel }}</span>
                <span class="summary-item-value">{{ ordererForm.email }}</span>
              </div>

              <div class="summary-item-block">
                <span class="summary-item-label">{{ t.phoneLabel }}</span>
                <span class="summary-item-value">+62{{ ordererForm.phone }}</span>
              </div>
            </div>

            <!-- Light Blue Info Card Box -->
            <div class="confirm-info-soft-box">
              <div class="info-item-row">
                <div class="number-circle-num">1</div>
                <div class="info-item-text-col">
                  <span>{{ t.confirmEmailInfo }}</span>
                  <span class="info-bold-text">{{ ordererForm.email }}</span>
                </div>
              </div>

              <div class="info-item-divider"></div>

              <div class="info-item-row">
                <div class="number-circle-num">2</div>
                <div class="info-item-text-col">
                  <span>{{ t.confirmWaInfo }}</span>
                  <span class="info-bold-text">62{{ ordererForm.phone }}</span>
                </div>
              </div>

              <div class="info-item-divider"></div>

              <div class="info-item-row">
                <div class="number-circle-num">3</div>
                <div class="info-item-text-col">
                  <span>{{ t.confirmHelpInfo }}</span>
                  <span class="info-bold-text">+62 813-2498-5355</span>
                  <span class="info-bold-text">teman@kolektix.com</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Action Buttons Sticky Footer (Matching Reference Image) -->
          <div class="confirm-modal-footer">
            <button class="btn-modal-edit-data" @click="closeConfirmationModal" type="button">
              {{ t.btnEdit }}
            </button>
            <button class="btn-modal-understand" @click="confirmAndProceedToStep2" type="button">
              {{ t.btnUnderstand }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.personal-buyer-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  font-family: var(--font-sans);
  position: relative;
  overflow-x: hidden !important;
}

/* Header Top Bar */
.buyer-header {
  display: flex;
  align-items: center;
  justify-content: center;
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
  position: absolute;
  left: 12px;
  background: transparent !important;
  border: none !important;
  cursor: pointer;
  color: #194e9e;
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  border-radius: 0 !important;
  transition: opacity 0.2s ease;
  padding: 4px;
  box-shadow: none !important;
}

.back-btn:hover {
  background-color: transparent !important;
  opacity: 0.75;
}

.back-btn:active {
  opacity: 0.5;
}

.buyer-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #151416;
  margin: 0;
  text-align: center;
}

/* Stepper Progress Bar Banner */
.stepper-progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 52px;
  z-index: 99;
  height: 46px;
  box-sizing: border-box;
}

/* Timer Banner Pill attached directly below Header */
.timer-banner-pill-top {
  width: 100%;
  height: 48px;
  background-color: #194e9e;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-sizing: border-box;
  padding: 0 16px;
  position: sticky;
  top: 52px;
  z-index: 99;
  box-shadow: 0 2px 8px rgba(25, 78, 158, 0.15);
}

.stepper-step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.step-badge-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #494a4a;
  transition: all 0.2s ease;
}

.stepper-step-item.is-active .step-badge-circle {
  background-color: #194e9e;
  color: #ffffff;
  border-color: #194e9e;
  font-weight: 600;
}

.step-badge-text {
  font-size: 13px;
  font-weight: 500;
  color: #151416;
  white-space: nowrap;
}

.stepper-arrow-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

/* Scroll Content */
.buyer-content-scroll {
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px 16px 140px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: #ffffff;
}

/* Dashed Section Divider Line */
.dashed-section-divider {
  width: 100%;
  height: 1px;
  border-bottom: 1.5px dashed #e2e8f0;
  margin: 4px 0;
  display: block;
}

/* Section Container (Card Box Removed) */
.soft-section-block {
  background-color: transparent !important;
  border-radius: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: none !important;
  box-shadow: none !important;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  user-select: none;
}

.section-header-row.no-cursor {
  cursor: default;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  max-width: 85%;
}

.ticket-header-text-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  overflow: hidden;
  text-align: left;
  width: 100%;
}

/* Marquee Loop for Long Ticket Owner Titles */
.title-marquee-wrapper {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.title-marquee-content {
  display: inline-block;
  white-space: nowrap;
}

.title-marquee-content.marquee-loop-active {
  display: inline-flex;
  gap: 24px;
  animation: titleMarqueeLoop 12s linear infinite;
}

.title-marquee-content.marquee-loop-active:hover {
  animation-play-state: paused;
}

@keyframes titleMarqueeLoop {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.owner-ticket-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #151416;
  line-height: 1.3;
  white-space: nowrap;
}

.owner-ticket-subtext {
  font-size: 11.5px;
  font-weight: 400;
  color: #494a4a;
}

/* Icon Circle Blue - Background & Border Removed (Pure Icon Only) */
.icon-circle-blue {
  width: auto !important;
  height: auto !important;
  border-radius: 0 !important;
  background-color: transparent !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0 !important;
}

.card-icon {
  width: 19px;
  height: 19px;
  color: #194e9e;
  border: none !important;
  outline: none !important;
}

.card-heading-text {
  font-size: 14px;
  font-weight: 600;
  color: #151416;
}

.accordion-chevron-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.accordion-chevron-btn.rotated {
  transform: rotate(180deg);
}

.section-body-content {
  padding-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Prominent Event Banner Container (No Card Border, 4-Corner Rounded 8px) */
.event-banner-card-container {
  width: 100% !important;
  min-height: 130px !important;
  border-radius: 8px !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  margin: 4px 0 !important;
  box-sizing: border-box !important;
}

.event-banner-hero-image {
  width: 100% !important;
  height: 130px !important;
  min-height: 130px !important;
  position: relative !important;
  overflow: hidden !important;
  border-radius: 8px !important;
  background-color: #194e9e !important;
}

.banner-img-element {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  border-radius: 8px !important;
}

.banner-overlay-dark {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.92) 100%) !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-end !important;
  padding: 12px 14px !important;
  box-sizing: border-box !important;
}

.banner-text-details {
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
  text-align: left !important;
}

.banner-title-text {
  font-size: 13.5px !important;
  font-weight: 600 !important;
  color: #ffffff !important;
  margin: 0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1.25 !important;
}

.banner-meta-info-row {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  font-size: 10px !important;
  color: #e2e8f0 !important;
  font-weight: 400 !important;
}

.meta-item-badge {
  display: flex !important;
  align-items: center !important;
}

.meta-dot-divider {
  opacity: 0.6 !important;
}

.organizer-banner-inside-row {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  margin-top: 4px !important;
}

.organizer-avatar-circle {
  width: 20px !important;
  height: 20px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.organizer-details-text {
  display: flex !important;
  flex-direction: column !important;
  text-align: left !important;
  gap: 0px !important;
}

.organizer-small-label {
  font-size: 7px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 400 !important;
  line-height: 1 !important;
}

.organizer-name-row {
  display: flex !important;
  align-items: center !important;
  gap: 3px !important;
}

.organizer-main-name {
  font-size: 10.5px !important;
  font-weight: 600 !important;
  color: #ffffff !important;
  line-height: 1.2 !important;
}

.organizer-verified-icon {
  width: 12px !important;
  height: 12px !important;
  color: #60a5fa !important;
  flex-shrink: 0 !important;
}

/* Voucher Section */
.voucher-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.voucher-input {
  flex: 1;
}

.btn-apply-voucher {
  height: 42px;
  padding: 0 16px;
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.btn-apply-voucher:hover:not(:disabled) {
  background-color: #0d3e91;
}

.btn-apply-voucher.disabled-btn,
.btn-apply-voucher:disabled {
  background-color: #e2e8f0 !important;
  color: #94a3b8 !important;
  cursor: not-allowed !important;
}

.voucher-applied-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #eff6ff;
  padding: 10px 14px;
  border-radius: 8px;
}

.voucher-applied-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voucher-badge-code {
  font-size: 12px;
  font-weight: 600;
  color: #194e9e;
  background-color: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
}

.voucher-badge-desc {
  font-size: 11.5px;
  font-weight: 500;
  color: #151416;
}

.btn-remove-voucher {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.voucher-error-msg {
  font-size: 11px;
  color: #ef4444;
  font-weight: 500;
}

/* Form Fields & Validation Alert Styling */
.form-field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  text-align: left;
}

.field-label-text {
  font-size: 12px;
  font-weight: 600;
  color: #151416;
  display: flex;
  align-items: center;
}

.required-star {
  color: #ef4444;
  font-weight: 600;
  margin-left: 2px;
}

.phone-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.country-code-selector {
  height: 42px;
  padding: 0 10px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #151416;
  flex-shrink: 0;
  user-select: none;
}

.country-code-selector .code-text {
  font-size: 13px;
  font-weight: 500;
  color: #151416;
}

.country-code-selector .chevron-icon {
  width: 12px;
  height: 12px;
  color: #151416;
}

.field-text-input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  color: #151416;
  outline: none;
  background-color: #ffffff;
  box-sizing: border-box;
  transition: all 0.2s ease;
  font-family: var(--font-sans);
}

.field-text-input.has-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
}

.field-error-text {
  font-size: 11px;
  color: #ef4444;
  font-weight: 500;
  margin-top: 2px;
  text-align: left;
}

.field-text-input:focus {
  border-color: #194e9e;
  box-shadow: 0 0 0 3px rgba(25, 78, 158, 0.12);
}

.field-text-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

/* Per Ticket Toggle Switch Row */
.toggle-same-data-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 2px 0 6px 0;
  cursor: pointer;
  user-select: none;
}

.toggle-label-right {
  font-size: 13px;
  font-weight: 500;
  color: #494a4a;
}

.toggle-switch-box {
  width: 44px;
  height: 24px;
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
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle-switch-box.is-active .toggle-switch-circle {
  transform: translateX(20px);
}

.owner-form-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

/* Step 2 Payment Method Screen Styles */
.payment-total-summary-block {
  background-color: #eff6ff;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total-summary-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.total-summary-label {
  font-size: 11px;
  font-weight: 400;
  color: #494a4a;
}

.total-summary-price {
  font-size: 16px;
  font-weight: 700;
  color: #194e9e;
}

.total-summary-timer {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #fee2e2;
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.payment-category-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-category-title {
  font-size: 13px;
  font-weight: 600;
  color: #151416;
  text-align: left;
}

.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-method-row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method-row-item.selected {
  background-color: #eff6ff;
}

.payment-method-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-method-icon {
  font-size: 16px;
}

.payment-method-name {
  font-size: 13px;
  font-weight: 500;
  color: #151416;
}

.payment-radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.payment-radio-circle.checked {
  border-color: #194e9e;
  background-color: #194e9e;
}

.radio-inner-dot {
  width: 6px;
  height: 6px;
  background-color: #ffffff;
  border-radius: 50%;
}

/* Sleek, Simple, and Compact Bottom Sticky Bar */
.buyer-bottom-sticky-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 8px 12px 10px 12px;
  box-sizing: border-box;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.12);
}



.timer-white-circle-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.16);
  flex-shrink: 0;
  position: relative;
}

.timer-progress-ring-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
}

.timer-ring-bg {
  fill: none;
  stroke: #cbd5e1;
  stroke-width: 3.6;
}

.timer-ring-fill {
  fill: none;
  stroke: #2563eb;
  stroke-width: 4.2;
  stroke-linecap: round;
  transition: stroke-dasharray 1s linear;
}

.timer-badge-text {
  font-size: 8.5px;
  font-weight: 600;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
  letter-spacing: -0.3px;
  z-index: 2;
  line-height: 1;
}

.timer-banner-text {
  font-size: 15.8px;
  font-weight: 300;
  color: #ffffff;
  white-space: nowrap;
}

.sticky-buttons-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.btn-sticky-outline-back {
  flex: 1;
  width: 100%;
  height: 40px;
  background-color: #ffffff;
  border: 1.5px solid #194e9e;
  border-radius: 8px;
  color: #194e9e;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-sticky-outline-back:active {
  background-color: #eff6ff;
}

.btn-sticky-solid-next.full-flex {
  width: 100%;
  height: 44px;
  background-color: #194e9e;
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(25, 78, 158, 0.25);
}

.btn-sticky-solid-next.full-flex:active {
  background-color: #0d3e91;
}

/* Draggable Confirmation Bottom Sheet Modal Styling (Matching Reference Image) */
.modal-backdrop-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.55);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(2px);
  touch-action: none;
  overscroll-behavior: contain;
}

.draggable-bottom-sheet-card {
  width: 100%;
  max-width: 480px;
  height: auto;
  max-height: 94vh;
  background-color: #ffffff;
  border-radius: 12px 12px 0 0;
  padding: 10px 16px 0 16px;
  box-sizing: border-box;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2);
  touch-action: pan-y;
  position: relative;
}

.bottom-sheet-drag-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 4px;
  cursor: grab;
}

.drag-pill-handle {
  width: 40px;
  height: 5px;
  background-color: #cbd5e1;
  border-radius: 10px;
}

.confirm-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.confirm-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-triangle-icon {
  width: 22px;
  height: 22px;
  color: #194e9e;
  flex-shrink: 0;
}

.confirm-title-text {
  font-size: 16px;
  font-weight: 600;
  color: #151416;
  margin: 0;
}

.confirm-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-modal-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.confirm-subtitle-text {
  font-size: 13px;
  color: #151416;
  margin: 0 0 2px 0;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.1px;
}

.confirm-data-summary-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-item-label {
  font-size: 11.5px;
  color: #151416;
  font-weight: 600;
}

.summary-item-value {
  font-size: 13.5px;
  font-weight: 500;
  color: #151416;
}

.confirm-info-soft-box {
  background-color: #f0f7ff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.number-circle-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #194e9e;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.info-item-text-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #151416;
  font-weight: 600;
  line-height: 1.35;
}

.info-bold-text {
  font-weight: 500;
  color: #151416;
}

.info-item-divider {
  height: 1px;
  background-color: #e2e8f0;
  width: 100%;
}

/* Modal Action Buttons Footer (Matching Reference Image Exactly) */
.confirm-modal-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 14px 16px 16px 16px;
  margin: 10px -16px 0 -16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 20;
}

.btn-modal-edit-data {
  flex: 1;
  width: 100%;
  height: 42px;
  border: 1.5px solid #194e9e;
  background-color: #ffffff;
  color: #194e9e;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-modal-edit-data:active {
  background-color: #eff6ff;
}

.btn-modal-understand {
  flex: 1;
  width: 100%;
  height: 42px;
  border: none;
  background-color: #194e9e;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(25, 78, 158, 0.2);
  transition: all 0.15s ease;
}

.btn-modal-understand:active {
  background-color: #0d3e91;
}

/* Smooth Slide Up/Down Animation for Bottom Sheet */
.sheet-slide-up-enter-active {
  transition: opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-slide-up-leave-active {
  transition: opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.sheet-slide-up-enter-active .draggable-bottom-sheet-card {
  transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-slide-up-leave-active .draggable-bottom-sheet-card {
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.sheet-slide-up-enter-from,
.sheet-slide-up-leave-to {
  opacity: 0;
}

.sheet-slide-up-enter-from .draggable-bottom-sheet-card,
.sheet-slide-up-leave-to .draggable-bottom-sheet-card {
  transform: translateY(100%) !important;
}

.modal-backdrop-fade-enter-from,
.modal-backdrop-fade-leave-to {
  opacity: 0;
}

/* Smooth Slide & Expand Transition for Back Button */
.btn-slide-expand-enter-active,
.btn-slide-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 50%;
  opacity: 1;
  transform: translateX(0);
}

.btn-slide-expand-enter-from,
.btn-slide-expand-leave-to {
  max-width: 0;
  opacity: 0;
  transform: translateX(-15px);
  margin-right: -10px;
  padding-left: 0;
  padding-right: 0;
}

/* Accordion Transition Animation */
.accordion-slide-enter-active,
.accordion-slide-leave-active {
  transition: all 0.25s ease-in-out;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.accordion-slide-enter-from,
.accordion-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  overflow: hidden;
}

/* Smooth Step Slide & Fade Transition Animation */
.step-slide-fade-enter-active,
.step-slide-fade-leave-active {
  transition: all 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-fade-enter-from {
  opacity: 0;
  transform: translateX(36px);
}

.step-slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-36px);
}

@media (max-width: 480px) {
  .personal-buyer-page {
    width: 100vw;
  }
}
</style>
