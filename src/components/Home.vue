<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import Checkin from './Checkin.vue';
import Dashboard from './Dashboard.vue';
import Event from './Event.vue';
import CreateEvent from './CreateEvent.vue';
import EventDetail from './EventDetail.vue';
import Profile from './Profile.vue';
import Transaksi from './Transaksi.vue';
import Explore from './Explore.vue';
import Chat from './Chat.vue';
import { Vue3Lottie } from 'vue3-lottie';

const emit = defineEmits(['logout']);

const searchQuery = ref('');
const activeTab = ref('home');
const selectedEvent = ref(null);

const checkinInitialTab = ref('aktif');
const checkinInitialEvent = ref(null);

// Placeholder typing animation logic
const placeholders = ['Cari event musik...', 'Cari tiket pameran...', 'Cari kreator favorit...', 'Cari The Script...'];
const currentPlaceholder = ref('Cari event...');
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typePlaceholder = () => {
  const currentText = placeholders[textIndex];
  
  if (isDeleting) {
    currentPlaceholder.value = currentText.substring(0, charIndex - 1);
    charIndex--;
  } else {
    currentPlaceholder.value = currentText.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 30 : 80;

  if (!isDeleting && charIndex === currentText.length) {
    typeSpeed = 2500; // Pause at the end before deleting
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % placeholders.length;
    typeSpeed = 500; // Pause before typing the next phrase
  }

  setTimeout(typePlaceholder, typeSpeed);
};

onMounted(() => {
  setTimeout(typePlaceholder, 1000);
});

const isScrolledDown = ref(false);
const isScrolledFromTop = ref(false);
let lastScrollTop = 0;

const handleScroll = (e) => {
  const st = e.target.scrollTop;
  
  isScrolledFromTop.value = st > 100;

  if (st > lastScrollTop && st > 20) {
    // scrolling down
    isScrolledDown.value = true;
  } else if (st < lastScrollTop) {
    // scrolling up
    isScrolledDown.value = false;
  }
  lastScrollTop = st <= 0 ? 0 : st;
};

const handleSwitchTab = (tab, initialTab = 'aktif', initialEvent = null) => {
  activeTab.value = tab;
  checkinInitialTab.value = initialTab;
  checkinInitialEvent.value = initialEvent;
};

// Handles back/done from CreateEvent component
const eventInitialFilter = ref('semua');
const handleCreateEventBack = (intent, newEvent) => {
  if (intent === 'draft') {
    eventInitialFilter.value = 'draf';
    // Add the draft event to the events array
    if (newEvent) {
      events.value.unshift({ ...newEvent, status: 'Draft' });
    }
  } else if (intent === 'publish') {
    eventInitialFilter.value = 'semua';
    // Add the new event to the events array
    if (newEvent) {
      events.value.unshift(newEvent);
    }
  } else {
    eventInitialFilter.value = 'semua';
  }
  activeTab.value = 'event';
};

// Reset scroll position on tab switch to prevent content from starting scrolled down
watch(activeTab, () => {
  const scrollArea = document.querySelector('.content-scroll-area');
  if (scrollArea) {
    scrollArea.scrollTop = 0;
  }
});

const currentSliderIndex = ref(0);
let sliderInterval;

const comingSoonIndex = ref(0);
let comingSoonInterval;

const startSliderInterval = () => {
  if (sliderInterval) clearInterval(sliderInterval);
  sliderInterval = setInterval(() => {
    if (events.value.length > 0) {
      currentSliderIndex.value = (currentSliderIndex.value + 1) % events.value.length;
    }
  }, 3500);
};

const startComingSoonInterval = () => {
  if (comingSoonInterval) clearInterval(comingSoonInterval);
  comingSoonInterval = setInterval(() => {
    if (comingSoonEvents.value.length > 0) {
      comingSoonIndex.value = (comingSoonIndex.value + 1) % comingSoonEvents.value.length;
    }
  }, 3000);
};

const mostPopularIndex = ref(0);
const isTransitioning = ref(true);
let mostPopularInterval;

const mpLoopEvents = computed(() => {
  if (!mostPopularEvents.value || mostPopularEvents.value.length === 0) return [];
  return [...mostPopularEvents.value, mostPopularEvents.value[0]];
});

const nextMostPopular = () => {
  isTransitioning.value = true;
  mostPopularIndex.value++;
};

const handleMpTransitionEnd = () => {
  if (mostPopularIndex.value >= mostPopularEvents.value.length) {
    isTransitioning.value = false;
    mostPopularIndex.value = 0;
  }
};

// Drag / Swipe Logic for Event Paling Laku
const mpStartX = ref(0);
const mpCurrentTranslate = ref(0);
const mpIsDragging = ref(false);

const handleMpDragStart = (e) => {
  mpIsDragging.value = true;
  mpStartX.value = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  if (mostPopularInterval) clearInterval(mostPopularInterval);
};

const handleMpDragMove = (e) => {
  if (!mpIsDragging.value) return;
  const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  mpCurrentTranslate.value = currentX - mpStartX.value;
};

const handleMpDragEnd = () => {
  if (!mpIsDragging.value) return;
  mpIsDragging.value = false;
  
  if (mpCurrentTranslate.value < -40) {
    nextMostPopular();
  } else if (mpCurrentTranslate.value > 40) {
    if (mostPopularIndex.value > 0) {
      isTransitioning.value = true;
      mostPopularIndex.value--;
    } else {
      isTransitioning.value = false;
      mostPopularIndex.value = mostPopularEvents.value.length - 1;
    }
  }
  
  mpCurrentTranslate.value = 0;
  startMostPopularInterval();
};

const startMostPopularInterval = () => {
  if (mostPopularInterval) clearInterval(mostPopularInterval);
  mostPopularInterval = setInterval(() => {
    nextMostPopular();
  }, 3000);
};

// CTA Banner Slider Logic
const ctaSlideIndex = ref(0);
const ctaSlides = ref([
  { id: 1, image: '/media/cta.avif' },
  { id: 2, image: '/media/cta.avif' },
  { id: 3, image: '/media/cta.avif' }
]);
let ctaInterval = null;

const startCtaInterval = () => {
  if (ctaInterval) clearInterval(ctaInterval);
  ctaInterval = setInterval(() => {
    ctaSlideIndex.value = (ctaSlideIndex.value + 1) % ctaSlides.value.length;
  }, 4000);
};

const ctaStartX = ref(0);
const ctaCurrentTranslate = ref(0);
const ctaIsDragging = ref(false);

const handleCtaDragStart = (e) => {
  ctaIsDragging.value = true;
  ctaStartX.value = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  if (ctaInterval) clearInterval(ctaInterval);
};

const handleCtaDragMove = (e) => {
  if (!ctaIsDragging.value) return;
  const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  ctaCurrentTranslate.value = currentX - ctaStartX.value;
};

const handleCtaDragEnd = () => {
  if (!ctaIsDragging.value) return;
  ctaIsDragging.value = false;
  
  if (ctaCurrentTranslate.value < -30) {
    ctaSlideIndex.value = (ctaSlideIndex.value + 1) % ctaSlides.value.length;
  } else if (ctaCurrentTranslate.value > 30) {
    ctaSlideIndex.value = (ctaSlideIndex.value - 1 + ctaSlides.value.length) % ctaSlides.value.length;
  }
  
  ctaCurrentTranslate.value = 0;
  startCtaInterval();
};

const sadAnimation = ref(null);
onMounted(async () => {
  const res = await fetch('/media/sad emotion.json');
  sadAnimation.value = await res.json();
  startSliderInterval();
  startComingSoonInterval();
  startMostPopularInterval();
  startCtaInterval();
});

onUnmounted(() => {
  if (sliderInterval) clearInterval(sliderInterval);
  if (comingSoonInterval) clearInterval(comingSoonInterval);
  if (mostPopularInterval) clearInterval(mostPopularInterval);
  if (ctaInterval) clearInterval(ctaInterval);
});

// Drag / Swipe Logic for Slider
const startX = ref(0);
const currentTranslate = ref(0);
const prevTranslate = ref(0);
const isDragging = ref(false);

const handleDragStart = (x) => {
  isDragging.value = true;
  startX.value = x;
  if (sliderInterval) clearInterval(sliderInterval);
};

const handleDragMove = (x) => {
  if (!isDragging.value) return;
  const currentPosition = x;
  const diff = currentPosition - startX.value;
  currentTranslate.value = prevTranslate.value + diff;
};

const handleDragEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  const movedBy = currentTranslate.value - prevTranslate.value;

  if (movedBy < -50 && currentSliderIndex.value < events.value.length - 1) {
    currentSliderIndex.value += 1;
  } else if (movedBy > 50 && currentSliderIndex.value > 0) {
    currentSliderIndex.value -= 1;
  }

  // Snap back
  currentTranslate.value = 0;
  prevTranslate.value = 0;
  
  startSliderInterval();
};

const handleTouchStart = (e) => handleDragStart(e.touches[0].clientX);
const handleTouchMove = (e) => handleDragMove(e.touches[0].clientX);
const handleTouchEnd = () => handleDragEnd();

const handleMouseDown = (e) => handleDragStart(e.clientX);
const handleMouseMove = (e) => handleDragMove(e.clientX);
const handleMouseUp = () => handleDragEnd();

const isSidebarOpen = ref(false);
const isSaldoOpen = ref(true);
const isEventGroupOpen = ref(true);
const isSearchOpen = ref(true);
const isChatRoomActive = ref(false);

const handleChatRoomToggle = (isOpen) => {
  isChatRoomActive.value = isOpen;
};

const events = ref([
  {
    id: 1,
    title: 'Ngamen 0.5',
    price: 'Rp124.000',
    organizer: 'Maxpaincompany LTD',
    creatorLogo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80',
    location: 'Karawang',
    date: 'Sat, 24 Aug 2024',
    sold: 150,
    total: 200,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    title: 'SIKSAKUBUR - Tiga Dekade Melawan Tunduk',
    price: 'Rp8.000',
    organizer: 'Newhope.inc',
    creatorLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
    location: 'IKJ',
    date: 'Sun, 25 Aug 2024',
    sold: 500,
    total: 1000,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    title: 'Straight Answer 30 Years Of Persistence',
    price: 'Rp85.000',
    organizer: 'Smartex Bomb Records',
    creatorLogo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80',
    location: 'Fatmawati',
    date: 'Sat, 31 Aug 2024',
    sold: 80,
    total: 100,
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    title: 'Intimate Show MORAD',
    price: 'Rp80.000',
    organizer: 'Morad Music Asia',
    creatorLogo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
    location: 'TBA',
    date: 'Wed, 04 Sep 2024',
    sold: 200,
    total: 200,
    status: 'Live',
    isSoldOut: true,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 5,
    title: 'Rooted Relevant Collective',
    price: 'Rp350.000',
    organizer: 'Independent Organizer',
    creatorLogo: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=80&q=80',
    location: 'Jakarta',
    date: 'Fri, 13 Sep 2024',
    sold: 45,
    total: 100,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 6,
    title: 'ROEANG DUARIBU',
    price: 'Rp120.000',
    organizer: 'Creative Hub',
    creatorLogo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
    location: 'Bandung',
    date: 'Sat, 21 Sep 2024',
    sold: 45,
    total: 100,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=400&q=80'
  }
]);

