<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['back']);

const currentStep = ref(1);

// Main Wizard Form Errors
const formErrors = ref({
  banner: '',
  name: '',
  tags: '',
  date: '',
  time: '',
  location: '',
  tickets: '',
  description: '',
  terms: ''
});

// Step 1: Basic Information States
const eventName = ref('');
const selectedTags = ref([]);
const showTagsDropdown = ref(false);

const openTagsDropdown = () => { showTagsDropdown.value = true; };
const closeTagsDropdown = () => { setTimeout(() => { showTagsDropdown.value = false; }, 120); };

const availableTags = [
  { label: 'Musik', color: '#E05C1A' },
  { label: 'Olahraga', color: '#194E9E' },
  { label: 'Seni', color: '#7C3AED' },
  { label: 'Teknologi', color: '#0891B2' },
  { label: 'Talkshow', color: '#2563EB' },
  { label: 'Seminar', color: '#374151' },
  { label: 'Fashion', color: '#DB2777' },
  { label: 'Wisata', color: '#059669' },
  { label: 'Kuliner', color: '#D97706' },
  { label: 'Religi', color: '#7C3AED' },
  { label: 'Standup', color: '#e52424' },
  { label: 'Hiburan', color: '#EA580C' },
  { label: 'Pendidikan', color: '#0284C7' },
  { label: 'Budaya', color: '#16A34A' },
  { label: 'Komunitas', color: '#B45309' },
];
const eventDate = ref('');
const eventTime = ref('');
const eventLocation = ref('');
const bannerImage = ref(null);
const fileInput = ref(null);

// Date, Time, Location picker states (simple simulations)
const showDatePicker = ref(false);
const showTimePicker = ref(false);
const showLocationPicker = ref(false);

const dateInputVal = ref('');
const timeInputVal = ref('');
const locationInputVal = ref('');

// Step 2: Ticket Settings States
const tickets = ref([]);
const showTicketModal = ref(false);
const showTicketFormInline = ref(false);

// Ticket Form Modal States
const ticketCategory = ref('Festival'); // 'Festival' | 'Seat'
const ticketType = ref('Berbayar'); // 'Berbayar' | 'Gratis'
const ticketName = ref('');
const ticketDate = ref('');
const ticketStartSaleDate = ref('');
const ticketEndSaleDate = ref('');
const ticketStartSaleTime = ref('00:00');
const ticketEndSaleTime = ref('00:00');
const ticketPrice = ref(0);
const ticketQty = ref('');
const ticketPromo = ref(false);
const ticketPromoText = ref('');
const ticketBundling = ref(false);
const ticketBundlingText = ref('');
const ticketDescription = ref('');

// Step 2 Checklist States
const formKtp = ref(true);
const formTanggalLahir = ref(false);
const formJenisKelamin = ref(false);
const formAsisten = ref(false);
const formProfesi = ref(false);
const formPerusahaan = ref(false);

// Step 2 Ticket Settings Toggles
const maxTicketsPerTx = ref(1);
const limitOneEmail = ref(false);
const limitOneTicketPerData = ref(false);

// Step 3: Session States
const isSessionActive = ref(false);

// Step 4: Description & Terms States
const descriptionText = ref('');
const termsText = ref('');

// Helper Methods
const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      bannerImage.value = event.target.result;
      formErrors.value.banner = '';
    };
    reader.readAsDataURL(file);
  }
};

const removeBanner = () => {
  bannerImage.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const saveDatePicker = () => {
  if (dateInputVal.value) {
    eventDate.value = dateInputVal.value;
    formErrors.value.date = '';
  }
  showDatePicker.value = false;
};

const saveTimePicker = () => {
  if (timeInputVal.value) {
    eventTime.value = timeInputVal.value;
    formErrors.value.time = '';
  }
  showTimePicker.value = false;
};

const saveLocationPicker = () => {
  if (locationInputVal.value) {
    eventLocation.value = locationInputVal.value;
    formErrors.value.location = '';
  }
  showLocationPicker.value = false;
};

const ticketErrors = ref({
  name: '',
  date: '',
  startSaleDate: '',
  endSaleDate: '',
  startSaleTime: '',
  endSaleTime: '',
  price: '',
  qty: ''
});

const openAddTicket = () => {
  // Reset modal fields
  ticketName.value = '';
  ticketDate.value = '';
  ticketStartSaleDate.value = '';
  ticketEndSaleDate.value = '';
  ticketStartSaleTime.value = '00:00';
  ticketEndSaleTime.value = '00:00';
  ticketPrice.value = 0;
  ticketQty.value = '';
  ticketPromo.value = false;
  ticketPromoText.value = '';
  ticketBundling.value = false;
  ticketBundlingText.value = '';
  ticketDescription.value = '';
  
  // Clear validation errors
  ticketErrors.value = {
    name: '',
    date: '',
    startSaleDate: '',
    endSaleDate: '',
    startSaleTime: '',
    endSaleTime: '',
    price: '',
    qty: ''
  };
  
  showTicketFormInline.value = true;
};

const saveTicket = () => {
  // Reset errors
  ticketErrors.value = {
    name: '',
    date: '',
    startSaleDate: '',
    endSaleDate: '',
    startSaleTime: '',
    endSaleTime: '',
    price: '',
    qty: ''
  };
  
  let hasError = false;
  if (!ticketName.value) {
    ticketErrors.value.name = 'Nama tiket wajib diisi';
    hasError = true;
  }
  if (!ticketDate.value) {
    ticketErrors.value.date = 'Tanggal event wajib diisi';
    hasError = true;
  }
  if (!ticketStartSaleDate.value) {
    ticketErrors.value.startSaleDate = 'Tanggal mulai penjualan wajib diisi';
    hasError = true;
  }
  if (!ticketEndSaleDate.value) {
    ticketErrors.value.endSaleDate = 'Tanggal berakhir penjualan wajib diisi';
    hasError = true;
  }
  if (!ticketStartSaleTime.value) {
    ticketErrors.value.startSaleTime = 'Jam mulai penjualan wajib diisi';
    hasError = true;
  }
  if (!ticketEndSaleTime.value) {
    ticketErrors.value.endSaleTime = 'Jam berakhir penjualan wajib diisi';
    hasError = true;
  }
  if (ticketType.value === 'Berbayar' && (ticketPrice.value === '' || ticketPrice.value === null)) {
    ticketErrors.value.price = 'Harga tiket wajib diisi';
    hasError = true;
  }
  if (!ticketQty.value) {
    ticketErrors.value.qty = 'Jumlah tiket wajib diisi';
    hasError = true;
  }
  
  if (hasError) {
    return;
  }
  
  tickets.value.push({
    id: Date.now(),
    category: ticketCategory.value,
    type: ticketType.value,
    name: ticketName.value,
    date: ticketDate.value,
    price: ticketType.value === 'Gratis' ? 0 : ticketPrice.value,
    qty: ticketQty.value,
    description: ticketDescription.value
  });
  
  showTicketFormInline.value = false;
};

const removeTicket = (id) => {
  tickets.value = tickets.value.filter(t => t.id !== id);
};

const handleBack = () => {
  if (showTicketFormInline.value) {
    showTicketFormInline.value = false;
  } else if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    emit('back');
  }
};

