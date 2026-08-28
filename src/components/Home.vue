<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import Checkin from './Checkin.vue';
import Dashboard from './Dashboard.vue';
import Event from './Event.vue';
import CreateEvent from './CreateEvent.vue';
import EventDetail from './EventDetail.vue';
import { Vue3Lottie } from 'vue3-lottie';

const emit = defineEmits(['logout']);

const searchQuery = ref('');
const activeTab = ref('Dashboard');
const selectedEvent = ref(null);

const checkinInitialTab = ref('aktif');
const checkinInitialEvent = ref(null);

const handleSwitchTab = (tab, initialTab = 'aktif', initialEvent = null) => {
  activeTab.value = tab;
  checkinInitialTab.value = initialTab;
  checkinInitialEvent.value = initialEvent;
};

// Handles back/done from CreateEvent component
const eventInitialFilter = ref('semua');
const handleCreateEventBack = (intent, newEvent) => {
  if (intent === 'draft') {
    eventInitialFilter.value = 'draf';
    // Add the draft event to the events array
    if (newEvent) {
      events.value.unshift({ ...newEvent, status: 'Draft' });
    }
  } else if (intent === 'publish') {
    eventInitialFilter.value = 'semua';
    // Add the new event to the events array
    if (newEvent) {
      events.value.unshift(newEvent);
    }
  } else {
    eventInitialFilter.value = 'semua';
  }
  activeTab.value = 'event';
};

// Reset scroll position on tab switch to prevent content from starting scrolled down
watch(activeTab, () => {
  const scrollArea = document.querySelector('.content-scroll-area');
  if (scrollArea) {
    scrollArea.scrollTop = 0;
  }
});

const sadAnimation = ref(null);
onMounted(async () => {
  const res = await fetch('/media/sad emotion.json');
  sadAnimation.value = await res.json();
});

const isSidebarOpen = ref(false);
const isSaldoOpen = ref(true);
const isEventGroupOpen = ref(true);

const events = ref([
  {
    id: 1,
    title: 'Ngamen 0.5',
    price: 'Rp124.000',
    organizer: 'Maxpaincompany LTD',
    creatorLogo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80',
    location: 'Karawang',
    date: 'Sat, 24 Aug 2024',
    sold: 150,
    total: 200,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    title: 'SIKSAKUBUR - Tiga Dekade Melawan Tunduk',
    price: 'Rp8.000',
    organizer: 'Newhope.inc',
    creatorLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
    location: 'IKJ',
    date: 'Sun, 25 Aug 2024',
    sold: 500,
    total: 1000,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    title: 'Straight Answer 30 Years Of Persistence',
    price: 'Rp85.000',
    organizer: 'Smartex Bomb Records',
    creatorLogo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80',
    location: 'Fatmawati',
    date: 'Sat, 31 Aug 2024',
    sold: 80,
    total: 100,
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    title: 'Intimate Show MORAD',
    price: 'Rp80.000',
    organizer: 'Morad Music Asia',
    creatorLogo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
    location: 'TBA',
    date: 'Wed, 04 Sep 2024',
    sold: 200,
    total: 200,
    status: 'Live',
    isSoldOut: true,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 5,
    title: 'Rooted Relevant Collective',
    price: 'Rp350.000',
    organizer: 'Independent Organizer',
    creatorLogo: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=80&q=80',
    location: 'Jakarta',
    date: 'Fri, 13 Sep 2024',
    sold: 45,
    total: 100,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 6,
    title: 'ROEANG DUARIBU',
    price: 'Rp120.000',
    organizer: 'Creative Hub',
    creatorLogo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
    location: 'Bandung',
    date: 'Sat, 21 Sep 2024',
    sold: 45,
    total: 100,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=400&q=80'
  }
]);

const handleTarikSaldo = () => {
  alert('Penarikan saldo sedang diproses');
};
</script>

