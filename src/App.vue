<template>
  <div id="app" :class="{ 'sidebar-collapsed': isSidebarCollapsed, 'mobile-view': isMobile }">
    <div v-if="isMobile && !isSidebarCollapsed" class="sidebar-overlay" @click="toggleSidebar"></div>
    <button @click="toggleTheme" class="btn theme-toggle-btn" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
      <i :class="isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"></i>
    </button>
    <div class="sidebar">
      <button 
        class="btn btn-sm btn-outline-light sidebar-toggle-btn top-right-absolute" 
        @click="toggleSidebar"
        v-if="!(isSidebarCollapsed && !isMobile)"
      >
        <!-- Icon changes based on desktop/mobile and collapsed state -->
        <i v-if="isMobile && !isSidebarCollapsed" class="bi bi-x-lg"></i> <!-- Close icon for mobile overlay when open -->
        <i v-else-if="!isMobile && !isSidebarCollapsed" class="bi bi-arrow-left-square-fill"></i> <!-- Left arrow for desktop when open -->
        <!-- This button is now hidden if !isMobile && isSidebarCollapsed -->
      </button>
      <h2 class="sidebar-title"><span v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">My Devotions</span></h2>
      <div class="search-bar mb-3" v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="Search..."
          v-model="searchQuery"
        />
      </div>
      <ul class="list-unstyled saved-devotions-list" v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">
        <li v-if="filteredDevotions.length === 0 && searchQuery" class="text-muted small p-2">No matches found.</li>
        <li v-if="filteredDevotions.length === 0 && !searchQuery && savedDevotions.length > 0" class="text-muted small p-2">No devotions saved yet.</li>
        <li
          v-for="(devotion, index) in filteredDevotions"
          :key="index"
          class="saved-devotion-card"
          @click="viewSavedDevotion(devotion)"
        >
          <h6 class="saved-devotion-topic">{{ devotion.topic || "Saved Devotion" }}</h6>
          <p class="saved-devotion-excerpt">{{truncateText(devotion.text, 30)}}</p>
          <button class="btn btn-sm btn-outline-danger delete-saved-btn" @click.stop="handleDeleteDevotion(getOriginalIndex(devotion))">
            <i class="bi bi-trash3"></i>
          </button>
        </li>
      </ul>
      <!-- Desktop collapsed icons -->
      <div class="sidebar-collapsed-icons" v-if="isSidebarCollapsed && !isMobile">
        <i class="bi bi-search" @click="toggleSidebar" title="Search Devotions"></i>
        <i class="bi bi-card-list" @click="toggleSidebar" title="View Devotions"></i>
      </div>
    </div>

    <div class="main-content">
      <!-- This button is now primarily for opening sidebar on mobile, or expanding on desktop if it was collapsed -->
      <button class="btn btn-sm btn-outline-light sidebar-toggle-btn-main" @click="toggleSidebar" v-if="isSidebarCollapsed">
         <i class="bi bi-list"></i> <!-- Hamburger icon for mobile -->
      </button>
      <header class="text-center mb-5">
        <h1 class="display-4 app-title">DivineDevotion</h1>
        <p class="lead">Your AI-powered spiritual companion</p>
      </header>

      <!-- Devotion Generator Section - Updated to Card UI -->
      <div class="card shadow-lg mb-5 mx-auto devotion-generator-card" style="max-width: 42rem;">
        <div class="card-header bg-transparent py-3">
          <h2 class="card-title h4 d-flex align-items-center gap-2 mb-1">
            <i class="bi bi-stars text-primary" style="font-size: 1.5rem;"></i>
            Request Your Devotion
          </h2>
          <p class="card-text text-muted small">
            Enter a topic or feeling, and let AI craft a personalized devotion grounded in the Bible, Ellen G. White's writings, and SDA beliefs.
          </p>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleGenerateDevotion">
            <div class="mb-3">
              <label for="devotionTopicInput" class="form-label">Devotion Topic</label>
              <textarea
                id="devotionTopicInput"
                class="form-control form-control-lg"
                placeholder="e.g., Finding peace in anxiety, Guidance on faith, Sabbath rest..."
                v-model="devotionTopic"
                rows="3"
                style="resize: none;"
                :disabled="isLoading"
                aria-label="Enter your devotion topic or request"
              ></textarea>
            </div>
            <button
              type="submit"
              class="btn btn-gradient btn-lg w-100"
              :disabled="isLoading || !devotionTopic.trim()"
            >
              <span v-if="isLoading">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating...
              </span>
              <span v-else><i class="bi bi-stars me-2"></i>Generate Devotion</span>
            </button>
          </form>
          <div v-if="generationError" class="alert alert-danger mt-3" role="alert">
            <strong>Error:</strong> {{ generationError }}
          </div>
        </div>
      </div>

      <!-- Devotion Display Section - Updated to Card UI -->
      <div v-if="isLoading || (currentDevotion.text && !generationError)" class="card shadow-lg mb-5 mx-auto current-devotion-card" style="max-width: 42rem;">
        <div class="card-header bg-transparent py-3">
          <h3 class="card-title h4 d-flex align-items-center gap-2 mb-0">
             <i class="bi bi-journal-text me-2" style="font-size: 1.5rem;"></i>Your Devotion
          </h3>
        </div>
        <div class="card-body">
          <div v-if="isLoading" class="text-center py-3">
            <div class="spinner-border text-primary mb-2" style="width: 3rem; height: 3rem;" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="lead mt-2">Generating your devotion...</p>
            <div class="placeholder-glow mt-4">
              <span class="placeholder col-9 mb-2 py-2"></span>
              <span class="placeholder col-12 mb-2 py-2"></span>
              <span class="placeholder col-10 mb-2 py-2"></span>
              <span class="placeholder col-12 py-2"></span>
            </div>
          </div>
          
          <div v-else-if="currentDevotion.text && !generationError">
            <div v-if="currentDevotion.verses && currentDevotion.verses.length > 0" class="first-verse-highlight">
              <span class="verse-reference-bold">{{ currentDevotion.verses[0] }}</span>
              <blockquote v-if="firstVerseText" class="verse-text-blockquote">
                “{{ firstVerseText }}”
              </blockquote>
            </div>
            <DevotionDisplay :devotion="formattedDevotionForDisplay" />
            <div class="text-center mt-4 pt-3 border-top border-secondary">
              <button class="btn btn-gradient-success btn-lg" @click="handleSaveCurrentDevotion">
                <i class="bi bi-heart-fill me-2"></i>Save This Devotion
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Placeholder for when nothing is generated and not loading, and no error -->
      <section v-else-if="!isLoading && !currentDevotion.text && !generationError" class="text-center placeholder-section mx-auto p-5 rounded">
        <i class="bi bi-lightbulb-fill"></i>
        <p class="lead">Enter a topic above to generate your first devotion.</p>
        <p class="text-muted">Or, select a saved devotion from the sidebar.</p>
      </section>

      <div v-if="showSaveConfirmation" class="alert alert-success-custom alert-dismissible fade show mt-3" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>Devotion saved successfully!
        <button type="button" class="btn-close btn-close-white" @click="showSaveConfirmation = false" aria-label="Close"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue'; // Added onUnmounted
