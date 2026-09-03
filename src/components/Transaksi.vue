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
        v-for="(item, index) in filteredTransactions" 
        :key="item.id"
        class="transaksi-card"
      >
        <div class="card-header-row">
          <div class="order-id-group">
            <span class="card-number-badge">#{{ index + 1 }}</span>
            <span class="order-id">{{ item.id }}</span>
          </div>
          <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
        </div>

        <div class="card-body-row">
          <div class="transaksi-event-info">
            <h4 class="transaksi-event-title">{{ item.eventTitle }}</h4>
            <div class="event-meta-sub-row">
              <span class="transaksi-date-text">{{ item.date }}</span>
              <span class="transaksi-organizer">{{ item.organizer }}</span>
            </div>
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
  padding: 12px 16px 32px 16px;
  background-color: #ffffff;
  min-height: 100%;
}

.transaksi-filter-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid #f1f5f9; /* Thin divider line separating filter bar and transaction cards */
  scrollbar-width: none;
  background-color: #ffffff;
  flex-shrink: 0;
  width: 100%;
}

.transaksi-filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-pill-btn {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  height: 34px;
  padding: 0 18px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
  line-height: 1;
}

.filter-pill-btn:hover {
  background-color: #f1f5f9;
  color: #194e9e;
  border-color: #cbd5e1;
}

.filter-pill-btn.active {
  background-color: #194e9e;
  border-color: #194e9e;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(25, 78, 158, 0.22);
}

.transaksi-list-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.transaksi-card {
  background-color: transparent;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 0 0 14px 0;
  border-bottom: 1px solid #e2e8f0 !important;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
}

.order-id-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-number-badge {
  background: none !important;
  background-color: transparent !important;
  color: #194e9e;
  font-size: 14px;
  font-weight: 700;
  padding: 0;
  border-radius: 0;
  letter-spacing: -0.2px;
  border: none !important;
  box-shadow: none !important;
  display: inline-block;
  line-height: 1;
}

.order-id {
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
}

.status-badge {
  font-size: 9.5px;
  font-weight: 600;
  padding: 3px 10px;
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
  align-items: center;
  width: 100%;
}

.transaksi-event-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.transaksi-event-title {
  font-size: 14.5px;
  font-weight: 600;
  color: #151416;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.event-meta-sub-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
}

.transaksi-date-text {
  font-size: 11px;
  color: #64748b;
  font-weight: 400;
  line-height: 1.3;
}

.transaksi-organizer {
  font-size: 11px;
  font-weight: 500;
  color: #475569;
  line-height: 1.3;
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
  font-size: 9.5px;
  color: #94a3b8;
}

.total-amount {
  font-size: 13.5px;
  font-weight: 700;
  color: #151416;
}

.action-detail-btn {
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.action-detail-btn:hover {
  background-color: #0d3e91;
}

.action-detail-btn.pending {
  background-color: #194e9e;
  color: #ffffff;
}

.action-detail-btn.canceled {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
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
