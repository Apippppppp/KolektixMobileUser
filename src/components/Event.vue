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

const emit = defineEmits(['switch-tab']);

const currentFilter = ref(props.initialFilter); // 'semua' | 'aktif' | 'draf' | 'lalu'

// Keep currentFilter in sync when parent updates the prop (e.g. after create event)
watch(() => props.initialFilter, (val) => {
  currentFilter.value = val;
});

const filteredEvents = computed(() => {
  if (currentFilter.value === 'semua') {
    return props.events;
  } else if (currentFilter.value === 'aktif') {
    return props.events.filter(e => e.status === 'Live' || e.status === 'Upcoming');
  } else if (currentFilter.value === 'draf') {
    return props.events.filter(e => e.status === 'Draft');
  } else if (currentFilter.value === 'lalu') {
    return props.events.filter(e => e.status === 'Ended');
  }
  return props.events;
});

const handleLihatDetail = (event) => {
  alert(`Detail Event: ${event.title}`);
};

const handleEdit = (event) => {
  alert(`Edit Event: ${event.title}`);
};

const handlePenjualan = (event) => {
  alert(`Laporan Penjualan Event: ${event.title}`);
};

const handleCreateEvent = () => {
  alert('Fitur Buat Event Baru sedang dalam pengembangan');
};
</script>

<template>
  <div class="event-list-page">
    <!-- Filter Tabs (Styled as Checkin Tabs) -->
    <div class="event-filters-container">
      <button 
        class="filter-btn" 
        :class="{ active: currentFilter === 'semua' }" 
        @click="currentFilter = 'semua'"
      >
        Semua Event
      </button>
      <button 
        class="filter-btn" 
        :class="{ active: currentFilter === 'aktif' }" 
        @click="currentFilter = 'aktif'"
      >
        Event Aktif
      </button>
      <button 
        class="filter-btn" 
        :class="{ active: currentFilter === 'draf' }" 
        @click="currentFilter = 'draf'"
      >
        Event Draf
      </button>
      <button 
        class="filter-btn" 
        :class="{ active: currentFilter === 'lalu' }" 
        @click="currentFilter = 'lalu'"
      >
        Event Lalu
      </button>
    </div>

    <!-- ======= EVENT LIST ======= -->
    <div class="event-tab-content">
      <div class="events-container-alt">
        <section class="cards-list-section" v-if="filteredEvents.length > 0">
          <div v-for="event in filteredEvents" :key="event.id" class="event-card">
            <!-- Thumbnail wrapper -->
            <div class="card-thumbnail-wrapper">
              <img :src="event.image" :alt="event.title" class="event-thumbnail" />
              <div class="status-badge" :class="event.status.toLowerCase()">
                <span class="status-dot"></span>
                <span>{{ event.status === 'Draft' ? 'Draf' : event.status }}</span>
              </div>
              <!-- Floating Edit Icon Button -->
              <button class="floating-edit-btn" @click.stop="handleEdit(event)" title="Edit Event">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="edit-icon-svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>

            <!-- Card Info -->
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
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Full-width primary action button -->
              <div class="card-action-wrapper">
                <button class="card-btn btn-primary" @click="handleLihatDetail(event)">
                  Lihat Detail
                </button>
              </div>

            </div>
          </div>
        </section>

        <!-- Empty state fallback if no events match the active sub-tab -->
        <div v-else class="event-empty-state">
          <div class="empty-state-blue-line"></div>
          <lottie-player 
            src="/media/sad emotion.json" 
            background="transparent" 
            speed="1" 
            style="width: 120px; height: 120px;" 
            loop 
            autoplay
          ></lottie-player>
          <p class="empty-text">Belum ada event di kategori ini</p>
        </div>
      </div>
    </div>

    <!-- Floating "Buat Event" Action Button -->
    <button class="floating-create-btn" @click="emit('switch-tab', 'create-event')" title="Buat Event">
      <lottie-player
        src="/media/addanimation.json"
        background="transparent"
        speed="1"
        style="width: 56px; height: 56px;"
        loop
        autoplay
      ></lottie-player>
    </button>
  </div>
