<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  event: {
    type: Object,
    required: true,
    default: () => ({
      id: 1,
      title: 'Ngamen 0.5',
      price: 'Rp124.000',
      organizer: 'Maxpaincompany LTD',
      creatorLogo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80',
      location: 'Karawang',
      date: 'Sat, 24 Aug 2024',
      sold: 80,
      total: 124,
      status: 'Live',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'
    })
  }
});

const emit = defineEmits(['back', 'navigate-chat', 'buy-ticket']);

const handleContactOrganizer = () => {
  emit('navigate-chat', props.event);
};

const activeSubTab = ref('Deskripsi');
const tabs = ['Deskripsi', 'Tiket', 'Syarat & Ketentuan'];

// Selected ticket quantities map: { ticketId: count }
const selectedTickets = ref({});
const isPriceDetailExpanded = ref(false);
const isOrderSummaryEditing = ref(false);

const totalTicketCount = computed(() => {
  return Object.values(selectedTickets.value).reduce((sum, qty) => sum + (qty || 0), 0);
});

const calculatedTotalPrice = computed(() => {
  let total = 0;
  tickets.value.forEach(t => {
    const qty = selectedTickets.value[t.id] || 0;
    total += qty * t.price;
  });
  return total;
});

const removeSingleTicket = (ticketId) => {
  if (selectedTickets.value[ticketId]) {
    delete selectedTickets.value[ticketId];
  }
};

const clearAllSelectedTickets = () => {
  selectedTickets.value = {};
};

// Track accordion expanded ticket IDs
const expandedTicketIds = ref([1]); // default open first ticket

const toggleTicketAccordion = (id) => {
  const index = expandedTicketIds.value.indexOf(id);
  if (index > -1) {
    expandedTicketIds.value.splice(index, 1);
  } else {
    expandedTicketIds.value.push(id);
  }
};

const tickets = ref([
  {
    id: 1,
    name: 'Seat A',
    price: 11500,
    sold: 50,
    quota: 100,
    status: 'active',
    salesStatus: 'Penjualan Berlangsung',
    eventDate: 'Sun, 17 May 2026',
    validUntil: '17 May 2026',
    endDate: '31 Dec 2029, 12:58:57 AM',
    refund: false,
    instantConfirm: true,
    taxIncluded: true
  },
  {
    id: 2,
    name: 'Presale 1',
    price: 200000,
    sold: 30,
    quota: 50,
    status: 'active',
    salesStatus: 'Penjualan Berlangsung',
    eventDate: 'Sun, 17 May 2026',
    validUntil: '17 May 2026',
    endDate: '31 Dec 2029, 12:58:57 AM',
    refund: false,
    instantConfirm: true,
    taxIncluded: true
  },
  {
    id: 3,
    name: 'VIP Meet & Greet',
    price: 500000,
    sold: 24,
    quota: 24,
    status: 'soldout',
    salesStatus: 'Penjualan Berakhir',
    eventDate: 'Sun, 17 May 2026',
    validUntil: '17 May 2026',
    endDate: '31 Dec 2029, 12:58:57 AM',
    refund: false,
    instantConfirm: true,
    taxIncluded: true
  }
]);

// Invitation Sub-tab Data & Methods
const invitations = ref([
  { 
    id: 1, 
    name: 'Bambang Pamungkas', 
    email: 'bambang@gmail.com', 
    phone: '+62 812-3456-7890',
    ticket: 'VIP Meet & Greet', 
    role: 'VVIP Guest',
    code: 'INV-89732-B',
    status: 'Diterima', 
    date: '25 Aug 2026',
    isCheckedIn: true,
    notes: 'Akomodasi hotel bintang 5',
    qty: 2,
    isExpanded: false
  },
  { 
    id: 2, 
    name: 'Chelsea Islan', 
    email: 'chelsea@outlook.com', 
    phone: '+62 811-9988-7766',
    ticket: 'Presale 1', 
    role: 'Media/Pers',
    code: 'INV-10293-C',
    status: 'Terkirim', 
    date: '26 Aug 2026',
    isCheckedIn: false,
    notes: 'Kamera press kit diperbolehkan',
    qty: 1,
    isExpanded: false
  },
  { 
    id: 3, 
    name: 'Dian Sastrowardoyo', 
    email: 'dian.sastro@gmail.com', 
    phone: '+62 813-1111-2222',
    ticket: 'Early Bird', 
    role: 'Pembicara',
    code: 'INV-44556-D',
    status: 'Menunggu', 
    date: '27 Aug 2026',
    isCheckedIn: false,
    notes: 'Butuh soundcheck jam 10:00',
    qty: 1,
    isExpanded: false
  }
]);

const invitationSearchQuery = ref('');

const filteredInvitations = computed(() => {
  if (!invitationSearchQuery.value) return invitations.value;
  const q = invitationSearchQuery.value.toLowerCase().trim();
  return invitations.value.filter(invite => 
    invite.name.toLowerCase().includes(q) || 
    (invite.role && invite.role.toLowerCase().includes(q))
  );
});

const editingInvitation = ref(null);
const isAddingInvitation = ref(false);

// Bottom Sheet State for Details
const activeDetailInvite = ref(null);
const activeDetailSale = ref(null);
const isPriceSummarySheetOpen = ref(false);
const sheetY = ref(0);
const isDragging = ref(false);
let startY = 0;

const openDetailSheet = (invite) => {
  activeDetailInvite.value = invite;
  sheetY.value = 0;
};

const closeDetailSheet = () => {
  activeDetailInvite.value = null;
  sheetY.value = 0;
};

const openDetailSaleSheet = (sale) => {
  activeDetailSale.value = sale;
  sheetY.value = 0;
};

const closeDetailSaleSheet = () => {
  activeDetailSale.value = null;
  sheetY.value = 0;
};

const closePriceSummarySheet = () => {
  isPriceSummarySheetOpen.value = false;
  isOrderSummaryEditing.value = false;
  sheetY.value = 0;
};

watch([activeDetailInvite, activeDetailSale, isPriceSummarySheetOpen], ([newInvite, newSale, newSummary]) => {
  if (newInvite || newSale || newSummary) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

const startDrag = (event) => {
  isDragging.value = true;
  startY = event.touches ? event.touches[0].clientY : event.clientY;
  
  const onDrag = (e) => {
    if (!isDragging.value) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diffY = clientY - startY;
    if (diffY > 0) {
      sheetY.value = diffY;
    }
  };

  const endDrag = () => {
    isDragging.value = false;
    if (sheetY.value > 80) {
      closeDetailSheet();
      closeDetailSaleSheet();
      closePriceSummarySheet();
    } else {
      sheetY.value = 0;
    }
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('touchend', endDrag);
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', endDrag);
  };

  if (event.touches) {
    window.addEventListener('touchmove', onDrag, { passive: true });
    window.addEventListener('touchend', endDrag);
  } else {
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);
  }
};

const showInvitationErrors = ref(false);

const handleEditInvitation = (invite) => {
  showInvitationErrors.value = false;
  editingInvitation.value = {
    ...invite,
    includeSeat: invite.includeSeat || false,
    includeSession: invite.includeSession || false,
    recipients: invite.recipients ? [...invite.recipients.map(r => ({ ...r }))] : [
      {
        fullname: invite.name || '',
        email: invite.email || '',
        seatNumber: invite.seatNumber || '',
        session: invite.session || '',
        phone: invite.phone || ''
      }
    ]
  };
  isAddingInvitation.value = false;
};

const handleCreateInvitation = () => {
  showInvitationErrors.value = false;
  editingInvitation.value = {
    id: Date.now(),
    ticket: 'Invitation VIP',
    role: 'Media Partner',
    code: 'INV-' + Math.floor(10000 + Math.random() * 90000),
    status: 'Terkirim',
    date: 'Hari ini',
    isCheckedIn: false,
    notes: '',
    qty: 1,
    includeSeat: false,
    includeSession: false,
    recipients: [
      {
        fullname: '',
        email: '',
        seatNumber: '',
        session: '',
        phone: ''
      }
    ],
    isExpanded: false
  };
  isAddingInvitation.value = true;
};

const addRecipient = () => {
  if (editingInvitation.value) {
    if (!editingInvitation.value.recipients) {
      editingInvitation.value.recipients = [];
    }
    editingInvitation.value.recipients.push({
      fullname: '',
      email: '',
      seatNumber: '',
      session: '',
      phone: ''
    });
  }
};

const removeRecipient = (index) => {
  if (editingInvitation.value && editingInvitation.value.recipients.length > 1) {
    editingInvitation.value.recipients.splice(index, 1);
  }
};

const handleCancelEditInvitation = () => {
  editingInvitation.value = null;
  isAddingInvitation.value = false;
  showInvitationErrors.value = false;
};

const handleSaveInvitation = () => {
  showInvitationErrors.value = true;
  
  if (!editingInvitation.value.role) return;
  if (!editingInvitation.value.ticket || !editingInvitation.value.ticket.trim()) return;
  if (!editingInvitation.value.notes || !editingInvitation.value.notes.trim()) return;
  
  if (!editingInvitation.value.recipients || editingInvitation.value.recipients.length === 0) {
    alert("Harus ada minimal satu penerima.");
    return;
  }
  
  let hasRecipientErrors = false;
  for (const r of editingInvitation.value.recipients) {
    if (!r.fullname || !r.fullname.trim()) hasRecipientErrors = true;
    if (!r.email || !r.email.trim() || !r.email.includes('@')) hasRecipientErrors = true;
    if (editingInvitation.value.includeSeat && (!r.seatNumber || !r.seatNumber.trim())) hasRecipientErrors = true;
    if (editingInvitation.value.includeSession && (!r.session || !r.session.trim())) hasRecipientErrors = true;
    if (!r.phone || !r.phone.trim()) hasRecipientErrors = true;
  }
  
  if (hasRecipientErrors) return;
  
  const first = editingInvitation.value.recipients[0];
  
  editingInvitation.value.name = first.fullname;
  editingInvitation.value.email = first.email;
  editingInvitation.value.phone = first.phone;
  editingInvitation.value.qty = editingInvitation.value.recipients.length;
  
  if (isAddingInvitation.value) {
    invitations.value.unshift({ ...editingInvitation.value });
  } else {
    const idx = invitations.value.findIndex(i => i.id === editingInvitation.value.id);
    if (idx !== -1) {
      invitations.value[idx] = { ...editingInvitation.value };
    }
  }
  editingInvitation.value = null;
  isAddingInvitation.value = false;
  showInvitationErrors.value = false;
};

const handleSendInvitation = (invite) => {
  invite.status = 'Terkirim';
  alert(`Undangan berhasil dikirim ulang ke ${invite.name} (${invite.email})`);
};

const handleDownloadReport = () => {
  alert(`Laporan Penjualan berhasil diunduh.`);
};

// Transaksi Sub-tab Data & Methods
const transactions = ref([
  {
    id: 1,
    name: 'Andi Hermawan',
    email: 'andi@gmail.com',
    phone: '+62 812-9876-5432',
    ticket: 'VIP Meet & Greet',
    code: 'TX-58321-A',
    status: 'Verified',
    date: '28 Aug 2026, 16:45 WIB',
    type: 'Online',
    qty: 1,
    price: 500000
  },
  {
    id: 2,
    name: 'Bella Citra',
    email: 'bella.citra@yahoo.com',
    phone: '+62 856-1122-3344',
    ticket: 'Presale 1',
    code: 'TX-94210-B',
    status: 'Unverified',
    date: '28 Aug 2026, 15:20 WIB',
    type: 'Offline',
    qty: 2,
    price: 400000
  },
  {
    id: 3,
    name: 'Citra Kirana',
    email: 'citra@gmail.com',
    phone: '+62 878-4455-6677',
    ticket: 'Early Bird',
    code: 'TX-10492-C',
    status: 'Verified',
    date: '27 Aug 2026, 14:10 WIB',
    type: 'Online',
    qty: 1,
    price: 150000
  }
]);

const transactionSearchQuery = ref('');
const selectedTypeFilter = ref('All');

const filteredTransactions = computed(() => {
  let list = transactions.value;
  if (selectedTypeFilter.value !== 'All') {
    list = list.filter(tx => tx.type === selectedTypeFilter.value);
  }
  if (!transactionSearchQuery.value) return list;
  const q = transactionSearchQuery.value.toLowerCase().trim();
  return list.filter(tx => 
    tx.name.toLowerCase().includes(q) || 
    tx.email.toLowerCase().includes(q) ||
    tx.ticket.toLowerCase().includes(q) ||
    tx.code.toLowerCase().includes(q)
  );
});

const handleCreateTransaction = () => {
  const name = prompt("Masukkan Nama Pembeli:");
  if (!name) return;
  const ticket = prompt("Masukkan Tipe Tiket (e.g. VIP Meet & Greet, Presale 1, Early Bird):", "VIP Meet & Greet");
  if (!ticket) return;
  
  transactions.value.unshift({
    id: Date.now(),
    name: name,
    email: name.toLowerCase().replace(/\s+/g, '') + '@gmail.com',
    phone: '+62 812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
    ticket: ticket,
    code: 'TX-' + Math.floor(10000 + Math.random() * 90000) + '-A',
    status: 'Verified',
    date: new Date().toLocaleString('id-ID') + ' WIB',
    type: Math.random() > 0.5 ? 'Online' : 'Offline',
    qty: 1,
    price: 150000
  });
};

const handleSendTransaction = (tx) => {
  alert(`Tiket transaksi berhasil dikirim ulang ke ${tx.name} (${tx.email})`);
};

// Penjualan Sub-tab Data
const isTransactionsExpanded = ref(true);

const salesSummary = ref({
  totalRevenue: 24700000,
  ticketsSold: 104,
  transactionsCount: 82
});

const salesData = ref([
  { id: 1, buyer: 'Andi Hermawan', ticket: 'VIP Meet & Greet', qty: 1, total: 500000, date: '28 Aug 2026, 16:45', status: 'Sukses' },
  { id: 2, buyer: 'Bella Citra', ticket: 'Presale 1', qty: 2, total: 400000, date: '28 Aug 2026, 15:20', status: 'Sukses' },
  { id: 3, buyer: 'Candra Wijaya', ticket: 'Early Bird', qty: 1, total: 150000, date: '28 Aug 2026, 14:10', status: 'Pending' },
  { id: 4, buyer: 'Doni Tata', ticket: 'Presale 1', qty: 1, total: 200000, date: '27 Aug 2026, 19:30', status: 'Sukses' },
  { id: 5, buyer: 'Elga Risky', ticket: 'Early Bird', qty: 3, total: 450000, date: '27 Aug 2026, 11:15', status: 'Gagal' }
]);

const formatPrice = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value).replace('IDR', 'Rp ').replace(/\u00a0/g, ' ');
};

