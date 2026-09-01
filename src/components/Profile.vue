<script setup>
import { ref } from 'vue';

const emit = defineEmits(['logout', 'navigate-transaksi']);

const isDarkMode = ref(false);

const user = ref({
  name: 'Afif Maulana Yusuf',
  username: '@afifmaulana',
  email: 'afif.maulana@kolektix.id',
  phone: '+62 812-3456-7890',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  memberStatus: 'VIP Member',
  kolektifCoin: '10.000',
  saldo: 'Rp 99.000',
  activeTickets: 4,
  favoriteEvents: 8
});

const menuGroups = [
  {
    title: 'Akun & Aktivitas',
    items: [
      { id: 'tiket', icon: 'ticket', label: 'Tiket Saya', badge: '4', action: 'tickets' },
      { id: 'transaksi', icon: 'receipt', label: 'Riwayat Transaksi', action: 'transaksi' },
      { id: 'favorit', icon: 'heart', label: 'Event Favorit Saya', badge: '8', action: 'favorites' },
      { id: 'voucher', icon: 'tag', label: 'Voucher & Promo', badge: '2 Baru', badgeColor: 'green' }
    ]
  },
  {
    title: 'Pengaturan Akun',
    items: [
      { id: 'edit', icon: 'user', label: 'Edit Profil' },
      { id: 'security', icon: 'shield', label: 'Keamanan & PIN Akun' },
      { id: 'notif', icon: 'bell', label: 'Notifikasi' },
      { id: 'theme', icon: 'moon', label: 'Mode Gelap', isToggle: true }
    ]
  },
  {
    title: 'Pusat Bantuan & Kebijakan',
    items: [
      { id: 'help', icon: 'help', label: 'Pusat Bantuan (FAQ)' },
      { id: 'contact', icon: 'mail', label: 'Hubungi Customer Care' },
      { id: 'terms', icon: 'file', label: 'Syarat & Ketentuan' },
      { id: 'privacy', icon: 'lock', label: 'Kebijakan Privasi' }
    ]
  }
];

const handleItemClick = (item) => {
  if (item.action === 'transaksi') {
    emit('navigate-transaksi');
  }
};
</script>

<template>
  <div class="profile-container">
    <!-- Header Banner & User Avatar Card -->
    <div class="profile-header-card">
      <div class="profile-cover-bg"></div>
      
      <div class="profile-main-info">
        <div class="avatar-wrapper">
          <img :src="user.avatar" :alt="user.name" class="profile-avatar" />
          <span class="verified-dot" title="Terverifikasi">
            <svg viewBox="0 0 24 24" fill="currentColor" class="check-svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </span>
        </div>

        <div class="user-text-details">
          <div class="name-status-row">
            <h2 class="user-display-name">{{ user.name }}</h2>
            <span class="member-badge">{{ user.memberStatus }}</span>
          </div>
          <span class="user-handle">{{ user.username }} • {{ user.email }}</span>
        </div>

        <button class="edit-profile-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="edit-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit Profil
        </button>
      </div>

      <!-- Quick Stats & Wallet Card -->
      <div class="profile-stats-card">
        <div class="stat-box">
          <span class="stat-value">{{ user.activeTickets }}</span>
          <span class="stat-label">Tiket Aktif</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-box">
          <span class="stat-value">{{ user.kolektifCoin }}</span>
          <span class="stat-label">Kolektif Coin</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-box">
          <span class="stat-value accent">{{ user.saldo }}</span>
          <span class="stat-label">Saldo Wallet</span>
        </div>
      </div>
    </div>

    <!-- Menu Sections List -->
    <div class="profile-menu-list">
      <div v-for="(group, gIdx) in menuGroups" :key="gIdx" class="menu-group-card">
        <h3 class="menu-group-title">{{ group.title }}</h3>
        
        <div class="group-items-container">
          <div 
            v-for="(item, iIdx) in group.items" 
            :key="iIdx" 
            class="menu-item-row"
            @click="handleItemClick(item)"
          >
            <div class="item-left">
              <!-- Icons -->
              <div class="item-icon-box">
                <svg v-if="item.icon === 'ticket'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="13" y1="5" x2="13" y2="19" stroke-dasharray="2 2"/></svg>
                <svg v-else-if="item.icon === 'receipt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>
                <svg v-else-if="item.icon === 'heart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <svg v-else-if="item.icon === 'tag'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                <svg v-else-if="item.icon === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <svg v-else-if="item.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <svg v-else-if="item.icon === 'bell'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <svg v-else-if="item.icon === 'moon'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                <svg v-else-if="item.icon === 'help'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <svg v-else-if="item.icon === 'mail'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <svg v-else-if="item.icon === 'file'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-svg-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>

              <span class="menu-item-label">{{ item.label }}</span>
            </div>

            <div class="item-right">
              <span v-if="item.badge" class="item-badge" :class="item.badgeColor">{{ item.badge }}</span>
              
              <label v-if="item.isToggle" class="switch-toggle" @click.stop>
                <input type="checkbox" v-model="isDarkMode" />
                <span class="slider-round"></span>
              </label>

              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron-icon"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Logout Button -->
      <button class="profile-logout-btn" @click="emit('logout')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logout-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span>Keluar dari Akun</span>
      </button>

      <span class="app-version-text">Kolektix Apps v2.4.0 • Built with Vue 3</span>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 16px 32px 16px;
  background-color: #f8fafc;
  min-height: 100%;
}

.profile-header-card {
  background-color: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  position: relative;
}

.profile-cover-bg {
  height: 80px;
  background: linear-gradient(135deg, #194e9e 0%, #103672 100%);
}

.profile-main-info {
  padding: 0 16px 16px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -40px;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  width: 76px;
  height: 76px;
  margin-bottom: 10px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.verified-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-svg {
  width: 18px;
  height: 18px;
}

.user-text-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 12px;
}

.name-status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.user-display-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.member-badge {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 50px;
  border: 1px solid #bfdbfe;
}

.user-handle {
  font-size: 11px;
  color: #64748b;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-profile-btn:hover {
  background-color: #e2e8f0;
}

.edit-icon {
  width: 13px;
  height: 13px;
}

.profile-stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #f1f5f9;
  padding: 12px 16px;
  background-color: #fafafa;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.stat-value.accent {
  color: #16a34a;
}

.stat-label {
  font-size: 10px;
  color: #64748b;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background-color: #e2e8f0;
}

.profile-menu-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.menu-group-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 14px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.menu-group-title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px 0;
}

.group-items-container {
  display: flex;
  flex-direction: column;
}

.menu-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.menu-item-row:last-child {
  border-bottom: none;
}

.menu-item-row:hover {
  opacity: 0.8;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon-box {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background-color: #f1f5f9;
  color: #194e9e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-svg-icon {
  width: 16px;
  height: 16px;
}

.menu-item-label {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-badge {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 50px;
}

.item-badge.green {
  background-color: #dcfce7;
  color: #15803d;
}

.chevron-icon {
  width: 14px;
  height: 14px;
  color: #cbd5e1;
}

/* Toggle Switch */
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 20px;
}

.switch-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider-round {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .3s;
  border-radius: 20px;
}

.slider-round:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider-round {
  background-color: #194e9e;
}

input:checked + .slider-round:before {
  transform: translateX(18px);
}

.profile-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.profile-logout-btn:hover {
  background-color: #fee2e2;
}

.logout-icon {
  width: 16px;
  height: 16px;
}

.app-version-text {
  text-align: center;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 4px;
}
</style>
