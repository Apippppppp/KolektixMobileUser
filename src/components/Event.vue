<script setup>
import { ref, computed, watch, onMounted } from 'vue';

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
  },
  initialFilter: {
    type: String,
    default: 'semua'
  }
});

const emit = defineEmits(['switch-tab', 'lihat-detail']);

const currentFilter = ref(props.initialFilter);
const selectedCategory = ref('Semua');
const selectedTicketModal = ref(null);

const categories = ['Semua', 'Konser Musik', 'Festival', 'Pameran Art', 'Workshop', 'Olahraga'];

watch(() => props.initialFilter, (val) => {
  currentFilter.value = val;
});

// Base Filtered List based on tab and category
const baseFilteredEvents = computed(() => {
  let list = props.events || [];

  if (currentFilter.value === 'aktif') {
    list = list.filter(e => e.status === 'Live' || e.status === 'Upcoming');
  } else if (currentFilter.value === 'draf') {
    list = list.filter(e => e.status === 'Draft');
  } else if (currentFilter.value === 'lalu') {
    list = list.filter(e => e.status === 'Ended');
  }

  if (selectedCategory.value !== 'Semua') {
    list = list.filter(e => {
      const cat = e.category || 'Konser Musik';
      return cat.toLowerCase().includes(selectedCategory.value.toLowerCase());
    });
  }

  return list;
});

// Section 1: Event Populer
const popularEvents = computed(() => {
  return [...baseFilteredEvents.value].sort((a, b) => (b.sold || 0) - (a.sold || 0));
});

// Section 2: Rekomendasi Untukmu
const recommendedEvents = computed(() => {
  return baseFilteredEvents.value.filter((e, idx) => idx % 2 === 0 || e.status === 'Live');
});

// Section 3: Event Pilihan Terfavorit
const allEventsList = computed(() => {
  return baseFilteredEvents.value;
});

const handleLihatDetail = (event) => {
  emit('lihat-detail', event);
};

const openTicketModal = (event) => {
  selectedTicketModal.value = event;
};

const closeTicketModal = () => {
  selectedTicketModal.value = null;
};
</script>