<template>
  <div class="mobile-wrapper">
    <!-- Top Nav Bar -->
    <header class="navbar-header" :class="{ 'hidden-header': activeTab === 'create-event' || activeTab === 'event-detail' }">
      <div class="nav-left-group">
        <button class="nav-menu-btn" @click="isSidebarOpen = true">
          <!-- Hamburger Menu -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        
        <div class="navbar-logo-container">
          <img src="/media/logo.png" alt="Kolektix Logo" class="nav-logo" />
        </div>
      </div>

      <div class="nav-profile-container">
        <div class="profile-circle">
          <!-- Profile Icon SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="profile-svg">
            <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </header>

    <!-- Main Scrollable Content Area -->
    <main class="content-scroll-area" :class="{ 'checkin-list-bg': activeTab === 'Checkin', 'dashboard-no-padding': activeTab === 'Dashboard' || activeTab === 'event' || activeTab === 'create-event' || activeTab === 'event-detail' }">
      <!-- Dashboard tab content template -->
      <template v-if="activeTab === 'Dashboard'">
        <Dashboard :events="events" />
      </template>

      <!-- Home tab content template -->
      <template v-if="activeTab === 'home'">
        <!-- Blue Header Wrapper -->
        <div class="header-blue-bg">
          <!-- Sales & Payout Summary Card -->
          <section class="summary-card">
            <span class="summary-title">Total Penjualan</span>
            <h2 class="summary-amount">Rp 48.500.000</h2>
            
            <div class="summary-badges">
              <div class="summary-badge">
                <span class="badge-dot green-dot"></span>
                <span class="badge-text">3 Event Aktif</span>
              </div>
              <div class="summary-badge">
                <!-- Ticket Icon SVG -->
                <svg viewBox="0 0 24 24" fill="currentColor" class="badge-icon-ticket">
                  <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/>
                </svg>
                <span class="badge-text">1.420 Tiket Terjual</span>
              </div>
            </div>
            
            <div class="summary-divider"></div>
            
            <div class="payout-row">
              <div class="payout-info">
                <span class="payout-label">Saldo Payout</span>
                <span class="payout-amount">Rp 12.400.000</span>
              </div>
              <button class="payout-btn" @click="handleTarikSaldo">
                <span>Tarik Saldo</span>
                <!-- Arrow Right Icon -->
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="arrow-icon">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </section>
        </div>

        <!-- White Container for Event Cards with custom rounded transition -->
        <div class="events-container">
          <!-- Event Cards List -->
          <section class="cards-list-section">
            <div 
              v-for="event in events" 
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
                
                <!-- Creator Profile & Verified Badge Row -->
                <div class="creator-profile-row">
                  <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                  <span class="creator-name">{{ event.organizer }}</span>
                  <span class="verified-badge">
                    <!-- Verified Checkmark Icon -->
                    <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg" xmlns="http://www.w3.org/2000/svg">
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

                <!-- Price moved below date -->
                <div class="price-row">
                  <span class="event-card-price">{{ event.price }}</span>
                </div>

                <!-- Footer Progress bar without Kelola Button -->
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
      </template>

      <!-- Event Component -->
      <Event v-else-if="activeTab === 'event'" :events="events" :initial-filter="eventInitialFilter" @switch-tab="handleSwitchTab" @lihat-detail="(e) => { selectedEvent = e; activeTab = 'event-detail'; }" />

      <!-- Event Detail Component -->
      <EventDetail v-else-if="activeTab === 'event-detail'" :event="selectedEvent" @back="activeTab = 'event'" />

      <!-- Create Event Component -->
      <CreateEvent v-else-if="activeTab === 'create-event'" @back="handleCreateEventBack" />

      <!-- Checkin Component -->
      <Checkin v-else-if="activeTab === 'Checkin'" :events="events" :initial-tab="checkinInitialTab" :initial-event="checkinInitialEvent" />

      <!-- Merch Empty State -->
      <template v-else-if="activeTab === 'merch'">
        <div class="merch-empty-state">
          <div class="merch-blue-line"></div>
          <Vue3Lottie v-if="sadAnimation" :animationData="sadAnimation" :height="180" :width="180" />
          <h3 class="merch-empty-title">Belum Ada Merchandise</h3>
          <p class="merch-empty-desc">Fitur merchandise sedang dalam pengembangan</p>
        </div>
      </template>
    </main>

    <!-- Bottom Tab Navigation Bar -->
    <nav class="bottom-nav" :class="{ 'hidden-nav': activeTab === 'create-event' || activeTab === 'event-detail' }">
      <button class="nav-tab home-tab" :class="{ active: activeTab === 'home' }" @click="activeTab = 'home'">
        <!-- Custom Logo Image -->
        <img 
          :src="activeTab === 'home' ? '/media/home (2).png' : '/media/home (1).png'" 
          alt="Home Icon" 
          class="tab-icon-image"
        />
        <span class="tab-label home-label">Home</span>
      </button>

      <button class="nav-tab" :class="{ active: activeTab === 'Checkin' }" @click="handleSwitchTab('Checkin', 'aktif', null)">
        <!-- Scanner Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
          <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="6" y1="12" x2="18" y2="12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="tab-label">Checkin</span>
      </button>

      <button class="nav-tab" :class="{ active: activeTab === 'event' }" @click="handleSwitchTab('event', 'aktif', null)">
        <!-- Calendar Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="3" y1="9" x2="21" y2="9" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="tab-label">Event</span>
      </button>

      <button class="nav-tab" :class="{ active: activeTab === 'merch' }" @click="activeTab = 'merch'">
        <!-- T-Shirt Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
          <path d="M9 3H4v3c0 2 1 3 3 3h1v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9h1c2 0 3-1 3-3V3h-5c-.5 1-1.5 2-3 2s-2.5-1-3-2Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="tab-label">Merch</span>
      </button>

      <button class="nav-tab" :class="{ active: activeTab === 'Dashboard' }" @click="activeTab = 'Dashboard'">
        <!-- Dashboard Grid Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
        <span class="tab-label">Dashboard</span>
      </button>
    </nav>

    <!-- Sidebar Drawer Component (Image 1) -->
    <transition name="fade">
      <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>
    </transition>
    
    <transition name="slide-sidebar">
      <div v-if="isSidebarOpen" class="sidebar-drawer">
        <!-- Sidebar Header -->
        <div class="sidebar-logo-section">
          <div class="logo-group">
            <img src="/media/logo.png" alt="Kolektix Logo" class="sidebar-logo" />
            <span class="sidebar-logo-subtitle">CREATOR</span>
          </div>
        </div>

        <!-- Creator Profile Card -->
        <div class="sidebar-profile-card">
          <div class="profile-info-group">
            <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" alt="Avatar" class="sidebar-avatar" />
            <div class="profile-text">
              <span class="profile-name">maspamcompany LTD</span>
              <span class="profile-role">Creator</span>
            </div>
          </div>
          <button class="sidebar-toggle-btn" @click="isSaldoOpen = !isSaldoOpen">
            <div class="chevron-circle" :class="{ active: isSaldoOpen }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="chevron-icon">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </div>
          </button>
        </div>

        <!-- Collapsible Saldo -->
        <div v-show="isSaldoOpen" class="sidebar-saldo-card">
          <div class="saldo-row">
            <div class="saldo-label-group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="saldo-icon">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <span>Saldo</span>
            </div>
            <span class="saldo-amount">Rp.0</span>
          </div>
          <button class="saldo-detail-btn-new" @click="handleTarikSaldo">Detail</button>
        </div>

        <!-- Menu Items Navigation List -->
        <nav class="sidebar-nav">
          <!-- Dashboard item (with Home icon) -->
          <button class="sidebar-nav-item" :class="{ active: activeTab === 'Dashboard' }" @click="activeTab = 'Dashboard'; isSidebarOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Dashboard</span>
          </button>

          <!-- Expandable Event Item -->
          <div class="sidebar-nav-group">
            <button class="sidebar-nav-item parent" @click="isEventGroupOpen = !isEventGroupOpen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Event</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-chevron" :class="{ rotated: !isEventGroupOpen }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Submenu Items -->
            <div v-show="isEventGroupOpen" class="sidebar-sub-items">
              <button class="sidebar-sub-item" :class="{ active: activeTab === 'event' }" @click="handleSwitchTab('event', 'aktif', null); isSidebarOpen = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sub-icon">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Event Saya</span>
              </button>
              
              <button class="sidebar-sub-item" :class="{ active: activeTab === 'Checkin' && checkinInitialTab !== 'report' }" @click="handleSwitchTab('Checkin', 'aktif', null); isSidebarOpen = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sub-icon">
                  <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" stroke-linecap="round" stroke-linejoin="round" />
                  <line x1="6" y1="12" x2="18" y2="12" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>Check In Event</span>
              </button>

              <button class="sidebar-sub-item" :class="{ active: activeTab === 'Checkin' && checkinInitialTab === 'report' }" @click="handleSwitchTab('Checkin', 'report', null); isSidebarOpen = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sub-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                </svg>
                <span>Check In Report</span>
              </button>

              <button class="sidebar-sub-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sub-icon">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                <span>Report Event</span>
              </button>
            </div>
          </div>

          <!-- Sales Report -->
          <button class="sidebar-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
            <span>Sales Report</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-right-sub">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <!-- Ticket OTS -->
          <button class="sidebar-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
              <rect x="2" y="6" width="20" height="12" rx="2" ry="2"/>
              <line x1="6" y1="6" x2="6" y2="18"/>
              <line x1="18" y1="6" x2="18" y2="18"/>
            </svg>
            <span>Ticket OTS</span>
          </button>
        </nav>

        <!-- Sidebar compact button footer -->
        <div class="sidebar-footer">
          <button class="sidebar-nav-item compact-btn" @click="isSidebarOpen = false">
            <span>Persingkat Menu</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon right-icon">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.mobile-wrapper {
  width: 100%;
  max-width: 100%;
  height: 100vh;
  height: 100dvh;
  background-color: #fcfcfd;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

