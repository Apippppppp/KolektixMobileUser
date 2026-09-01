<script setup>
import { ref } from 'vue';
import Login from './components/Login.vue';
import Home from './components/Home.vue';

const currentScreen = ref('home'); // 'login' or 'home'
</script>

<template>
  <Login v-if="currentScreen === 'login'" @login-success="currentScreen = 'home'" />
  <Home v-else @logout="currentScreen = 'login'" />
</template>
