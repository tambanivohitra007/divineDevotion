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
      <h2 class="sidebar-title"><span v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">{{ $t('sidebar.saved') }}</span></h2>
      <div class="search-bar mb-3" v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">        <input
          type="text"
          class="form-control form-control-sm"
          :placeholder="$t('sidebar.searchPlaceholder')"
          v-model="searchQuery"
        />
      </div>
      <ul class="list-unstyled saved-devotions-list" v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">        <li v-if="filteredContent.length === 0 && searchQuery" class="text-muted small p-2">{{ $t('sidebar.noMatches') }}</li>
        <li v-if="filteredContent.length === 0 && !searchQuery && savedContent.length > 0" class="text-muted small p-2">{{ $t('sidebar.noContent') }}</li>
        <li
          v-for="(content) in filteredContent"
          :key="content.id || content.topic" 
          class="saved-devotion-card"
          @click="viewSavedContent(content)"
        >          <h6 class="saved-devotion-topic">
            {{ content.topic || $t('sidebar.savedContent') }}            
          </h6>
          <p class="saved-devotion-excerpt">{{truncateText(content.text, 30)}}</p>          <span class="content-type-flag" :class="'flag-' + content.type">
              {{ content.type === 'devotion' ? $t('contentTypes.devotionShort') : $t('contentTypes.ideaShort') }}
            </span>          <button 
            class="btn btn-sm btn-outline-danger delete-saved-btn" 
            @click.stop="handleDeleteContent(content.id)" 
            v-if="content.id"
            :title="$t('tooltips.deleteContent')"
          >
            <i class="bi bi-trash3"></i>
          </button>
        </li>
      </ul>        <!-- Language selector and theme toggle button at bottom of sidebar -->      <div class="sidebar-bottom" v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)">
        <div class="d-flex align-items-center gap-2 mb-3">
          <div class="flex-grow-1">
            <LanguageSelector />
          </div>          <button @click="toggleTheme" class="btn btn-sm btn-outline-light flex-shrink-0" :title="isDarkMode ? $t('navigation.toggleTheme') : $t('navigation.toggleTheme')">
            <i :class="isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"></i>
            <span v-if="!isSidebarCollapsed || (isMobile && !isSidebarCollapsed)" class="ms-2">
              {{ isDarkMode ? $t('navigation.lightMode') : $t('navigation.darkMode') }}
            </span>
          </button>
        </div>
      </div>
    </div>    <div class="main-content">
      <!-- This button is now primarily for opening sidebar on mobile, or expanding on desktop if it was collapsed -->      <button class="btn btn-sm btn-outline-light sidebar-toggle-btn-main" @click="toggleSidebar" v-if="isSidebarCollapsed" :title="$t('tooltips.openSidebar')">
         <i class="bi bi-list"></i>
      </button>      <!-- Header -->
      <header class="text-center mb-4" :class="{ 'header-hidden': !showHeader }">
        <h1 class="display-4 app-title">{{ $t('app.title') }}</h1>
        <p class="lead">{{ $t('app.subtitle') }}</p>
      </header><!-- Content Type Menu - Fixed Right Side -->
      <!-- Menu Toggle Button (Always Visible) -->
      <button
        type="button"
        class="btn content-type-menu-toggle"
        @click="toggleContentTypeMenu"
        :title="$t('navigation.contentTypes')"
        ref="contentTypeButtonRef"
      >
        <i :class="currentContentTypeIcon"></i>
      </button>
      
      <!-- Menu Overlay -->
      <div class="content-type-menu-overlay" v-if="showContentTypeMenu" @click="closeContentTypeMenu"></div>
      
      <!-- Menu Panel -->
      <div class="content-type-menu-right" :class="{ 'menu-open': showContentTypeMenu }">
        <div class="content-type-menu-panel" ref="menuPanelRef">
          <div class="menu-header">
            <h6 class="menu-title">{{ $t('navigation.contentTypes') }}</h6>
            <button type="button" class="btn-close" @click="closeContentTypeMenu" :aria-label="$t('actions.close')"></button>
          </div>
          
          <div class="menu-items">
            <button
              type="button"
              class="menu-item"
              :class="{ active: contentTypeSelection === 'devotion' }"
              @click="selectContentType('devotion')"
            >
              <div class="menu-item-icon">
                <i class="bi bi-stars"></i>
              </div>
              <div class="menu-item-content">
                <div class="menu-item-title">{{ $t('contentTypes.devotion') }}</div>
                <div class="menu-item-desc">{{ $t('contentTypes.devotionDesc') }}</div>
              </div>
            </button>
            
            <button
              type="button"
              class="menu-item"
              :class="{ active: contentTypeSelection === 'faithIntegration' }"
              @click="selectContentType('faithIntegration')"
            >
              <div class="menu-item-icon">
                <i class="bi bi-lightbulb-fill"></i>
              </div>
              <div class="menu-item-content">
                <div class="menu-item-title">{{ $t('contentTypes.faithAndLearning') }}</div>
                <div class="menu-item-desc">{{ $t('contentTypes.faithLearningDesc') }}</div>
              </div>
            </button>
            
            <button
              type="button"
              class="menu-item"
              :class="{ active: contentTypeSelection === 'bibleCard' }"
              @click="selectContentType('bibleCard')"
            >
              <div class="menu-item-icon">
                <i class="bi bi-card-image"></i>
              </div>
              <div class="menu-item-content">
                <div class="menu-item-title">{{ $t('contentTypes.bibleCards') }}</div>
                <div class="menu-item-desc">{{ $t('contentTypes.bibleCardsDesc') }}</div>
              </div>
            </button>
            
            <button
              type="button"
              class="menu-item"
              :class="{ active: contentTypeSelection === 'bibleExegesis' }"
              @click="selectContentType('bibleExegesis')"
            >
              <div class="menu-item-icon">
                <i class="bi bi-book-half"></i>
              </div>
              <div class="menu-item-content">
                <div class="menu-item-title">{{ $t('contentTypes.bibleExegesis') }}</div>
                <div class="menu-item-desc">{{ $t('contentTypes.bibleExegesisDesc') }}</div>
              </div>
            </button>
          </div>
          
          <!-- New Content Button at bottom -->
          <div class="menu-footer">
            <button
              type="button"
              class="btn btn-primary w-100 new-content-btn-menu"
              @click="handleCreateNew"
            >
              <i class="bi bi-plus-lg me-2"></i>
              {{ $t('actions.createNew') }}
            </button>
          </div>
        </div>
      </div>