const editingTicket = ref(null);

const handleEditTicket = (ticket) => {
  editingTicket.value = {
    id: ticket.id,
    name: ticket.name,
    price: ticket.price,
    quota: ticket.quota || 100,
    sold: ticket.sold || 0,
    status: ticket.status || 'active',
    category: ticket.category || 'Festival',
    type: ticket.type || (ticket.price > 0 ? 'Berbayar' : 'Gratis'),
    date: ticket.date || '2026-08-30',
    startSaleDate: ticket.startSaleDate || '2026-08-01',
    endSaleDate: ticket.endSaleDate || '2026-08-29',
    startSaleTime: ticket.startSaleTime || '09:00',
    endSaleTime: ticket.endSaleTime || '23:59',
    promo: ticket.promo || false,
    promoText: ticket.promoText || '',
    bundling: ticket.bundling || false,
    bundlingText: ticket.bundlingText || '',
    description: ticket.description || ''
  };
};

const handleCancelEdit = () => {
  editingTicket.value = null;
};

const handleSaveTicket = () => {
  const index = tickets.value.findIndex(t => t.id === editingTicket.value.id);
  if (index !== -1) {
    if (!editingTicket.value.name) {
      alert("Nama tiket tidak boleh kosong");
      return;
    }
    tickets.value[index] = { ...editingTicket.value };
    if (tickets.value[index].sold >= tickets.value[index].quota) {
      tickets.value[index].status = 'soldout';
    } else {
      tickets.value[index].status = 'active';
    }
    editingTicket.value = null;
  }
};

const handleAddTicket = () => {
  alert('Tambah Jenis Tiket sedang dikembangkan');
};

const isScrolled = ref(false);

const handleContentScroll = (e) => {
  if (e && e.target) {
    isScrolled.value = e.target.scrollTop > 80;
  }
};

const isMenuOpen = ref(false);
const showCopyToast = ref(false);
let toastTimer = null;

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleShare = () => {
  const dummyUrl = window.location.origin + `/event/${props.event.id}`;
  navigator.clipboard.writeText(dummyUrl).then(() => {
    showCopyToast.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      showCopyToast.value = false;
    }, 2500);
  }).catch(() => {
    showCopyToast.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      showCopyToast.value = false;
    }, 2500);
  });
  isMenuOpen.value = false;
};

const handleChat = () => {
  alert(`Membuka room chat dengan Penyelenggara: ${props.event.organizer}`);
  isMenuOpen.value = false;
};

const openLocationMaps = () => {
  const locName = props.event.location || 'Cornerstone Bandung';
  const query = encodeURIComponent(locName);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
};
</script>