const comingSoonEvents = ref([
  {
    id: 101,
    title: '2024 Junny Tour: (Blanc) in Jakarta',
    price: 'Rp99.000',
    organizer: 'JUNNY Official',
    creatorLogo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
    location: 'FYNE, DKI Jakarta',
    date: '12 Juni 2024',
    status: 'Segera Hadir',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 102,
    title: 'Soundrenaline 2024 - Special Lineup',
    price: 'Rp250.000',
    organizer: 'Ravel Entertainment',
    creatorLogo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80',
    location: 'Ancol, Jakarta',
    date: 'Sat, 12 Oct 2024',
    status: 'Segera Hadir',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 103,
    title: 'Pesta Pora 2024 Fest',
    price: 'Rp175.000',
    organizer: 'Boss Creator',
    creatorLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    location: 'Gambir Expo, Jakarta',
    date: 'Fri, 25 Oct 2024',
    status: 'Segera Hadir',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 104,
    title: 'The Script - Satellites World Tour',
    price: 'Rp650.000',
    organizer: 'Color Asia Live',
    creatorLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
    location: 'ICE BSD, Tangerang',
    date: 'Sun, 14 Feb 2025',
    status: 'Segera Hadir',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'
  }
]);

const selectedCategory = ref(null);
const quickCategories = ref([
  {
    name: 'Musik',
    color: '#ec4899',
    bgColor: '#fce7f3',
    svg: '<path d="M9 18V5l12-2v13M9 9l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
  },
  {
    name: 'Olahraga',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    svg: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H7M14 14.66V17c0 .55.45 1 1 1h2"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>'
  },
  {
    name: 'Seminar',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    svg: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'
  },
  {
    name: 'Religi',
    color: '#10b981',
    bgColor: '#d1fae5',
    svg: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
  },
  {
    name: 'Talkshow',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    svg: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/>'
  },
  {
    name: 'Fashion',
    color: '#f43f5e',
    bgColor: '#ffe4e6',
    svg: '<path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>'
  },
  {
    name: 'Wisata',
    color: '#06b6d4',
    bgColor: '#cffafe',
    svg: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'
  }
]);

const popularEvents = ref([
  {
    id: 201,
    title: 'Ngepop Bareng Nadin Amizah',
    price: 'Rp150.000',
    organizer: 'Nadin Amizah Music',
    creatorLogo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
    location: 'Senayan, Jakarta',
    date: 'Sun, 15 Sep 2024',
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 202,
    title: 'Java Jazz Festival 2024',
    price: 'Rp450.000',
    organizer: 'Java Festival Production',
    creatorLogo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80',
    location: 'JIExpo Kemayoran',
    date: 'Fri, 20 Sep 2024',
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 203,
    title: 'Festivibes All Gen 2024',
    price: 'Rp75.000',
    organizer: 'KVIBES.ID',
    creatorLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    location: 'Mall Taman Anggrek',
    date: 'Sat, 28 Sep 2024',
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'
  }
]);

const creators = ref([
  {
    id: 1,
    name: 'Ravel Entertainment',
    followers: '128.5K',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    isFollowing: false
  },
  {
    id: 2,
    name: 'Boss Creator',
    followers: '89.2K',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    isFollowing: false
  },
  {
    id: 3,
    name: 'Newhope.inc',
    followers: '45.8K',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    isFollowing: false
  },
  {
    id: 4,
    name: 'Creative Hub ID',
    followers: '32.1K',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    isFollowing: false
  }
]);

const toggleFollow = (creator) => {
  creator.isFollowing = !creator.isFollowing;
};

const mostPopularEvents = ref([
  {
    id: 301,
    title: 'Coldplay Music Of The Spheres Tour',
    badge: '#1 LAKU KERAS',
    price: 'Rp1.200.000',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 302,
    title: 'Ed Sheeran +-=÷x Tour 2024',
    badge: '#2 BESTSELLER',
    price: 'Rp850.000',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 303,
    title: 'Bruno Mars Live in Jakarta',
    badge: '#3 TERLARIS',
    price: 'Rp950.000',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 304,
    title: 'Prambanan Jazz Festival 10th',
    badge: '#4 TOP TICKET',
    price: 'Rp350.000',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80'
  }
]);

const cityList = ref([
  { id: 'jakarta', name: 'Jakarta' },
  { id: 'bandung', name: 'Bandung' },
  { id: 'yogyakarta', name: 'Yogyakarta' },
  { id: 'surabaya', name: 'Surabaya' },
  { id: 'bali', name: 'Bali' },
  { id: 'medan', name: 'Medan' },
  { id: 'semarang', name: 'Semarang' },
  { id: 'makassar', name: 'Makassar' }
]);

const merchList = ref([
  {
    id: 1,
    title: 'Coldplay Spheres Oversized T-Shirt',
    organizer: 'Burakku',
    creatorLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    price: 'Rp285.000',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    badge: 'BESTSELLER'
  },
  {
    id: 2,
    title: 'The Script Satellites Heavyweight Hoodie',
    organizer: 'The Script Official',
    creatorLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    price: 'Rp450.000',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    badge: 'LIMITED'
  },
  {
    id: 3,
    title: 'Soundrenaline 2024 Canvas Tote Bag',
    organizer: 'Soundrenaline Official',
    creatorLogo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    price: 'Rp115.000',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    badge: 'NEW'
  },
  {
    id: 4,
    title: 'Pesta Pora Exclusive Snapback Cap',
    organizer: 'Pesta Pora Official',
    creatorLogo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    price: 'Rp175.000',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
    badge: 'HOT'
  }
]);

const handleTarikSaldo = () => {
  alert('Penarikan saldo sedang diproses');
};
</script>

