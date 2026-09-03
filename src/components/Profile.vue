<script setup>
import { ref } from 'vue';

const props = defineProps({
  currentLanguage: {
    type: String,
    default: 'ID'
  }
});

const emit = defineEmits(['logout', 'navigate-transaksi', 'toggle-language']);

const user = ref({
  name: 'Afif Maulana Yusuf',
  email: 'afif.maulana@kolektix.id',
  phone: '+62 812-3456-7890',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
});

const menuGroups = [
  {
    title: 'Akun Saya',
    items: [
      { id: 'tiket', icon: 'ticket', label: 'Tiket Saya', badge: '4 Tiket', action: 'tickets' },
      { id: 'transaksi', icon: 'receipt', label: 'Riwayat Transaksi', action: 'transaksi' },
      { id: 'favorit', icon: 'heart', label: 'Event Favorit Saya', badge: '8 Event', action: 'favorites' },
      { id: 'voucher', icon: 'tag', label: 'Voucher', badge: 'New!', badgeColor: 'new' }
    ]
  },
  {
    title: 'Pengaturan & Keamanan',
    items: [
      // { id: 'edit', icon: 'user', label: 'Edit Detail Profil' },
      { id: 'security', icon: 'shield', label: 'Keamanan & Kata Sandi' },
      { id: 'lang', icon: 'lang', label: 'Pilihan Bahasa', isLangToggle: true }
    ]
  },
  {
    title: 'Informasi & Bantuan',
    items: [
      { id: 'help', icon: 'help', label: 'Pusat Bantuan (FAQ)' },
      { id: 'contact', icon: 'mail', label: 'Hubungi Customer Care' },
      { id: 'terms', icon: 'file', label: 'Syarat & Ketentuan' },
      { id: 'privacy', icon: 'shield', label: 'Kebijakan Privasi' }
    ]
  }
];

const handleItemClick = (item) => {
  if (item.action === 'transaksi') {
    emit('navigate-transaksi');
  } else if (item.isLangToggle) {
    emit('toggle-language');
  }
};
</script>

<template>
  <div class="profile-container">
    <!-- User Profile Header (Left-aligned, Compact & Slender Layout) -->
    <div class="profile-header-block">
      <div class="profile-header-left">
        <div class="avatar-wrapper">
          <img :src="user.avatar" :alt="user.name" class="profile-avatar" />
          <span class="verified-badge-icon" title="Akun Terverifikasi">
            <svg viewBox="0 0 24 24" fill="#194e9e" class="check-svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
        </div>

        <div class="user-text-details">
          <h2 class="user-display-name">{{ user.name }}</h2>
          <span class="user-contact-info">{{ user.email }}</span>
        </div>
      </div>

      <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2" class="chevron-icon"><polyline points="9 18 15 12 9 6"/></svg>
    </div>

    <!-- Thin Section Divider Line -->
    <div class="section-divider-line"></div>

    <!-- Menu Sections List -->
    <div class="profile-menu-list">
      <div v-for="(group, gIdx) in menuGroups" :key="gIdx" class="menu-group-section">
        <h3 class="menu-group-title">{{ group.title }}</h3>
        
        <div class="group-items-container">
          <div 
            v-for="(item, iIdx) in group.items" 
            :key="iIdx" 
            class="menu-item-row"
            @click="handleItemClick(item)"
          >
            <div class="item-left">
              <div class="item-icon-box">
                <!-- Ticket Icon -->
                <svg v-if="item.icon === 'ticket'" viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="menu-svg-icon">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
                  <path d="M12 9v6" stroke-dasharray="2 2"/>
                </svg>
                <!-- Receipt / Transaction History Icon -->
                <svg v-else-if="item.icon === 'receipt'" viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="menu-svg-icon">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
                  <path d="M8 8h8M8 12h8M8 16h5"/>
                </svg>
                <!-- Heart / Favorite Icon -->
                <svg v-else-if="item.icon === 'heart'" viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="menu-svg-icon">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <!-- Promo Tag Icon -->
                <svg v-else-if="item.icon === 'tag'" viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="menu-svg-icon">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <!-- User Detail Icon -->
                <svg v-else-if="item.icon === 'user'" viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="menu-svg-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <!-- Shield Security Icon -->
                <svg v-else-if="item.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="menu-svg-icon">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <!-- Language Flag Icon -->
                <template v-else-if="item.icon === 'lang'">
                  <svg v-if="currentLanguage === 'ID'" viewBox="0 0 24 24" class="menu-flag-icon" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="12" fill="#F1F5F9"/>
                    <g clip-path="url(#id-flag-clip-profile)">
                      <rect width="24" height="12" fill="#E70011"/>
                      <rect y="12" width="24" height="12" fill="#FFFFFF"/>
                    </g>
                    <defs>
                      <clipPath id="id-flag-clip-profile">
                        <circle cx="12" cy="12" r="11"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" class="menu-flag-icon" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" fill="#00247D"/>
                    <clipPath id="uk-flag-clip-profile">
                      <circle cx="12" cy="12" r="11"/>
                    </clipPath>
                    <g clip-path="url(#uk-flag-clip-profile)">
                      <path d="M0 0L24 24M24 0L0 24" stroke="#FFFFFF" stroke-width="4"/>
                      <path d="M0 0L24 24M24 0L0 24" stroke="#CF142B" stroke-width="2.5"/>
                      <path d="M12 0V24M0 12H24" stroke="#FFFFFF" stroke-width="6"/>
                      <path d="M12 0V24M0 12H24" stroke="#CF142B" stroke-width="3.5"/>
                    </g>
                  </svg>
                </template>
                <!-- Help FAQ Icon -->
                <svg v-else-if="item.icon === 'help'" viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="menu-svg-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <!-- Customer Care Mail Icon -->
                <svg v-else-if="item.icon === 'mail'" viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="menu-svg-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <!-- File Terms Icon -->
                <svg v-else-if="item.icon === 'file'" viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="menu-svg-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="1.8" class="menu-svg-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>

              <span class="menu-item-label">{{ item.label }}</span>
            </div>

            <div class="item-right">
              <span v-if="item.badge" class="item-badge" :class="item.badgeColor">{{ item.badge }}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2" class="chevron-icon"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Plain, Borderless, Left-aligned Logout Button -->
      <button class="profile-logout-btn" @click="emit('logout')" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logout-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span>Keluar dari Akun</span>
      </button>

      <span class="app-version-text">Kolektix User App v2.4.0</span>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  padding: 8px 16px 140px 16px;
  background-color: #ffffff;
  min-height: 100%;
}