<template>
  <div class="event-detail-page">
    <!-- Header Top Bar (Slightly Larger Height & Padding) -->
    <div class="detail-header" :class="{ 'scrolled-header': isScrolled }">
      <button class="back-btn" @click="emit('back')">
        <!-- Blue Back Arrow Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" class="header-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>

      <!-- Default Header Title -->
      <div v-if="!isScrolled" class="header-title-container">
        <h1 class="header-title">Detail Event</h1>
      </div>

      <!-- Scrolled Header Title & Meta -->
      <div v-else class="header-scrolled-info">
        <h2 class="scrolled-event-title">{{ event.title }}</h2>
        <span class="scrolled-event-meta">{{ event.date || "14 Nov '26" }} • {{ event.location || 'Jawa Barat' }}</span>
      </div>

      <div class="header-actions">
        <button class="action-btn" @click="handleShare" title="Bagikan">
          <!-- Modern iOS/macOS Share Export Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="header-icon">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Aesthetic Copy Link Toast Notification -->
    <transition name="toast-fade">
      <div v-if="showCopyToast" class="share-copy-toast">
        <div class="toast-icon-circle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" style="width: 13px; height: 13px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <span class="toast-message-text">Tautan event berhasil disalin</span>
      </div>
    </transition>

    <!-- Scrollable content -->
    <div class="detail-content" @scroll="handleContentScroll">
      <!-- Banner/Cover Image -->
      <div class="detail-banner-container">
        <!-- Overlay banner graphic matching exact screenshot background styles if possible -->
       
        <img :src="event.image" :alt="event.title" class="banner-img" />
      </div>

      <!-- Overlapping Floating Summary Card -->
      <div class="floating-summary-card">
        <div class="card-title-row">
          <div class="event-title-wrapper">
            <!-- Marquee scrolling only if title length > 22 characters -->
            <div v-if="(event.title + (event.id === 5 ? ' (R2C27)' : '')).length > 22" class="event-title-marquee">
              <span class="event-title-text">{{ event.title }}{{ event.id === 5 ? ' (R2C27)' : '' }}</span>
              <span class="marquee-spacer"></span>
              <span class="event-title-text" aria-hidden="true">{{ event.title }}{{ event.id === 5 ? ' (R2C27)' : '' }}</span>
              <span class="marquee-spacer"></span>
            </div>
            
            <!-- Static Clean Title Text when title is short -->
            <h2 v-else class="event-title-text static-title">{{ event.title }}{{ event.id === 5 ? ' (R2C27)' : '' }}</h2>
          </div>
          <span class="status-badge live">LIVE</span>
        </div>

        <!-- Metadata rows matching exact layout -->
        <div class="event-meta-details">
          <div class="meta-detail-row">
            <!-- Calendar Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="meta-detail-icon">
              <rect x="3" y="4" width="18" height="15" rx="2" stroke-linecap="round" stroke-linejoin="round" />
              <line x1="3" y1="9" x2="21" y2="9" stroke-linecap="round" stroke-linejoin="round" />
              <line x1="8" y1="2" x2="8" y2="5" stroke-linecap="round" stroke-linejoin="round" />
              <line x1="16" y1="2" x2="16" y2="5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="meta-detail-text">{{ event.id === 5 ? '19 Feb 2027 - 20 Feb 2027' : (event.date || '19 Feb 2027 - 20 Feb 2027') }}</span>
          </div>
          
          <div class="meta-detail-row">
            <!-- Clock Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="meta-detail-icon">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="meta-detail-text">{{ event.time || '13:00 WIB - 20:30 WIB' }}</span>
          </div>
          
          <div class="meta-detail-row clickable-location-row" @click="openLocationMaps" style="cursor: pointer;">
            <!-- Location Pin Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="meta-detail-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span class="meta-detail-text" style="flex: 1; text-decoration: underline; text-underline-offset: 2px;">{{ event.id === 5 ? 'Cornerstone Bandung' : (event.location || 'Cornerstone Bandung') }}</span>
            
            <!-- Clickable Direct Maps Link Icon Button -->
            <button class="gmaps-direct-btn" @click.stop="openLocationMaps" title="Buka Petunjuk Arah di Maps">
              <svg viewBox="0 0 24 24" fill="none" class="gmaps-icon-svg" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="url(#gmaps-grad)" />
                <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
                <defs>
                  <linearGradient id="gmaps-grad" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#2563eb" />
                    <stop offset="1" stop-color="#1d4ed8" />
                  </linearGradient>
                </defs>
              </svg>
            </button>
          </div>
        </div>

        <!-- Divider Line -->
        <div class="creator-divider-line"></div>

        <!-- Creator Profile Row (Below Divider) -->
        <div class="creator-profile-row" style="display: flex; align-items: center; gap: 8px; margin-top: 10px;">
          <img :src="event.creatorLogo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80'" alt="Creator Logo" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-size: 6px; font-weight: 400; color: #494a4a;">Diselenggarakan Oleh:</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 11.5px; font-weight: 600; color: #0f172a;">{{ event.organizer || 'Maxpaincompany LTD' }}</span>
              <svg viewBox="0 0 24 24" fill="#2196F3" style="width: 14px; height: 14px; flex-shrink: 0;" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="sub-tab-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          class="sub-tab-btn" 
          :class="{ active: activeSubTab === tab }"
          @click="activeSubTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="tab-pane-content">
        <!-- Deskripsi Tab Content -->
        <div v-if="activeSubTab === 'Deskripsi'" class="description-tab-content">
          <p class="desc-paragraph">
            <strong>Ngamen 0.5</strong> adalah festival musik intim yang menghadirkan pertunjukan seni dan kolaborasi musik independen lokal. Acara ini dirancang untuk mendekatkan musisi dengan para penikmat musik dalam atmosfer yang hangat, santai, dan penuh energi kreatif.
          </p>
          <h4 class="section-sub-title">Detail Acara:</h4>
          <ul class="desc-list">
            <li><strong>Tanggal:</strong> 16 & 30 Agustus 2026</li>
            <li><strong>Waktu:</strong> 13:00 WIB - 20:30 WIB</li>
            <li><strong>Lokasi:</strong> Cornerstone Bandung, Jawa Barat</li>
            <li><strong>Bintang Tamu:</strong> Local indie bands, acoustic session, dan art exhibition.</li>
          </ul>
          <p class="desc-paragraph">
            Dapatkan tiket Anda sekarang untuk menikmati akhir pekan penuh musik berkualitas dan pengalaman komunitas yang tak terlupakan!
          </p>
        </div>

        <!-- Syarat & Ketentuan Tab Content -->
        <div v-else-if="activeSubTab === 'Syarat & Ketentuan'" class="terms-tab-content">
          <p class="desc-paragraph">
            Sebelum membeli tiket dan menghadiri event, mohon membaca peraturan dan ketentuan kunjungan berikut secara saksama:
          </p>
          <h4 class="section-sub-title">Ketentuan Umum:</h4>
          <ol class="terms-list">
            <li>Tiket yang sudah dibeli bersifat final dan tidak dapat di-refund atau dibatalkan dengan alasan apapun.</li>
            <li>Satu e-ticket hanya berlaku untuk satu orang pengunjung dan hanya dapat dipindai (scan) sebanyak satu kali di pintu masuk.</li>
            <li>Pengunjung wajib menunjukkan kartu identitas resmi yang masih berlaku (KTP/SIM/Paspor) saat penukaran tiket di lokasi acara.</li>
            <li>Anak-anak berusia di bawah 12 tahun wajib didampingi oleh orang tua atau orang dewasa selama berada di area festival.</li>
          </ol>
          
          <h4 class="section-sub-title">Protokol Keamanan & Kesehatan:</h4>
          <ol class="terms-list" start="5">
            <li>Pengunjung dilarang keras membawa senjata tajam, senjata api, obat-obatan terlarang, serta minuman keras dari luar ke dalam area acara.</li>
            <li>Pihak keamanan berhak melakukan pemeriksaan barang bawaan dan menolak masuk pengunjung yang tidak mematuhi aturan keamanan.</li>
            <li>Seluruh pengunjung diharapkan menjaga kebersihan, ketertiban umum, dan menghormati sesama pengunjung selama acara berlangsung.</li>
          </ol>
        </div>

        <!-- Tiket Edit Form Content (Matching CreateEvent Kelola Tiket Form) -->
        <div v-else-if="activeSubTab === 'Tiket' && editingTicket" class="inline-ticket-form-container">
          <div class="ticket-modal-header-row">
            <label class="form-title">Kelola Tiket - {{ editingTicket.name }}</label>
          </div>
          
          <div class="ticket-modal-body">
            <!-- Kategori Tiket -->
            <div class="modal-form-group">
              <div class="modal-form-label-row">
                <label class="modal-form-label">Kategori Tiket <span class="required">*</span></label>
                <span class="required-notice">* Fitur seatmap silahkan menghubungi admin</span>
              </div>
              <div class="radio-tab-group">
                <label class="radio-tab-item" :class="{ active: editingTicket.category === 'Festival' }">
                  <input type="radio" v-model="editingTicket.category" value="Festival" class="hidden-radio-input" />
                  <span class="radio-dot-circle" :class="{ checked: editingTicket.category === 'Festival' }"></span>
                  <span>Festival</span>
                </label>
                <label class="radio-tab-item disabled">
                  <input type="radio" v-model="editingTicket.category" value="Seat" disabled class="hidden-radio-input" />
                  <span class="radio-dot-circle disabled"></span>
                  <span class="label-disabled">Seat</span>
                </label>
              </div>
            </div>

            <!-- Jenis Tiket -->
            <div class="modal-form-group">
              <label class="modal-form-label">Jenis Tiket <span class="required">*</span></label>
              <div class="radio-tab-group">
                <label class="radio-tab-item" :class="{ active: editingTicket.type === 'Berbayar' }">
                  <input type="radio" v-model="editingTicket.type" value="Berbayar" class="hidden-radio-input" @change="editingTicket.price = editingTicket.price || 150000" />
                  <span class="radio-dot-circle" :class="{ checked: editingTicket.type === 'Berbayar' }"></span>
                  <span>Berbayar</span>
                </label>
                <label class="radio-tab-item" :class="{ active: editingTicket.type === 'Gratis' }">
                  <input type="radio" v-model="editingTicket.type" value="Gratis" class="hidden-radio-input" @change="editingTicket.price = 0" />
                  <span class="radio-dot-circle" :class="{ checked: editingTicket.type === 'Gratis' }"></span>
                  <span>Gratis</span>
                </label>
              </div>
            </div>

            <!-- Nama Tiket -->
            <div class="modal-form-group">
              <label class="modal-form-label">Nama Tiket <span class="required">*</span></label>
              <input type="text" v-model="editingTicket.name" class="modal-form-input text-field-mock" placeholder="Nama Tiket" />
            </div>

            <!-- Tgl Event -->
            <div class="modal-form-group">
              <label class="modal-form-label">Tgl Event <span class="required">*</span></label>
              <div class="modal-input-icon-wrapper">
                <input type="date" v-model="editingTicket.date" class="modal-form-input icon-right date-input" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
            </div>

            <!-- Tgl Penjualan Columns -->
            <div class="modal-columns-row">
              <div class="modal-form-group">
                <label class="modal-form-label">Tgl Mulai Penjualan <span class="required">*</span></label>
                <div class="modal-input-icon-wrapper">
                  <input type="date" v-model="editingTicket.startSaleDate" class="modal-form-input icon-right date-input" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
              </div>
              <div class="modal-form-group">
                <label class="modal-form-label">Tgl Berakhir Penjualan <span class="required">*</span></label>
                <div class="modal-input-icon-wrapper">
                  <input type="date" v-model="editingTicket.endSaleDate" class="modal-form-input icon-right date-input" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Jam Penjualan Columns -->
            <div class="modal-columns-row">
              <div class="modal-form-group">
                <label class="modal-form-label">Jam Mulai Penjualan <span class="required">*</span></label>
                <div class="modal-input-icon-wrapper">
                  <input type="time" v-model="editingTicket.startSaleTime" class="modal-form-input icon-right date-input" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
              </div>
              <div class="modal-form-group">
                <label class="modal-form-label">Jam Berakhir Penjualan <span class="required">*</span></label>
                <div class="modal-input-icon-wrapper">
                  <input type="time" v-model="editingTicket.endSaleTime" class="modal-form-input icon-right date-input" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="modal-icon-overlay">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Harga & Jumlah Columns -->
            <div class="modal-columns-row">
              <div class="modal-form-group" :class="{ disabled: editingTicket.type === 'Gratis' }">
                <label class="modal-form-label">Harga Tiket <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model="editingTicket.price" 
                  class="modal-form-input text-field-mock" 
                  :disabled="editingTicket.type === 'Gratis'"
                  placeholder="0" 
                />
              </div>
              <div class="modal-form-group">
                <label class="modal-form-label">Jumlah Tiket <span class="required">*</span></label>
                <input type="number" v-model="editingTicket.quota" class="modal-form-input text-field-mock" placeholder="Masukan Jumlah" />
              </div>
            </div>

            <!-- Promo -->
            <div class="modal-form-group check-collapsible">
              <label class="modal-checkbox-item">
                <input type="checkbox" v-model="editingTicket.promo" class="hidden-checkbox" />
                <span class="custom-checkbox" :class="{ checked: editingTicket.promo }">✓</span>
                <span class="checklist-label font-medium">Promo</span>
              </label>
              <input 
                v-if="editingTicket.promo" 
                type="text" 
                v-model="editingTicket.promoText" 
                class="modal-form-input sub-input text-field-mock" 
                placeholder="Masukkan detail promo" 
              />
            </div>

            <!-- Bundling -->
            <div class="modal-form-group check-collapsible">
              <label class="modal-checkbox-item">
                <input type="checkbox" v-model="editingTicket.bundling" class="hidden-checkbox" />
                <span class="custom-checkbox" :class="{ checked: editingTicket.bundling }">✓</span>
                <span class="checklist-label font-medium">Bundling</span>
              </label>
              <input 
                v-if="editingTicket.bundling" 
                type="text" 
                v-model="editingTicket.bundlingText" 
                class="modal-form-input sub-input text-field-mock" 
                placeholder="Masukkan detail bundling" 
              />
            </div>

            <!-- Deskripsi Tiket -->
            <div class="modal-form-group">
              <label class="modal-form-label">Deskripsi</label>
              <textarea 
                v-model="editingTicket.description" 
                class="modal-form-textarea text-field-mock" 
                placeholder="Deskripsi Tiket"
              ></textarea>
            </div>
          </div>

        </div>

        <!-- Tiket Tab Content (Matches screenshots 1 & 2) -->
        <div v-else-if="activeSubTab === 'Tiket'" class="ticket-list-container">
          <div 
            v-for="ticket in tickets" 
            :key="ticket.id" 
            class="ticket-custom-card"
            :class="{ 'is-expanded': expandedTicketIds.includes(ticket.id), 'is-sold-out': ticket.status === 'soldout' }"
          >
            <!-- Notch accents on side -->
            <div class="ticket-notch notch-left"></div>
            <div class="ticket-notch notch-right"></div>

            <!-- Card Top Header (Title, Badge, Price, Accordion Chevron) -->
            <div class="ticket-header-area">
              <div class="ticket-header-left">
                <h3 class="ticket-title-text">{{ ticket.name }}</h3>
                <div class="sales-status-badge" :class="{ 'sales-ended': ticket.status === 'soldout' }">
                  <span class="status-dot-mini"></span>
                  <span>{{ ticket.salesStatus || 'PENJUALAN BERLANGSUNG' }}</span>
                </div>
              </div>

              <!-- Price & Accordion Toggle Chevron (Right Side) -->
              <div class="ticket-header-right" @click="toggleTicketAccordion(ticket.id)">
                <div class="price-stack">
                  <span class="price-label">Harga</span>
                  <span class="price-value">{{ formatPrice(ticket.price) }}</span>
                </div>
                <button class="accordion-chevron-btn" title="Toggle Detail Tiket">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke-width="2.5" 
                    stroke="currentColor" 
                    class="chevron-svg-icon"
                    :class="{ 'rotated': expandedTicketIds.includes(ticket.id) }"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Accordion Expandable Details Section (Shown when expanded - Screenshot 2) -->
            <transition name="accordion-expand">
              <div v-if="expandedTicketIds.includes(ticket.id)" class="ticket-accordion-body">
                <!-- Section 1: Tanggal Event -->
                <div class="detail-section-block">
                  <label class="section-block-label">Tanggal Event</label>
                  <div class="date-chip-info">
                    <div class="date-calendar-box">
                      <span class="day-name">Sun</span>
                      <span class="day-num">17</span>
                      <span class="month-name">May</span>
                    </div>
                    <span class="validity-text">Masa berlaku: <strong>{{ ticket.validUntil || '17 May 2026' }}</strong></span>
                  </div>
                </div>

                <div class="accordion-divider-line"></div>

                <!-- Section 2: Informasi Tiket Chips -->
                <div class="detail-section-block">
                  <label class="section-block-label">Informasi Tiket</label>
                  <div class="info-chips-row">
                    <div class="info-chip">
                      <!-- Simple Blue Info/Prohibition Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="chip-svg-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      <span>Tidak Bisa Refund</span>
                    </div>

                    <div class="info-chip">
                      <!-- Simple Blue Check Circle Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="chip-svg-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span>Konfirmasi Instan</span>
                    </div>

                    <div class="info-chip">
                      <!-- Simple Blue Tag/Tax Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" class="chip-svg-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
                      </svg>
                      <span>Termasuk Pajak 10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </transition>

            <div class="card-bottom-divider"></div>

            <!-- Card Bottom Footer Area (Berakhir Pada & + Tambah / Stepper Button with Total Rp) -->
            <div class="ticket-footer-area">
              <div class="footer-left">
                <span class="end-date-label">Berakhir Pada</span>
                <span class="end-date-value">{{ ticket.endDate || '31 Dec 2029, 12:58:57 AM' }}</span>
              </div>

              <div class="footer-right">
                <!-- + Tambah / Stepper Button -->
                <div v-if="ticket.status !== 'soldout'">
                  <button 
                    v-if="!selectedTickets[ticket.id]" 
                    class="btn-add-ticket-blue"
                    @click="selectedTickets[ticket.id] = 1"
                  >
                    <span>+ Tambah</span>
                  </button>

                  <div v-else class="stepper-blue-control">
                    <button 
                      class="stepper-btn-minus"
                      @click="selectedTickets[ticket.id] = Math.max(0, selectedTickets[ticket.id] - 1)"
                    >-</button>
                    <span class="stepper-count-num">{{ selectedTickets[ticket.id] }}</span>
                    <button 
                      class="stepper-btn-plus"
                      @click="selectedTickets[ticket.id]++"
                    >+</button>
                  </div>
                </div>

                <div v-else class="sold-out-pill-btn">
                  <span>Habis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invitation Tab Content -->
        <div v-else-if="activeSubTab === 'Invitation'" class="invitation-tab-content">
          
          <!-- Invitation Edit/Create Form -->
          <div v-if="editingInvitation" class="inline-invitation-form-container">
            <div class="ticket-modal-header-row">
              <label class="form-title">{{ isAddingInvitation ? 'Create Invitation' : 'Edit Invitation' }}</label>
            </div>
            
            <div class="ticket-modal-body">
              <div class="modal-columns-row">
                <div class="modal-form-group">
                  <label class="modal-form-label">Invitation Category</label>
                  <div class="modal-input-icon-wrapper">
                    <select v-model="editingInvitation.role" class="modal-form-input text-field-mock select-input" style="-webkit-appearance: none; -moz-appearance: none; appearance: none; padding-right: 28px;">
                      <option value="Media Partner">Media Partner</option>
                      <option value="Speaker">Speaker</option>
                      <option value="Sponsor">Sponsor</option>
                      <option value="VVIP Guest">VVIP Guest</option>
                      <option value="VIP">VIP</option>
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="modal-icon-overlay" style="color: #194e9e; pointer-events: none;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  <span v-if="showInvitationErrors && !editingInvitation.role" style="color: #ef4444; font-size: 11px; margin-top: 2px; text-align: left;">Kategori wajib dipilih</span>
                </div>
                
                <div class="modal-form-group">
                  <label class="modal-form-label">Invitation Title</label>
                  <input type="text" v-model="editingInvitation.ticket" class="modal-form-input text-field-mock" placeholder="Masukkan Title" />
                  <span v-if="showInvitationErrors && (!editingInvitation.ticket || !editingInvitation.ticket.trim())" style="color: #ef4444; font-size: 11px; margin-top: 2px; text-align: left;">Title wajib diisi</span>
                </div>
              </div>
              
              <div class="modal-form-group">
                <label class="modal-form-label">Invitation Description</label>
                <textarea v-model="editingInvitation.notes" class="modal-form-textarea text-field-mock" placeholder="Deskripsi Invitation" style="height: 100px;"></textarea>
                <span v-if="showInvitationErrors && (!editingInvitation.notes || !editingInvitation.notes.trim())" style="color: #ef4444; font-size: 11px; margin-top: 2px; text-align: left;">Deskripsi wajib diisi</span>
              </div>
              
              <div class="penerima-invitation-section" style="margin-top: 12px; text-align: left;">
                <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Penerima Invitation ({{ editingInvitation.recipients.length }})</h4>
                
                <div style="display: flex; gap: 20px; margin-bottom: 16px;">
                  <label class="modal-checkbox-item">
                    <input type="checkbox" v-model="editingInvitation.includeSeat" class="hidden-checkbox" />
                    <span class="custom-checkbox" :class="{ checked: editingInvitation.includeSeat }">✓</span>
                    <span class="checklist-label font-medium" style="color: #0f172a;">Sertakan Nomor Kursi</span>
                  </label>
                  
                  <label class="modal-checkbox-item">
                    <input type="checkbox" v-model="editingInvitation.includeSession" class="hidden-checkbox" />
                    <span class="custom-checkbox" :class="{ checked: editingInvitation.includeSession }">✓</span>
                    <span class="checklist-label font-medium" style="color: #0f172a;">Sertakan Sesi</span>
                  </label>
                </div>
                <div v-for="(recipient, index) in editingInvitation.recipients" :key="index" class="recipient-row" style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 16px; border-bottom: 2px solid #194e9e; padding-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; cursor: pointer; user-select: none;" @click="recipient.isCollapsed = !recipient.isCollapsed">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <!-- Blue Chevron icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" :style="{ transform: recipient.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#194e9e', width: '16px', height: '16px' }">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                      <span style="font-size: 13px; font-weight: 700; color: #000000;">Penerima {{ index + 1 }}</span>
                    </div>
                    <button v-if="editingInvitation.recipients.length > 1" @click.stop="removeRecipient(index)" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                  
                  <template v-if="!recipient.isCollapsed">
                    <div class="modal-form-group">
                      <label class="modal-form-label">Fullname</label>
                      <input type="text" v-model="recipient.fullname" class="modal-form-input text-field-mock" placeholder="Contoh: hanif" />
                      <span v-if="showInvitationErrors && (!recipient.fullname || !recipient.fullname.trim())" style="color: #ef4444; font-size: 11px; margin-top: 2px; text-align: left;">Nama wajib diisi</span>
                    </div>
                    <div class="modal-form-group">
                      <label class="modal-form-label">Email</label>
                      <input type="email" v-model="recipient.email" class="modal-form-input text-field-mock" placeholder="Contoh: hanif.dharmawan" />
                      <span v-if="showInvitationErrors && (!recipient.email || !recipient.email.trim())" style="color: #ef4444; font-size: 11px; margin-top: 2px; text-align: left;">Email wajib diisi</span>
                      <span v-else-if="showInvitationErrors && recipient.email && !recipient.email.includes('@')" style="color: #ef4444; font-size: 11px; margin-top: 2px; text-align: left;">Format email salah</span>
                    </div>
                    <div class="modal-form-group" v-if="editingInvitation.includeSeat">
                      <label class="modal-form-label">Seat Number</label>
                      <input type="text" v-model="recipient.seatNumber" class="modal-form-input text-field-mock" placeholder="Contoh: A1, B2" />
                      <span v-if="showInvitationErrors && (!recipient.seatNumber || !recipient.seatNumber.trim())" style="color: #ef4444; font-size: 11px; margin-top: 2px; text-align: left;">Nomor kursi wajib diisi</span>
                    </div>
                    <div class="modal-form-group" v-if="editingInvitation.includeSession">
                      <label class="modal-form-label">Sesi</label>
                      <input type="text" v-model="recipient.session" class="modal-form-input text-field-mock" placeholder="Contoh: Sesi 1, Sesi 2" />
                      <span v-if="showInvitationErrors && (!recipient.session || !recipient.session.trim())" style="color: #ef4444; font-size: 11px; margin-top: 2px; text-align: left;">Sesi wajib diisi</span>
                    </div>
                    <div class="modal-form-group">
                      <label class="modal-form-label">Phone</label>
                      <input type="text" v-model="recipient.phone" class="modal-form-input text-field-mock" placeholder="Contoh: 831092830192" />
                      <span v-if="showInvitationErrors && (!recipient.phone || !recipient.phone.trim())" style="color: #ef4444; font-size: 11px; margin-top: 2px; text-align: left;">Nomor telepon wajib diisi</span>
                    </div>
                  </template>
                </div>
                
                <button @click="addRecipient" class="btn-add-recipient" style="width: 100%; padding: 10px; border: 1px solid #194e9e; background-color: #194e9e; border-radius: 8px; font-weight: 600; font-size: 13px; color: #ffffff; cursor: pointer; transition: background-color 0.2s; margin-top: 8px;">
                  Tambah Penerima
                </button>
              </div>
            </div>
          </div>

          <!-- Invitations List -->
          <div v-else class="invitation-list">
            <div class="invitation-search-container">
              <div class="search-input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="search-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
                <input 
                  type="text" 
                  v-model="invitationSearchQuery" 
                  placeholder="Cari nama atau kategori tamu..." 
                  class="invitation-search-input"
                />
              </div>
            </div>

            <div 
              v-for="invite in filteredInvitations" 
              :key="invite.id" 
              class="invitation-ticket-card" 
              :class="{ 'is-checked-in': invite.isCheckedIn }"
            >
              <div class="invitation-card-header">
                <div class="invitation-card-left">
                  <h4 class="invite-card-name">{{ invite.name }}</h4>
                  <span class="invite-card-email">{{ invite.qty || 1 }} Tiket</span>
                </div>
                <div class="invitation-card-right">
                  <span class="check-in-indicator-badge" :class="invite.isCheckedIn ? 'checked-in' : 'not-checked-in'">
                    {{ invite.isCheckedIn ? 'Checked In' : 'Belum Check In' }}
                  </span>
                </div>
              </div>

              <div class="invitation-card-meta-row">
                <span class="invite-meta-role">{{ invite.role || 'Guest' }}</span>
              </div>

              <div class="invitation-card-divider"></div>

              <!-- Action Bar on Card -->
              <div class="invitation-card-actions">
                <!-- Detail Button -->
                <button class="invite-action-btn detail-btn" @click="openDetailSheet(invite)">
                  <span>Detail</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="invite-svg-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <!-- Edit Button -->
                <button class="invite-action-btn edit-btn" @click="handleEditInvitation(invite)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="invite-svg-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </button>

                <!-- Kirim Button -->
                <button class="invite-action-btn send-btn" @click="handleSendInvitation(invite)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="invite-svg-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Penjualan Tab Content -->
        <div v-else-if="activeSubTab === 'Penjualan'" class="sales-tab-content" style="padding-bottom: 80px;">
          <!-- Stats Summary Calculation List -->
          <div class="sales-calc-container" style="background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 16px; padding: 18px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); display: flex; flex-direction: column; gap: 12px;">
            <div class="sales-calc-row" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 2px 0;">
              <span class="summary-label" style="color: #000000; font-size: 12px; font-weight: 500; text-align: left; white-space: nowrap; flex: 1;">Total Penjualan:</span>
              <span class="summary-value" style="font-size: 13px; font-weight: 600; color: #000000; white-space: nowrap;">{{ formatPrice(salesSummary.totalRevenue) }}</span>
            </div>
            <div class="sales-calc-row" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 2px 0;">
              <span class="summary-label" style="color: #000000; font-size: 12px; font-weight: 500; text-align: left; white-space: nowrap; flex: 1;">Tiket Terjual:</span>
              <span class="summary-value" style="font-size: 13px; font-weight: 600; color: #000000; white-space: nowrap;">{{ salesSummary.ticketsSold }} Tiket</span>
            </div>
            <div class="sales-calc-row" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 2px 0;">
              <span class="summary-label" style="color: #000000; font-size: 12px; font-weight: 500; text-align: left; white-space: nowrap; flex: 1;">Total Transaksi:</span>
              <span class="summary-value" style="font-size: 13px; font-weight: 600; color: #000000; white-space: nowrap;">{{ salesSummary.transactionsCount }} Sukses</span>
            </div>
            <div class="sales-calc-row" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 2px 0;">
              <span class="summary-label" style="color: #000000; font-size: 11px; font-weight: 500; text-align: left; white-space: nowrap; flex: 1;">Tiket Online:</span>
              <span class="summary-value" style="font-size: 13px; font-weight: 600; color: #ef4444; white-space: nowrap;">-{{ formatPrice(salesSummary.totalRevenue * 0.05) }}</span>
            </div>
            <div class="sales-calc-row" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 2px 0;">
              <span class="summary-label" style="color: #000000; font-size: 12px; font-weight: 500; text-align: left; white-space: nowrap; flex: 1;">Total Promo:</span>
              <span class="summary-value" style="font-size: 13px; font-weight: 600; color: #ef4444; white-space: nowrap;">-{{ formatPrice(150000) }}</span>
            </div>
            
            <div style="border-top: 1.5px dashed #e2e8f0; margin-top: 8px; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <span class="summary-label" style="color: #000000; font-size: 11px; font-weight: 700; text-align: left; white-space: nowrap; flex: 1;">Total Keseluruhan:</span>
              <span class="summary-value" style="font-size: 15px; font-weight: 800; color: #194e9e; white-space: nowrap;">{{ formatPrice(salesSummary.totalRevenue - (salesSummary.totalRevenue * 0.05) - 150000) }}</span>
            </div>
          </div>

          <div class="tab-header-row" @click="isTransactionsExpanded = !isTransactionsExpanded" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none;">
            <h3 class="tab-content-title" style="margin: 0;">Riwayat Transaksi</h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" :style="{ transform: isTransactionsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', color: '#194e9e', width: '18px', height: '18px' }">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          <transition name="expand">
            <div v-show="isTransactionsExpanded" class="sales-list" style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
              <div v-for="sale in salesData" :key="sale.id" class="sale-item-card" @click="openDetailSaleSheet(sale)" style="cursor: pointer; display: flex; flex-direction: column; gap: 10px; padding: 14px; border: 1px solid #f1f5f9; border-radius: 12px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                  <div class="sale-info-left" style="display: flex; flex-direction: column; gap: 2px;">
                    <h4 class="sale-buyer" style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">{{ sale.buyer }}</h4>
                    <span class="sale-ticket-type" style="font-size: 12px; color: #494a4a;">{{ sale.ticket }} ({{ sale.qty }}x)</span>
                    <span class="sale-date" style="font-size: 11px; color: #94a3b8;">{{ sale.date }} WIB</span>
                  </div>
                  <div class="sale-info-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                    <span class="status-badge" :class="sale.status.toLowerCase()" style="font-size: 10px; padding: 2px 8px; border-radius: 999px;">{{ sale.status }}</span>
                    <span class="sale-total" style="font-size: 14px; font-weight: 700; color: #000000;">{{ formatPrice(sale.total) }}</span>
                  </div>
                </div>
                <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; display: flex; justify-content: center; width: 100%;">
                  <span style="color: #ffffff; background-color: #194e9e; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 10px; width: 100%; box-sizing: border-box; text-align: center; font-family: var(--font-sans);">
                    Lihat Detail
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" style="width: 12px; height: 12px; stroke: #ffffff;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Transaksi Tab Content -->
        <div v-else-if="activeSubTab === 'Transaksi'" class="invitation-tab-content" style="padding-bottom: 80px;">
          <!-- Search Bar -->
          <div class="invitation-search-container" style="margin-bottom: 12px;">
            <div class="search-input-wrapper" style="display: flex; align-items: center; background-color: #ffffff; border-radius: 8px; padding: 10px 14px; gap: 10px; border: 1px solid #e2e8f0; width: 100%; box-sizing: border-box;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="color: #194e9e; width: 18px; height: 18px; flex-shrink: 0;">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
              <input 
                type="text" 
                v-model="transactionSearchQuery" 
                placeholder="Cari nama, email, atau no invoice..." 
                style="border: none !important; background: transparent !important; outline: none !important; width: 100%; font-size: 13.5px; color: #0f172a; padding: 0; margin: 0; box-shadow: none !important;"
              />
            </div>
          </div>

          <!-- Filter Buttons -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px;">
            <button 
              v-for="filter in ['All', 'Online', 'Offline']" 
              :key="filter"
              @click="selectedTypeFilter = filter"
              style="padding: 6px 16px; font-size: 13px; font-weight: 600; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-family: var(--font-sans);"
              :style="{
                backgroundColor: selectedTypeFilter === filter ? '#194e9e' : '#ffffff',
                color: selectedTypeFilter === filter ? '#ffffff' : '#494a4a',
                border: selectedTypeFilter === filter ? '1px solid #194e9e' : '1px solid #e2e8f0'
              }"
            >
              {{ filter }}
            </button>
          </div>

          <!-- Transaction List -->
          <div class="invitation-list" style="display: flex; flex-direction: column; gap: 8px;">
            <div 
              v-for="tx in filteredTransactions" 
              :key="tx.id" 
              class="transaksi-card" 
              style="display: flex; flex-direction: column; gap: 12px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); text-align: left;"
            >
              <!-- Card Header Row -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; padding-right: 8px;">
                  <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #000000; line-height: 1.2;">{{ tx.name }}</h4>
                  <span style="font-size: 12px; color: #494a4a;">{{ tx.email }}</span>
                  <span style="font-size: 11px; color: #94a3b8;">Dikirim: {{ tx.date }}</span>
                  <span class="font-mono" style="font-size: 11px; color: #494a4a;">{{ tx.code }}</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;">
                  <span 
                    class="check-in-indicator-badge" 
                    style="cursor: pointer; display: inline-block; user-select: none; font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: 600;"
                    :style="{
                      backgroundColor: tx.status === 'Verified' ? '#e6f4ea' : '#fce8e6',
                      color: tx.status === 'Verified' ? '#137333' : '#c5221f'
                    }"
                    @click="tx.status = tx.status === 'Verified' ? 'Unverified' : 'Verified'"
                  >
                    {{ tx.status }}
                  </span>
                  <!-- Type Badge (Online/Offline) placed on the right -->
                  <span :style="{ backgroundColor: tx.type === 'Online' ? '#e0f2fe' : '#fef3c7', color: tx.type === 'Online' ? '#0369a1' : '#b45309', fontWeight: '600', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', whiteSpace: 'nowrap' }">{{ tx.type }}</span>
                </div>
              </div>

              <!-- Card Badges & Actions Row -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 8px;">
                <!-- Detail Button (solid blue, centered chevron-down on right) -->
                <button class="invite-action-btn detail-btn" @click="openDetailSaleSheet(tx)" style="flex: 1; height: 38px; border: none; background-color: #194e9e; color: #ffffff; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--font-sans); box-sizing: border-box; padding: 0 16px;">
                  <span>Detail</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 14px; height: 14px; stroke: #ffffff;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                <!-- Send Button (solid blue) -->
                <button class="invite-action-btn send-btn" @click="handleSendTransaction(tx)" style="background-color: #194e9e; border: none; border-radius: 8px; padding: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ffffff; width: 38px; height: 38px; box-sizing: border-box; flex-shrink: 0; margin-right: 4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px; stroke: #ffffff;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mocks for other tabs -->
        <div v-else class="mock-tab-content">
          <p>Konten {{ activeSubTab }} sedang dalam pengembangan.</p>
        </div>
      </div>
    </div>



    <!-- Bottom Sticky Action Bar (Matches Exact Screenshot) -->
    <transition name="slide-up" appear>
      <!-- Mode Tab Deskripsi / Syarat & Ketentuan -->
      <div v-if="activeSubTab === 'Deskripsi' || activeSubTab === 'Syarat & Ketentuan'" class="ticket-form-actions-bar-fixed">
        <div class="bottom-bar-top-row">
          <div class="bottom-bar-price-info">
            <span class="bottom-bar-label">Harga mulai dari</span>
            <span class="bottom-bar-price-val">{{ event.price || 'Rp124.000' }}</span>
          </div>
        </div>
        <div class="bottom-bar-btn-row">
          <button class="btn-primary-blue-buy" @click="activeSubTab = 'Tiket'">
            <span>Lihat Tiket</span>
          </button>
          <button class="btn-chat-bubble" @click="handleContactOrganizer" title="Chat Penyelenggara">
            <svg viewBox="0 0 24 24" fill="none" class="chat-bubble-svg" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 5.818 2 10.5c0 2.57 1.353 4.87 3.473 6.438-.168.995-.67 2.37-1.688 3.512 0 0 2.146-.35 3.992-1.64.694.195 1.436.3 2.223.3 5.523 0 10-3.818 10-8.5S17.523 2 12 2z" fill="#ffffff"/>
              <circle cx="8" cy="10.5" r="1.2" fill="#194e9e"/>
              <circle cx="12" cy="10.5" r="1.2" fill="#194e9e"/>
              <circle cx="16" cy="10.5" r="1.2" fill="#194e9e"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mode Tab Tiket (Matches Exact User Screenshot) -->
      <div v-else-if="activeSubTab === 'Tiket'" class="ticket-form-actions-bar-fixed">
        <!-- Top Row: Price Stack + Pill Detail Button -->
        <div class="bottom-bar-top-row">
          <div class="bottom-bar-price-info">
            <span class="bottom-bar-label">Total Harga</span>
            <span class="bottom-bar-price-val">{{ totalTicketCount > 0 ? formatPrice(calculatedTotalPrice) : 'Rp 0' }}</span>
          </div>

          <button 
            class="detail-toggle-pill-btn" 
            @click="isPriceSummarySheetOpen = true"
            title="Lihat Detail Total"
          >
            <span>({{ totalTicketCount }}) Detail</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke-width="3" 
              stroke="currentColor" 
              class="pill-chevron-icon"
              :class="{ 'rotated': isPriceSummarySheetOpen }"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </div>

        <!-- Bottom Row: Primary Buy Button + Chat Bubble Button -->
        <div class="bottom-bar-btn-row">
          <button 
            class="btn-primary-blue-buy" 
            @click="totalTicketCount > 0 ? emit('buy-ticket', { selectedTickets, tickets }) : alert('Pilih minimal 1 tiket!')"
          >
            <span>Beli Tiket Sekarang</span>
          </button>

          <button class="btn-chat-bubble" @click="handleContactOrganizer" title="Chat Penyelenggara">
            <svg viewBox="0 0 24 24" fill="none" class="chat-bubble-svg" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 5.818 2 10.5c0 2.57 1.353 4.87 3.473 6.438-.168.995-.67 2.37-1.688 3.512 0 0 2.146-.35 3.992-1.64.694.195 1.436.3 2.223.3 5.523 0 10-3.818 10-8.5S17.523 2 12 2z" fill="#ffffff"/>
              <circle cx="8" cy="10.5" r="1.2" fill="#194e9e"/>
              <circle cx="12" cy="10.5" r="1.2" fill="#194e9e"/>
              <circle cx="16" cy="10.5" r="1.2" fill="#194e9e"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- Bottom Sheet for Price Order Summary (Ringkasan Pesanan) -->
    <transition name="sheet-fade">
      <div v-if="isPriceSummarySheetOpen" class="bottom-sheet-backdrop" @click="closePriceSummarySheet" @touchmove.prevent>
        <div 
          class="bottom-sheet-content" 
          :class="{ 'dragging': isDragging }"
          :style="{ transform: `translateY(${sheetY}px)` }"
          @click.stop
        >
          <!-- Drag Handle -->
          <div class="bottom-sheet-drag-handle-area" @mousedown="startDrag" @touchstart="startDrag">
            <div class="bottom-sheet-drag-handle"></div>
          </div>
          
          <!-- Sheet Header with Edit/Selesai Icon Button & X Close Button -->
          <div class="bottom-sheet-header" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px 10px; width: 100%; box-sizing: border-box; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 class="bottom-sheet-title" style="margin: 0; font-size: 15px; font-weight: 700; color: #000000;">Ringkasan Pesanan</h3>
              
              <!-- Edit / Selesai Icon Button -->
              <button 
                v-if="totalTicketCount > 0" 
                @click="isOrderSummaryEditing = !isOrderSummaryEditing" 
                style="background: #eff6ff; color: #194e9e; border: none; padding: 5px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s;"
                :title="isOrderSummaryEditing ? 'Selesai Edit' : 'Edit Tiket'"
              >
                <!-- Pencil Edit Icon (When not editing) -->
                <svg v-if="!isOrderSummaryEditing" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" style="width: 15px; height: 15px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                
                <!-- Clean Blue Checkmark Icon (When editing) -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#194e9e" style="width: 15px; height: 15px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </button>
            </div>
            
            <button @click="closePriceSummarySheet" style="background: #eff6ff; border: none; padding: 6px; border-radius: 50%; cursor: pointer; color: #194e9e; display: flex; align-items: center; justify-content: center; transition: all 0.15s;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#194e9e" style="width: 16px; height: 16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Sheet Body with Itemized Order Details -->
          <div class="bottom-sheet-body" style="padding: 16px 18px 24px; display: flex; flex-direction: column; gap: 14px;">
            <div class="order-summary-list" style="display: flex; flex-direction: column; gap: 12px;">
              <template v-for="(ticket, idx) in tickets" :key="ticket.id">
                <div v-if="selectedTickets[ticket.id] > 0" class="summary-item-wrapper" style="display: flex; flex-direction: column; gap: 12px;">
                  <div class="summary-item-row" style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <!-- Blue Ticket Icon -->
                      <div style="width: 32px; height: 32px; border-radius: 8px; background-color: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#194e9e" style="width: 18px; height: 18px;">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 0 1 2.25 2.25v2.25a1.5 1.5 0 0 0 0 3v2.25A2.25 2.25 0 0 1 18.75 18H5.25A2.25 2.25 0 0 1 3 15.75V13.5a1.5 1.5 0 0 0 0-3V7.5A2.25 2.25 0 0 1 5.25 6Z" />
                        </svg>
                      </div>

                      <div style="display: flex; flex-direction: column; text-align: left;">
                        <span style="font-size: 13px; font-weight: 600; color: #000000;">{{ ticket.name }}</span>
                        <span style="font-size: 11px; color: #000000; font-weight: 400;">{{ selectedTickets[ticket.id] }} x {{ formatPrice(ticket.price) }}</span>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 13px; font-weight: 700; color: #000000;">{{ formatPrice(selectedTickets[ticket.id] * ticket.price) }}</span>
                      
                      <!-- Per Item Delete Button (Only visible when Edit mode is active) -->
                      <button 
                        v-if="isOrderSummaryEditing" 
                        @click="removeSingleTicket(ticket.id)" 
                        style="background: #fee2e2; border: none; border-radius: 50%; padding: 5px; cursor: pointer; color: #ef4444; display: flex; align-items: center; justify-content: center; transition: all 0.15s;"
                        title="Hapus Tiket Ini"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#ef4444" style="width: 14px; height: 14px;">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Thin Divider Line Between Items -->
                  <div style="height: 1px; background-color: #f1f5f9; width: 100%;"></div>
                </div>
              </template>

              <!-- Beautiful & Clean Empty State Card -->
              <div v-if="totalTicketCount === 0" style="padding: 24px 16px; text-align: center; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin: 4px 0;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background-color: #eff6ff; display: flex; align-items: center; justify-content: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="#194e9e" style="width: 22px; height: 22px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 0 1 2.25 2.25v2.25a1.5 1.5 0 0 0 0 3v2.25A2.25 2.25 0 0 1 18.75 18H5.25A2.25 2.25 0 0 1 3 15.75V13.5a1.5 1.5 0 0 0 0-3V7.5A2.25 2.25 0 0 1 5.25 6Z" />
                  </svg>
                </div>
                <span style="font-size: 13px; font-weight: 600; color: #000000; margin-top: 2px;">Belum Ada Tiket Dipilih</span>
                <span style="font-size: 11.5px; color: #494a4a; font-weight: 400; line-height: 1.4; max-width: 220px;">Silakan pilih jumlah tiket pada pilihan kategori tiket di atas.</span>
              </div>
            </div>

            <div style="height: 1px; background-color: #e2e8f0; margin: 2px 0;"></div>

            <!-- Grand Total Row Only -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; font-weight: 700; color: #000000;">Total Pembayaran</span>
              <span style="font-size: 17px; font-weight: 800; color: #000000;">{{ formatPrice(calculatedTotalPrice) }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bottom Sheet for Invitation Details -->
    <transition name="sheet-fade">
      <div v-if="activeDetailInvite" class="bottom-sheet-backdrop" @click="closeDetailSheet" @touchmove.prevent>
        <div 
          class="bottom-sheet-content" 
          :class="{ 'dragging': isDragging }"
          :style="{ transform: `translateY(${sheetY}px)` }"
          @click.stop
        >
          <!-- Drag Handle -->
          <div class="bottom-sheet-drag-handle-area" @mousedown="startDrag" @touchstart="startDrag">
            <div class="bottom-sheet-drag-handle"></div>
          </div>
          
          <div class="bottom-sheet-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 18px 8px; width: 100%; box-sizing: border-box;">
            <h3 class="bottom-sheet-title" style="margin: 0;">Detail Undangan</h3>
            <button @click="closeDetailSheet" style="background: none; border: none; padding: 6px; cursor: pointer; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: color 0.15s;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="bottom-sheet-body">
            <div class="sheet-detail-grid">
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Nama Tamu</span>
                <span class="sheet-detail-value">{{ activeDetailInvite.name }}</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Jumlah Tiket</span>
                <span class="sheet-detail-value">{{ activeDetailInvite.qty || 1 }} Tiket</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Kode Tiket</span>
                <span class="sheet-detail-value font-mono">{{ activeDetailInvite.code }}</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Kategori Tamu (Role)</span>
                <span class="sheet-detail-value">{{ activeDetailInvite.role || '-' }}</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Nomor Telepon</span>
                <span class="sheet-detail-value">{{ activeDetailInvite.phone || '-' }}</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Dikirim Pada</span>
                <span class="sheet-detail-value">{{ activeDetailInvite.date }}</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Status Tiket</span>
                <span class="sheet-detail-value">
                  <span class="check-in-indicator-badge" :class="activeDetailInvite.isCheckedIn ? 'checked-in' : 'not-checked-in'" style="display: inline-block;">
                    {{ activeDetailInvite.isCheckedIn ? 'Checked In' : 'Belum Check In' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bottom Sheet for Sale Details -->
    <transition name="sheet-fade">
      <div v-if="activeDetailSale" class="bottom-sheet-backdrop" @click="closeDetailSaleSheet" @touchmove.prevent>
        <div 
          class="bottom-sheet-content" 
          :class="{ 'dragging': isDragging }"
          :style="{ transform: `translateY(${sheetY}px)` }"
          @click.stop
        >
          <!-- Drag Handle -->
          <div class="bottom-sheet-drag-handle-area" @mousedown="startDrag" @touchstart="startDrag">
            <div class="bottom-sheet-drag-handle"></div>
          </div>
          
          <div class="bottom-sheet-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 18px 8px; width: 100%; box-sizing: border-box;">
            <h3 class="bottom-sheet-title" style="margin: 0;">Detail Transaksi</h3>
            <button @click="closeDetailSaleSheet" style="background: none; border: none; padding: 6px; cursor: pointer; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: color 0.15s;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 20px; height: 20px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="bottom-sheet-body">
            <div class="sheet-detail-grid">
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Pembeli / Tamu</span>
                <span class="sheet-detail-value">{{ activeDetailSale.buyer || activeDetailSale.name }}</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Tipe Tiket</span>
                <span class="sheet-detail-value">{{ activeDetailSale.ticket }}</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Jumlah Tiket</span>
                <span class="sheet-detail-value">{{ activeDetailSale.qty }} Tiket</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Tanggal / Waktu</span>
                <span class="sheet-detail-value">{{ activeDetailSale.date }}</span>
              </div>
              <div class="sheet-detail-field" v-if="activeDetailSale.total || activeDetailSale.price">
                <span class="sheet-detail-label">Total Pembayaran</span>
                <span class="sheet-detail-value font-mono">{{ formatPrice(activeDetailSale.total || activeDetailSale.price) }}</span>
              </div>
              <div class="sheet-detail-field" v-if="activeDetailSale.code">
                <span class="sheet-detail-label">Kode Transaksi</span>
                <span class="sheet-detail-value font-mono">{{ activeDetailSale.code }}</span>
              </div>
              <div class="sheet-detail-field" v-if="activeDetailSale.type">
                <span class="sheet-detail-label">Tipe Pembelian</span>
                <span class="sheet-detail-value">{{ activeDetailSale.type }}</span>
              </div>
              <div class="sheet-detail-field">
                <span class="sheet-detail-label">Status</span>
                <span class="sheet-detail-value">
                  <span class="check-in-indicator-badge" :class="(activeDetailSale.status === 'Sukses' || activeDetailSale.status === 'Verified') ? 'checked-in' : 'not-checked-in'" style="display: inline-block;">
                    {{ activeDetailSale.status }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Toast Notification styling using CSS Variables from style.css */
.share-copy-toast {
  position: absolute;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background-color: var(--primary-base);
  color: var(--white);
  padding: 8px 16px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 18px rgba(25, 78, 158, 0.35);
  border: 1px solid var(--primary-disabled);
  pointer-events: none;
}

.toast-icon-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-icon-circle svg {
  stroke: var(--primary-base);
}

.toast-message-text {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--white);
  white-space: nowrap;
}

.toast-fade-enter-active, .toast-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.95);
}

.event-detail-page {
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

/* Header styling */
.detail-header {
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

.detail-header.scrolled-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.back-btn, .action-btn {
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

.back-btn:hover, .action-btn:hover {
  background-color: transparent !important;
  border-color: transparent !important;
  opacity: 0.75;
  transform: none !important;
  box-shadow: none !important;
}

.back-btn:active, .action-btn:active {
  opacity: 0.5;
  transform: none !important;
}

.header-icon {
  width: 20px;
  height: 20px;
  stroke: #194e9e;
}

.header-title-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color:#151416;
  margin: 0;
}

.header-scrolled-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
  margin: 0 12px;
  overflow: hidden;
}

.scrolled-event-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.scrolled-event-meta {
  font-size: 10px;
  font-weight: 500;
  color: #494a4a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 4px;
  position: relative;
}

/* Dropdown style */
.header-dropdown-menu {
  position: absolute;
  top: 48px;
  right: 0px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  width: 260px;
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s;
  font-family: var(--font-sans);
}

.dropdown-item:hover {
  background-color: #f8fafc;
  color: #194e9e;
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  color: #194e9e;
  flex-shrink: 0;
}

.dropdown-divider {
  height: 1px;
  background-color: #f1f5f9;
}

/* Transition for dropdown slide */
.dropdown-slide-enter-active, .dropdown-slide-leave-active {
  transition: all 0.2s ease-out;
}
.dropdown-slide-enter-from, .dropdown-slide-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}

/* Content Area */
.detail-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden !important;
  touch-action: pan-y;
  overscroll-behavior: contain;
  padding-bottom: 95px !important;
  background-color: #ffffff;
}