const handleSaveDraft = () => {
  // Build event data for draft
  const firstTicket = tickets.value[0];
  const priceStr = firstTicket
    ? (firstTicket.type === 'Gratis' ? 'Gratis' : `Rp ${Number(firstTicket.price).toLocaleString('id-ID')}`)
    : 'Gratis';
  const totalQty = tickets.value.reduce((sum, t) => sum + (Number(t.qty) || 0), 0);

  const newEvent = {
    id: Date.now(),
    title: eventName.value || 'Event Baru',
    price: priceStr,
    organizer: 'Kreator Anda',
    creatorLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
    location: eventLocation.value || 'TBA',
    date: eventDate.value || '-',
    sold: 0,
    total: totalQty || 100,
    status: 'Draft',
    image: bannerImage.value || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80'
  };
  emit('back', 'draft', newEvent);
};

const clearFormErrors = () => {
  formErrors.value = {
    banner: '',
    name: '',
    tags: '',
    date: '',
    time: '',
    location: '',
    tickets: '',
    description: '',
    terms: ''
  };
};

const handleNextStep = () => {
  clearFormErrors();

  if (currentStep.value === 1) {
    let hasError = false;

    if (!bannerImage.value) {
      formErrors.value.banner = 'Foto banner event wajib diunggah';
      hasError = true;
    }
    if (!eventName.value.trim()) {
      formErrors.value.name = 'Nama event wajib diisi';
      hasError = true;
    } else if (eventName.value.trim().length < 3) {
      formErrors.value.name = 'Nama event minimal 3 karakter';
      hasError = true;
    }
    if (selectedTags.value.length === 0) {
      formErrors.value.tags = 'Pilih minimal 1 tag event';
      hasError = true;
    }
    if (!eventDate.value) {
      formErrors.value.date = 'Tanggal event wajib dipilih';
      hasError = true;
    }
    if (!eventTime.value) {
      formErrors.value.time = 'Waktu event wajib dipilih';
      hasError = true;
    }
    if (!eventLocation.value.trim()) {
      formErrors.value.location = 'Alamat event wajib diisi';
      hasError = true;
    }

    if (hasError) return;
    currentStep.value = 2;

  } else if (currentStep.value === 2) {
    let hasError = false;

    if (tickets.value.length === 0) {
      formErrors.value.tickets = 'Minimal 1 tiket harus dibuat sebelum melanjutkan';
      hasError = true;
    }

    if (hasError) return;
    currentStep.value = 3;

  } else if (currentStep.value === 3) {
    // Session settings — no mandatory fields, just proceed
    currentStep.value = 4;

  } else if (currentStep.value === 4) {
    let hasError = false;

    if (!descriptionText.value.trim()) {
      formErrors.value.description = 'Deskripsi event wajib diisi';
      hasError = true;
    }
    if (!termsText.value.trim()) {
      formErrors.value.terms = 'Syarat & Ketentuan wajib diisi';
      hasError = true;
    }

    if (hasError) return;

    // Build event data for publish
    const firstTicket = tickets.value[0];
    const priceStr = firstTicket
      ? (firstTicket.type === 'Gratis' ? 'Gratis' : `Rp ${Number(firstTicket.price).toLocaleString('id-ID')}`)
      : 'Gratis';
    const totalQty = tickets.value.reduce((sum, t) => sum + (Number(t.qty) || 0), 0);

    const newEvent = {
      id: Date.now(),
      title: eventName.value,
      price: priceStr,
      organizer: 'Kreator Anda',
      creatorLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
      location: eventLocation.value || 'TBA',
      date: eventDate.value || '-',
      sold: 0,
      total: totalQty || 100,
      status: 'Upcoming',
      image: bannerImage.value || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'
    };

    emit('back', 'publish', newEvent);
  }
};

// Clear main form errors reactively as user fills in values
watch(bannerImage, (val) => { if (val) formErrors.value.banner = ''; });
watch(eventName, (val) => { if (val.trim()) formErrors.value.name = ''; });
watch(selectedTags, (val) => { if (val.length > 0) formErrors.value.tags = ''; }, { deep: true });
watch(eventDate, (val) => { if (val) formErrors.value.date = ''; });
watch(eventTime, (val) => { if (val) formErrors.value.time = ''; });
watch(eventLocation, (val) => { if (val.trim()) formErrors.value.location = ''; });
watch(tickets, (val) => { if (val.length > 0) formErrors.value.tickets = ''; }, { deep: true });
watch(descriptionText, (val) => { if (val.trim()) formErrors.value.description = ''; });
watch(termsText, (val) => { if (val.trim()) formErrors.value.terms = ''; });

// Clear ticket field errors reactively as user fills in values
watch(ticketName, (val) => { if (val) ticketErrors.value.name = ''; });
watch(ticketDate, (val) => { if (val) ticketErrors.value.date = ''; });
watch(ticketStartSaleDate, (val) => { if (val) ticketErrors.value.startSaleDate = ''; });
watch(ticketEndSaleDate, (val) => { if (val) ticketErrors.value.endSaleDate = ''; });
watch(ticketStartSaleTime, (val) => { if (val) ticketErrors.value.startSaleTime = ''; });
watch(ticketEndSaleTime, (val) => { if (val) ticketErrors.value.endSaleTime = ''; });
watch(ticketPrice, (val) => { if (val !== '' && val !== null) ticketErrors.value.price = ''; });
watch(ticketQty, (val) => { if (val) ticketErrors.value.qty = ''; });
</script>