<template>
  <div class="mobile-wrapper">
    <!-- Top Nav Bar -->
    <!-- Top Nav Bar -->
    <header class="navbar-header" :class="{ 
      'hidden-header': activeTab === 'create-event' || activeTab === 'event-detail' || isChatRoomActive,
      'navbar-home': activeTab === 'home' || activeTab === 'chat',
      'navbar-scrolled': isScrolledFromTop 
    }">
      <template v-if="activeTab === 'home' || activeTab === 'chat'">
        <div class="home-nav-container">
          <!-- Top Row: Account Greeting & Simple Action Icons -->
          <div class="home-nav-top">
            <div class="account-group" @click="isSidebarOpen = true">
              <button class="nav-menu-lines-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="menu-lines-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <div class="account-text-info">
                <span class="account-name">Hi, Afif Maulana Yusuf</span>
                
              </div>
            </div>

            <div class="nav-right-actions">
              <!-- Collapse Toggle Button for Search Bar -->
              <button 
                class="nav-icon-btn search-toggle-btn" 
                :class="{ active: isSearchOpen }"
                title="Toggle Pencarian" 
                @click="isSearchOpen = !isSearchOpen"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="header-action-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              <!-- <button class="nav-icon-btn notification-btn" title="Notifikasi" @click="isSidebarOpen = true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="header-action-icon">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="notification-badge-dot"></span>
              </button> -->

              <button class="nav-icon-btn cart-btn" title="Keranjang" @click="isSidebarOpen = true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="header-action-icon">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Bottom Row: Search Bar with Ultra Smooth Collapse Transition -->
          <transition name="search-collapse">
            <div v-if="isSearchOpen" class="search-bar-wrapper">
              <div class="home-search-bar">
                <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.2" class="search-bar-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" v-model="searchQuery" :placeholder="currentPlaceholder" class="search-bar-input" />
                <button class="search-close-btn" title="Tutup Pencarian" @click="isSearchOpen = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" class="close-search-icon">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </template>

      <!-- Standard navbar for other tabs -->
      <template v-else>
        <div class="nav-left-group">
          <button class="nav-menu-btn" @click="isSidebarOpen = true">
            <!-- Hamburger Menu -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="nav-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          <div class="header-search-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="#194e9e" stroke-width="2.5" class="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" :placeholder="currentPlaceholder" class="search-input" />
          </div>
        </div>

        <div class="nav-profile-container">
          <div class="profile-circle" @click="activeTab = 'profile'">
            <!-- Profile Icon SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="profile-svg">
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </template>
    </header>

    <!-- Main Scrollable Content Area -->
    <main class="content-scroll-area" @scroll="handleScroll" :class="{ 'checkin-list-bg': activeTab === 'explore', 'dashboard-no-padding': activeTab === 'profile' || activeTab === 'event' || activeTab === 'transaksi' || activeTab === 'create-event' || activeTab === 'event-detail' }">
      <!-- Profile tab content template -->
      <template v-if="activeTab === 'profile'">
        <Profile @logout="emit('logout')" @navigate-transaksi="activeTab = 'transaksi'" />
      </template>

      <!-- Transaksi tab content template -->
      <template v-else-if="activeTab === 'transaksi'">
        <Transaksi />
      </template>

      <!-- Explore tab content template -->
      <template v-else-if="activeTab === 'explore'">
        <Explore :events="events" />
      </template>

      <!-- Home tab content template -->
      <template v-else-if="activeTab === 'home'">
        <div class="home-redesign-body">
          
          <!-- Image Slider (Shorter height) -->
          <div class="slider-container">
            <div 
              class="slider-track" 
              :style="{ 
                transform: `translateX(calc(-${currentSliderIndex * 100}% + ${currentTranslate}px))`,
                transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' 
              }"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
              @mousedown="handleMouseDown"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
            >
              <div v-for="event in events" :key="event.id" class="slide">
                <img :src="event.image" :alt="event.title" class="slide-image" draggable="false" />
              </div>
            </div>
            <div class="slider-dots">
              <span 
                v-for="(event, index) in events" 
                :key="event.id" 
                class="slider-dot" 
                :class="{ active: currentSliderIndex === index }"
                @click="currentSliderIndex = index"
              ></span>
            </div>
          </div>

          <!-- Horizontal Category Buttons Section -->
          <div class="category-quick-scroll">
            <button 
              v-for="cat in quickCategories" 
              :key="cat.name" 
              class="category-chip-btn"
              :class="{ active: selectedCategory === cat.name }"
              @click="selectedCategory = selectedCategory === cat.name ? null : cat.name"
            >
              <div class="cat-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cat-svg-icon" v-html="cat.svg"></svg>
              </div>
              <span class="cat-chip-label">{{ cat.name }}</span>
            </button>

            <!-- Lihat Semua Button -->
            <button class="category-chip-btn see-all-chip-btn" @click="handleSwitchTab('event', 'aktif', null)">
              <div class="cat-icon-box see-all-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cat-svg-icon">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <span class="cat-chip-label">Lihat Semua</span>
            </button>
          </div>

          <!-- Restored Event Cards List -->
          <div class="top-events-header">
            <h2 class="top-events-title">Events Terbaru</h2>
          </div>

          <section class="cards-list-section">
            <div 
              v-for="event in events" 
              :key="event.id" 
              class="event-card"
            >
              <!-- Card Thumbnail Area -->
              <div class="card-thumbnail-wrapper">
                <img :src="event.image" :alt="event.title" class="event-thumbnail" />
                <div class="status-badge" :class="event.status.toLowerCase()">
                  <span class="status-dot"></span>
                  <span>{{ event.status }}</span>
                </div>
              </div>

              <!-- Card Info Area -->
              <div class="card-info">
                <div class="event-title-wrapper">
                  <div v-if="event.title && event.title.length > 20" class="event-title-marquee">
                    <h3 class="event-card-title">{{ event.title }}</h3>
                    <h3 class="event-card-title" aria-hidden="true">{{ event.title }}</h3>
                  </div>
                  <h3 v-else class="event-card-title static">{{ event.title }}</h3>
                </div>
                
                <!-- Creator Profile & Verified Badge Row -->
                <div class="creator-profile-row">
                  <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                  <span class="creator-name">{{ event.organizer }}</span>
                  <span class="verified-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </span>
                </div>
                
                <div class="meta-row" v-if="event.location">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                    <path fill-rule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.343 7.587.829.799 1.655 1.381 2.274 1.765.31.193.57.337.757.433.107.054.2.096.28.14a.515.515 0 0 0 .036.017l.006.003ZM10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                  </svg>
                  <div class="meta-text-wrapper">
                    <div v-if="event.location && event.location.length > 22" class="meta-text-marquee">
                      <span class="meta-text">{{ event.location }}</span>
                      <span class="meta-text" aria-hidden="true">{{ event.location }}</span>
                    </div>
                    <span v-else class="meta-text static">{{ event.location }}</span>
                  </div>
                </div>

                <div class="meta-row" v-if="event.date">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                    <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                  </svg>
                  <div class="meta-text-wrapper">
                    <div v-if="event.date && event.date.length > 22" class="meta-text-marquee">
                      <span class="meta-text">{{ event.date }}</span>
                      <span class="meta-text" aria-hidden="true">{{ event.date }}</span>
                    </div>
                    <span v-else class="meta-text static">{{ event.date }}</span>
                  </div>
                </div>

                <div class="price-row">
                  <span class="event-card-price">{{ event.price }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Segera Hadir Section -->
          <div class="top-events-header coming-soon-header">
            <h2 class="top-events-title">Segera Hadir</h2>
          </div>

          <div class="coming-soon-wrapper">
            <!-- Left Fixed Promo Banner Image -->
            <div class="promo-banner-box">
              <img src="/media/promodesign.png" alt="Promo KeBut" class="promo-banner-img" />
            </div>

            <!-- Right Auto-Scrolling Event Cards Carousel -->
            <div class="coming-soon-carousel-area">
              <div 
                class="coming-soon-track" 
                :style="{ transform: `translateX(-${comingSoonIndex * 100}%)`, transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }"
              >
                <div 
                  v-for="event in comingSoonEvents" 
                  :key="event.id" 
                  class="coming-soon-slide"
                >
                  <div 
                    class="event-card coming-soon-card"
                  >
                    <!-- Card Thumbnail Area -->
                    <div class="card-thumbnail-wrapper">
                      <img :src="event.image" :alt="event.title" class="event-thumbnail" />
                      <div class="status-badge upcoming">
                        <span class="status-dot"></span>
                        <span>Segera Hadir</span>
                      </div>
                    </div>

                    <!-- Card Info Area -->
                    <div class="card-info">
                      <div class="event-title-wrapper">
                        <div v-if="event.title && event.title.length > 22" class="event-title-marquee">
                          <h3 class="event-card-title">{{ event.title }}</h3>
                          <h3 class="event-card-title" aria-hidden="true">{{ event.title }}</h3>
                        </div>
                        <h3 v-else class="event-card-title static">{{ event.title }}</h3>
                      </div>
                      
                      <!-- Creator Profile & Verified Badge Row -->
                      <div class="creator-profile-row">
                        <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                        <span class="creator-name">{{ event.organizer }}</span>
                        <span class="verified-badge">
                          <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </span>
                      </div>
                      
                      <div class="meta-row" v-if="event.location">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                          <path fill-rule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.343 7.587.829.799 1.655 1.381 2.274 1.765.31.193.57.337.757.433.107.054.2.096.28.14a.515.515 0 0 0 .036.017l.006.003ZM10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                        </svg>
                        <div class="meta-text-wrapper">
                          <div v-if="event.location && event.location.length > 22" class="meta-text-marquee">
                            <span class="meta-text">{{ event.location }}</span>
                            <span class="meta-text" aria-hidden="true">{{ event.location }}</span>
                          </div>
                          <span v-else class="meta-text static">{{ event.location }}</span>
                        </div>
                      </div>

                      <div class="meta-row" v-if="event.date">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                          <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                        </svg>
                        <div class="meta-text-wrapper">
                          <div v-if="event.date && event.date.length > 22" class="meta-text-marquee">
                            <span class="meta-text">{{ event.date }}</span>
                            <span class="meta-text" aria-hidden="true">{{ event.date }}</span>
                          </div>
                          <span v-else class="meta-text static">{{ event.date }}</span>
                        </div>
                      </div>

                      <div class="price-row">
                        <span class="event-card-price">{{ event.price }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination Dots Indicator under the scrolling area -->
              <div class="coming-soon-dots">
                <span 
                  v-for="(event, index) in comingSoonEvents" 
                  :key="event.id" 
                  class="cs-dot" 
                  :class="{ active: comingSoonIndex === index }"
                  @click="comingSoonIndex = index"
                ></span>
              </div>
            </div>
          </div>

          <!-- Additional Events Section: Event Populer -->
          <div class="top-events-header extra-section-header">
            <h2 class="top-events-title">Event Populer</h2>
          </div>

          <section class="cards-list-section">
            <div 
              v-for="event in popularEvents" 
              :key="event.id" 
              class="event-card"
            >
              <!-- Card Thumbnail Area -->
              <div class="card-thumbnail-wrapper">
                <img :src="event.image" :alt="event.title" class="event-thumbnail" />
                <div class="status-badge" :class="event.status.toLowerCase()">
                  <span class="status-dot"></span>
                  <span>{{ event.status }}</span>
                </div>
              </div>

              <!-- Card Info Area -->
              <div class="card-info">
                <div class="event-title-wrapper">
                  <div v-if="event.title && event.title.length > 20" class="event-title-marquee">
                    <h3 class="event-card-title">{{ event.title }}</h3>
                    <h3 class="event-card-title" aria-hidden="true">{{ event.title }}</h3>
                  </div>
                  <h3 v-else class="event-card-title static">{{ event.title }}</h3>
                </div>
                
                <div class="creator-profile-row">
                  <img :src="event.creatorLogo" alt="Creator Profile" class="creator-avatar" />
                  <span class="creator-name">{{ event.organizer }}</span>
                  <span class="verified-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="verified-check-svg" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </span>
                </div>
                
                <div class="meta-row" v-if="event.location">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                    <path fill-rule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.343 7.587.829.799 1.655 1.381 2.274 1.765.31.193.57.337.757.433.107.054.2.096.28.14a.515.515 0 0 0 .036.017l.006.003ZM10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                  </svg>
                  <div class="meta-text-wrapper">
                    <div v-if="event.location && event.location.length > 22" class="meta-text-marquee">
                      <span class="meta-text">{{ event.location }}</span>
                      <span class="meta-text" aria-hidden="true">{{ event.location }}</span>
                    </div>
                    <span v-else class="meta-text static">{{ event.location }}</span>
                  </div>
                </div>

                <div class="meta-row" v-if="event.date">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="meta-icon">
                    <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                  </svg>
                  <div class="meta-text-wrapper">
                    <div v-if="event.date && event.date.length > 22" class="meta-text-marquee">
                      <span class="meta-text">{{ event.date }}</span>
                      <span class="meta-text" aria-hidden="true">{{ event.date }}</span>
                    </div>
                    <span v-else class="meta-text static">{{ event.date }}</span>
                  </div>
                </div>

                <div class="price-row">
                  <span class="event-card-price">{{ event.price }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Section Event Paling Laku (Infinite Loop 1 Card at a Time) -->
          <div class="top-events-header extra-section-header">
            <h2 class="top-events-title">Event Paling Laku</h2>
          </div>

          <div 
            class="most-popular-wrapper"
            @touchstart="handleMpDragStart"
            @touchmove="handleMpDragMove"
            @touchend="handleMpDragEnd"
            @mousedown="handleMpDragStart"
            @mousemove="handleMpDragMove"
            @mouseup="handleMpDragEnd"
            @mouseleave="handleMpDragEnd"
          >
            <div class="most-popular-carousel-single">
              <div 
                class="most-popular-track-single"
                :style="{ transform: `translateX(-${mostPopularIndex * 100}%)`, transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none' }"
                @transitionend="handleMpTransitionEnd"
              >
                <div 
                  v-for="(event, idx) in mpLoopEvents" 
                  :key="idx" 
                  class="most-popular-slide-single"
                >
                  <div class="most-popular-card-single">
                    <img :src="event.image" :alt="event.title" class="mp-single-img" />
                    <div class="mp-single-badge">{{ event.badge }}</div>
                    <div class="mp-single-overlay">
                      <div class="mp-single-info">
                        <div class="event-title-wrapper">
                          <div v-if="event.title && event.title.length > 24" class="event-title-marquee">
                            <h4 class="mp-single-title">{{ event.title }}</h4>
                            <h4 class="mp-single-title" aria-hidden="true">{{ event.title }}</h4>
                          </div>
                          <h4 v-else class="mp-single-title static">{{ event.title }}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dots for Most Popular -->
              <div class="most-popular-dots">
                <span 
                  v-for="(event, idx) in mostPopularEvents" 
                  :key="event.id"
                  class="mp-dot"
                  :class="{ active: (mostPopularIndex % mostPopularEvents.length) === idx }"
                  @click="mostPopularIndex = idx"
                ></span>
              </div>
            </div>
          </div>

          <!-- Section Para Kreator -->
          <div class="top-events-header extra-section-header">
            <h2 class="top-events-title">Para Kreator</h2>
          </div>

          <div class="creators-scroll-list">
            <div v-for="creator in creators" :key="creator.id" class="creator-card">
              <img :src="creator.avatar" :alt="creator.name" class="creator-card-img" />
              <h4 class="creator-card-name">{{ creator.name }}</h4>
              <span class="creator-card-followers">{{ creator.followers }} Pengikut</span>
              <button 
                class="creator-follow-btn" 
                :class="{ following: creator.isFollowing }"
                @click="toggleFollow(creator)"
              >
                {{ creator.isFollowing ? 'Mengikuti' : 'Ikuti' }}
              </button>
            </div>
          </div>

          <!-- CTA Image Slider Section (Right below Para Kreator) -->
          <div 
            class="cta-banner-slider-wrapper"
            @touchstart="handleCtaDragStart"
            @touchmove="handleCtaDragMove"
            @touchend="handleCtaDragEnd"
            @mousedown="handleCtaDragStart"
            @mousemove="handleCtaDragMove"
            @mouseup="handleCtaDragEnd"
            @mouseleave="handleCtaDragEnd"
          >
            <div 
              class="cta-banner-slider"
              @click="activeTab = 'create-event'"
            >
              <div 
                class="cta-banner-track"
                :style="{ transform: `translateX(-${ctaSlideIndex * 100}%)`, transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }"
              >
                <div 
                  v-for="(slide, index) in ctaSlides" 
                  :key="index" 
                  class="cta-banner-slide"
                >
                  <img :src="slide.image" alt="Buat Event Baru CTA" class="cta-banner-img" draggable="false" />
                </div>
              </div>

              <!-- Pagination Dots Indicator -->
              <div class="cta-banner-dots" @click.stop>
                <span 
                  v-for="(slide, index) in ctaSlides" 
                  :key="index" 
                  class="cta-dot" 
                  :class="{ active: ctaSlideIndex === index }"
                  @click="ctaSlideIndex = index"
                ></span>
              </div>
            </div>
          </div>

          <!-- Section Event Berdasarkan Kota / Daerah (Single Horizontal Scroll Line) -->
          <div class="top-events-header extra-section-header city-section-header">
            <h2 class="top-events-title">Event di Kota Kamu</h2>
          </div>

          <div class="city-scroll-list">
            <div 
              v-for="city in cityList" 
              :key="city.id" 
              class="city-card"
              @click="handleSwitchTab('event', 'aktif', city.name)"
            >
              <div class="city-icon-wrapper">
                <!-- Jakarta (Monas) -->
                <svg v-if="city.id === 'jakarta'" viewBox="0 0 24 24" fill="#194e9e" xmlns="http://www.w3.org/2000/svg" class="city-icon-svg">
                  <path d="M12 2C11.3 3.1 11.5 4.3 12 5C12.5 4.3 12.7 3.1 12 2Z"/>
                  <path d="M9.5 5.5H14.5L14 11H10L9.5 5.5Z"/>
                  <path d="M8 11.5H16L17.5 17H6.5L8 11.5Z"/>
                  <path d="M4 17.5H20V21H4V17.5Z"/>
                </svg>

                <!-- Bandung (Gedung Sate) -->
                <svg v-else-if="city.id === 'bandung'" viewBox="0 0 24 24" fill="#194e9e" xmlns="http://www.w3.org/2000/svg" class="city-icon-svg">
                  <path d="M11.5 2h1v3.5h-1z"/>
                  <circle cx="12" cy="2.5" r="1"/>
                  <path d="M7 7.5l5-3 5 3v2H7v-2z"/>
                  <path d="M5 11h14v3H5v-3z"/>
                  <path d="M3 15h18v6H3v-6z"/>
                </svg>

                <!-- Yogyakarta (Tugu Jogja) -->
                <svg v-else-if="city.id === 'yogyakarta'" viewBox="0 0 24 24" fill="#194e9e" xmlns="http://www.w3.org/2000/svg" class="city-icon-svg">
                  <circle cx="12" cy="3" r="1.5"/>
                  <path d="M11 5h2l.7 7h-3.4L11 5z"/>
                  <path d="M9.5 12.5h5l.5 4.5h-6l.5-4.5z"/>
                  <path d="M6 17.5h12V21H6v-3.5z"/>
                </svg>

                <!-- Surabaya (Tugu Pahlawan) -->
                <svg v-else-if="city.id === 'surabaya'" viewBox="0 0 24 24" fill="#194e9e" xmlns="http://www.w3.org/2000/svg" class="city-icon-svg">
                  <path d="M11.5 2h1l1 14h-3l1-14z"/>
                  <path d="M8 16.5h8v2H8v-2z"/>
                  <path d="M5 19h14v2H5v-2z"/>
                </svg>

                <!-- Bali / Denpasar (Candi Bentar Gate) -->
                <svg v-else-if="city.id === 'bali'" viewBox="0 0 24 24" fill="#194e9e" xmlns="http://www.w3.org/2000/svg" class="city-icon-svg">
                  <path d="M4 21V11l2-2V7l2-2V3h2v18H4z"/>
                  <path d="M20 21V11l-2-2V7l-2-2V3h-2v18h6z"/>
                  <path d="M2 20h20v1H2v-1z"/>
                </svg>

                <!-- Medan (Istana Maimun / Dome) -->
                <svg v-else-if="city.id === 'medan'" viewBox="0 0 24 24" fill="#194e9e" xmlns="http://www.w3.org/2000/svg" class="city-icon-svg">
                  <path d="M12 2c-.3 0-.5.2-.5.5v1.5h1V2.5c0-.3-.2-.5-.5-.5z"/>
                  <path d="M12 4c-3.3 0-6 2.5-6 6h12c0-3.5-2.7-6-6-6z"/>
                  <path d="M4 11h16v10H4V11z"/>
                </svg>

                <!-- Semarang (Lawang Sewu) -->
                <svg v-else-if="city.id === 'semarang'" viewBox="0 0 24 24" fill="#194e9e" xmlns="http://www.w3.org/2000/svg" class="city-icon-svg">
                  <path d="M3 21V9l9-6 9 6v12H3zm3-2h3v-6a1.5 1.5 0 0 0-3 0v6zm6 0h3v-6a1.5 1.5 0 0 0-3 0v6z"/>
                </svg>

                <!-- Makassar (Kapal Phinisi) -->
                <svg v-else-if="city.id === 'makassar'" viewBox="0 0 24 24" fill="#194e9e" xmlns="http://www.w3.org/2000/svg" class="city-icon-svg">
                  <path d="M11 3v12L4 15l7-12zM13 5v10l7-2-7-8z"/>
                  <path d="M2 17l3 4h14l3-4H2z"/>
                </svg>
              </div>
              <span class="city-card-name">{{ city.name }}</span>
            </div>
          </div>

          <!-- Section Official Merchandise (Right below City Cards) -->
          <div class="top-events-header extra-section-header">
            <h2 class="top-events-title">Merchandise Official</h2>
          </div>

          <div class="merch-scroll-list">
            <div 
              v-for="merch in merchList" 
              :key="merch.id" 
              class="merch-card"
              @click="handleSwitchTab('event', 'aktif', null)"
            >
              <div class="merch-thumb-wrapper">
                <img :src="merch.image" :alt="merch.title" class="merch-thumb" />
                <span v-if="merch.badge" class="merch-badge">{{ merch.badge }}</span>
              </div>
              <div class="merch-info">
                <div class="event-title-wrapper">
                  <div v-if="merch.title && merch.title.length > 20" class="event-title-marquee">
                    <h4 class="merch-title">{{ merch.title }}</h4>
                    <h4 class="merch-title" aria-hidden="true">{{ merch.title }}</h4>
                  </div>
                  <h4 v-else class="merch-title static">{{ merch.title }}</h4>
                </div>

                <div class="merch-creator-row">
                  <img :src="merch.creatorLogo" :alt="merch.organizer" class="merch-creator-avatar" />
                  <div class="merch-creator-text-group">
                    <span class="merch-creator-label">Disediakan oleh</span>
                    <span class="merch-creator-name">{{ merch.organizer }}</span>
                  </div>
                </div>

                <span class="merch-price">{{ merch.price }}</span>
              </div>
            </div>
          </div>

        </div>
      </template>

      <!-- Chat Component -->
      <Chat v-else-if="activeTab === 'chat'" @room-toggle="handleChatRoomToggle" />

      <!-- Explore Component -->
      <Explore v-else-if="activeTab === 'explore'" />

      <!-- Event Component -->
      <Event v-else-if="activeTab === 'event'" :events="events" :initial-filter="eventInitialFilter" @switch-tab="handleSwitchTab" />

      <!-- Transaksi Component -->
      <Transaksi v-else-if="activeTab === 'transaksi'" />

      <!-- Profile Component -->
      <Profile v-else-if="activeTab === 'profile'" />

      <!-- Create Event Component -->
      <CreateEvent v-else-if="activeTab === 'create-event'" @back="handleCreateEventBack" />
    </main>

    <nav class="bottom-nav" :class="{ 'hidden-nav': activeTab === 'create-event' || activeTab === 'event-detail' || isChatRoomActive, 'nav-scrolled': isScrolledDown }">
      <button class="nav-tab home-tab" :class="{ active: activeTab === 'home' }" @click="activeTab = 'home'">
        <img 
          :src="activeTab === 'home' ? '/media/home (2).png' : '/media/home (1).png'" 
          alt="Home Icon" 
          class="tab-icon-image"
        />
        <span class="tab-label home-label">Home</span>
      </button>

      <button class="nav-tab" :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">
        <!-- Chat Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span class="tab-label">Chat</span>
      </button>

      <button class="nav-tab" :class="{ active: activeTab === 'event' }" @click="handleSwitchTab('event', 'aktif', null)">
        <!-- Calendar Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="3" y1="9" x2="21" y2="9" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="tab-label">Event</span>
      </button>

      <button class="nav-tab" :class="{ active: activeTab === 'transaksi' }" @click="activeTab = 'transaksi'">
        <!-- Receipt / Transaksi Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
          <line x1="8" y1="8" x2="16" y2="8"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <span class="tab-label">Transaksi</span>
      </button>

      <button class="nav-tab" :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
        <!-- User Profile Icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span class="tab-label">Profile</span>
      </button>
    </nav>

    <!-- Sidebar Drawer Component (Image 1) -->
    <transition name="fade">
      <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>
    </transition>
    
    <transition name="slide-sidebar">
      <div v-if="isSidebarOpen" class="sidebar-drawer">
        <!-- Sidebar Header -->
        <div class="sidebar-logo-section">
          <div class="logo-group">
            <img src="/media/logo.png" alt="Kolektix Logo" class="sidebar-logo" />
            <span class="sidebar-logo-subtitle">CREATOR</span>
          </div>
        </div>

        <!-- Creator Profile Card -->
        <div class="sidebar-profile-card">
          <div class="profile-info-group">
            <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" alt="Avatar" class="sidebar-avatar" />
            <div class="profile-text">
              <span class="profile-name">maspamcompany LTD</span>
              <span class="profile-role">Creator</span>
            </div>
          </div>
          <button class="sidebar-toggle-btn" @click="isSaldoOpen = !isSaldoOpen">
            <div class="chevron-circle" :class="{ active: isSaldoOpen }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="chevron-icon">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </div>
          </button>
        </div>

        <!-- Collapsible Saldo -->
        <div v-show="isSaldoOpen" class="sidebar-saldo-card">
          <div class="saldo-row">
            <div class="saldo-label-group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="saldo-icon">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <span>Saldo</span>
            </div>
            <span class="saldo-amount">Rp.0</span>
          </div>
          <button class="saldo-detail-btn-new" @click="handleTarikSaldo">Detail</button>
        </div>

        <!-- Menu Items Navigation List -->
        <nav class="sidebar-nav">
          <!-- Dashboard item (with Home icon) -->
          <button class="sidebar-nav-item" :class="{ active: activeTab === 'Dashboard' }" @click="activeTab = 'Dashboard'; isSidebarOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Dashboard</span>
          </button>

          <!-- Expandable Event Item -->
          <div class="sidebar-nav-group">
            <button class="sidebar-nav-item parent" @click="isEventGroupOpen = !isEventGroupOpen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Event</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-chevron" :class="{ rotated: !isEventGroupOpen }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Submenu Items -->
            <div v-show="isEventGroupOpen" class="sidebar-sub-items">
              <button class="sidebar-sub-item" :class="{ active: activeTab === 'event' }" @click="handleSwitchTab('event', 'aktif', null); isSidebarOpen = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sub-icon">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Event Saya</span>
              </button>
              
              <button class="sidebar-sub-item" :class="{ active: activeTab === 'Checkin' && checkinInitialTab !== 'report' }" @click="handleSwitchTab('Checkin', 'aktif', null); isSidebarOpen = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sub-icon">
                  <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" stroke-linecap="round" stroke-linejoin="round" />
                  <line x1="6" y1="12" x2="18" y2="12" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>Check In Event</span>
              </button>

              <button class="sidebar-sub-item" :class="{ active: activeTab === 'Checkin' && checkinInitialTab === 'report' }" @click="handleSwitchTab('Checkin', 'report', null); isSidebarOpen = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sub-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                </svg>
                <span>Check In Report</span>
              </button>

              <button class="sidebar-sub-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sub-icon">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                <span>Report Event</span>
              </button>
            </div>
          </div>

          <!-- Sales Report -->
          <button class="sidebar-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
            <span>Sales Report</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-right-sub">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <!-- Ticket OTS -->
          <button class="sidebar-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon">
              <rect x="2" y="6" width="20" height="12" rx="2" ry="2"/>
              <line x1="6" y1="6" x2="6" y2="18"/>
              <line x1="18" y1="6" x2="18" y2="18"/>
            </svg>
            <span>Ticket OTS</span>
          </button>
        </nav>

        <!-- Sidebar compact button footer -->
        <div class="sidebar-footer">
          <button class="sidebar-nav-item compact-btn" @click="isSidebarOpen = false">
            <span>Persingkat Menu</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nav-icon right-icon">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.mobile-wrapper {
  width: 100%;
  max-width: 100%;
  height: 100vh;
  height: 100dvh;
  background-color: #fcfcfd;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

@media (min-width: 480px) {
  .mobile-wrapper {
    max-width: 410px;
    height: 88vh;
    max-height: 840px;
    border-radius: 30px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    margin: auto;
  }
}

.navbar-header {
  background-color: var(--primary-base);
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top, 0px);
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(0);
  opacity: 1;
}

.navbar-header.hidden-header {
  transform: translateY(-100%);
  opacity: 0;
  height: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
  border: none;
  pointer-events: none;
}

.nav-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-menu-btn, .nav-profile-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--white);
  cursor: pointer;
  padding: 0;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.header-search-pill {
  display: flex;
  align-items: center;
  background-color: var(--white);
  border-radius: 20px;
  padding: 0 12px;
  flex: 1;
  margin-right: 12px;
  height: 32px;
}

.search-icon {
  width: 13px;
  height: 13px;
  margin-right: 8px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 11px;
  color: var(--dark);
  flex: 1;
  width: 100%;
}


.sign-in-btn {
  background-color: var(--white);
  color: #ef4444;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.nav-logo {
  max-height: 28px;
  width: auto;
}

.profile-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--white);
  color: var(--grey);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-svg {
  width: 24px;
  height: 24px;
}