<template>
  <div class="kolektix-event-page">
    <!-- CATEGORIES SCROLL CHIPS -->
    <div class="category-pills-bar">
      <div class="pills-scroll-row">
        <button 
          v-for="cat in categories" 
          :key="cat"
          class="cat-pill-btn"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- MAIN EVENT SECTIONS (EXACT HOME PAGE CARD DESIGN & 1-LINE HORIZONTAL SCROLL) -->
    <div class="event-page-body">

      <!-- SECTION 1: EVENT POPULER -->
      <section v-if="popularEvents.length > 0" class="home-section-group">
        <div class="top-events-header">
          <div class="title-with-blue-icon">
            <lottie-player 
              src="/media/Fire.json" 
              background="transparent" 
              speed="1" 
              class="section-title-lottie" 
              loop 
              autoplay
            ></lottie-player>
            <h2 class="top-events-title">Event Populer</h2>
          </div>
          <button class="see-all-icon-btn" @click="selectedCategory = 'Semua'" title="Lihat Semua">
            <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.2" class="arrow-right-icon">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="events-horizontal-row">
          <div 
            v-for="event in popularEvents" 
            :key="'pop-' + event.id" 
            class="event-card home-card-style"
            @click="handleLihatDetail(event)"
          >
            <!-- Card Thumbnail Area -->
            <div class="card-thumbnail-wrapper">
              <img :src="event.image" :alt="event.title" class="event-thumbnail" />
              <div class="status-badge" :class="(event.status || 'Upcoming').toLowerCase()">
                <span class="status-dot"></span>
                <span>{{ event.status === 'Draft' ? 'Draf' : (event.status || 'Upcoming') }}</span>
              </div>
            </div>

            <!-- Card Info Area -->
            <div class="card-info">
              <div class="event-title-wrapper">
                <div v-if="event.title && event.title.length > 22" class="event-title-marquee">
                  <h3 class="event-card-title">{{ event.title }}</h3>
                  <h3 class="event-card-title" aria-hidden="true">{{ event.title }}</h3>
                </div>
                <h3 v-else class="event-card-title static">{{ event.title }}</h3>
              </div>

              <!-- Combined Meta Row (Date & Location side-by-side without icon, grey color) -->
              <div class="meta-combined-row">
                <span class="meta-inline-text">{{ event.date || 'Sat, 24 Aug 2024' }} | {{ event.location || 'Bandung' }}</span>
              </div>

              <!-- Price Row above creator (Aligned Right) -->
              <div class="card-price-top-row">
                <span class="event-card-price">{{ event.price }}</span>
              </div>

              <!-- Divider line between Price and Creator -->
              <div class="card-middle-divider"></div>

              <!-- Creator Profile Row below Divider -->
              <div class="creator-profile-row">
                <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                <div class="creator-text-wrap">
                  <span class="creator-by-label">Diselenggarakan oleh:</span>
                  <div class="creator-name-with-badge">
                    <span class="creator-name">{{ event.organizer }}</span>
                    <span class="verified-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 2: REKOMENDASI UNTUKMU -->
      <section v-if="recommendedEvents.length > 0" class="home-section-group">
        <div class="top-events-header">
          <div class="title-with-blue-icon">
            <div class="lottie-box-wrapper">
              <lottie-player 
                src="/media/star.json" 
                background="transparent" 
                speed="1" 
                class="section-title-lottie star-lottie" 
                loop 
                autoplay
              ></lottie-player>
            </div>
            <h2 class="top-events-title">Rekomendasi Untukmu</h2>
          </div>
          <button class="see-all-icon-btn" @click="selectedCategory = 'Semua'" title="Lihat Semua">
            <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.2" class="arrow-right-icon">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="events-horizontal-row">
          <div 
            v-for="event in recommendedEvents" 
            :key="'rec-' + event.id" 
            class="event-card home-card-style"
            @click="handleLihatDetail(event)"
          >
            <!-- Card Thumbnail Area -->
            <div class="card-thumbnail-wrapper">
              <img :src="event.image" :alt="event.title" class="event-thumbnail" />
              <div class="status-badge" :class="(event.status || 'Upcoming').toLowerCase()">
                <span class="status-dot"></span>
                <span>{{ event.status === 'Draft' ? 'Draf' : (event.status || 'Upcoming') }}</span>
              </div>
            </div>

            <!-- Card Info Area -->
            <div class="card-info">
              <div class="event-title-wrapper">
                <div v-if="event.title && event.title.length > 22" class="event-title-marquee">
                  <h3 class="event-card-title">{{ event.title }}</h3>
                  <h3 class="event-card-title" aria-hidden="true">{{ event.title }}</h3>
                </div>
                <h3 v-else class="event-card-title static">{{ event.title }}</h3>
              </div>

              <!-- Combined Meta Row (Date & Location side-by-side without icon, grey color) -->
              <div class="meta-combined-row">
                <span class="meta-inline-text">{{ event.date || 'Sat, 24 Aug 2024' }} | {{ event.location || 'Bandung' }}</span>
              </div>

              <!-- Price Row above creator (Aligned Right) -->
              <div class="card-price-top-row">
                <span class="event-card-price">{{ event.price }}</span>
              </div>

              <!-- Divider line between Price and Creator -->
              <div class="card-middle-divider"></div>

              <!-- Creator Profile Row below Divider -->
              <div class="creator-profile-row">
                <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                <div class="creator-text-wrap">
                  <span class="creator-by-label">Diselenggarakan oleh:</span>
                  <div class="creator-name-with-badge">
                    <span class="creator-name">{{ event.organizer }}</span>
                    <span class="verified-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: EVENT PILIHAN TERFAVORIT -->
      <section v-if="allEventsList.length > 0" class="home-section-group">
        <div class="top-events-header">
          <div class="title-with-blue-icon">
            <lottie-player 
              src="/media/Ticket.json" 
              background="transparent" 
              speed="1" 
              class="section-title-lottie" 
              loop 
              autoplay
            ></lottie-player>
            <h2 class="top-events-title">Event Pilihan Terfavorit</h2>
          </div>
          <button class="see-all-icon-btn" @click="selectedCategory = 'Semua'" title="Lihat Semua">
            <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.2" class="arrow-right-icon">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="events-horizontal-row">
          <div 
            v-for="event in allEventsList" 
            :key="'all-' + event.id" 
            class="event-card home-card-style"
            @click="handleLihatDetail(event)"
          >
            <!-- Card Thumbnail Area -->
            <div class="card-thumbnail-wrapper">
              <img :src="event.image" :alt="event.title" class="event-thumbnail" />
              <div class="status-badge" :class="(event.status || 'Upcoming').toLowerCase()">
                <span class="status-dot"></span>
                <span>{{ event.status === 'Draft' ? 'Draf' : (event.status || 'Upcoming') }}</span>
              </div>
            </div>

            <!-- Card Info Area -->
            <div class="card-info">
              <div class="event-title-wrapper">
                <div v-if="event.title && event.title.length > 22" class="event-title-marquee">
                  <h3 class="event-card-title">{{ event.title }}</h3>
                  <h3 class="event-card-title" aria-hidden="true">{{ event.title }}</h3>
                </div>
                <h3 v-else class="event-card-title static">{{ event.title }}</h3>
              </div>

              <!-- Combined Meta Row (Date & Location side-by-side without icon, grey color) -->
              <div class="meta-combined-row">
                <span class="meta-inline-text">{{ event.date || 'Sat, 24 Aug 2024' }} | {{ event.location || 'Bandung' }}</span>
              </div>

              <!-- Price Row above creator (Aligned Right) -->
              <div class="card-price-top-row">
                <span class="event-card-price">{{ event.price }}</span>
              </div>

              <!-- Divider line between Price and Creator -->
              <div class="card-middle-divider"></div>

              <!-- Creator Profile Row below Divider -->
              <div class="creator-profile-row">
                <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                <div class="creator-text-wrap">
                  <span class="creator-by-label">Diselenggarakan oleh:</span>
                  <div class="creator-name-with-badge">
                    <span class="creator-name">{{ event.organizer }}</span>
                    <span class="verified-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- EMPTY STATE FALLBACK -->
      <div v-if="allEventsList.length === 0" class="empty-events-state">
        <div class="empty-lottie-box">
          <lottie-player 
            src="/media/sad emotion.json" 
            background="transparent" 
            speed="1" 
            style="width: 120px; height: 120px;" 
            loop 
            autoplay
          ></lottie-player>
        </div>
        <h3 class="empty-title">Tidak ada event di kategori ini</h3>
        <p class="empty-desc">Silakan pilih kategori atau filter tab lainnya.</p>
        <button class="reset-filter-btn" @click="selectedCategory = 'Semua'; currentFilter = 'semua';">Reset Filter</button>
      </div>

    </div>

  </div>
