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
  let list = (props.events || []).filter(e => e.status !== 'Draft');
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
        <svg viewBox="0 0 24 24" fill="none" stroke="#494a4a" stroke-width="2" class="explore-search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
              <div v-if="event.title && event.title.length > 22" class="event-title-marquee">
                <h4 class="explore-event-title">{{ event.title }}</h4>
                <h4 class="explore-event-title" aria-hidden="true">{{ event.title }}</h4>
              </div>
              <h4 v-else class="explore-event-title static">{{ event.title }}</h4>
            </div>

            <!-- Combined Meta Row (Marquee Loop ONLY for VERY Long Meta > 34 chars) -->
            <div v-if="((event.date || '') + (event.location || '')).length > 34" class="meta-combined-row meta-marquee-loop">
              <div class="meta-marquee-track">
                <span class="meta-inline-text">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-inline-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ event.date || '24 Agu 2026' }}
                </span>
                <span class="meta-dot-separator">•</span>
                <span class="meta-inline-text">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-inline-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ event.location || 'Bandung' }}
                </span>
                <span class="meta-dot-separator">•</span>
              </div>
              <div class="meta-marquee-track" aria-hidden="true">
                <span class="meta-inline-text">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-inline-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ event.date || '24 Agu 2026' }}
                </span>
                <span class="meta-dot-separator">•</span>
                <span class="meta-inline-text">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-inline-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ event.location || 'Bandung' }}
                </span>
                <span class="meta-dot-separator">•</span>
              </div>
            </div>
            <div v-else class="meta-combined-row">
              <span class="meta-inline-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-inline-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ event.date || '24 Agu 2026' }}
              </span>
              <span class="meta-dot-separator">•</span>
              <span class="meta-inline-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-inline-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ event.location || 'Bandung' }}
              </span>
            </div>

            <!-- Price Row above creator (Strikethrough Red Line + Bold Red Price like uploaded image) -->
            <div class="card-price-top-row">
              <div v-if="event.originalPrice" class="discount-price-column">
                <span class="event-card-original-price">{{ event.originalPrice }}</span>
                <span class="event-card-price price-discount">{{ event.price || 'Gratis' }}</span>
              </div>
              <span v-else class="event-card-price">{{ event.price || 'Gratis' }}</span>
            </div>

            <!-- Divider line between Price and Creator -->
            <div class="card-middle-divider"></div>
            
            <!-- Creator Profile Row below Divider -->
            <div class="creator-profile-row">
              <img :src="event.creatorLogo || '/media/promodesign.png'" alt="Creator Profile" class="creator-avatar" />
              <div class="creator-text-wrap">
                <span class="creator-by-label">Diselenggarakan Oleh:</span>
                <div class="creator-name-with-badge">
                  <span class="creator-name">{{ event.organizer }}</span>
                  <span class="verified-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </span>
                </div>
              </div>
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
  color: #494a4a;
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
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 10px;
}

.explore-card {
  background-color: transparent;
  border-radius: 0;
  overflow: visible;
  border: none !important;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.explore-img-wrap {
  position: relative;
  width: 100%;
  height: 105px;
  border-radius: 6px;
  overflow: hidden;
}

.explore-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
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
  padding: 8px 0 4px 0;
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
  font-size: 11.5px;
  font-weight: 600; /* Slightly increased bold */
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

.creator-by-label {
  font-size: 7px !important;
  font-weight: 400 !important;
  color: #494a4a !important;
  white-space: nowrap;
  line-height: 1.2;
  text-transform: none !important;
  letter-spacing: 0.1px;
}

.meta-combined-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  margin-bottom: 4px;
  width: 100%;
  overflow: hidden;
}

.meta-inline-text {
  font-size: 9.5px;
  font-weight: 500;
  color: #494a4a;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-inline-icon {
  width: 11px;
  height: 11px;
  color: #194e9e;
  flex-shrink: 0;
}

.meta-dot-separator {
  color: #cbd5e1;
  font-size: 9px;
}

.card-price-top-row {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: 2px;
  width: 100%;
}

.discount-price-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.event-card-original-price {
  font-size: 9px;
  color: #494a4a;
  text-decoration: line-through;
  text-decoration-color: #ef4444;
  font-weight: 500;
  line-height: 1.1;
  white-space: nowrap;
}

.event-card-price {
  font-size: 11px;
  font-weight: 600;
  color: #151416;
  line-height: 1.1;
}

.event-card-price.price-discount {
  color: #e52424 !important;
  font-weight: 600;
}

.card-middle-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 5px 0 4px 0;
  width: 100%;
}

.creator-profile-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.creator-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.creator-by-label {
  font-size: 6px !important;
  font-weight: 400;
  color: #494a4a;
  white-space: nowrap;
  line-height: 1.2;
}

.creator-name-with-badge {
  display: flex;
  align-items: center;
  gap: 4px;
}

.creator-name {
  font-size: 11.5px;
  font-weight: 600;
  color: #0f172a;
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
  width: 11px;
  height: 11px;
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