/* Content Scrollable area */
.content-scroll-area {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 0 84px 0; /* Remove top/side padding to allow full-width banner */
  display: flex;
  flex-direction: column;
  scrollbar-width: none;
  touch-action: pan-y;
  overscroll-behavior-x: none;
}

.content-scroll-area::-webkit-scrollbar {
  display: none;
}

/* K-Wallet Header Styles (Now inside events container) */
.k-wallet-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #194e9e;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(25, 78, 158, 0.1);
  margin-bottom: 24px;
}

.k-wallet-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.k-creator-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.k-wallet-info {
  display: flex;
  flex-direction: column;
}

.k-wallet-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
}

.k-wallet-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--white);
  margin: 0;
  line-height: 1.2;
}

.k-wallet-coin {
  font-size: 9px;
  color: #8bb4e7;
  font-weight: 500;
}

.k-wallet-actions {
  display: flex;
  align-items: center;
}

.tarik-saldo-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--white);
  padding: 6px 12px;
  border-radius: 20px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tarik-saldo-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.tarik-icon {
  width: 14px;
  height: 14px;
}

/* Image Slider Styles */
.slider-container {
  position: relative;
  width: 100%;
  height: 120px !important;
  min-height: 120px !important;
  max-height: 120px !important;
  border-radius: 8px;
  overflow: hidden;
  display: block;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* ===== Horizontal Category Buttons Section ===== */
.category-quick-scroll {
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  padding: 4px 0 6px 0;
  margin-top: 4px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  touch-action: pan-x;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
}

.category-quick-scroll::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.category-chip-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  flex: 0 0 auto;
  padding: 0;
  transition: transform 0.2s ease;
}