<!-- Main Content Area -->
      <div class="content-area-wrapper">
        <!-- Top fade overlay -->
        <div 
          class="scroll-fade-overlay scroll-fade-top" 
          :class="{ 'visible': showTopFade }"
        ></div>
        
        <div class="content-area" ref="contentAreaRef" @scroll="handleContentScroll">          <!-- Bible Card Generator Section -->
          <div v-if="showBibleCardGenerator" class="bible-card-section">
            <BibleCardGenerator />
          </div>

          <!-- Bible Exegesis Section -->
          <div v-else-if="showBibleExegesis" class="bible-exegesis-section">
            <BibleExegesis />
          </div>

      <!-- Content Display Section (for devotions and faith integration) -->
      <div v-else-if="isLoading || (currentContent.text && !generationError)" class="card shadow-lg mx-auto current-devotion-card">
        <div class="card-header bg-transparent py-3">
          <h3 class="card-title h4 d-flex align-items-center gap-2 mb-0">
             <i :class="currentContent.type === 'devotion' ? 'bi bi-journal-text me-2' : 'bi bi-lightbulb me-2'" style="font-size: 1.5rem;"></i>{{ currentContent.type === 'devotion' ? $t('content.yourDevotion') : $t('content.yourFaithIdea') }}
          </h3>
        </div>
        <div class="card-body">
          <div v-if="isLoading" class="text-center py-3">
            <div class="spinner-border text-primary mb-2" style="width: 3rem; height: 3rem;" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="lead mt-2">{{ $t('content.generating') }}</p>
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
              </blockquote>            </div>            <DevotionDisplay :devotion="formattedContentForDisplay" :content-type="currentContent.type || 'devotion'" />
            
            <div class="actions-toolbar text-center mt-4 pt-3 border-top border-secondary">              <button class="btn btn-gradient-success btn-sm me-2" @click="handleSaveCurrentContent">
                <i class="bi bi-heart-fill me-2"></i>{{ currentContent.type === 'devotion' ? $t('actions.saveDevotion') : $t('actions.saveIdea') }}
              </button>
              <button class="btn btn-outline-info btn-sm" @click="handleShareContent" :title="$t('actions.shareContent')">
                <i class="bi bi-share-fill me-2"></i>{{ $t('actions.share') }}
              </button>
            </div>
          </div>      </div>      </div>      <!-- Placeholder for when nothing is generated and not loading, and no error (not shown for Bible Card Generator or Bible Exegesis) -->      <section v-else-if="!isLoading && !currentContent.text && !generationError && !showBibleCardGenerator && !showBibleExegesis" class="text-center placeholder-section mx-auto p-5 rounded welcome-area">
        <div class="welcome-content">
          <i class="bi bi-lightbulb-fill welcome-icon"></i>
          <h2 class="welcome-title">{{ $t('welcome.title') }}</h2>
          <p class="lead welcome-text">{{ $t('welcome.subtitle') }}</p>
          <p class="text-muted">{{ $t('welcome.instruction') }}</p>
        </div>
        
        <!-- Prompt Gallery Component -->
        <PromptGallery @prompt-selected="handlePromptSelection" />
      </section>      <!-- Alerts -->
      <div v-if="showSaveConfirmation" class="alert alert-success-custom alert-dismissible fade show mt-3" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>{{ $t('alerts.contentSaved') }}
        <button type="button" class="btn-close btn-close-white" @click="showSaveConfirmation = false" :aria-label="$t('actions.close')"></button>
      </div><div v-if="showShareAlert" class="alert alert-info-custom alert-dismissible fade show mt-3" role="alert">
        <i class="bi bi-info-circle-fill me-2"></i>{{ shareAlertMessage }}
        <button type="button" :class="isDarkMode ? 'btn-close btn-close-white' : 'btn-close'" @click="showShareAlert = false" aria-label="Close"></button>
      </div>
        </div>
        
        <!-- Bottom fade overlay -->
        <div 
          class="scroll-fade-overlay scroll-fade-bottom" 
          :class="{ 'visible': showBottomFade }"
        ></div>
      </div>    <!-- Bottom Input Area (Gemini-like) -->
    <div class="bottom-input-area" :class="{ 'input-hidden': !showBottomInput }">
      <div class="input-container">        <!-- Input Form (hidden when Bible Card Generator or Bible Exegesis is selected) -->
        <form v-if="!showBibleCardGenerator && !showBibleExegesis" @submit.prevent="handleGenerateContent" class="input-form">
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
import { useI18n } from 'vue-i18n';
import DevotionDisplay from './components/DevotionDisplay.vue';
import BibleCardGenerator from './components/BibleCardGenerator.vue';
import BibleExegesis from './components/BibleExegesis.vue';
import PromptGallery from './components/PromptGallery.vue';
import LanguageSelector from './components/LanguageSelector.vue';
import useGemini from './composables/useGemini';
// Correctly import useContentStorage and StoredContent type
import useContentStorage, { type StoredContent } from './composables/useDevotions';

