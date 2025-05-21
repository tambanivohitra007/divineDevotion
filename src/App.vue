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
      <h2 class="sidebar-title"><span v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">My Saved Content</span></h2>
      <div class="search-bar mb-3" v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="Search..."
          v-model="searchQuery"
        />
      </div>
      <ul class="list-unstyled saved-devotions-list" v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">
        <li v-if="filteredContent.length === 0 && searchQuery" class="text-muted small p-2">No matches found.</li>
        <li v-if="filteredContent.length === 0 && !searchQuery && savedContent.length > 0" class="text-muted small p-2">No content saved yet.</li>
        <li
          v-for="(content) in filteredContent"
          :key="content.id || content.topic" 
          class="saved-devotion-card"
          @click="viewSavedContent(content)"
        >
          <h6 class="saved-devotion-topic">
            {{ content.topic || "Saved Content" }}            
          </h6>
          <p class="saved-devotion-excerpt">{{truncateText(content.text, 30)}}</p>
          <span class="content-type-flag" :class="'flag-' + content.type">
              {{ content.type === 'devotion' ? 'Devo' : 'Idea' }}
            </span>
          <button 
            class="btn btn-sm btn-outline-danger delete-saved-btn" 
            @click.stop="handleDeleteContent(content.id)" 
            v-if="content.id"
            title="Delete content"
          >
            <i class="bi bi-trash3"></i>
          </button>
        </li>
      </ul>
      <!-- Desktop collapsed icons -->
      <div class="sidebar-collapsed-icons" v-if="isSidebarCollapsed && !isMobile">
        <i class="bi bi-search" @click="toggleSidebar" title="Search Content"></i>
        <i class="bi bi-card-list" @click="toggleSidebar" title="View Content"></i>
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

      <!-- Content Generator Section -->
      <div class="card shadow-lg mb-5 mx-auto devotion-generator-card" style="max-width: 60rem;">
        <div class="card-header bg-transparent py-3">
          <h2 class="card-title h4 d-flex align-items-center gap-2 mb-1">
            <i :class="selectedContentType === 'devotion' ? 'bi bi-stars text-primary' : 'bi bi-lightbulb-fill text-primary'" style="font-size: 1.5rem;"></i>
            {{ generatorCardTitle }}
          </h2>
          <p class="card-text text-muted small">
            {{ generatorCardSubtitle }}
          </p>
        </div>
        <div class="card-body">
          <ul class="nav nav-tabs nav-fill mb-3" id="contentTypeTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link" :class="{ active: selectedContentType === 'devotion' }" id="devotion-tab" @click="selectedContentType = 'devotion'" type="button" role="tab" aria-controls="devotion-panel" aria-selected="selectedContentType === 'devotion'">Devotion</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" :class="{ active: selectedContentType === 'faithIntegration' }" id="faith-integration-tab" @click="selectedContentType = 'faithIntegration'" type="button" role="tab" aria-controls="faith-integration-panel" aria-selected="selectedContentType === 'faithIntegration'">Faith & Learning Idea</button>
            </li>
          </ul>

          <form @submit.prevent="handleGenerateContent">
            <div class="mb-3">
              <textarea
                id="topicInput"
                class="form-control form-control-lg"
                rows="3"
                :placeholder="topicInputPlaceholder"
                v-model="topicInput"
                aria-label="Enter your topic or request"
              ></textarea>
            </div>
            <button
              type="submit"
              class="btn btn-gradient btn-lg w-100"
              :disabled="isLoading || !topicInput.trim()"
            >
              <span v-if="isLoading">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating...
              </span>
              <span v-else><i :class="selectedContentType === 'devotion' ? 'bi bi-stars me-2' : 'bi bi-lightbulb me-2'"></i>{{ generateButtonText }}</span>
            </button>
          </form>
          <div v-if="generationError" class="alert alert-danger mt-3" role="alert">
            <strong>Error:</strong> {{ generationError }}
          </div>
        </div>
      </div>

      <!-- Content Display Section -->
      <div v-if="isLoading || (currentContent.text && !generationError)" class="card shadow-lg mb-5 mx-auto current-devotion-card" style="max-width: 60rem;">
        <div class="card-header bg-transparent py-3">
          <h3 class="card-title h4 d-flex align-items-center gap-2 mb-0">
             <i :class="currentContent.type === 'devotion' ? 'bi bi-journal-text me-2' : 'bi bi-lightbulb me-2'" style="font-size: 1.5rem;"></i>Your {{ currentContent.type === 'devotion' ? 'Devotion' : 'Faith & Learning Idea' }}
          </h3>
        </div>
        <div class="card-body">
          <div v-if="isLoading" class="text-center py-3">
            <div class="spinner-border text-primary mb-2" style="width: 3rem; height: 3rem;" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="lead mt-2">Generating your content...</p>
            <div class="placeholder-glow mt-4">
              <span class="placeholder col-9 mb-2 py-2"></span>
              <span class="placeholder col-12 mb-2 py-2"></span>
              <span class="placeholder col-10 mb-2 py-2"></span>
              <span class="placeholder col-12 py-2"></span>
            </div>
          </div>
          
          <div v-else-if="currentContent.text && !generationError">
            <div v-if="currentContent.type === 'devotion' && currentContent.verses && currentContent.verses.length > 0" class="first-verse-highlight">
              <span class="verse-reference-bold">{{ currentContent.verses[0] }}</span>
              <blockquote v-if="firstVerseText" class="verse-text-blockquote">
                “{{ firstVerseText }}”
              </blockquote>
            </div>
            <DevotionDisplay :devotion="formattedContentForDisplay" :content-type="currentContent.type || 'devotion'" />
            <div class="actions-toolbar text-center mt-4 pt-3 border-top border-secondary">
              <button class="btn btn-gradient-success btn-sm me-2" @click="handleSaveCurrentContent">
                <i class="bi bi-heart-fill me-2"></i>Save {{ currentContent.type === 'devotion' ? 'Devotion' : 'Idea' }}
              </button>
              <button class="btn btn-outline-info btn-sm" @click="handleShareContent" title="Share this content">
                <i class="bi bi-share-fill me-2"></i>Share
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Placeholder for when nothing is generated and not loading, and no error -->
      <section v-else-if="!isLoading && !currentContent.text && !generationError" class="text-center placeholder-section mx-auto p-5 rounded">
        <i class="bi bi-lightbulb-fill"></i>
        <p class="lead">Select a type and enter a topic above to generate content.</p>
        <p class="text-muted">Or, select saved content from the sidebar.</p>
      </section>

      <div v-if="showSaveConfirmation" class="alert alert-success-custom alert-dismissible fade show mt-3" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>Content saved successfully!
        <button type="button" class="btn-close btn-close-white" @click="showSaveConfirmation = false" aria-label="Close"></button>
      </div>

      <div v-if="showShareAlert" class="alert alert-info-custom alert-dismissible fade show mt-3" role="alert">
        <i class="bi bi-info-circle-fill me-2"></i>{{ shareAlertMessage }}
        <button type="button" :class="isDarkMode ? 'btn-close btn-close-white' : 'btn-close'" @click="showShareAlert = false" aria-label="Close"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue';