.category-chip-btn:hover {
  transform: translateY(-2px);
}

.cat-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #194e9e;
  transition: all 0.2s ease;
}

.cat-svg-icon {
  width: 20px;
  height: 20px;
  color: #194e9e;
  transition: color 0.2s ease;
}

.category-chip-btn.active .cat-icon-box {
  background-color: #194e9e;
  border-color: #194e9e;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(25, 78, 158, 0.25);
}

.category-chip-btn.active .cat-svg-icon {
  color: #ffffff;
}

.cat-chip-label {
  font-size: 10.5px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.category-chip-btn.active .cat-chip-label {
  font-weight: 700;
  color: #194e9e;
}

/* White Container Overlapping Slider */
.events-container {
  background-color: var(--white);
  border-radius: 16px 16px 0 0;
  margin-top: -64px; /* overlap the slider more aggressively */
  padding: 24px 16px;
  position: relative;
  z-index: 2;
  flex: 1;
}

.top-events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 0px;
  flex-shrink: 0;
}

.top-events-header.coming-soon-header {
  margin-top: 0px;
  margin-bottom: 0px;
}

.top-events-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--dark);
  margin: 0;
}

/* ===== Segera Hadir Special Section (Full Width Side to Side & Compact Sizing) ===== */
.coming-soon-wrapper {
  display: flex;
  align-items: stretch;
  gap: 10px;
  background-color: rgba(219, 234, 254, 0.35); /* Soft blue container with lower opacity */
  padding: 8px 16px;
  margin-left: -16px;
  margin-right: -16px;
  margin-top: 2px;
  margin-bottom: 0px;
  width: calc(100% + 32px);
  max-width: calc(100% + 32px);
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 10px rgba(25, 78, 158, 0.03);
  touch-action: pan-y;
  flex-shrink: 0;
}

.promo-banner-box {
  flex: 0 0 115px;
  width: 115px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: transparent;
  display: flex;
}

.promo-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.coming-soon-carousel-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
}

.coming-soon-track {
  display: flex;
  width: 100%;
  height: 100%;
}

.coming-soon-slide {
  flex: 0 0 100%;
  width: 100%;
}

.coming-soon-card {
  width: 100% !important;
  margin: 0;
  border-radius: 8px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.coming-soon-card .card-thumbnail-wrapper {
  height: 85px !important;
}

.coming-soon-card .card-info {
  padding: 8px 10px !important;
  gap: 4px !important;
}

.coming-soon-card .event-card-title {
  font-size: 11.5px !important;
  margin-bottom: 2px !important;
}

.coming-soon-card .creator-avatar {
  width: 18px !important;
  height: 18px !important;
}

.coming-soon-card .creator-name {
  font-size: 9.5px !important;
}

.coming-soon-card .meta-text {
  font-size: 9px !important;
}

.coming-soon-card .meta-icon {
  width: 11px !important;
  height: 11px !important;
}

.coming-soon-card .event-card-price {
  font-size: 12px !important;
}

.coming-soon-dots {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 4px;
}

.cs-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: rgba(25, 78, 158, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cs-dot.active {
  width: 14px;
  border-radius: 4px;
  background-color: #194e9e;
}

.extra-section-header {
  margin-top: 2px;
  margin-bottom: 0px;
}

/* ===== Para Kreator Section ===== */
.creators-scroll-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 0 2px 0;
  margin-top: 2px;
  margin-bottom: 0px;
  scrollbar-width: none;
  touch-action: pan-x;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
}

.creators-scroll-list::-webkit-scrollbar {
  display: none;
}

.creator-card {
  flex: 0 0 115px;
  width: 115px;
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 8px; /* Reduced roundedness */
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  text-align: center;
}

.creator-card-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  margin-bottom: 2px;
}