<template>
  <div class="create-event-page">
    <!-- Header -->
    <header class="create-header">
      <button class="header-back-btn" @click="handleBack">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="header-back-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>
      <h2 class="header-title">Create Event</h2>
      <button class="header-draft-btn-icon" @click="handleSaveDraft" title="Save Draft">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="header-draft-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-8H7v8" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 3v5h8" />
        </svg>
      </button>
    </header>

    <!-- Content Body -->
    <div class="create-body">
      <!-- Step Indicator Section -->
      <div class="step-indicator-wrapper">
        <div class="step-labels-row">
          <span class="step-number-text">STEP {{ currentStep }} OF 4</span>
          <span class="step-name-text">
            {{ 
              currentStep === 1 ? 'Basic Information' :
              currentStep === 2 ? 'Ticket Settings' :
              currentStep === 3 ? 'Session Settings' :
              'Description & Terms'
            }}
          </span>
        </div>
        <div class="step-bars-row">
          <div class="step-bar-segment" :class="{ active: currentStep >= 1 }"></div>
          <div class="step-bar-segment" :class="{ active: currentStep >= 2 }"></div>
          <div class="step-bar-segment" :class="{ active: currentStep >= 3 }"></div>
          <div class="step-bar-segment" :class="{ active: currentStep >= 4 }"></div>
        </div>
      </div>

      <!-- ======= STEP 1: BASIC INFORMATION ======= -->
      <div class="create-form-container" v-if="currentStep === 1">
        <!-- Event Banner Dropzone -->
        <div class="form-group">
          <label class="form-label">Event Banner</label>
          <div 
            class="banner-dropzone" 
            :class="{ 'has-image': bannerImage }"
            @click="triggerFileSelect"
          >
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden-file-input" 
              accept="image/*"
              @change="handleFileChange"
            />
            <template v-if="bannerImage">
              <img :src="bannerImage" alt="Event Banner Preview" class="banner-preview-img" />
              <button class="remove-banner-btn" @click.stop="removeBanner" title="Hapus Banner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="remove-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="upload-cloud-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <p class="upload-main-text">Click to upload or drag and drop</p>
              <p class="upload-sub-text">SVG, PNG, JPG or GIF (max. 5MB). 16:9 ratio recommended.</p>
            </template>
          </div>
          <span class="field-error-message" v-if="formErrors.banner">{{ formErrors.banner }}</span>
        </div>

        <!-- Event Name Input -->
        <div class="form-group">
          <label class="form-label">Nama Event</label>
          <input 
            type="text" 
            v-model="eventName" 
            class="form-text-input text-field-mock" 
            placeholder="Nama Event" 
          />
          <span class="field-error-message" v-if="formErrors.name">{{ formErrors.name }}</span>
        </div>

        <!-- Tags Multi-Select Picker -->
        <div class="form-group tags-picker-group">
          <label class="form-label">Tag</label>
          <!-- Selected tags chip bar (acts as the trigger) -->
          <div
            class="tags-chip-bar"
            :class="{ 'has-chips': selectedTags.length > 0, 'focused': showTagsDropdown }"
            @click="openTagsDropdown"
          >
            <div class="selected-chips-wrap" v-if="selectedTags.length > 0">
              <span
                v-for="tag in selectedTags"
                :key="tag.label"
                class="tag-chip selected-chip"
              >
                {{ tag.label }}
                <button class="chip-remove-btn" @click.stop="selectedTags = selectedTags.filter(t => t.label !== tag.label)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="12" height="12" class="chip-remove-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <span class="tags-chip-placeholder" v-else>Pilih kategori event...</span>
          </div>
          <!-- Available tags dropdown (animated) -->
          <Transition name="tags-fade">
            <div class="tags-options-list" v-if="showTagsDropdown" @mouseleave="closeTagsDropdown">
              <button
                v-for="tag in availableTags"
                :key="tag.label"
                type="button"
                class="tag-option-btn"
                :class="{ 'tag-option-selected': selectedTags.some(t => t.label === tag.label) }"
                @click="selectedTags.some(t => t.label === tag.label)
                  ? (selectedTags = selectedTags.filter(t => t.label !== tag.label))
                  : selectedTags.push(tag)"
              >
                <svg v-if="selectedTags.some(t => t.label === tag.label)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" class="tag-check-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span v-else class="tag-check-placeholder"></span>
                {{ tag.label }}
              </button>
            </div>
          </Transition>
          <span class="field-error-message" v-if="formErrors.tags">{{ formErrors.tags }}</span>
        </div>

        <!-- Selection Interactive Rows (Tanggal, Waktu, Alamat) -->
        <div class="form-group">
          <label class="form-label">Detail Waktu & Lokasi</label>
          <div class="interactive-picker-list">
            <!-- Date Row -->
            <div class="picker-row" @click="showDatePicker = true">
              <div class="picker-left">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="picker-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <span class="picker-text">{{ eventDate || 'Atur Tanggal Event' }}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="picker-chevron">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <span class="field-error-message" v-if="formErrors.date">{{ formErrors.date }}</span>

            <!-- Time Row -->
            <div class="picker-row" @click="showTimePicker = true">
              <div class="picker-left">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="picker-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span class="picker-text">{{ eventTime || 'Atur Waktu Event' }}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="picker-chevron">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <span class="field-error-message" v-if="formErrors.time">{{ formErrors.time }}</span>

            <!-- Location Row -->
            <div class="picker-row location-picker-row" @click="showLocationPicker = true">
              <div class="picker-left location-picker-left">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="picker-icon location-picker-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25g9 9 0 0 1 18 0Z" />
                </svg>
                <span class="picker-text location-picker-text">{{ eventLocation || 'Atur Alamat Event' }}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="picker-chevron location-picker-chevron">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <span class="field-error-message" v-if="formErrors.location">{{ formErrors.location }}</span>
          </div>
        </div>
    </div>

      <!-- ======= STEP 2: TICKET SETTINGS (DEFAULT VIEW) ======= -->
      <div class="step-layout-container" v-if="currentStep === 2 && !showTicketFormInline">
        
        <!-- Tiket Section -->
        <div class="form-group-block">
          <label class="form-label section-label">Tiket</label>
          <div class="step-card-section ticket-card-style">
            <!-- Tickets List -->
            <div class="created-tickets-list" v-if="tickets.length > 0">
              <div v-for="t in tickets" :key="t.id" class="created-ticket-item">
                <div class="ticket-item-left">
                  <span class="ticket-item-badge" :class="t.type.toLowerCase()">{{ t.category }} · {{ t.type }}</span>
                  <span class="ticket-item-name">{{ t.name }}</span>
                  <span class="ticket-item-price" v-if="t.type !== 'Gratis'">Rp {{ Number(t.price).toLocaleString('id-ID') }}</span>
                  <span class="ticket-item-price free" v-else>Gratis</span>
                </div>
                <button class="delete-ticket-btn" @click="removeTicket(t.id)" title="Hapus Tiket">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="delete-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Trigger Button Inside Card -->
            <div class="ticket-add-trigger-wrapper" :class="{ empty: tickets.length === 0 }">
              <button class="add-ticket-trigger-btn-icon" @click="openAddTicket" title="Tambah Tiket">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="add-btn-icon-svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <span class="ticket-trigger-helper-text" v-if="tickets.length === 0">Belum ada tiket. Klik "+" untuk membuat tiket baru.</span>
            </div>
          </div>
          <span class="field-error-message" v-if="formErrors.tickets">{{ formErrors.tickets }}</span>
        </div>

        <!-- Formulir Data Pemesan Section -->
        <div class="form-group-block">
          <label class="form-label section-label">Formulir Data Pemesan</label>
          <div class="step-card-section">
            <div class="checklist-grid">
            <label class="checklist-item disabled">
              <input type="checkbox" checked disabled class="hidden-checkbox" />
              <span class="custom-checkbox checked disabled">✓</span>
              <span class="checklist-label">Nama Lengkap</span>
            </label>
            <label class="checklist-item disabled">
              <input type="checkbox" checked disabled class="hidden-checkbox" />
              <span class="custom-checkbox checked disabled">✓</span>
              <span class="checklist-label">Email</span>
            </label>
            <label class="checklist-item disabled">
              <input type="checkbox" checked disabled class="hidden-checkbox" />
              <span class="custom-checkbox checked disabled">✓</span>
              <span class="checklist-label">No. Handphone</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" v-model="formKtp" class="hidden-checkbox" />
              <span class="custom-checkbox" :class="{ checked: formKtp }">✓</span>
              <span class="checklist-label">No. KTP</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" v-model="formTanggalLahir" class="hidden-checkbox" />
              <span class="custom-checkbox" :class="{ checked: formTanggalLahir }">✓</span>
              <span class="checklist-label">Tanggal Lahir</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" v-model="formJenisKelamin" class="hidden-checkbox" />
              <span class="custom-checkbox" :class="{ checked: formJenisKelamin }">✓</span>
              <span class="checklist-label">Jenis Kelamin</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" v-model="formAsisten" class="hidden-checkbox" />
              <span class="custom-checkbox" :class="{ checked: formAsisten }">✓</span>
              <span class="checklist-label">Asisten</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" v-model="formProfesi" class="hidden-checkbox" />
              <span class="custom-checkbox" :class="{ checked: formProfesi }">✓</span>
              <span class="checklist-label">Profesi</span>
            </label>
            <label class="checklist-item">
              <input type="checkbox" v-model="formPerusahaan" class="hidden-checkbox" />
              <span class="custom-checkbox" :class="{ checked: formPerusahaan }">✓</span>
              <span class="checklist-label">Perusahaan</span>
            </label>
          </div>
        </div>
      </div>

        <!-- Pengaturan Tiket Section -->
        <div class="form-group-block">
          <label class="form-label section-label">Pengaturan Tiket</label>
          <div class="step-card-section">
          
          <!-- Dropdown Row -->
          <div class="ticket-setting-row dropdown-type">
            <div class="setting-row-left">
              <span class="setting-row-main">Jumlah maks. tiket dalam 1 transaksi</span>
              <span class="setting-row-sub">Jumlah maksimal tiket yang dapat dibeli dalam 1 transaksi</span>
            </div>
            <div class="setting-select-box">
              <select v-model="maxTicketsPerTx" class="setting-select">
                <option :value="1">1 Tiket</option>
                <option :value="2">2 Tiket</option>
                <option :value="3">3 Tiket</option>
                <option :value="4">4 Tiket</option>
                <option :value="5">5 Tiket</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="setting-select-chevron">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <!-- Toggle Row 1 -->
          <div class="ticket-setting-row">
            <div class="setting-row-left">
              <span class="setting-row-main">1 akun email untuk 1 kali transaksi</span>
              <span class="setting-row-sub">1 akun email hanya dapat melakukan 1 kali transaksi pembelian tiket</span>
            </div>
            <label class="toggle-switch-wrapper">
              <input type="checkbox" v-model="limitOneEmail" class="hidden-toggle-input" />
              <span class="toggle-switch-slider" :class="{ active: limitOneEmail }"></span>
            </label>
          </div>

          <!-- Toggle Row 2 -->
          <div class="ticket-setting-row">
            <div class="setting-row-left">
              <span class="setting-row-main">1 tiket untuk 1 data pemesan</span>
              <span class="setting-row-sub">Data setiap tiket tidak boleh sama</span>
            </div>
            <label class="toggle-switch-wrapper">
              <input type="checkbox" v-model="limitOneTicketPerData" class="hidden-toggle-input" />
              <span class="toggle-switch-slider" :class="{ active: limitOneTicketPerData }"></span>
            </label>
          </div>
        </div>
      </div>

      </div>

      <!-- ======= STEP 2: KELOLA TIKET (INLINE VIEW) ======= -->
      <div class="step-layout-container" v-else-if="currentStep === 2 && showTicketFormInline">
        <div class="inline-ticket-form-container">
          <div class="ticket-modal-header-row">
            <label class="form-label section-label">Kelola Tiket</label>
            <button class="modal-close-x-btn" @click="showTicketFormInline = false" title="Tutup">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="modal-x-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="ticket-modal-body">
            <!-- Kategori Tiket -->
            <div class="modal-form-group">
              <div class="modal-form-label-row">
                <label class="modal-form-label">Kategori Tiket <span class="required">*</span></label>
                <span class="required-notice">* Fitur seatmap silahkan menghubungi admin</span>
              </div>
              <div class="radio-tab-group">
                <label class="radio-tab-item" :class="{ active: ticketCategory === 'Festival' }">
                  <input type="radio" v-model="ticketCategory" value="Festival" class="hidden-radio-input" />
                  <span class="radio-dot-circle" :class="{ checked: ticketCategory === 'Festival' }"></span>
                  <span>Festival</span>
                </label>
                <label class="radio-tab-item disabled">
                  <input type="radio" v-model="ticketCategory" value="Seat" disabled class="hidden-radio-input" />
                  <span class="radio-dot-circle disabled"></span>
                  <span class="label-disabled">Seat</span>
                </label>
              </div>
            </div>

            <!-- Jenis Tiket -->
            <div class="modal-form-group">
              <label class="modal-form-label">Jenis Tiket <span class="required">*</span></label>
              <div class="radio-tab-group">
                <label class="radio-tab-item" :class="{ active: ticketType === 'Berbayar' }">
                  <input type="radio" v-model="ticketType" value="Berbayar" class="hidden-radio-input" />
                  <span class="radio-dot-circle" :class="{ checked: ticketType === 'Berbayar' }"></span>
                  <span>Berbayar</span>
                </label>
                <label class="radio-tab-item" :class="{ active: ticketType === 'Gratis' }">
                  <input type="radio" v-model="ticketType" value="Gratis" class="hidden-radio-input" />
                  <span class="radio-dot-circle" :class="{ checked: ticketType === 'Gratis' }"></span>
                  <span>Gratis</span>
                </label>
              </div>
            </div>

            <!-- Nama Tiket -->
            <div class="modal-form-group">
              <label class="modal-form-label">Nama Tiket <span class="required">*</span></label>
              <input type="text" v-model="ticketName" class="modal-form-input text-field-mock" placeholder="Nama Tiket" />
              <span class="field-error-message" v-if="ticketErrors.name">{{ ticketErrors.name }}</span>
            </div>

            <!-- Tgl Event -->
            <div class="modal-form-group">
              <label class="modal-form-label">Tgl Event <span class="required">*</span></label>
              <div class="modal-input-icon-wrapper">
                <input type="date" v-model="ticketDate" class="modal-form-input icon-right date-input" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <span class="field-error-message" v-if="ticketErrors.date">{{ ticketErrors.date }}</span>
            </div>

            <!-- Tgl Penjualan Columns -->
            <div class="modal-columns-row">
              <div class="modal-form-group">
                <label class="modal-form-label">Tgl Mulai Penjualan <span class="required">*</span></label>
                <div class="modal-input-icon-wrapper">
                  <input type="date" v-model="ticketStartSaleDate" class="modal-form-input icon-right date-input" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <span class="field-error-message" v-if="ticketErrors.startSaleDate">{{ ticketErrors.startSaleDate }}</span>
              </div>
              <div class="modal-form-group">
                <label class="modal-form-label">Tgl Berakhir Penjualan <span class="required">*</span></label>
                <div class="modal-input-icon-wrapper">
                  <input type="date" v-model="ticketEndSaleDate" class="modal-form-input icon-right date-input" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <span class="field-error-message" v-if="ticketErrors.endSaleDate">{{ ticketErrors.endSaleDate }}</span>
              </div>
            </div>

            <!-- Jam Penjualan Columns -->
            <div class="modal-columns-row">
              <div class="modal-form-group">
                <label class="modal-form-label">Jam Mulai Penjualan <span class="required">*</span></label>
                <div class="modal-input-icon-wrapper">
                  <input type="time" v-model="ticketStartSaleTime" class="modal-form-input icon-right date-input" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <span class="field-error-message" v-if="ticketErrors.startSaleTime">{{ ticketErrors.startSaleTime }}</span>
              </div>
              <div class="modal-form-group">
                <label class="modal-form-label">Jam Berakhir Penjualan <span class="required">*</span></label>
                <div class="modal-input-icon-wrapper">
                  <input type="time" v-model="ticketEndSaleTime" class="modal-form-input icon-right date-input" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <span class="field-error-message" v-if="ticketErrors.endSaleTime">{{ ticketErrors.endSaleTime }}</span>
              </div>
            </div>

            <!-- Harga & Jumlah Columns -->
            <div class="modal-columns-row">
              <div class="modal-form-group" :class="{ disabled: ticketType === 'Gratis' }">
                <label class="modal-form-label">Harga Tiket <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model="ticketPrice" 
                  class="modal-form-input text-field-mock" 
                  :disabled="ticketType === 'Gratis'"
                  placeholder="0" 
                />
                <span class="field-error-message" v-if="ticketErrors.price">{{ ticketErrors.price }}</span>
              </div>
              <div class="modal-form-group">
                <label class="modal-form-label">Jumlah Tiket <span class="required">*</span></label>
                <input type="text" v-model="ticketQty" class="modal-form-input text-field-mock" placeholder="Masukan Jumlah" />
                <span class="field-error-message" v-if="ticketErrors.qty">{{ ticketErrors.qty }}</span>
              </div>
            </div>

            <!-- Promo -->
            <div class="modal-form-group check-collapsible">
              <label class="modal-checkbox-item">
                <input type="checkbox" v-model="ticketPromo" class="hidden-checkbox" />
                <span class="custom-checkbox" :class="{ checked: ticketPromo }">✓</span>
                <span class="checklist-label font-medium">Promo</span>
              </label>
              <input 
                v-if="ticketPromo" 
                type="text" 
                v-model="ticketPromoText" 
                class="modal-form-input sub-input text-field-mock" 
                placeholder="Masukkan detail promo" 
              />
            </div>

            <!-- Bundling -->
            <div class="modal-form-group check-collapsible">
              <label class="modal-checkbox-item">
                <input type="checkbox" v-model="ticketBundling" class="hidden-checkbox" />
                <span class="custom-checkbox" :class="{ checked: ticketBundling }">✓</span>
                <span class="checklist-label font-medium">Bundling</span>
              </label>
              <input 
                v-if="ticketBundling" 
                type="text" 
                v-model="ticketBundlingText" 
                class="modal-form-input sub-input text-field-mock" 
                placeholder="Masukkan detail bundling" 
              />
            </div>

            <!-- Deskripsi Tiket -->
            <div class="modal-form-group">
              <label class="modal-form-label">Deskripsi</label>
              <textarea 
                v-model="ticketDescription" 
                class="modal-form-textarea text-field-mock" 
                placeholder="Deskripsi Tiket"
              ></textarea>
            </div>

          </div>
        </div>
      </div>

      <!-- ======= STEP 3: SESSION SETTINGS ======= -->
      <div class="step-layout-container" v-if="currentStep === 3">
        <!-- Pengaturan Sesi Section -->
        <div class="form-group-block">
          <label class="form-label section-label">Pengaturan Sesi</label>
          <div class="step-card-section">
            <div class="session-toggle-row">
              <div class="setting-row-left">
                <span class="setting-row-main font-regular">Aktifkan Sesi</span>
                <span class="setting-row-sub">Aktifkan pembagian sesi untuk event ini</span>
              </div>
              <label class="toggle-switch-wrapper">
                <input type="checkbox" v-model="isSessionActive" class="hidden-toggle-input" />
                <span class="toggle-switch-slider" :class="{ active: isSessionActive }"></span>
              </label>
            </div>

          <!-- Info Box -->
          <div class="session-info-card-box">
            <div class="session-info-header">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="session-info-icon">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.443.263 2.443 1.545v4.625c0 1.282-1.297 2.118-2.443 1.545l-1.106-.553A.75.75 0 0 1 9.5 17.06V11.1c0-.496.326-.928.799-1.077l1.107-.533ZM12 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
              </svg>
              <span class="session-info-title">Cara Setting Sesi:</span>
            </div>
            <ul class="session-info-list">
              <li>Buka tab <strong>Info Tiket</strong></li>
              <li>Saat <strong>membuat atau edit tiket</strong>, Anda bisa mengatur detail sesinya</li>
              <li>Setiap tiket dapat memiliki: Nama Sesi, Tanggal Sesi, Waktu Mulai & Selesai</li>
            </ul>
          </div>
        </div>
      </div>
      </div>

      <!-- ======= STEP 4: DESCRIPTION & TERMS ======= -->
      <div class="step-layout-container" v-if="currentStep === 4">
        <!-- Deskripsi -->
        <div class="form-group-block">
          <label class="form-label section-label">Deskripsi</label>
          <div class="simple-editor-card">
            <div class="simple-editor-toolbar">
              <button type="button" class="s-toolbar-btn font-bold">B</button>
              <button type="button" class="s-toolbar-btn italic-btn">I</button>
              <button type="button" class="s-toolbar-btn underline-btn">U</button>
              <div class="s-toolbar-divider"></div>
              <button type="button" class="s-toolbar-btn list-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </button>
            </div>
            <textarea
              v-model="descriptionText"
              class="simple-editor-textarea"
              placeholder="Ceritakan detail event Anda: deskripsi, rundown, dll."
              rows="6"
            ></textarea>
          </div>
          <span class="field-error-message" v-if="formErrors.description">{{ formErrors.description }}</span>
        </div>

        <!-- Syarat & Ketentuan -->
        <div class="form-group-block">
          <label class="form-label section-label">Syarat & Ketentuan</label>
          <div class="simple-editor-card">
            <div class="simple-editor-toolbar">
              <button type="button" class="s-toolbar-btn font-bold">B</button>
              <button type="button" class="s-toolbar-btn italic-btn">I</button>
              <button type="button" class="s-toolbar-btn underline-btn">U</button>
              <div class="s-toolbar-divider"></div>
              <button type="button" class="s-toolbar-btn list-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:14px;height:14px">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </button>
            </div>
            <textarea
              v-model="termsText"
              class="simple-editor-textarea"
              placeholder="Tulis syarat & ketentuan untuk pembeli tiket event ini."
              rows="6"
            ></textarea>
          </div>
          <span class="field-error-message" v-if="formErrors.terms">{{ formErrors.terms }}</span>
        </div>
      </div>

    </div>

    <!-- Simulasional Modal Picker Dialogs -->
    <div class="simulated-picker-overlay" v-if="showDatePicker" @click.self="showDatePicker = false">
      <div class="simulated-picker-card">
        <h4>Pilih Tanggal Event</h4>
        <input type="date" v-model="dateInputVal" class="simulated-date-input" />
        <div class="picker-card-actions">
          <button class="btn-picker-cancel" @click="showDatePicker = false">Batal</button>
          <button class="btn-picker-save" @click="saveDatePicker">Pilih</button>
        </div>
      </div>
    </div>

    <div class="simulated-picker-overlay" v-if="showTimePicker" @click.self="showTimePicker = false">
      <div class="simulated-picker-card">
        <h4>Pilih Waktu Event</h4>
        <input type="time" v-model="timeInputVal" class="simulated-time-input" />
        <div class="picker-card-actions">
          <button class="btn-picker-cancel" @click="showTimePicker = false">Batal</button>
          <button class="btn-picker-save" @click="saveTimePicker">Pilih</button>
        </div>
      </div>
    </div>

    <div class="simulated-picker-overlay" v-if="showLocationPicker" @click.self="showLocationPicker = false">
      <div class="simulated-picker-card">
        <h4>Atur Alamat Event</h4>
        <input type="text" v-model="locationInputVal" class="simulated-text-input" placeholder="Masukkan alamat lengkap event" autocorrect="on" autocomplete="street-address" spellcheck="true" />
        <div class="picker-card-actions">
          <button class="btn-picker-cancel" @click="showLocationPicker = false">Batal</button>
          <button class="btn-picker-save" @click="saveLocationPicker">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Sticky Footer Actions -->
    <footer class="create-footer" v-if="!showTicketFormInline">
      <div class="footer-actions-row">
        <!-- Back Button -->
        <button class="footer-btn btn-draft-outline" @click="handleBack">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="btn-action-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span>Back</span>
        </button>

        <!-- Next Step Button -->
        <button class="footer-btn btn-next-solid" @click="handleNextStep">
          <span>{{ currentStep === 4 ? 'Publish Event' : 'Next Step' }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="btn-action-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </footer>

    <!-- Sticky Footer for Inline Ticket Form -->
    <footer class="create-footer" v-else-if="showTicketFormInline">
      <div class="footer-actions-row">
        <!-- Batal Button -->
        <button class="footer-btn btn-draft-outline" @click="showTicketFormInline = false">
          <span>Batal</span>
        </button>

        <!-- Simpan Tiket Button -->
        <button class="footer-btn btn-next-solid" @click="saveTicket">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="btn-action-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 13.5h6m-6 3h6m-9 1.5h12a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H16A1.5 1.5 0 0 0 14.5 3h-5A1.5 1.5 0 0 0 8 4.5H4.5A1.5 1.5 0 0 0 3 6v10.5A1.5 1.5 0 0 0 4.5 18Z" />
          </svg>
          <span>Simpan Tiket</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.create-event-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #fafafb;
  position: relative;
}