</template>

<style scoped>
.kolektix-event-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #ffffff !important;
  font-family: 'Poppins', sans-serif;
  min-height: 100%;
}

/* CATEGORIES PILLS BAR */
.category-pills-bar {
  background-color: #ffffff;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 10;
}

.pills-scroll-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  touch-action: pan-x pan-y;
  -webkit-overflow-scrolling: touch;
}

.pills-scroll-row::-webkit-scrollbar {
  display: none;
}

.cat-pill-btn {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.cat-pill-btn.active {
  background-color: #194e9e;
  color: #ffffff;
  border-color: #194e9e;
  font-weight: 600;
}

/* MAIN BODY & SECTIONS */
.event-page-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 0 110px 0;
  touch-action: pan-y;
  background-color: #ffffff !important;
}

.home-section-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  touch-action: pan-y;
}

.top-events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.title-with-blue-icon {
  display: flex;
  align-items: center;
  gap: 7px;
}

.lottie-box-wrapper {
  width: 22px;
  height: 22px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title-lottie {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
}

.section-title-lottie.star-lottie {
  width: 65px;
  height: 65px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

@media (max-width: 480px) {
  .section-title-lottie {
    width: 20px;
    height: 20px;
  }

  .lottie-box-wrapper {
    width: 20px;
    height: 20px;
  }

  .section-title-lottie.star-lottie {
    width: 58px;
    height: 58px;
  }
}

.section-title-svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #194e9e;
}

.top-events-title {
  font-size: 15px;
  font-weight: 600;
  color: #151416;
  margin: 0;
}

.see-all-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #f0f6ff;
  border: 1px solid #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.see-all-icon-btn:hover {
  background-color: #dbeafe;
}

.arrow-right-icon {
  width: 16px;
  height: 16px;
}

