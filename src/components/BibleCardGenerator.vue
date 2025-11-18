
<template>
  <div class="bible-card-generator container-fluid py-4">
    <div class="row g-4">
      <!-- Controls -->
      <div class="col-lg-5">
        <div class="card p-0 h-100">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h5 class="mb-0">
              <i class="bi bi-palette me-2"></i>
              {{ $t?.('bibleCardGenerator.title') ?? 'Bible Card Generator' }}
            </h5>
            <small class="text-muted">Merriweather • Gemini</small>
          </div>

          <div class="card-body">
            <!-- Verse input -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                <i class="bi bi-book me-1"></i>
                {{ $t?.('bibleCardGenerator.verseReference') ?? 'Verse Reference' }}
              </label>
              <div class="input-group">
                <input v-model="verseReference" @input="validateVerse" class="form-control" placeholder="John 3:16" />
                <button class="btn btn-outline-secondary" @click="suggestVerse" :disabled="isSuggestingVerse" title="Suggestions">
                  <span v-if="isSuggestingVerse" class="spinner small"></span>
                  <span v-else class="material-symbol material-symbol-sm">lightbulb</span>
                </button>
              </div>
              <div v-if="verseValidationMessage" :class="verseValidationClass" class="form-text mt-1">{{ verseValidationMessage }}</div>
            </div>

            <!-- Suggestion buttons -->
            <div v-if="verseSuggestions.length" class="mb-3">
              <label class="form-label fw-semibold">Suggested</label>
              <div class="d-flex flex-wrap gap-2">
                <button v-for="s in verseSuggestions" :key="s.reference" class="btn btn-sm btn-outline-primary" @click="selectSuggestion(s)">{{ s.reference }}</button>
              </div>
            </div>

            <!-- Style description -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Style / Mood</label>
              <textarea v-model="styleDescription" class="form-control" rows="2" placeholder="warm, muted, cinematic"></textarea>
              <div class="mt-2 d-flex gap-2 align-items-center">
                <button class="btn btn-sm btn-link p-0" @click="refineStyle" :disabled="isRefiningStyle">
                  <span v-if="isRefiningStyle" class="spinner small"></span>
                  <span v-else class="material-symbol material-symbol-sm">magic_button</span>
                  <span class="ms-1">AI refine</span>
                </button>
                <small class="text-muted">or pick a preset</small>
              </div>
            </div>

            <!-- Presets -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Presets</label>
              <div class="d-flex flex-wrap gap-2">
                <button v-for="p in stylePresets" :key="p.name" class="btn btn-sm" :class="styleDescription === p.description ? 'btn-primary' : 'btn-outline-info'" @click="applyPreset(p)">{{ p.name }}</button>
              </div>
            </div>

            <!-- Theme selector -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Theme</label>
              <div class="d-flex flex-wrap gap-2 align-items-center">
                <button v-for="t in colorThemes" :key="t.name" class="theme-btn btn btn-sm" :title="t.name" :style="{ background: t.bg }" :class="{ selected: selectedTheme.name === t.name }" @click="selectTheme(t)"></button>
                <small class="text-muted ms-2">{{ selectedTheme.name }}</small>
              </div>
            </div>

            <!-- Custom color picker -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Custom Color</label>
              <div class="d-flex align-items-center gap-2">
                <input type="color" v-model="customThemeColor" class="form-control form-control-color" />
                <button class="btn btn-sm btn-outline-secondary" @click="applyCustomColor">Apply</button>
                <button class="btn btn-sm btn-link text-muted" @click="resetTheme">Reset</button>
              </div>
            </div>

            <!-- Generate button -->
            <div class="d-grid mt-2">
              <button class="btn btn-gradient-primary btn-lg" @click="generateCard" :disabled="!canGenerate || isGenerating">
                <span v-if="isGenerating" class="spinner me-2"></span>
                <span v-else class="material-symbol material-symbol-sm me-2">auto_awesome</span>
                <span>{{ isGenerating ? 'Generating...' : 'Generate Card' }}</span>
              </button>
            </div>

            <div v-if="error" class="alert alert-danger mt-3 py-2"><strong>Error:</strong> {{ error }}</div>
          </div>
        </div>
      </div>

      <!-- Preview & Actions -->
      <div class="col-lg-7">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0"><i class="bi bi-eye me-2"></i>{{ $t?.('bibleCardGenerator.preview') ?? 'Preview' }}</h5>
            <div v-if="generatedCard" class="d-flex gap-2">
              <button class="btn btn-default btn-sm" @click="downloadCard">
                <span class="material-symbol">download</span> Export
              </button>
              <button class="btn btn-outline-secondary btn-sm" @click="shareCard">Share</button>
              <button class="btn btn-outline-info btn-sm" @click="regenerateCard">Regenerate</button>
            </div>
          </div>

          <div class="card-body d-flex flex-column align-items-center">
            <div v-if="isGenerating" class="w-100 text-center py-4">
              <div class="spinner-border text-primary mb-3" style="width:3rem;height:3rem" role="status"><span class="visually-hidden">Loading...</span></div>
              <p class="mb-1">{{ generationStage }}</p>
              <div class="progress" style="height:8px">
                <div class="progress-bar progress-bar-striped progress-bar-animated" :style="{ width: generationProgress + '%' }"></div>
              </div>
            </div>

            <div v-else-if="generatedCard" class="w-100">
              <!-- Preview card (solid background with icons & text) -->
              <div class="bible-card-preview mx-auto" :style="previewStyle">
                <div class="card-top">
                  <div class="verse-label">VERSE</div>
                  <div class="top-right-icon">
                    <span class="material-symbol material-symbol-lg">menu_book</span>
                  </div>
                </div>

                <div class="card-content">
                  <blockquote class="verse-text">"{{ generatedCard.verseText }}"</blockquote>
                  <cite class="verse-reference">{{ generatedCard.verseReference }}</cite>
                </div>

                <div class="card-bottom">
                  <div class="bottom-left">
                    <img :src="iconLogoUrl" alt="Logo" width="40" height="40" />
                    <div class="brand">GOD FIRST</div>
                  </div>
                  <div class="bottom-right">
                    <span class="material-symbol material-symbol-lg">arrow_forward</span>
                  </div>
                </div>
              </div>

              <!-- Prompt info -->
              <div v-if="lastGeneratedImagePrompt" class="mt-3">
                <small class="text-muted">Prompt (used for inspiration):</small>
                <p class="fst-italic small mb-0">{{ lastGeneratedImagePrompt }}</p>
              </div>
            </div>

            <div v-else class="placeholder-state text-center py-5 w-100">
              <i class="bi bi-image display-1 text-muted mb-3"></i>
              <h5 class="text-muted">{{ $t?.('bibleCardGenerator.placeholder_state.title') ?? 'No card yet' }}</h5>
              <p class="text-muted">{{ $t?.('bibleCardGenerator.placeholder_state.subtitle') ?? 'Enter verse & generate' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div> 
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

/* -------------------------
 Types
------------------------- */
interface BibleCardData {
  verseText: string;
  verseReference: string;
}

/* -------------------------
 State
------------------------- */
const verseReference = ref('');
const styleDescription = ref('');
const generatedCard = ref<BibleCardData | null>(null);

const verseSuggestions = ref<{ reference: string; theme?: string }[]>([]);
const verseValidationMessage = ref('');
const generationProgress = ref(0);

const isGenerating = ref(false);
const isSuggestingVerse = ref(false);
const isRefiningStyle = ref(false);
const error = ref<string | null>(null);

const lastGeneratedImagePrompt = ref<string | null>(null);

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/* -------------------------
 Fonts, Presets, Themes
------------------------- */
const stylePresets = [
  { name: 'Warm Dawn', description: 'soft sunrise glow, golden rim light, calm atmosphere' },
  { name: 'Quiet Forest', description: 'misty trees, soft green tones, gentle sunbeams' },
  { name: 'Ocean Calm', description: 'wide calm sea, pastel sunset, tranquil vibe' }
];

const colorThemes = [
  { name: 'Red Devotional', bg: '#9C4F55', text: '#FFFFFF' },
  { name: 'Midnight Blue', bg: '#1D2A44', text: '#FFFFFF' },
  { name: 'Olive Green', bg: '#556B2F', text: '#FFFFFF' },
  { name: 'Royal Purple', bg: '#4A2B63', text: '#FFFFFF' },
  { name: 'Warm Sand', bg: '#D4C7B0', text: '#3A2E2E' }
];

const selectedTheme = ref(colorThemes[0]);

/* custom theme color picker */
const customThemeColor = ref('#9C4F55');

/* icon/logo URL (logo should be placed in public/icons/logo.png) */
const iconLogoUrl = '/icons/logo.png';

/* -------------------------
 Computed
------------------------- */
const canGenerate = computed(() => !!verseReference.value.trim());
const verseValidationClass = computed(() => verseValidationMessage.value.toLowerCase().includes('valid') ? 'text-success' : 'text-warning');

const previewStyle = computed(() => {
  const bg = selectedTheme.value.bg;
  const text = selectedTheme.value.text;
  return {
    background: bg,
    color: text
  } as Record<string,string>;
});

/* -------------------------
 Simple verse validation & fetch (keeps your existing API usage)
------------------------- */
const validateVerse = () => {
  const v = verseReference.value.trim();
  if (!v) { verseValidationMessage.value = ''; return; }
  const match = v.match(/^(\d*\s*[A-Za-z\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
  verseValidationMessage.value = match ? 'Valid verse reference format' : 'Please use format: Book Chapter:Verse (e.g., John 3:16)';
};

/* fetch verse text (static KJV JSON) */
const mapBookName = (book: string) => {
  const b = book.toLowerCase().replace(/\s+/g, '');
  const map: Record<string,string> = { psalm: 'psalms', psalms: 'psalms', songofsolomon: 'songofsolomon' };
  return map[b] || b;
};
const fetchVerseText = async (verseRef: string) => {
  try {
    const match = verseRef.match(/^(\d*\s*[A-Za-z\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (!match) return '';
    const book = mapBookName(match[1].trim());
    const chapter = match[2], verse = match[3];
    const apiUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${book}/chapters/${chapter}/verses/${verse}.json`;
    const resp = await fetch(apiUrl);
    if (!resp.ok) return '';
    const json = await resp.json();
    return (json.text || '').trim();
  } catch (e) {
    console.error(e);
    return '';
  }
};

/* -------------------------
 Gemini helpers (text tasks)
------------------------- */
const suggestVerse = async () => {
  if (!GEMINI_API_KEY) { error.value = 'Gemini API key not configured'; return; }
  isSuggestingVerse.value = true;
  try {
    const body = {
      contents: [{ parts: [{ text: 'Provide 6 Bible verse references (reference and theme) as a JSON array like [{\"reference\":\"John 3:16\",\"theme\":\"Love\"}, ...]' }] }],
      generationConfig: { temperature: 0.2 }
    };
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) verseSuggestions.value = parsed;
        else throw new Error('unexpected');
      } catch {
        const match = text.match(/\[.*\]/s);
        if (match) verseSuggestions.value = JSON.parse(match[0]);
        else verseSuggestions.value = [{ reference: 'John 3:16', theme: 'Love' }, { reference: 'Psalm 23:1', theme: 'Trust' }];
      }
    }
  } catch (e) {
    console.error(e);
    verseSuggestions.value = [{ reference: 'John 3:16', theme: 'Love' }, { reference: 'Psalm 23:1', theme: 'Trust' }];
  } finally { isSuggestingVerse.value = false; }
};

const selectSuggestion = (s: { reference: string }) => { verseReference.value = s.reference; verseSuggestions.value = []; validateVerse(); };

const applyPreset = (p: { description: string }) => styleDescription.value = p.description;

const refineStyle = async () => {
  if (!GEMINI_API_KEY || !styleDescription.value.trim()) return;
  isRefiningStyle.value = true;
  try {
    const body = {
      contents: [{ parts: [{ text: `Refine this style into 2-3 evocative sentences for an illustration prompt: "${styleDescription.value}"` }] }],
      generationConfig: { temperature: 0.6 }
    };
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) styleDescription.value = text.trim();
  } catch (e) {
    console.error(e);
  } finally { isRefiningStyle.value = false; }
};

/* -------------------------
 Main generate flow (creates the card data)
------------------------- */
const generationStage = computed(() => {
  if (generationProgress.value < 25) return 'Validating...';
  if (generationProgress.value < 50) return 'Fetching verse...';
  if (generationProgress.value < 70) return 'Composing...';
  if (generationProgress.value < 95) return 'Finalizing...';
  return 'Ready';
});

const generateCard = async () => {
  if (!canGenerate.value) return;
  error.value = null;
  isGenerating.value = true;
  generationProgress.value = 5;

  try {
    generationProgress.value = 25;
    const verseText = await fetchVerseText(verseReference.value);
    if (!verseText) throw new Error('Unable to fetch verse text; check the reference.');

    generationProgress.value = 60;

    // Optional: use AI to help craft a slightly longer verse display or style hint
    if (styleDescription.value.trim() && GEMINI_API_KEY) {
      try {
        const prompt = `Create a concise display sentence (8-30 words) to pair with this verse for a devotional card.
Verse: "${verseText}" (${verseReference.value})
Style cues: "${styleDescription.value}"`;
        const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6 } };
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) lastGeneratedImagePrompt.value = text.trim();
      } catch (e) {
        lastGeneratedImagePrompt.value = null;
      }
    } else {
      lastGeneratedImagePrompt.value = null;
    }

    generationProgress.value = 90;
    generatedCard.value = { verseText, verseReference: verseReference.value.trim() };
    generationProgress.value = 100;
  } catch (e: any) {
    console.error(e);
    error.value = e?.message || 'Failed to generate card';
  } finally {
    isGenerating.value = false;
    setTimeout(() => (generationProgress.value = 0), 500);
  }
};

const regenerateCard = () => { if (generatedCard.value) generateCard(); };

/* -------------------------
 Theme selection utilities
------------------------- */
const selectTheme = (t: { name: string; bg: string; text: string }) => selectedTheme.value = t;
const applyCustomColor = () => {
  selectedTheme.value = {
    name: 'Custom Color',
    bg: customThemeColor.value,
    text: pickTextColorBasedOnBg(customThemeColor.value)
  };
};
const resetTheme = () => selectedTheme.value = colorThemes[0];

const pickTextColorBasedOnBg = (hex: string) => {
  const c = hex.replace('#','');
  const r = parseInt(c.substr(0,2),16);
  const g = parseInt(c.substr(2,2),16);
  const b = parseInt(c.substr(4,2),16);
  const brightness = (r*299 + g*587 + b*114)/1000;
  return brightness > 140 ? '#000000' : '#FFFFFF';
};

/* -------------------------
 Download: draw card onto canvas (matching preview)
 - Draw solid background
 - Render Material Symbols (font glyphs) and logo PNG onto canvas
 - Wait for fonts to load before drawing icons
------------------------- */

const waitForFonts = async () => {
  try {
    // Ensure Merriweather and Material Symbols are loaded
    await (document as any).fonts.load("16px 'Merriweather'");
    await (document as any).fonts.load("16px 'Material Symbols Outlined'");
    // tiny delay
    await new Promise((r) => setTimeout(r, 120));
  } catch (e) { /* ignore */ }
};

const drawMaterialIcon = (ctx: CanvasRenderingContext2D, glyph: string, x: number, y: number, size: number, color: string) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  ctx.font = `${size}px 'Material Symbols Outlined'`;
  ctx.fillText(glyph, x, y);
  ctx.restore();
};

const drawImageFromUrl = (ctx: CanvasRenderingContext2D, url: string, x: number, y: number, w: number, h: number) => {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { try { ctx.drawImage(img, x, y, w, h); } catch(e){}; resolve(); };
    img.onerror = () => resolve();
    img.src = url;
  });
};

const downloadCard = async () => {
  if (!generatedCard.value) return;
  await waitForFonts();

  const width = 1600;
  const height = Math.round(width * 9 / 16);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const bg = selectedTheme.value.bg;
  const fg = selectedTheme.value.text;

  // fill background
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,width,height);

  // padding and layout metrics
  const padding = Math.round(width * 0.06);

  // top-left label "VERSE"
  ctx.fillStyle = fg;
  ctx.font = `${Math.round(height * 0.032)}px 'Merriweather', Georgia, serif`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('VERSE', padding, padding);

  // draw top-right material icon (menu_book)
  const iconSize = Math.round(height * 0.04);
  drawMaterialIcon(ctx, 'menu_book', width - padding - iconSize - 4, padding, iconSize, fg);

  // center verse text (wrapped)
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  const verseFontSize = Math.round(height * 0.045);
  ctx.font = `italic ${verseFontSize}px 'Merriweather', Georgia, serif`;
  const verse = `"${generatedCard.value.verseText}"`;
  const maxWidth = Math.round(width * 0.78);
  const lines = wrapText(ctx, verse, maxWidth);
  const lineHeight = Math.round(verseFontSize * 1.2);
  let startY = Math.round(height * 0.28) - Math.floor(lines.length / 2) * lineHeight;
  lines.forEach((l, i) => ctx.fillText(l, width / 2, startY + i * lineHeight));

  // reference
  ctx.font = `700 ${Math.round(height * 0.03)}px 'Merriweather', Georgia, serif`;
  ctx.fillText(generatedCard.value.verseReference, width / 2, startY + lines.length * lineHeight + Math.round(height * 0.04));

  // bottom-left logo + brand
  const logoSize = Math.round(height * 0.065);
  await drawImageFromUrl(ctx, iconLogoUrl, padding, height - padding - logoSize, logoSize, logoSize);
  ctx.textAlign = 'left';
  ctx.font = `700 ${Math.round(height * 0.03)}px 'Merriweather', Georgia, serif`;
  ctx.fillText('GOD FIRST', padding + logoSize + 12, height - padding - 10);

  // bottom-right arrow as material icon
  drawMaterialIcon(ctx, 'arrow_forward', width - padding - iconSize - 4, height - padding - iconSize - 4, iconSize, fg);

  // export
  const link = document.createElement('a');
  link.download = `bible-${generatedCard.value.verseReference.replace(/\W+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const test = current ? current + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else current = test;
  }
  if (current) lines.push(current);
  return lines;
};

/* -------------------------
 Share (navigator.share fallback)
------------------------- */
const shareCard = async () => {
  if (!generatedCard.value) return;
  const text = `"${generatedCard.value.verseText}" — ${generatedCard.value.verseReference}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: `Bible Verse: ${generatedCard.value.verseReference}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Verse copied to clipboard');
    }
  } catch (e) {
    console.error(e);
  }
};

/* -------------------------
 Watchers
------------------------- */
watch(verseReference, validateVerse);

/* -------------------------
 Expose simple things for template use
------------------------- */
</script>

<style scoped>
/* Load Merriweather and Material Symbols */
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

/* small helper classes for Material Symbols sizes */
.material-symbol { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48; display:inline-block; line-height:1; }
.material-symbol-sm { font-size:16px; }
.material-symbol-lg { font-size:36px; }

/* base */
.bible-card-generator { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

/* Card & header */
.card { border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: none; }
.card-header { background: linear-gradient(90deg,var(--bs-primary,#667eea),var(--bs-secondary,#764ba2)); color: white; border-radius: 14px 14px 0 0; padding: .75rem 1rem; }

/* Buttons */
.btn-gradient-primary { background: linear-gradient(135deg,#667eea,#764ba2); border: none; color: white; box-shadow: 0 6px 18px rgba(102,126,234,0.25); }
.btn-gradient-primary:disabled { opacity: 0.6; }

/* Theme buttons */
.theme-btn { width: 36px; height: 36px; border-radius: 8px; border: 2px solid transparent; padding: 0; }
.theme-btn.selected { outline: 3px solid rgba(255,255,255,0.15); transform: translateY(-2px); }

/* Preview card */
.bible-card-preview {
  width: 100%;
  max-width: 820px;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  padding: 48px 56px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 420px;
  margin: 0 auto;
}

/* Top row */
.card-top { display:flex; justify-content:space-between; align-items:center; }
/* small label */
.verse-label { font-family: Merriweather, Georgia, serif; letter-spacing: 4px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 300; }

/* content */
.card-content { display:flex; flex-direction:column; align-items:flex-start; text-align:left; margin-top: 36px; margin-bottom: 36px; }
.verse-text { font-family: 'Merriweather', Georgia, serif; font-size: 22px; font-style: italic; line-height:1.6; color: inherit; margin:0 0 1rem 0; }
.verse-reference { font-family: 'Merriweather', Georgia, serif; font-weight:700; font-size: 16px; color: inherit; }

/* bottom */
.card-bottom { display:flex; justify-content:space-between; align-items:center; }
.bottom-left { display:flex; align-items:center; gap:12px; }
.brand { font-family: 'Merriweather', Georgia, serif; font-weight:700; letter-spacing:1px; color: inherit; }

/* small preview image for uploaded backgrounds */
.custom-bg-preview { width: 96px; height: 64px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(0,0,0,0.06); }

/* placeholder */
.placeholder-state { padding: 4rem 2rem; }

/* spinner small */
.spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.4); border-top-color: rgba(255,255,255,0.9); border-radius:50%; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

/* responsive tweaks */
@media (max-width: 992px) {
  .bible-card-preview { padding: 28px; min-height: 340px; }
  .verse-text { font-size: 18px; }
}
</style>