@media (min-width: 480px) {
  .mobile-wrapper {
    max-width: 410px;
    height: 88vh;
    max-height: 840px;
    border-radius: 30px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    margin: auto;
  }
}

/* Navbar styles */
.navbar-header {
  background-color: var(--primary-base);
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease;
  transform: translateY(0);
  opacity: 1;
}

.navbar-header.hidden-header {
  transform: translateY(-100%);
  opacity: 0;
  height: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
  border: none;
  pointer-events: none;
}

.nav-menu-btn, .nav-profile-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--white);
  cursor: pointer;
  padding: 0;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.navbar-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-logo {
  max-height: 28px;
  width: auto;
}

.profile-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--white);
  color: var(--grey);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-svg {
  width: 24px;
  height: 24px;
}

/* Content Scrollable area */
.content-scroll-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px 16px 84px 16px; /* extra bottom padding */
  display: flex;
  flex-direction: column;
  gap: 24px;
  scrollbar-width: none;
}

.content-scroll-area::-webkit-scrollbar {
  display: none;
}

.content-scroll-area.dashboard-no-padding {
  padding: 0;
}

/* Blue Header Container */
.header-blue-bg {
  background-color: var(--primary-base);
  padding: 20px 16px 0 16px; /* shortened bottom edge to 0, adjusted top */
  margin: -24px -16px 0 -16px;
  position: relative;
  z-index: 3; /* higher z-index so it stays on top of events-container, showing summary-card shadow */
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
}