/* Banner container */
.detail-banner-container {
  width: calc(100% - 24px) !important;
  margin: 6px 12px 0 12px !important;
  height: 105px !important;
  position: relative !important;
  overflow: hidden !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.banner-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 6px !important;
}

.banner-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(25, 78, 158, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%);
  z-index: 1;
}

.banner-decor-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  color: #ffffff;
}

.decor-main-title {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.95);
  font-family: monospace, sans-serif;
  text-transform: uppercase;
}

.decor-date-location {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  align-self: flex-end;
  text-align: right;
}

.decor-dates {
  display: flex;
  flex-direction: column;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.1;
}

.decor-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.decor-month-year {
  font-size: 14px;
  font-weight: 700;
  text-transform: lowercase;
}

.decor-cities {
  font-size: 9px;
  opacity: 0.7;
  max-width: 180px;
}

/* Floating summary card */
.floating-summary-card {
  background-color: #ffffff;
  border-radius: 0;
  margin: 0px 0px 0px 0px;
  padding: 20px 16px 16px 16px;
  position: relative;
  z-index: 5;
  /* border-bottom: 1px solid #e2e8f0; */
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-title-wrapper {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  margin-right: 12px;
}

.event-title-marquee {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  animation: marquee 12s linear infinite;
}

.event-title-text {
  font-size: 22px;
  font-weight: 500;
  color:  #151416;
  line-height: 1.3;
}

.event-title-text.static-title {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marquee-spacer {
  display: inline-block;
  width: 40px;
}

@keyframes marquee {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

.event-meta-details {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Tightened gap */
  margin: 10px 0 8px 0;
}

.creator-divider-line {
  height: 1px;
  background-color: #f1f5f9;
  width: 100%;
  margin-top: 4px;
}

.meta-detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #000000;
  font-size: 14px;
  font-weight: 400;
}

.meta-detail-icon {
  width: 18px;
  height: 18px;
  color: #194e9e;
  flex-shrink: 0;
}

.meta-detail-text {
  color: #000000;
}

.status-badge.live {
  background-color: #e0e7ff;
  color: #194e9e;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  letter-spacing: 0.5px;
}

.checkin-status-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #000000;
  margin-bottom: 8px;
  font-weight: 500;
}

.status-count {
  font-weight: 700;
  color: #0f172a;
}

.status-progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #194e9e;
  border-radius: 9999px;
}

