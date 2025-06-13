const testText = 'This is **bold text** and this is *italic text* in a paragraph.';
console.log('Original:', testText);

// Test the regex patterns
let processed = testText;

// First regex - bold
processed = processed.replace(/\*\*(.*?)\*\*/g, (_match, content) => {
  const sanitizedContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
  if (!sanitizedContent) return '';
  return `<strong class="text-emphasis">${sanitizedContent}</strong>`;
});

console.log('After bold:', processed);

// Second regex - italic (this is the problematic one)
processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, (_match, content) => {
  const sanitizedContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
  if (!sanitizedContent) return '';
  return `<em class="text-accent">${sanitizedContent}</em>`;
});

console.log('After italic:', processed);

// Test what happens with malformed input
const testProblematic = 'Here is some **bold** text and *italic* content that might break.';
console.log('\nTesting problematic input:', testProblematic);

let result = testProblematic;
result = result.replace(/\*\*(.*?)\*\*/g, (_match, content) => {
  const sanitizedContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
  if (!sanitizedContent) return '';
  return `<strong class="text-emphasis">${sanitizedContent}</strong>`;
});

console.log('After bold processing:', result);

result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, (_match, content) => {
  const sanitizedContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
  if (!sanitizedContent) return '';
  return `<em class="text-accent">${sanitizedContent}</em>`;
});

console.log('Final result:', result);