/* Summary Card styles */
.summary-card {
  background-color: var(--white);
  border: 1px solid var(--light-grey);
  border-radius: 12px; /* standardized rounded corners */
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 16px -6px rgba(0, 0, 0, 0.04); /* neat thin shadow matching border */
  margin-top: 12px;
  margin-bottom: -32px; /* overlap blue area */
  position: relative;
  z-index: 3;
}

.summary-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--dark-grey);
  text-transform: none; /* Not all uppercase */
}

.summary-amount {
  font-size: 26px;
  font-weight: 800;
  color: var(--dark);
  margin-top: 4px;
  margin-bottom: 14px;
  font-family: var(--font-sans);
}

.summary-badges {
  display: flex;
  overflow-x: auto;
  flex-wrap: nowrap;
  gap: 8px;
  margin-bottom: 16px;
  scrollbar-width: none; /* Hide scrollbar Firefox */
  -ms-overflow-style: none; /* Hide scrollbar IE/Edge */
}

.summary-badges::-webkit-scrollbar {
  display: none; /* Hide scrollbar Chrome/Safari */
}

.summary-badge {
  background: none; /* Remove background */
  border: 1px solid var(--light-grey); /* Keep thin border */
  padding: 5px 12px;
  border-radius: 12px; /* standardized rounded corners */
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0; /* Prevent badges from squishing */
}