import DevotionDisplay from './components/DevotionDisplay.vue';
import useOpenAI from './composables/useOpenAI';
// Correctly import useContentStorage and StoredContent type
import useContentStorage, { type StoredContent } from './composables/useDevotions'; 

const selectedContentType = ref<'devotion' | 'faithIntegration'>('devotion');
const topicInput = ref(''); // Renamed from devotionTopic

const currentContent = ref<StoredContent>({
  id: '',
  text: '',
  verses: [],
  topic: '',
  type: 'devotion',
});

const { generateOpenAIContent, isLoading, error: generationError } = useOpenAI(); // Renamed function
const { savedContent, saveContent, deleteContent, loadContent } = useContentStorage(); // Updated import and usage

const showSaveConfirmation = ref(false);
const searchQuery = ref('');

const showShareAlert = ref(false);
const shareAlertMessage = ref('');

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
  loadContent(); // Ensure content is loaded on mount
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

// Computed properties for dynamic UI text
const generatorCardTitle = computed(() => {
  return selectedContentType.value === 'devotion' ? 'Request Your Devotion' : 'Generate Faith & Learning Idea';
});

const generatorCardSubtitle = computed(() => {
  return selectedContentType.value === 'devotion' 
    ? 'Enter a topic or feeling, and let AI craft a personalized devotion grounded in the Bible.' 
    : 'Describe a topic or subject, and let AI suggest ways to integrate faith and learning.';
});

