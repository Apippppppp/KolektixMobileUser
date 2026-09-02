<script setup>
import { ref, nextTick, computed, onMounted } from 'vue';

const props = defineProps({
  initialChatId: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['room-toggle']);

const activeChat = ref(null);
const activeFilter = ref('Semua');
const newMessageText = ref('');
const isTyping = ref(false);
const chatMessagesContainer = ref(null);
const imageInputRef = ref(null);
const docInputRef = ref(null);

const isCallActive = ref(false);
const callStatusText = ref('Memanggil...');
const callDurationSeconds = ref(0);
const isMuted = ref(false);
const isSpeakerOn = ref(false);
let callTimerInterval = null;
let callConnectTimeout = null;

const filterOptions = ['Semua', 'Belum Dibaca', 'Event', 'Komunitas'];

const chats = ref([
  {
    id: 1,
    name: 'Burakku Official',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    status: 'Online',
    isVerified: true,
    category: 'Event',
    lastMessage: 'Permisi kak, untuk merch Coldplay ready size L dan XL ya! 😊',
    lastTime: '18.45',
    unread: 2,
    isPinned: true,
    messages: [
      { id: 101, text: 'Halo Afif! Selamat datang di official store Burakku.', time: '18.40', sender: 'them', status: 'read' },
      { id: 102, text: 'Ada yang bisa kami bantu mengenai Merchandise Coldplay atau Tiket Event?', time: '18.42', sender: 'them', status: 'read' },
      { id: 103, text: 'Halo kak, mau tanya t-shirt oversized Coldplay ready warna apa aja ya?', time: '18.44', sender: 'me', status: 'read' },
      { id: 104, text: 'Permisi kak, untuk merch Coldplay ready size L dan XL ya! 😊', time: '18.45', sender: 'them', status: 'unread' },
      { id: 105, file: { name: 'e-ticket_coldplay_vip.pdf', size: '2.4 MB' }, time: '18.46', sender: 'them', status: 'read' },
      { id: 106, file: { name: 'rundown_concert_soundrenaline.docx', size: '850 KB' }, time: '18.47', sender: 'them', status: 'read' },
      { id: 107, file: { name: 'audio_rehearsal_sheilaon7.mp3', size: '4.1 MB' }, time: '18.48', sender: 'me', status: 'read' },
      { id: 108, file: { name: 'teaser_video_pestapora.mp4', size: '12.8 MB' }, time: '18.49', sender: 'me', status: 'read' }
    ]
  },
  {
    id: 2,
    name: 'Maxpaincompany LTD',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    status: 'Aktif 15 menit lalu',
    isVerified: true,
    category: 'Event',
    lastMessage: 'E-Ticket Ngamen 0.5 kamu sudah dikonfirmasi. Sampai jumpa di lokasi!',
    lastTime: '15.30',
    unread: 0,
    isPinned: false,
    messages: [
      { id: 201, text: 'Halo, konfirmasi pembayaran pesanan #TKX-99823 telah kami terima.', time: '15.28', sender: 'them', status: 'read' },
      { id: 202, text: 'E-Ticket Ngamen 0.5 kamu sudah dikonfirmasi. Sampai jumpa di lokasi!', time: '15.30', sender: 'them', status: 'read' },
      { id: 203, text: 'Baik kak, terima kasih banyak!', time: '15.32', sender: 'me', status: 'read' }
    ]
  },
  {
    id: 3,
    name: 'Komunitas Music Enthusiasts 🎸',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80',
    status: 'Rian, Nadin Amizah, Budi...',
    isVerified: false,
    category: 'Komunitas',
    lastMessage: 'Rian: Siapa yang berangkat ke Soundrenaline dari Jakarta Selatan?',
    lastTime: '12.15',
    unread: 5,
    isPinned: false,
    messages: [
      { id: 301, text: 'Budi: Ada yang punya rundown konser hari ke-2?', time: '11.45', sender: 'them', senderName: 'Budi', status: 'read' },
      { id: 302, text: 'Rian: Siapa yang berangkat ke Soundrenaline dari Jakarta Selatan?', time: '12.15', sender: 'them', senderName: 'Rian', status: 'read' }
    ]
  },
  {
    id: 4,
    name: 'Customer Support Kolektix',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    status: 'Online',
    isVerified: true,
    category: 'Event',
    lastMessage: 'Halo Afif, pengembalian dana tiket #TKX-882194 berhasil diproses.',
    lastTime: 'Kemarin',
    unread: 0,
    isPinned: false,
    messages: [
      { id: 401, text: 'Halo Afif, pengembalian dana tiket #TKX-882194 berhasil diproses.', time: 'Kemarin 14.10', sender: 'them', status: 'read' },
      { id: 402, text: 'Dana akan masuk ke rekening Anda dalam 1x24 jam. Terima kasih!', time: 'Kemarin 14.11', sender: 'them', status: 'read' }
    ]
  },
  {
    id: 5,
    name: 'Nadin Amizah Music',
    avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=120&q=80',
    status: 'Online',
    isVerified: true,
    category: 'Event',
    lastMessage: 'Terima kasih sudah membeli tiket Intimate Show! Sampai ketemu ya ❤️',
    lastTime: '25/08/24',
    unread: 0,
    isPinned: false,
    messages: [
      { id: 501, text: 'Terima kasih sudah membeli tiket Intimate Show! Sampai ketemu ya ❤️', time: '25/08/24', sender: 'them', status: 'read' }
    ]
  },
  {
    id: 6,
    name: 'Sheila on 7 Management',
    avatar: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=120&q=80',
    status: 'Online',
    isVerified: true,
    category: 'Event',
    lastMessage: 'Penukaran wristband Tunggu Aku Di Jakarta dibuka mulai pukul 10.00 WIB.',
    lastTime: '24/08/24',
    unread: 1,
    isPinned: false,
    messages: [
      { id: 601, text: 'Penukaran wristband Tunggu Aku Di Jakarta dibuka mulai pukul 10.00 WIB.', time: '24/08/24', sender: 'them', status: 'unread' }
    ]
  },
  {
    id: 7,
    name: 'Prambanan Jazz Festival 2024',
    avatar: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=120&q=80',
    status: 'Aktif kemarin',
    isVerified: true,
    category: 'Event',
    lastMessage: 'Voucher makanan booth Prambanan Jazz sudah aktif di dompet event kamu!',
    lastTime: '22/08/24',
    unread: 0,
    isPinned: false,
    messages: [
      { id: 701, text: 'Voucher makanan booth Prambanan Jazz sudah aktif di dompet event kamu!', time: '22/08/24', sender: 'them', status: 'read' }
    ]
  },
  {
    id: 8,
    name: 'Coldplay Spheres Crew',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80',
    status: 'Online',
    isVerified: true,
    category: 'Event',
    lastMessage: 'Informasi Gate Entrance & Shuttle Bus GBK Senayan.',
    lastTime: '20/08/24',
    unread: 0,
    isPinned: false,
    messages: [
      { id: 801, text: 'Informasi Gate Entrance & Shuttle Bus GBK Senayan.', time: '20/08/24', sender: 'them', status: 'read' }
    ]
  },
  {
    id: 9,
    name: 'Komunitas Festhead Indonesia',
    avatar: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=120&q=80',
    status: 'Doni, Maya, Rizky...',
    isVerified: false,
    category: 'Komunitas',
    lastMessage: 'Doni: Ada promo tiket presale 3 Soundrenaline gak ya?',
    lastTime: '18/08/24',
    unread: 0,
    isPinned: false,
    messages: [
      { id: 901, text: 'Doni: Ada promo tiket presale 3 Soundrenaline gak ya?', time: '18/08/24', sender: 'them', senderName: 'Doni', status: 'read' }
    ]
  },
  {
    id: 10,
    name: 'Pesta Pora Official Store',
    avatar: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=120&q=80',
    status: 'Online',
    isVerified: true,
    category: 'Event',
    lastMessage: 'Snapback Cap Pesta Pora edisi terbatas siap dikirim hari ini!',
    lastTime: '15/08/24',
    unread: 0,
    isPinned: false,
    messages: [
      { id: 1001, text: 'Snapback Cap Pesta Pora edisi terbatas siap dikirim hari ini!', time: '15/08/24', sender: 'them', status: 'read' }
    ]
  }
]);

const filteredChats = computed(() => {
  return chats.value.filter(chat => {
    if (activeFilter.value === 'Belum Dibaca') return chat.unread > 0;
    if (activeFilter.value === 'Event') return chat.category === 'Event';
    if (activeFilter.value === 'Komunitas') return chat.category === 'Komunitas';
    return true;
  });
});

const openChatRoom = (chat) => {
  activeChat.value = chat;
  chat.unread = 0;
  document.body.classList.add('chat-room-open');
  emit('room-toggle', true);
  scrollToBottom();
};

const closeChatRoom = () => {
  activeChat.value = null;
  document.body.classList.remove('chat-room-open');
  emit('room-toggle', false);
};

onMounted(() => {
  if (props.initialChatId) {
    const targetChat = chats.value.find(c => c.id === props.initialChatId || c.name.toLowerCase().includes(String(props.initialChatId).toLowerCase()));
    if (targetChat) {
      openChatRoom(targetChat);
    } else if (chats.value.length > 1) {
      openChatRoom(chats.value[1]); // Default Maxpaincompany LTD
    }
  }
});

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesContainer.value) {
      chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight;
    }
  });
};

