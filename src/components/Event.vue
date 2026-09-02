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
    <!-- TOP EVENT NAV TABS -->
    <div class="event-nav-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: currentFilter === 'semua' }" 
        @click="currentFilter = 'semua'"
      >
        Semua Event
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentFilter === 'aktif' }" 
        @click="currentFilter = 'aktif'"
      >
        Event Aktif
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentFilter === 'draf' }" 
        @click="currentFilter = 'draf'"
      >
        Event Draf
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentFilter === 'lalu' }" 
        @click="currentFilter = 'lalu'"
      >
        Event Lalu
      </button>
    </div>

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
                <h3 class="event-card-title static">{{ event.title }}</h3>
              </div>

              <!-- Creator Profile & Verified Badge Row -->
              <div class="creator-profile-row">
                <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                <span class="creator-name">{{ event.organizer }}</span>
                <span class="verified-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              </div>

              <!-- Location Row -->
              <div class="meta-row" v-if="event.location">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                  <path fill-rule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.343 7.587.829.799 1.655 1.381 2.274 1.765.31.193.57.337.757.433.107.054.2.096.28.14a.515.515 0 0 0 .036.017l.006.003ZM10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                </svg>
                <div class="meta-text-wrapper">
                  <span class="meta-text static">{{ event.location }}</span>
                </div>
              </div>

              <!-- Date Row -->
              <div class="meta-row" v-if="event.date">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                  <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                </svg>
                <div class="meta-text-wrapper">
                  <span class="meta-text static">{{ event.date }}</span>
                </div>
              </div>

              <!-- Price Row -->
              <div class="price-row">
                <span class="event-card-price">{{ event.price }}</span>
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
                <h3 class="event-card-title static">{{ event.title }}</h3>
              </div>

              <!-- Creator Profile & Verified Badge Row -->
              <div class="creator-profile-row">
                <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                <span class="creator-name">{{ event.organizer }}</span>
                <span class="verified-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              </div>

              <!-- Location Row -->
              <div class="meta-row" v-if="event.location">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                  <path fill-rule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.343 7.587.829.799 1.655 1.381 2.274 1.765.31.193.57.337.757.433.107.054.2.096.28.14a.515.515 0 0 0 .036.017l.006.003ZM10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                </svg>
                <div class="meta-text-wrapper">
                  <span class="meta-text static">{{ event.location }}</span>
                </div>
              </div>

              <!-- Date Row -->
              <div class="meta-row" v-if="event.date">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                  <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                </svg>
                <div class="meta-text-wrapper">
                  <span class="meta-text static">{{ event.date }}</span>
                </div>
              </div>

              <!-- Price Row -->
              <div class="price-row">
                <span class="event-card-price">{{ event.price }}</span>
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
                <h3 class="event-card-title static">{{ event.title }}</h3>
              </div>

              <!-- Creator Profile & Verified Badge Row -->
              <div class="creator-profile-row">
                <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                <span class="creator-name">{{ event.organizer }}</span>
                <span class="verified-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              </div>

              <!-- Location Row -->
              <div class="meta-row" v-if="event.location">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                  <path fill-rule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.343 7.587.829.799 1.655 1.381 2.274 1.765.31.193.57.337.757.433.107.054.2.096.28.14a.515.515 0 0 0 .036.017l.006.003ZM10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                </svg>
                <div class="meta-text-wrapper">
                  <span class="meta-text static">{{ event.location }}</span>
                </div>
              </div>

              <!-- Date Row -->
              <div class="meta-row" v-if="event.date">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                  <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                </svg>
                <div class="meta-text-wrapper">
                  <span class="meta-text static">{{ event.date }}</span>
                </div>
              </div>

              <!-- Price Row -->
              <div class="price-row">
                <span class="event-card-price">{{ event.price }}</span>
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
  background-color: #ffffff;
  font-family: 'Poppins', sans-serif;
  min-height: 100%;
}

/* TOP EVENT NAV TABS */
.event-nav-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  padding: 0 12px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  overflow-x: auto;
  scrollbar-width: none;
}

.event-nav-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  flex: 0 0 auto;
  background: none;
  border: none;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.tab-btn.active {
  color: #194e9e;
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #194e9e;
  border-radius: 3px 3px 0 0;
}

/* CATEGORIES PILLS BAR */
.category-pills-bar {
  background-color: #ffffff;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
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
  font-weight: 700;
  color: #0f172a;
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
  gap: 12px;
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
  flex: 0 0 255px;
  width: 255px;
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
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
  height: 140px;
  background-color: #f1f5f9;
  pointer-events: none;
}

.event-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  -webkit-user-drag: none;
  user-select: none;
}

.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  color: #0f172a;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  background-color: #10b981;
}

.status-badge.live { color: #16a34a; }
.status-badge.live .status-dot {
  background-color: #16a34a;
  animation: live-dot-blink 1s infinite alternate;
}

@keyframes live-dot-blink {
  0% { opacity: 0.3; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1.1); }
}

.status-badge.upcoming { color: #ea580c; }
.status-badge.upcoming .status-dot { background-color: #ea580c; }

.status-badge.draft { color: #d97706; }
.status-badge.draft .status-dot { background-color: #d97706; }

.status-badge.ended { color: #64748b; }
.status-badge.ended .status-dot { background-color: #64748b; }

.card-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.event-title-wrapper {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.event-card-title.static {
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.creator-profile-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.creator-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-name {
  font-size: 12px;
  font-weight: 500;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verified-badge {
  display: flex;
  align-items: center;
}

.verified-check-svg {
  width: 14px;
  height: 14px;
  fill: #194e9e;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: #194e9e;
  flex-shrink: 0;
}

.meta-text-wrapper {
  overflow: hidden;
  white-space: nowrap;
}

.meta-text.static {
  font-size: 12px;
  color: #000000;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-row {
  margin-top: 4px;
}

.event-card-price {
  font-size: 15px;
  font-weight: 700;
  color: #000000;
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
