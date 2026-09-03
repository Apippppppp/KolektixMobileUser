<script setup>
import { ref, computed } from 'vue';

defineProps({
  events: {
    type: Array,
    required: true
  }
});

const activeTab = ref('dashboard'); // 'dashboard' or 'withdraw'
const isCalendarOpen = ref(false);
const isHistoryOpen = ref(false);

const withdrawAmount = ref('');

const onWithdrawInput = (e) => {
  let val = e.target.value.replace(/\D/g, '');
  if (val) {
    withdrawAmount.value = Number(val).toLocaleString('id-ID');
  } else {
    withdrawAmount.value = '';
  }
};

const formattedDeduction = computed(() => {
  const num = Number(withdrawAmount.value.replace(/\D/g, ''));
  return num > 0 ? `Rp ${num.toLocaleString('id-ID')}` : 'Rp 0';
});

const rekapPeriods = [
  { label: 'Semua Waktu', value: 'all', events: 6, total: 'Rp. 658,021,000', visitors: '56.8k', transactions: 2702, tickets: 36 },
  { label: '30 Hari Terakhir', value: '30d', events: 2, total: 'Rp. 142,500,000', visitors: '12.3k', transactions: 560, tickets: 12 },
  { label: '7 Hari Terakhir', value: '7d', events: 1, total: 'Rp. 48,000,000', visitors: '4.1k', transactions: 180, tickets: 8 },
];

const currentData = ref(rekapPeriods[0]);