// Initialize i18n
const { t, locale } = useI18n();

const selectedContentType = ref<'devotion' | 'faithIntegration'>('devotion');
const showBibleCardGenerator = ref(false);
const showBibleExegesis = ref(false);
const topicInput = ref(''); // Renamed from devotionTopic

// Computed property for dropdown selection that combines selectedContentType and showBibleCardGenerator
const contentTypeSelection = computed({
  get: () => {
    if (showBibleCardGenerator.value) return 'bibleCard';
    if (showBibleExegesis.value) return 'bibleExegesis';
    return selectedContentType.value;
  },
  set: () => {
    // This will be handled by handleContentTypeChange method
  }
});

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

// Ref for the content area
const contentAreaRef = ref<HTMLElement>();

// Refs for content type menu
const contentTypeButtonRef = ref<HTMLButtonElement>();
const menuPanelRef = ref<HTMLDivElement>();

// Content type menu state
const showContentTypeMenu = ref(false);

// Fade effects state
const showTopFade = ref(false);
const showBottomFade = ref(false);

// Bottom input area auto-hide state
const showBottomInput = ref(true);
const scrollTimeout = ref<number | null>(null);

// Header auto-hide state
const showHeader = ref(true);
const headerScrollTimeout = ref<number | null>(null);

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
    // Add click outside listener for menu
  document.addEventListener('click', closeMenuOnClickOutside);

  // Theme initialization
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('click', closeMenuOnClickOutside);
});

// Computed properties for dynamic UI text
const topicInputPlaceholder = computed(() => {
  if (showBibleCardGenerator.value) {
    return t('placeholders.bibleCardInfo');
  }
  return selectedContentType.value === 'devotion' 
    ? t('placeholders.devotionInput')
    : t('placeholders.faithInput');
});

