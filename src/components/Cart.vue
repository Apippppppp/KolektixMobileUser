<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  cartItems: { type: Array, default: () => [] }
});

const emit = defineEmits(['back', 'update-qty', 'remove-item', 'checkout', 'select-merch']);

const itemKey = (item) => `${item.merch.id}__${item.merch.variant || 'default'}`;
const selectedKeys = ref([]);

watch(() => props.cartItems, (list) => {
  const keys = (list || []).map(itemKey);
  keys.forEach(k => { if (!selectedKeys.value.includes(k)) selectedKeys.value.push(k); });
  selectedKeys.value = selectedKeys.value.filter(k => keys.includes(k));
}, { immediate: true, deep: true });

const isSelected = (item) => selectedKeys.value.includes(itemKey(item));
const toggleItem = (item) => {
  const k = itemKey(item);
  if (selectedKeys.value.includes(k)) selectedKeys.value = selectedKeys.value.filter(x => x !== k);
  else selectedKeys.value.push(k);
};

const groups = computed(() => {
  const map = new Map();
  (props.cartItems || []).forEach(item => {
    const org = item.merch.organizer || 'Kolektix Official';
    if (!map.has(org)) map.set(org, { organizer: org, logo: item.merch.creatorLogo, items: [] });
    map.get(org).items.push(item);
  });
  return [...map.values()];
});

const isGroupChecked = (group) => group.items.length > 0 && group.items.every(isSelected);
const toggleGroup = (group) => {
  if (isGroupChecked(group)) {
    const keys = new Set(group.items.map(itemKey));
    selectedKeys.value = selectedKeys.value.filter(k => !keys.has(k));
  } else {
    group.items.forEach(item => {
      const k = itemKey(item);
      if (!selectedKeys.value.includes(k)) selectedKeys.value.push(k);
    });
  }
};

const selectedItems = computed(() => (props.cartItems || []).filter(isSelected));

const parsePrice = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const num = parseInt(String(priceStr).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

const formatPrice = (num) => 'Rp' + Number(num || 0).toLocaleString('id-ID');

const totalPrice = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + parsePrice(item.merch?.price) * (item.qty || 1), 0)
);

const totalQty = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + (item.qty || 1), 0)
);

const handleBack = () => emit('back');
const inc = (item) => emit('update-qty', item.merch.id, (item.qty || 1) + 1);
const dec = (item) => {
  if ((item.qty || 1) > 1) emit('update-qty', item.merch.id, item.qty - 1);
};
const remove = (item) => emit('remove-item', item.merch.id);
const checkout = () => emit('checkout');
const openDetail = (item) => emit('select-merch', item.merch);
</script>

<template>
  <div class="cart-page">
    <div class="cart-header">
      <button class="back-btn" @click="handleBack" title="Kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="#194e9e" class="header-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>
      <h1 class="header-title">Keranjang</h1>
      <div class="header-spacer"></div>
    </div>

    <div class="cart-scroll">
      <div v-if="cartItems.length > 0" class="cart-list">
        <div v-for="group in groups" :key="group.organizer" class="creator-group">
          <div class="creator-section">
            <button class="check-btn" :class="{ checked: isGroupChecked(group) }" @click="toggleGroup(group)" title="Pilih kreator">
              <svg v-if="isGroupChecked(group)" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <img :src="group.logo" alt="Kreator" class="creator-avatar" loading="lazy" />
            <span class="creator-name">{{ group.organizer }}</span>
            <span class="verified-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </span>
          </div>
          <div v-for="item in group.items" :key="itemKey(item)" class="cart-item" @click="openDetail(item)">
            <button class="check-btn" :class="{ checked: isSelected(item) }" @click.stop="toggleItem(item)" title="Pilih item">
              <svg v-if="isSelected(item)" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <img :src="item.merch.image" :alt="item.merch.title" class="cart-thumb" loading="lazy" />
            <div class="cart-info">
              <h3 class="cart-title">{{ item.merch.title }}</h3>
              <span v-if="item.merch.variant" class="cart-variant">{{ item.merch.variant }}</span>
              <span class="cart-price">{{ item.merch.price }}</span>
              <div class="cart-bottom-row">
                <div class="qty-control" @click.stop>
                  <button class="qty-btn" @click="dec(item)">−</button>
                  <span class="qty-value">{{ item.qty }}</span>
                  <button class="qty-btn" @click="inc(item)">+</button>
                </div>
                <button class="remove-btn" @click.stop="remove(item)" title="Hapus">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#e52424" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="remove-icon">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-cart-state">
        <lottie-player src="/media/sad emotion.json" background="transparent" speed="1" style="width: 120px; height: 120px;" loop autoplay></lottie-player>
        <h3 class="empty-title">Keranjang kosong</h3>
        <p class="empty-desc">Yuk pilih merchandise favoritmu dulu.</p>
        <button class="reset-filter-btn" @click="handleBack">Lihat Merch</button>
      </div>
    </div>

    <div v-if="cartItems.length > 0" class="cart-footer">
      <div class="total-row">
        <span class="total-label">Total ({{ totalQty }} barang)</span>
        <span class="total-price">{{ formatPrice(totalPrice) }}</span>
      </div>
      <button class="checkout-btn" @click="checkout">Checkout</button>
    </div>
  </div>