/* Header Styles */
.create-header {
  height: 56px;
  background-color: #194E9E;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  z-index: 10;
}
.header-back-btn {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  border: 1px solid white;
  border-radius: 50%;
  color: #194E9E;
  width: 32px;
  height: 32px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: opacity 0.2s;
}
.header-back-btn:hover {
  opacity: 0.9;
}
.header-back-icon {
  width: 16px;
  height: 16px;
}
.header-title {
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin: 0;
  font-family: var(--font-sans);
}
.header-draft-btn-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  border: 1px solid white;
  border-radius: 50%;
  color: #194E9E;
  width: 32px;
  height: 32px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: opacity 0.2s;
  z-index: 15;
}
.header-draft-btn-icon:hover {
  opacity: 0.9;
}
.header-draft-icon {
  width: 16px;
  height: 16px;
  color: #194E9E;
}

/* Content Body */
.create-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 16px 120px 16px; /* top padding is 0 for sticky indicator */
  display: flex;
  flex-direction: column;
  gap: 20px;
  scrollbar-width: none;
}
.create-body::-webkit-scrollbar {
  display: none;
}

/* Step Indicator Section */
.step-indicator-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 0;
  background-color: #fafafb;
  z-index: 99;
  padding-top: 18px;
  padding-bottom: 12px;
  padding-left: 16px;
  padding-right: 16px;
  margin-left: -16px;
  margin-right: -16px;
  margin-bottom: 4px;
  border-bottom: 1px solid #f1f5f9;
}
.step-labels-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.step-number-text {
  font-size: 11px;
  font-weight: 700;
  color: #194E9E;
  letter-spacing: 0.5px;
}
.step-name-text {
  font-size: 11px;
  font-weight: 400;
  color: #0f172a;
}
.step-bars-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
.step-bar-segment {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background-color: #e2e8f0;
}
.step-bar-segment.active {
  background-color: #194E9E;
}