// Fetch the text of the first verse when currentContent.verses changes
watch(() => (currentContent.value.type === 'devotion' && currentContent.value.verses && currentContent.value.verses[0]), async (verse) => {
  if (!verse) {
    firstVerseText.value = '';
    return;
  }  // Parse the verse reference
  const match = verse.match(/^(\d*\s*[a-zA-Z\s]+)\s*(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) {
    firstVerseText.value = '';
    return;
  }
  
  let book = match[1].trim().toLowerCase().replace(/\s+/g, '');
  
  // Map common book name variations to the API format
  const bookNameMappings: Record<string, string> = {
    'psalm': 'psalms',
    'proverb': 'proverbs',
    'ecclesiastes': 'ecclesiastes',
    'songofsolomon': 'songofsolomon',
    'songs': 'songofsolomon',
    'song': 'songofsolomon',
  };
  
  if (bookNameMappings[book]) {
    book = bookNameMappings[book];
  }
  
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
  
  // Bible Card Generator doesn't use the same content generation flow
  if (showBibleCardGenerator.value) {
    return;
  }
    const newId = `content-${Date.now()}`; // Generate ID here
  currentContent.value = { id: newId, text: '', verses: [], topic: '', type: selectedContentType.value }; // Initialize with selected type and ID
  try {
    const result = await generateGeminiContent(topicInput.value, selectedContentType.value, locale.value);
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
      }, 3000);    } else {
      shareAlertMessage.value = t('messages.alreadySaved');
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
      const defaultType = selectedContentType.value;
      currentContent.value = { id: `content-${Date.now()}`, text: '', verses: [], topic: '', type: defaultType };
  }
  deleteContent(id); 
};


const viewSavedContent = (content: StoredContent) => { // Renamed from viewSavedDevotion, updated type
  currentContent.value = { ...content };
  // Only allow valid content types for selectedContentType
  if (content.type === 'devotion' || content.type === 'faithIntegration') {
    selectedContentType.value = content.type;
  } else {
    selectedContentType.value = 'devotion'; // Default fallback
  }
  if (isMobile.value && !isSidebarCollapsed.value) {
    isSidebarCollapsed.value = true;
  }
};

const handleShareContent = async () => { // Renamed from handleShareDevotion
  if (!currentContent.value.text) return;
  const title = currentContent.value.topic 
    ? `${currentContent.value.type === 'devotion' ? t('content.shareTitle') : t('content.shareTitleIdea')}: ${currentContent.value.topic}` 
    : `${t('content.sharePrefix')} ${currentContent.value.type === 'devotion' ? t('content.sharePrefixDevotion') : t('content.sharePrefixIdea')}`;
  
  let shareText = currentContent.value.text;
  if (currentContent.value.type === 'devotion' && currentContent.value.verses && currentContent.value.verses.length > 0) {
    const versesText = currentContent.value.verses.join("\n");
    shareText += `\n\n${t('content.keyVerses')}\n${versesText}`;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: shareText,      });
      shareAlertMessage.value = t('messages.shareSuccess');
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
const copyToClipboard = async (text: string, context: 'fallback' | 'direct' = 'direct') => {    try {
    await navigator.clipboard.writeText(text);
    if (context === 'fallback') {
      shareAlertMessage.value = t('messages.shareFallback');
    } else {
      shareAlertMessage.value = t('messages.copySuccess');
    }
    showShareAlert.value = true;  } catch (err) {
    console.error('Failed to copy: ', err);
    shareAlertMessage.value = t('messages.copyFailed');
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
    // Enhanced text formatting for better readability
  text = formatContentText(text);

  return {
    ...currentContent.value,
    text,
    verses: currentContent.value.verses || [], // Ensure verses is an array
  };
});

