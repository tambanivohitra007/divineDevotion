# BibleCard Component

## Overview
The BibleCard component creates beautiful, shareable Bible verse cards with AI-generated backgrounds. It's integrated into the DevotionDisplay component and appears when users click the "Card" button next to any Bible verse.

## Features

### 🎨 AI-Generated Backgrounds
- Uses contextual prompts based on verse content
- Creates appropriate scenes (mountains for strength, water for peace, etc.)
- Beautiful gradient fallbacks for consistent visual quality

### 📱 Responsive Design
- Optimized for both mobile and desktop
- Touch-friendly interface
- Adaptive card sizing

### 🚀 Export & Sharing
- Download cards as PNG images
- Native sharing API support
- Clipboard fallback for unsupported devices

### 🎯 Smart Content Analysis
- Analyzes verse content to determine appropriate background themes
- Contextual color schemes and imagery
- Professional typography and layout

## Usage

1. **Generate a devotion** with Bible verses
2. **Click "Card"** next to any verse in the verses section
3. **Click "Generate Card"** to create the visual
4. **Download or share** your beautiful verse card

## Technical Implementation

### Background Generation
- **Primary**: Uses Gemini AI for image generation prompts
- **Fallback**: Beautiful gradient backgrounds based on content analysis
- **Themes**: Peace, strength, hope, love, light, nature, and more

### Content Processing
- Fetches verse text from Bible API if not provided
- Analyzes verse content for thematic elements
- Generates appropriate visual prompts

### Export Functionality
- Canvas-based image generation
- High-quality PNG output (800x600)
- Word wrapping and professional typography
- Proper attribution and reference display

## Future Enhancements

- Integration with actual image generation APIs (Imagen, DALL-E)
- Custom background selection
- Font and styling options
- Multiple card templates
- Batch card generation
- Social media optimization

## Browser Support
- Modern browsers with Canvas API support
- Native sharing where available
- Clipboard API for sharing fallback
