<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  events: {
    type: Array,
    required: true
  }
});

const eventTab = ref('event');     // 'event' | 'report'
const ticketType = ref('eticket'); // 'eticket' | 'invitation'
const searchQuery = ref('');
const selectedEvent = ref(null);
const showEventPicker = ref(false);
const showDetails = ref(false);
const selectedTicket = ref(null);

// Sample tickets per event
const allTickets = ref([
  { id: 1, eventId: 1, name: 'Budi Santoso',    invoice: 'INV-00123', seat: 'A-12', type: 'VIP',      phone: '08123456789', email: 'budi.santoso@email.com',  status: 'Checked In', ticketKind: 'eticket' },
  { id: 2, eventId: 1, name: 'Siti Rahmawati',  invoice: 'INV-00124', seat: 'F-08', type: 'Festival', phone: '08987654321', email: 'siti.r@email.com',          status: 'Pending',    ticketKind: 'eticket' },
  { id: 3, eventId: 1, name: 'Ahmad Fauzi',     invoice: 'INV-00125', seat: 'B-03', type: 'VIP',      phone: '08211234567', email: 'ahmad.f@email.com',         status: 'Pending',    ticketKind: 'invitation' },
  { id: 4, eventId: 2, name: 'Rina Kusuma',     invoice: 'INV-00201', seat: 'C-10', type: 'Regular',  phone: '08567891234', email: 'rina.k@email.com',          status: 'Checked In', ticketKind: 'eticket' },
  { id: 5, eventId: 2, name: 'Doni Pratama',    invoice: 'INV-00202', seat: 'D-05', type: 'Regular',  phone: '08312345678', email: 'doni.p@email.com',          status: 'Pending',    ticketKind: 'invitation' },
]);

const filteredTickets = computed(() => {
  let list = allTickets.value;
  if (selectedEvent.value) {
    list = list.filter(t => t.eventId === selectedEvent.value.id);
  }
  list = list.filter(t => t.ticketKind === ticketType.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.invoice.toLowerCase().includes(q) ||
      t.phone.includes(q)
    );
  }
  return list;
});

const totalTickets = computed(() => filteredTickets.value.length);
const checkedInCount = computed(() => filteredTickets.value.filter(t => t.status === 'Checked In').length);

function selectEvent(ev) {
  selectedEvent.value = ev;
  showEventPicker.value = false;
}

function doCheckIn(ticket) {
  ticket.status = 'Checked In';
}

function openDetails(ticket) {
  selectedTicket.value = ticket;
  showDetails.value = true;
}

function closeDetails() {
  showDetails.value = false;
  selectedTicket.value = null;
}

// Per-event stats for event cards
function getEventStats(event) {
  const evTickets = allTickets.value.filter(t => t.eventId === event.id);
  return {
    paid: evTickets.length,
    checkedIn: evTickets.filter(t => t.status === 'Checked In').length,
  };
}

// Draggable Modal Logic
const dragY = ref(0);
const activeDragModal = ref(null);
let startY = 0;
let isDragging = false;

function handleDragStart(e, modal) {
  // Allow dragging the entire card/sheet. If touching the list, only allow drag if it's scrolled to the top.
  const listEl = e.target.closest('.modal-event-list') || e.target.closest('.detail-info-grid');
  if (listEl && listEl.scrollTop > 0) return;

  startY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
  dragY.value = 0;
  activeDragModal.value = modal;
  isDragging = true;

  if (!e.type.startsWith('touch')) {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  }
}

function handleDragMove(e) {
  if (!isDragging || !activeDragModal.value) return;
  const currentY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
  const diffY = currentY - startY;
  if (diffY > 0) {
    dragY.value = diffY;
  }
}

function handleDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  window.removeEventListener('mousemove', handleDragMove);
  window.removeEventListener('mouseup', handleDragEnd);
  
  if (dragY.value > 100) {
    if (activeDragModal.value === 'picker') {
      showEventPicker.value = false;
    } else if (activeDragModal.value === 'detail') {
      closeDetails();
    }
  }
  dragY.value = 0;
  activeDragModal.value = null;
}

const pickerStyle = computed(() => {
  if (activeDragModal.value === 'picker') {
    return { transform: `translateY(${dragY.value}px)`, transition: 'none' };
  }
  return {};
});

const detailStyle = computed(() => {
  if (activeDragModal.value === 'detail') {
    return { transform: `translateY(${dragY.value}px)`, transition: 'none' };
  }
  return {};
});
</script>