.creator-card-name {
  font-size: 11px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.creator-card-followers {
  font-size: 9.5px;
  color: #64748b;
}

.creator-follow-btn {
  background-color: #194e9e;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  padding: 4px 12px;
  font-size: 9.5px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 3px;
  transition: all 0.2s ease;
  width: 100%;
}

.creator-follow-btn.following {
  background-color: #f1f5f9;
  color: #194e9e;
  border: 1px solid #cbd5e1;
}

/* ===== Event Paling Laku Special Section (Single Card Infinite Loop) ===== */
.most-popular-wrapper {
  background-color: rgba(219, 234, 254, 0.35); /* Soft blue container matching prompt */
  padding: 8px 16px;
  margin-left: -16px;
  margin-right: -16px;
  margin-top: 2px;
  margin-bottom: 0px;
  width: calc(100% + 32px);
  max-width: calc(100% + 32px);
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 10px rgba(25, 78, 158, 0.03);
  cursor: grab;
  user-select: none;
  touch-action: pan-y;
  flex-shrink: 0;
}

.most-popular-carousel-single {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.most-popular-track-single {
  display: flex;
  width: 100%;
}

.most-popular-slide-single {
  flex: 0 0 100%;
  width: 100%;
}

.most-popular-card-single {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 8px; /* Reduced roundedness on image container */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.mp-single-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.mp-single-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #194e9e;
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 50px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.mp-single-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.85) 100%);
  padding: 12px 12px 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: #ffffff;
}

.mp-single-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  max-width: 230px;
  overflow: hidden;
}

.mp-single-title {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  flex-shrink: 0;
  padding-right: 18px;
}
.mp-single-title.static {
  padding-right: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}


.most-popular-dots {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 8px;
}

.mp-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: rgba(25, 78, 158, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mp-dot.active {
  width: 14px;
  border-radius: 4px;
  background-color: #194e9e;
}

.arrow-right-icon {
  width: 20px;
  height: 20px;
}

.slider-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-dot.active {
  width: 16px;
  background-color: white;
}

/* White Container for Event Cards */
.events-container {
  background-color: var(--white);
  position: relative;
  z-index: 2;
}

/* Event Cards */
.cards-list-section {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 16px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  touch-action: pan-x;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
  width: 100%;
}

.cards-list-section::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

.event-card {
  background-color: var(--white);
  border: 1px solid var(--light-grey);
  border-radius: 8px; /* reduced rounded corners */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  flex: 0 0 85%; /* Widened again */
}

.card-thumbnail-wrapper {
  position: relative;
  width: 100%;
  height: 130px; /* Reduced height */
  background-color: var(--light-grey);
}

.event-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: var(--white);
  border-radius: 20px;
  padding: 3px 8px; /* reduced from 4px 10px */
  font-size: 10px; /* reduced from 11px */
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px; /* reduced from 6px */
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.status-badge.live {
  color: #16a34a;
}

.status-badge.live .status-dot {
  background-color: #16a34a;
  animation: live-dot-blink 1s infinite alternate;
}

@keyframes live-dot-blink {
  0% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.status-badge.upcoming {
  color: #ea580c;
}

.status-badge.upcoming .status-dot {
  background-color: #ea580c;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.card-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.event-card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dark);
  line-height: 1.4;
  white-space: nowrap;
  flex-shrink: 0;
  padding-right: 18px;
}

.event-card-title.static {
  padding-right: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes cardTitleMarquee {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}

/* Creator Profile & Verified Checkmark badge */
.creator-profile-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.creator-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--primary-light-200);
}

.creator-name {
  font-size: 12px;
  font-weight: 600; /* Semi-bold text creator */
  color: var(--dark); /* Black color text */
}

.verified-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2196F3; /* Verified blue check badge */
}

.verified-check-svg {
  width: 16px;
  height: 16px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--dark);
  margin-top: 2px;
  overflow: hidden;
  width: 100%;
}

.meta-icon {
  width: 14px;
  height: 14px;
  color: var(--primary-base);
  flex-shrink: 0;
}

.meta-text-wrapper {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  min-width: 0;
}

.meta-text-marquee {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  animation: metaTextMarquee 12s linear infinite;
  will-change: transform;
}

.meta-text {
  font-size: 12px;
  color: var(--dark);
  white-space: nowrap;
  flex-shrink: 0;
  padding-right: 18px;
}

.meta-text.static {
  padding-right: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes metaTextMarquee {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}

.price-row {
  margin-top: 4px;
}

.event-card-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--dark);
  display: inline-block;
}

/* Progress bar row */
.card-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--light-grey);
}

.ticket-sales-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.sales-text-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.sales-text {
  font-size: 11px;
  font-weight: 500;
  color: var(--dark); /* Black color text */
}

.sales-percent {
  font-size: 11px;
  font-weight: 700;
  color: var(--dark); /* Black color text */
}

.sales-progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--light-grey);
  border-radius: 10px;
  overflow: hidden;
}

.sales-progress-fill {
  height: 100%;
  background-color: var(--primary-base);
  border-radius: 10px;
}

.sales-progress-fill.sold-out-fill {
  background-color: var(--primary-disabled);
}

/* Bottom Nav styles */
.bottom-nav {
  position: absolute;
  bottom: 24px;
  left: 20px;
  right: 20px;
  height: 64px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 12px;
  z-index: 10;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  transform: translateY(0) scale(1);
  transform-origin: center bottom;
  opacity: 1;
}

.bottom-nav.nav-scrolled {
  transform: scale(0.85); /* Removed translateY to keep it higher */
  height: 56px;
  border-radius: 28px;
  bottom: 24px; /* Kept at same height as normal nav */
}

.bottom-nav.hidden-nav {
  transform: translateY(100px);
  opacity: 0;
  pointer-events: none;
}

.nav-tab {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px; /* decreased gap to raise text position */
  color: var(--grey);
  cursor: pointer;
  padding: 4px 4px; /* adjusted padding to keep balance */
  transition: color 0.2s, transform 0.2s;
  flex: 1;
  height: 100%;
  position: relative;
  font-family: var(--font-sans);
}

.nav-tab:hover {
  color: var(--dark-grey);
  transform: translateY(-2px);
}

.tab-icon {
  width: 24px;
  height: 24px;
}

.tab-icon-image {
  width: 34px;
  height: 34px;
  object-fit: contain;
  transition: transform 0.2s;
}

.nav-tab.active .tab-icon-image {
  transform: scale(1.05);
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}

.home-label {
  margin-top: -4px; /* pull Home label up to align with smaller icons */
}

/* Shift entire Home tab contents up slightly */
.home-tab .tab-icon-image,
.home-tab .home-label {
  transform: translateY(-2px);
}

/* Active tab style with top indicator line and blue text */
.nav-tab.active {
  color: var(--primary-base);
  font-weight: 700;
}

.nav-tab.active::before {
  display: none;
}

/* ==========================================
   SCANNER INTERFACE STYLES (FULL-SCREEN)
   ========================================== */

.scanner-fullscreen-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: 999;
  display: flex;
  flex-direction: column;
  color: var(--white);
  font-family: var(--font-sans);
  overflow: hidden;
}

.scanner-camera-feed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.scanner-overlay-dark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.scanner-top-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
}

.scanner-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.scanner-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.scanner-svg-icon {
  width: 20px;
  height: 20px;
}

.scanner-header-title {
  text-align: center;
}

.scanner-header-title h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--white);
}

.scanner-header-title p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 2px 0 0 0;
  letter-spacing: 0.5px;
}

.scanner-tap-hint {
  position: absolute;
  bottom: -28px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  text-align: center;
  width: 240px;
}

.scanner-viewfinder {
  position: relative;
  z-index: 2;
  width: 240px;
  height: 240px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewfinder-bracket {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: var(--white);
  border-style: solid;
  border-width: 0;
}

.viewfinder-bracket.top-left {
  top: 0;
  left: 0;
  border-top-width: 3px;
  border-left-width: 3px;
  border-top-left-radius: 12px;
}

.viewfinder-bracket.top-right {
  top: 0;
  right: 0;
  border-top-width: 3px;
  border-right-width: 3px;
  border-top-right-radius: 12px;
}

.viewfinder-bracket.bottom-left {
  bottom: 0;
  left: 0;
  border-bottom-width: 3px;
  border-left-width: 3px;
  border-bottom-left-radius: 12px;
}

.viewfinder-bracket.bottom-right {
  bottom: 0;
  right: 0;
  border-bottom-width: 3px;
  border-right-width: 3px;
  border-bottom-right-radius: 12px;
}

.scanner-laser-line {
  position: absolute;
  left: 8px;
  right: 8px;
  height: 2px;
  background-color: var(--primary-base);
  box-shadow: 0 0 12px 2px var(--primary-base);
  animation: scan-anim 2.5s infinite ease-in-out;
}

@keyframes scan-anim {
  0% { top: 12px; }
  50% { top: 228px; }
  100% { top: 12px; }
}

.scanner-simulation-panel {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
}

.sim-btn {
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 600;
  border: none;
  border-radius: 20px;
  color: var(--white);
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.2s, transform 0.1s;
}

.sim-btn:active {
  transform: scale(0.95);
}

.sim-btn:hover {
  opacity: 1;
}

.sim-btn.success {
  background-color: #10b981;
}

.sim-btn.failed {
  background-color: #ef4444;
}

.sim-btn.already {
  background-color: #f59e0b;
}

/* ==========================================
   CHECK-IN LIST PAGE STYLES
   ========================================== */

.content-scroll-area.checkin-list-bg {
  background-color: #fcfcfd;
  padding: 0px 0px 84px 0px; /* overrides main padding (24px 16px) to shift content up and go full-width */
  gap: 0px;
}

.checkin-list-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Tab headers matching mockup layout */
.checkin-tabs-header {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  padding: 0 16px; /* kept clean side margin for tab labels */
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
}

.checkin-tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  position: relative;
  text-align: center;
  transition: color 0.2s;
  font-family: var(--font-sans);
}

.checkin-tab-btn.active {
  color: var(--primary-base); /* changed from var(--dark) to blue */
  font-weight: 600; /* reduced from 700 */
}

.checkin-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--primary-base); /* match style.css primary blue */
  border-radius: 3px 3px 0 0;
}

.checkin-events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 12px;
}

/* Check-in Card Action Button */
.checkin-card-action-btn {
  width: 100%;
  background-color: var(--primary-base);
  color: var(--white);
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(25, 78, 158, 0.12);
  transition: background-color 0.2s, transform 0.1s;
}

.checkin-card-action-btn:hover {
  background-color: var(--primary-light-700);
}

.checkin-card-action-btn:active {
  transform: scale(0.98);
}

/* Empty Checkin state mockup styles */
.checkin-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 24px 32px 24px;
}

.checkin-empty-state h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--dark);
  margin: 0 0 10px 0;
}

.checkin-empty-state p {
  font-size: 11px;
  color: var(--dark-grey);
  line-height: 1.6;
  margin: 0 0 24px 0;
  max-width: 280px;
}

.create-checkin-btn {
  background-color: var(--primary-base);
  color: var(--white);
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-sans);
  box-shadow: 0 4px 10px rgba(25, 78, 158, 0.25);
  transition: all 0.2s;
}

