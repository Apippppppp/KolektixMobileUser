<script setup>
import { ref } from 'vue';

// Navigation & state
const currentView = ref('login'); // 'login' or 'register'
const registerStep = ref(1); // 1, 2, or 3

// Form inputs
const email = ref('');
const password = ref('');
const showPassword = ref(false);

// Register Step 1 inputs
const eventName = ref('');
const ownerName = ref('');

// Register Step 2 inputs
const location = ref('');
const phone = ref('');

// Register Step 3 inputs
const registerEmail = ref('');
const logoFile = ref(null);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const emit = defineEmits(['login-success']);

// Handlers
const handleLogin = () => {
  emit('login-success');
};

const goToRegister = () => {
  currentView.value = 'register';
  registerStep.value = 1;
};

const goToLogin = () => {
  currentView.value = 'login';
};

const nextStep = () => {
  if (registerStep.value < 3) {
    registerStep.value++;
  } else {
    emit('login-success');
  }
};

const prevStep = () => {
  if (registerStep.value > 1) {
    registerStep.value--;
  }
};

const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    logoFile.value = file.name;
  }
};
</script>

<template>
  <div class="mobile-wrapper">
    <!-- Header Section -->
    <div class="header-section">
      <div class="logo-container">
        <img src="/media/newkolektix.d744083c.gif" alt="Kolektix Logo" class="logo-gif" />
      </div>
    </div>

    <!-- Login Card Form (Unified) -->
    <div class="login-card">
      <h1 class="welcome-title">
        {{ currentView === 'login' ? 'Welcome Back' : 'Daftar Akun Kreator' }}
      </h1>
      <p class="welcome-subtitle">Manage your events and attendees.</p>

      <!-- Login View -->
      <div v-if="currentView === 'login'" class="card-content-wrapper">
        <form @submit.prevent="handleLogin" class="form-container">
          <!-- Email Field -->
          <div class="input-group">
            <label class="input-label">Email</label>
            <div class="input-wrapper">
              <input 
                type="email" 
                v-model="email" 
                placeholder="creator@example.com" 
                class="form-input"
                required
              />
              <span class="input-icon-right">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon-svg-filled">
                  <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a1.35 1.35 0 0 1-1.428 0L1.5 8.67Z" />
                  <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                </svg>
              </span>
            </div>
          </div>

          <!-- Password Field -->
          <div class="input-group">
            <label class="input-label">Password</label>
            <div class="input-wrapper">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Masukkan Password" 
                class="form-input"
                required
              />
              <button type="button" @click="togglePassword" class="password-toggle-right">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon-svg-filled">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn">
            <span>Lanjutkan</span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="register-container">
          Belum punya akun? <a href="#" @click.prevent="goToRegister" class="register-link">Daftar Creator</a>
        </div>

        <!-- Footer Terms -->
        <div class="terms-footer">
          Dengan masuk, Anda menyetujui <br />
          <a href="#" class="terms-link">Syarat & Ketentuan</a> Kolektix.
        </div>
      </div>

      <!-- Register View -->
      <div v-else class="card-content-wrapper">
        <!-- Stepper Header -->
        <div class="stepper">
          <div class="step-wrapper">
            <div class="step-circle" :class="{ active: registerStep >= 1 }">1</div>
          </div>
          <div class="step-line" :class="{ active: registerStep >= 2 }"></div>
          <div class="step-wrapper">
            <div class="step-circle" :class="{ active: registerStep >= 2 }">2</div>
          </div>
          <div class="step-line" :class="{ active: registerStep >= 3 }"></div>
          <div class="step-wrapper">
            <div class="step-circle" :class="{ active: registerStep >= 3 }">3</div>
          </div>
        </div>

        <!-- Step 1 Form -->
        <div v-if="registerStep === 1" class="step-content">
          <form @submit.prevent="nextStep" class="form-container">
            <div class="input-group">
              <label class="input-label">Nama Penyelenggara Event</label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  v-model="eventName" 
                  placeholder="Misal: javamusikindo" 
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Nama Pemilik</label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  v-model="ownerName" 
                  placeholder="Masukan Nama Pemilik" 
                  class="form-input"
                  required
                />
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="!eventName || !ownerName">
              <span>Selanjutnya</span>
            </button>
          </form>

          <div class="register-container">
            Sudah punya akun? <a href="#" @click.prevent="goToLogin" class="register-link">Masuk</a>
          </div>
        </div>

        <!-- Step 2 Form -->
        <div v-else-if="registerStep === 2" class="step-content">
          <form @submit.prevent="nextStep" class="form-container">
            <div class="input-group">
              <label class="input-label">Lokasi / Kota Asal</label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  v-model="location" 
                  placeholder="Misalnya Jakarta" 
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">No. Telepon / Handphone</label>
              <div class="input-wrapper">
                <input 
                  type="tel" 
                  v-model="phone" 
                  placeholder="Contoh: 08123456789" 
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="btn-row">
              <button type="button" @click="prevStep" class="back-btn">
                <span>Kembali</span>
              </button>
              <button type="submit" class="submit-btn flex-1" :disabled="!location || !phone">
                <span>Selanjutnya</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Step 3 Form -->
        <div v-else-if="registerStep === 3" class="step-content">
          <form @submit.prevent="nextStep" class="form-container">
            <!-- Logo Upload Box -->
            <div class="input-group">
              <label class="input-label">Logo Creator</label>
              <label class="upload-area">
                <input type="file" accept="image/*" @change="handleLogoUpload" class="hidden-file-input" />
                <div class="upload-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="upload-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <span class="upload-text">
                    {{ logoFile ? `Terpilih: ${logoFile}` : 'Unggah logo creator (Max 2MB)' }}
                  </span>
                </div>
              </label>
            </div>

            <!-- Email Field -->
            <div class="input-group">
              <label class="input-label">Email</label>
              <div class="input-wrapper">
                <input 
                  type="email" 
                  v-model="registerEmail" 
                  placeholder="Contoh: johndoe@gmail.com" 
                  class="form-input"
                  required
                />
                <span class="input-icon-right">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon-svg-filled">
                    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a1.35 1.35 0 0 1-1.428 0L1.5 8.67Z" />
                    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                  </svg>
                </span>
              </div>
            </div>

            <div class="btn-row">
              <button type="button" @click="prevStep" class="back-btn">
                <span>Kembali</span>
              </button>
              <button type="submit" class="submit-btn flex-1" :disabled="!registerEmail">
                <span>Selanjutnya</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Footer Terms -->
        <div class="terms-footer">
          Dengan masuk, Anda menyetujui <br />
          <a href="#" class="terms-link">Syarat & Ketentuan</a> Kolektix.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-wrapper {
  width: 100%;
  max-width: 100%;
  height: 100vh;
  height: 100dvh;
  background-color: var(--white);
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

.header-section {
  background-color: var(--primary-base);
  padding: 32px 20px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-shrink: 0;
}

.logo-container {
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.logo-gif {
  max-width: 130px;
  height: auto;
  object-fit: contain;
}

/* Login Card Content */
.login-card {
  flex-grow: 1;
  background-color: var(--white);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  margin-top: -16px;
  padding: 28px 24px 20px 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.welcome-title {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 4px;
}

.welcome-subtitle {
  font-family: var(--font-serif);
  font-size: 13px;
  color: var(--dark-grey);
  margin-bottom: 24px;
}

/* Stepper Component styling */
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  padding: 0 16px;
}

.step-wrapper {
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--white);
  border: 1px solid var(--grey);
  color: var(--grey);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.step-circle.active {
  background-color: var(--primary-base);
  border-color: var(--primary-base);
  color: var(--white);
  box-shadow: 0 0 0 4px rgba(25, 78, 158, 0.15);
}

.step-line {
  flex-grow: 1;
  height: 2px;
  background-color: var(--light-grey);
  margin: 0 -4px;
  position: relative;
  z-index: 1;
  transition: background-color 0.3s;
}

.step-line.active {
  background-color: var(--primary-base);
}

/* Form layouts */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--dark);
  font-family: var(--font-sans);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-right, .password-toggle-right {
  position: absolute;
  right: 4px;
  color: var(--primary-base);
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.icon-svg-filled {
  width: 20px;
  height: 20px;
}

.form-input {
  width: 100%;
  padding: 8px 32px 8px 0;
  border: none;
  border-bottom: 1px solid var(--light-grey);
  border-radius: 0;
  font-size: 15px;
  font-family: var(--font-sans);
  color: var(--dark);
  background-color: transparent;
  outline: none;
  transition: border-color 0.2s;
}

.form-input::placeholder {
  color: #b0b0b5;
}

.form-input:focus {
  border-color: var(--primary-base);
}

/* Dash upload area for step 3 */
.upload-area {
  border: 1.5px dashed var(--dark);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: transparent;
  transition: background-color 0.2s;
  margin-top: 4px;
  height: 120px;
}

.upload-area:hover {
  background-color: var(--primary-light);
}

.hidden-file-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--primary-base);
}

