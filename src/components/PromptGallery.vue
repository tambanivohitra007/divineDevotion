<template>
  <div class="modern-prompt-gallery">
    <div class="gallery-header">
      <h3 class="gallery-title">{{ $t('promptGallery.title') }}</h3>
      <p class="gallery-subtitle">{{ $t('promptGallery.subtitle') }}</p>
    </div>

    <div class="prompt-grid">
      <!-- Devotion Prompts -->
      <div class="prompt-section">
        <h4 class="section-title">
          <i class="bi bi-stars"></i>
          <span>{{ $t('promptGallery.devotionalIdeas') }}</span>
        </h4>
        <div class="prompt-cards">
          <button
            v-for="prompt in visibleDevotionPrompts"
            :key="prompt.id"
            class="prompt-card devotion-card"
            @click="selectPrompt(prompt.id, 'devotion')"
          >
            <div class="card-icon">
              <i :class="prompt.icon"></i>
            </div>
            <div class="card-content">
              <h5 class="card-title">{{ $t(`promptGallery.prompts.${prompt.id}.title`) }}</h5>
              <p class="card-description">{{ $t(`promptGallery.prompts.${prompt.id}.text`) }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Faith & Learning Prompts -->
      <div class="prompt-section">
        <h4 class="section-title">
          <i class="bi bi-lightbulb"></i>
          <span>{{ $t('promptGallery.faithLearningIdeas') }}</span>
        </h4>
        <div class="prompt-cards">
          <button
            v-for="prompt in visibleFaithLearningPrompts"
            :key="prompt.id"
            class="prompt-card faith-card"
            @click="selectPrompt(prompt.id, 'faithIntegration')"
          >
            <div class="card-icon">
              <i :class="prompt.icon"></i>
            </div>
            <div class="card-content">
              <h5 class="card-title">{{ $t(`promptGallery.prompts.${prompt.id}.title`) }}</h5>
              <p class="card-description">{{ $t(`promptGallery.prompts.${prompt.id}.text`) }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Show More/Less Button -->
      <div class="gallery-actions" v-if="devotionPrompts.length > 3 || faithLearningPrompts.length > 3">
        <button 
          class="show-more-button"
          @click="toggleShowMore"
        >
          <span>{{ showAllPrompts ? $t('promptGallery.showLess') : $t('promptGallery.showMore') }}</span>
          <i :class="showAllPrompts ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
    id: 'peace',
    title: 'Finding Peace',
    text: 'Finding peace in times of uncertainty and stress',
    icon: 'bi bi-heart-fill'
  },
  {
    id: 'gratitude',
    title: 'Gratitude Practice',
    text: 'Developing a heart of gratitude in daily life',
    icon: 'bi bi-sun-fill'
  },
  {
    id: 'forgiveness',
    title: 'Forgiveness',
    text: 'Learning to forgive others and ourselves',
    icon: 'bi bi-hand-thumbs-up-fill'
  },
  {
    id: 'strength',
    title: 'Divine Strength',
    text: 'Finding strength in God during difficult times',
    icon: 'bi bi-shield-fill'
  },
  {
    id: 'purpose',
    title: 'Life Purpose',
    text: 'Discovering God\'s purpose for my life',
    icon: 'bi bi-compass-fill'
  },
  {
    id: 'trust',
    title: 'Trusting God',
    text: 'Trusting God\'s plan when life doesn\'t make sense',
    icon: 'bi bi-tree-fill'
  },
  {
    id: 'prayer',
    title: 'Prayer Life',
    text: 'Deepening my prayer and communion with God',
    icon: 'bi bi-chat-heart-fill'  },
  {
    id: 'wisdom',
    title: 'Seeking Wisdom',
    text: 'Seeking God\'s wisdom for important decisions',
    icon: 'bi bi-book-fill'
  },
  {
    id: 'service',
    title: 'Serving Others',
    text: 'Finding joy in serving others as Christ did',
    icon: 'bi bi-people-fill'
  },
  {
    id: 'hope',
    title: 'Hope & Faith',
    text: 'Maintaining hope and faith during dark seasons',
    icon: 'bi bi-brightness-high-fill'
  },
  {
    id: 'patience',
    title: 'Patience',
    text: 'Learning patience in God\'s timing',
    icon: 'bi bi-hourglass-split'
  },
  {
    id: 'love',
    title: 'God\'s Love',
    text: 'Understanding and experiencing God\'s unconditional love',
    icon: 'bi bi-heart-pulse-fill'
  }
];

