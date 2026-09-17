<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  merch: { type: Object, default: () => ({}) },
  merchList: { type: Array, default: () => [] },
  cartCount: { type: Number, default: 0 }
});

const emit = defineEmits(['back', 'add-to-cart', 'chat-creator', 'select-merch', 'open-cart', 'buy-now']);
const isScrolled = ref(false);
const bannerIndex = ref(0);
const bannerRef = ref(null);
const titleRef = ref(null);
const titlePassed = ref(false);
const selectedVariant = ref(null);
const isReviewAllOpen = ref(false);
const selectedRating = ref(0);
const previewImage = ref(null);
const showToast = ref(false);
let toastTimer = null;
const isVariantSheetOpen = ref(false);
const sheetVariant = ref(null);
const sheetQty = ref(1);
const sheetRef = ref(null);
const sheetDragY = ref(0);
let dragStartY = 0;
let draggingSheet = false;

const merchImages = computed(() => {
  const m = props.merch || {};
  const list = m.images || m.photos || m.gallery;
  if (Array.isArray(list) && list.length > 0) {
    return list.map(img => typeof img === 'string' ? img : (img.image_url || img.url || img.src || m.image)).filter(Boolean);
  }
  if (m.image) {
    const others = (props.merchList || []).filter(x => x.id !== m.id).map(x => x.image).filter(Boolean).slice(0, 2);
    const fallbacks = [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
    ];
    const out = [m.image, ...others];
    let i = 0;
    while (out.length < 3 && i < fallbacks.length) {
      if (!out.includes(fallbacks[i])) out.push(fallbacks[i]);
      i++;
    }
    return out;
  }
  return [];
});

const variants = computed(() => {
  const m = props.merch || {};
  if (Array.isArray(m.variants) && m.variants.length > 0) return m.variants.map(v => typeof v === 'string' ? v : (v.name ?? v.size ?? v.label ?? String(v)));
  if (Array.isArray(m.sizes) && m.sizes.length > 0) return m.sizes;
  return ['S', 'M', 'L', 'XL'];
});

// ponytail: stok fallback statis (L=0 untuk demo habis); ganti ke m.variantStock dari API saat tersedia
const variantOptions = computed(() => {
  const m = props.merch || {};
  const stockMap = m.variantStock || m.variant_stock || null;
  const fallback = { S: 12, M: 8, L: 0, XL: 5 };
  return variants.value.map(name => {
    let stock = fallback[name] ?? 10;
    if (stockMap && stockMap[name] != null) stock = Number(stockMap[name]);
    return { name, stock };
  });
});

const sheetStock = computed(() => variantOptions.value.find(o => o.name === sheetVariant.value)?.stock ?? 0);

const allReviews = computed(() => {
  const m = props.merch || {};
  if (Array.isArray(m.reviews) && m.reviews.length > 0) return m.reviews;
  return [
    { id: 1, name: 'Rian Pratama', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80', rating: 5, date: '12 Agu 2026', text: 'Bahannya adem dan sablonannya rapi banget, sesuai ekspektasi.', images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80'] },
    { id: 2, name: 'Nadia Putri', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80', rating: 5, date: '8 Agu 2026', text: 'Size chart akurat, pengiriman cepat dan packing aman.', images: [] },
    { id: 3, name: 'Budi Santoso', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80', rating: 4, date: '2 Agu 2026', text: 'Bagus, cuma pengiriman agak lama ke daerah saya.', images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80'] },
    { id: 4, name: 'Sinta Dewi', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80', rating: 5, date: '28 Jul 2026', text: 'Sudah beli 2x, selalu original dan kualitas terjaga.', images: [] },
    { id: 5, name: 'Andi Wijaya', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80', rating: 3, date: '20 Jul 2026', text: 'Warnanya sedikit beda dari foto, tapi masih oke.', images: [] },
    { id: 6, name: 'Putri Ayu', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80', rating: 4, date: '15 Jul 2026', text: 'Packing rapi, ada foto produknya pas dipakai.', images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=200&q=80'] }
  ];
});