</template>

<style scoped>
.event-list-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f8fafc;
}

/* Filter Tabs Container */
.event-filters-container {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none; /* Hide scrollbar Firefox */
  -ms-overflow-style: none; /* Hide scrollbar IE/Edge */
}
.event-filters-container::-webkit-scrollbar {
  display: none; /* Hide scrollbar Chrome/Safari */
}

/* Filter Tab Buttons */
.filter-btn {
  flex: 0 0 auto; /* prevent shrink */
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  position: relative;
  text-align: center;
  transition: color 0.2s;
  font-family: var(--font-sans);
  white-space: nowrap; /* prevent wrapping */
}
.filter-btn.active {
  color: #194E9E;
  font-weight: 400; /* Active tab button text should NOT be bold */
}
.filter-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
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
.status-badge.live { color: #16a34a; background-color: #f0fdf4; }
.status-badge.live .status-dot { background-color: #16a34a; }
.status-badge.upcoming { color: #ca8a04; background-color: #fefce8; }
.status-badge.upcoming .status-dot { background-color: #ca8a04; }
.status-badge.ended { color: #64748b; background-color: #f8fafc; }
.status-badge.ended .status-dot { background-color: #64748b; }
/* Draft badge — simple and clean */
.status-badge.draft {
  color: #475569;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none;
}
.status-badge.draft .status-dot { background-color: #94a3b8; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }

.card-info { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.event-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
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

.card-footer-row { border-top: 1px solid #f1f5f9; padding-top: 12px; display: flex; align-items: center; }
.ticket-sales-info { flex-grow: 1; display: flex; flex-direction: column; gap: 6px; }
.sales-text-row { display: flex; justify-content: space-between; align-items: center; }
.sales-text { font-size: 12px; color: #0f172a; font-weight: 500; }
.sales-percent { font-size: 12px; font-weight: 700; color: #0f172a; }
.sales-progress-bar { width: 100%; height: 6px; background-color: #f1f5f9; border-radius: 4px; overflow: hidden; }
.sales-progress-fill { height: 100%; background-color: #194E9E; border-radius: 4px; transition: width 0.5s ease; }

/* Card Action Wrapper */
.card-action-wrapper {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #e2e8f0;
}
.card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 38px;
  box-sizing: border-box;
  text-align: center;
  width: 100%;
}
.btn-primary {
  background-color: var(--primary-base, #194E9E);
  color: white;
  border: none;
}
.btn-primary:hover, .btn-primary:active {
  background-color: #154388;
}

/* Floating Edit Button */
.floating-edit-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  color: #194E9E;
  transition: all 0.2s ease;
  z-index: 5;
}
.floating-edit-btn:hover {
  transform: scale(1.05);
  background-color: #f1f5f9;
}
.edit-icon-svg {
  width: 14px;
  height: 14px;
}

/* Empty State Styling */
.event-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px 80px;
  text-align: center;
  color: #94a3b8;
  gap: 0;
}
.empty-state-blue-line {
  width: 80px;
  height: 4px;
  background-color: #194E9E;
  border-radius: 2px;
  margin-bottom: -2px;
}
.empty-icon-svg {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
}
.empty-text {
  font-size: 13px;
  font-weight: 500;
  margin-top: 16px;
}

/* Floating Create Event Button */
.floating-create-btn {
  position: fixed;
  bottom: 84px;
  right: 16px;
  z-index: 99;
  background-color: #194E9E;
  border: 3px solid #194E9E;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 16px rgba(25, 78, 158, 0.4);
}
.floating-create-btn:hover {
  transform: scale(1.05);
}

@media (min-width: 480px) {
  .floating-create-btn {
    right: calc(50% - 185px);
  }
}
</style>
