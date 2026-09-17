<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  items: { type: Array, default: () => [] }
});

const emit = defineEmits(['back', 'proceed-payment']);

const currentStep = ref(1);

const parsePrice = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const num = parseInt(String(priceStr).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};
const formatPrice = (num) => 'Rp' + Number(num || 0).toLocaleString('id-ID');

const subtotal = computed(() =>
  (props.items || []).reduce((sum, item) => sum + parsePrice(item.merch?.price) * (item.qty || 1), 0)
);
const totalQty = computed(() =>
  (props.items || []).reduce((sum, item) => sum + (item.qty || 1), 0)
);

const isOrderExpanded = ref(true);
const isCourierExpanded = ref(true);
const isVoucherExpanded = ref(false);
const isOrdererExpanded = ref(true);

const ordererForm = ref({ fullName: '', email: '', phone: '' });
const ordererErrors = ref({ fullName: '', email: '', phone: '' });
const itemNotes = ref({});
const itemKey = (item) => `${item.merch?.id}__${item.merch?.variant || 'default'}`;
const itemNoteError = ref({});

const addressBook = ref([
  { id: 'home', label: 'Rumah', receiver: 'Afif Maulana Yusuf', phone: '81234567890', address: 'Jl. Sukajadi No. 88, Pasteur', city: 'Bandung', postal: '40162', pin: 'Pasteur, Sukajadi — Bandung' },
  { id: 'office', label: 'Kantor', receiver: 'Afif Maulana Yusuf', phone: '81298765432', address: 'Jl. Asia Afrika No. 8, Lt. 3', city: 'Bandung', postal: '40111', pin: 'Asia Afrika — Bandung' }
]);
const selectedAddressId = ref('home');
const isAddressPageOpen = ref(false);
const isCustomAddressPageOpen = ref(false);
const isMapFullscreenOpen = ref(false);
const isAddressEditMode = ref(false);
const isEditAddressSheetOpen = ref(false);
const editDragY = ref(0);
const isEditDragging = ref(false);
const editStartY = ref(0);
const onEditTouchStart = (e) => { isEditDragging.value = true; editStartY.value = e.touches ? e.touches[0].clientY : e.clientY; };
const onEditTouchMove = (e) => {
  if (!isEditDragging.value) return;
  const currentY = e.touches ? e.touches[0].clientY : e.clientY;
  const delta = currentY - editStartY.value;
  if (delta > 0) editDragY.value = delta;
};
const onEditTouchEnd = () => {
  if (!isEditDragging.value) return;
  isEditDragging.value = false;
  if (editDragY.value > 90) closeEditAddressSheet();
  else editDragY.value = 0;
};
const onEditMouseDown = (e) => {
  onEditTouchStart(e);
  const onMouseMove = (ev) => onEditTouchMove(ev);
  const onMouseUp = () => {
    onEditTouchEnd();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};
const editingAddressId = ref(null);
const editForm = ref({ label: '', receiver: '', phone: '', address: '', city: '', postal: '' });
const editErrors = ref({ label: '', receiver: '', phone: '', address: '', city: '', postal: '' });
const mapSearchQuery = ref('');
const mapSearchFocused = ref(false);
const mapSearchError = ref('');
const mapQuery = ref('');
const pinDetailOpen = ref(false);
const addressPageError = ref('');

const selectedAddress = computed(() => addressBook.value.find(a => a.id === selectedAddressId.value) || addressBook.value[0]);
const filteredAddresses = computed(() => {
  const q = mapQuery.value.trim().toLowerCase();
  if (!q) return addressBook.value;
  return addressBook.value.filter(a => `${a.label} ${a.receiver} ${a.address} ${a.city}`.toLowerCase().includes(q));
});

const openAddressPage = () => {
  isAddressPageOpen.value = true;
  mapQuery.value = '';
  pinDetailOpen.value = false;
  addressPageError.value = '';
};
const closeAddressPage = () => { isAddressPageOpen.value = false; };
const chooseAddress = (id) => {
  selectedAddressId.value = id;
  addressPageError.value = '';
};
const confirmAddressChoice = () => {
  if (!selectedAddress.value) {
    addressPageError.value = 'Pilih minimal satu alamat';
    return;
  }
  isAddressPageOpen.value = false;
};
const openCustomAddressPage = () => {
  isCustomAddressPageOpen.value = true;
  addressForm.value = { receiver: '', phone: '', address: '', city: '', postal: '' };
  addressErrors.value = { receiver: '', phone: '', address: '', city: '', postal: '' };
};
const closeCustomAddressPage = () => { isCustomAddressPageOpen.value = false; };
const openMapFullscreen = () => {
  isMapFullscreenOpen.value = true;
  mapSearchQuery.value = '';
  mapSuggestions.value = [];
  mapSearchFocused.value = false;
  mapSearchError.value = '';
};
const closeMapFullscreen = () => {
  isMapFullscreenOpen.value = false;
  mapSearchFocused.value = false;
};

// ponytail: koreksi typo umum + peta OSM lokal; upgrade ke Photon/Algolia Places saat butuh global
const typoMap = [
  [/bandungg?/i, 'Bandung'], [/jakart?a?/i, 'Jakarta'], [/surabay?a?/i, 'Surabaya'],
  [/yogyakart?a?/i, 'Yogyakarta'], [/semarangg?/i, 'Semarang'], [/medann?/i, 'Medan'],
  [/sukajad?i/i, 'Sukajadi'], [/pasteurr?/i, 'Pasteur'], [/asia\s?afrik?a?/i, 'Asia Afrika']
];
const autocorrectAddress = (text) => {
  let out = (text || '').trim();
  typoMap.forEach(([re, fix]) => { out = out.replace(re, fix); });
  return out;
};
const mapSuggestions = ref([]);
const mapSearching = ref(false);
let mapSearchTimer = null;
// ponytail: saran alamat Nominatim dipakai ulang untuk field alamat lengkap; ganti ke Photon saat butuh global
const addressSuggestions = ref([]);
const addressSearching = ref(false);
const addressSuggestError = ref('');
const addressSuggestFocused = ref(false);
let addressSuggestTimer = null;
const editAddressSuggestions = ref([]);
const editAddressSearching = ref(false);
const editAddressSuggestError = ref('');
const editAddressSuggestFocused = ref(false);
let editAddressSuggestTimer = null;
const fetchAddressSuggestions = async (q) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&limit=5&q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('search failed');
  const json = await res.json();
  return (json || []).map(item => ({
    label: item.display_name?.split(',').slice(0, 3).join(',') || item.display_name,
    full: item.display_name,
    lat: item.lat,
    lon: item.lon
  }));
};
const onAddressSuggestInput = () => {
  addressForm.value.address = autocorrectAddress(addressForm.value.address);
  if (addressSuggestTimer) clearTimeout(addressSuggestTimer);
  const q = addressForm.value.address.trim();
  if (q.length < 3) {
    addressSuggestions.value = [];
    addressSuggestError.value = '';
    return;
  }
  addressSuggestTimer = setTimeout(async () => {
    addressSearching.value = true;
    addressSuggestError.value = '';
    try {
      addressSuggestions.value = await fetchAddressSuggestions(q);
    } catch (e) {
      addressSuggestError.value = 'Pencarian gagal, coba lagi';
      addressSuggestions.value = [];
    } finally {
      addressSearching.value = false;
    }
  }, 400);
};
const applyAddressSuggestion = (s) => {
  addressForm.value.address = s.label;
  addressSuggestions.value = [];
  addressSuggestFocused.value = false;
  addressSuggestError.value = '';
  validateAddressField('address');
};
const onEditAddressSuggestInput = () => {
  editForm.value.address = autocorrectAddress(editForm.value.address);
  if (editAddressSuggestTimer) clearTimeout(editAddressSuggestTimer);
  const q = editForm.value.address.trim();
  if (q.length < 3) {
    editAddressSuggestions.value = [];
    editAddressSuggestError.value = '';
    return;
  }
  editAddressSuggestTimer = setTimeout(async () => {
    editAddressSearching.value = true;
    editAddressSuggestError.value = '';
    try {
      editAddressSuggestions.value = await fetchAddressSuggestions(q);
    } catch (e) {
      editAddressSuggestError.value = 'Pencarian gagal, coba lagi';
      editAddressSuggestions.value = [];
    } finally {
      editAddressSearching.value = false;
    }
  }, 400);
};
const applyEditAddressSuggestion = (s) => {
  editForm.value.address = s.label;
  editAddressSuggestions.value = [];
  editAddressSuggestFocused.value = false;
  editAddressSuggestError.value = '';
  validateEditField('address');
};
const fetchMapSuggestions = async (q) => {
  mapSearching.value = true;
  mapSearchError.value = '';
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&limit=5&q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('search failed');
    const json = await res.json();
    mapSuggestions.value = (json || []).map(item => ({
      label: item.display_name?.split(',').slice(0, 3).join(',') || item.display_name,
      full: item.display_name,
      lat: item.lat,
      lon: item.lon
    }));
  } catch (e) {
    mapSearchError.value = 'Pencarian gagal, coba lagi';
    mapSuggestions.value = [];
  } finally {
    mapSearching.value = false;
  }
};
const onMapSearchInput = () => {
  mapSearchQuery.value = autocorrectAddress(mapSearchQuery.value);
  if (mapSearchTimer) clearTimeout(mapSearchTimer);
  const q = mapSearchQuery.value.trim();
  if (q.length < 3) {
    mapSuggestions.value = [];
    mapSearchError.value = '';
    return;
  }
  mapSearchTimer = setTimeout(() => fetchMapSuggestions(q), 400);
};
const applyMapSuggestion = (s) => {
  mapSearchQuery.value = s.label;
  mapSuggestions.value = [];
  mapSearchFocused.value = false;
  mapSearchError.value = '';
  mapEmbedSrc.value = `https://www.openstreetmap.org/export/embed.html?bbox=${s.lon - 0.03}%2C${s.lat - 0.03}%2C${Number(s.lon) + 0.03}%2C${Number(s.lat) + 0.03}&layer=mapnik&marker=${s.lat}%2C${s.lon}`;
  const active = addressBook.value.find(a => a.id === selectedAddressId.value);
  if (active) {
    active.pin = s.label;
    active.address = s.label;
    if (isAddressPageOpen.value) mapQuery.value = '';
  }
};
const mapEmbedSrc = ref('https://www.openstreetmap.org/export/embed.html?bbox=107.5891%2C-6.9475%2C107.6491%2C-6.8875&layer=mapnik&marker=-6.9175%2C107.6191');
const confirmMapPin = () => { isMapFullscreenOpen.value = false; };
const saveCustomAddress = () => {
  ['receiver', 'phone', 'address', 'city', 'postal'].forEach(validateAddressField);
  const hasError = Boolean(
    addressErrors.value.receiver || addressErrors.value.phone || addressErrors.value.address ||
    addressErrors.value.city || addressErrors.value.postal
  );
  if (hasError) return;
  const id = 'custom-' + Date.now();
  addressBook.value.push({
    id,
    label: 'Alamat Baru',
    receiver: addressForm.value.receiver.trim(),
    phone: addressForm.value.phone.trim(),
    address: addressForm.value.address.trim(),
    city: addressForm.value.city.trim(),
    postal: addressForm.value.postal.trim(),
    pin: `${addressForm.value.address.trim()} — ${addressForm.value.city.trim()}`
  });
  selectedAddressId.value = id;
  isCustomAddressPageOpen.value = false;
  addressForm.value = { receiver: '', phone: '', address: '', city: '', postal: '' };
};