/* Form Group */
.create-form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-size: 12px;
  font-weight: 700;
  color: black;
}

/* Dropzone styling */
.banner-dropzone {
  width: 100%;
  height: 180px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 16px;
  box-sizing: border-box;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}
.banner-dropzone:hover {
  border-color: #194E9E;
  background-color: #f1f7ff;
}
.banner-dropzone.has-image {
  border-style: solid;
  border-color: #e2e8f0;
  padding: 0;
}
.hidden-file-input {
  display: none;
}
.upload-cloud-icon {
  width: 38px;
  height: 38px;
  color: #194E9E;
  margin-bottom: 8px;
}
.upload-main-text {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin: 0 0 4px 0;
}
.upload-sub-text {
  font-size: 10px;
  color: #494a4a;
  margin: 0;
  line-height: 1.4;
}
.banner-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-banner-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.15s;
}
.remove-banner-btn:hover {
  background-color: rgba(220, 38, 38, 1);
}
.remove-icon {
  width: 14px;
  height: 14px;
}

/* Form Text Input — underline style (matches Login) */
.form-text-input {
  width: 100%;
  background-color: transparent;
  border: none;
  border-bottom: 1.5px solid #cbd5e1;
  border-radius: 0;
  padding: 10px 36px 10px 0;
  box-sizing: border-box;
  font-size: 14px;
  color: #0f172a;
  font-weight: 400;
  outline: none;
  transition: border-color 0.2s;
  font-family: var(--font-sans);
}
.form-text-input:focus {
  border-color: #194E9E;
  box-shadow: none;
}
.text-field-mock::placeholder {
  color: #94a3b8;
}