const sendMessage = () => {
  if (!newMessageText.value.trim() || !activeChat.value) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
  
  const userMsg = {
    id: Date.now(),
    text: newMessageText.value,
    time: timeStr,
    sender: 'me',
    status: 'read'
  };

  activeChat.value.messages.push(userMsg);
  activeChat.value.lastMessage = `Anda: ${userMsg.text}`;
  activeChat.value.lastTime = timeStr;
  
  const textToSend = newMessageText.value;
  newMessageText.value = '';
  scrollToBottom();

  isTyping.value = true;
  setTimeout(() => {
    isTyping.value = false;
    let replyText = 'Terima kasih pesannya! Tim kami akan segera menanggapi pertanyaan Anda 🙏';
    if (textToSend.toLowerCase().includes('harga') || textToSend.toLowerCase().includes('size') || textToSend.toLowerCase().includes('merch')) {
      replyText = 'Siap kak! Produk merchandise resmi kami dijamin 100% original & kualitas terbaik ✨';
    } else if (textToSend.toLowerCase().includes('tiket') || textToSend.toLowerCase().includes('event')) {
      replyText = 'Sip! Untuk tiket event dapat ditukarkan di booth registrasi saat hari H ya 👍';
    }

    const replyMsg = {
      id: Date.now() + 1,
      text: replyText,
      time: `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`,
      sender: 'them',
      status: 'read'
    };

    if (activeChat.value) {
      activeChat.value.messages.push(replyMsg);
      activeChat.value.lastMessage = replyMsg.text;
      activeChat.value.lastTime = replyMsg.time;
      scrollToBottom();
    }
  }, 1200);
};

