<template>
  <div id="app" :class="{ 'sidebar-collapsed': isSidebarCollapsed, 'mobile-view': isMobile }">
    <div v-if="isMobile && !isSidebarCollapsed" class="sidebar-overlay" @click="toggleSidebar"></div>
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
      <h2 class="sidebar-title"><span v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">Saved</span></h2>
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
        <!-- Theme toggle button at bottom of sidebar -->
      <div class="sidebar-bottom" v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">
        <button @click="toggleTheme" class="btn theme-toggle-btn-sidebar" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <i :class="isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"></i>
          <span v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)" class="ms-2">
            {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
          </span>
        </button>
      </div>
    </div>

    <div class="main-content">
      <!-- This button is now primarily for opening sidebar on mobile, or expanding on desktop if it was collapsed -->
      <button class="btn btn-sm btn-outline-light sidebar-toggle-btn-main" @click="toggleSidebar" v-if="isSidebarCollapsed">
         <i class="bi bi-list"></i> <!-- Hamburger icon for mobile -->
      </button>
      
      <!-- Header -->
      <header class="text-center mb-4">
        <h1 class="display-4 app-title">DivineDevotion</h1>
        <p class="lead">Your AI-powered spiritual companion</p>
      </header>

      <!-- Main Content Area -->
      <div class="content-area">

      <!-- Content Display Section -->
      <div v-if="isLoading || (currentContent.text && !generationError)" class="card shadow-lg mx-auto current-devotion-card">
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
                "{{ firstVerseText }}"
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
      <section v-else-if="!isLoading && !currentContent.text && !generationError" class="text-center placeholder-section mx-auto p-5 rounded welcome-area">
        <div class="welcome-content">
          <i class="bi bi-lightbulb-fill welcome-icon"></i>
          <h2 class="welcome-title">Welcome to DivineDevotion</h2>
          <p class="lead welcome-text">Generate personalized devotions and faith-based learning ideas</p>
          <p class="text-muted">Choose a content type and enter your topic below to begin</p>
        </div>
      </section>

      <!-- Alerts -->
      <div v-if="showSaveConfirmation" class="alert alert-success-custom alert-dismissible fade show mt-3" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>Content saved successfully!
        <button type="button" class="btn-close btn-close-white" @click="showSaveConfirmation = false" aria-label="Close"></button>
      </div>

      <div v-if="showShareAlert" class="alert alert-info-custom alert-dismissible fade show mt-3" role="alert">
        <i class="bi bi-info-circle-fill me-2"></i>{{ shareAlertMessage }}
        <button type="button" :class="isDarkMode ? 'btn-close btn-close-white' : 'btn-close'" @click="showShareAlert = false" aria-label="Close"></button>
      </div>
    </div>

    <!-- Bottom Input Area (Gemini-like) -->
    <div class="bottom-input-area">
      <div class="input-container">
        <!-- Content Type Selector -->
        <div class="content-type-selector mb-3">
          <div class="btn-group w-100" role="group" aria-label="Content type selection">
            <input type="radio" class="btn-check" name="contentType" id="devotion-radio" autocomplete="off" :checked="selectedContentType === 'devotion'" @change="selectedContentType = 'devotion'">
            <label class="btn btn-outline-primary" for="devotion-radio">
              <i class="bi bi-stars me-2"></i>Devotion
            </label>

            <input type="radio" class="btn-check" name="contentType" id="faithIntegration-radio" autocomplete="off" :checked="selectedContentType === 'faithIntegration'" @change="selectedContentType = 'faithIntegration'">
            <label class="btn btn-outline-primary" for="faithIntegration-radio">
              <i class="bi bi-lightbulb-fill me-2"></i>Faith & Learning
            </label>
          </div>
        </div>

        <!-- Input Form -->
        <form @submit.prevent="handleGenerateContent" class="input-form">
          <div class="input-group">
            <textarea
              id="topicInput"
              class="form-control bottom-textarea"
              rows="1"
              :placeholder="topicInputPlaceholder"
              v-model="topicInput"
              aria-label="Enter your topic or request"
              @input="autoResizeTextarea"
              ref="textareaRef"
            ></textarea>
            <button
              type="submit"
              class="btn btn-primary send-btn"
              :disabled="isLoading || !topicInput.trim()"
              title="Generate content"
            >
              <span v-if="isLoading">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              </span>
              <span v-else>
                <i class="bi bi-send-fill"></i>
              </span>
            </button>
          </div>
          <div v-if="generationError" class="alert alert-danger mt-2" role="alert">
            <strong>Error:</strong> {{ generationError }}
          </div>        </form>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue';
import DevotionDisplay from './components/DevotionDisplay.vue';
import useGemini from './composables/useGemini';
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

const { generateGeminiContent, isLoading, error: generationError } = useGemini(); // Gemini function
const { savedContent, saveContent, deleteContent, loadContent } = useContentStorage(); // Updated import and usage

const showSaveConfirmation = ref(false);
const searchQuery = ref('');

const showShareAlert = ref(false);
const shareAlertMessage = ref('');

// Ref for the textarea
const textareaRef = ref<HTMLTextAreaElement>();

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
const topicInputPlaceholder = computed(() => {
  return selectedContentType.value === 'devotion' 
    ? "E.g., 'finding peace in hardship', 'gratitude', or 'guidance for a tough decision'"
    : "E.g., 'teaching biology through a faith lens', 'integrating ethics in computer science', or 'faith perspectives on history'";
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

// Removed getOriginalIndex function as it was unused

const handleGenerateContent = async () => {
  if (!topicInput.value.trim()) return;
  const newId = `content-${Date.now()}`; // Generate ID here
  currentContent.value = { id: newId, text: '', verses: [], topic: '', type: selectedContentType.value }; // Initialize with selected type and ID
  try {
    const result = await generateGeminiContent(topicInput.value, selectedContentType.value);
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
    text = text.replace(/^(?:\*\*([^*]+)\*\*|([^:]+?))(:|—|--)(\s|$)/, (_match, p1, p2, p3, p4) => {
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

// Auto-resize textarea function for bottom input
const autoResizeTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 200)}px`;
  }
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

/* Modern Divine Devotion App Styles */
:root {
  /* Color System */
  --divine-primary: #6366f1;
  --divine-secondary: #8b5cf6;
  --divine-accent: #06b6d4;
  --divine-success: #10b981;
  --divine-warning: #f59e0b;
  --divine-error: #ef4444;
  
  /* Glass Morphism */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  /* Gradients */
  --gradient-divine: linear-gradient(135deg, var(--divine-primary) 0%, var(--divine-secondary) 50%, var(--divine-accent) 100%);
  --gradient-success: linear-gradient(135deg, var(--divine-success) 0%, var(--divine-accent) 100%);
  --gradient-glow: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  
  /* Shadows & Effects */
  --shadow-divine: 0 20px 40px rgba(99, 102, 241, 0.3);
  --shadow-glow: 0 0 30px rgba(99, 102, 241, 0.4);
  --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  /* Animation */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Theme System */
[data-bs-theme="light"] {
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.3);
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --surface-primary: rgba(255, 255, 255, 0.9);
  --surface-secondary: rgba(248, 250, 252, 0.8);
  --bg-primary: rgba(255, 255, 255, 0.8);
  --border-color: rgba(0, 0, 0, 0.1);
}

[data-bs-theme="dark"] {
  --glass-bg: rgba(0, 0, 0, 0.2);
  --glass-border: rgba(255, 255, 255, 0.1);
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --surface-primary: rgba(17, 24, 39, 0.8);
  --surface-secondary: rgba(31, 41, 55, 0.6);
  --bg-primary: rgba(0, 0, 0, 0.4);
  --border-color: rgba(255, 255, 255, 0.15);
}

/* Modern Sidebar Design */
.sidebar {
  width: 350px;
  padding: 2rem;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--glass-border);
  transition: var(--transition-smooth);
  z-index: 1000;
  box-shadow: var(--shadow-card);
  overflow-y: auto;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-divine);
  opacity: 0.8;
}

#app.sidebar-collapsed .sidebar {
  width: 80px;
  padding: 2rem 1rem;
}

#app.sidebar-collapsed .sidebar .sidebar-title span,
#app.sidebar-collapsed .sidebar .search-bar,
#app.sidebar-collapsed .sidebar .saved-devotions-list {
  display: none;
}

/* Hide sidebar bottom container when collapsed */
#app.sidebar-collapsed .sidebar .sidebar-bottom {
  display: none;
}

.sidebar-toggle-btn {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 1rem;
  align-self: flex-end;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-card);
}

.sidebar-toggle-btn:hover {
  background: var(--gradient-glow);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

/* Position the sidebar toggle button absolutely in the top-right of sidebar */
.top-right-absolute {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1110;
}

/* Sidebar bottom container for theme toggle */
.sidebar-bottom {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
}

/* Theme toggle button in sidebar */
.theme-toggle-btn-sidebar {
  width: 100%;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0.75rem;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 0.9rem;
}

.theme-toggle-btn-sidebar:hover {
  background: var(--gradient-glow);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
  color: var(--text-primary);
}

.theme-toggle-btn-sidebar i {
  font-size: 1.1rem;
}

/* Main content toggle button (hamburger menu) */
.sidebar-toggle-btn-main {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-card);
}

.sidebar-toggle-btn-main:hover {
  background: var(--gradient-glow);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.sidebar-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  background: var(--gradient-divine);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

/* Modern Search Bar */
.search-bar .form-control {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  border-radius: 16px;
  padding: 0.75rem 1rem;
  backdrop-filter: blur(10px);
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-card);
}

.search-bar .form-control:focus {
  border-color: var(--divine-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  transform: translateY(-1px);
}

.search-bar .form-control::placeholder {
  color: var(--text-secondary);
  font-weight: 400;
}

/* Modern Content Cards */
.saved-devotions-list {
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--divine-primary) transparent;
}

.saved-devotion-card {
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  padding: 1.25rem;
  margin-bottom: 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: var(--transition-bounce);
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.saved-devotion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-divine);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.saved-devotion-card:hover::before {
  opacity: 1;
}

.saved-devotion-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: var(--shadow-divine);
}

.saved-devotion-topic {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  margin-right: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.saved-devotion-excerpt {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0;
  line-height: 1.5;
  margin-right: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-saved-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--divine-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.375rem;
  font-size: 0.75rem;
  border-radius: 8px;
  transition: var(--transition-smooth);
}

.delete-saved-btn:hover {
  background: var(--divine-error);
  color: white;
  transform: scale(1.1);
}


/* Main Content Area */
.main-content {
  margin-left: 350px; /* Default margin when sidebar is expanded on desktop */
  /* padding: 2rem 3rem 10rem; */
  flex-grow: 1;
  height: 100vh;
  transition: var(--transition-smooth);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Adjust main content when sidebar is collapsed on desktop - center the content */
#app.sidebar-collapsed .main-content {
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
  padding-right: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Ensure .content-area stays centered and doesn't stretch full width */
#app.sidebar-collapsed .main-content .content-area {
  margin: 0 auto;
  max-width: 60rem;
}


.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 60rem;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
  padding-bottom: 10rem;
}


.input-container {
  max-width: 60rem;
  margin: 0 auto;
  padding: 0 2rem;
  margin-bottom: 25px;
}

/* Ensure input-container centers when sidebar is collapsed */
#app.sidebar-collapsed .input-container {
  margin: 0 auto;
  max-width: 60rem;
}

.content-type-selector .btn-group {
  background: var(--glass-bg);
  border-radius: 16px;
  padding: 0.5rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
}

.content-type-selector .btn-check:checked + .btn {
  background: var(--gradient-divine);
  border-color: var(--divine-primary);
  color: white;
  box-shadow: var(--shadow-glow);
}

.content-type-selector .btn {
  border: none;
  color: var(--text-secondary);
  background: transparent;
  border-radius: 12px;
  transition: var(--transition-smooth);
  font-weight: 500;
}

.content-type-selector .btn:hover:not(.btn-check:checked + .btn) {
  background: var(--gradient-glow);
  color: var(--text-primary);
}

.input-form .input-group {
  position: relative;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0.5rem;
  transition: border-color 0.2s ease;
  height: 100px;
}

.input-form .input-group:focus-within {
  border-color: var(--divine-primary);
}

.bottom-textarea {
  border: none;
  background: transparent;
  color: var(--text-primary);
  resize: none;
  min-height: 60px;
  max-height: 200px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  transition: var(--transition-smooth);
}

.bottom-textarea:focus {
  border: none;
  background: transparent;
  box-shadow: none;
  outline: none;
}

.bottom-textarea::placeholder {
  color: var(--text-secondary);
  font-weight: 400;
}

.send-btn {
  background: var(--gradient-divine);
  border: none;
   width: 60px;
  /* color: white;
 
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-bounce);
  box-shadow: var(--shadow-card);
  margin-left: 0.5rem; */
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-glow);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Welcome Area Styling */
/* .welcome-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 300px);
  height: 100%;
} */

.welcome-content {
  text-align: center;
  max-width: 500px;
}

.welcome-icon {
  font-size: 5rem;
  background: var(--gradient-divine);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
  animation: icon-pulse 2s ease-in-out infinite;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--gradient-divine);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.welcome-text {
  color: var(--text-primary);
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

/* Current Content Card Updates */
.current-devotion-card {
  max-width: 100%;
  margin-bottom: 2rem;
}

/* Enhanced Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card {
  animation: fadeInUp 0.6s ease-out;
}

.saved-devotion-card {
  animation: slideInRight 0.4s ease-out;
}

.saved-devotion-card:nth-child(even) {
  animation-delay: 0.1s;
}

.saved-devotion-card:nth-child(odd) {
  animation-delay: 0.2s;
}

/* Focus States for Accessibility */
button:focus-visible,
.form-control:focus,
a:focus-visible {
  outline: 2px solid var(--divine-primary);
  outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  :root {
    --glass-bg: rgba(255, 255, 255, 0.95);
    --glass-border: rgba(0, 0, 0, 0.3);
  }
  
  [data-bs-theme="dark"] {
    --glass-bg: rgba(0, 0, 0, 0.95);
    --glass-border: rgba(255, 255, 255, 0.3);
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Modern Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--glass-bg);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: var(--gradient-divine);
  border-radius: 10px;
  transition: var(--transition-smooth);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--gradient-success);
  box-shadow: var(--shadow-glow);
}

/* Custom Tooltip Styling */
.bible-verse-tooltip .tooltip-inner {
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  max-width: 400px;
  text-align: left;
  padding: 1rem;
  font-size: 0.95rem;
  white-space: pre-wrap;
  box-shadow: var(--shadow-card);
}

/* Desktop Bottom Input Area */
.bottom-input-area {
  position: fixed;
  bottom: 0;
  left: 350px; /* Default position when sidebar is expanded */
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--glass-border);
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  transition: var(--transition-smooth);
}

/* Adjust bottom input area when sidebar is collapsed on desktop */
#app.sidebar-collapsed .bottom-input-area {
  left: 0; /* Center the bottom input area when sidebar is collapsed */
}

/* Inline Verse Links */
:deep(.inline-verse-link) {
  font-weight: 600;
  font-style: italic;
  color: var(--divine-primary);
  text-decoration: none;
  position: relative;
  transition: var(--transition-smooth);
}

:deep(.inline-verse-link)::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gradient-divine);
  transition: width 0.3s ease;
}

:deep(.inline-verse-link):hover::after {
  width: 100%;
}

:deep(.inline-verse-link):hover {
  color: var(--divine-secondary);
  transform: translateY(-1px);
}
/* Sidebar Overlay for Mobile */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1050;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Mobile Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    width: 320px;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1100;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.3);
  }

  #app.mobile-view:not(.sidebar-collapsed) .sidebar {
    transform: translateX(0);
  }

  #app.mobile-view:not(.sidebar-collapsed) .sidebar .sidebar-title span,
  #app.mobile-view:not(.sidebar-collapsed) .sidebar .search-bar,
  #app.mobile-view:not(.sidebar-collapsed) .sidebar .saved-devotions-list {
    display: block;
  }


  .sidebar-toggle-btn-main {
    top: 1rem;
    left: 1rem;
    font-size: 1.5rem;
    padding: 0.75rem;
  }
  /* Mobile sidebar styling adjustments */
  .sidebar-bottom {
    bottom: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
  }

  /* Mobile main content - no margin adjustments */
  .main-content {
    margin-left: 0 !important;
    width: 100%;
  }

  .app-title {
    font-size: 2.5rem;
    margin-top: 4rem;
    margin-bottom: 1rem;
  }

  .main-content .lead {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .card {
    margin-bottom: 1.5rem !important;
    border-radius: 20px;
  }

  .card-body, .card-header {
    padding: 1.5rem;
  }

  .form-control-lg {
    font-size: 1rem;
    padding: 1rem 1.25rem;
  }

  .btn-lg {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .first-verse-highlight {
    padding: 1.25rem;
    margin-bottom: 1.5rem !important;
  }

  .placeholder-section {
    padding: 2.5rem 1.5rem !important;
    border-radius: 20px;
  }

  .actions-toolbar {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 0;
  }

  .actions-toolbar .btn {
    width: 100%;
  }
  /* Mobile Responsive Bottom Input Area */
  .bottom-input-area {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 1rem 0 !important;
    border-top: 1px solid var(--glass-border);
    box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.15);
    z-index: 100;
  }

  /* Override sidebar adjustments on mobile */
  #app.sidebar-collapsed .bottom-input-area,
  #app.mobile-view .bottom-input-area {
    left: 0 !important;
  }

  .input-container {
    padding: 0 1rem;
    max-width: 100%;
  }

  .content-type-selector {
    margin-bottom: 1rem;
  }

  .content-type-selector .btn-group {
    flex-direction: row;
    padding: 0.375rem;
    border-radius: 12px;
  }

  .content-type-selector .btn {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    flex: 1;
    text-align: center;
  }

  .content-type-selector .btn i {
    font-size: 1rem;
    margin-right: 0.375rem;
  }

  .input-form .input-group {
    border-radius: 16px;
    padding: 0.375rem;
  }

  .bottom-textarea {
    padding: 0.75rem;
    font-size: 1rem;
    line-height: 1.4;
    min-height: 50px;
    max-height: 160px;
  }

  .send-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    margin-left: 0.375rem;
  }

  .send-btn i {
    font-size: 1.1rem;
  }

  /* Content area adjustments for mobile */
  .content-area {
    padding-bottom: 1rem;
    min-height: calc(100vh - 200px);
  }

  .welcome-area {
    min-height: calc(100vh - 350px);
    height: 100%;
    padding: 2rem 1rem !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .welcome-icon {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
  }

  .welcome-title {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }

  .welcome-text {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .current-devotion-card {
    margin-bottom: 1rem;
  }
}
</style>