const onCustomAddressInput = () => {
  addressForm.value.address = autocorrectAddress(addressForm.value.address);
};

const startEditAddress = (id) => {
  const a = addressBook.value.find(x => x.id === id);
  if (!a) return;
  editingAddressId.value = id;
  editForm.value = { label: a.label, receiver: a.receiver, phone: a.phone, address: a.address, city: a.city, postal: a.postal };
  editErrors.value = { label: '', receiver: '', phone: '', address: '', city: '', postal: '' };
  editDragY.value = 0;
  isEditDragging.value = false;
  isEditAddressSheetOpen.value = true;
};
const closeEditAddressSheet = () => {
  isEditAddressSheetOpen.value = false;
  editingAddressId.value = null;
  setTimeout(() => { editDragY.value = 0; isEditDragging.value = false; }, 360);
};
const validateEditField = (field) => {
  if (field === 'label') {
    editErrors.value.label = !editForm.value.label.trim() ? 'Label wajib diisi' : '';
  } else if (field === 'receiver') {
    editErrors.value.receiver = !editForm.value.receiver.trim() ? 'Nama penerima wajib diisi' : '';
  } else if (field === 'phone') {
    const raw = editForm.value.phone.trim();
    if (!raw) editErrors.value.phone = 'Nomor telepon wajib diisi';
    else if (raw.startsWith('0')) editErrors.value.phone = 'Nomor HP tidak perlu diawali 0';
    else if (!validatePhone(raw)) editErrors.value.phone = 'Nomor tidak valid (8-13 digit)';
    else editErrors.value.phone = '';
  } else if (field === 'address') {
    editForm.value.address = autocorrectAddress(editForm.value.address);
    editErrors.value.address = !editForm.value.address.trim() ? 'Alamat lengkap wajib diisi' : '';
  } else if (field === 'city') {
    editErrors.value.city = !editForm.value.city.trim() ? 'Kota wajib diisi' : '';
  } else if (field === 'postal') {
    const raw = editForm.value.postal.trim();
    if (!raw) editErrors.value.postal = 'Kode pos wajib diisi';
    else if (!/^[0-9]{5}$/.test(raw)) editErrors.value.postal = 'Kode pos harus 5 digit angka';
    else editErrors.value.postal = '';
  }
};
const saveEditedAddress = () => {
  ['label', 'receiver', 'phone', 'address', 'city', 'postal'].forEach(validateEditField);
  const hasError = Boolean(
    editErrors.value.label || editErrors.value.receiver || editErrors.value.phone ||
    editErrors.value.address || editErrors.value.city || editErrors.value.postal
  );
  if (hasError) return;
  const a = addressBook.value.find(x => x.id === editingAddressId.value);
  if (!a) return;
  a.label = editForm.value.label.trim();
  a.receiver = editForm.value.receiver.trim();
  a.phone = editForm.value.phone.trim();
  a.address = editForm.value.address.trim();
  a.city = editForm.value.city.trim();
  a.postal = editForm.value.postal.trim();
  a.pin = `${a.address} — ${a.city}`;
  closeEditAddressSheet();
};
const deleteAddress = (id) => {
  if (addressBook.value.length <= 1) {
    addressPageError.value = 'Minimal satu alamat harus tersimpan';
    return;
  }
  addressBook.value = addressBook.value.filter(x => x.id !== id);
  if (selectedAddressId.value === id) selectedAddressId.value = addressBook.value[0]?.id || null;
  closeEditAddressSheet();
};

const addressForm = ref({ receiver: '', phone: '', address: '', city: '', postal: '' });
const addressErrors = ref({ receiver: '', phone: '', address: '', city: '', postal: '' });

const couriers = ref([
  { id: 'jne-reg', name: 'JNE Reguler', eta: '2-3 hari', price: 12000 },
  { id: 'jnt-reg', name: 'J&T Reguler', eta: '2-3 hari', price: 11000 },
  { id: 'sicepat-reg', name: 'SiCepat Reguler', eta: '2-4 hari', price: 10000 },
  { id: 'gosend-instant', name: 'GoSend Instant', eta: '3-6 jam', price: 25000 }
]);
const selectedCourier = ref('jne-reg');
const courierError = ref('');
const courierNote = ref('');
const courierNoteError = ref('');

const selectedCourierName = computed(() => couriers.value.find(c => c.id === selectedCourier.value)?.name || '');
const shippingCost = computed(() => couriers.value.find(c => c.id === selectedCourier.value)?.price || 0);

const voucherCodeInput = ref('');
const appliedVoucher = ref(null);
const voucherError = ref('');

const discountValue = computed(() => {
  if (!appliedVoucher.value) return 0;
  return Math.round(subtotal.value * 0.1);
});
const totalPrice = computed(() => Math.max(0, subtotal.value + shippingCost.value - discountValue.value));

const validatePhone = (phone) => {
  const clean = (phone || '').replace(/\D/g, '');
  return clean.length >= 8 && clean.length <= 13;
};
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateOrdererField = (field) => {
  if (field === 'fullName') {
    ordererErrors.value.fullName = !ordererForm.value.fullName.trim() ? 'Nama lengkap wajib diisi' : '';
  } else if (field === 'email') {
    if (!ordererForm.value.email.trim()) ordererErrors.value.email = 'Alamat email wajib diisi';
    else if (!validateEmail(ordererForm.value.email.trim())) ordererErrors.value.email = 'Format email tidak valid (e.g. nama@email.com)';
    else ordererErrors.value.email = '';
  } else if (field === 'phone') {
    const raw = ordererForm.value.phone.trim();
    if (!raw) ordererErrors.value.phone = 'Nomor telepon wajib diisi';
    else if (raw.startsWith('0')) ordererErrors.value.phone = 'Nomor HP tidak perlu diawali 0, langsung mulai dari angka 8';
    else if (!validatePhone(raw)) ordererErrors.value.phone = 'Nomor telepon tidak valid (8-13 digit angka)';
    else ordererErrors.value.phone = '';
  }
};
const validateItemNote = (item) => {
  const k = itemKey(item);
  const v = (itemNotes.value[k] || '');
  itemNoteError.value[k] = v.length > 120 ? 'Catatan maksimal 120 karakter' : '';
};