/* Interactive Pickers in Step 1 */
.interactive-picker-list {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.01);
}
.picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}
.picker-row:last-child {
  border-bottom: none;
}
.picker-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.picker-icon {
  width: 20px;
  height: 20px;
  color: #194E9E;
}
.picker-text {
  font-size: 13px;
  color: black;
  font-weight: 400;
}
.picker-chevron {
  width: 16px;
  height: 16px;
  color: black;
  flex-shrink: 0;
}

/* Location picker - icon stays fixed, text scrolls vertically */
.location-picker-row {
  align-items: flex-start;
}
.location-picker-left {
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.location-picker-icon {
  flex-shrink: 0;
  margin-top: 1px;
}
.location-picker-text {
  max-height: 56px;
  overflow-y: auto;
  line-height: 1.5;
  word-break: break-word;
  scrollbar-width: none;
}
.location-picker-text::-webkit-scrollbar {
  display: none;
}
.location-picker-chevron {
  flex-shrink: 0;
  margin-top: 2px;
}

/* Step Card Layout */
.step-layout-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.step-card-section {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}
.step-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.step-card-header.no-card-style {
  margin-bottom: 8px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.form-label.section-label {
  font-size: 15px;
  font-weight: 700;
  color: black;
  margin: 0;
}
.margin-bottom-8 {
  margin-bottom: 8px !important;
}

/* Ticket List & triggers */
.add-ticket-trigger-btn-icon {
  background-color: #194E9E;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 2px 6px rgba(25, 78, 158, 0.2);
}
.add-ticket-trigger-btn-icon:hover {
  background-color: #154388;
  transform: scale(1.05);
}
.add-btn-icon-svg {
  width: 16px;
  height: 16px;
}
.tickets-empty-alert-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 12px 16px;
  color: #475569;
}
.alert-info-icon {
  width: 18px;
  height: 18px;
  color: #494a4a;
  flex-shrink: 0;
}
.alert-info-text {
  font-size: 13px;
  font-weight: 500;
}

.created-tickets-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.created-ticket-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  background-color: #f8fafc;
}
.ticket-item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ticket-item-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
  text-transform: uppercase;
}
.ticket-item-badge.berbayar {
  background-color: #dbeafe;
  color: #1e40af;
}
.ticket-item-badge.gratis {
  background-color: #d1fae5;
  color: #065f46;
}
.ticket-item-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
.ticket-item-price {
  font-size: 12px;
  color: #494a4a;
  font-weight: 600;
}
.delete-ticket-btn {
  background-color: #fee2e2;
  color: #e52424;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s;
}
.delete-ticket-btn:hover {
  background-color: #fca5a5;
}