const visibleReviews = computed(() => allReviews.value.slice(0, 2));
const filteredReviews = computed(() => selectedRating.value === 0 ? allReviews.value : allReviews.value.filter(r => (r.rating || 5) === selectedRating.value));
const openReviewAll = () => { selectedRating.value = 0; isReviewAllOpen.value = true; };
const closeReviewAll = () => { isReviewAllOpen.value = false; };
const openPreview = (img) => { previewImage.value = img; };
const closePreview = () => { previewImage.value = null; };

const otherMerch = computed(() => (props.merchList || []).filter(m => m.id !== props.merch?.id).slice(0, 6));

const handleBannerScroll = (e) => {
  const el = e.target;
  const w = el.clientWidth || 1;
  bannerIndex.value = Math.round(el.scrollLeft / w);
};

const handleDetailScroll = (e) => {
  const st = e.target.scrollTop || 0;
  isScrolled.value = st > 80;
  const titleEl = titleRef.value;
  if (titleEl) titlePassed.value = (titleEl.offsetTop - st) < 56;
  else titlePassed.value = st > 300;
};

const goToBanner = (idx) => {
  const el = bannerRef.value;
  if (!el) return;
  el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
};

watch(() => props.merch?.id, () => {
  bannerIndex.value = 0;
  selectedVariant.value = null;
  isReviewAllOpen.value = false;
  selectedRating.value = 0;
  isVariantSheetOpen.value = false;
  isScrolled.value = false;
  titlePassed.value = false;
});

const handleBack = () => emit('back');
const handleChat = () => emit('chat-creator', props.merch);
const handleSelectOther = (m) => emit('select-merch', m);

const sheetMode = ref('buy');

const handleAddToCartBtn = () => {
  openVariantSheet('cart');
};

const showToastMsg = () => {
  showToast.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { showToast.value = false; }, 2000);
};

const openVariantSheet = (mode = 'buy') => {
  sheetMode.value = mode;
  const available = variantOptions.value.find(o => o.stock > 0);
  const currentOk = variantOptions.value.some(o => o.name === selectedVariant.value && o.stock > 0);
  sheetVariant.value = currentOk ? selectedVariant.value : (available?.name || null);
  sheetQty.value = 1;
  sheetDragY.value = 0;
  isVariantSheetOpen.value = true;
};

const closeVariantSheet = () => { isVariantSheetOpen.value = false; sheetDragY.value = 0; draggingSheet = false; };
const sheetInc = () => { if (sheetQty.value < sheetStock.value) sheetQty.value++; };
const sheetDec = () => { if (sheetQty.value > 1) sheetQty.value--; };

const startSheetDrag = (y) => { draggingSheet = true; dragStartY = y; };
const moveSheetDrag = (y) => {
  if (!draggingSheet) return;
  const dy = y - dragStartY;
  sheetDragY.value = dy > 0 ? dy : 0;
};
const endSheetDrag = () => {
  if (!draggingSheet) return;
  draggingSheet = false;
  if (sheetDragY.value > 110) closeVariantSheet();
  else sheetDragY.value = 0;
};
const onSheetTouchStart = (e) => startSheetDrag(e.touches[0].clientY);
const onSheetTouchMove = (e) => moveSheetDrag(e.touches[0].clientY);
const onSheetMouseDown = (e) => startSheetDrag(e.clientY);
const onSheetMouseMove = (e) => moveSheetDrag(e.clientY);

const confirmBuyFromSheet = () => {
  if (!sheetVariant.value && variants.value.length > 0) return;
  selectedVariant.value = sheetVariant.value;
  isVariantSheetOpen.value = false;
  if (sheetMode.value === 'cart') {
    emit('add-to-cart', { ...props.merch, variant: sheetVariant.value }, sheetQty.value, false);
    showToastMsg();
  } else {
    emit('buy-now', { merch: { ...props.merch, variant: sheetVariant.value }, qty: sheetQty.value });
  }
};
</script>

