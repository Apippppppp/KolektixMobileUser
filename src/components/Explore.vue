<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  events: {
    type: Array,
    required: true
  }
});

const searchQuery = ref('');
const activeCategory = ref('Semua');

const categories = ['Semua', 'Konser Musik', 'Pameran Art', 'Workshop', 'Festival', 'Olahraga'];

const filteredEvents = computed(() => {
  let list = props.events;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(e => e.title.toLowerCase().includes(q) || e.organizer.toLowerCase().includes(q) || (e.location && e.location.toLowerCase().includes(q)));
  }
  return list;
});
</script>

<template>
  <div class="explore-wrapper">
    <!-- Search Bar Section -->
    <div class="explore-search-card">
      <div class="explore-search-input-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" class="explore-search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari event, tempat, atau penyelenggara..." 
          class="explore-input" 
        />
      </div>

      <!-- Categories Pill Filter -->
      <div class="categories-scroll">
        <button 
          v-for="cat in categories" 
          :key="cat" 
          class="category-pill"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Explore Header Banner -->
    <div class="explore-banner">
      <div class="banner-text">
        <span class="banner-tag">Jelajahi Event Trending</span>
        <h3 class="banner-headline">Temukan Pengalaman Musik & Seni Terbaik</h3>
      </div>
    </div>

    <!-- Events Grid Section -->
    <div class="explore-events-section">
      <div class="section-title-row">
        <h3 class="section-title">Semua Event ({{ filteredEvents.length }})</h3>
      </div>

      <div class="events-grid">
        <div 
          v-for="event in filteredEvents" 
          :key="event.id"
          class="explore-card"
          @click="$emit('select-event', event)"
        >
          <div class="explore-img-wrap">
            <img :src="event.image" :alt="event.title" class="explore-img" />
            <span class="status-tag" :class="event.status.toLowerCase()">{{ event.status }}</span>
          </div>

          <div class="explore-card-body">
            <div class="event-title-wrapper">
              <div v-if="event.title && event.title.length > 18" class="event-title-marquee">
                <h4 class="explore-event-title">{{ event.title }}</h4>
                <h4 class="explore-event-title" aria-hidden="true">{{ event.title }}</h4>
              </div>
              <h4 v-else class="explore-event-title static">{{ event.title }}</h4>
            </div>
            <span class="explore-organizer">{{ event.organizer }}</span>
            <div class="explore-meta-row">
              <span class="meta-item">📍 {{ event.location || 'Jakarta' }}</span>
              <span class="meta-item">📅 {{ event.date || 'TBA' }}</span>
            </div>
            <div class="explore-price-row">
              <span class="price-val">{{ event.price }}</span>
              <button class="buy-btn">Beli Tiket</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explore-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 16px 32px 16px;
  background-color: #f8fafc;
  min-height: 100%;
}

.explore-search-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.explore-search-input-wrap {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 50px;
  padding: 0 14px;
  height: 42px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.explore-search-icon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.explore-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12px;
  color: #0f172a;
  width: 100%;
}

.categories-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

.category-pill {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.category-pill.active {
  background-color: #194e9e;
  border-color: #194e9e;
  color: #ffffff;
}

.explore-banner {
  background: linear-gradient(135deg, #103672 0%, #194e9e 100%);
  border-radius: 16px;
  padding: 18px;
  color: #ffffff;
}

.banner-tag {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 50px;
  font-weight: 600;
}

.banner-headline {
  font-size: 15px;
  font-weight: 700;
  margin: 6px 0 0 0;
  line-height: 1.3;
}

.explore-events-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.explore-card {
  background-color: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.explore-img-wrap {
  position: relative;
  width: 100%;
  height: 105px;
}

.explore-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #ffffff;
  color: #0f172a;
}

.status-tag.live {
  background-color: #dcfce7;
  color: #15803d;
}

.explore-card-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.event-title-wrapper {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}

.event-title-marquee {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  animation: cardTitleMarquee 12s linear infinite;
  will-change: transform;
}

.explore-event-title {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  flex-shrink: 0;
  padding-right: 18px;
}

.explore-event-title.static {
  padding-right: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes cardTitleMarquee {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

.explore-organizer {
  font-size: 10px;
  color: #64748b;
}

.explore-meta-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 9px;
  color: #94a3b8;
  margin-top: 2px;
}

.explore-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.price-val {
  font-size: 12px;
  font-weight: 700;
  color: #194e9e;
}

.buy-btn {
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}
</style>