/* Checklist grid */
.checklist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 10px;
}
.checklist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.checklist-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.hidden-checkbox {
  display: none;
}
.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid #cbd5e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: transparent;
  background-color: white;
  transition: all 0.15s ease;
}
.custom-checkbox.checked {
  background-color: #194E9E;
  border-color: #194E9E;
  color: white;
}
.custom-checkbox.checked.disabled {
  background-color: #cbd5e1;
  border-color: #cbd5e1;
}
.checklist-label {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}
.label-disabled {
  color: #94a3b8;
}

/* Ticket Setting Rows & Toggles */
.ticket-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}
.ticket-setting-row:last-child {
  border-bottom: none;
}
.ticket-setting-row.dropdown-type {
  align-items: center;
  gap: 12px;
}
.setting-row-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  padding-right: 8px;
}
.setting-row-main {
  font-size: 13px;
  font-weight: 700;
  color: black;
}
.setting-row-main.font-regular {
  font-weight: 500;
}
.setting-row-sub {
  font-size: 11px;
  color: #494a4a;
  line-height: 1.4;
}

/* Setting select box */
.setting-select-box {
  position: relative;
  min-width: 105px;
}
.setting-select {
  width: 100%;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 26px 6px 10px;
  font-size: 12px;
  font-weight: 400;
  color: black;
  outline: none;
  appearance: none;
  cursor: pointer;
  box-sizing: border-box;
}
.setting-select-chevron {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  color: black;
  pointer-events: none;
}

/* Switch toggle */
.toggle-switch-wrapper {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}
.hidden-toggle-input {
  display: none;
}
.toggle-switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  border-radius: 34px;
  transition: background-color 0.25s ease;
}
.toggle-switch-slider::before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.25s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.toggle-switch-slider.active {
  background-color: #194E9E;
}
.toggle-switch-slider.active::before {
  transform: translateX(20px);
}

/* Session Tab content */
.session-toggle-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 14px;
}
.session-info-card-box {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.session-info-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.session-info-icon {
  width: 16px;
  height: 16px;
  color: #194E9E;
}
.session-info-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e3a8a;
}
.session-info-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.session-info-list li {
  font-size: 12px;
  color: #1e3a8a;
  line-height: 1.4;
}

/* Rich text editor wrapper */
.rich-editor-wrapper {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  overflow: hidden;
  background-color: white;
}
.rich-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: #eff6ff;
  border-bottom: 1px solid #cbd5e1;
}
.rich-editor-toolbar.flex-between {
  justify-content: space-between;
}
.toolbar-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.toolbar-dropdown {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  user-select: none;
}
.toolbar-btn {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  user-select: none;
}
.toolbar-btn.italic-btn { font-style: italic; }
.toolbar-btn.underline-btn { text-decoration: underline; }
.toolbar-btn.strike-btn { text-decoration: line-through; }
.toolbar-copy-icon {
  width: 14px;
  height: 14px;
  color: #494a4a;
  cursor: pointer;
}
.rich-editor-textarea {
  width: 100%;
  height: 200px;
  border: none;
  padding: 12px;
  box-sizing: border-box;
  font-size: 13px;
  color: #334155;
  outline: none;
  resize: none;
  font-family: var(--font-sans);
  line-height: 1.5;
}
.rich-editor-textarea::placeholder {
  color: #94a3b8;
  font-style: italic;
}

/* Picker simulated Modal dialogs */
.simulated-picker-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.simulated-picker-card {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.simulated-picker-card h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
.simulated-date-input, .simulated-time-input, .simulated-text-input {
  width: 100%;
  padding: 10px 0;
  border: none;
  border-bottom: 1.5px solid #cbd5e1;
  border-radius: 0;
  font-size: 14px;
  background-color: transparent;
  outline: none;
  box-sizing: border-box;
  font-family: var(--font-sans);
  color: #0f172a;
  transition: border-color 0.2s;
}
.simulated-date-input:focus, .simulated-time-input:focus, .simulated-text-input:focus {
  border-color: #194E9E;
}
.picker-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn-picker-cancel {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #494a4a;
  cursor: pointer;
  padding: 8px 12px;
}
.btn-picker-save {
  background-color: #194E9E;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
}

/* Kelola Tiket Sheet Dialog */
.ticket-modal-sheet {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.ticket-modal-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.ticket-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.modal-close-x-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #494a4a;
}
.modal-x-icon {
  width: 16px;
  height: 16px;
}
.ticket-modal-body {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
  scrollbar-width: thin;
}

.modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.modal-form-group.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.modal-form-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px;
}
.modal-form-label {
  font-size: 12px;
  font-weight: 700;
  color: black;
}
.modal-form-label .required {
  color: #ef4444;
}
.required-notice {
  font-size: 9px;
  font-weight: 400;
  color: #ef4444;
  font-style: normal;
}