// Withdraw dummy data
const withdrawHistory = ref([
  { id: 1, amount: 'Rp. 12,400,000', date: '24 Agu 2026', status: 'Selesai', bank: 'BCA - 1234567890' },
  { id: 2, amount: 'Rp. 8,750,000', date: '10 Agu 2026', status: 'Selesai', bank: 'BCA - 1234567890' },
  { id: 3, amount: 'Rp. 5,200,000', date: '28 Jul 2026', status: 'Diproses', bank: 'BCA - 1234567890' },
]);
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- Active Tab Buttons (Fixed at top) -->
    <div class="dashboard-tabs-header">
      <button
        class="dashboard-tab-btn"
        :class="{ active: activeTab === 'dashboard' }"
        @click="activeTab = 'dashboard'"
      >
        Dashboard
      </button>
      <button
        class="dashboard-tab-btn"
        :class="{ active: activeTab === 'withdraw' }"
        @click="activeTab = 'withdraw'"
      >
        Withdraw
      </button>
    </div>

    <!-- Scrollable Content Area -->
    <div class="dashboard-scrollable-content">
      <!-- ===== DASHBOARD TAB ===== -->
      <template v-if="activeTab === 'dashboard'">
        <div class="dashboard-header-card">
          <!-- Verified pill + Date on same row -->
          <div class="header-top-row">
            <div class="verified-account-pill">
              <svg viewBox="0 0 20 20" fill="currentColor" class="verified-icon-svg">
                <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4.13-5.68Z" clip-rule="evenodd" />
              </svg>
              <span>Akun Terverifikasi</span>
            </div>
            
            <button class="dashboard-date-btn" @click="isCalendarOpen = true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="date-calendar-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span class="dashboard-date-label">Kamis, 27 Agu 2026</span>
            </button>
          </div>

          <h1 class="dashboard-greeting-title">Halo, Maspamcompany LTD</h1>

          <div class="dashboard-subtitle-btn">
            <span class="dashboard-subtitle-text">Pantau dan kelola event, lowongan, dan merchandise</span>
          </div>
        </div>

        <div class="rekap-section-header">
          <div class="rekap-header-left">
            <h2>Rekap Semua Event</h2>
          </div>
        </div>

        <div class="sales-total-blue-card">
          <div class="sales-card-left">
            <span class="sales-card-title">Total Penjualan Seluruh Event</span>
            <h2 class="sales-card-amount">{{ currentData.total }}</h2>
          </div>
          <div class="sales-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sales-doc-svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>

        <div class="dashboard-metrics-grid">
          <div class="metric-grid-card">
            <div class="metric-card-content">
              <span class="metric-label">Jumlah Event</span>
              <span class="metric-value">{{ currentData.events }}</span>
            </div>
            <div class="metric-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
          </div>
          <div class="metric-grid-card">
            <div class="metric-card-content">
              <span class="metric-label">Pengunjung</span>
              <span class="metric-value">{{ currentData.visitors }}</span>
            </div>
            <div class="metric-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div class="metric-grid-card">
            <div class="metric-card-content">
              <span class="metric-label">Transaksi</span>
              <span class="metric-value">{{ currentData.transactions.toLocaleString() }}</span>
            </div>
            <div class="metric-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
          </div>
          <div class="metric-grid-card">
            <div class="metric-card-content">
              <span class="metric-label">Jenis Tiket</span>
              <span class="metric-value">{{ currentData.tickets }}</span>
            </div>
            <div class="metric-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="6" width="20" height="12" rx="2" ry="2"/>
                <line x1="6" y1="6" x2="6" y2="18"/>
                <line x1="18" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== WITHDRAW TAB ===== -->
      <template v-else-if="activeTab === 'withdraw'">
        <div v-if="!isHistoryOpen">
          <!-- Total Saldo Keseluruhan -->
        <div class="withdraw-total-saldo">
          <div class="withdraw-total-left">
            <span class="withdraw-total-label">Total Saldo Keseluruhan</span>
            <h2 class="withdraw-total-amount">Rp. 12,400,000</h2>
          </div>
          <button class="withdraw-history-btn" @click="isHistoryOpen = !isHistoryOpen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>
        </div>

        <!-- Horizontal Scrollable Metrics -->
        <div class="withdraw-metrics-scroll-container">
          <div class="withdraw-metrics-card">
            <div class="withdraw-metric-item">
              <span class="wm-label">Total Event</span>
              <span class="wm-value">Rp 0</span>
            </div>
            <div class="wm-divider"></div>
            <div class="withdraw-metric-item">
              <span class="wm-label">Total Merchandise</span>
              <span class="wm-value">Rp 0</span>
            </div>
            <div class="wm-divider"></div>
            <div class="withdraw-metric-item">
              <span class="wm-label">Total Venue</span>
              <span class="wm-value">Rp 0</span>
            </div>
            <div class="wm-divider"></div>
            <div class="withdraw-metric-item">
              <span class="wm-label">Total Talenta</span>
              <span class="wm-value">Rp 0</span>
            </div>
          </div>
        </div>

        <!-- Destination Account -->
        <div class="destination-account-header">
          <span class="da-title">Destination Account</span>
        </div>
        <div class="destination-account-card">
          <div class="da-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="da-info">
            <span class="da-name">BCA - Adit Pratama</span>
            <span class="da-number">**** **** 1234</span>
          </div>
          <button class="da-edit-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3l4 4-4 4"></path>
              <path d="M3 7h18"></path>
              <path d="M7 21l-4-4 4-4"></path>
              <path d="M21 17H3"></path>
            </svg>
          </button>
        </div>

        <!-- Withdrawal Details -->
        <div class="withdrawal-details-card">
          <div class="wd-input-group">
            <label class="wd-input-label">Nominal Tarik Dana</label>
            <div class="wd-input-wrapper">
              <span class="wd-input-prefix">Rp</span>
              <input type="text" class="wd-input-field" placeholder="0" :value="withdrawAmount" @input="onWithdrawInput" />
            </div>
          </div>
          <div class="wd-row">
            <span class="wd-label">Estimated Arrival</span>
            <span class="wd-value">1-2 Business Days</span>
          </div>
          <div class="wd-row">
            <span class="wd-label">Transaction Fee</span>
            <span class="wd-value">Rp 0 (Free)</span>
          </div>
          <hr class="wd-divider" />
          <div class="wd-row total">
            <span class="wd-total-label">Total Deduction</span>
            <span class="wd-total-value">{{ formattedDeduction }}</span>
          </div>
        </div>
        
        <button class="withdraw-submit-btn">Tarik Saldo</button>
        </div>

        <!-- Recent Withdrawals -->
        <div class="recent-withdrawals-section" v-else>
          <div class="rw-header">
            <button class="rw-back-btn" @click="isHistoryOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h3 class="rw-title">Recent Withdrawals</h3>
          </div>
          <div class="rw-list">
            <div class="rw-item" v-for="(item, index) in withdrawHistory" :key="item.id">
              <div class="rw-left">
                <div class="rw-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="rw-info">
                  <span class="rw-name">{{ item.bank }}</span>
                  <span class="rw-date">{{ item.date }}</span>
                </div>
              </div>
              <div class="rw-right">
                <span class="rw-amount">{{ item.amount }}</span>
                <span class="rw-status success">Success</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ===== CALENDAR POPUP MODAL ===== -->
    <transition name="fade">
      <div v-if="isCalendarOpen" class="calendar-popup-overlay" @click="isCalendarOpen = false">
        <div class="calendar-popup-card" @click.stop>
          <div class="calendar-header">
            <button class="calendar-nav-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <span class="calendar-month-year">Agustus 2026</span>
            <button class="calendar-nav-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
          
          <div class="calendar-weekdays">
            <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
          </div>
          
          <div class="calendar-days-grid">
            <span class="calendar-day empty"></span>
            <span class="calendar-day empty"></span>
            <span class="calendar-day empty"></span>
            <span class="calendar-day empty"></span>
            <span class="calendar-day empty"></span>
            <span class="calendar-day empty"></span>
            <span class="calendar-day">1</span>
            
            <span class="calendar-day">2</span>
            <span class="calendar-day">3</span>
            <span class="calendar-day">4</span>
            <span class="calendar-day">5</span>
            <span class="calendar-day">6</span>
            <span class="calendar-day">7</span>
            <span class="calendar-day">8</span>
            
            <span class="calendar-day">9</span>
            <span class="calendar-day">10</span>
            <span class="calendar-day">11</span>
            <span class="calendar-day">12</span>
            <span class="calendar-day">13</span>
            <span class="calendar-day">14</span>
            <span class="calendar-day">15</span>
            
            <span class="calendar-day">16</span>
            <span class="calendar-day">17</span>
            <span class="calendar-day">18</span>
            <span class="calendar-day">19</span>
            <span class="calendar-day">20</span>
            <span class="calendar-day">21</span>
            <span class="calendar-day">22</span>
            
            <span class="calendar-day">23</span>
            <span class="calendar-day">24</span>
            <span class="calendar-day">25</span>
            <span class="calendar-day">26</span>
            <span class="calendar-day active-day">27</span>
            <span class="calendar-day">28</span>
            <span class="calendar-day">29</span>
            
            <span class="calendar-day">30</span>
            <span class="calendar-day">31</span>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  background-color: transparent;
  font-family: var(--font-sans);
  height: 100%;
  overflow: hidden;
}