</template>

<style scoped>
.cart-page { display: flex; flex-direction: column; width: 100%; height: 100%; background: #fcfcfd; font-family: 'Poppins', sans-serif; position: relative; overflow: hidden; }
.cart-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border: none; border-bottom: none; position: sticky; top: 0; z-index: 20; }
.back-btn { width: 36px; height: 36px; border-radius: 50%; background: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.header-icon { width: 20px; height: 20px; }
.header-title { font-size: 15px; font-weight: 600; color: #151416; margin: 0; flex: 1; text-align: center; }
.header-spacer { width: 36px; }
.cart-scroll { flex: 1; overflow-y: auto; scrollbar-width: none; padding: 10px 8px 110px 8px; box-sizing: border-box; }
.cart-scroll::-webkit-scrollbar { display: none; }
.cart-list { display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box; }
.creator-group { display: flex; flex-direction: column; background: transparent; border: none; border-radius: 0; padding: 8px 6px 4px 6px; width: 100%; box-sizing: border-box; box-shadow: none; }
.creator-section { display: flex; align-items: center; gap: 7px; padding-bottom: 8px; border: none; border-bottom: none; }
.creator-avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; border: 1px solid #dbeafe; flex-shrink: 0; }
.creator-name { font-size: 11.5px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
.verified-badge { color: #2196F3; display: inline-flex; flex-shrink: 0; }
.verified-check-svg { width: 12px; height: 12px; }
.check-btn { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #cbd5e1; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; }
.check-btn.checked { background: #194e9e; border-color: #194e9e; }
.check-icon { width: 10px; height: 10px; }
.cart-item { display: flex; gap: 10px; align-items: center; background: transparent; border: none !important; border-bottom: 1px solid #e2e8f0 !important; outline: none; border-radius: 0; padding: 10px 0; width: 100%; box-sizing: border-box; cursor: pointer; box-shadow: none; }
.cart-thumb { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: #f1f5f9; }
.cart-info { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 2px; }
.cart-title { font-size: 12.5px; font-weight: 600; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; }
.cart-variant { display: inline-block; align-self: flex-start; font-size: 10px; font-weight: 600; color: #475569; background: #f1f5f9; border-radius: 6px; padding: 2px 8px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.cart-price { font-size: 13px; font-weight: 700; color: #000; white-space: nowrap; margin-top: 4px; }
.cart-bottom-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; }
.qty-control { display: flex; align-items: center; gap: 10px; background: #f1f5f9; border-radius: 20px; padding: 2px 6px; flex-shrink: 0; }
.qty-btn { width: 24px; height: 24px; border-radius: 50%; border: none; background: #fff; font-size: 14px; font-weight: 700; line-height: 1; color: #194e9e; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; padding: 0; }
.qty-value { font-size: 12.5px; font-weight: 700; color: #0f172a; min-width: 18px; text-align: center; }
.remove-btn { background: transparent; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.remove-icon { width: 17px; height: 17px; }
.empty-cart-state { display: flex; flex-direction: column; align-items: center; padding: 48px 24px; text-align: center; gap: 8px; }
.empty-title { font-size: 15px; font-weight: 600; color: #0f172a; margin: 8px 0 0 0; }
.empty-desc { font-size: 12px; color: #64748b; margin: 0; }
.reset-filter-btn { margin-top: 12px; background: #194e9e; color: #fff; border: none; border-radius: 20px; padding: 9px 20px; font-size: 12px; font-weight: 600; cursor: pointer; }
.cart-footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 16px 20px 16px; background: #fff; border: none; border-top: none; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; box-shadow: 0 -2px 12px rgba(15,23,42,0.06); }
.total-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.total-label { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.total-price { font-size: 16px; font-weight: 800; color: #000; white-space: nowrap; }
.checkout-btn { width: 100%; height: 46px; border: none; border-radius: 12px; background: #194e9e; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