.create-checkin-btn:hover {
  background-color: var(--primary-light-700);
  transform: translateY(-1px);
}

/* Folder illustration mockup matching the user mockup drawing */
.empty-illustration-wrapper {
  margin-bottom: 24px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.folder-illustration {
  width: 140px;
  height: 120px;
  position: relative;
}

.folder-cloud {
  position: absolute;
  top: -10px;
  left: -20px;
  right: -20px;
  bottom: -10px;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.8;
}

.cloud-svg {
  width: 100%;
  height: 100%;
}

.folder-container {
  position: absolute;
  width: 90px;
  height: 70px;
  left: 25px;
  top: 30px;
  z-index: 2;
}

.doc-card {
  position: absolute;
  width: 32px;
  height: 44px;
  background-color: var(--white);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.doc-card.doc1 {
  top: -12px;
  left: 12px;
  transform: rotate(-10deg);
  background-color: #ffd8a8; /* soft orange doc background */
}

.doc-card.doc2 {
  top: -15px;
  left: 42px;
  transform: rotate(8deg);
  background-color: var(--white);
}

.folder-box {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 52px;
  background-color: #fdba74; /* soft folder amber/orange base */
  border-radius: 6px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
}

.folder-tab {
  position: absolute;
  top: -6px;
  left: 6px;
  width: 24px;
  height: 8px;
  background-color: #fdba74;
  border-radius: 4px 4px 0 0;
}

.folder-front {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background-color: #f97316; /* active deep orange matching mockup */
  border-radius: 0 0 6px 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.folder-circle-arrow {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.arrow-svg {
  width: 10px;
  height: 10px;
  color: var(--white);
  transform: rotate(0deg); /* Arrow pointing up */
}

.scanner-bottom-stats {
  position: relative;
  z-index: 2;
  margin-top: auto;
  padding: 24px 20px 32px 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

.stats-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--white);
}

.stats-progress-container {
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  overflow: hidden;
}

.stats-progress-fill {
  height: 100%;
  background-color: var(--primary-base); /* changed to blue */
  border-radius: 10px;
}

.stats-percent-label {
  align-self: flex-end;
  font-size: 10px;
  font-weight: 700;
  color: var(--primary-base); /* changed to blue */
  margin-top: -2px;
}



.scanner-notification-card {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background-color: var(--white);
  border-radius: 12px;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Checkin Mode Toggle Switcher */
.checkin-mode-toggle {
  position: relative;
  z-index: 2;
  display: flex;
  align-self: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 30px;
  gap: 4px;
  margin-top: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
}

.checkin-mode-toggle .toggle-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkin-mode-toggle .toggle-btn.active {
  background-color: var(--primary-base);
  color: var(--white);
  box-shadow: 0 2px 8px rgba(25, 78, 158, 0.4);
}

/* Manual Mode Card Form - Custom Mockup Style (Light Theme) */
.scanner-fullscreen-container.manual-bg {
  background-color: #fcfcfd; /* main app background */
  color: var(--dark);
}

.scanner-fullscreen-container.manual-bg .scanner-header-title h3 {
  color: var(--dark);
}

.scanner-fullscreen-container.manual-bg .scanner-header-title p {
  color: var(--dark-grey);
}

.scanner-fullscreen-container.manual-bg .scanner-icon-btn {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--dark);
}

.scanner-fullscreen-container.manual-bg .checkin-mode-toggle {
  background-color: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.08);
}

.scanner-fullscreen-container.manual-bg .checkin-mode-toggle .toggle-btn {
  color: var(--dark-grey);
}

.scanner-fullscreen-container.manual-bg .checkin-mode-toggle .toggle-btn.active {
  color: var(--white);
  background-color: var(--primary-base);
}

.scanner-fullscreen-container.manual-bg .scanner-bottom-stats {
  background: linear-gradient(to top, rgba(253, 253, 253, 0.95), transparent);
}

.scanner-fullscreen-container.manual-bg .stats-label {
  color: var(--dark-grey);
}

.scanner-fullscreen-container.manual-bg .stats-val {
  color: var(--dark);
}

.scanner-fullscreen-container.manual-bg .stats-progress-container {
  background-color: rgba(0, 0, 0, 0.08);
}

.manual-checkin-container {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0 20px;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.manual-form-card {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.manual-field-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  text-align: left;
}

.manual-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--dark);
  font-family: var(--font-sans);
}

.manual-input-field {
  width: 100%;
  background-color: var(--white);
  border: 1px solid #bfdbfe; /* soft light-blue border */
  border-radius: 8px;
  color: var(--dark);
  padding: 12px 14px;
  font-size: 14px;
  font-family: var(--font-sans);
  font-weight: 500;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
  transition: border-color 0.2s;
}

.manual-input-field:focus {
  border-color: var(--primary-base);
}

.manual-input-field::placeholder {
  color: #94a3b8; /* soft slate gray placeholder */
}

.manual-desc-mockup {
  font-size: 11px;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.manual-submit-btn {
  background-color: var(--primary-base);
  color: var(--white);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background-color 0.2s;
  box-shadow: 0 4px 10px rgba(25, 78, 158, 0.15);
}

.manual-submit-btn:hover {
  background-color: var(--primary-light-700);
}

.manual-tips {
  margin-top: 10px;
  font-size: 9px;
  color: #64748b;
  line-height: 1.4;
  text-align: left;
}

.notification-header {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-header.success {
  background-color: #d1fae5;
  color: #065f46;
  border-bottom: 1px solid #a7f3d0;
}

.notification-header.failed {
  background-color: #fee2e2;
  color: #991b1b;
  border-bottom: 1px solid #fecaca;
}

.notification-header.already {
  background-color: #fef3c7;
  color: #92400e;
  border-bottom: 1px solid #fde68a;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-svg {
  width: 16px;
  height: 16px;
}

.header-text {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.notification-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attendee-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attendee-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #475569;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attendee-info h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

.attendee-info p {
  font-size: 11px;
  color: var(--dark-grey);
  margin: 4px 0 0 0;
}

.scan-time-row {
  border-top: 1px dashed var(--light-grey);
  padding-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scan-time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-label {
  font-size: 10px;
  color: var(--grey);
  font-weight: 600;
}

.time-val {
  font-size: 13px;
  font-weight: 600; /* reduced from 700 to prevent heavy bold */
  color: var(--dark);
}

.continue-btn {
  background-color: var(--primary-base); /* changed to blue */
  color: var(--white);
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 11px;
  font-weight: 600; /* reduced from 700 to prevent heavy bold */
  cursor: pointer;
  transition: opacity 0.2s;
}

.continue-btn:hover {
  background-color: var(--primary-light-700);
  opacity: 0.95;
}

/* Camera Error Card Styles */
.error-card-desc {
  font-size: 11px;
  color: var(--dark-grey);
  line-height: 1.5;
  margin: 0 0 16px 0;
  text-align: left;
}

.error-action-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.error-action-row .continue-btn {
  flex: 1;
  text-align: center;
  padding: 10px;
}

.error-action-row .manual-switch-btn {
  background-color: #f1f5f9;
  color: #475569;
}

.error-action-row .manual-switch-btn:hover {
  background-color: #e2e8f0;
}

.popup-slide-enter-active,
.popup-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.popup-slide-enter-from,
.popup-slide-leave-to {
  transform: translateY(120%);
  opacity: 0;
}

.popup-slide-enter-to,
.popup-slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Navbar Left Group Layout */
.nav-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Sidebar Overlay and Sliding Drawer Panel (Image 1) */
.sidebar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

.sidebar-drawer {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background-color: #03204e; /* dark blue matching Image 1 */
  color: var(--white);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 16px rgba(0,0,0,0.15);
  font-family: var(--font-sans);
}

.sidebar-logo-section {
  padding: 24px 20px 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-logo {
  max-height: 28px;
  width: auto;
  align-self: flex-start;
}

.sidebar-logo-subtitle {
  font-size: 8px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.6);
  font-weight: 700;
  margin-left: 2px;
}

.sidebar-profile-card {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-info-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255,255,255,0.2);
}

.profile-text {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--white);
}

.profile-role {
  font-size: 10px;
  color: rgba(255,255,255,0.5);
}

.sidebar-toggle-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 6px;
  color: var(--white);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chevron-up {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
}

.chevron-up.rotated {
  transform: rotate(180deg);
}

.sidebar-saldo-card {
  margin: 0 20px 16px 20px;
  background-color: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saldo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.saldo-label-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(255,255,255,0.7);
}

.saldo-icon {
  width: 14px;
  height: 14px;
}

.saldo-amount {
  font-size: 13px;
  font-weight: 700;
  color: var(--white);
}

.saldo-detail-btn {
  width: 100%;
  background-color: rgba(255,255,255,0.08);
  border: none;
  border-radius: 6px;
  color: var(--white);
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.saldo-detail-btn:hover {
  background-color: rgba(255,255,255,0.15);
}

/* Sidebar Nav Items */
.sidebar-nav {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
}

.sidebar-nav-item {
  width: 100%;
  background: none;
  border: none;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.sidebar-nav-item:hover, .sidebar-nav-item.active {
  background-color: rgba(255,255,255,0.08);
  color: var(--white);
}

.sidebar-nav-item.parent {
  justify-content: space-between;
}

.group-chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
  color: rgba(255,255,255,0.5);
}

.group-chevron.rotated {
  transform: rotate(-90deg);
}

.sidebar-sub-items {
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
}

.sidebar-sub-item {
  width: 100%;
  background: none;
  border: none;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.sidebar-sub-item:hover, .sidebar-sub-item.active {
  color: var(--white);
  background-color: rgba(255,255,255,0.04);
}

.sub-icon {
  width: 12px;
  height: 12px;
}

.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.compact-btn {
  justify-content: flex-start;
}

/* Sidebar Animation classes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-sidebar-enter-active, .slide-sidebar-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-sidebar-enter-from, .slide-sidebar-leave-to {
  transform: translateX(-100%);
}

/* ==========================================
   DASHBOARD TAB PANEL STYLES (Image 2)
   ========================================== */
.dashboard-page-container {
  padding: 20px 16px 84px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f8fafc; /* premium soft light-grey background */
  font-family: var(--font-sans);
}

.dashboard-header-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.verified-account-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #f0fdf4;
  color: #15803d;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid #dcfce7;
  margin-bottom: 4px;
}

.verified-icon-svg {
  width: 12px;
  height: 12px;
}

.dashboard-date-label {
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
}

.dashboard-greeting-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 2px 0 0 0;
}

.dashboard-subtitle {
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
}

.rekap-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.rekap-section-header h2 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.rekap-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.chevron-down-svg {
  width: 10px;
  height: 10px;
}

.sales-total-blue-card {
  background-color: #194E9E; /* theme primary blue */
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--white);
  box-shadow: 0 4px 14px rgba(25, 78, 158, 0.2);
}

.sales-card-title {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.2px;
}

.sales-card-amount {
  font-size: 20px;
  font-weight: 700;
  margin: 6px 0 0 0;
}

.sales-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
}

.sales-doc-svg {
  width: 20px;
  height: 20px;
}

.dashboard-metrics-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-grid-card {
  background-color: var(--white);
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.01);
}