/* Sub Tab Nav */
.sub-tab-nav {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
  padding: 0 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-tab-nav::-webkit-scrollbar {
  display: none;
}

.sub-tab-btn {
  background: none;
  border: none;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #494a4a;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.sub-tab-btn.active {
  color: #194e9e;
  font-weight: 600;
}

.sub-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 3px;
  background-color: #194e9e;
  border-radius: 3px 3px 0 0;
}

/* Tab contents */
.tab-pane-content {
  padding: 8px 16px 72px 16px;
}

.ticket-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Custom Ticket Card (Matches Screenshots 1 & 2) */
.ticket-custom-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.ticket-custom-card.is-expanded {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.ticket-custom-card.is-sold-out {
  background-color: #f1f5f9 !important;
  border-color: #e2e8f0 !important;
  opacity: 0.75;
}

.ticket-custom-card.is-sold-out .ticket-header-area,
.ticket-custom-card.is-sold-out .ticket-footer-area,
.ticket-custom-card.is-sold-out .ticket-accordion-body {
  background-color: #f1f5f9 !important;
}

.ticket-custom-card.is-sold-out .ticket-title-text,
.ticket-custom-card.is-sold-out .price-value,
.ticket-custom-card.is-sold-out .price-label,
.ticket-custom-card.is-sold-out .validity-text,
.ticket-custom-card.is-sold-out .end-date-value {
  color: #94a3b8 !important;
}

.ticket-notch {
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: #f8fafc;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  box-shadow: inset 0 0 0 1px #cbd5e1;
}

.ticket-notch.notch-left {
  left: -8px;
}

.ticket-notch.notch-right {
  right: -8px;
}

/* Card Header Top Row */
.ticket-header-area {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 22px;
  background-color: #ffffff;
}

.ticket-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticket-title-text {
  font-size: 14px;
  font-weight: 600;
  color: #151416;
  margin: 0;
}

.sales-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #dcfce7;
  color: #15803d;
  font-size: 8.5px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: none;
  letter-spacing: 0px;
  width: fit-content;
}