const topicInputPlaceholder = computed(() => {
  return selectedContentType.value === 'devotion' 
    ? "E.g., 'finding peace in hardship', 'gratitude', or 'guidance for a tough decision'"
    : "E.g., 'teaching biology through a faith lens', 'integrating ethics in computer science', or 'faith perspectives on history'";
});

const generateButtonText = computed(() => {
  return selectedContentType.value === 'devotion' ? 'Generate Devotion' : 'Generate Idea';
});

// Fetch the text of the first verse when currentContent.verses changes
watch(() => (currentContent.value.type === 'devotion' && currentContent.value.verses && currentContent.value.verses[0]), async (verse) => {
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

const filteredContent = computed(() => { // Renamed from filteredDevotions
  if (!searchQuery.value) {
    return savedContent.value;
  }
  return savedContent.value.filter(item =>
    (item.topic && item.topic.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (item.text && item.text.toLowerCase().includes(searchQuery.value.toLowerCase()))
    // Optionally, filter by type: || (item.type && item.type.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

const getOriginalIndex = (contentToFind: StoredContent): number => {
  // This function might not be needed if deleting by ID, but ensure StoredContent has an id
  if (!contentToFind.id) return -1;
  return savedContent.value.findIndex(d => d.id === contentToFind.id);
};

const handleGenerateContent = async () => {
  if (!topicInput.value.trim()) return;
  const newId = `content-${Date.now()}`; // Generate ID here
  currentContent.value = { id: newId, text: '', verses: [], topic: '', type: selectedContentType.value }; // Initialize with selected type and ID
  try {
    const result = await generateOpenAIContent(topicInput.value, selectedContentType.value);
    currentContent.value = { 
      id: newId, // Persist ID
      text: result.text, 
      verses: result.verses || [], 
      topic: topicInput.value, 
      type: selectedContentType.value 
    };
  } catch (err) {
    console.error('Error generating content in component:', err);
  }
};


const handleSaveCurrentContent = () => {
  if (currentContent.value.text) {
    if (!currentContent.value.id) {
      currentContent.value.id = `content-${Date.now()}`;
    }
    const isAlreadySaved = savedContent.value.some(
      (d) => d.id === currentContent.value.id || (d.text === currentContent.value.text && d.topic === currentContent.value.topic && d.type === currentContent.value.type)
    );
    if (!isAlreadySaved) {
      saveContent({ ...currentContent.value }); 
      showSaveConfirmation.value = true;
      setTimeout(() => {
        showSaveConfirmation.value = false;
      }, 3000);
    } else {
      shareAlertMessage.value = 'This content is already saved.';
      showShareAlert.value = true;
       setTimeout(() => {
        showShareAlert.value = false;
      }, 3000);
    }
  }
};

const handleDeleteContent = (id?: string) => { 
  if (!id) return;

  const itemToDelete = savedContent.value.find(item => item.id === id);

  if (itemToDelete && currentContent.value.id === itemToDelete.id) {
      currentContent.value = { id: `content-${Date.now()}`, text: '', verses: [], topic: '', type: selectedContentType.value };
  }
  deleteContent(id); 
};


const viewSavedContent = (content: StoredContent) => { // Renamed from viewSavedDevotion, updated type
  currentContent.value = { ...content };
  selectedContentType.value = content.type || 'devotion'; // Update tab selection
  if (isMobile.value && !isSidebarCollapsed.value) {
    isSidebarCollapsed.value = true;
  }
};

const handleShareContent = async () => { // Renamed from handleShareDevotion
  if (!currentContent.value.text) return;

  const title = currentContent.value.topic 
    ? `${currentContent.value.type === 'devotion' ? 'Devotion' : 'Faith & Learning Idea'}: ${currentContent.value.topic}` 
    : `A Divine ${currentContent.value.type === 'devotion' ? 'Devotion' : 'Idea'}`;
  
  let shareText = currentContent.value.text;
  if (currentContent.value.type === 'devotion' && currentContent.value.verses && currentContent.value.verses.length > 0) {
    const versesText = currentContent.value.verses.join("\n");
    shareText += `\n\nKey Verses:\n${versesText}`;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: shareText,
      });
      shareAlertMessage.value = 'Content shared successfully!';
      showShareAlert.value = true;
      setTimeout(() => { showShareAlert.value = false; }, 3000);
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') {
        console.error('Error sharing, falling back to clipboard: ', err);
        await copyToClipboard(shareText, 'fallback'); 
      }
    }
  } else {
    await copyToClipboard(shareText, 'direct');
  }
};

// Helper function to copy text to clipboard
const copyToClipboard = async (text: string, context: 'fallback' | 'direct' = 'direct') => {
  try {
    await navigator.clipboard.writeText(text);
    if (context === 'fallback') {
      shareAlertMessage.value = 'Sharing failed, content copied to clipboard!';
    } else {
      shareAlertMessage.value = 'Content copied to clipboard!';
    }
    showShareAlert.value = true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    shareAlertMessage.value = 'Failed to copy content to clipboard.';
    showShareAlert.value = true; // Show error
  } finally {
    // Common timeout for the alert
    setTimeout(() => {
      showShareAlert.value = false;
    }, 3000);
  }
};

// Format content for display
const formattedContentForDisplay = computed(() => { // Renamed from formattedDevotionForDisplay
  if (!currentContent.value.text) return currentContent.value;
  
  let text = currentContent.value.text;
  // Bold title only for devotions, or make it conditional if titles apply to faithIntegration too
  if (currentContent.value.type === 'devotion') {
    text = text.replace(/^(?:\*\*([^*]+)\*\*|([^:]+?))(:|—|--)(\s|$)/, (match, p1, p2, p3, p4) => {
      const titleContent = p1 || p2;
      return `<strong class="devotion-title-intro">${titleContent.trim()}${p3}</strong>${p4}`;
    });
  }

  return {
    ...currentContent.value,
    text,
    verses: currentContent.value.verses || [], // Ensure verses is an array
  };
});

const truncateText = (text: string, length: number) => {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
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
</script>

<style>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

/* General App Styles */
:root {
  --primary-color: #1ec5d5;
  --primary-gradient: linear-gradient(to right, #118dcb 0%, #0f254c 100%);
  --success-gradient: linear-gradient(to right, #f7f426 0%, #38efc1 100%);
}

/* Light Theme (Bootstrap default or custom overrides) */
[data-bs-theme="light"] {
  --sidebar-bg-light: linear-gradient(to bottom, #70e1f5, #ffd194);
  --save-btn-bg-light: linear-gradient(to right, #56ab2f, #a8e063);
  --save-btn-text-light: #ffffff;
  --save-btn-hover-shadow-light: 0 4px 15px rgba(0, 0, 0, 0.2);
  --themed-placeholder-color: rgba(0, 0, 0, 0.55); /* Muted dark gray for light theme placeholders */

  /* New variables for sidebar items in light theme */
  --sidebar-item-bg: #ffffff;
  --sidebar-item-hover-bg: #f0f0f0; /* Light grey for hover */
  --sidebar-item-border-color: #dee2e6;
  --sidebar-item-text-color: #212529;
  --sidebar-item-muted-text-color: #6c757d;
}

/* Dark Theme (Bootstrap default or custom overrides) */
[data-bs-theme="dark"] {
  --bs-body-bg: #1a1a2e;
  --bs-body-color: #e0e0e0;
  --bs-border-color: #101011;
  --bs-card-bg: #1f4068;
  --bs-hover-bg: #2a3b57;
  --sidebar-bg-dark: linear-gradient(to bottom, #1a1919, #212529);
  --save-btn-bg-dark: linear-gradient(to right, #11998e, #38ef7d);
  --save-btn-text-dark: #ffffff;
  --save-btn-hover-shadow-dark: 0 4px 15px rgba(0, 0, 0, 0.3);
  --themed-placeholder-color: rgba(255, 255, 255, 0.45); /* Muted light gray for dark theme placeholders */

  /* New variables for sidebar items in dark theme */
  --sidebar-item-bg: #27273a; /* Slightly lighter than body bg */
  --sidebar-item-hover-bg: #3a3a52; /* Hover for the above */
  --sidebar-item-border-color: #40405a;
  --sidebar-item-text-color: var(--bs-body-color);
  --sidebar-item-muted-text-color: rgba(224, 224, 224, 0.65);
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
  color: var(--themed-placeholder-color);
  font-weight: 300;
}

.saved-devotions-list {
  flex-grow: 1;
  overflow-y: auto; /* Allows scrolling within the list if it overflows */
}

.saved-devotion-card {
  background-color: var(--sidebar-item-bg);
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  border: 1px solid var(--sidebar-item-border-color);
  position: relative; /* For absolute positioning of delete button */
}

.saved-devotion-card:hover {
  background-color: var(--sidebar-item-hover-bg);
  transform: translateY(-2px);
}

.saved-devotion-topic {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--sidebar-item-text-color);
  margin-bottom: 5px;
  margin-right: 35px; /* Add space for the delete button */
  overflow: hidden; /* Prevent overflow */
  text-overflow: ellipsis; /* Add ellipsis for overflowed text */
  white-space: nowrap; /* Keep text on a single line */
}

.saved-devotion-excerpt {
  font-size: 0.8rem;
  color: var(--sidebar-item-muted-text-color);
  margin-bottom: 0;
  line-height: 1.4;
  margin-right: 35px; /* Add space for the delete button */
  overflow: hidden; /* Hide overflow */
  text-overflow: ellipsis; /* Add ellipsis for overflowed text */
  white-space: nowrap; /* Keep text on a single line for ellipsis to work */
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
  color: var(--themed-placeholder-color);
  font-weight: 300;
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
  color: var(--themed-placeholder-color);
  font-weight: 300;
  /* Default placeholder font-size will be inherited from the input itself, which is usually desired */
  /* For specific sizing, target the input directly, e.g., #devotionTopicInput::placeholder */
}

/* Specific styling for the devotion topic input placeholder */
#topicInput.form-control-lg::placeholder { /* Corrected ID from #devotionTopicInput to #topicInput */
  font-size: 1rem; /* Smaller than the input's 1.25rem default */
  /* color and font-weight are inherited from .form-control::placeholder */
}

.btn-gradient, .btn-gradient-success {
  border: none;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-image 0.3s ease, color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-gradient {
  background-image: var(--primary-gradient);
  color: white; /* Generate button text color */
}

/* .btn-gradient-success will have its background and color defined by theme-specific rules */

.btn-gradient:hover, .btn-gradient-success:hover {
  transform: translateY(-2px);
  /* box-shadow will be themed */
}

.btn-gradient:disabled, .btn-gradient-success:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Styles for action buttons and alerts */
.actions-toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem; /* Spacing between buttons */
}

[data-bs-theme="light"] .btn-gradient-success {
  background-image: var(--save-btn-bg-light);
  color: var(--save-btn-text-light);
}

[data-bs-theme="light"] .btn-gradient-success:hover {
  box-shadow: var(--save-btn-hover-shadow-light);
}

[data-bs-theme="dark"] .btn-gradient-success {
  background-image: var(--save-btn-bg-dark);
  color: var(--save-btn-text-dark);
}

[data-bs-theme="dark"] .btn-gradient-success:hover {
  box-shadow: var(--save-btn-hover-shadow-dark);
}

.alert-success-custom {
  background-color: #1e4620; /* Darker green for dark mode */
  color: #d1e7dd;
  border-color: #2a602c;
}

/* Custom info alert for share confirmation */
.alert-info-custom {
  background-color: #0c5460; /* Darker cyan for dark mode */
  color: #d1ecf1;
  border-color: #138496;
}

[data-bs-theme="light"] .alert-success-custom {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

[data-bs-theme="light"] .alert-info-custom {
  background-color: #cce5ff; /* Light blue for light theme */
  color: #004085;
  border-color: #b8daff;
}

/* Ensure close button is visible on light backgrounds for custom alerts */
[data-bs-theme="light"] .alert-success-custom .btn-close,
[data-bs-theme="light"] .alert-info-custom .btn-close {
  filter: none; 
}

/* Ensure share button icon and text are visible in both themes */
[data-bs-theme="dark"] .btn-outline-info {
  color: #39c0ed; /* A slightly brighter cyan for dark theme */
  border-color: #39c0ed;
}
[data-bs-theme="dark"] .btn-outline-info:hover {
  color: var(--bs-body-bg); /* Or a specific dark text color */
  background-color: #39c0ed;
  border-color: #39c0ed;
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

.content-type-flag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
}

.flag-devotion {
  background-color: var(--primary-color);
  color: white;
}

[data-bs-theme="light"] .flag-devotion {
   background-color: var(--primary-color);
   color: white;
}

.flag-faithIntegration {
  background-color: #ffc107; 
  color: #333;
}

[data-bs-theme="light"] .flag-faithIntegration {
  background-color: #ffc107; 
  color: #333;
}
</style>