const validateAddressField = (field) => {
  if (field === 'receiver') {
    addressErrors.value.receiver = !addressForm.value.receiver.trim() ? 'Nama penerima wajib diisi' : '';
  } else if (field === 'phone') {
    const raw = addressForm.value.phone.trim();
    if (!raw) addressErrors.value.phone = 'Nomor telepon penerima wajib diisi';
    else if (raw.startsWith('0')) addressErrors.value.phone = 'Nomor HP tidak perlu diawali 0, langsung mulai dari angka 8';
    else if (!validatePhone(raw)) addressErrors.value.phone = 'Nomor telepon tidak valid (8-13 digit angka)';
    else addressErrors.value.phone = '';
  } else if (field === 'address') {
    addressErrors.value.address = !addressForm.value.address.trim() ? 'Alamat lengkap wajib diisi' : '';
  } else if (field === 'city') {
    addressErrors.value.city = !addressForm.value.city.trim() ? 'Kota wajib diisi' : '';
  } else if (field === 'postal') {
    const raw = addressForm.value.postal.trim();
    if (!raw) addressErrors.value.postal = 'Kode pos wajib diisi';
    else if (!/^[0-9]{5}$/.test(raw)) addressErrors.value.postal = 'Kode pos harus 5 digit angka';
    else addressErrors.value.postal = '';
  }
};

const validateCourier = () => {
  courierError.value = !selectedCourier.value ? 'Pilih kurir pengiriman' : '';
};
const validateCourierNote = () => {
  courierNoteError.value = courierNote.value.length > 120 ? 'Catatan maksimal 120 karakter' : '';
};

const handleApplyVoucher = () => {
  voucherError.value = '';
  if (!voucherCodeInput.value.trim()) {
    voucherError.value = 'Masukkan kode voucher terlebih dahulu';
    return;
  }
  if (voucherCodeInput.value.toUpperCase() === 'KOLEKTIX10') {
    appliedVoucher.value = { code: 'KOLEKTIX10', discountText: 'Diskon 10%' };
    voucherCodeInput.value = '';
  } else {
    voucherError.value = 'Kode voucher tidak valid atau sudah kadaluarsa';
  }
};
const removeVoucher = () => { appliedVoucher.value = null; };

const selectedPaymentMethod = ref('bca_va');
const paymentCategories = ref([
  {
    categoryTitle: 'Virtual Account (Transfer Bank)',
    methods: [
      { id: 'bca_va', name: 'BCA Virtual Account' },
      { id: 'mandiri_va', name: 'Mandiri Virtual Account' },
      { id: 'bni_va', name: 'BNI Virtual Account' },
      { id: 'bri_va', name: 'BRI Virtual Account' }
    ]
  },
  {
    categoryTitle: 'E-Wallet & QRIS',
    methods: [
      { id: 'qris', name: 'QRIS (BCA, GoPay, OVO, ShopeePay)' },
      { id: 'gopay', name: 'GoPay / GoPay Later' },
      { id: 'shopeepay', name: 'ShopeePay' }
    ]
  },
  {
    categoryTitle: 'Kartu Kredit / Debit',
    methods: [
      { id: 'credit_card', name: 'Kartu Kredit / Debit Visa & MasterCard' }
    ]
  }
]);

const totalTimerSeconds = 15 * 60;
const timeLeftSeconds = ref(15 * 60);
let timerInterval = null;
const timerProgressPercent = computed(() => ((timeLeftSeconds.value / totalTimerSeconds) * 100).toFixed(1));
const formattedCountdown = computed(() => {
  const m = Math.floor(timeLeftSeconds.value / 60);
  const s = timeLeftSeconds.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});
onMounted(() => {
  timerInterval = setInterval(() => {
    if (timeLeftSeconds.value > 0) timeLeftSeconds.value--;
    else clearInterval(timerInterval);
  }, 1000);
});
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); });

const handleHeaderBack = () => {
  if (currentStep.value === 2) currentStep.value = 1;
  else emit('back');
};

const isConfirmationModalOpen = ref(false);
const dragY = ref(0);
const isDragging = ref(false);
const startY = ref(0);
const onTouchStart = (e) => { isDragging.value = true; startY.value = e.touches ? e.touches[0].clientY : e.clientY; };
const onTouchMove = (e) => {
  if (!isDragging.value) return;
  const currentY = e.touches ? e.touches[0].clientY : e.clientY;
  const delta = currentY - startY.value;
  if (delta > 0) dragY.value = delta;
};
const onTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (dragY.value > 90) closeConfirmationModal();
  else dragY.value = 0;
};
const onMouseDown = (e) => {
  onTouchStart(e);
  const onMouseMove = (ev) => onTouchMove(ev);
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
  setTimeout(() => { dragY.value = 0; }, 360);
};
const confirmAndProceedToStep2 = () => { closeConfirmationModal(); currentStep.value = 2; };

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
  validateCourier();
  validateCourierNote();
  (props.items || []).forEach(validateItemNote);
  const hasItemNoteError = Object.values(itemNoteError.value).some(Boolean);
  const hasError = Boolean(
    ordererErrors.value.fullName || ordererErrors.value.email || ordererErrors.value.phone ||
    courierError.value || courierNoteError.value || hasItemNoteError || !selectedAddress.value
  );
  if (hasError) {
    if (!selectedAddress.value) openAddressPage();
    else {
      setTimeout(() => {
        const el = document.querySelector('.merch-checkout-page .field-text-input.has-error');
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); }
      }, 50);
    }
    return;
  }
  isConfirmationModalOpen.value = true;
};

const handleFinalPaymentSubmit = () => {
  emit('proceed-payment', {
    orderer: ordererForm.value,
    address: selectedAddress.value,
    courier: selectedCourier.value,
    shippingCost: shippingCost.value,
    courierNote: courierNote.value,
    items: (props.items || []).map(item => ({ ...item, note: itemNotes.value[itemKey(item)] || '' })),
    voucher: appliedVoucher.value,
    paymentMethod: selectedPaymentMethod.value,
    total: totalPrice.value
  });
};
</script>