.sales-status-badge.sales-ended {
  background-color: #fee2e2;
  color: #b91c1c;
}

.status-dot-mini {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #16a34a;
}

.sales-status-badge.sales-ended .status-dot-mini {
  background-color: #e52424;
}

.ticket-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding-left: 10px;
  border-left: 1px solid #f1f5f9;
}

.price-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.price-label {
  font-size: 10px;
  color: #494a4a;
  font-weight: 500;
}

.price-value {
  font-size: 14px;
  font-weight: 600;
  color: #151416;
}

.accordion-chevron-btn {
  background: none;
  border: none;
  color: #194e9e;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chevron-svg-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.25s ease;
}

.chevron-svg-icon.rotated {
  transform: rotate(180deg);
}

/* Accordion Body Content */
.ticket-accordion-body {
  padding: 20px 22px;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-block-label {
  font-size: 10px;
  font-weight: 600;
  color: #151416;
  margin: 0;
}

.date-chip-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-calendar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 3px 8px;
  min-width: 42px;
}

.day-name {
  font-size: 8px;
  font-weight: 600;
  color: #494a4a;
  text-transform: uppercase;
}

.day-num {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.month-name {
  font-size: 8px;
  font-weight: 600;
  color: #494a4a;
}

.validity-text {
  font-size: 12px;
  font-weight: 400;
  color: #000000;
}

.validity-text strong {
  font-weight: 500;
  color: #000000;
}

.accordion-divider-line {
  height: 1px;
  background-color: #e2e8f0;
}

.info-chips-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}