// Simplified text formatting function - no complex formatting
const formatContentText = (text: string) => {
  if (!text) return '';
  
  // Clean up any existing malformed HTML fragments
  let cleanText = text
    .replace(/"text-emphasis">/g, '')
    .replace(/text-emphasis">/g, '')
    .replace(/"text-accent">/g, '')
    .replace(/text-accent">/g, '')
    .replace(/class="[^"]*">/g, '');
  
  // Split into paragraphs and wrap each in a simple paragraph tag
  const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim());
  
  const processedParagraphs = paragraphs.map(paragraph => {
    const trimmed = paragraph.trim();
    if (!trimmed) return '';
    
    // Replace line breaks with <br> tags within paragraphs
    const withBreaks = trimmed.replace(/\n/g, '<br>');
    
    return `<p class="devotion-paragraph">${withBreaks}</p>`;
  });
  
  // Join all paragraphs and clean up any empty ones
  let result = processedParagraphs.join('');
  result = result.replace(/<p class="devotion-paragraph">\s*<\/p>/g, '');
  
  return result;
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

// Computed properties for content type button
const currentContentTypeIcon = computed(() => {
  switch (contentTypeSelection.value) {
    case 'devotion':
      return 'bi bi-stars';
    case 'faithIntegration':
      return 'bi bi-lightbulb-fill';
    case 'bibleCard':
      return 'bi bi-card-image';
    case 'bibleExegesis':
      return 'bi bi-book-half';
    default:
      return 'bi bi-stars';
  }
});

// Content type menu methods
const toggleContentTypeMenu = () => {
  showContentTypeMenu.value = !showContentTypeMenu.value;
};

const closeContentTypeMenu = () => {
  showContentTypeMenu.value = false;
};

const selectContentType = (type: string) => {
  if (type === 'bibleCard') {
    showBibleCardGenerator.value = true;
    showBibleExegesis.value = false;
    selectedContentType.value = 'devotion'; // Default fallback
  } else if (type === 'bibleExegesis') {
    showBibleCardGenerator.value = false;
    showBibleExegesis.value = true;
    selectedContentType.value = 'devotion'; // Default fallback
  } else {
    showBibleCardGenerator.value = false;
    showBibleExegesis.value = false;
    selectedContentType.value = type as 'devotion' | 'faithIntegration';  }
  showContentTypeMenu.value = false;
};

// Close menu when clicking outside
const closeMenuOnClickOutside = (event: Event) => {
  if (showContentTypeMenu.value) {
    const target = event.target as Node;
    const button = contentTypeButtonRef.value;
    const menu = menuPanelRef.value;
    
    if (button && menu && !button.contains(target) && !menu.contains(target)) {
      showContentTypeMenu.value = false;
    }
  }
};

// Handle creating new content
const handleCreateNew = () => {
  // Clear current content and create fresh content
  const newId = `content-${Date.now()}`;
  currentContent.value = {
    id: newId,
    text: '',
    verses: [],
    topic: '',
    type: selectedContentType.value,
  };
  
  // Clear the input field
  topicInput.value = '';
    // Close the content type menu if it's open
  showContentTypeMenu.value = false;
    // Focus on the input field for immediate typing
  if (textareaRef.value && !showBibleCardGenerator.value && !showBibleExegesis.value) {
    setTimeout(() => {
      textareaRef.value?.focus();
    }, 100);
  }
};

// Handle prompt selection from gallery
const handlePromptSelection = (text: string, type: 'devotion' | 'faithIntegration') => {
  // Set the content type first
  selectedContentType.value = type;
  showBibleCardGenerator.value = false;
  showBibleExegesis.value = false;
  
  // Set the prompt text in the input field
  topicInput.value = text;
    // Close content type menu if open
  showContentTypeMenu.value = false;
  
  // Focus on the input field and auto-resize
  if (textareaRef.value) {
    setTimeout(() => {
      textareaRef.value?.focus();
      autoResizeTextarea();
    }, 100);
  }
};

// Auto-resize textarea function for bottom input
const autoResizeTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 200)}px`;
  }
};

// Handle content area scroll for fade effects and auto-hide input
const handleContentScroll = () => {
  if (!contentAreaRef.value) return;
  
  const element = contentAreaRef.value;
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  const scrollBottom = scrollHeight - scrollTop - clientHeight;
  
  // Show top fade when scrolled down more than 50px
  showTopFade.value = scrollTop > 50;
  
  // Show bottom fade when there's more than 50px of content below
  showBottomFade.value = scrollBottom > 50;
    // Auto-hide bottom input area while scrolling
  // Hide input area when actively scrolling (if there's scrollable content)
  const hasScrollableContent = scrollHeight > clientHeight;
  if (hasScrollableContent && (scrollTop > 100 || scrollBottom > 100)) {
    showBottomInput.value = false;
    
    // Clear existing timeout
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value);
    }
    
    // Show input area again after scrolling stops (1.5 seconds of inactivity)
    scrollTimeout.value = setTimeout(() => {
      showBottomInput.value = true;
    }, 1500);
  } else if (!hasScrollableContent) {
    // Always show input area if content doesn't require scrolling
    showBottomInput.value = true;
  }

  // Auto-hide header while scrolling
  // Hide header when actively scrolling (if there's scrollable content)
  if (hasScrollableContent && scrollTop > 80) {
    showHeader.value = false;
    
    // Clear existing header timeout
    if (headerScrollTimeout.value) {
      clearTimeout(headerScrollTimeout.value);
    }
    
    // Show header again after scrolling stops (1.5 seconds of inactivity)
    headerScrollTimeout.value = setTimeout(() => {
      showHeader.value = true;
    }, 1500);
  } else if (!hasScrollableContent || scrollTop <= 80) {
    // Always show header if content doesn't require scrolling or near top
    showHeader.value = true;
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
/* Import modular CSS styles */
@import './styles/index.css';
</style>