const triggerImageSelect = () => {
  if (imageInputRef.value) imageInputRef.value.click();
};

const triggerDocSelect = () => {
  if (docInputRef.value) docInputRef.value.click();
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file || !activeChat.value) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
    
    const imageMsg = {
      id: Date.now(),
      text: '',
      image: e.target.result,
      time: timeStr,
      sender: 'me',
      status: 'read'
    };

    activeChat.value.messages.push(imageMsg);
    activeChat.value.lastMessage = '📷 Foto';
    activeChat.value.lastTime = timeStr;
    scrollToBottom();

    isTyping.value = true;
    setTimeout(() => {
      isTyping.value = false;
      const replyMsg = {
        id: Date.now() + 1,
        text: 'Wah keren fotonya kak! Ada yang bisa kami bantu lagi? 😊',
        time: timeStr,
        sender: 'them',
        status: 'read'
      };
      if (activeChat.value) {
        activeChat.value.messages.push(replyMsg);
        activeChat.value.lastMessage = replyMsg.text;
        activeChat.value.lastTime = replyMsg.time;
        scrollToBottom();
      }
    }, 1200);
  };
  reader.readAsDataURL(file);
};

const handleDocUpload = (event) => {
  const file = event.target.files[0];
  if (!file || !activeChat.value) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
  const fileSizeStr = `${(file.size / 1024).toFixed(1)} KB`;

  const docMsg = {
    id: Date.now(),
    text: '',
    file: {
      name: file.name,
      size: fileSizeStr
    },
    time: timeStr,
    sender: 'me',
    status: 'read'
  };

  activeChat.value.messages.push(docMsg);
  activeChat.value.lastMessage = `📄 ${file.name}`;
  activeChat.value.lastTime = timeStr;
  scrollToBottom();

  isTyping.value = true;
  setTimeout(() => {
    isTyping.value = false;
    const replyMsg = {
      id: Date.now() + 1,
      text: `Dokumen "${file.name}" telah kami terima. Terima kasih kak! 🙏`,
      time: timeStr,
      sender: 'them',
      status: 'read'
    };
    if (activeChat.value) {
      activeChat.value.messages.push(replyMsg);
      activeChat.value.lastMessage = replyMsg.text;
      activeChat.value.lastTime = replyMsg.time;
      scrollToBottom();
    }
  }, 1200);
};