.info-chips-row::-webkit-scrollbar {
  display: none;
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 400;
  color: #000000;
  white-space: nowrap;
  flex-shrink: 0;
}

.chip-svg-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Card Bottom Divider & Footer Area */
.card-bottom-divider {
  height: 1px;
  background-color: #f1f5f9;
}

.ticket-footer-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  background-color: #f8fafc;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.end-date-label {
  font-size: 9.5px;
  font-weight: 500;
  color: #494a4a;
}

.end-date-value {
  font-size: 10px;
  font-weight: 600;
  color: #151416;
}

.footer-right {
  display: flex;
  align-items: center;
}

.btn-add-ticket-blue {
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(25, 78, 158, 0.15);
  transition: background-color 0.2s ease;
}

.btn-add-ticket-blue:hover {
  background-color: #0d3e91;
}

.stepper-blue-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 3px 6px;
}

.stepper-btn-minus, .stepper-btn-plus {
  background: #194e9e;
  color: #ffffff;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-btn-minus {
  background: #f1f5f9;
  color: #194e9e;
}

.stepper-count-num {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  min-width: 14px;
  text-align: center;
}

.sold-out-pill-btn {
  background-color: #e2e8f0;
  color: #494a4a;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
}

/* Accordion Transition */
.accordion-expand-enter-active, .accordion-expand-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
}