// Faith & Learning prompt examples
const faithLearningPrompts: PromptExample[] = [
  {
    id: 'science',
    title: 'Science & Faith',
    text: 'Integrating biblical principles into science education',
    icon: 'bi bi-flask'
  },
  {
    id: 'math',
    title: 'Mathematics',
    text: 'Teaching mathematics through a Christian worldview',
    icon: 'bi bi-calculator'
  },
  {
    id: 'history',
    title: 'History Lessons',
    text: 'Connecting historical events with biblical principles',
    icon: 'bi bi-clock-history'
  },
  {
    id: 'literature',
    title: 'Literature',
    text: 'Analyzing literature through a faith-based perspective',
    icon: 'bi bi-journal-bookmark'
  },
  {
    id: 'ethics',
    title: 'Ethics',
    text: 'Teaching ethics and moral reasoning from a Christian perspective',
    icon: 'bi bi-balance-scale'
  },
  {
    id: 'psychology',
    title: 'Psychology',
    text: 'Integrating faith and psychology in understanding human behavior',
    icon: 'bi bi-brain'  },
  {
    id: 'arts',
    title: 'Creative Arts',
    text: 'Using creative arts to express faith and spiritual themes',
    icon: 'bi bi-palette-fill'
  },
  {
    id: 'technology',
    title: 'Technology',
    text: 'Teaching responsible technology use through Christian values',
    icon: 'bi bi-laptop'
  },
  {
    id: 'business',
    title: 'Business Ethics',
    text: 'Applying Christian principles to business and economics',
    icon: 'bi bi-briefcase-fill'
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    text: 'Teaching holistic health from a Christian perspective',
    icon: 'bi bi-heart-pulse'
  },
  {
    id: 'environment',
    title: 'Environmental Care',
    text: 'Stewardship of creation in environmental science',
    icon: 'bi bi-globe'
  },
  {
    id: 'justice',
    title: 'Social Justice',
    text: 'Teaching social justice through biblical principles',
    icon: 'bi bi-people-fill'
  }
];

// Computed properties for visible prompts (show 3 initially, all when expanded)
const visibleDevotionPrompts = computed(() => {
  return showAllPrompts.value ? devotionPrompts : devotionPrompts.slice(0, 3);
});

const visibleFaithLearningPrompts = computed(() => {
  return showAllPrompts.value ? faithLearningPrompts : faithLearningPrompts.slice(0, 3);
});

// Method to toggle show more/less
const toggleShowMore = () => {
  showAllPrompts.value = !showAllPrompts.value;
};

// Method to handle prompt selection
const selectPrompt = (promptId: string, type: 'devotion' | 'faithIntegration') => {
  // Get the translated text using the translation key
  const translatedText = t(`promptGallery.prompts.${promptId}.text`);
  emit('promptSelected', translatedText, type);
};
</script>

<style scoped>
/* Modern Prompt Gallery Styles */
.modern-prompt-gallery {
  max-width: 100%;
}

.gallery-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.gallery-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.gallery-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.prompt-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.prompt-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.section-title i {
  color: var(--color-accent);
  font-size: 18px;
}

.prompt-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.prompt-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.prompt-card:hover {
  background: var(--color-background);
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-icon {
  width: 40px;
  height: 40px;
  background: var(--color-accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.devotion-card .card-icon {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
}

.faith-card .card-icon {
  background: linear-gradient(135deg, var(--color-success), #059669);
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.4;
}

.card-description {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.gallery-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--space-2xl);
}

.show-more-button {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.show-more-button:hover {
  background: var(--color-background);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
  transform: translateY(-1px);
}

.show-more-button i {
  font-size: 14px;
  transition: transform var(--transition-fast);
}

/* Responsive Design */
@media (max-width: 768px) {
  .prompt-cards {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .prompt-card {
    padding: var(--space-lg);
    gap: var(--space-md);
  }
  
  .card-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-description {
    font-size: 12px;
  }
  
  .section-title {
    font-size: 15px;
  }
  
  .gallery-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .prompt-card {
    padding: var(--space-md);
  }
  
  .card-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}</style>
