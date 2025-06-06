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
      <header class="text-center mb-4" :class="{ 'header-hidden': !showHeader }">
        <h1 class="display-4 app-title">DivineDevotion</h1>
        <p class="lead">Your AI-powered spiritual companion</p>
      </header><!-- Main Content Area -->
      <div class="content-area-wrapper">
        <!-- Top fade overlay -->
        <div 
          class="scroll-fade-overlay scroll-fade-top" 
          :class="{ 'visible': showTopFade }"
        ></div>
        
        <div class="content-area" ref="contentAreaRef" @scroll="handleContentScroll">
          <!-- Bible Card Generator Section -->
          <div v-if="showBibleCardGenerator" class="bible-card-section">
            <BibleCardGenerator />
          </div>

      <!-- Content Display Section (for devotions and faith integration) -->
      <div v-else-if="isLoading || (currentContent.text && !generationError)" class="card shadow-lg mx-auto current-devotion-card">
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
              </blockquote>            </div>            <DevotionDisplay :devotion="formattedContentForDisplay" :content-type="currentContent.type || 'devotion'" />
            
            <div class="actions-toolbar text-center mt-4 pt-3 border-top border-secondary">
              <button class="btn btn-gradient-success btn-sm me-2" @click="handleSaveCurrentContent">
                <i class="bi bi-heart-fill me-2"></i>Save {{ currentContent.type === 'devotion' ? 'Devotion' : 'Idea' }}
              </button>
              <button class="btn btn-outline-info btn-sm" @click="handleShareContent" title="Share this content">
                <i class="bi bi-share-fill me-2"></i>Share
              </button>
            </div>
          </div>
        </div>      </div>      <!-- Placeholder for when nothing is generated and not loading, and no error (not shown for Bible Card Generator) -->
      <section v-else-if="!isLoading && !currentContent.text && !generationError && !showBibleCardGenerator" class="text-center placeholder-section mx-auto p-5 rounded welcome-area">
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
      </div>      <div v-if="showShareAlert" class="alert alert-info-custom alert-dismissible fade show mt-3" role="alert">
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
      <div class="input-container">        <!-- Content Type Selector -->
        <div class="content-type-selector mb-3">
          <div class="btn-group w-100" role="group" aria-label="Content type selection">            <input type="radio" class="btn-check" name="contentType" id="devotion-radio" autocomplete="off" :checked="selectedContentType === 'devotion' && !showBibleCardGenerator" @change="selectedContentType = 'devotion'; showBibleCardGenerator = false">
            <label class="btn btn-outline-primary" for="devotion-radio">
              <i class="bi bi-stars me-2"></i>Devotion
            </label>

            <input type="radio" class="btn-check" name="contentType" id="faithIntegration-radio" autocomplete="off" :checked="selectedContentType === 'faithIntegration' && !showBibleCardGenerator" @change="selectedContentType = 'faithIntegration'; showBibleCardGenerator = false">
            <label class="btn btn-outline-primary" for="faithIntegration-radio">
              <i class="bi bi-lightbulb-fill me-2"></i>Faith & Learning
            </label><input type="radio" class="btn-check" name="contentType" id="bibleCard-radio" autocomplete="off" :checked="showBibleCardGenerator" @change="showBibleCardGenerator = true; selectedContentType = 'devotion'">
            <label class="btn btn-outline-primary" for="bibleCard-radio">
              <i class="bi bi-card-image me-2"></i>Bible Cards
            </label>
          </div>
        </div>        <!-- Input Form (hidden when Bible Card Generator is selected) -->
        <form v-if="!showBibleCardGenerator" @submit.prevent="handleGenerateContent" class="input-form">
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
import BibleCardGenerator from './components/BibleCardGenerator.vue';
import useGemini from './composables/useGemini';
// Correctly import useContentStorage and StoredContent type
import useContentStorage, { type StoredContent } from './composables/useDevotions';

const selectedContentType = ref<'devotion' | 'faithIntegration'>('devotion');
const showBibleCardGenerator = ref(false);
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

// Ref for the content area
const contentAreaRef = ref<HTMLElement>();

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

  // Theme initialization
  const theme = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// Computed properties for dynamic UI text