<template>
  <div class="merch-detail-page">
    <div class="detail-header" :class="{ 'scrolled-header': isScrolled }">
      <button class="back-btn" @click="handleBack" title="Kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" class="header-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>
      <div v-if="!titlePassed" class="header-title-container">
        <h1 class="header-title">Detail Merch</h1>
      </div>
      <div v-else class="header-scrolled-info">
        <h2 class="scrolled-event-title">{{ merch.title || 'Official Merchandise' }}</h2>
        <span class="scrolled-event-meta">{{ merch.organizer || 'Kolektix Official' }}</span>
      </div>
      <button class="nav-icon-btn cart-btn" title="Keranjang" @click="emit('open-cart')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="header-action-icon">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
      </button>
    </div>

    <div class="detail-scroll" @scroll="handleDetailScroll">
      <div class="detail-banner">
        <div ref="bannerRef" class="banner-scroll" @scroll="handleBannerScroll">
          <img v-for="(img, idx) in merchImages" :key="idx" :src="img" :alt="merch.title" class="banner-img" />
        </div>
        <div v-if="merchImages.length > 1" class="banner-counter">{{ bannerIndex + 1 }}/{{ merchImages.length }}</div>
        <div v-if="merchImages.length > 1" class="banner-dots">
          <span v-for="(img, idx) in merchImages" :key="idx" class="banner-dot" :class="{ active: bannerIndex === idx }" @click="goToBanner(idx)"></span>
        </div>
      </div>

      <div class="detail-body">
        <h2 ref="titleRef" class="detail-title">{{ merch.title || 'Official Merchandise' }}</h2>
        <div class="merch-review-row">
          <svg viewBox="0 0 24 24" fill="#F59E0B" class="review-star-icon"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span class="review-text">{{ merch.rating || '4.9' }} ({{ merch.reviewCount || allReviews.length }} ulasan)</span>
          <span class="meta-dot-separator">•</span>
          <span class="review-text">{{ merch.stockStr || 'Tersedia' }}</span>
        </div>
        <div class="detail-price-row">
          <span v-if="merch.originalPrice" class="detail-original-price">{{ merch.originalPrice }}</span>
          <div class="detail-price" :class="{ 'price-discount': merch.originalPrice }">{{ merch.price || 'Rp0' }}</div>
        </div>
        <div class="card-middle-divider"></div>
        <div class="creator-profile-row">
          <img :src="merch.creatorLogo" alt="Creator" class="creator-avatar" />
          <div class="creator-text-wrap">
            <span class="creator-by-label">Disediakan oleh:</span>
            <div class="creator-name-with-badge">
              <span class="creator-name">{{ merch.organizer || 'Kolektix Official' }}</span>
              <span class="verified-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </span>
            </div>
          </div>
          <button class="creator-chat-btn" @click="handleChat" title="Chat kreator">
            <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="creator-chat-icon">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>
              <path d="M8 12h.01M12 12h.01M16 12h.01" stroke-width="3"/>
            </svg>
          </button>
        </div>
        <div class="card-middle-divider"></div>

        <h3 class="section-label">Pilih varian</h3>
        <div class="variant-row">
          <button v-for="v in variants" :key="v" class="variant-btn" :class="{ active: selectedVariant === v }" @click="selectedVariant = v">
            {{ v }}
          </button>
        </div>

        <h3 class="section-label">Deskripsi</h3>
        <p class="detail-desc">{{ merch.description || 'Merchandise official original dengan kualitas terbaik. Stok terbatas, pesan sekarang sebelum kehabisan.' }}</p>

        <div class="section-header-row">
          <h3 class="section-label no-margin">Ulasan pembeli</h3>
          <button class="see-all-text-btn" @click="openReviewAll">
            Lihat semua
          </button>
        </div>
        <div class="review-list">
          <div v-for="r in visibleReviews" :key="r.id" class="review-item">
            <img :src="r.avatar" :alt="r.name" class="review-avatar" loading="lazy" />
            <div class="review-content">
              <div class="review-top">
                <span class="review-name">{{ r.name }}</span>
                <span class="review-date">{{ r.date }}</span>
              </div>
              <div class="review-stars">
                <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" :fill="n <= (r.rating || 5) ? '#F59E0B' : '#E2E8F0'" class="review-star-icon small"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <p class="review-body">{{ r.text }}</p>
              <div v-if="r.images && r.images.length > 0" class="review-images">
                <img v-for="(img, idx) in r.images" :key="idx" :src="img" alt="Foto ulasan" class="review-img" loading="lazy" @click="openPreview(img)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="otherMerch.length > 0" class="other-merch-section">
        <h3 class="section-label other-title">Merch lainnya</h3>
        <div class="other-merch-scroll">
          <div v-for="m in otherMerch" :key="m.id" class="other-merch-card" @click="handleSelectOther(m)">
            <div class="other-thumb-wrap">
              <img :src="m.image" :alt="m.title" class="other-thumb" loading="lazy" />
            </div>
            <h4 class="other-name">{{ m.title }}</h4>
            <div class="merch-review-row">
              <svg viewBox="0 0 24 24" fill="#F59E0B" class="review-star-icon small"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span class="review-text">{{ m.rating || '4.9' }} ({{ m.reviewCount || '120' }})</span>
            </div>
            <span class="other-price">{{ m.price }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-footer">
      <button class="cart-outline-btn single-line" @click="handleAddToCartBtn"><span>Keranjang</span></button>
      <button class="buy-btn single-line" @click="openVariantSheet('buy')"><span>Beli Sekarang</span></button>
    </div>

    <transition name="toast-fade">
      <div v-if="showToast" class="cart-toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="toast-check">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Berhasil masuk keranjang</span>
      </div>
    </transition>

    <transition name="sheet-slide">
      <div v-if="isReviewAllOpen" class="review-all-page">
        <div class="review-all-header">
          <button class="back-btn" @click="closeReviewAll" title="Kembali">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" class="header-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 class="header-title">Semua Ulasan ({{ allReviews.length }})</h1>
          <div class="header-spacer"></div>
        </div>
        <div class="review-filter-bar">
          <div class="pills-scroll-row">
            <button class="cat-pill-btn" :class="{ active: selectedRating === 0 }" @click="selectedRating = 0">Semua</button>
            <button v-for="s in [5,4,3,2,1]" :key="s" class="cat-pill-btn" :class="{ active: selectedRating === s }" @click="selectedRating = s"><span class="filter-star">★</span> {{ s }}</button>
          </div>
        </div>
        <div class="review-all-scroll">
          <div v-if="filteredReviews.length > 0" class="review-list">
            <div v-for="r in filteredReviews" :key="r.id" class="review-item">
              <img :src="r.avatar" :alt="r.name" class="review-avatar" loading="lazy" />
              <div class="review-content">
                <div class="review-top">
                  <span class="review-name">{{ r.name }}</span>
                  <span class="review-date">{{ r.date }}</span>
                </div>
                <div class="review-stars">
                  <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" :fill="n <= (r.rating || 5) ? '#F59E0B' : '#E2E8F0'" class="review-star-icon small"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <p class="review-body">{{ r.text }}</p>
                <div v-if="r.images && r.images.length > 0" class="review-images">
                  <img v-for="(img, idx) in r.images" :key="idx" :src="img" alt="Foto ulasan" class="review-img" loading="lazy" @click="openPreview(img)" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-merch-state">
            <h3 class="empty-title">Belum ada ulasan bintang {{ selectedRating }}</h3>
            <p class="empty-desc">Coba filter bintang lain.</p>
          </div>
        </div>
      </div>
    </transition>

    <transition name="sheet-fade">
      <div v-if="previewImage" class="img-preview-overlay" @click="closePreview">
        <button class="img-preview-close" @click="closePreview" title="Tutup">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" class="sheet-close-icon">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <img :src="previewImage" alt="Detail foto ulasan" class="img-preview-full" @click.stop />
      </div>
    </transition>

    <transition name="sheet-fade">
      <div v-if="isVariantSheetOpen" class="sheet-overlay" @click="closeVariantSheet" @touchmove.prevent @wheel.prevent></div>
    </transition>
    <transition name="sheet-slide">
      <div v-if="isVariantSheetOpen" ref="sheetRef" class="variant-sheet" :style="sheetDragY > 0 ? { transform: `translateY(${sheetDragY}px)` } : {}">
        <div class="sheet-drag-zone" @touchstart="onSheetTouchStart" @touchmove="onSheetTouchMove" @touchend="endSheetDrag" @mousedown="onSheetMouseDown" @mousemove="onSheetMouseMove" @mouseup="endSheetDrag" @mouseleave="endSheetDrag">
          <span class="sheet-drag-handle"></span>
        </div>
        <div class="sheet-header">
          <button class="sheet-close-btn" @click="closeVariantSheet" title="Tutup">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round" class="sheet-close-icon">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h2 class="sheet-title">Pilih Varian</h2>
        </div>

        <div class="sheet-product-row">
          <img :src="merchImages[0]" :alt="merch.title" class="sheet-thumb" />
          <div class="sheet-product-info">
            <span v-if="merch.originalPrice" class="sheet-original-price">{{ merch.originalPrice }}</span>
            <div class="sheet-price" :class="{ 'price-discount': merch.originalPrice }">{{ merch.price || 'Rp0' }}</div>
            <div class="sheet-stock">{{ merch.stockStr || 'Stok tersedia' }}</div>
            <div v-if="sheetVariant" class="sheet-selected-variant">{{ sheetVariant }}</div>
          </div>
        </div>


        <div class="sheet-variant-label">Varian: <span class="sheet-variant-value">{{ sheetVariant || '-' }}</span></div>
        <div class="sheet-variant-list">
          <button v-for="o in variantOptions" :key="o.name" class="sheet-variant-btn" :class="{ active: sheetVariant === o.name, soldout: o.stock <= 0 }" :disabled="o.stock <= 0" @click="sheetVariant = o.name; sheetQty = 1">
            <span class="sheet-variant-name">{{ o.name }}</span>
          </button>
        </div>

        <div class="sheet-qty-row">
          <span class="qty-label">Jumlah<span v-if="sheetVariant" class="qty-stock"> (Stok: {{ sheetStock }})</span></span>
          <div class="qty-control" :class="{ disabled: sheetStock <= 0 }">
            <button class="qty-btn" @click="sheetDec" :disabled="sheetStock <= 0 || sheetQty <= 1">−</button>
            <span class="qty-value">{{ sheetQty }}</span>
            <button class="qty-btn" @click="sheetInc" :disabled="sheetStock <= 0 || sheetQty >= sheetStock">+</button>
          </div>
        </div>

        <button class="sheet-buy-btn" :disabled="!sheetVariant || sheetStock <= 0" @click="confirmBuyFromSheet">{{ sheetStock <= 0 && sheetVariant ? 'Stok Habis' : (sheetMode === 'cart' ? 'Masukkan Keranjang' : 'Beli Sekarang') }}</button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.merch-detail-page { display: flex; flex-direction: column; width: 100%; height: 100%; background: #fcfcfd; font-family: 'Poppins', sans-serif; position: relative; overflow: hidden; }
.detail-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; z-index: 20; }
.detail-header.scrolled-header { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.back-btn { width: 36px; height: 36px; border-radius: 50%; background: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.header-icon { width: 20px; height: 20px; }
.header-title-container { flex: 1; min-width: 0; display: flex; justify-content: center; }
.header-title { font-size: 15px; font-weight: 600; color: #151416; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.header-scrolled-info { display: flex; flex-direction: column; align-items: flex-start; text-align: left; flex: 1; margin: 0 4px; overflow: hidden; min-width: 0; }
.scrolled-event-title { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.scrolled-event-meta { font-size: 10px; font-weight: 500; color: #494a4a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.nav-icon-btn { background: transparent; border: none; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; padding: 0; border-radius: 50%; width: 36px; height: 36px; flex-shrink: 0; }
.header-action-icon { width: 20px; height: 20px; color: #194e9e; }
.cart-btn { position: relative; flex-shrink: 0; }
.cart-badge { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: #e52424; color: #fff; font-size: 10px; font-weight: 700; line-height: 1; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-sizing: border-box; z-index: 1; }
.header-spacer { width: 36px; flex-shrink: 0; }
.detail-scroll { flex: 1; overflow-y: auto; scrollbar-width: none; padding-bottom: 76px; }
.detail-scroll::-webkit-scrollbar { display: none; }
.detail-banner { position: relative; width: 100%; height: 260px; background: #f1f5f9; overflow: hidden; }
.banner-scroll { display: flex; overflow-x: auto; width: 100%; height: 100%; scroll-snap-type: x mandatory; scrollbar-width: none; touch-action: pan-x pan-y; }
.banner-scroll::-webkit-scrollbar { display: none; }
.banner-img { width: 100%; height: 100%; object-fit: cover; flex: 0 0 100%; scroll-snap-align: center; }
.banner-counter { position: absolute; bottom: 10px; right: 12px; background: rgba(15,23,42,0.65); color: #fff; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 999px; }
.banner-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
.banner-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; }
.banner-dot.active { width: 18px; border-radius: 999px; background: #fff; }
.detail-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; background: #fff; }
.detail-title { font-size: 15px; font-weight: 600; color: #151416; margin: 0; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: none; }
.merch-review-row { display: flex; align-items: center; gap: 5px; }
.review-star-icon { width: 14px; height: 14px; flex-shrink: 0; }
.review-star-icon.small { width: 11px; height: 11px; }
.review-text { font-size: 11.5px; font-weight: 400; color: #475569; text-transform: none; }
.meta-dot-separator { color: #cbd5e1; font-size: 11px; }
.detail-price-row { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.detail-original-price { font-size: 12px; color: #494a4a; text-decoration: line-through; text-decoration-color: #ef4444; font-weight: 500; line-height: 1.2; }
.detail-price { font-size: 18px; font-weight: 700; color: #000; text-transform: none; }
.detail-price.price-discount { color: #e52424; }
.card-middle-divider { height: 1px; background: #f1f5f9; width: 100%; }
.creator-profile-row { display: flex; align-items: center; gap: 8px; }
.creator-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.creator-text-wrap { display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex: 1; min-width: 0; }
.creator-by-label { font-size: 6px; font-weight: 400; color: #494a4a; }
.creator-name-with-badge { display: flex; align-items: center; gap: 4px; }
.creator-name { font-size: 11.5px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.verified-badge { color: #2196F3; display: inline-flex; flex-shrink: 0; }
.verified-check-svg { width: 14px; height: 14px; flex-shrink: 0; }
.creator-chat-btn { width: 38px; height: 38px; border-radius: 50%; background: transparent; border: none; outline: none; box-shadow: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-left: auto; padding: 0; }
.creator-chat-icon { width: 20px; height: 20px; }
.section-label { font-size: 13px; font-weight: 600; color: #151416; margin: 6px 0 0 0; text-transform: none; }
.section-label.no-margin { margin: 0; }
.detail-desc { font-size: 12.5px; font-weight: 400; color: #475569; line-height: 1.6; margin: 0; text-transform: none; }
.variant-row { display: flex; flex-wrap: wrap; gap: 8px; }
.variant-btn { min-width: 44px; padding: 8px 14px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; font-family: inherit; }
.variant-btn.active { border-color: #194e9e; background: #f0f6ff; color: #194e9e; font-weight: 600; }
.section-header-row { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.see-all-text-btn { background: none; border: none; color: #194e9e; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; padding: 0; }
.review-list { display: flex; flex-direction: column; gap: 10px; }
.review-item { display: flex; gap: 10px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 10px; }
.review-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.review-content { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.review-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.review-name { font-size: 12px; font-weight: 600; color: #151416; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.review-date { font-size: 10px; font-weight: 400; color: #94a3b8; flex-shrink: 0; }
.review-stars { display: flex; gap: 2px; }
.review-body { font-size: 12px; font-weight: 400; color: #475569; line-height: 1.5; margin: 0; }
.other-merch-section { background: #fff; margin-top: -8px; padding: 12px 0 4px 0; display: flex; flex-direction: column; gap: 10px; }
.other-title { padding: 0 16px; }
.other-merch-scroll { display: flex; gap: 10px; overflow-x: auto; padding: 0 16px 12px 16px; scrollbar-width: none; }
.other-merch-scroll::-webkit-scrollbar { display: none; }
.other-merch-card { flex: 0 0 150px; width: 150px; display: flex; flex-direction: column; gap: 4px; cursor: pointer; }
.other-thumb-wrap { width: 100%; height: 150px; border-radius: 10px; overflow: hidden; background: #f1f5f9; }
.other-thumb { width: 100%; height: 100%; object-fit: cover; }
.other-name { font-size: 12px; font-weight: 500; color: #151416; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.other-price { font-size: 12.5px; font-weight: 700; color: #000; }
.detail-footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 8px 12px 12px 12px; background: #fff; border-top: 1px solid #f1f5f9; display: flex; gap: 8px; }
.cart-outline-btn { flex: 1; min-width: 0; height: 38px; border-radius: 10px; border: 1.5px solid #194e9e; background: #fff; color: #194e9e; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; padding: 0 8px; }
.buy-btn { flex: 1; min-width: 0; height: 38px; border: none; border-radius: 10px; background: #194e9e; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; padding: 0 8px; }
.single-line { white-space: nowrap; overflow: hidden; }
.single-line span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1; }
.cart-toast { position: absolute; left: 50%; bottom: 76px; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; background: rgba(15,23,42,0.92); color: #fff; font-size: 12px; font-weight: 600; padding: 10px 16px; border-radius: 999px; z-index: 55; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
.toast-check { width: 15px; height: 15px; flex-shrink: 0; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
.review-images { display: flex; gap: 6px; margin-top: 6px; }
.review-img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; background: #f1f5f9; cursor: zoom-in; }
.filter-star { color: #F59E0B; font-size: 13px; }
.cat-pill-btn.active .filter-star { color: #F59E0B; }
.img-preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 60; display: flex; align-items: center; justify-content: center; padding: 24px; }
.img-preview-full { max-width: 100%; max-height: 100%; border-radius: 12px; object-fit: contain; }
.img-preview-close { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.15); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.review-all-page { position: absolute; inset: 0; background: #fcfcfd; z-index: 45; display: flex; flex-direction: column; font-family: 'Poppins', sans-serif; }
.review-all-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #f1f5f9; }
.review-filter-bar { background: #fff; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; }
.pills-scroll-row { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.pills-scroll-row::-webkit-scrollbar { display: none; }
.cat-pill-btn { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 24px; padding: 7px 14px; font-size: 12px; font-weight: 500; white-space: nowrap; cursor: pointer; font-family: inherit; }
.cat-pill-btn.active { background: #194e9e; color: #fff; border-color: #194e9e; font-weight: 600; }
.review-all-scroll { flex: 1; overflow-y: auto; padding: 12px 16px 24px 16px; scrollbar-width: none; }
.review-all-scroll::-webkit-scrollbar { display: none; }
.empty-merch-state { display: flex; flex-direction: column; align-items: center; padding: 48px 24px; text-align: center; gap: 8px; }
.empty-title { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0; }
.empty-desc { font-size: 12px; color: #64748b; margin: 0; }
.sheet-overlay { position: absolute; inset: 0; background: rgba(15,23,42,0.45); z-index: 40; touch-action: none; overscroll-behavior: contain; }
.variant-sheet { position: absolute; left: 0; right: 0; bottom: 0; max-height: 88%; background: #fff; border-radius: 20px 20px 0 0; z-index: 41; display: flex; flex-direction: column; padding: 6px 16px 16px 16px; overflow: hidden; font-family: 'Poppins', sans-serif; color: #0f172a; box-shadow: 0 -8px 30px rgba(15,23,42,0.12); }
.sheet-drag-zone { display: flex; align-items: center; justify-content: center; padding: 6px 0 4px 0; cursor: grab; touch-action: none; }
.sheet-drag-handle { width: 40px; height: 4px; border-radius: 999px; background: #e2e8f0; }
.sheet-header { display: flex; align-items: center; gap: 10px; padding: 6px 0 10px 0; }
.sheet-close-btn { background: #f1f5f9; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sheet-close-icon { width: 15px; height: 15px; }
.sheet-title { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0; font-family: 'Poppins', sans-serif; }
.sheet-product-row { display: flex; gap: 12px; align-items: stretch; background: transparent; border: none; border-radius: 0; padding: 0; }
.sheet-thumb { width: 64px; min-height: 64px; height: auto; align-self: stretch; border-radius: 6px; object-fit: cover; flex-shrink: 0; background: #f1f5f9; }
.sheet-product-info { display: flex; flex-direction: column; justify-content: center; gap: 1px; min-width: 0; flex: 1; }
.sheet-original-price { font-size: 11px; color: #494a4a; text-decoration: line-through; text-decoration-color: #ef4444; font-weight: 500; line-height: 1.2; font-family: 'Poppins', sans-serif; }
.sheet-price { font-size: 15px; font-weight: 700; color: #0f172a; font-family: 'Poppins', sans-serif; }
.sheet-price.price-discount { color: #e52424; }
.sheet-stock { font-size: 11px; font-weight: 400; color: #64748b; font-family: 'Poppins', sans-serif; }
.sheet-selected-variant { display: inline-block; font-size: 11px; font-weight: 600; color: #194e9e; background: #f0f6ff; border-radius: 6px; padding: 3px 8px; align-self: flex-start; font-family: 'Poppins', sans-serif; }
.sheet-hype-banner { display: flex; align-items: center; gap: 8px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 8px 12px; margin-top: 10px; }
.hype-icon { width: 16px; height: 16px; flex-shrink: 0; }
.hype-text { font-size: 11.5px; font-weight: 400; color: #9a3412; font-family: 'Poppins', sans-serif; }
.sheet-variant-label { font-size: 12px; font-weight: 600; color: #0f172a; margin-top: 12px; font-family: 'Poppins', sans-serif; text-transform: none; }
.sheet-variant-value { color: #64748b; font-weight: 500; }
.sheet-variant-list { display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px; margin-top: 8px; overflow-y: auto; max-height: 260px; scrollbar-width: none; padding-bottom: 4px; }
.sheet-variant-list::-webkit-scrollbar { display: none; }
.sheet-variant-btn { position: relative; display: flex; align-items: center; justify-content: center; min-width: 52px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 9px 16px; cursor: pointer; font-family: 'Poppins', sans-serif; text-align: center; }
.sheet-variant-btn.active { background: #f0f6ff; border-color: #194e9e; }
.sheet-variant-btn.soldout { background: #f1f5f9; border-color: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
.sheet-variant-name { font-size: 12.5px; font-weight: 600; color: #0f172a; white-space: nowrap; font-family: 'Poppins', sans-serif; }
.sheet-variant-btn.active .sheet-variant-name { color: #194e9e; }
.sheet-variant-btn.soldout .sheet-variant-name { color: #94a3b8; text-decoration: line-through; }
.check-icon { width: 10px; height: 10px; }
.sheet-qty-row { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.qty-label { font-size: 12.5px; font-weight: 600; color: #0f172a; font-family: 'Poppins', sans-serif; }
.qty-stock { font-weight: 500; color: #64748b; }
.qty-control { display: flex; align-items: center; gap: 12px; background: #f1f5f9; border-radius: 20px; padding: 4px 8px; }
.qty-control.disabled { opacity: 0.5; }
.qty-btn { width: 28px; height: 28px; border-radius: 50%; border: none; background: #fff; font-size: 16px; font-weight: 700; color: #194e9e; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; }
.qty-btn:disabled { color: #94a3b8; cursor: not-allowed; box-shadow: none; }
.qty-value { font-size: 13px; font-weight: 700; color: #0f172a; min-width: 20px; text-align: center; font-family: 'Poppins', sans-serif; }
.sheet-buy-btn { width: 100%; height: 44px; border: none; border-radius: 12px; background: #194e9e; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; margin-top: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sheet-buy-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.sheet-fade-enter-active, .sheet-fade-leave-active { transition: opacity 0.25s ease; }
.sheet-fade-enter-from, .sheet-fade-leave-to { opacity: 0; }
.sheet-slide-enter-active, .sheet-slide-leave-active { transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
.sheet-slide-enter-from, .sheet-slide-leave-to { transform: translateY(100%); }
</style>
