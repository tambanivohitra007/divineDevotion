<template>
  <div v-if="show" class="saved-content-modal">
    <div class="modal-overlay" @click="closeDialog"></div>
    <div class="modal-panel">
      <div class="modal-header">
        <h2 class="modal-title">{{ $t('sidebar.saved') }}</h2>
        <button class="modal-close-btn" @click="closeDialog">
          <i class="bi bi-x"></i>
        </button>
      </div>
      
      <!-- Search -->
      <div class="modal-search">
        <div class="search-input-container">
          <i class="bi bi-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            :placeholder="$t('sidebar.searchPlaceholder')"
            v-model="searchQuery"
          />
        </div>
      </div>
      
      <!-- Content List -->
      <div class="modal-content">
        <div v-if="filteredContent.length === 0 && searchQuery" class="empty-state">
          <i class="bi bi-search empty-icon"></i>
          <p class="empty-text">{{ $t('sidebar.noMatches') }}</p>
        </div>
        <div v-if="filteredContent.length === 0 && !searchQuery && savedContent.length === 0" class="empty-state">
          <i class="bi bi-collection empty-icon"></i>
          <p class="empty-text">{{ $t('sidebar.noContent') }}</p>
        </div>
        <div
          v-for="content in filteredContent"
          :key="content.id || content.topic" 
          class="saved-item"
          @click="selectContent(content)"
        >
          <div class="saved-item-content">
            <div class="saved-item-header">
              <h4 class="saved-item-title">
                {{ content.topic || $t('sidebar.savedContent') }}
              </h4>
              <span class="content-type-badge" :class="'badge-' + content.type">
                {{ content.type === 'devotion' ? $t('contentTypes.devotionShort') : $t('contentTypes.ideaShort') }}
              </span>
            </div>
            <p class="saved-item-excerpt">{{ truncateText(content.text, 80) }}</p>
            <div class="saved-item-meta">
              <span class="meta-icon">
                <i :class="content.type === 'devotion' ? 'bi bi-fire' : 'bi bi-lightbulb'"></i>
              </span>
              <time class="meta-date">Recently saved</time>
            </div>
          </div>
          <button 
            class="delete-btn" 
            @click.stop="deleteContent(content.id)" 
            v-if="content.id"
            :title="$t('tooltips.deleteContent')"
          >
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { StoredContent } from '../composables/useDevotions';

interface Props {
  show: boolean;
  savedContent: StoredContent[];
}

interface Emits {
  (e: 'close'): void;
  (e: 'select-content', content: StoredContent): void;
  (e: 'delete-content', id: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const searchQuery = ref('');

const filteredContent = computed(() => {
  if (!searchQuery.value) {
    return props.savedContent;
  }
  return props.savedContent.filter(item =>
    (item.topic && item.topic.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (item.text && item.text.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );
});

const closeDialog = () => {
  emit('close');
};

const selectContent = (content: StoredContent) => {
  emit('select-content', content);
  closeDialog();
};

const deleteContent = (id: string) => {
  emit('delete-content', id);
};

const truncateText = (text: string, length: number) => {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
};
</script>

<style scoped>
.saved-content-modal {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.modal-overlay {
  position: absolute;
  inset: 0;
  background: var(--color-overlay);
  animation: fadeIn var(--transition-normal) forwards;
}

.modal-panel {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
  animation: slideIn var(--transition-normal) ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl) var(--space-2xl);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.modal-close-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.modal-close-btn:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-color: var(--color-accent);
  transform: scale(1.05);
}

.modal-search {
  padding: var(--space-xl) var(--space-2xl);
  border-bottom: 1px solid var(--color-border);
}

.search-input-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  font-size: 16px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: var(--space-md) var(--space-md) var(--space-md) 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg) 0;
}

.empty-state {
  padding: var(--space-4xl) var(--space-xl);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-lg);
}

.empty-text {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0;
}

.saved-item {
  padding: var(--space-lg) var(--space-2xl);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  display: flex;
  gap: var(--space-md);
}

.saved-item:hover {
  background: var(--color-surface);
}

.saved-item:last-child {
  border-bottom: none;
}

.saved-item-content {
  flex: 1;
  min-width: 0;
}

.saved-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.saved-item-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.content-type-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  flex-shrink: 0;
}

.badge-devotion {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.badge-faithIntegration {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.saved-item-excerpt {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 var(--space-md) 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.saved-item-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.meta-icon {
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.meta-date {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.delete-btn {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  padding: var(--space-xs);
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  opacity: 0;
  font-size: 14px;
}

.saved-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

@media (max-width: 768px) {
  .saved-content-modal {
    padding: var(--space-lg);
  }
  
  .modal-panel {
    max-height: 90vh;
  }
  
  .modal-header {
    padding: var(--space-lg) var(--space-xl);
  }
  
  .modal-search {
    padding: var(--space-lg) var(--space-xl);
  }
  
  .saved-item {
    padding: var(--space-lg);
  }
  
  .saved-item-title {
    font-size: 14px;
  }
}
</style>