.upload-icon {
  width: 32px;
  height: 32px;
}

.upload-text {
  font-size: 12px;
  color: var(--dark-grey);
  text-align: center;
  font-weight: 500;
}

/* Buttons Styling */
.submit-btn {
  background-color: var(--primary-base);
  color: var(--white);
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  font-family: var(--font-sans);
  margin-top: 8px;
}

.submit-btn:disabled {
  background-color: var(--primary-disabled);
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-light-700);
}

.submit-btn:active:not(:disabled) {
  background-color: var(--primary-light-800);
}

.btn-row {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.back-btn {
  background-color: var(--white);
  color: var(--dark);
  border: 1px solid var(--light-grey);
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: var(--font-sans);
}

.back-btn:hover {
  background-color: var(--primary-light);
}

.flex-1 {
  flex: 1;
}

/* Register Link Container */
.register-container {
  text-align: center;
  font-size: 13px;
  color: var(--dark-grey);
  margin-top: 12px;
  font-family: var(--font-sans);
}

.register-link {
  color: var(--primary-base);
  font-weight: 700;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

/* Footer Section */
.terms-footer {
  margin-top: auto;
  padding-top: 24px;
  text-align: center;
  font-size: 11px;
  color: var(--dark-grey);
  line-height: 1.5;
  font-family: var(--font-sans);
}

.terms-link {
  color: var(--primary-base);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}
</style>