<template>
  <div class="merch-checkout-page">
    <div class="buyer-header">
      <button class="back-btn" @click="handleHeaderBack" title="Kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" style="width: 20px; height: 20px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>
      <h1 class="buyer-header-title">{{ currentStep === 1 ? 'Checkout Merch' : 'Metode Pembayaran' }}</h1>
    </div>

    <div class="timer-banner-pill-top">
      <div class="timer-white-circle-badge">
        <svg class="timer-progress-ring-svg" viewBox="0 0 36 36">
          <path class="timer-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path class="timer-ring-fill" :stroke-dasharray="`${timerProgressPercent}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <span class="timer-badge-text">{{ formattedCountdown }}</span>
      </div>
      <span class="timer-banner-text">Segera Selesaikan Pesananmu</span>
    </div>

    <transition name="step-slide-fade" mode="out-in">
      <div v-if="currentStep === 1" key="step1" class="buyer-content-scroll">
        <div class="soft-section-block orderer-section">
          <div class="section-header-row" @click="isOrdererExpanded = !isOrdererExpanded">
            <div class="header-title-group">
              <div class="icon-circle-blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <span class="card-heading-text">Data Pemesan</span>
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
                <label class="field-label-text">Nama Lengkap <span class="required-star">*</span></label>
                <input v-model="ordererForm.fullName" type="text" class="field-text-input" :class="{ 'has-error': ordererErrors.fullName }" placeholder="Masukkan nama lengkap sesuai identitas" @input="validateOrdererField('fullName')" @blur="validateOrdererField('fullName')" />
                <span v-if="ordererErrors.fullName" class="field-error-text">{{ ordererErrors.fullName }}</span>
              </div>
              <div class="form-field-group">
                <label class="field-label-text">Alamat Email <span class="required-star">*</span></label>
                <input v-model="ordererForm.email" type="email" class="field-text-input" :class="{ 'has-error': ordererErrors.email }" placeholder="contoh: nama@email.com" @input="validateOrdererField('email')" @blur="validateOrdererField('email')" />
                <span v-if="ordererErrors.email" class="field-error-text">{{ ordererErrors.email }}</span>
              </div>
              <div class="form-field-group">
                <label class="field-label-text">Nomor Telepon <span class="required-star">*</span></label>
                <div class="phone-input-row">
                  <div class="country-code-selector"><span class="code-text">+62</span></div>
                  <input v-model="ordererForm.phone" type="tel" class="field-text-input" :class="{ 'has-error': ordererErrors.phone }" placeholder="81234567890" @input="validateOrdererField('phone')" @blur="validateOrdererField('phone')" />
                </div>
                <span v-if="ordererErrors.phone" class="field-error-text">{{ ordererErrors.phone }}</span>
              </div>
            </div>
          </transition>
        </div>

        <div class="dashed-section-divider"></div>

        <div class="soft-section-block address-section">
          <div class="section-header-row no-cursor">
            <div class="header-title-group">
              <div class="icon-circle-blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <span class="card-heading-text">Alamat Pengiriman</span>
            </div>
          </div>
          <button class="address-display-card" type="button" @click="openAddressPage">
            <div class="address-display-info">
              <span class="address-label-chip">{{ selectedAddress?.label }}</span>
              <span class="address-receiver">{{ selectedAddress?.receiver }} (+62{{ selectedAddress?.phone }})</span>
              <span class="address-full">{{ selectedAddress?.address }}, {{ selectedAddress?.city }} {{ selectedAddress?.postal }}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" class="address-arrow-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <div class="dashed-section-divider"></div>

        <div class="soft-section-block order-summary-section">
          <div class="section-header-row" @click="isOrderExpanded = !isOrderExpanded">
            <div class="header-title-group">
              <div class="icon-circle-blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                </svg>
              </div>
              <span class="card-heading-text">Pesananmu ({{ totalQty }})</span>
            </div>
            <button class="accordion-chevron-btn" :class="{ 'rotated': isOrderExpanded }" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#494a4a" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
          <transition name="accordion-slide">
            <div v-if="isOrderExpanded" class="section-body-content">
              <div class="order-items-list">
                <div v-for="(item, idx) in items" :key="idx" class="order-item-row">
                  <div class="order-item-top">
                    <img :src="item.merch?.image" :alt="item.merch?.title" class="order-item-thumb" loading="lazy" />
                    <div class="order-item-info">
                      <span class="order-item-title">{{ item.merch?.title }}</span>
                      <span v-if="item.merch?.variant" class="order-item-variant">Varian: {{ item.merch.variant }}</span>
                      <div class="order-item-creator">
                        <img :src="item.merch?.creatorLogo" alt="Kreator" class="order-creator-avatar" loading="lazy" />
                        <span class="order-creator-name">{{ item.merch?.organizer }}</span>
                      </div>
                      <div class="order-item-qty-row">
                        <div class="order-item-price-col">
                          <span class="qty-text">Jumlah: {{ item.qty }}</span>
                          <span v-if="item.merch?.originalPrice" class="order-item-original">{{ item.merch.originalPrice }}</span>
                          <span class="order-item-subtotal" :class="{ 'price-discount': item.merch?.originalPrice }">{{ formatPrice(parsePrice(item.merch?.price) * (item.qty || 1)) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="form-field-group item-note-field">
                    <input v-model="itemNotes[itemKey(item)]" type="text" class="field-text-input item-note-input" :class="{ 'has-error': itemNoteError[itemKey(item)] }" placeholder="Catatan untuk merch ini (opsional)" @input="validateItemNote(item)" @blur="validateItemNote(item)" />
                    <span v-if="itemNoteError[itemKey(item)]" class="field-error-text">{{ itemNoteError[itemKey(item)] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="dashed-section-divider"></div>

        <div class="soft-section-block courier-section">
          <div class="section-header-row" @click="isCourierExpanded = !isCourierExpanded">
            <div class="header-title-group">
              <div class="icon-circle-blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <span class="card-heading-text">Pilih Kurir</span>
            </div>
            <button class="accordion-chevron-btn" :class="{ 'rotated': isCourierExpanded }" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#494a4a" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
          <transition name="accordion-slide">
            <div v-if="isCourierExpanded" class="section-body-content">
              <div class="payment-methods-list">
                <div v-for="c in couriers" :key="c.id" class="payment-method-row-item" :class="{ 'selected': selectedCourier === c.id }" @click="selectedCourier = c.id; validateCourier()">
                  <div class="payment-method-left">
                    <div class="courier-text-col">
                      <span class="payment-method-name">{{ c.name }}</span>
                      <span class="courier-price">{{ formatPrice(c.price) }}</span>
                      <span class="courier-eta">{{ c.eta }}</span>
                    </div>
                  </div>
                  <div class="payment-radio-circle" :class="{ 'checked': selectedCourier === c.id }">
                    <div class="radio-inner-dot"></div>
                  </div>
                </div>
              </div>
              <span v-if="courierError" class="field-error-text">{{ courierError }}</span>
              <div class="form-field-group">
                <label class="field-label-text">Catatan untuk Kurir (Opsional)</label>
                <input v-model="courierNote" type="text" class="field-text-input" :class="{ 'has-error': courierNoteError }" placeholder="Contoh: titip di satpam, hubungi sebelum sampai" @input="validateCourierNote" @blur="validateCourierNote" />
                <span v-if="courierNoteError" class="field-error-text">{{ courierNoteError }}</span>
              </div>
            </div>
          </transition>
        </div>

        <div class="dashed-section-divider"></div>

        <div class="soft-section-block voucher-section">
          <div class="section-header-row" @click="isVoucherExpanded = !isVoucherExpanded">
            <div class="header-title-group">
              <div class="icon-circle-blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
              </div>
              <span class="card-heading-text">Voucher & Promo DISKON</span>
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
                <input v-model="voucherCodeInput" type="text" class="field-text-input voucher-input" placeholder="Masukkan kode voucher (Opsional)" />
                <button class="btn-apply-voucher" :class="{ 'disabled-btn': !voucherCodeInput.trim() }" :disabled="!voucherCodeInput.trim()" @click="handleApplyVoucher" type="button">Gunakan</button>
              </div>
              <div v-else class="voucher-applied-box">
                <div class="voucher-applied-left">
                  <span class="voucher-badge-code">{{ appliedVoucher.code }}</span>
                  <span class="voucher-badge-desc">{{ appliedVoucher.discountText }} Voucher Berhasil Dipasang!</span>
                </div>
                <button class="btn-remove-voucher" @click="removeVoucher" type="button">Batal</button>
              </div>
              <span v-if="voucherError" class="voucher-error-msg">{{ voucherError }}</span>
            </div>
          </transition>
        </div>

        <div class="dashed-section-divider"></div>

        <div class="soft-section-block summary-section">
          <div class="section-header-row no-cursor">
            <div class="header-title-group">
              <div class="icon-circle-blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="card-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                </svg>
              </div>
              <span class="card-heading-text">Ringkasan Pesanan</span>
            </div>
          </div>
          <div class="order-total-mini">
            <div class="mini-row"><span>Subtotal ({{ totalQty }} barang)</span><span>{{ formatPrice(subtotal) }}</span></div>
            <div class="mini-row"><span>Kurir ({{ selectedCourierName }})</span><span>{{ formatPrice(shippingCost) }}</span></div>
            <div v-if="appliedVoucher" class="mini-row discount"><span>Voucher {{ appliedVoucher.code }}</span><span>-{{ formatPrice(discountValue) }}</span></div>
            <div class="mini-row grand"><span>Total Bayar</span><span>{{ formatPrice(totalPrice) }}</span></div>
          </div>
        </div>
      </div>

      <div v-else key="step2" class="buyer-content-scroll">
        <div class="payment-total-summary-block">
          <div class="total-summary-left">
            <span class="total-summary-label">Total Tagihan Pembayaran</span>
            <span class="total-summary-price">{{ formatPrice(totalPrice) }}</span>
          </div>
          <div class="total-summary-timer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#ef4444" style="width: 14px; height: 14px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>{{ formattedCountdown }}</span>
          </div>
        </div>
        <div v-for="cat in paymentCategories" :key="cat.categoryTitle" class="soft-section-block payment-category-section">
          <span class="payment-category-title">{{ cat.categoryTitle }}</span>
          <div class="payment-methods-list">
            <div v-for="method in cat.methods" :key="method.id" class="payment-method-row-item" :class="{ 'selected': selectedPaymentMethod === method.id }" @click="selectedPaymentMethod = method.id">
              <div class="payment-method-left">
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

    <div class="buyer-bottom-sticky-bar">
      <div class="sticky-total-row">
        <span class="sticky-total-label">Total ({{ totalQty }} barang)</span>
        <span class="sticky-total-price">{{ formatPrice(totalPrice) }}</span>
      </div>
      <div class="sticky-buttons-row">
        <button v-if="currentStep === 1" class="btn-sticky-solid-next full-flex" @click="goToStep2" type="button">Selanjutnya</button>
        <button v-else class="btn-sticky-solid-next full-flex" @click="handleFinalPaymentSubmit" type="button">Bayar Sekarang</button>
      </div>
    </div>

    <transition name="sheet-slide-up">
      <div v-if="isConfirmationModalOpen" class="modal-backdrop-overlay" @click.self="closeConfirmationModal" @touchmove.prevent @wheel.prevent>
        <div class="draggable-bottom-sheet-card" :style="{ transform: `translateY(${dragY}px)` }" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @mousedown="onMouseDown">
          <div class="bottom-sheet-drag-bar"><div class="drag-pill-handle"></div></div>
          <div class="confirm-modal-header">
            <div class="confirm-title-left">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" class="warning-triangle-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <h3 class="confirm-title-text">Konfirmasi</h3>
            </div>
            <button class="confirm-close-btn" @click="closeConfirmationModal" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#64748b" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="confirm-modal-body">
            <p class="confirm-subtitle-text">Pastikan data kamu sudah benar yaa!</p>
            <div class="confirm-data-summary-group">
              <div class="summary-item-block">
                <span class="summary-item-label">Penerima</span>
                <span class="summary-item-value">{{ selectedAddress?.receiver }} (+62{{ selectedAddress?.phone }})</span>
              </div>
              <div class="summary-item-block">
                <span class="summary-item-label">Alamat Pengiriman</span>
                <span class="summary-item-value">{{ selectedAddress?.address }}, {{ selectedAddress?.city }} {{ selectedAddress?.postal }}</span>
              </div>
              <div class="summary-item-block">
                <span class="summary-item-label">Kurir</span>
                <span class="summary-item-value">{{ selectedCourierName }} ({{ formatPrice(shippingCost) }})</span>
              </div>
              <div class="summary-item-block">
                <span class="summary-item-label">Total Bayar</span>
                <span class="summary-item-value">{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>
            <div class="confirm-info-soft-box">
              <div class="info-item-row">
                <div class="number-circle-num">1</div>
                <div class="info-item-text-col">
                  <span>Kurir akan menghubungi nomor berikut jika ada kendala:</span>
                  <span class="info-bold-text">62{{ selectedAddress?.phone }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="confirm-modal-footer">
            <button class="btn-modal-edit-data" @click="closeConfirmationModal" type="button">Edit</button>
            <button class="btn-modal-understand" @click="confirmAndProceedToStep2" type="button">Saya Mengerti</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="sheet-slide-up">
      <div v-if="isAddressPageOpen" class="address-page">
        <div class="buyer-header">
          <button class="back-btn" @click="closeAddressPage" title="Kembali">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" style="width: 20px; height: 20px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 class="buyer-header-title">Pilih Alamat</h1>
        </div>
        <div class="address-page-scroll">
          <div class="map-search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.2" class="search-bar-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input v-model="mapQuery" type="text" placeholder="Cari alamat / patokan..." class="search-bar-input" />
            <button v-if="mapQuery" class="search-close-btn" type="button" title="Hapus" @click="mapQuery = ''">
              <svg viewBox="0 0 24 24" fill="none" stroke="#494a4a" stroke-width="2" class="close-search-icon">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <button class="pin-map-card" type="button" @click="openMapFullscreen">
            <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pin-location-icon">
              <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <div class="pin-map-info">
              <span class="pin-map-title">{{ selectedAddress?.pin }}</span>
              <span class="pin-map-sub">Ketuk untuk lihat peta fullscreen</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" class="address-arrow-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div class="section-mini-label">Alamat Tersimpan
            <button class="mini-edit-btn" type="button" @click="isAddressEditMode = !isAddressEditMode">{{ isAddressEditMode ? 'Selesai' : 'Edit' }}</button>
          </div>
          <div v-if="filteredAddresses.length > 0" class="address-history-list">
            <div v-for="a in filteredAddresses" :key="a.id" class="address-history-card" :class="{ active: selectedAddressId === a.id }">
              <button class="address-select-area" type="button" @click="chooseAddress(a.id)">
                <div class="address-history-info">
                  <span class="address-label-chip">{{ a.label }}</span>
                  <span class="address-receiver">{{ a.receiver }} (+62{{ a.phone }})</span>
                  <span class="address-full">{{ a.address }}, {{ a.city }} {{ a.postal }}</span>
                </div>
              </button>
              <div v-if="isAddressEditMode" class="address-card-actions">
                <button class="icon-btn" type="button" title="Edit alamat" @click.stop="startEditAddress(a.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mini-action-icon"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></svg>
                </button>
                <button class="icon-btn" type="button" title="Hapus alamat" @click.stop="deleteAddress(a.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#e52424" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mini-action-icon"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-merch-state">
            <h3 class="empty-title">Alamat tidak ditemukan</h3>
            <p class="empty-desc">Coba kata kunci lain atau tambah alamat baru.</p>
          </div>
          <button class="custom-address-toggle" type="button" @click="openCustomAddressPage">
            <span>+ Tambah Alamat Baru</span>
          </button>
          <span v-if="addressPageError" class="field-error-text">{{ addressPageError }}</span>
        </div>
        <div class="address-bottom-bar">
          <button class="btn-sticky-solid-next full-flex" type="button" @click="confirmAddressChoice">Gunakan Alamat Ini</button>
        </div>
      </div>
    </transition>

    <transition name="sheet-slide-up">
      <div v-if="isMapFullscreenOpen" class="map-fullscreen-page">
        <div class="map-fullscreen-canvas">
          <iframe title="Peta lokasi alamat" :src="mapEmbedSrc" loading="lazy"></iframe>
          <div class="map-search-float">
            <div class="map-search-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.2" class="search-bar-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input v-model="mapSearchQuery" type="text" placeholder="Cari alamat di peta..." class="search-bar-input" @input="onMapSearchInput" @focus="mapSearchFocused = true" />
              <button v-if="mapSearchQuery" class="search-close-btn" type="button" title="Hapus" @click="mapSearchQuery = ''; mapSuggestions = []">
                <svg viewBox="0 0 24 24" fill="none" stroke="#494a4a" stroke-width="2" class="close-search-icon">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div v-if="mapSearchFocused && (mapSuggestions.length > 0 || mapSearching || mapSearchError)" class="map-suggest-list">
              <div v-if="mapSearching" class="map-suggest-hint">Mencari alamat...</div>
              <div v-else-if="mapSearchError" class="map-suggest-hint error">{{ mapSearchError }}</div>
              <button v-for="(s, idx) in mapSuggestions" :key="idx" class="map-suggest-item" type="button" @click="applyMapSuggestion(s)">
                <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2" class="suggest-pin-icon"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                <span class="suggest-text">{{ s.label }}</span>
              </button>
            </div>
          </div>
          <button class="map-fullscreen-back" type="button" title="Kembali" @click="closeMapFullscreen">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" style="width: 20px; height: 20px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <span class="map-center-pin">📍</span>
        </div>
        <div class="map-bottom-sheet">
          <span class="pin-detail-title">Detail Pin Point</span>
          <span class="pin-map-title">{{ selectedAddress?.pin }}</span>
          <span class="pin-detail-text">{{ selectedAddress?.address }}, {{ selectedAddress?.city }} {{ selectedAddress?.postal }}</span>
          <button class="btn-sticky-solid-next full-flex" type="button" @click="confirmMapPin">Pakai Pin Ini</button>
        </div>
      </div>
    </transition>

    <transition name="sheet-slide-up">
      <div v-if="isCustomAddressPageOpen" class="address-page">
        <div class="buyer-header">
          <button class="back-btn" @click="closeCustomAddressPage" title="Kembali">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" style="width: 20px; height: 20px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 class="buyer-header-title">Tambah Alamat Baru</h1>
        </div>
        <div class="address-page-scroll">
          <div class="form-field-group">
            <label class="field-label-text">Nama Penerima <span class="required-star">*</span></label>
            <input v-model="addressForm.receiver" type="text" class="field-text-input" :class="{ 'has-error': addressErrors.receiver }" placeholder="Nama penerima paket" @input="validateAddressField('receiver')" @blur="validateAddressField('receiver')" />
            <span v-if="addressErrors.receiver" class="field-error-text">{{ addressErrors.receiver }}</span>
          </div>
          <div class="form-field-group">
            <label class="field-label-text">Nomor Telepon Penerima <span class="required-star">*</span></label>
            <div class="phone-input-row">
              <div class="country-code-selector"><span class="code-text">+62</span></div>
              <input v-model="addressForm.phone" type="tel" class="field-text-input" :class="{ 'has-error': addressErrors.phone }" placeholder="81234567890" @input="validateAddressField('phone')" @blur="validateAddressField('phone')" />
            </div>
            <span v-if="addressErrors.phone" class="field-error-text">{{ addressErrors.phone }}</span>
          </div>
          <div class="form-field-group">
            <label class="field-label-text">Alamat Lengkap <span class="required-star">*</span></label>
            <div class="address-suggest-wrap">
              <input v-model="addressForm.address" type="text" class="field-text-input field-text-input-alamat-lengkap" :class="{ 'has-error': addressErrors.address }" placeholder="Jalan, nomor rumah, patokan" @input="onAddressSuggestInput(); validateAddressField('address')" @blur="validateAddressField('address')" @focus="addressSuggestFocused = true" />
              <div v-if="addressSuggestFocused && (addressSuggestions.length > 0 || addressSearching || addressSuggestError)" class="map-suggest-list address-suggest-list">
                <div v-if="addressSearching" class="map-suggest-hint">Mencari alamat...</div>
                <div v-else-if="addressSuggestError" class="map-suggest-hint error">{{ addressSuggestError }}</div>
                <button v-for="(s, idx) in addressSuggestions" :key="idx" class="map-suggest-item" type="button" @mousedown.prevent="applyAddressSuggestion(s)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2" class="suggest-pin-icon"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  <span class="suggest-text">{{ s.label }}</span>
                </button>
              </div>
            </div>
            <span v-if="addressErrors.address" class="field-error-text">{{ addressErrors.address }}</span>
          </div>
          <div class="form-row-2col">
            <div class="form-field-group">
              <label class="field-label-text">Kota <span class="required-star">*</span></label>
              <input v-model="addressForm.city" type="text" class="field-text-input" :class="{ 'has-error': addressErrors.city }" placeholder="Kota" @input="validateAddressField('city')" @blur="validateAddressField('city')" />
              <span v-if="addressErrors.city" class="field-error-text">{{ addressErrors.city }}</span>
            </div>
            <div class="form-field-group">
              <label class="field-label-text">Kode Pos <span class="required-star">*</span></label>
              <input v-model="addressForm.postal" type="tel" class="field-text-input" :class="{ 'has-error': addressErrors.postal }" placeholder="40123" @input="validateAddressField('postal')" @blur="validateAddressField('postal')" />
              <span v-if="addressErrors.postal" class="field-error-text">{{ addressErrors.postal }}</span>
            </div>
          </div>
        </div>
        <div class="address-bottom-bar">
          <button class="btn-sticky-solid-next full-flex" type="button" @click="saveCustomAddress">Simpan Alamat Ini</button>
        </div>
      </div>
    </transition>

    <transition name="sheet-slide-up">
      <div v-if="isEditAddressSheetOpen" class="modal-backdrop-overlay" @click.self="closeEditAddressSheet" @touchmove.prevent @wheel.prevent>
        <div class="draggable-bottom-sheet-card edit-address-sheet" :style="{ transform: `translateY(${editDragY}px)` }" @touchstart="onEditTouchStart" @touchmove="onEditTouchMove" @touchend="onEditTouchEnd" @mousedown="onEditMouseDown">
          <div class="bottom-sheet-drag-bar"><div class="drag-pill-handle"></div></div>
          <div class="confirm-modal-header">
            <div class="confirm-title-left">
              <h3 class="confirm-title-text">Edit Alamat</h3>
            </div>
            <button class="confirm-close-btn" @click="closeEditAddressSheet" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#64748b" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="confirm-modal-body">
            <div class="form-field-group">
              <label class="field-label-text">Label Alamat <span class="required-star">*</span></label>
              <input v-model="editForm.label" type="text" class="field-text-input" :class="{ 'has-error': editErrors.label }" placeholder="Rumah / Kantor" @input="validateEditField('label')" @blur="validateEditField('label')" />
              <span v-if="editErrors.label" class="field-error-text">{{ editErrors.label }}</span>
            </div>
            <div class="form-field-group">
              <label class="field-label-text">Nama Penerima <span class="required-star">*</span></label>
              <input v-model="editForm.receiver" type="text" class="field-text-input" :class="{ 'has-error': editErrors.receiver }" placeholder="Nama penerima paket" @input="validateEditField('receiver')" @blur="validateEditField('receiver')" />
              <span v-if="editErrors.receiver" class="field-error-text">{{ editErrors.receiver }}</span>
            </div>
            <div class="form-field-group">
              <label class="field-label-text">Nomor Telepon <span class="required-star">*</span></label>
              <div class="phone-input-row">
                <div class="country-code-selector"><span class="code-text">+62</span></div>
                <input v-model="editForm.phone" type="tel" class="field-text-input" :class="{ 'has-error': editErrors.phone }" placeholder="81234567890" @input="validateEditField('phone')" @blur="validateEditField('phone')" />
              </div>
              <span v-if="editErrors.phone" class="field-error-text">{{ editErrors.phone }}</span>
            </div>
            <div class="form-field-group">
              <label class="field-label-text">Alamat Lengkap <span class="required-star">*</span></label>
              <div class="address-suggest-wrap">
                <input v-model="editForm.address" type="text" class="field-text-input field-text-input-alamat-lengkap" :class="{ 'has-error': editErrors.address }" placeholder="Jalan, nomor rumah, patokan" @input="onEditAddressSuggestInput(); validateEditField('address')" @blur="validateEditField('address')" @focus="editAddressSuggestFocused = true" />
                <div v-if="editAddressSuggestFocused && (editAddressSuggestions.length > 0 || editAddressSearching || editAddressSuggestError)" class="map-suggest-list address-suggest-list">
                  <div v-if="editAddressSearching" class="map-suggest-hint">Mencari alamat...</div>
                  <div v-else-if="editAddressSuggestError" class="map-suggest-hint error">{{ editAddressSuggestError }}</div>
                  <button v-for="(s, idx) in editAddressSuggestions" :key="idx" class="map-suggest-item" type="button" @mousedown.prevent="applyEditAddressSuggestion(s)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2" class="suggest-pin-icon"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                    <span class="suggest-text">{{ s.label }}</span>
                  </button>
                </div>
              </div>
              <span v-if="editErrors.address" class="field-error-text">{{ editErrors.address }}</span>
            </div>
            <div class="form-row-2col">
              <div class="form-field-group">
                <label class="field-label-text">Kota <span class="required-star">*</span></label>
                <input v-model="editForm.city" type="text" class="field-text-input" :class="{ 'has-error': editErrors.city }" placeholder="Kota" @input="validateEditField('city')" @blur="validateEditField('city')" />
                <span v-if="editErrors.city" class="field-error-text">{{ editErrors.city }}</span>
              </div>
              <div class="form-field-group">
                <label class="field-label-text">Kode Pos <span class="required-star">*</span></label>
                <input v-model="editForm.postal" type="tel" class="field-text-input" :class="{ 'has-error': editErrors.postal }" placeholder="40123" @input="validateEditField('postal')" @blur="validateEditField('postal')" />
                <span v-if="editErrors.postal" class="field-error-text">{{ editErrors.postal }}</span>
              </div>
            </div>
          </div>
          <div class="confirm-modal-footer">
            <button class="btn-modal-edit-data" type="button" @click="deleteAddress(editingAddressId)">Hapus</button>
            <button class="btn-modal-understand" type="button" @click="saveEditedAddress">Simpan</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.merch-checkout-page { display: flex; flex-direction: column; width: 100%; max-width: 100%; min-height: 100vh; background-color: #ffffff; font-family: var(--font-sans); position: relative; overflow-x: hidden !important; }
.buyer-header { display: flex; align-items: center; justify-content: center; padding: 8px 16px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; z-index: 100; height: 52px; box-sizing: border-box; }
.back-btn { position: absolute; left: 12px; background: transparent !important; border: none !important; cursor: pointer; color: #194e9e; display: flex; align-items: center; justify-content: center; padding: 4px; }
.buyer-header-title { font-size: 15px; font-weight: 600; color: #151416; margin: 0; text-align: center; }
.timer-banner-pill-top { width: 100%; height: 44px; background-color: #194e9e; display: flex; align-items: center; justify-content: center; gap: 10px; box-sizing: border-box; padding: 0 16px; position: sticky; top: 48px; z-index: 99; box-shadow: 0 2px 8px rgba(25, 78, 158, 0.15); margin-top: -4px; }
.timer-white-circle-badge { width: 30px; height: 30px; border-radius: 50%; background-color: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 6px rgba(0, 0, 0, 0.16); flex-shrink: 0; position: relative; }
.timer-progress-ring-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); pointer-events: none; }
.timer-ring-bg { fill: none; stroke: #cbd5e1; stroke-width: 3.6; }
.timer-ring-fill { fill: none; stroke: #2563eb; stroke-width: 4.2; stroke-linecap: round; transition: stroke-dasharray 1s linear; }
.timer-badge-text { font-size: 8.5px; font-weight: 600; color: #0f172a; font-family: 'Poppins', sans-serif; letter-spacing: -0.3px; z-index: 2; line-height: 1; }
.timer-banner-text { font-size: 15.8px; font-weight: 300; color: #ffffff; white-space: nowrap; }
.buyer-content-scroll { overflow-x: hidden; overflow-y: auto; padding: 16px 16px 160px 16px; display: flex; flex-direction: column; gap: 6px; background-color: #ffffff; }
.dashed-section-divider { width: 100%; height: 1px; border-bottom: 1.5px dashed #e2e8f0; margin: 4px 0; display: block; }
.soft-section-block { background-color: transparent !important; border-radius: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; border: none !important; box-shadow: none !important; }
.section-header-row { display: flex; justify-content: space-between; align-items: center; background-color: transparent; cursor: pointer; user-select: none; }
.section-header-row.no-cursor { cursor: default; }
.header-title-group { display: flex; align-items: center; gap: 10px; overflow: hidden; max-width: 85%; }
.icon-circle-blue { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-icon { width: 19px; height: 19px; color: #194e9e; }
.card-heading-text { font-size: 14px; font-weight: 600; color: #151416; }
.accordion-chevron-btn { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: transform 0.25s ease; flex-shrink: 0; }
.accordion-chevron-btn.rotated { transform: rotate(180deg); }
.section-body-content { padding-top: 4px; display: flex; flex-direction: column; gap: 12px; }
.order-items-list { display: flex; flex-direction: column; gap: 12px; }
.order-item-row { display: flex; flex-direction: column; gap: 8px; background: #fff; border: 1px solid #eef2f7; border-radius: 12px; padding: 10px; box-sizing: border-box; }
.order-item-top { display: flex; gap: 10px; align-items: flex-start; width: 100%; }
.order-item-thumb { width: 72px; height: 88px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #f1f5f9; align-self: stretch; }
.order-item-info { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 3px; }
.order-item-title { font-size: 12.5px; font-weight: 600; color: #151416; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; }
.order-item-variant { font-size: 10.5px; font-weight: 500; color: #64748b; background: #f1f5f9; border-radius: 6px; padding: 2px 8px; align-self: flex-start; white-space: nowrap; }
.order-item-creator { display: flex; align-items: center; gap: 6px; min-width: 0; }
.order-creator-avatar { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; border: 1px solid #dbeafe; flex-shrink: 0; }
.order-creator-name { font-size: 11px; font-weight: 500; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
.order-item-price-row { display: flex; flex-direction: row; align-items: baseline; gap: 6px; }
.order-item-original { font-size: 10px; font-weight: 400; color: #94a3b8; text-decoration: line-through; text-decoration-color: #ef4444; white-space: nowrap; }
.order-item-price { font-size: 12.5px; font-weight: 500; color: #475569; white-space: nowrap; }
.order-item-price.price-discount { color: #e52424; font-weight: 700; }
.order-item-qty-row { display: flex; align-items: flex-start; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.order-item-price-col { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; margin-left: auto; }
.item-note-field { margin-top: 0; width: 100%; gap: 2px; }
.item-note-input { height: 26px; font-size: 10.5px; font-weight: 400; padding: 0 10px; border-radius: 6px; }
.qty-control { display: flex; align-items: center; gap: 10px; background: #f1f5f9; border-radius: 20px; padding: 2px 6px; flex-shrink: 0; }
.qty-btn { width: 24px; height: 24px; border-radius: 50%; border: none; background: #fff; font-size: 14px; font-weight: 700; line-height: 1; color: #194e9e; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; padding: 0; }
.qty-value { font-size: 12.5px; font-weight: 700; color: #0f172a; min-width: 18px; text-align: center; }
.order-item-subtotal { font-size: 12.5px; font-weight: 700; color: #151416; white-space: nowrap; }
.order-item-subtotal.price-discount { color: #e52424; }
.qty-text { font-size: 11.5px; font-weight: 500; color: #475569; white-space: nowrap; }
.courier-price { font-size: 12px; font-weight: 400; color: #64748b; white-space: nowrap; }
.address-display-card { display: flex; align-items: center; gap: 10px; width: 100%; background: #f8fafc; border: 1px solid #eef2f7; border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; font-family: inherit; }
.address-display-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.address-label-chip { align-self: flex-start; font-size: 10px; font-weight: 600; color: #64748b; background: transparent; padding: 0; }
.address-receiver { font-size: 12.5px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.address-full { font-size: 11.5px; color: #64748b; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.address-arrow-icon { width: 18px; height: 18px; flex-shrink: 0; }
.address-page { position: absolute; inset: 0; background: #fff; z-index: 300; display: flex; flex-direction: column; font-family: var(--font-sans); }
.address-page-scroll { flex: 1; overflow-y: auto; padding: 12px 16px 16px 16px; display: flex; flex-direction: column; gap: 10px; scrollbar-width: none; }
.address-page-scroll::-webkit-scrollbar { display: none; }
.map-search-bar { display: flex; align-items: center; background-color: #f5f6f8; border: 1px solid #e5e7eb; border-radius: 50px; padding: 0 14px; height: 44px; width: 100%; box-sizing: border-box; }
.search-bar-icon { width: 17px; height: 17px; margin-right: 10px; stroke: #194e9e; flex-shrink: 0; }
.search-bar-input { border: none; background: transparent; outline: none; font-size: 12.5px; color: #1f2937; flex: 1; width: 100%; font-family: inherit; }
.search-close-btn { background: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 4px; margin-left: 6px; border-radius: 50%; }
.close-search-icon { width: 15px; height: 15px; }
.pin-map-card { display: flex; align-items: center; gap: 10px; background: #f8fafc; border: none; border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; font-family: inherit; width: 100%; box-sizing: border-box; }
.pin-location-icon { width: 22px; height: 22px; flex-shrink: 0; }
.pin-map-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.pin-map-title { font-size: 12.5px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pin-map-sub { font-size: 11px; color: #64748b; }
.pin-detail-card { display: flex; flex-direction: column; gap: 6px; background: #f8fafc; border: 1px dashed #bfdbfe; border-radius: 10px; padding: 10px 12px; }
.pin-map-embed { width: 100%; height: 160px; border-radius: 8px; overflow: hidden; background: #e2e8f0; }
.pin-map-embed iframe { width: 100%; height: 100%; border: 0; }
.pin-detail-title { font-size: 12px; font-weight: 700; color: #194e9e; }
.pin-detail-text { font-size: 12px; color: #334155; line-height: 1.5; }
.section-mini-label { font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px; display: flex; align-items: center; justify-content: space-between; }
.mini-edit-btn { background: none; border: none; color: #194e9e; font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px 0; font-family: inherit; }
.address-select-area { flex: 1; min-width: 0; background: none; border: none; padding: 0; text-align: left; cursor: pointer; font-family: inherit; }
.address-card-actions { display: flex; gap: 6px; flex-shrink: 0; align-items: flex-start; }
.icon-btn { width: 30px; height: 30px; border-radius: 50%; background: #f1f5f9; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; padding: 0; }
.mini-action-icon { width: 15px; height: 15px; }
.edit-address-sheet { max-height: 92vh; overflow-y: auto; }
.address-history-list { display: flex; flex-direction: column; gap: 8px; }
.address-history-card { display: flex; gap: 10px; align-items: flex-start; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; font-family: inherit; width: 100%; box-sizing: border-box; }
.address-history-card.active { border-color: #194e9e; background: #f0f6ff; }
.address-history-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.custom-address-toggle { background: none; border: none; color: #194e9e; font-size: 13px; font-weight: 600; cursor: pointer; align-self: flex-start; padding: 4px 0; font-family: inherit; }
.custom-address-form { display: flex; flex-direction: column; gap: 12px; background: #f8fafc; border-radius: 12px; padding: 12px; }
.empty-merch-state { display: flex; flex-direction: column; align-items: center; padding: 24px; text-align: center; gap: 6px; }
.empty-title { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0; }
.empty-desc { font-size: 12px; color: #64748b; margin: 0; }
.address-bottom-bar { padding: 10px 16px 16px 16px; background: #fff; border-top: 1px solid #e2e8f0; }
.map-fullscreen-page { position: absolute; inset: 0; background: #e2e8f0; z-index: 400; display: flex; flex-direction: column; }
.map-fullscreen-canvas { position: relative; flex: 1; min-height: 0; background: #e2e8f0; }
.map-fullscreen-canvas iframe { width: 100%; height: 100%; border: 0; display: block; }
.map-fullscreen-back { position: absolute; top: 12px; left: 12px; width: 38px; height: 38px; border-radius: 50%; background: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.map-search-float { position: absolute; top: 12px; left: 62px; right: 12px; z-index: 2; }
.map-search-float .map-search-bar { box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
.map-suggest-list { margin-top: 6px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(15,23,42,0.14); max-height: 220px; overflow-y: auto; }
.map-suggest-hint { padding: 10px 14px; font-size: 12px; color: #64748b; }
.map-suggest-hint.error { color: #e52424; }
.map-suggest-item { display: flex; align-items: center; gap: 8px; width: 100%; background: #fff; border: none; border-bottom: 1px solid #f1f5f9; padding: 10px 14px; cursor: pointer; text-align: left; font-family: inherit; }
.map-suggest-item:last-child { border-bottom: none; }
.address-suggest-wrap { position: relative; width: 100%; }
.address-suggest-list { position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 20; }
.suggest-pin-icon { width: 16px; height: 16px; flex-shrink: 0; }
.suggest-text { font-size: 12px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.map-center-pin { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); font-size: 34px; pointer-events: none; }
.map-bottom-sheet { background: #fff; border-radius: 16px 16px 0 0; padding: 12px 16px 16px 16px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 -8px 24px rgba(15,23,42,0.12); margin-top: -16px; position: relative; z-index: 1; }
.map-bottom-sheet .btn-sticky-solid-next { margin-top: 8px; }
.order-total-mini { display: flex; flex-direction: column; gap: 4px; background: #f8fafc; border-radius: 10px; padding: 10px 12px; }
.mini-row { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #494a4a; }
.mini-row.discount { color: #15803d; font-weight: 600; }
.mini-row.grand { font-size: 13.5px; font-weight: 700; color: #151416; }
.courier-text-col { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.courier-eta { font-size: 10.5px; color: #64748b; }
.voucher-input-group { display: flex; gap: 8px; align-items: center; width: 100%; }
.voucher-input { flex: 1; }
.btn-apply-voucher { height: 42px; padding: 0 16px; background-color: #194e9e; color: #ffffff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-apply-voucher.disabled-btn, .btn-apply-voucher:disabled { background-color: #e2e8f0 !important; color: #94a3b8 !important; cursor: not-allowed !important; }
.voucher-applied-box { display: flex; justify-content: space-between; align-items: center; background-color: #eff6ff; padding: 10px 14px; border-radius: 8px; }
.voucher-applied-left { display: flex; align-items: center; gap: 8px; }
.voucher-badge-code { font-size: 12px; font-weight: 600; color: #194e9e; background-color: #dbeafe; padding: 2px 6px; border-radius: 4px; }
.voucher-badge-desc { font-size: 11.5px; font-weight: 500; color: #151416; }
.btn-remove-voucher { background: none; border: none; color: #ef4444; font-size: 12px; font-weight: 600; cursor: pointer; }
.voucher-error-msg { font-size: 11px; color: #ef4444; font-weight: 500; }
.form-field-group { display: flex; flex-direction: column; gap: 4px; width: 100%; text-align: left; }
.field-label-text { font-size: 12px; font-weight: 600; color: #151416; display: flex; align-items: center; }
.required-star { color: #ef4444; font-weight: 600; margin-left: 2px; }
.phone-input-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.country-code-selector { height: 42px; padding: 0 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; background-color: #ffffff; display: flex; align-items: center; font-size: 13px; font-weight: 500; color: #151416; flex-shrink: 0; user-select: none; }
.field-text-input { width: 100%; height: 42px; padding: 0 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #151416; outline: none; background-color: #ffffff; box-sizing: border-box; font-family: var(--font-sans); }
.field-text-input.has-error { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important; }
.field-error-text { font-size: 11px; color: #ef4444; font-weight: 500; margin-top: 2px; text-align: left; }
.field-text-input:focus { border-color: #194e9e; box-shadow: 0 0 0 3px rgba(25, 78, 158, 0.12); }
.field-text-input::placeholder { color: #94a3b8; }
.form-row-2col { display: flex; gap: 10px; }
.form-row-2col .form-field-group { flex: 1; min-width: 0; }
.payment-total-summary-block { background-color: #eff6ff; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
.total-summary-left { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.total-summary-label { font-size: 11px; color: #494a4a; }
.total-summary-price { font-size: 16px; font-weight: 700; color: #194e9e; }
.total-summary-timer { display: flex; align-items: center; gap: 4px; background-color: #fee2e2; color: #ef4444; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 6px; }
.payment-category-section { display: flex; flex-direction: column; gap: 10px; }
.payment-category-title { font-size: 13px; font-weight: 600; color: #151416; text-align: left; }
.payment-methods-list { display: flex; flex-direction: column; gap: 8px; }
.payment-method-row-item { display: flex; align-items: center; justify-content: space-between; background-color: #ffffff; padding: 12px 14px; border-radius: 10px; cursor: pointer; }
.payment-method-row-item.selected { background-color: #eff6ff; }
.payment-method-left { display: flex; align-items: center; gap: 10px; }
.payment-method-icon { font-size: 16px; }
.payment-method-name { font-size: 13px; font-weight: 500; color: #151416; }
.payment-radio-circle { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #cbd5e1; background: #fff; display: flex; align-items: center; justify-content: center; }
.payment-radio-circle.checked { border-color: #194e9e; background-color: #fff; }
.radio-inner-dot { width: 8px; height: 8px; background-color: #194e9e; border-radius: 50%; display: none; }
.payment-radio-circle.checked .radio-inner-dot { display: block; }
.buyer-bottom-sticky-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 8px 12px 10px 12px; box-sizing: border-box; z-index: 200; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.12); }
.sticky-total-row { display: flex; align-items: center; justify-content: space-between; }
.sticky-total-label { font-size: 12px; color: #494a4a; }
.sticky-total-price { font-size: 15px; font-weight: 700; color: #151416; }
.sticky-buttons-row { display: flex; align-items: center; width: 100%; }
.btn-sticky-solid-next.full-flex { width: 100%; height: 44px; background-color: #194e9e; border: none; border-radius: 10px; color: #ffffff; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(25, 78, 158, 0.25); }
.modal-backdrop-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.55); z-index: 999; display: flex; align-items: flex-end; justify-content: center; touch-action: none; overscroll-behavior: contain; }
.draggable-bottom-sheet-card { width: 100%; max-width: 480px; max-height: 94vh; background-color: #ffffff; border-radius: 12px 12px 0 0; padding: 10px 16px 0 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2); position: relative; }
.bottom-sheet-drag-bar { width: 100%; display: flex; justify-content: center; padding-bottom: 4px; cursor: grab; }
.drag-pill-handle { width: 40px; height: 5px; background-color: #cbd5e1; border-radius: 10px; }
.confirm-modal-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.confirm-title-left { display: flex; align-items: center; gap: 8px; }
.warning-triangle-icon { width: 22px; height: 22px; flex-shrink: 0; }
.confirm-title-text { font-size: 16px; font-weight: 600; color: #151416; margin: 0; }
.confirm-close-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.confirm-modal-body { display: flex; flex-direction: column; gap: 10px; text-align: left; }
.confirm-subtitle-text { font-size: 13px; color: #151416; margin: 0 0 2px 0; font-weight: 600; }
.confirm-data-summary-group { display: flex; flex-direction: column; gap: 8px; }
.summary-item-block { display: flex; flex-direction: column; gap: 2px; }
.summary-item-label { font-size: 11.5px; color: #151416; font-weight: 600; }
.summary-item-value { font-size: 13.5px; font-weight: 500; color: #151416; }
.confirm-info-soft-box { background-color: #f0f7ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.info-item-row { display: flex; align-items: flex-start; gap: 10px; }
.number-circle-num { width: 20px; height: 20px; border-radius: 50%; background-color: #194e9e; color: #ffffff; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.info-item-text-col { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: #151416; font-weight: 600; line-height: 1.35; }
.info-bold-text { font-weight: 500; }
.info-item-divider { height: 1px; background-color: #e2e8f0; width: 100%; }
.confirm-modal-footer { position: sticky; bottom: 0; background-color: #ffffff; padding: 14px 16px 16px 16px; margin: 10px -16px 0 -16px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; }
.btn-modal-edit-data { flex: 1; height: 42px; border: 1.5px solid #194e9e; background-color: #ffffff; color: #194e9e; font-size: 14px; font-weight: 600; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-modal-understand { flex: 1; height: 42px; border: none; background-color: #194e9e; color: #ffffff; font-size: 14px; font-weight: 600; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.sheet-slide-up-enter-active { transition: opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1); }
.sheet-slide-up-leave-active { transition: opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1); }
.sheet-slide-up-enter-active .draggable-bottom-sheet-card { transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1); }
.sheet-slide-up-leave-active .draggable-bottom-sheet-card { transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1); }
.sheet-slide-up-enter-from, .sheet-slide-up-leave-to { opacity: 0; }
.sheet-slide-up-enter-from .draggable-bottom-sheet-card, .sheet-slide-up-leave-to .draggable-bottom-sheet-card { transform: translateY(100%) !important; }
.accordion-slide-enter-active, .accordion-slide-leave-active { transition: all 0.25s ease-in-out; max-height: 500px; opacity: 1; overflow: hidden; }
.accordion-slide-enter-from, .accordion-slide-leave-to { max-height: 0; opacity: 0; padding-top: 0 !important; padding-bottom: 0 !important; overflow: hidden; }
.step-slide-fade-enter-active, .step-slide-fade-leave-active { transition: all 0.32s cubic-bezier(0.4, 0, 0.2, 1); }
.step-slide-fade-enter-from { opacity: 0; transform: translateX(36px); }
.step-slide-fade-leave-to { opacity: 0; transform: translateX(-36px); }
</style>
