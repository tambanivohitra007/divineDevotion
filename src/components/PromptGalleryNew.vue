<template>
  <div class="prompt-gallery">
    <div class="prompt-gallery-header">
      <h4 class="gallery-title">
        <i class="bi bi-lightbulb me-2"></i>
        Prompt Gallery
      </h4>
      <p class="gallery-subtitle">Click any example to get started</p>
    </div>

    <div class="prompt-categories">
      <div class="prompt-columns">
        <!-- Left Column - Devotion Examples -->
        <div class="prompt-column">
          <div class="prompt-category">
            <h5 class="category-title">
              <i class="bi bi-fire me-2"></i>
              Devotional Ideas
            </h5>
            <div class="prompt-list">
              <button
                v-for="prompt in visibleDevotionPrompts"
                :key="prompt.id"
                class="prompt-card"
                @click="selectPrompt(prompt.text, 'devotion')"
              >
                <div class="prompt-icon">
                  <i :class="prompt.icon"></i>
                </div>
                <div class="prompt-content">
                  <h6 class="prompt-title">{{ prompt.title }}</h6>
                  <p class="prompt-text">{{ prompt.text }}</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column - Faith & Learning Examples -->
        <div class="prompt-column">
          <div class="prompt-category">
            <h5 class="category-title">
              <i class="bi bi-lightbulb-fill me-2"></i>
              Faith & Learning Ideas
            </h5>
            <div class="prompt-list">
              <button
                v-for="prompt in visibleFaithLearningPrompts"
                :key="prompt.id"
                class="prompt-card"
                @click="selectPrompt(prompt.text, 'faithIntegration')"
              >
                <div class="prompt-icon">
                  <i :class="prompt.icon"></i>
                </div>
                <div class="prompt-content">
                  <h6 class="prompt-title">{{ prompt.title }}</h6>
                  <p class="prompt-text">{{ prompt.text }}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Show More Button -->
      <div class="show-more-container" v-if="!showAllPrompts && (devotionPrompts.length > 2 || faithLearningPrompts.length > 2)">
        <button 
          class="btn show-more-btn"
          @click="toggleShowMore"
        >
          <i class="bi bi-chevron-down me-2"></i>
          Show More Examples
        </button>
      </div>

      <!-- Show Less Button -->
      <div class="show-more-container" v-if="showAllPrompts">
        <button 
          class="btn show-more-btn"
          @click="toggleShowMore"
        >
          <i class="bi bi-chevron-up me-2"></i>
          Show Less
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface PromptExample {
  id: string;
  title: string;
  text: string;
  icon: string;
}

// Define emit for parent communication
const emit = defineEmits<{
  promptSelected: [text: string, type: 'devotion' | 'faithIntegration']
}>();

// Show all prompts state
const showAllPrompts = ref(false);

// Devotional prompt examples
const devotionPrompts: PromptExample[] = [
  {
    id: 'peace-1',
    title: 'Finding Peace',
    text: 'Finding peace in times of uncertainty and stress',
    icon: 'bi bi-heart-fill'
  },
  {
    id: 'gratitude-1',
    title: 'Gratitude Practice',
    text: 'Developing a heart of gratitude in daily life',
    icon: 'bi bi-sun-fill'
  },
  {
    id: 'forgiveness-1',
    title: 'Forgiveness',
    text: 'Learning to forgive others and ourselves',
    icon: 'bi bi-hand-thumbs-up-fill'
  },
  {
    id: 'strength-1',
    title: 'Divine Strength',
    text: 'Finding strength in God during difficult times',
    icon: 'bi bi-shield-fill'
  },
  {
    id: 'purpose-1',
    title: 'Life Purpose',
    text: 'Discovering God\'s purpose for my life',
    icon: 'bi bi-compass-fill'
  },
  {
    id: 'trust-1',
    title: 'Trusting God',
    text: 'Trusting God\'s plan when life doesn\'t make sense',
    icon: 'bi bi-tree-fill'
  },
  {
    id: 'prayer-1',
    title: 'Prayer Life',
    text: 'Deepening my prayer and communion with God',
    icon: 'bi bi-chat-heart-fill'
  },
  {
    id: 'wisdom-1',
    title: 'Seeking Wisdom',
    text: 'Seeking God\'s wisdom for important decisions',
    icon: 'bi bi-book-fill'
  },
  {
    id: 'service-1',
    title: 'Serving Others',
    text: 'Finding joy in serving others as Christ did',
    icon: 'bi bi-people-fill'
  },
  {
    id: 'hope-1',
    title: 'Hope & Faith',
    text: 'Maintaining hope and faith during dark seasons',
    icon: 'bi bi-brightness-high-fill'
  },
  {
    id: 'patience-1',
    title: 'Patience',
    text: 'Learning patience in God\'s timing',
    icon: 'bi bi-hourglass-split'
  },
  {
    id: 'love-1',
    title: 'God\'s Love',
    text: 'Understanding and experiencing God\'s unconditional love',
    icon: 'bi bi-heart-pulse-fill'
  }
];