const topicInputPlaceholder = computed(() => {
  if (showBibleCardGenerator.value) {
    return "Bible card generation uses its own interface";
  }
  return selectedContentType.value === 'devotion' 
    ? "E.g., 'finding peace in hardship', 'gratitude', or 'guidance for a tough decision'"
    : "E.g., 'teaching biology through a faith lens', 'integrating ethics in computer science', or 'faith perspectives on history'";
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
  
  // Enhanced text formatting for better readability
  text = formatContentText(text, currentContent.value.type);

  return {
    ...currentContent.value,
    text,
    verses: currentContent.value.verses || [], // Ensure verses is an array
  };
});

// Enhanced text formatting function
const formatContentText = (text: string, contentType: 'devotion' | 'faithIntegration') => {
  if (!text) return '';
  
  // Escape any existing HTML to prevent conflicts
  let formattedText = text;
  
  // Step 1: Split into paragraphs first (double line breaks)
  const paragraphs = formattedText.split(/\n\s*\n/).filter(p => p.trim());
  
  const processedParagraphs = paragraphs.map((paragraph, index) => {
    let processed = paragraph.trim();
    
    // Step 2: Handle title formatting for devotions (first paragraph only)
    if (index === 0 && contentType === 'devotion') {
      const titleMatch = processed.match(/^(?:\*\*([^*]+)\*\*|([^:]+?))\s*(:|â€”|--)\s*/);
      if (titleMatch) {
        const titleContent = titleMatch[1] || titleMatch[2];
        const separator = titleMatch[3];
        processed = processed.replace(titleMatch[0], '');
        return `<h4 class="devotion-title-intro mb-3">${titleContent.trim()}${separator}</h4><p class="devotion-paragraph">${processed}</p>`;
      }
    }
    
    // Step 3: Check if this is a special section (prayer, reflection, etc.)
    const specialSectionMatch = processed.match(/^(Prayer:|Let us pray:|Reflection:|Application:|Consider:|Today's Challenge:)\s*([\s\S]*)/i);
    if (specialSectionMatch) {
      const label = specialSectionMatch[1];
      const content = specialSectionMatch[2];
      return `<div class="devotion-prayer-section"><strong class="prayer-label">${label}</strong> ${content}</div>`;
    }
    
    // Step 4: Handle markdown-style formatting
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-emphasis">$1</strong>');
    processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="text-accent">$1</em>');
    
    // Step 5: Handle quoted text
    processed = processed.replace(/"([^"]{1,79})"/g, '<span class="devotion-quote-inline">"$1"</span>');
    processed = processed.replace(/"([^"]{80,})"/g, '<blockquote class="devotion-quote">$1</blockquote>');
    
    // Step 6: Handle lists
    const lines = processed.split('\n');    const processedLines = lines.map(line => {
      line = line.trim();
      // Numbered lists
      if (/^\d+\.\s+/.test(line)) {
        const match = line.match(/^(\d+\.\s+)(.*)$/);
        if (match) {
          return `<div class="devotion-list-item"><span class="list-number">${match[1]}</span>${match[2]}</div>`;
        }
      }
      // Bullet points
      if (/^[-â€¢]\s+/.test(line)) {
        const content = line.replace(/^[-â€¢]\s+/, '');
        return `<div class="devotion-list-item"><span class="list-bullet">â€¢</span> ${content}</div>`;
      }
      return line;
    });
    
    processed = processedLines.join('<br>');
    
    // Step 7: Check if this paragraph contains list items
    if (processed.includes('<div class="devotion-list-item">')) {
      return processed; // Don't wrap list items in paragraphs
    }
    
    // Step 8: Wrap in paragraph if not already wrapped
    return `<p class="devotion-paragraph">${processed}</p>`;
  });
  
  // Join all paragraphs
  let result = processedParagraphs.join('');
  
  // Step 9: Clean up any issues
  result = result.replace(/<p class="devotion-paragraph">\s*<\/p>/g, '');
  result = result.replace(/(<br>\s*){3,}/g, '<br><br>');
  
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