const getFileTypeInfo = (filename) => {
  if (!filename) return { ext: 'FILE', color: '#194e9e' };
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return { ext: 'PDF', color: '#ef4444' };
  if (['doc', 'docx'].includes(ext)) return { ext: 'DOCX', color: '#2563eb' };
  if (['mp3', 'wav', 'aac', 'flac'].includes(ext)) return { ext: 'MP3', color: '#10b981' };
  if (['mp4', 'mkv', 'mov', 'avi'].includes(ext)) return { ext: 'MP4', color: '#8b5cf6' };
  if (['xls', 'xlsx'].includes(ext)) return { ext: 'XLSX', color: '#059669' };
  if (['zip', 'rar', '7z'].includes(ext)) return { ext: 'ZIP', color: '#f59e0b' };
  return { ext: ext.toUpperCase(), color: '#194e9e' };
};

const formatCallTime = (totalSec) => {
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const startVoiceCall = () => {
  if (!activeChat.value) return;
  isCallActive.value = true;
  callStatusText.value = 'Memanggil...';
  callDurationSeconds.value = 0;
  isMuted.value = false;
  isSpeakerOn.value = false;

  callConnectTimeout = setTimeout(() => {
    callStatusText.value = 'Terhubung 00:00';
    callTimerInterval = setInterval(() => {
      callDurationSeconds.value++;
      callStatusText.value = `Terhubung ${formatCallTime(callDurationSeconds.value)}`;
    }, 1000);
  }, 2000);
};

const endVoiceCall = () => {
  clearTimeout(callConnectTimeout);
  clearInterval(callTimerInterval);

  const durationFormatted = callDurationSeconds.value > 0 ? formatCallTime(callDurationSeconds.value) : '';
  const callEndText = durationFormatted ? `Panggilan Suara (${durationFormatted})` : 'Panggilan Tidak Terjawab';

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;

  if (activeChat.value) {
    activeChat.value.messages.push({
      id: Date.now(),
      text: `📞 ${callEndText}`,
      time: timeStr,
      sender: 'me',
      status: 'read'
    });
    activeChat.value.lastMessage = `📞 ${callEndText}`;
    activeChat.value.lastTime = timeStr;
    scrollToBottom();
  }

  isCallActive.value = false;
};
</script>

<template>
  <div class="kolektix-chat-container">
    <!-- VIEW 1: CHAT LIST VIEW -->
    <div v-if="!activeChat" class="chat-list-view">
      <!-- Filter Chips Bar Header -->
      <div class="filter-chips-header">
        <div class="filter-chips-row">
          <button 
            v-for="filter in filterOptions" 
            :key="filter"
            class="filter-chip-btn"
            :class="{ active: activeFilter === filter }"
            @click="activeFilter = filter"
          >
            {{ filter }}
          </button>
        </div>
      </div>

      <!-- Chat Items List -->
      <div class="chat-list-body">
        <div 
          v-for="chat in filteredChats" 
          :key="chat.id" 
          class="chat-row-card"
          @click="openChatRoom(chat)"
        >
          <div class="avatar-container">
            <img :src="chat.avatar" :alt="chat.name" class="avatar-img" />
            <span v-if="chat.status === 'Online'" class="status-online-dot"></span>
          </div>

          <div class="chat-details">
            <div class="chat-card-header">
              <div class="name-badge-group">
                <h3 class="contact-name">{{ chat.name }}</h3>
                <svg v-if="chat.isVerified" viewBox="0 0 24 24" fill="#194e9e" class="verified-icon">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <span class="chat-timestamp" :class="{ highlight: chat.unread > 0 }">{{ chat.lastTime }}</span>
            </div>

            <div class="chat-card-footer">
              <div class="snippet-with-check">
                <svg v-if="chat.unread === 0" viewBox="0 0 24 24" fill="#194e9e" class="read-check-svg">
                  <path d="M0.41,13.41L6,19L7.41,17.58L1.83,12L0.41,13.41M22.24,5.58L11.66,16.17L7.5,12L6.08,13.41L11.66,19L23.66,7L22.24,5.58M18,7L16.59,5.58L10.25,11.93L11.66,13.34L18,7Z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="#94a3b8" class="unread-check-svg">
                  <path d="M0.41,13.41L6,19L7.41,17.58L1.83,12L0.41,13.41M22.24,5.58L11.66,16.17L7.5,12L6.08,13.41L11.66,19L23.66,7L22.24,5.58M18,7L16.59,5.58L10.25,11.93L11.66,13.34L18,7Z"/>
                </svg>
                <p class="last-msg-snippet">{{ chat.lastMessage }}</p>
              </div>
              <div class="chat-side-meta">
                <svg v-if="chat.isPinned" viewBox="0 0 24 24" fill="#194e9e" class="pin-icon">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                </svg>
                <span v-if="chat.unread > 0" class="unread-pill">{{ chat.unread }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredChats.length === 0" class="empty-chat-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" class="empty-icon">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>Tidak ada pesan yang cocok</p>
        </div>
      </div>
    </div>

    <!-- VIEW 2: ACTIVE CONVERSATION ROOM WITH SMOOTH SLIDE TRANSITION -->
    <transition name="chat-room-slide">
      <div v-if="activeChat" class="chat-room-container">
        <!-- Conversation Header -->
        <header class="room-top-bar">
          <button class="back-btn" @click="closeChatRoom">
            <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.2" class="back-icon">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="contact-header-info" @click="closeChatRoom">
            <img :src="activeChat.avatar" :alt="activeChat.name" class="header-avatar" />
            <div class="contact-titles">
              <div class="title-verified-row">
                <h2 class="contact-title-name">{{ activeChat.name }}</h2>
                <svg v-if="activeChat.isVerified" viewBox="0 0 24 24" fill="#194e9e" class="verified-icon-small">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <span class="online-status-text">{{ isTyping ? 'Sedang mengetik...' : activeChat.status }}</span>
            </div>
          </div>

          <div class="header-action-buttons">
            <button class="room-icon-btn" title="Panggilan Suara" @click="startVoiceCall">
              <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2" class="room-svg">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </button>
          </div>
        </header>

        <!-- Messages Stream with Authentic Wallpaper Pattern -->
        <div class="messages-wall" ref="chatMessagesContainer">
          <div class="date-divider">
            <span>Hari Ini</span>
          </div>

          <div 
            v-for="msg in activeChat.messages" 
            :key="msg.id" 
            class="msg-row"
            :class="{ 'sent-by-me': msg.sender === 'me', 'received-by-them': msg.sender === 'them' }"
          >
            <div class="msg-bubble">
              <span v-if="msg.senderName" class="group-sender-title">{{ msg.senderName }}</span>
              
              <!-- Sent/Received Image Preview -->
              <img v-if="msg.image" :src="msg.image" class="chat-msg-img" />

              <!-- Sent/Received File Document Preview -->
              <div v-if="msg.file" class="chat-msg-file">
                <div class="file-ext-badge" :style="{ backgroundColor: getFileTypeInfo(msg.file.name).color }">
                  <span>{{ getFileTypeInfo(msg.file.name).ext }}</span>
                </div>
                <div class="file-info-group">
                  <span class="file-name">{{ msg.file.name }}</span>
                  <span class="file-size">{{ msg.file.size }}</span>
                </div>
              </div>

              <p v-if="msg.text" class="msg-text">{{ msg.text }}</p>
              <div class="msg-time-status">
                <span class="msg-time">{{ msg.time }}</span>
                <svg v-if="msg.sender === 'me'" viewBox="0 0 24 24" fill="#194e9e" class="read-check-icon">
                  <path d="M0.41,13.41L6,19L7.41,17.58L1.83,12L0.41,13.41M22.24,5.58L11.66,16.17L7.5,12L6.08,13.41L11.66,19L23.66,7L22.24,5.58M18,7L16.59,5.58L10.25,11.93L11.66,13.34L18,7Z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Typing Dots Animation -->
          <div v-if="isTyping" class="msg-row received-by-them">
            <div class="msg-bubble typing-bubble">
              <span class="pulse-dot"></span>
              <span class="pulse-dot"></span>
              <span class="pulse-dot"></span>
            </div>
          </div>
        </div>

        <!-- Bottom Chat Input Bar -->
        <div class="chat-bottom-input-bar">
          <!-- Hidden File Inputs -->
          <input type="file" ref="imageInputRef" accept="image/*" capture="environment" class="hidden-file-input" @change="handleImageUpload" />
          <input type="file" ref="docInputRef" accept="*/*" class="hidden-file-input" @change="handleDocUpload" />

          <!-- Plus (+) Attachment Button for Files/Documents -->
          <button class="attach-plus-btn" title="Tambah Dokumen / Berkas" @click="triggerDocSelect">
            <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.5" class="plus-icon-svg">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <div class="input-field-wrapper">
            <input 
              type="text" 
              v-model="newMessageText" 
              placeholder="Ketik pesan..." 
              class="chat-text-input"
              @keyup.enter="sendMessage"
            />

            <!-- Camera Icon Button for Direct Camera -->
            <button class="camera-action-btn" title="Ambil Foto Kamera" @click="triggerImageSelect">
              <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2" class="camera-icon-svg">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>
          </div>

          <button class="send-action-btn" @click="sendMessage">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" class="send-icon-svg">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- VOICE CALL FULLSCREEN OVERLAY -->
    <transition name="chat-room-slide">
      <div v-if="isCallActive && activeChat" class="voice-call-overlay">
        <div class="call-card-content">
          <!-- Pulsing Ripple Avatar -->
          <div class="call-avatar-wrapper">
            <div class="pulse-ring ring-1"></div>
            <div class="pulse-ring ring-2"></div>
            <img :src="activeChat.avatar" :alt="activeChat.name" class="call-avatar-img" />
          </div>

          <h2 class="call-contact-name">{{ activeChat.name }}</h2>
          <p class="call-status-timer">{{ callStatusText }}</p>

          <!-- Call Action Controls -->
          <div class="call-controls-row">
            <button class="call-btn-control" :class="{ active: isMuted }" @click="isMuted = !isMuted" title="Mute Mikrofon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="call-control-svg">
                <line v-if="isMuted" x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>

            <button class="call-btn-control end-call-btn" @click="endVoiceCall" title="Tutup Panggilan">
              <svg viewBox="0 0 24 24" fill="#ffffff" class="end-call-svg">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 0 1 0-1.41C2.98 8.78 6.94 7 12 7c5.06 0 9.02 1.78 11.71 4.67.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
              </svg>
            </button>

            <button class="call-btn-control" :class="{ active: isSpeakerOn }" @click="isSpeakerOn = !isSpeakerOn" title="Speaker">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="call-control-svg">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.kolektix-chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
  position: relative;
}

/* ===== CHAT LIST VIEW ===== */
.chat-list-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #ffffff;
}