/* Radio check tab group */
.radio-tab-group {
  display: flex;
  gap: 12px;
}
.radio-tab-item {
  flex: 1;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background-color: white;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  transition: all 0.15s ease;
  user-select: none;
}
.radio-tab-item.active {
  border-color: #194E9E;
  background-color: #f0f7ff;
  color: #194E9E;
}
.radio-tab-item.disabled {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  cursor: not-allowed;
}
.hidden-radio-input {
  display: none;
}
.radio-dot-circle {
  width: 14px;
  height: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}
.radio-dot-circle::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: transparent;
  transition: background-color 0.15s;
}
.radio-dot-circle.checked {
  border-color: #194E9E;
}
.radio-dot-circle.checked::after {
  background-color: #194E9E;
}
.radio-dot-circle.disabled {
  background-color: #e2e8f0;
}

/* Modal text input — underline style (matches Login) */
.modal-form-input, .modal-form-textarea {
  width: 100%;
  background-color: transparent;
  border: none;
  border-bottom: 1.5px solid #cbd5e1;
  border-radius: 0;
  padding: 10px 36px 10px 0;
  box-sizing: border-box;
  font-size: 13px;
  color: #0f172a;
  font-weight: 400;
  outline: none;
  font-family: var(--font-sans);
  transition: border-color 0.2s;
}
.modal-form-input:focus, .modal-form-textarea:focus {
  border-color: #194E9E;
  box-shadow: none;
}
.modal-form-textarea {
  height: 80px;
  resize: none;
  line-height: 1.4;
  padding-right: 0;
}

/* Input icon wrapper */
.modal-input-icon-wrapper {
  position: relative;
  width: 100%;
}
.modal-form-input.icon-right {
  padding-right: 28px;
}
.modal-icon-overlay {
  position: absolute;
  right: 0;
  bottom: 10px;
  pointer-events: none;
  width: 16px;
  height: 16px;
  color: #194E9E;
}

/* Columns */
.modal-columns-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Collapsible inputs */
.modal-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.font-medium {
  font-weight: 600;
}
.modal-form-input.sub-input {
  margin-top: 6px;
  border-color: #cbd5e1;
}

/* Save ticket trigger btn in modal */
.modal-save-ticket-btn {
  width: 100%;
  height: 40px;
  background-color: #194E9E;
  color: white;
  border: none;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s;
  box-shadow: 0 4px 10px rgba(25, 78, 158, 0.2);
}
.modal-save-ticket-btn:hover {
  background-color: #154388;
}

/* Footer Styles */
.create-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  border-top: 1px solid #e2e8f0;
  padding: 8px 16px;
  box-sizing: border-box;
  z-index: 10;
  display: flex;
  align-items: center;
}
.footer-actions-row {
  display: flex;
  gap: 12px;
  width: 100%;
}
.footer-btn {
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.btn-draft-outline {
  flex: 1;
  background-color: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}
.btn-draft-outline:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
}
.btn-next-solid {
  flex: 1.3;
  background-color: #194E9E;
  border: none;
  color: white;
}
.btn-next-solid:hover {
  background-color: #154388;
}
.btn-action-icon {
  width: 16px;
  height: 16px;
}

/* Modal Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-sheet, .modal-fade-leave-active .modal-sheet { transition: transform 0.25s ease; }
.modal-fade-enter-from .modal-sheet, .modal-fade-leave-to .modal-sheet { transform: translateY(100%); }

/* Field Error Messages */
.field-error-message {
  color: #ef4444;
  font-size: 11px;
  font-weight: 400;
  margin-top: 4px;
  display: block;
}

/* Ticket Card modifications & wrapper */
.ticket-card-style {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ticket-add-trigger-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px 0;
}
.ticket-add-trigger-wrapper.empty {
  flex-direction: column;
  gap: 10px;
  padding: 24px 0 16px 0;
}
.ticket-trigger-helper-text {
  font-size: 12px;
  color: #494a4a;
  font-weight: 500;
  text-align: center;
  font-family: var(--font-sans);
}

/* Inline ticket creation container */
.inline-ticket-form-container {
  margin-left: -4px;
  margin-right: -4px;
  margin-top: -12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: calc(100% + 8px);
}




/* Tags dropdown transition */
.tags-fade-enter-active,
.tags-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.tags-fade-enter-from,
.tags-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Chip bar — single-line horizontal scroll */
.tags-chip-bar {
  display: flex;
  align-items: center;
  min-height: 44px;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;
}
.tags-chip-bar.focused {
  border-color: #194E9E;
  box-shadow: 0 0 0 3px rgba(25, 78, 158, 0.08);
}
.selected-chips-wrap {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.selected-chips-wrap::-webkit-scrollbar { display: none; }

/* Selected chip — simple, no color */
.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-sans);
  background-color: #EFF6FF;
  color: #194E9E;
  border: 1px solid #BFDBFE;
  white-space: nowrap;
  line-height: 1.4;
  flex-shrink: 0;
}
.chip-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-left: 2px;
  color: #494a4a;
  transition: color 0.15s;
}
.chip-remove-btn:active { color: #0f172a; }
.tags-chip-placeholder {
  font-size: 13px;
  color: #94a3b8;
  font-family: var(--font-sans);
  font-weight: 400;
}

/* Tag option btn — simple, clean */
.tag-option-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  padding: 13px 14px;
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-sans);
  color: #374151;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.12s;
}
.tag-option-btn:last-child { border-bottom: none; }
.tag-option-btn:active { background-color: #f8fafc; }
.tag-option-btn.tag-option-selected {
  font-weight: 500;
  color: #194E9E;
}

/* Dropdown options list */
.tags-options-list {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
}

/* Ticket item updates */
.ticket-item-badge {
  text-transform: none !important;
  font-weight: 500;
}
.ticket-item-name {
  font-weight: 400;
}
.ticket-item-price {
  color: #111827 !important;
  font-weight: 400;
}
.ticket-item-price.free {
  color: #059669 !important;
}
.delete-ticket-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #e52424;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.delete-ticket-btn:active { background-color: #FEE2E2; }
.delete-icon { width: 14px; height: 14px; }

/* Native date/time input styling */
.date-input {
  color: #111827;
  -webkit-appearance: none;
  appearance: none;
}
.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 0;
  padding: 0;
}

/* Simple Step 4 Editor */
.simple-editor-card {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}
.simple-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  border-bottom: 1px solid #f1f5f9;
  background-color: #fafafa;
}
.s-toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  border-radius: 6px;
  font-size: 13px;
  font-family: var(--font-sans);
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.12s;
}
.s-toolbar-btn:hover { background-color: #f1f5f9; }
.s-toolbar-btn.italic-btn { font-style: italic; }
.s-toolbar-btn.underline-btn { text-decoration: underline; }
.s-toolbar-divider {
  width: 1px;
  height: 18px;
  background-color: #e2e8f0;
  margin: 0 4px;
}
.simple-editor-textarea {
  display: block;
  width: 100%;
  min-height: 130px;
  border: none;
  outline: none;
  resize: none;
  padding: 14px;
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: 400;
  color: #111827;
  line-height: 1.6;
  background-color: #fff;
  box-sizing: border-box;
}
.simple-editor-textarea::placeholder { color: #94a3b8; }
</style>