/* Left-aligned & Compact Profile Header Block */
.profile-header-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 12px 0;
  background: transparent;
}

.profile-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #e2e8f0;
}

.verified-badge-icon {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.check-svg {
  width: 15px;
  height: 15px;
}

.user-text-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-display-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  text-transform: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-contact-info {
  font-size: 12px;
  color: #64748b;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-profile-pill-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #194e9e;
  padding: 6px 14px;
  border-radius: 18px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.edit-profile-pill-btn:hover {
  background-color: #f1f5f9;
}

.edit-icon {
  width: 13px;
  height: 13px;
}

.section-divider-line {
  height: 2px;
  background-color: #cbd5e1;
  width: 100%;
  margin: 2px 0 8px 0;
}

.profile-menu-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Menu Group Section with thin bottom border divider */
.menu-group-section {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-bottom: 1.5px solid #e2e8f0;
}

.menu-group-section:last-of-type {
  border-bottom: none;
}

.menu-group-title {
  font-size: 11px;
  font-weight: 600;
  color: #151416;
  text-transform: none;
  letter-spacing: 0.2px;
  margin: 0 0 4px 0;
}

.group-items-container {
  display: flex;
  flex-direction: column;
}

/* Tighter gap menu-item-row */
.menu-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.menu-item-row:hover {
  opacity: 0.75;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

/* Unbordered item icon box */
.item-icon-box {
  width: 28px;
  height: 28px;
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-svg-icon {
  width: 18px;
  height: 18px;
}

.menu-flag-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.menu-item-label {
  font-size: .875rem;
  line-height: 1.25rem;
  color: #494a4a;
  text-transform: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.item-badge {
  background-color: #eff6ff;
  color: #194e9e;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 50px;
}

/* Sleek Red "New!" Badge */
.item-badge.new {
  background-color: #ef4444;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25);
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: #194e9e;
}

/* Plain, Left-Aligned Logout Button without Card Border */
.profile-logout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  background-color: transparent;
  border: none;
  color: #dc2626;
  padding: 10px 0;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
  margin-top: 8px;
  align-self: flex-start;
}

.profile-logout-btn:hover {
  opacity: 0.8;
}

.logout-icon {
  width: 18px;
  height: 18px;
}

.app-version-text {
  text-align: left;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 14px;
}
</style>