.filter-chips-header {
  background-color: #ffffff;
  padding: 10px 16px 8px 16px;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 5;
}

.filter-chips-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.filter-chip-btn {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-chip-btn.active {
  background-color: #194e9e;
  color: #ffffff;
  border-color: #194e9e;
  font-weight: 600;
}

.chat-list-body {
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

.chat-row-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f8fafc;
}

.chat-row-card:hover {
  background-color: #f8fafc;
}

.avatar-container {
  position: relative;
  margin-right: 12px;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #f1f5f9;
}

.status-online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background-color: #22c55e;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.chat-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.chat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name-badge-group {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.contact-name {
  font-size: 14.5px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verified-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.chat-timestamp {
  font-size: 11px;
  color: #94a3b8;
  flex-shrink: 0;
}

.chat-timestamp.highlight {
  color: #194e9e;
  font-weight: 600;
}

.chat-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.snippet-with-check {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.read-check-svg {
  width: 14px;
  height: 14px;
  fill: #194e9e;
  flex-shrink: 0;
}

.unread-check-svg {
  width: 14px;
  height: 14px;
  fill: #94a3b8;
  flex-shrink: 0;
}

.last-msg-snippet {
  font-size: 12.5px;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 210px;
}

.chat-side-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pin-icon {
  width: 14px;
  height: 14px;
}

.unread-pill {
  background-color: #194e9e;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.empty-chat-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
}

/* ===== ACTIVE CHAT CONVERSATION ROOM ===== */
.chat-room-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  max-width: 100%;
  background-color: #f5faff;
  overflow: hidden;
  touch-action: pan-y;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

/* Smooth Slide Transition for Chat Room */
.chat-room-slide-enter-active,
.chat-room-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.chat-room-slide-enter-from,
.chat-room-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.room-top-bar {
  background-color: #ffffff;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  z-index: 10;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
}

.back-icon {
  width: 22px;
  height: 22px;
}

.contact-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.header-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #f1f5f9;
}

.contact-titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title-verified-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.contact-title-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verified-icon-small {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.online-status-text {
  font-size: 11px;
  color: #194e9e;
  font-weight: 500;
}

.header-action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.room-icon-btn {
  background-color: #f0f6ff;
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.room-svg {
  width: 16px;
  height: 16px;
}

/* Messages Wall with Kolektix Theme Wallpaper Pattern */
.messages-wall {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px 16px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  touch-action: pan-y;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  background-color: #f5faff;
  background-image: radial-gradient(rgba(25, 78, 158, 0.12) 1.2px, transparent 1.2px),
                    radial-gradient(rgba(25, 78, 158, 0.12) 1.2px, #f5faff 1.2px);
  background-size: 24px 24px;
  background-position: 0 0, 12px 12px;
}

.date-divider {
  display: flex;
  justify-content: center;
  margin: 6px 0;
}

.date-divider span {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #194e9e;
  font-size: 10.5px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.msg-row {
  display: flex;
  width: 100%;
}

.sent-by-me {
  justify-content: flex-end;
}

.received-by-them {
  justify-content: flex-start;
}

.msg-bubble {
  max-width: 78%;
  padding: 8px 12px 6px 12px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.sent-by-me .msg-bubble {
  background-color: #194e9e;
  color: #ffffff;
  border-bottom-right-radius: 2px;
}

.received-by-them .msg-bubble {
  background-color: #ffffff;
  color: #0f172a;
  border: 1px solid #f1f5f9;
  border-bottom-left-radius: 2px;
}

.group-sender-title {
  font-size: 11px;
  font-weight: 700;
  color: #194e9e;
  margin-bottom: 2px;
  display: block;
}

.msg-text {
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  word-break: break-word;
}

.msg-time-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 3px;
}

.sent-by-me .msg-time {
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.85);
}

.received-by-them .msg-time {
  font-size: 9.5px;
  color: #94a3b8;
}

.read-check-icon {
  width: 13px;
  height: 13px;
  fill: #ffffff;
}

/* Typing Dots */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #194e9e;
  animation: pulseDot 1s infinite alternate;
}

.pulse-dot:nth-child(2) { animation-delay: 0.2s; }
.pulse-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulseDot {
  0% { opacity: 0.3; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}

/* Bottom Chat Input Bar */
.hidden-file-input {
  display: none;
}

.chat-bottom-input-bar {
  background-color: #ffffff;
  padding: 10px 12px 14px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #e2e8f0;
  position: relative;
  margin-top: auto;
  flex-shrink: 0;
  width: 100%;
  z-index: 10;
}

.attach-plus-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #f0f6ff;
  border: 1px solid #e0ecfb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.attach-plus-btn:hover {
  background-color: #e2eefe;
}

.plus-icon-svg {
  width: 18px;
  height: 18px;
}

.input-field-wrapper {
  flex: 1;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 6px 0 14px;
  height: 38px;
}

.chat-text-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #0f172a;
  font-size: 13px;
}

.chat-text-input::placeholder {
  color: #94a3b8;
}

.camera-action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.camera-action-btn:hover {
  background-color: rgba(25, 78, 158, 0.08);
}

.camera-icon-svg {
  width: 19px;
  height: 19px;
}

/* Chat Image & Document Messages */
.chat-msg-img {
  max-width: 100%;
  max-height: 220px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  margin-bottom: 4px;
}

.chat-msg-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.sent-by-me .chat-msg-file {
  background-color: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.received-by-them .chat-msg-file {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.file-ext-badge {
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.file-info-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sent-by-me .file-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #ffffff !important;
  word-break: break-all;
}

.sent-by-me .file-size {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.85) !important;
}

.received-by-them .file-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #0f172a;
  word-break: break-all;
}

.received-by-them .file-size {
  font-size: 10px;
  color: #64748b;
}

.send-action-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #194e9e;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(25, 78, 158, 0.3);
  transition: transform 0.2s ease;
}

.send-action-btn:active {
  transform: scale(0.92);
}

.send-icon-svg {
  width: 16px;
  height: 16px;
}

/* Voice Call Fullscreen Overlay */
.voice-call-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #194e9e 0%, #0c2d60 100%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  padding: 60px 20px 40px 20px;
}

.call-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
  height: 100%;
  justify-content: space-between;
}

.call-avatar-wrapper {
  position: relative;
  width: 110px;
  height: 110px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.call-avatar-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffffff;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  animation: callPulse 2s infinite ease-out;
}

.ring-1 { width: 100px; height: 100px; animation-delay: 0s; }
.ring-2 { width: 125px; height: 125px; animation-delay: 0.6s; }

@keyframes callPulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.3); opacity: 0; }
}

.call-contact-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px 0;
  text-align: center;
}

.call-status-timer {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 20px;
  font-weight: 500;
}

.call-controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  width: 100%;
  margin-top: auto;
  padding-bottom: 20px;
}

.call-btn-control {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.call-btn-control.active {
  background: #ffffff;
  color: #194e9e;
}

.end-call-btn {
  width: 64px;
  height: 64px;
  background-color: #ef4444;
  border: none;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.end-call-btn:active {
  transform: scale(0.92);
}

.call-control-svg {
  width: 22px;
  height: 22px;
}

.end-call-svg {
  width: 28px;
  height: 28px;
}
</style>