// Faith & Learning prompt examples
const faithLearningPrompts: PromptExample[] = [
  {
    id: 'science-1',
    title: 'Science & Faith',
    text: 'Integrating biblical principles into science education',
    icon: 'bi bi-flask'
  },
  {
    id: 'math-1',
    title: 'Mathematics',
    text: 'Teaching mathematics through a Christian worldview',
    icon: 'bi bi-calculator'
  },
  {
    id: 'history-1',
    title: 'History Lessons',
    text: 'Connecting historical events with biblical principles',
    icon: 'bi bi-clock-history'
  },
  {
    id: 'literature-1',
    title: 'Literature',
    text: 'Analyzing literature through a faith-based perspective',
    icon: 'bi bi-journal-bookmark'
  },
  {
    id: 'ethics-1',
    title: 'Ethics',
    text: 'Teaching ethics and moral reasoning from a Christian perspective',
    icon: 'bi bi-balance-scale'
  },
  {
    id: 'psychology-1',
    title: 'Psychology',
    text: 'Integrating faith and psychology in understanding human behavior',
    icon: 'bi bi-brain'
  },
  {
    id: 'arts-1',
    title: 'Creative Arts',
    text: 'Using creative arts to express faith and spiritual themes',
    icon: 'bi bi-palette-fill'
  },
  {
    id: 'technology-1',
    title: 'Technology',
    text: 'Teaching responsible technology use through Christian values',
    icon: 'bi bi-laptop'
  },
  {
    id: 'business-1',
    title: 'Business Ethics',
    text: 'Applying Christian principles to business and economics',
    icon: 'bi bi-briefcase-fill'
  },
  {
    id: 'health-1',
    title: 'Health & Wellness',
    text: 'Teaching holistic health from a Christian perspective',
    icon: 'bi bi-heart-pulse'
  },
  {
    id: 'environment-1',
    title: 'Environmental Care',
    text: 'Stewardship of creation in environmental science',
    icon: 'bi bi-globe'
  },
  {
    id: 'social-1',
    title: 'Social Justice',
    text: 'Teaching social justice through biblical principles',
    icon: 'bi bi-people-fill'
  }
];

// Computed properties for visible prompts (show 2 initially, all when expanded)
const visibleDevotionPrompts = computed(() => {
  return showAllPrompts.value ? devotionPrompts : devotionPrompts.slice(0, 2);
});

const visibleFaithLearningPrompts = computed(() => {
  return showAllPrompts.value ? faithLearningPrompts : faithLearningPrompts.slice(0, 2);
});

// Method to toggle show more/less
const toggleShowMore = () => {
  showAllPrompts.value = !showAllPrompts.value;
};

// Method to handle prompt selection
const selectPrompt = (text: string, type: 'devotion' | 'faithIntegration') => {
  emit('promptSelected', text, type);
};
</script>

<style scoped>
.prompt-gallery {
  margin-bottom: 2rem;
}

.prompt-gallery-header {
  text-align: center;
  margin-bottom: 2rem;
}

.gallery-title {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.gallery-title i {
  color: var(--divine-primary);
}

.gallery-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.prompt-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prompt-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.prompt-column {
  width: 100%;
}

.prompt-category {
  width: 100%;
}

.category-title {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.category-title i {
  color: var(--divine-primary);
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.prompt-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: var(--transition-smooth);
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: var(--shadow-card);
}

.prompt-card:hover {
  background: var(--surface-primary);
  border-color: var(--divine-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(249, 115, 22, 0.15);
}

.prompt-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--gradient-divine);
  border-radius: 12px;
  flex-shrink: 0;
}

.prompt-icon i {
  color: white;
  font-size: 1.2rem;
}

.prompt-content {
  flex: 1;
  min-width: 0;
}

.prompt-title {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.prompt-text {
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Show More Button Styles */
.show-more-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.show-more-btn {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-card);
}

.show-more-btn:hover {
  background: var(--surface-primary);
  border-color: var(--divine-primary);
  color: var(--divine-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(249, 115, 22, 0.15);
}

.show-more-btn i {
  transition: var(--transition-smooth);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .prompt-columns {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .prompt-list {
    gap: 0.6rem;
  }
  
  .prompt-card {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .prompt-icon {
    width: 36px;
    height: 36px;
  }
  
  .prompt-icon i {
    font-size: 1.1rem;
  }
  
  .prompt-title {
    font-size: 0.9rem;
  }
  
  .prompt-text {
    font-size: 0.8rem;
  }
  
  .category-title {
    font-size: 1rem;
  }
  
  .gallery-title {
    font-size: 1.3rem;
  }
  
  .prompt-categories {
    gap: 1rem;
  }
  
  .show-more-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}

/* Dark mode adjustments */
[data-bs-theme="dark"] .prompt-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-bs-theme="dark"] .prompt-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--divine-primary);
}

[data-bs-theme="dark"] .show-more-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-bs-theme="dark"] .show-more-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--divine-primary);
}
</style>