.summary-badge .badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.summary-badge .green-dot {
  background-color: #16a34a;
}

.badge-icon-ticket {
  width: 14px;
  height: 14px;
  color: var(--primary-base);
}

.badge-text {
  font-size: 11px;
  font-weight: 400; /* Not bold */
  color: var(--dark); /* Black color text */
  text-transform: none; /* Not all uppercase */
}

.summary-divider {
  height: 1px;
  background-color: var(--light-grey);
  margin-bottom: 14px;
}

.payout-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payout-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.payout-label {
  font-size: 11px;
  color: var(--dark); /* Black text color */
  font-weight: 500; /* Not too thin, not too bold */
  text-transform: none;
}

.payout-amount {
  font-size: 16px;
  font-weight: 600; /* Balanced semi-bold text, not too thin or bold */
  color: var(--dark); /* Black color payout amount */
}

.payout-btn {
  background-color: var(--primary-base); /* Blue color button */
  color: var(--white);
  border: none;
  border-radius: 12px; /* standardized rounded corners */
  padding: 6px 12px; /* Smaller button size */
  font-size: 11px; /* Smaller button font size */
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.payout-btn:hover {
  background-color: var(--primary-light-700);
  opacity: 0.95;
}

.arrow-icon {
  width: 12px;
  height: 12px;
}

/* White background container wrapping event list styled as full screen section */
.events-container {
  background-color: var(--white);
  border-top-left-radius: 16px; /* rounded top left corner matching mockup */
  border-top-right-radius: 16px; /* rounded top right corner matching mockup */
  padding: 96px 16px 84px 16px; /* increased top padding to shift event cards slightly lower down */
  margin: -64px -16px 0 -16px; /* pulled higher up to make the blue background bottom side shorter */
  position: relative;
  z-index: 2;
}

/* Event Cards */
.cards-list-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.event-card {
  background-color: var(--white);
  border: 1px solid var(--light-grey);
  border-radius: 12px; /* standardized rounded corners */
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
  padding: 3px 8px; /* reduced from 4px 10px */
  font-size: 10px; /* reduced from 11px */
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px; /* reduced from 6px */
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

/* Creator Profile & Verified Checkmark badge */
.creator-profile-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.creator-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--primary-light-200);
}

.creator-name {
  font-size: 12px;
  font-weight: 600; /* Semi-bold text creator */
  color: var(--dark); /* Black color text */
}

.verified-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2196F3; /* Verified blue check badge */
}

.verified-check-svg {
  width: 16px;
  height: 16px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--dark); /* Black color text */
  margin-top: 2px;
}

.meta-icon {
  width: 14px;
  height: 14px;
  color: var(--primary-base); /* Blue color icons */
}

.meta-text {
  font-size: 12px;
  color: var(--dark); /* Black color text, not bold/uppercase */
}