/* ===== TAB HEADERS (Matching Checkin.vue) ===== */
.dashboard-tabs-header {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  padding: 0 16px;
  background-color: transparent;
  flex-shrink: 0;
}

.dashboard-tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 500;
  color: #494a4a;
  cursor: pointer;
  position: relative;
  text-align: center;
  transition: color 0.2s;
  font-family: var(--font-sans);
}

.dashboard-tab-btn.active {
  color: var(--primary-base);
  font-weight: 600;
}

.dashboard-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--primary-base);
  border-radius: 3px 3px 0 0;
}

/* ===== SCROLLABLE CONTENT ===== */
.dashboard-scrollable-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px 84px 16px; /* Adjusted padding to 16px left/right */
  scrollbar-width: none;
}

.dashboard-scrollable-content::-webkit-scrollbar {
  display: none;
}

/* ===== HEADER CARD ===== */
.dashboard-header-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  width: 100%;
}

/* Verified pill + date on same row */
.header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 2px;
}

.verified-account-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #f0fdf4;
  color: #15803d;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 20px;
  border: 1px solid #dcfce7;
}

.verified-icon-svg { width: 10px; height: 10px; }

.dashboard-date-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dashboard-date-btn:hover {
  background-color: #f1f5f9;
}

.date-calendar-icon {
  width: 14px;
  height: 14px;
  color: #194E9E; /* Changed to Blue */
}

.dashboard-date-label {
  font-size: 10px;
  font-weight: 600;
  color: #475569;
  text-align: right;
  flex-shrink: 0;
  font-family: var(--font-sans);
}

.dashboard-greeting-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 2px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.dashboard-subtitle-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  margin-top: 2px;
}

.dashboard-subtitle-text {
  font-size: 12px;
  color: #475569;
  text-align: left;
  flex: 1;
  font-family: var(--font-sans);
}

.rekap-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.rekap-header-left { display: flex; align-items: center; gap: 8px; }

.rekap-section-header h2 {
  font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; white-space: nowrap;
}

.sales-total-blue-card {
  background-color: #194E9E;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  box-shadow: 0 4px 14px rgba(25, 78, 158, 0.2);
  width: 100%;
}

.sales-card-title { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.85); letter-spacing: 0.2px; }
.sales-card-amount { font-size: 18px; font-weight: 700; margin: 4px 0 0 0; }

.sales-card-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.9); flex-shrink: 0;
}

.sales-doc-svg { width: 18px; height: 18px; }

.dashboard-metrics-grid { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  width: 100%;
}