.metric-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
}

.metric-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.metric-card-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.metric-card-icon svg {
  width: 14px;
  height: 14px;
}


/* ===== NEW SIDEBAR STYLES ===== */
.sidebar-logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
}
.logo-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.sidebar-logo { height: 32px; width: auto; }
.sidebar-logo-subtitle {
  font-size: 11px;
  font-weight: 700;
  color: white;
  letter-spacing: 2px;
}

.sidebar-profile-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}
.profile-info-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sidebar-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.profile-text { display: flex; flex-direction: column; gap: 2px; }
.profile-name { font-size: 14px; font-weight: 600; color: white; }
.profile-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  padding: 0;
  border-radius: 0;
  width: auto;
}
.sidebar-toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}
.chevron-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.2s;
}
.chevron-circle.active {
  transform: rotate(180deg);
}
.chevron-icon {
  width: 16px;
  height: 16px;
}

.sidebar-saldo-card {
  margin: 8px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.saldo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.saldo-label-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: white;
}
.saldo-icon { width: 18px; height: 18px; color: white; }
.saldo-amount { font-size: 15px; font-weight: 600; color: white; }
.saldo-detail-btn-new {
  width: 100%;
  background-color: #1e3a8a;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px 0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.saldo-detail-btn-new:hover {
  background-color: #172554;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar-nav-item {
  width: 100%;
  background: transparent;
  border: none;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  position: relative;
}
.sidebar-nav-item:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.05);
}
.sidebar-nav-item.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}
.sidebar-nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: white;
}
.sidebar-nav-item .nav-icon {
  width: 18px;
  height: 18px;
  color: white;
}
.arrow-right-sub {
  margin-left: auto;
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.sidebar-nav-group {
  display: flex;
  flex-direction: column;
}
.sidebar-nav-item.parent {
  justify-content: space-between;
}
.group-chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}
.group-chevron.rotated {
  transform: rotate(-90deg);
}

.sidebar-sub-items {
  display: flex;
  flex-direction: column;
  padding-left: 20px;
  background-color: rgba(0, 0, 0, 0.15);
}
.sidebar-sub-item {
  width: 100%;
  background: transparent;
  border: none;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.sidebar-sub-item:hover {
  color: white;
}
.sidebar-sub-item.active {
  color: white;
  font-weight: 600;
}
.sidebar-sub-item .sub-icon {
  width: 16px;
  height: 16px;
  color: white;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #061d4a;
}
.sidebar-footer .compact-btn {
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
}
.sidebar-footer .compact-btn:hover {
  color: white;
}
.sidebar-footer .right-icon {
  margin-left: auto;
}

/* ===== MERCH EMPTY STATE ===== */
.merch-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  padding: 110px 32px 60px 32px; min-height: 60vh; text-align: center;
}
.merch-blue-line {
  width: 170px;
  height: 3px;
  background-color: #194E9E;
  margin-bottom: -2px;
  border-radius: 2px;
}
.merch-empty-title { 
  font-size: 16px; 
  font-weight: 700; 
  color: #0f172a; 
  margin: -10px 0 8px 0; 
  white-space: nowrap;
}
.merch-empty-desc { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0; }

/* ===== HOME REDESIGN STYLES (Matching Image) ===== */
.navbar-header.navbar-home {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  background-color: #ffffff;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  height: auto;
  border-bottom: 1px solid #f1f5f9;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease, border-color 0.35s ease, padding 0.35s ease;
}

.navbar-header.navbar-home.navbar-scrolled {
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
}

.home-nav-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.home-nav-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0 2px 0;
}

.account-group {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.nav-menu-lines-btn {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
}

.menu-lines-icon {
  width: 26px;
  height: 26px;
  color: #194e9e;
  transition: color 0.35s ease;
}

.navbar-scrolled .menu-lines-icon {
  color: #194e9e;
}

.account-text-info {
  display: flex;
  flex-direction: column;
}

.account-name {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  transition: color 0.35s ease;
}

.navbar-scrolled .account-name {
  color: #0f172a;
}

.account-subtitle {
  font-size: 8.5px;
  color: #64748b;
  opacity: 0.85;
  transition: color 0.35s ease;
}

.navbar-scrolled .account-subtitle {
  color: #64748b;
}

.nav-right-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.nav-icon-btn {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.nav-icon-btn:hover {
  opacity: 0.8;
}

.search-toggle-btn.active {
  background-color: rgba(25, 78, 158, 0.08);
}

.header-action-icon {
  width: 22px;
  height: 22px;
  color: #194e9e;
  transition: color 0.35s ease;
}

.navbar-scrolled .header-action-icon {
  color: #194e9e;
}

.notification-badge-dot {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 7px;
  height: 7px;
  background-color: #16a34a;
  border-radius: 50%;
  border: 1.5px solid #ffffff;
}

.home-search-bar {
  display: flex;
  align-items: center;
  background-color: #f5f6f8;
  border: 1px solid #e5e7eb;
  border-radius: 50px;
  padding: 0 14px;
  height: 44px;
  width: 100%;
}

.search-bar-icon {
  width: 17px;
  height: 17px;
  margin-right: 10px;
  stroke: #194e9e;
  flex-shrink: 0;
}

.search-bar-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12.5px;
  color: #1f2937;
  flex: 1;
  width: 100%;
}

.search-close-btn {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  margin-left: 6px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.search-close-btn:hover {
  background-color: #e2e8f0;
}

.close-search-icon {
  width: 15px;
  height: 15px;
}

.search-bar-wrapper {
  width: 100%;
  overflow: hidden;
}

/* Ultra Smooth Search Bar Collapse Transition */
.search-collapse-enter-active {
  transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              margin 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 70px;
  opacity: 1;
  transform: translateY(0) scaleY(1);
  transform-origin: top center;
  overflow: hidden;
}

.search-collapse-leave-active {
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 70px;
  opacity: 1;
  transform: translateY(0) scaleY(1);
  transform-origin: top center;
  overflow: hidden;
}

.search-collapse-enter-from,
.search-collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px) scaleY(0.85);
  margin-top: -4px;
  overflow: hidden;
}

.search-filter-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
}



.home-redesign-body {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  touch-action: pan-y;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #ffffff;
  flex-shrink: 0;
}

.home-redesign-body > * {
  flex-shrink: 0;
}

/* ===== Image Slider Styles (Height Shortened to 75px - Ultra Slim) ===== */
.slider-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  height: 75px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  touch-action: pan-y;
}

.slider-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  touch-action: pan-y;
}

.slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.slider-dots {
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 4px;
  z-index: 2;
}

.slider-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-dot.active {
  width: 14px;
  border-radius: 4px;
  background-color: #194e9e;
}

/* Full Mobile Responsiveness */
@media (max-width: 480px) {
  .mobile-wrapper {
    width: 100%;
    max-width: 100%;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
    box-shadow: none;
    overflow-x: hidden;
  }

  .home-redesign-body {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
    touch-action: pan-y;
    padding: 12px;
    gap: 14px;
  }

  .coming-soon-wrapper,
  .most-popular-wrapper {
    margin-left: -12px;
    margin-right: -12px;
    padding: 8px 12px;
    width: calc(100% + 24px);
    max-width: calc(100% + 24px);
  }

  .slider-container {
    height: 70px;
  }
}

/* ===== CTA BANNER SLIDER STYLES ===== */
.cta-banner-slider-wrapper {
  margin-top: 18px;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
  touch-action: pan-y;
  user-select: none;
}

.cta-banner-slider {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.07);
  cursor: pointer;
  background-color: #f8fafc;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta-banner-slider:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.1);
}

.cta-banner-slider:active {
  transform: scale(0.985);
}

.cta-banner-track {
  display: flex;
  width: 100%;
}

.cta-banner-slide {
  flex: 0 0 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
}

.cta-banner-img {
  width: 100%;
  height: auto;
  max-height: 180px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.cta-banner-dots {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 5;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  padding: 3px 6px;
  border-radius: 12px;
}

.cta-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-dot.active {
  width: 10px;
  border-radius: 4px;
  background-color: #194e9e;
}

/* ===== CITY EVENT DISCOVERY STYLES ===== */
.city-section-header {
  margin-top: 2px;
  margin-bottom: 2px;
}

.city-scroll-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 2px;
  overflow-x: auto;
  padding: 2px 0 6px 0;
  margin-top: 0px;
  margin-bottom: 18px;
  scrollbar-width: none;
  touch-action: pan-x;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
}

.city-scroll-list::-webkit-scrollbar {
  display: none;
}

.city-card {
  flex: 0 0 auto;
  min-width: 68px;
  background-color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.city-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.city-card:active {
  transform: scale(0.96);
}

.city-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.city-card:hover .city-icon-wrapper {
  background-color: #e2eefe;
}

.city-icon-svg {
  width: 22px;
  height: 22px;
}

.city-card-name {
  font-size: 11px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
}

/* ===== MERCH CARD SECTION STYLES ===== */
.merch-scroll-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0 10px 0;
  margin-top: 4px;
  margin-bottom: 20px;
  scrollbar-width: none;
  touch-action: pan-x;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
}

.merch-scroll-list::-webkit-scrollbar {
  display: none;
}

/* ===== MERCH CARD SECTION STYLES ===== */
.merch-scroll-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 12px 0;
  margin-top: 4px;
  margin-bottom: 20px;
  scrollbar-width: none;
  touch-action: pan-x;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
}

.merch-scroll-list::-webkit-scrollbar {
  display: none;
}

.merch-card {
  flex: 0 0 100%;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  user-select: none;
}

.merch-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.merch-thumb-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
  background-color: #f8fafc;
  overflow: hidden;
}

.merch-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.merch-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: #194e9e;
  color: #ffffff;
  font-size: 8.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.merch-info {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.merch-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  flex-shrink: 0;
  padding-right: 18px;
}

.merch-title.static {
  padding-right: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.merch-creator-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}

.merch-creator-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.merch-creator-text-group {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.merch-creator-label {
  font-size: 9.5px;
  color: #000000;
  font-weight: 400;
}

.merch-creator-name {
  font-size: 11.5px;
  font-weight: 500;
  color: #000000;
}

.merch-price {
  font-size: 15px;
  font-weight: 800;
  color: #000000;
  margin-top: 2px;
}
</style>