.price-row {
  margin-top: 4px;
}

.event-card-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--dark);
  display: inline-block;
}

/* Progress bar row */
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
  color: var(--dark); /* Black color text */
}

.sales-percent {
  font-size: 11px;
  font-weight: 700;
  color: var(--dark); /* Black color text */
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

.sales-progress-fill.sold-out-fill {
  background-color: var(--primary-disabled);
}

/* Bottom Nav styles */
.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 68px;
  background-color: var(--white);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  z-index: 10;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.08), 0 -2px 10px rgba(0, 0, 0, 0.04); /* stronger visible shadow */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease;
  transform: translateY(0);
  opacity: 1;
}

.bottom-nav.hidden-nav {
  transform: translateY(100%);
  opacity: 0;
  height: 0;
  padding: 0;
  overflow: hidden;
  border: none;
  pointer-events: none;
}

.nav-tab {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px; /* decreased gap to raise text position */
  color: var(--grey);
  cursor: pointer;
  padding: 4px 4px; /* adjusted padding to keep balance */
  transition: color 0.2s;
  flex: 1;
  height: 100%;
  position: relative;
  font-family: var(--font-sans);
}

.nav-tab:hover {
  color: var(--dark-grey);
}

.tab-icon {
  width: 24px;
  height: 24px;
}

.tab-icon-image {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}

.home-label {
  margin-top: -6px; /* pull Home label up to align with smaller icons */
}

/* Shift entire Home tab contents up slightly */
.home-tab .tab-icon-image,
.home-tab .home-label {
  transform: translateY(-4px);
}

/* Active tab style with top indicator line and blue text */
.nav-tab.active {
  color: var(--primary-base);
  font-weight: 700;
}

.nav-tab.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 3px;
  background-color: var(--primary-base);
  border-radius: 0 0 4px 4px;
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
  0% { top: 12px; }
  50% { top: 228px; }
  100% { top: 12px; }
}

.scanner-simulation-panel {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
}

.sim-btn {
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 600;
  border: none;
  border-radius: 20px;
  color: var(--white);
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.2s, transform 0.1s;
}

.sim-btn:active {
  transform: scale(0.95);
}

.sim-btn:hover {
  opacity: 1;
}

.sim-btn.success {
  background-color: #10b981;
}

.sim-btn.failed {
  background-color: #ef4444;
}

.sim-btn.already {
  background-color: #f59e0b;
}

/* ==========================================
   CHECK-IN LIST PAGE STYLES
   ========================================== */

.content-scroll-area.checkin-list-bg {
  background-color: #fcfcfd;
  padding: 0px 0px 84px 0px; /* overrides main padding (24px 16px) to shift content up and go full-width */
  gap: 0px;
}

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
  color: var(--primary-base); /* changed from var(--dark) to blue */
  font-weight: 600; /* reduced from 700 */
}

.checkin-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--primary-base); /* match style.css primary blue */
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
  padding: 64px 24px 32px 24px;
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
  transition: all 0.2s;
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
  justify-content: center;
  align-items: center;
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
  top: 30px;
  z-index: 2;
}

.doc-card {
  position: absolute;
  width: 32px;
  height: 44px;
  background-color: var(--white);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.doc-card.doc1 {
  top: -12px;
  left: 12px;
  transform: rotate(-10deg);
  background-color: #ffd8a8; /* soft orange doc background */
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
  background-color: #fdba74; /* soft folder amber/orange base */
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
  background-color: #f97316; /* active deep orange matching mockup */
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
  transform: rotate(0deg); /* Arrow pointing up */
}

.scanner-bottom-stats {
  position: relative;
  z-index: 2;
  margin-top: auto;
  padding: 24px 20px 32px 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

.stats-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--white);
}

.stats-progress-container {
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  overflow: hidden;
}

.stats-progress-fill {
  height: 100%;
  background-color: var(--primary-base); /* changed to blue */
  border-radius: 10px;
}