.see-all-text {
  font-size: 12px;
  font-weight: 600;
  color: #194e9e;
  cursor: pointer;
}

/* 1-LINE HORIZONTAL SCROLL CONTAINERS */
.events-horizontal-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 16px 12px 16px;
  scrollbar-width: none;
  touch-action: pan-x pan-y;
  -webkit-overflow-scrolling: touch;
}

.events-horizontal-row::-webkit-scrollbar {
  display: none;
}

/* EXACT HOME PAGE EVENT CARD STYLING */
.home-card-style {
  flex: 0 0 250px;
  width: 250px;
  background-color: transparent;
  border: none !important;
  border-radius: 0;
  overflow: visible;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  cursor: pointer;
  touch-action: pan-x pan-y;
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .home-card-style:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
}

.card-thumbnail-wrapper {
  position: relative;
  width: 100%;
  height: 110px;
  background-color: #f1f5f9;
  pointer-events: none;
  border-radius: 6px;
  overflow: visible;
}

.event-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  -webkit-user-drag: none;
  user-select: none;
  border-radius: 6px;
}

.status-badge {
  position: absolute;
  top: 8px;
  left: -4px;
  background-color: var(--primary-base);
  color: #ffffff;
  border-radius: 0 20px 20px 0;
  padding: 3px 10px 3px 8px;
  font-size: 8.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.20);
  letter-spacing: 0.2px;
  text-transform: none;
  z-index: 2;
}

.status-badge::before {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 0;
  border-top: 4px solid var(--primary-dark);
  border-left: 4px solid transparent;
}

.status-badge.live {
  background-color: #16a34a;
  color: #ffffff;
}

.status-badge.live::before {
  border-top-color: #14532d;
}

.status-badge.upcoming {
  background-color: var(--primary-base);
  color: #ffffff;
}

.status-badge.upcoming::before {
  border-top-color: var(--primary-dark);
}

.status-badge.draft {
  background-color: #d97706;
  color: #ffffff;
}

.status-badge.draft::before {
  border-top-color: #78350f;
}

.status-badge.ended {
  background-color: #64748b;
  color: #ffffff;
}

.status-badge.ended::before {
  border-top-color: #334155;
}

.card-info {
  padding: 10px 0 4px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  justify-content: flex-start;
}

.creator-profile-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
}

.event-title-wrapper {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.event-title-marquee {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  animation: cardTitleMarquee 12s linear infinite;
  will-change: transform;
}

.event-card-title {
  font-size: 13.5px;
  font-weight: 600; /* Slightly increased bold */
  color: #151416;
  line-height: 1.3;
  margin: 0;
  white-space: nowrap;
  flex-shrink: 0;
  padding-right: 18px;
}

.event-card-title.static {
  padding-right: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes cardTitleMarquee {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}

.creator-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 0px;
  overflow: hidden;
}

.creator-by-label {
  font-size: 9px;
  font-weight: 400; /* Non-bold */
  color: #494a4a;
  white-space: nowrap;
  line-height: 1.1;
}

.creator-name {
  font-size: 11px;
  font-weight: 500;
  color: #151416;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.meta-combined-row {
  display: flex;
  align-items: center;
  margin-top: 1px;
  margin-bottom: 4px;
  width: 100%;
  overflow: hidden;
}

.meta-inline-text {
  font-size: 11px;
  font-weight: 400;
  color: #494a4a; /* Updated grey color */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-price-top-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 2px;
  width: 100%;
}

.card-middle-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 6px 0 4px 0;
  width: 100%;
}

.card-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  width: 100%;
}

.creator-profile-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.creator-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-name-with-badge {
  display: flex;
  align-items: center;
  gap: 3px;
}

.creator-name {
  font-size: 11px;
  font-weight: 500;
  color: #151416;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2196F3;
  flex-shrink: 0;
}

.verified-check-svg {
  width: 12px;
  height: 12px;
  fill: #2196F3;
}

/* CLEAN META STYLING */

.price-row {
  margin-top: 4px;
}

.event-card-price {
  font-size: 12.5px;
  font-weight: 600; /* Slightly increased bold price */
  color: #151416;
}

/* EMPTY STATE */
.empty-events-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 12px 0 6px 0;
}

.empty-desc {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 16px;
}

.reset-filter-btn {
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

</style>
