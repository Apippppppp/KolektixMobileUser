<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  merchList: { type: Array, default: () => [] },
  cartCount: { type: Number, default: 0 },
  searchQuery: { type: String, default: '' }
});

const emit = defineEmits(['back', 'select-merch', 'open-cart', 'update:searchQuery']);
const selectedCategory = ref('Semua');
const isScrolled = ref(false);

const categories = computed(() => {
  const cats = new Set(['Semua']);
  (props.merchList || []).forEach(m => {
    if (m.category) cats.add(m.category);
  });
  return [...cats];
});

const filteredMerch = computed(() => {
  let list = props.merchList || [];
  if (selectedCategory.value !== 'Semua') {
    list = list.filter(m => (m.category || '').toLowerCase().includes(selectedCategory.value.toLowerCase()));
  }
  const q = (props.searchQuery || '').trim().toLowerCase();
  if (q) {
    list = list.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.organizer || '').toLowerCase().includes(q) ||
      (m.category || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const handleScroll = (e) => {
  isScrolled.value = e.target.scrollTop > 10;
};

const handleBack = () => emit('back');
const handleSelect = (merch) => emit('select-merch', merch);

onMounted(() => {
  if (!document.getElementById('lottie-player-script')) {
    const script = document.createElement('script');
    script.id = 'lottie-player-script';
    script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
    document.head.appendChild(script);
  }
});
</script>

<template>
  <div class="all-merch-page">
    <!--  -->

    <div class="all-merch-scroll" @scroll="handleScroll">

      <div v-if="categories.length > 2" class="category-pills-bar">
        <div class="pills-scroll-row">
          <button v-for="cat in categories" :key="cat" class="cat-pill-btn" :class="{ active: selectedCategory === cat }" @click="selectedCategory = cat">
            {{ cat }}
          </button>
        </div>
      </div>

      <div v-if="filteredMerch.length > 0" class="merch-grid">
        <div v-for="merch in filteredMerch" :key="merch.id" class="event-card merch-card-grid" @click="handleSelect(merch)">
          <div class="card-thumbnail-wrapper">
            <img :src="merch.image" :alt="merch.title" class="merch-thumbnail" loading="lazy" />
            <div v-if="merch.badge" class="status-badge upcoming">
             
              <span>{{ merch.badge }}</span>
            </div>
          </div>
          <div class="card-info">
            <div class="event-title-wrapper">
              <h3 class="event-card-title static">{{ merch.title }}</h3>
            </div>
            <div class="merch-review-row">
              <svg viewBox="0 0 24 24" fill="#F59E0B" class="review-star-icon"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span class="review-text">{{ merch.rating || '4.9' }} ({{ merch.reviewCount || '120' }} ulasan)</span>
            </div>
            <div class="card-price-top-row">
              <span class="event-card-price">{{ merch.price }}</span>
            </div>
            <div class="card-middle-divider"></div>
            <div class="creator-profile-row">
              <img :src="merch.creatorLogo" alt="Creator" class="creator-avatar" loading="lazy" />
              <div class="creator-text-wrap">
                <span class="creator-by-label">Disediakan Oleh:</span>
                <div class="creator-name-with-badge">
                  <span class="creator-name">{{ merch.organizer }}</span>
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

      <div v-else class="empty-merch-state">
        <lottie-player src="/media/sad emotion.json" background="transparent" speed="1" style="width: 120px; height: 120px;" loop autoplay></lottie-player>
        <h3 class="empty-title">Merch tidak ditemukan</h3>
        <p class="empty-desc">Coba kata kunci atau kategori lain.</p>
        <button class="reset-filter-btn" @click="emit('update:searchQuery', ''); selectedCategory = 'Semua';">Reset Filter</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.all-merch-page { display: flex; flex-direction: column; width: 100%; max-width: 100%; background: #fcfcfd; font-family: 'Poppins', sans-serif; overflow-x: hidden; box-sizing: border-box; }
.all-merch-scroll { flex: 1; width: 100%; max-width: 100%; overflow: visible; box-sizing: border-box; padding-bottom: 110px; }
.category-pills-bar { background: #fff; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; z-index: 10; width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden; }
.pills-scroll-row { display: flex; gap: 8px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; max-width: 100%; }
.pills-scroll-row::-webkit-scrollbar { display: none; }
.cat-pill-btn { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 24px; padding: 7px 14px; font-size: 12px; font-weight: 500; white-space: nowrap; cursor: pointer; }
.cat-pill-btn.active { background: #194e9e; color: #fff; border-color: #194e9e; font-weight: 600; }
.merch-grid { display: flex; flex-direction: column; gap: 14px; padding: 12px 16px; width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: hidden; }
.event-card { background: transparent; border: none; display: flex; flex-direction: column; cursor: pointer; min-width: 0; width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden; }
.merch-card-grid .card-thumbnail-wrapper { position: relative; width: 100%; max-width: 100%; height: 220px; background: #f1f5f9; border-radius: 8px; overflow: hidden; box-sizing: border-box; }
.merch-thumbnail { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
.status-badge { position: absolute; top: 8px; left: -4px; background: #194e9e; color: #fff; border-radius: 0 20px 20px 0; padding: 3px 10px 3px 8px; font-size: 8.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); z-index: 2; }
.status-badge::before { content: ''; position: absolute; bottom: -4px; left: 0; border-top: 4px solid #123a75; border-left: 4px solid transparent; }
.status-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; }
.card-info { padding: 8px 0 4px 0; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.event-title-wrapper { width: 100%; overflow: hidden; }
.event-card-title.static { font-size: 12.5px; font-weight: 600; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
.merch-review-row { display: flex; align-items: center; gap: 5px; overflow: hidden; }
.review-star-icon { width: 13px; height: 13px; flex-shrink: 0; }
.review-text { font-size: 11px; font-weight: 500; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-price-top-row { display: flex; justify-content: flex-end; width: 100%; }
.event-card-price { font-size: 13px; font-weight: 700; color: #000; }
.card-middle-divider { height: 1px; background: #f1f5f9; margin: 4px 0; width: 100%; }
.creator-profile-row { display: flex; align-items: center; gap: 6px; }
.creator-avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; border: 1px solid #dbeafe; flex-shrink: 0; }
.creator-text-wrap { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.creator-by-label { font-size: 9px; color: #64748b; line-height: 1.2; }
.creator-name-with-badge { display: flex; align-items: center; gap: 3px; min-width: 0; }
.creator-name { font-size: 11px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.verified-badge { color: #2196F3; display: inline-flex; flex-shrink: 0; }
.verified-check-svg { width: 12px; height: 12px; }
.empty-merch-state { display: flex; flex-direction: column; align-items: center; padding: 48px 24px; text-align: center; gap: 8px; }
.empty-title { font-size: 15px; font-weight: 600; color: #0f172a; margin: 8px 0 0 0; }
.empty-desc { font-size: 12px; color: #64748b; margin: 0; }
.reset-filter-btn { margin-top: 12px; background: #194e9e; color: #fff; border: none; border-radius: 20px; padding: 9px 20px; font-size: 12px; font-weight: 600; cursor: pointer; }
@media (min-width: 480px) { .merch-card-grid .card-thumbnail-wrapper { height: 240px; } }
</style>