<template>
  <div class="event-list-page">
    <!-- Header Tabs -->
    <div class="event-tabs-header">
      <button class="event-tab-btn" :class="{ active: eventTab === 'event' }" @click="eventTab = 'event'">
        Event
      </button>
      <button class="event-tab-btn" :class="{ active: eventTab === 'report' }" @click="eventTab = 'report'">
        Check-In Report
      </button>
    </div>

    <!-- ======= EVENT TAB ======= -->
    <div class="event-tab-content" v-if="eventTab === 'event'">
      <div class="events-container-alt">
        <section class="cards-list-section">
          <div v-for="event in events" :key="event.id" class="event-card">
            <div class="card-thumbnail-wrapper">
              <img :src="event.image" :alt="event.title" class="event-thumbnail" />
              <div class="status-badge" :class="event.status.toLowerCase()">
                <span class="status-dot"></span>
                <span>{{ event.status }}</span>
              </div>
            </div>

            <div class="card-info">
              <h3 class="event-card-title">{{ event.title }}</h3>

              <div class="creator-profile-row">
                <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                <span class="creator-name">{{ event.organizer }}</span>
                <span class="verified-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              </div>

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

              <div class="price-row">
                <span class="event-card-price">{{ event.price }}</span>
              </div>

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
                      :class="{ 'sold-out-fill': event.isSoldOut }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ======= CHECK-IN REPORT TAB ======= -->
    <div class="event-tab-content report-tab" v-else-if="eventTab === 'report'">
      <div class="events-container-alt">

        <!-- Event Stats Summary -->
        <div class="report-stats-row" v-if="selectedEvent">
          <div class="report-stat-item">
            <span class="report-stat-label">Tiket Terjual</span>
            <span class="report-stat-value">{{ getEventStats(selectedEvent).paid }}</span>
          </div>
          <div class="report-stat-divider"></div>
          <div class="report-stat-item">
            <span class="report-stat-label">Sudah Check-In</span>
            <span class="report-stat-value">{{ getEventStats(selectedEvent).checkedIn }}</span>
          </div>
          <div class="report-stat-divider"></div>
          <div class="report-stat-item">
            <span class="report-stat-label">Belum Check-In</span>
            <span class="report-stat-value">{{ getEventStats(selectedEvent).paid - getEventStats(selectedEvent).checkedIn }}</span>
          </div>
        </div>

        <!-- Select Event Button -->
        <button class="select-event-btn" @click="showEventPicker = true">
          <div class="btn-left">
            <svg class="calendar-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span>{{ selectedEvent ? selectedEvent.title : 'Pilih Event' }}</span>
          </div>
          <svg class="chevron-right-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <!-- Filters Row -->
        <div class="filters-row">
          <div class="search-wrapper">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input type="text" v-model="searchQuery" placeholder="Cari (Invoice, Nama, HP...)" class="search-input" />
          </div>
        </div>

        <!-- Segmented Control -->
        <div class="segmented-control">
          <button class="segment-btn" :class="{ active: ticketType === 'eticket' }" @click="ticketType = 'eticket'">E-Ticket</button>
          <button class="segment-btn" :class="{ active: ticketType === 'invitation' }" @click="ticketType = 'invitation'">Invitation</button>
        </div>

        <!-- Summary Info -->
        <div class="summary-info-row">
          <span class="total-text">Menampilkan {{ totalTickets }} tiket</span>
          <div class="checked-in-count">
            <span class="green-dot"></span>
            <span>{{ checkedInCount }} Checked In</span>
          </div>
        </div>

        <!-- Tickets List -->
        <div class="tickets-list">
          <div v-if="filteredTickets.length === 0" class="empty-tickets">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
            <p>Tidak ada tiket ditemukan</p>
          </div>

          <div
            v-for="ticket in filteredTickets"
            :key="ticket.id"
            class="ticket-card"
            :class="{ 'is-checked-in': ticket.status === 'Checked In' }"
          >
            <!-- No border needed -->

            <div class="ticket-header">
              <div class="ticket-user-info">
                <h4 class="ticket-name">{{ ticket.name }}</h4>
                <p class="ticket-invoice">{{ ticket.invoice }}</p>
              </div>
              <div class="ticket-status-badge" :class="ticket.status === 'Checked In' ? 'badge-checked-in' : 'badge-pending'">
                <svg v-if="ticket.status === 'Checked In'" class="status-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <svg v-else class="status-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{{ ticket.status === 'Checked In' ? 'Sudah Check-In' : 'Belum Check-In' }}</span>
              </div>
            </div>

            <div class="ticket-details-grid">
              <div class="detail-item">
                <span class="detail-label">KURSI</span>
                <span class="detail-value">{{ ticket.seat }} <span class="detail-type">({{ ticket.type }})</span></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">TELEPON</span>
                <span class="detail-value">{{ ticket.phone }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">EMAIL</span>
                <span class="detail-value">{{ ticket.email }}</span>
              </div>
            </div>

            <!-- Footer actions -->
            <div class="ticket-footer" v-if="ticket.status === 'Pending'">
              <button class="action-btn check-in-btn" @click="doCheckIn(ticket)">
                <svg class="qr-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                </svg>
                Check In
              </button>
              <button class="action-btn more-btn" @click="openDetails(ticket)">
                <svg class="dots-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </button>
            </div>
            <div class="ticket-footer justify-end" v-else>
              <button class="details-text-btn" @click="openDetails(ticket)">
                <svg class="info-icon-btn" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                Lihat Detail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======= EVENT PICKER MODAL ======= -->
    <transition name="modal-fade">
      <div class="modal-overlay" v-if="showEventPicker" @click.self="showEventPicker = false">
        <div 
          class="modal-sheet"
          :style="pickerStyle"
          @touchstart="handleDragStart($event, 'picker')"
          @touchmove="handleDragMove"
          @touchend="handleDragEnd"
          @mousedown="handleDragStart($event, 'picker')"
        >
          <div class="modal-handle"></div>
          <h3 class="modal-title">Pilih Event</h3>
          <div class="modal-event-list">
            <div
              v-for="ev in events"
              :key="ev.id"
              class="modal-event-item"
              :class="{ 'selected': selectedEvent && selectedEvent.id === ev.id }"
              @click="selectEvent(ev)"
            >
              <img :src="ev.image" :alt="ev.title" class="modal-event-thumb" />
              <div class="modal-event-info">
                <p class="modal-event-name">{{ ev.title }}</p>
                <p class="modal-event-date">{{ ev.date }}</p>
              </div>
              <svg v-if="selectedEvent && selectedEvent.id === ev.id" class="check-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
          </div>
          <button class="modal-close-btn" @click="showEventPicker = false">Tutup</button>
        </div>
      </div>
    </transition>

    <!-- ======= TICKET DETAIL MODAL ======= -->
    <transition name="modal-fade">
      <div class="modal-overlay" v-if="showDetails && selectedTicket" @click.self="closeDetails">
        <div 
          class="modal-sheet detail-sheet"
          :style="detailStyle"
          @touchstart="handleDragStart($event, 'detail')"
          @touchmove="handleDragMove"
          @touchend="handleDragEnd"
          @mousedown="handleDragStart($event, 'detail')"
        >
          <div class="modal-handle"></div>
          <div class="detail-modal-header">
            <h3 class="modal-title">Detail Tiket</h3>
            <button class="close-x-btn" @click="closeDetails">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="close-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="detail-status-banner" :class="selectedTicket.status === 'Checked In' ? 'banner-green' : 'banner-red'">
            <svg v-if="selectedTicket.status === 'Checked In'" class="banner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <svg v-else class="banner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{{ selectedTicket.status === 'Checked In' ? 'Sudah Check-In' : 'Belum Check-In' }}</span>
          </div>

          <div class="detail-info-grid">
            <div class="detail-row">
              <span class="detail-row-label">Nama</span>
              <span class="detail-row-value">{{ selectedTicket.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-row-label">Invoice</span>
              <span class="detail-row-value">{{ selectedTicket.invoice }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-row-label">Kursi</span>
              <span class="detail-row-value">{{ selectedTicket.seat }} ({{ selectedTicket.type }})</span>
            </div>
            <div class="detail-row">
              <span class="detail-row-label">Telepon</span>
              <span class="detail-row-value">{{ selectedTicket.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-row-label">Email</span>
              <span class="detail-row-value">{{ selectedTicket.email }}</span>
            </div>
          </div>

          <button
            v-if="selectedTicket.status === 'Pending'"
            class="action-btn check-in-btn modal-checkin-btn"
            @click="doCheckIn(selectedTicket)"
          >
            <svg class="qr-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            </svg>
            Lakukan Check In
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.event-list-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Tabs Header */
.event-tabs-header {
  display: flex;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0 16px;
}
.event-tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}
.event-tab-btn.active { color: #194E9E; }
.event-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background-color: #194E9E;
  border-radius: 3px 3px 0 0;
}

/* Container */
.events-container-alt { padding: 16px 12px 120px 12px; }

/* Event Cards */
.cards-list-section { display: flex; flex-direction: column; gap: 20px; }
.event-card {
  background-color: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.card-thumbnail-wrapper { position: relative; width: 100%; height: 160px; background-color: #f1f5f9; }
.event-thumbnail { width: 100%; height: 100%; object-fit: cover; }
.status-badge {
  position: absolute; top: 12px; left: 12px;
  background-color: #fff; border-radius: 20px; padding: 3px 8px;
  font-size: 10px; font-weight: 600; display: flex; align-items: center; gap: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.status-badge.live { color: #16a34a; }
.status-badge.live .status-dot { background-color: #16a34a; }
.status-badge.upcoming { color: #ca8a04; }
.status-badge.upcoming .status-dot { background-color: #ca8a04; }
.status-badge.ended { color: #64748b; }
.status-badge.ended .status-dot { background-color: #64748b; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }

.card-info { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.event-card-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
.creator-profile-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.creator-avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
.creator-name { font-size: 12px; font-weight: 500; color: #475569; }
.verified-badge { color: #194E9E; display: flex; align-items: center; }
.verified-check-svg { width: 14px; height: 14px; }
.meta-row { display: flex; align-items: center; gap: 6px; }
.meta-icon { width: 14px; height: 14px; color: #194E9E; }
.meta-text { font-size: 12px; color: #475569; }
.price-row { margin-top: 4px; margin-bottom: 4px; }
.event-card-price { font-size: 16px; font-weight: 700; color: #0f172a; }

/* Stats row in report tab */
.report-stats-row {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.report-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.report-stat-label {
  font-size: 9px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.report-stat-value {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}
.report-stat-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

/* Ticket card — no border strip */
.ticket-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  transition: all 0.25s ease;
}

/* Event stats - removed from event card, only in report */
.event-stats-row { display: none; }

.card-footer-row { border-top: 1px solid #f1f5f9; padding-top: 12px; display: flex; align-items: center; }
.ticket-sales-info { flex-grow: 1; display: flex; flex-direction: column; gap: 6px; }
.sales-text-row { display: flex; justify-content: space-between; align-items: center; }
.sales-text { font-size: 12px; color: #0f172a; font-weight: 500; }
.sales-percent { font-size: 12px; font-weight: 700; color: #0f172a; }
.sales-progress-bar { width: 100%; height: 6px; background-color: #f1f5f9; border-radius: 4px; overflow: hidden; }
.sales-progress-fill { height: 100%; background-color: #194E9E; border-radius: 4px; transition: width 0.5s ease; }
.sold-out-fill { background-color: #ef4444; }

/* Check-In Report */
.select-event-btn {
  width: 100%; background-color: #194E9E; color: white; border: none;
  border-radius: 10px; padding: 13px 16px; display: flex;
  justify-content: space-between; align-items: center;
  font-size: 13px; font-weight: 600; margin-bottom: 12px; cursor: pointer;
  transition: background 0.15s;
}
.select-event-btn:hover { background-color: #1a3f87; }
.btn-left { display: flex; align-items: center; gap: 8px; }
.calendar-icon { width: 16px; height: 16px; }
.chevron-right-icon { width: 16px; height: 16px; }

.filters-row { display: flex; gap: 8px; margin-bottom: 12px; }
.search-wrapper { flex: 1; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; width: 14px; height: 14px; color: #64748b; }
.search-input {
  width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 10px 12px 10px 34px; font-size: 12px; outline: none; box-sizing: border-box;
}
.search-input::placeholder { color: #94a3b8; }

.segmented-control {
  display: flex; background-color: #f1f5f9;
  border-radius: 8px; padding: 4px; margin-bottom: 12px;
}
.segment-btn {
  flex: 1; background: transparent; border: none;
  padding: 8px 0; font-size: 12px; font-weight: 600;
  color: #64748b; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.segment-btn.active {
  background-color: white; color: #194E9E;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.summary-info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 11px; }
.total-text { color: #475569; font-weight: 500; }
.checked-in-count { display: flex; align-items: center; gap: 6px; color: #475569; font-weight: 600; }
.checked-in-count .green-dot { width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; }

/* Empty state */
.empty-tickets {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 8px; padding: 40px 0; color: #94a3b8;
}
.empty-icon { width: 40px; height: 40px; }
.empty-tickets p { font-size: 13px; }

/* Ticket Cards */
.tickets-list { display: flex; flex-direction: column; gap: 12px; }
.ticket-card {
  background: white; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 14px 14px 14px 18px; position: relative; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03); transition: all 0.25s ease;
}
.ticket-status-border {
  position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
}
.border-green { background-color: #10b981; }
.border-red { background-color: #ef4444; }

.ticket-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.ticket-name { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0; }
.ticket-invoice { font-size: 11px; color: #94a3b8; margin: 0; }

.ticket-status-badge {
  display: flex; align-items: center; gap: 4px; padding: 4px 8px;
  border-radius: 20px; font-size: 10px; font-weight: 700; white-space: nowrap;
}
.badge-checked-in { background-color: #d1fae5; color: #059669; }
.badge-pending { background-color: #fee2e2; color: #dc2626; }
.status-icon { width: 12px; height: 12px; }

.ticket-details-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px; margin-bottom: 14px;
}
.detail-item { display: flex; flex-direction: column; gap: 3px; }
.detail-item.full-width { grid-column: span 2; }
.detail-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
.detail-value { font-size: 11px; font-weight: 600; color: #0f172a; }
.detail-type { font-weight: 400; color: #94a3b8; }

.ticket-footer {
  border-top: 1px dashed #e2e8f0; padding-top: 12px;
  display: flex; justify-content: space-between; gap: 8px;
}
.ticket-footer.justify-end { justify-content: flex-end; }

.action-btn { display: flex; align-items: center; justify-content: center; border-radius: 8px; cursor: pointer; border: none; }
.check-in-btn {
  flex: 1; background-color: #194E9E; color: white;
  padding: 10px 0; font-size: 12px; font-weight: 600; gap: 6px;
  transition: background 0.15s;
}
.check-in-btn:hover { background-color: #1a3f87; }
.qr-icon { width: 16px; height: 16px; }
.more-btn {
  background-color: #f8fafc; border: 1px solid #e2e8f0;
  width: 40px; height: 40px; color: #475569; border-radius: 8px;
}
.dots-icon { width: 16px; height: 16px; }

.details-text-btn {
  background: linear-gradient(135deg, #eff6ff, #e0f2fe);
  border: 1px solid #bfdbfe;
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700; color: #194E9E;
  padding: 7px 14px; border-radius: 20px; cursor: pointer;
  transition: all 0.15s;
}
.details-text-btn:hover { background: #dbeafe; }
.info-icon-btn { width: 14px; height: 14px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 999;
}
.modal-sheet {
  background: white; border-radius: 20px 20px 0 0;
  padding: 12px 20px 28px 20px; width: 100%; max-width: 440px;
  max-height: 85vh; overflow-y: auto;
}
.modal-handle {
  width: 36px; height: 4px; background: #e2e8f0;
  border-radius: 2px; margin: 0 auto 16px auto;
}
.modal-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; }

.modal-event-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.modal-event-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;
  cursor: pointer; transition: all 0.15s;
}
.modal-event-item.selected { border-color: #194E9E; background-color: #eff6ff; }
.modal-event-item:hover { background-color: #f8fafc; }
.modal-event-thumb { width: 52px; height: 40px; border-radius: 6px; object-fit: cover; }
.modal-event-info { flex: 1; }
.modal-event-name { font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 2px 0; }
.modal-event-date { font-size: 11px; color: #64748b; margin: 0; }
.check-icon { width: 18px; height: 18px; color: #194E9E; flex-shrink: 0; }

.modal-close-btn {
  width: 100%; background: #f1f5f9; border: none; border-radius: 10px;
  padding: 13px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer;
}

/* Detail Modal */
.detail-sheet { max-height: 90vh; }
.detail-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.close-x-btn { background: #f1f5f9; border: none; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.close-icon { width: 16px; height: 16px; color: #475569; }

.detail-status-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 10px;
  font-size: 13px; font-weight: 700; margin-bottom: 20px;
}
.banner-green { background-color: #d1fae5; color: #059669; }
.banner-red { background-color: #fee2e2; color: #dc2626; }
.banner-icon { width: 18px; height: 18px; }

.detail-info-grid { display: flex; flex-direction: column; gap: 0; margin-bottom: 20px; }
.detail-row {
  display: flex; justify-content: space-between;
  padding: 12px 0; border-bottom: 1px solid #f1f5f9;
}
.detail-row:last-child { border-bottom: none; }
.detail-row-label { font-size: 12px; color: #64748b; font-weight: 500; }
.detail-row-value { font-size: 12px; color: #0f172a; font-weight: 600; text-align: right; }

.modal-checkin-btn { width: 100%; padding: 14px 0; font-size: 14px; border-radius: 10px; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-sheet, .modal-fade-leave-active .modal-sheet { transition: transform 0.25s ease; }
.modal-fade-enter-from .modal-sheet, .modal-fade-leave-to .modal-sheet { transform: translateY(100%); }
</style>