.metric-grid-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.metric-card-content { display: flex; flex-direction: column; gap: 4px; }
.metric-label { font-size: 11px; font-weight: 500; color: #494a4a; }
.metric-value { font-size: 16px; font-weight: 700; color: #0f172a; }

.metric-card-icon {
  width: 32px; height: 32px;
  border-radius: 6px;
  background-color: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
}

.metric-card-icon svg { width: 16px; height: 16px; }

/* ===== WITHDRAW TAB ===== */

/* Total Saldo Keseluruhan */
.withdraw-total-saldo {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #194E9E 0%, #1e6fd9 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(25, 78, 158, 0.2);
}

.withdraw-total-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.withdraw-history-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.withdraw-history-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.withdraw-history-btn svg {
  width: 18px;
  height: 18px;
}

.withdraw-total-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.withdraw-total-amount {
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin: 0;
}

/* Scrollable Metrics */
.withdraw-metrics-scroll-container {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  width: 100%;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.withdraw-metrics-scroll-container::-webkit-scrollbar {
  display: none;
}

.withdraw-metrics-card {
  display: inline-flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  gap: 20px;
  flex-shrink: 0;
  width: max-content;
}

.withdraw-metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wm-label {
  font-size: 10px;
  color: #494a4a;
  white-space: nowrap;
}

.wm-value {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.wm-divider {
  width: 1px;
  height: 24px;
  background-color: #e2e8f0;
  flex-shrink: 0;
}

/* Destination Account */
.destination-account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 8px;
  padding: 0 4px;
}

.da-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.destination-account-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  margin-top: 8px;
}

.da-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #194E9E;
  flex-shrink: 0;
}

.da-icon-wrapper svg {
  width: 18px;
  height: 18px;
}

.da-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.da-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.da-number {
  font-size: 11px;
  color: #494a4a;
}

.da-edit-icon-btn {
  background: none;
  border: none;
  color: #194E9E;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.da-edit-icon-btn:hover {
  background-color: #f1f5f9;
}

.da-edit-icon-btn svg {
  width: 18px;
  height: 18px;
}

/* Withdrawal Details */
.withdrawal-details-card {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.wd-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wd-label {
  font-size: 11px;
  color: #494a4a;
}

.wd-value {
  font-size: 11px;
  font-weight: 600;
  color: #0f172a;
}

.wd-divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 6px 0;
}

.wd-row.total {
  align-items: center;
  margin-top: 2px;
}

.wd-total-label {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.wd-total-value {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.wd-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}
.wd-input-label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}
.wd-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
  background-color: white;
}
.wd-input-prefix {
  font-size: 14px;
  font-weight: 600;
  color: #494a4a;
  margin-right: 8px;
}
.wd-input-field {
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  width: 100%;
}

/* Submit Button */
.withdraw-submit-btn {
  background-color: #194E9E;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  width: 100%;
  cursor: pointer;
  margin-top: 12px;
  transition: opacity 0.2s;
}

.withdraw-submit-btn:hover {
  opacity: 0.9;
}

/* Recent Withdrawals */
.recent-withdrawals-section {
  display: flex;
  flex-direction: column;
}

.rw-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rw-back-btn {
  background: none;
  border: none;
  color: #0f172a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.rw-back-btn svg {
  width: 20px;
  height: 20px;
}

.rw-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.rw-list {
  display: flex;
  flex-direction: column;
}

.rw-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
}

.rw-item:last-child {
  border-bottom: none;
}

.rw-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rw-icon-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
}

.rw-icon-wrapper svg {
  width: 16px;
  height: 16px;
}

.rw-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rw-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.rw-date {
  font-size: 11px;
  color: #494a4a;
}

.rw-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.rw-amount {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.rw-status.success {
  font-size: 10px;
  font-weight: 600;
  color: #15803d;
  background-color: #f0fdf4;
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid #dcfce7;
}

/* ===== CALENDAR POPUP MODAL ===== */
.calendar-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.calendar-popup-card {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  font-family: var(--font-sans);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.calendar-nav-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
}

.calendar-nav-btn svg {
  width: 16px;
  height: 16px;
}

.calendar-month-year {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 12px;
}

.calendar-weekdays span {
  font-size: 11px;
  font-weight: 600;
  color: #494a4a;
}

.calendar-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  text-align: center;
}

.calendar-day {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-day:not(.empty):hover {
  background-color: #f1f5f9;
}

.calendar-day.active-day {
  background-color: #194E9E;
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(25, 78, 158, 0.3);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