.stats-percent-label {
  align-self: flex-end;
  font-size: 10px;
  font-weight: 700;
  color: var(--primary-base); /* changed to blue */
  margin-top: -2px;
}



.scanner-notification-card {
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

/* Manual Mode Card Form - Custom Mockup Style (Light Theme) */
.scanner-fullscreen-container.manual-bg {
  background-color: #fcfcfd; /* main app background */
  color: var(--dark);
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
  color: #94a3b8; /* soft slate gray placeholder */
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
  font-weight: 600; /* reduced from 700 to prevent heavy bold */
  color: var(--dark);
}

.continue-btn {
  background-color: var(--primary-base); /* changed to blue */
  color: var(--white);
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 11px;
  font-weight: 600; /* reduced from 700 to prevent heavy bold */
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

/* Navbar Left Group Layout */
.nav-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Sidebar Overlay and Sliding Drawer Panel (Image 1) */
.sidebar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

.sidebar-drawer {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background-color: #03204e; /* dark blue matching Image 1 */
  color: var(--white);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 16px rgba(0,0,0,0.15);
  font-family: var(--font-sans);
}

.sidebar-logo-section {
  padding: 24px 20px 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-logo {
  max-height: 28px;
  width: auto;
  align-self: flex-start;
}

.sidebar-logo-subtitle {
  font-size: 8px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.6);
  font-weight: 700;
  margin-left: 2px;
}

.sidebar-profile-card {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-info-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255,255,255,0.2);
}

.profile-text {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--white);
}

.profile-role {
  font-size: 10px;
  color: rgba(255,255,255,0.5);
}

.sidebar-toggle-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 6px;
  color: var(--white);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chevron-up {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
}

.chevron-up.rotated {
  transform: rotate(180deg);
}

.sidebar-saldo-card {
  margin: 0 20px 16px 20px;
  background-color: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saldo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.saldo-label-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(255,255,255,0.7);
}

.saldo-icon {
  width: 14px;
  height: 14px;
}

.saldo-amount {
  font-size: 13px;
  font-weight: 700;
  color: var(--white);
}

.saldo-detail-btn {
  width: 100%;
  background-color: rgba(255,255,255,0.08);
  border: none;
  border-radius: 6px;
  color: var(--white);
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.saldo-detail-btn:hover {
  background-color: rgba(255,255,255,0.15);
}

/* Sidebar Nav Items */
.sidebar-nav {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
}

.sidebar-nav-item {
  width: 100%;
  background: none;
  border: none;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.sidebar-nav-item:hover, .sidebar-nav-item.active {
  background-color: rgba(255,255,255,0.08);
  color: var(--white);
}

.sidebar-nav-item.parent {
  justify-content: space-between;
}

.group-chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
  color: rgba(255,255,255,0.5);
}

.group-chevron.rotated {
  transform: rotate(-90deg);
}

.sidebar-sub-items {
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
}

.sidebar-sub-item {
  width: 100%;
  background: none;
  border: none;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.sidebar-sub-item:hover, .sidebar-sub-item.active {
  color: var(--white);
  background-color: rgba(255,255,255,0.04);
}

.sub-icon {
  width: 12px;
  height: 12px;
}

.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.compact-btn {
  justify-content: flex-start;
}

/* Sidebar Animation classes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-sidebar-enter-active, .slide-sidebar-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-sidebar-enter-from, .slide-sidebar-leave-to {
  transform: translateX(-100%);
}

/* ==========================================
   DASHBOARD TAB PANEL STYLES (Image 2)
   ========================================== */
.dashboard-page-container {
  padding: 20px 16px 84px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f8fafc; /* premium soft light-grey background */
  font-family: var(--font-sans);
}

.dashboard-header-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.verified-account-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #f0fdf4;
  color: #15803d;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid #dcfce7;
  margin-bottom: 4px;
}

.verified-icon-svg {
  width: 12px;
  height: 12px;
}

.dashboard-date-label {
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
}

.dashboard-greeting-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 2px 0 0 0;
}