import DevotionDisplay from './components/DevotionDisplay.vue';
import useOpenAI from './composables/useOpenAI';
import useDevotions, { type Devotion } from './composables/useDevotions'; // Ensure Devotion type is exported and imported

const devotionTopic = ref('');
const currentDevotion = ref<Devotion>({
  text: '',
  verses: [],
  topic: '',
});

const { generateOpenAIDevotion, isLoading, error: generationError } = useOpenAI();
const { savedDevotions, saveDevotion, deleteDevotion } = useDevotions();

const showSaveConfirmation = ref(false);
const searchQuery = ref('');

// Mobile responsiveness
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Initialize isSidebarCollapsed. On initial load, if it's mobile, it should be collapsed.
const isSidebarCollapsed = ref(window.innerWidth <= 768);
const firstVerseText = ref('');

// Initialize isDarkMode from localStorage or default to true (dark mode)
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  return true; // Default to dark mode
};
const isDarkMode = ref(initializeTheme());

// Function to toggle theme
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
};

// Watch for changes in isDarkMode, update data-bs-theme attribute, and save to localStorage
watchEffect(() => {
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
});

// Apply the theme when the component is mounted
// This ensures the theme is set correctly on initial load based on localStorage or default
onMounted(() => {
  // Mobile check and sidebar state
  checkMobile(); // Call once to set initial state for isMobile
  if (isMobile.value) {
    isSidebarCollapsed.value = true; // Ensure sidebar is collapsed on mobile initial load
  }
  window.addEventListener('resize', checkMobile);

  // Theme initialization
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// Fetch the text of the first verse when currentDevotion.verses changes
watch(() => currentDevotion.value.verses && currentDevotion.value.verses[0], async (verse) => {
  if (!verse) {
    firstVerseText.value = '';
    return;
  }
  // Parse the verse reference
  const match = verse.match(/^(\d*\s*[a-zA-Z\s]+)\s*(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) {
    firstVerseText.value = '';
    return;
  }
  const book = match[1].trim().toLowerCase().replace(/\s+/g, '');
  const chapter = match[2];
  const startVerse = match[3];
  const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${book}/chapters/${chapter}/verses/${startVerse}.json`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      firstVerseText.value = '';
      return;
    }
    const data = await response.json();
    firstVerseText.value = data.text ? data.text.trim() : '';
  } catch {
    firstVerseText.value = '';
  }
}, { immediate: true });

const filteredDevotions = computed(() => {
  if (!searchQuery.value) {
    return savedDevotions.value;
  }
  return savedDevotions.value.filter(devotion =>
    (devotion.topic && devotion.topic.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (devotion.text && devotion.text.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

const getOriginalIndex = (devotionToFind: Devotion): number => {
  return savedDevotions.value.findIndex(d => d.text === devotionToFind.text && d.topic === devotionToFind.topic);
};


const handleGenerateDevotion = async () => {
  if (!devotionTopic.value.trim()) return;
  currentDevotion.value = { text: '', verses: [], topic: '' };
  try {
    const result = await generateOpenAIDevotion(devotionTopic.value);
    currentDevotion.value = { text: result.text, verses: result.verses, topic: devotionTopic.value };
  } catch (err) {
    console.error('Error generating devotion in component:', err);
  }
};

const handleSaveCurrentDevotion = () => {
  if (currentDevotion.value.text) {
    // Check if it's already saved to prevent exact duplicates from current reflection
    const isAlreadySaved = savedDevotions.value.some(
      (d) => d.text === currentDevotion.value.text && d.topic === currentDevotion.value.topic
    );
    if (!isAlreadySaved) {
      saveDevotion({ ...currentDevotion.value }); // Save a copy
      showSaveConfirmation.value = true;
      setTimeout(() => {
        showSaveConfirmation.value = false;
      }, 3000);
    } else {
      // Optionally, provide feedback that it's already saved
      console.log("This devotion is already saved.");
       showSaveConfirmation.value = true; // Or a different message
      setTimeout(() => {
        showSaveConfirmation.value = false;
      }, 3000);
    }
  }
};

const handleDeleteDevotion = (index: number) => {
  if (index > -1) {
    // If the deleted devotion is currently being viewed, clear the view
    if (currentDevotion.value.topic === savedDevotions.value[index]?.topic && currentDevotion.value.text === savedDevotions.value[index]?.text) {
        currentDevotion.value = { text: '', verses: [], topic: ''};
    }
    deleteDevotion(index);
  }
};

const viewSavedDevotion = (devotion: Devotion) => {
  currentDevotion.value = { ...devotion }; // View a copy
  // if (isSidebarCollapsed.value) { // Optional: expand sidebar when a devotion is clicked from collapsed state
  //   // isSidebarCollapsed.value = false;
  // }
  if (isMobile.value && !isSidebarCollapsed.value) { // Close sidebar on mobile after selection
    isSidebarCollapsed.value = true;
  }
};

const truncateText = (text: string, length: number) => {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// Format devotion for display: bold title, bold+italic verses in list
const formattedDevotionForDisplay = computed(() => {
  if (!currentDevotion.value.text) return currentDevotion.value;
  
  let text = currentDevotion.value.text;
  // Regex to find a line that looks like a title (ends with :, —, or --)
  // It captures optional markdown bolding around the title text.
  text = text.replace(/^(?:\\*\\*([^*]+)\\*\\*|([^:]+?))(:|—|--)(\\s|$)/, (match, p1, p2, p3, p4) => {
    const titleContent = p1 || p2; // p1 is content from **bold**, p2 is non-bold
    // Using a class for the title styling
    return `<strong class="devotion-title-intro">${titleContent.trim()}${p3}</strong>${p4}`;
  });

  return {
    ...currentDevotion.value,
    text, // The modified text with the bolded title
    verses: currentDevotion.value.verses, // Verses are passed as-is, DevotionDisplay handles their styling
  };
});

</script>

<style>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

/* General App Styles */
:root {
  --primary-color: #007bff;
  --primary-gradient: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
  --success-gradient: linear-gradient(to right, #11998e 0%, #38ef7d 100%);
}

/* Light Theme (Bootstrap default or custom overrides) */
[data-bs-theme="light"] {
  --sidebar-bg-light: linear-gradient(to right, #70e1f5, #ffd194);
  /* You might want to adjust text colors for the sidebar in light mode if default Bootstrap ones don't fit well */
  /* --sidebar-text-color-light: #your_choice; */
}

/* Dark Theme (Bootstrap default or custom overrides) */
[data-bs-theme="dark"] {
  --bs-body-bg: #1a1a2e; /* Deep blue/purple */
  --bs-body-color: #e0e0e0; /* Light text for dark backgrounds */
  --bs-border-color: #101011;
  --bs-card-bg: #1f4068; /* Card background */
  --bs-card-border: #2a2a2a;
  --bs-hover-bg: #2a3b57;

  /* Custom sidebar gradient for dark mode */
  --sidebar-bg-dark: linear-gradient(to bottom, #1a1919, #212529);
}

/* Sidebar Styles */
.sidebar {
  width: 300px;
  /* background-color: var(--bs-card-bg); */ /* Replaced by theme-specific backgrounds */
  padding: 20px;
  border-right: 1px solid var(--bs-border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease, padding 0.3s ease, transform 0.3s ease;
  z-index: 1000;
}

[data-bs-theme="dark"] .sidebar {
  background-image: var(--sidebar-bg-dark);
}

[data-bs-theme="light"] .sidebar {
  background-color: var(--sidebar-bg-light);
}

#app.sidebar-collapsed .sidebar {
  width: 60px; /* Collapsed width */
  padding: 20px 10px;
}

#app.sidebar-collapsed .sidebar .sidebar-title span,
#app.sidebar-collapsed .sidebar .search-bar,
#app.sidebar-collapsed .sidebar .saved-devotions-list {
  display: none;
}

.sidebar-toggle-btn {
  /* position: absolute; */
  /* top: 10px; */
  /* right: 10px; */
  z-index: 1001;
  font-size: 1.2rem;
  padding: 0.2rem 0.5rem;
  margin-bottom: 1rem; /* Space below toggle button */
  align-self: flex-end; /* Push to the right */
}

#app.sidebar-collapsed .sidebar-toggle-btn {
  align-self: center; /* Center when collapsed */
}

.top-right-absolute {
    position: absolute;
    top: 15px;
    right: 15px;
}

#app.sidebar-collapsed .top-right-absolute {
    position: static; /* Revert to flow when collapsed */
    align-self: center;
}


.sidebar-collapsed-icons {
  display: none; /* Hidden by default */
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Space between icons */
  margin-top: 20px;
}

#app.sidebar-collapsed .sidebar-collapsed-icons {
  display: flex; /* Shown when sidebar is collapsed */
}

.sidebar-collapsed-icons i {
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--dark-text-muted);
  transition: color 0.2s ease;
}

.sidebar-collapsed-icons i:hover {
  color: var(--primary-color);
}


.sidebar-title {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  color: var(--dark-text);
}

.search-bar .form-control {
  background-color: var(--dark-input-bg);
  border: 1px solid var(--dark-input-border);
  color: var(--dark-text);
}
.search-bar .form-control::placeholder {
  color: var(--dark-placeholder);
}

.saved-devotions-list {
  flex-grow: 1;
  overflow-y: auto; /* Allows scrolling within the list if it overflows */
}

.saved-devotion-card {
  background-color: var(--dark-card);
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  border: 1px solid var(--dark-border);
  position: relative; /* For absolute positioning of delete button */
}

.saved-devotion-card:hover {
  background-color: var(--dark-hover-bg);
  transform: translateY(-2px);
}

.saved-devotion-topic {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--dark-text);
  margin-bottom: 5px;
}

.saved-devotion-excerpt {
  font-size: 0.8rem;
  color: var(--dark-text-muted);
  margin-bottom: 0;
  line-height: 1.4;
}

.delete-saved-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #ff6b6b; /* Light red for visibility */
  border-color: #ff6b6b;
  padding: 2px 5px;
  font-size: 0.7rem;
}
.delete-saved-btn:hover {
  background-color: #ff6b6b;
  color: white;
}


.main-content {
  margin-left: 300px; /* Same as sidebar width */
  padding: 2rem 3rem;
  flex-grow: 1;
  /* overflow-y: auto; */ /* Let specific lists scroll */
  height: 100vh; /* Ensure it takes full viewport height */
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

#app.sidebar-collapsed .main-content {
  margin-left: 60px; /* Collapsed sidebar width */
}

/* General Card Styling */
.card {
  background-color: var(--dark-card);
  border: 1px solid var(--dark-border);
  color: var(--dark-text);
}

.card-header {
  background-color: transparent !important; /* Ensure transparency over Bootstrap defaults */
  border-bottom: 1px solid var(--dark-border);
  color: var(--dark-text);
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.card-body {
  color: var(--dark-text);
}

.card-title.h4 { /* Targeting .card-title specifically if it's an h4 */
  font-weight: 400; 
  color: var(--dark-text);
}
.card-text.text-muted {
  color: var(--dark-text-muted) !important;
}

/* Form elements within cards */
.card .form-control {
  background-color: var(--dark-input-bg);
  border: 1px solid var(--dark-input-border);
  color: var(--dark-text);
}

.card .form-control::placeholder {
  color: var(--dark-placeholder);
}

.card .form-control:focus {
  background-color: var(--dark-input-bg);
  border-color: var(--primary-color);
  color: var(--dark-text);
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25); /* Assumes Bootstrap 5 --bs-primary-rgb is available */
}

.card .form-label {
  color: var(--dark-text); 
  font-weight: 500;
}

/* Styling for the first verse highlight section */
.first-verse-highlight {
  background-color: var(--dark-surface);
  border: 1px solid var(--dark-border);
  border-left: 4px solid var(--primary-color);
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem !important; 
  border-radius: 0.375rem; 
}

.first-verse-highlight .verse-reference-bold {
  font-weight: bold;
  font-size: 1.15rem;
  color: var(--primary-color); 
  display: block;
  margin-bottom: 0.5rem;
}

.first-verse-highlight .verse-text-blockquote {
  font-size: 1.05rem;
  border-left: none;
  padding-left: 0;
  margin-top: 0.25rem;
  margin-bottom: 0;
  background-color: transparent;
  color: var(--dark-text-muted);
}

/* Placeholder Section Styling */
.placeholder-section {
  max-width: 42rem; 
  background-color: var(--dark-card); 
  border: 1px solid var(--dark-border); 
  /* p-5 class (padding: 3rem) is kept on the element */
  color: var(--dark-text-muted);
  /* rounded class is kept on the element */
  /* text-center class is kept on the element */
}

.placeholder-section .lead {
  color: var(--dark-text);
  font-size: 1.1rem; 
  margin-bottom: 0.5rem !important;
}
.placeholder-section .text-muted { 
   color: var(--dark-text-muted) !important;
   font-size: 0.9rem;
}

.placeholder-section .bi-lightbulb-fill {
  font-size: 3rem; 
  color: var(--primary-color);
  opacity: 0.6; 
  margin-bottom: 1rem !important; 
}

/* Style for the bolded title from formattedDevotionForDisplay */
:deep(.devotion-title-intro) {
  font-weight: bold;
  /* Add any other specific styling for the title intro here if needed */
}

.sidebar-toggle-btn-main {
    position: fixed;
    top: 15px;
    left: 15px; /* Positioned based on collapsed sidebar */
    z-index: 1005;
    font-size: 1.2rem;
    padding: 0.2rem 0.5rem;
}

.app-title {
  color: var(--dark-text);
  font-weight: 300;
}
.main-content .lead {
  color: var(--dark-text-muted);
}

.form-control {
  background-color: var(--dark-input-bg);
  color: var(--dark-text);
  border: 1px solid var(--dark-input-border);
}
.form-control:focus {
  background-color: var(--dark-input-bg);
  color: var(--dark-text);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}
.form-control::placeholder {
  color: var(--dark-placeholder);
}


.btn-gradient, .btn-gradient-success {
  border: none;
  color: white;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.btn-gradient {
  background-image: var(--primary-gradient);
}
.btn-gradient-success {
  background-image: var(--success-gradient);
}

.btn-gradient:hover, .btn-gradient-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
.btn-gradient:disabled, .btn-gradient-success:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.current-devotion .card { /* Assuming DevotionDisplay renders a card */
  background-color: var(--dark-card);
  border: 1px solid var(--dark-border);
}

.alert-danger {
  background-color: #5c2121; /* Darker red for dark mode */
  color: #f8d7da;
  border-color: #8c3232;
}

.alert-success-custom {
  background-color: #1e4620; /* Darker green for dark mode */
  color: #d1e7dd;
  border-color: #2a602c;
}

/* Styles for the new card structure */
.devotion-generator-card, .current-devotion-card {
  background-color: var(--dark-card); /* Ensure cards use the theme's card background */
  border: 1px solid var(--dark-border);
}

.devotion-generator-card .card-header, .current-devotion-card .card-header {
  border-bottom: 1px solid var(--dark-border); /* Add a subtle separator */
}

/* Adjust DevotionDisplay related styles since it's no longer a card itself */
.devotion-display-content .main-devotion-text { /* Updated selector */
  color: var(--dark-text) !important; /* Ensure text color is consistent */
}
.devotion-display-content .verses-section-title { /* Updated selector */
   color: var(--dark-text) !important;
}
.devotion-display-content .list-group-item {
  color: var(--dark-text) !important;
  background-color: transparent !important; /* Ensure transparent background */
}
.devotion-display-content .list-group-item a {
  color: var(--dark-text) !important; /* Ensure link color is consistent */
}
.devotion-display-content .list-group-item a:hover {
  color: var(--primary-color) !important;
}
.devotion-display-content hr {
    background-color: var(--dark-border);
}

/* Scrollbar styling for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--dark-surface);
}
::-webkit-scrollbar-thumb {
  background: var(--dark-input-border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* Custom tooltip style for Bible verses */
.bible-verse-tooltip .tooltip-inner {
  background-color: var(--dark-surface); /* Use a theme color */
  color: var(--dark-text);
  border: 1px solid var(--dark-border);
  max-width: 400px; /* Adjust as needed */
  text-align: left; /* Align text to the left */
  padding: 10px;
  font-size: 0.9rem;
  white-space: pre-wrap; /* Respect newlines in verse text */
}

.bible-verse-tooltip .tooltip-arrow::before {
  border-top-color: var(--dark-border); /* Match border color */
  /* If placement is 'bottom', use border-bottom-color, etc. */
}

.devotion-display-content .list-group-item a, /* Updated selector */
:deep(.inline-verse-link) {
  font-weight: bold;
  font-style: italic;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    width: 280px; /* Or a percentage like 80vw */
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1100; /* Higher than theme toggle and overlay */
    box-shadow: 2px 0 10px rgba(0,0,0,0.2); /* Add shadow for overlay effect */
  }

  /* When sidebar should be visible on mobile (app has mobile-view and is not sidebar-collapsed) */
  #app.mobile-view:not(.sidebar-collapsed) .sidebar {
    transform: translateX(0);
  }
  
  /* Sidebar content visibility on mobile when open */
  #app.mobile-view:not(.sidebar-collapsed) .sidebar .sidebar-title span,
  #app.mobile-view:not(.sidebar-collapsed) .sidebar .search-bar,
  #app.mobile-view:not(.sidebar-collapsed) .sidebar .saved-devotions-list {
    display: block; /* Or flex, depending on original display type */
  }
  
  /* Hide desktop-specific collapsed icons on mobile */
  #app.mobile-view .sidebar-collapsed-icons {
    display: none !important;
  }

  .main-content {
    margin-left: 0;
    padding: 1rem 1rem; /* Reduced padding for mobile */
  }

  /* Sidebar toggle button in main content (hamburger) */
  .sidebar-toggle-btn-main {
    display: none; /* Hidden by default, shown by #app.mobile-view.sidebar-collapsed */
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1005; 
    font-size: 1.5rem; /* Make hamburger larger */
  }

  /* Theme toggle button position adjustment */
  button[style*="position: fixed"][style*="top: 10px"][style*="right: 10px"] {
    top: 12px;
    right: 12px;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .devotion-generator-card, .current-devotion-card {
    margin-left: auto; /* Keep mx-auto behavior */
    margin-right: auto;
    max-width: 100%; /* Allow full width within padding */
  }

  .app-title {
    font-size: 1.8rem; /* Adjust title font size */
    margin-top: 2.5rem; /* Add margin to avoid overlap with fixed buttons */
  }
  .main-content .lead {
    font-size: 0.9rem; /* Adjust lead text size */
  }

  .main-content header {
    margin-bottom: 1.5rem !important; /* Reduced margin */
  }
  .card {
    margin-bottom: 1.5rem !important; /* Reduced margin for cards */
  }
  .card-body, .card-header {
    padding: 0.75rem; /* Reduced padding inside cards */
  }
  .form-control-lg {
    font-size: 1rem; /* Adjust textarea font size */
  }
  .btn-lg {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .first-verse-highlight {
    padding: 0.75rem 1rem;
    margin-bottom: 1rem !important;
  }
  .first-verse-highlight .verse-reference-bold {
    font-size: 1.05rem;
  }
  .first-verse-highlight .verse-text-blockquote {
    font-size: 0.95rem;
  }

  .placeholder-section {
    padding: 2rem 1rem !important; /* Adjust padding */
  }
  .placeholder-section .bi-lightbulb-fill {
    font-size: 2.5rem;
    margin-bottom: 0.75rem !important;
  }
  
  /* Ensure the close button (X) in the sidebar is easily tappable */
  #app.mobile-view .sidebar .sidebar-toggle-btn.top-right-absolute {
    top: 10px;
    right: 10px;
    font-size: 1.3rem;
  }
}

/* Ensure that when sidebar is collapsed on desktop, the main toggle button uses the correct icon */
#app:not(.mobile-view).sidebar-collapsed .sidebar-toggle-btn-main i {
  /* This will be bi-arrow-right-square-fill from the template if not mobile */
   content: '\F13A'; /* Fallback if class doesn't update, though Vue should handle it */
}
#app.mobile-view.sidebar-collapsed .sidebar-toggle-btn-main i::before {
  content: "\F479"; /* Bootstrap icon for list/hamburger */
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 1099; /* Below sidebar, above content */
}

#app.mobile-view:not(.sidebar-collapsed) .sidebar-overlay {
  display: block;
}

.theme-toggle-btn {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 2000;
  padding: 0.375rem 0.75rem; /* Standard Bootstrap btn padding */
  font-size: 1.25rem; /* Adjust icon size */
  line-height: 1; /* Ensure icon is centered vertically */
  /* background-color: var(--bs-body-bg); Using btn classes will handle this */
  /* color: var(--bs-body-color); */
  /* border: 1px solid var(--bs-border-color); */
  /* border-radius: 5px; */
}

[data-bs-theme="light"] .theme-toggle-btn {
  background-color: var(--bs-light);
  color: var(--bs-dark);
  border: 1px solid var(--bs-gray-400);
}

[data-bs-theme="dark"] .theme-toggle-btn {
  background-color: var(--bs-dark);
  color: var(--bs-light);
  border: 1px solid var(--bs-gray-700);
}

.theme-toggle-btn:hover {
  opacity: 0.8;
}

</style>
