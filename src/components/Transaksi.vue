<script setup>
import { ref, computed } from 'vue';

const activeFilter = ref('semua'); // 'semua', 'berhasil', 'diproses', 'batal'

const transactions = ref([
  {
    id: 'KLX-892103',
    date: '24 Agu 2026, 15:30 WIB',
    eventTitle: 'Ngamen 0.5',
    organizer: 'Maxpaincompany LTD',
    ticketCategory: '1x Regular Ticket',
    amount: 'Rp 124.000',
    status: 'Berhasil',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'KLX-774019',
    date: '20 Agu 2026, 11:15 WIB',
    eventTitle: 'SIKSAKUBUR - Tiga Dekade Melawan Tunduk',
    organizer: 'Newhope.inc',
    ticketCategory: '2x Presale Ticket',
    amount: 'Rp 16.000',
    status: 'Berhasil',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'KLX-661902',
    date: '15 Agu 2026, 18:45 WIB',
    eventTitle: 'Straight Answer 30 Years Of Persistence',
    organizer: 'Smartex Bomb Records',
    ticketCategory: '1x VIP Ticket',
    amount: 'Rp 85.000',
    status: 'Diproses',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'KLX-553108',
    date: '02 Jul 2026, 09:20 WIB',
    eventTitle: 'Intimate Show MORAD',
    organizer: 'Morad Music Asia',
    ticketCategory: '1x Early Bird',
    amount: 'Rp 80.000',
    status: 'Batal',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80'
  }
]);

const filteredTransactions = computed(() => {
  if (activeFilter.value === 'semua') return transactions.value;
  return transactions.value.filter(t => t.status.toLowerCase() === activeFilter.value);
});
</script>

<template>
  <div class="transaksi-wrapper">
    <!-- Top Filter Pills Bar -->
    <div class="transaksi-filter-bar">
      <button 
        class="filter-pill-btn" 
        :class="{ active: activeFilter === 'semua' }"
        @click="activeFilter = 'semua'"
      >
        Semua
      </button>
      <button 
        class="filter-pill-btn" 
        :class="{ active: activeFilter === 'berhasil' }"
        @click="activeFilter = 'berhasil'"
      >
        Berhasil
      </button>
      <button 
        class="filter-pill-btn" 
        :class="{ active: activeFilter === 'diproses' }"
        @click="activeFilter = 'diproses'"
      >
        Diproses
      </button>
      <button 
        class="filter-pill-btn" 
        :class="{ active: activeFilter === 'batal' }"
        @click="activeFilter = 'batal'"
      >
        Batal
      </button>
    </div>

    <!-- Transactions List -->
    <div class="transaksi-list-container">
      <div 
        v-for="item in filteredTransactions" 
        :key="item.id"
        class="transaksi-card"
      >
        <div class="card-header-row">
          <div class="order-id-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ticket-icon-sm"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>
            <span class="order-id">{{ item.id }}</span>
          </div>
          <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
        </div>

        <div class="card-body-row">
          <img :src="item.image" :alt="item.eventTitle" class="transaksi-event-img" />
          <div class="transaksi-event-info">
            <div class="event-title-wrapper">
              <div v-if="item.eventTitle && item.eventTitle.length > 20" class="event-title-marquee">
                <h4 class="transaksi-event-title">{{ item.eventTitle }}</h4>
                <h4 class="transaksi-event-title" aria-hidden="true">{{ item.eventTitle }}</h4>
              </div>
              <h4 v-else class="transaksi-event-title static">{{ item.eventTitle }}</h4>
            </div>
            <span class="transaksi-organizer">{{ item.organizer }}</span>
            <span class="transaksi-ticket-type">{{ item.ticketCategory }}</span>
            <span class="transaksi-date-text">{{ item.date }}</span>
          </div>
        </div>

        <div class="card-footer-row">
          <div class="price-group">
            <span class="total-label">Total Bayar:</span>
            <span class="total-amount">{{ item.amount }}</span>
          </div>
          
          <button v-if="item.status === 'Berhasil'" class="action-detail-btn">
            Lihat Tiket
          </button>
          <button v-else-if="item.status === 'Diproses'" class="action-detail-btn pending">
            Bayar Sekarang
          </button>
          <button v-else class="action-detail-btn canceled">
            Beli Lagi
          </button>
        </div>
      </div>

      <div v-if="filteredTransactions.length === 0" class="empty-transaksi-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" class="empty-icon"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <span class="empty-title">Belum ada transaksi</span>
        <span class="empty-desc">Transaksi yang kamu lakukan akan muncul di sini</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transaksi-wrapper {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 16px 32px 16px;
  background-color: #f8fafc;
  min-height: 100%;
}

.transaksi-filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.transaksi-filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-pill-btn {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-pill-btn.active {
  background-color: #194e9e;
  border-color: #194e9e;
  color: #ffffff;
}

.transaksi-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaksi-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 14px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f8fafc;
  padding-bottom: 8px;
}

.order-id-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ticket-icon-sm {
  width: 14px;
  height: 14px;
  color: #194e9e;
}

.order-id {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
}

.status-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 50px;
}

.status-badge.berhasil {
  background-color: #dcfce7;
  color: #15803d;
}

.status-badge.diproses {
  background-color: #fef3c7;
  color: #b45309;
}

.status-badge.batal {
  background-color: #fee2e2;
  color: #b91c1c;
}

.card-body-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.transaksi-event-img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
}

.transaksi-event-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

.transaksi-event-title {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  flex-shrink: 0;
  padding-right: 18px;
}

.transaksi-event-title.static {
  padding-right: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes cardTitleMarquee {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

.transaksi-organizer {
  font-size: 10px;
  color: #64748b;
}

.transaksi-ticket-type {
  font-size: 10px;
  font-weight: 600;
  color: #194e9e;
}

.transaksi-date-text {
  font-size: 9px;
  color: #94a3b8;
}

.card-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f8fafc;
  padding-top: 8px;
}

.price-group {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 9px;
  color: #94a3b8;
}

.total-amount {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.action-detail-btn {
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.action-detail-btn.pending {
  background-color: #d97706;
}

.action-detail-btn.canceled {
  background-color: #f1f5f9;
  color: #475569;
}

.empty-transaksi-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 16px;
  gap: 8px;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
}

.empty-title {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.empty-desc {
  font-size: 11px;
  color: #94a3b8;
}
</style>