.dashboard-subtitle {
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
}

.rekap-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.rekap-section-header h2 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.rekap-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.chevron-down-svg {
  width: 10px;
  height: 10px;
}

.sales-total-blue-card {
  background-color: #194E9E; /* theme primary blue */
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--white);
  box-shadow: 0 4px 14px rgba(25, 78, 158, 0.2);
}

.sales-card-title {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.2px;
}

.sales-card-amount {
  font-size: 20px;
  font-weight: 700;
  margin: 6px 0 0 0;
}

.sales-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
}

.sales-doc-svg {
  width: 20px;
  height: 20px;
}

.dashboard-metrics-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-grid-card {
  background-color: var(--white);
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.01);
}

.metric-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
}

.metric-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.metric-card-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.metric-card-icon svg {
  width: 14px;
  height: 14px;
}


/* ===== NEW SIDEBAR STYLES ===== */
.sidebar-logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
}
.logo-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.sidebar-logo { height: 32px; width: auto; }
.sidebar-logo-subtitle {
  font-size: 11px;
  font-weight: 700;
  color: white;
  letter-spacing: 2px;
}

.sidebar-profile-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}
.profile-info-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sidebar-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.profile-text { display: flex; flex-direction: column; gap: 2px; }
.profile-name { font-size: 14px; font-weight: 600; color: white; }
.profile-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  padding: 0;
  border-radius: 0;
  width: auto;
}
.sidebar-toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}
.chevron-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.2s;
}
.chevron-circle.active {
  transform: rotate(180deg);
}
.chevron-icon {
  width: 16px;
  height: 16px;
}

.sidebar-saldo-card {
  margin: 8px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.saldo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.saldo-label-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: white;
}
.saldo-icon { width: 18px; height: 18px; color: white; }
.saldo-amount { font-size: 15px; font-weight: 600; color: white; }
.saldo-detail-btn-new {
  width: 100%;
  background-color: #1e3a8a;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px 0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.saldo-detail-btn-new:hover {
  background-color: #172554;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar-nav-item {
  width: 100%;
  background: transparent;
  border: none;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  position: relative;
}
.sidebar-nav-item:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.05);
}
.sidebar-nav-item.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}
.sidebar-nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: white;
}
.sidebar-nav-item .nav-icon {
  width: 18px;
  height: 18px;
  color: white;
}
.arrow-right-sub {
  margin-left: auto;
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.sidebar-nav-group {
  display: flex;
  flex-direction: column;
}
.sidebar-nav-item.parent {
  justify-content: space-between;
}
.group-chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}
.group-chevron.rotated {
  transform: rotate(-90deg);
}

.sidebar-sub-items {
  display: flex;
  flex-direction: column;
  padding-left: 20px;
  background-color: rgba(0, 0, 0, 0.15);
}
.sidebar-sub-item {
  width: 100%;
  background: transparent;
  border: none;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.sidebar-sub-item:hover {
  color: white;
}
.sidebar-sub-item.active {
  color: white;
  font-weight: 600;
}
.sidebar-sub-item .sub-icon {
  width: 16px;
  height: 16px;
  color: white;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #061d4a;
}
.sidebar-footer .compact-btn {
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
}
.sidebar-footer .compact-btn:hover {
  color: white;
}
.sidebar-footer .right-icon {
  margin-left: auto;
}

/* ===== MERCH EMPTY STATE ===== */
.merch-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  padding: 110px 32px 60px 32px; min-height: 60vh; text-align: center;
}
.merch-blue-line {
  width: 170px;
  height: 3px;
  background-color: #194E9E;
  margin-bottom: -2px;
  border-radius: 2px;
}
.merch-empty-title { 
  font-size: 16px; 
  font-weight: 700; 
  color: #0f172a; 
  margin: -10px 0 8px 0; 
  white-space: nowrap;
}
.merch-empty-desc { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0; }

</style>