.accordion-expand-enter-from, .accordion-expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}
.ticket-type-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.ticket-side-notch-left {
  position: absolute;
  left: -8px;
  top: 70px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  z-index: 2;
  box-sizing: border-box;
}

.ticket-side-notch-right {
  position: absolute;
  right: -8px;
  top: 70px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  z-index: 2;
  box-sizing: border-box;
}

.ticket-type-card.sold-out-card {
  border-color: #e2e8f0;
}

.ticket-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.ticket-info-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticket-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.ticket-price {
  font-size: 15px;
  font-weight: 600;
  color: #000000;
}

.ticket-price.price-sold-out {
  color: #94a3b8;
}

.ticket-edit-btn {
  background: none;
  border: none;
  color: #194e9e;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-svg {
  width: 18px;
  height: 18px;
}

.ticket-card-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin-bottom: 12px;
}

.ticket-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sold-label {
  font-size: 13px;
  color: #494a4a;
  font-weight: 500;
}

.sold-count-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.normal-badge {
  background-color: #e0e7ff;
  color: #194e9e;
}

.sold-out-badge {
  background-color: #fee2e2;
  color: #ef4444;
}

/* Add Ticket Button */
.add-ticket-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background-color: #ffffff;
  border: 1.5px solid #194e9e;
  color: #194e9e;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.add-ticket-btn:hover {
  background-color: #f5faff;
}

.plus-icon {
  width: 16px;
  height: 16px;
}

.mock-tab-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  color: #494a4a;
  font-size: 14px;
  text-align: center;
}

.description-tab-content, .terms-tab-content {
  color: #000000;
  line-height: 1.6;
  font-size: 14px;
  font-family: var(--font-sans);
  text-align: left;
}

.desc-paragraph {
  margin-bottom: 16px;
  color: #000000;
  text-transform: none;
}

.section-sub-title {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #000000;
  text-transform: none;
}

.desc-list, .terms-list {
  padding-left: 20px;
  margin-bottom: 16px;
  color: #000000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.desc-list li, .terms-list li {
  color: #000000;
  text-transform: none;
}

/* Inline Ticket Edit Form styles matching CreateEvent */
.inline-ticket-form-container {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 8px 0px 80px 0px;
}

.ticket-modal-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
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
  text-align: left;
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
  font-family: var(--font-sans);
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

/* Text input with underline */
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
  text-align: left;
}

.modal-form-input:focus, .modal-form-textarea:focus {
  border-color: #194E9E;
  box-shadow: none;
}

/* Hide native browser calendar/clock icons */
.modal-form-input::-webkit-calendar-picker-indicator {
  display: none !important;
  -webkit-appearance: none;
}

.modal-form-textarea {
  height: 80px;
  resize: none;
  line-height: 1.4;
  padding-right: 0;
}

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

.modal-columns-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-columns-row > .modal-form-group {
  flex: 1;
}

.modal-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
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

.checklist-label {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.modal-form-input.sub-input {
  margin-top: 6px;
  border-color: #cbd5e1;
}

/* Fixed Form Actions Button Bar relative to detail page (Matches Screenshot) */
.ticket-form-actions-bar-fixed {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #ffffff;
  border-top: 1px solid #f1f5f9;
  padding: 10px 14px 12px 14px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
}

.bottom-bar-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.bottom-bar-price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.bottom-bar-label {
  font-size: 11px;
  font-weight: 500;
  color: #494a4a;
}

.bottom-bar-price-val {
  font-size: 17px;
  font-weight: 600;
  color:  #151416;
  line-height: 1.2;
}

.detail-toggle-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #f8fafc;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #194e9e;
  cursor: pointer;
}

.pill-chevron-icon {
  width: 12px;
  height: 12px;
  stroke: #194e9e;
  transition: transform 0.25s ease;
}

.pill-chevron-icon.rotated {
  transform: rotate(180deg);
}

.bottom-bar-btn-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.btn-primary-blue-buy {
  flex: 1;
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 11px 16px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(25, 78, 158, 0.25);
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary-blue-buy:hover {
  background-color: #0d3e91;
}

.btn-chat-bubble {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: #194e9e;
  color: #ffffff;
  border: 1.5px solid #194e9e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(25, 78, 158, 0.25);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-chat-bubble:hover {
  background-color: #0d3e91;
  border-color: #194e9e;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(25, 78, 158, 0.35);
}

.btn-chat-bubble:active {
  transform: scale(0.93);
}

.chat-bubble-svg {
  width: 22px;
  height: 22px;
}

.gmaps-direct-btn {
  background: transparent !important;
  border: none !important;
  width: auto !important;
  height: auto !important;
  border-radius: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: opacity 0.2s ease !important;
  box-shadow: none !important;
  flex-shrink: 0 !important;
  padding: 4px !important;
}

.gmaps-direct-btn:hover {
  background: transparent !important;
  opacity: 0.75 !important;
  transform: none !important;
  box-shadow: none !important;
}

.gmaps-direct-btn:active {
  opacity: 0.5 !important;
  transform: none !important;
}

.gmaps-icon-svg {
  width: 17px;
  height: 17px;
}

/* Transition for slide up */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Invitation & Penjualan tab content styles */
.tab-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 8px;
}

.tab-content-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.btn-primary-sm {
  background-color: #194e9e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s;
}

.btn-primary-sm:hover {
  background-color: #143e7e;
}

.plus-icon-sm {
  width: 14px;
  height: 14px;
}

/* Invitation List - New Ticket Card style */
.invitation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 80px; /* prevent overlap with fixed bottom bar */
}

.invitation-ticket-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.invitation-ticket-card.is-checked-in {
  background-color: #fbfdfb;
}

.invitation-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.invitation-card-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.invite-card-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.invite-card-email {
  font-size: 12px;
  color: #494a4a;
}

.invitation-card-right {
  display: flex;
  align-items: center;
}

.check-in-indicator-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.check-in-indicator-badge.checked-in {
  background-color: #d1fae5;
  color: #065f46;
}

.check-in-indicator-badge.not-checked-in {
  background-color: #f1f5f9;
  color: #494a4a;
}

.invitation-card-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.invite-meta-badge {
  font-size: 11px;
  font-weight: 600;
  background-color: #eff6ff;
  color: #194e9e;
  padding: 2px 8px;
  border-radius: 6px;
}

.invite-meta-role {
  font-size: 11px;
  font-weight: 500;
  color: #194e9e;
  background-color: #eff6ff;
  padding: 2px 8px;
  border-radius: 6px;
}

.invitation-card-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 12px 0;
}

/* Actions in Invitation Card */
.invitation-card-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.invite-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #194e9e;
  background-color: #194e9e;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-sans);
}

.invite-action-btn:hover {
  background-color: #144389;
  border-color: #144389;
  color: #ffffff;
}

.invite-action-btn.detail-btn {
  flex: 1;
}

.invite-action-btn.edit-btn,
.invite-action-btn.send-btn {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  padding: 0;
}

/* Bottom Sheet Styling */
.bottom-sheet-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bottom-sheet-content {
  width: 100%;
  max-width: 480px;
  background-color: #ffffff;
  border-radius: 20px 20px 0 0;
  padding-bottom: 24px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.bottom-sheet-content.dragging {
  transition: none;
}

.bottom-sheet-drag-handle-area {
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.bottom-sheet-drag-handle-area:active {
  cursor: grabbing;
}

.bottom-sheet-drag-handle {
  width: 36px;
  height: 4px;
  background-color: #cbd5e1;
  border-radius: 999px;
}

.bottom-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 12px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.bottom-sheet-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.bottom-sheet-close-btn {
  background: none;
  border: none;
  color: #494a4a;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-svg-icon {
  width: 20px;
  height: 20px;
}

.bottom-sheet-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.sheet-detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.sheet-detail-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
}

.sheet-detail-field:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.sheet-detail-label {
  font-size: 11px;
  font-weight: 600;
  color: #000000;
}

.sheet-detail-value {
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
}

.sheet-detail-notes {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  text-align: left;
}

.sheet-detail-notes-text {
  font-size: 13px;
  color: #334155;
  margin-top: 4px;
  line-height: 1.4;
}

/* Animations */
.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.3s ease;
}

.sheet-fade-enter-active .bottom-sheet-content {
  animation: slide-up-sheet 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-fade-leave-active .bottom-sheet-content {
  animation: slide-down-sheet 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}

@keyframes slide-up-sheet {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slide-down-sheet {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

.invite-svg-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.invite-svg-icon.rotated {
  transform: rotate(180deg);
}

/* Invitation detail panel */
.invitation-detail-expanded-panel {
  margin-top: 14px;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.detail-label {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.detail-value.font-mono {
  font-family: monospace;
}

.detail-notes-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.detail-notes-text {
  font-size: 12px;
  color: #475569;
  margin: 0;
}

.btn-save-full {
  width: 100%;
  padding: 12px;
  background-color: #194e9e;
  border: none;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-sans);
}

.btn-save-full:hover {
  background-color: #143e7e;
}

.inline-invitation-form-container {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  margin-left: -16px;
  margin-right: -16px;
  padding: 8px 16px 80px 16px;
}

/* Expand Animation */
.expand-enter-active, .expand-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  max-height: 200px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Sales Grid & Summary */
.sales-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.sales-summary-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 10px;
  font-weight: 500;
  color: #494a4a;
  text-align: center;
}

.summary-value {
  font-size: 12px;
  font-weight: 700;
  color: #194e9e;
  text-align: center;
}

/* Sales list styling */
.sales-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sale-item-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sale-info-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.sale-buyer {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.sale-ticket-type {
  font-size: 12px;
  color: #475569;
}

.sale-date {
  font-size: 10px;
  color: #94a3b8;
}

.sale-info-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.sale-total {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.sale-info-right .status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.sale-info-right .status-badge.sukses {
  background-color: #d1fae5;
  color: #065f46;
}

.sale-info-right .status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.sale-info-right .status-badge.gagal {
  background-color: #fee2e2;
  color: #b91c1c;
}

.btn-cancel {
  flex: 1;
  padding: 8px 12px;
  background-color: #ffffff;
  border: 1.5px solid #194e9e;
  color: #194e9e;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-family: var(--font-sans);
}

.btn-cancel:hover {
  background-color: #f5faff;
}

.btn-save {
  flex: 1.2;
  padding: 8px 12px;
  background-color: #194e9e;
  border: none;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-sans);
}

.btn-save:hover {
  background-color: #143e7e;
}

.save-icon-svg {
  width: 16px;
  height: 16px;
  stroke: #ffffff;
  fill: none;
}

/* Search bar styling */
.invitation-search-container {
  margin-bottom: 0px;
  width: 100%;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: #194e9e;
  pointer-events: none;
}

.invitation-search-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  font-family: var(--font-sans);
  background-color: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.invitation-search-input:focus {
  border-color: #194e9e;
  box-shadow: 0 0 0 3px rgba(25, 78, 158, 0.1);
}
</style>
