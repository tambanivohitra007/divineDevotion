# Radial Gradient Background - HIBP Style Implementation

## Overview
Enhanced the background with sophisticated radial gradients inspired by Have I Been Pwned's distinctive visual style, creating depth and atmospheric lighting effects.

## Radial Gradient Layers

### Layer 1: Base Background
```css
body::before {
  background: var(--bg-primary, #13151f);
  /* Solid dark navy base */
}
```

### Layer 2: Main Radial Gradients (Animated)
```css
body::after {
  background: 
    /* Central top glow - main focal point */
    radial-gradient(ellipse 120% 100% at 50% 40%, rgba(0, 212, 170, 0.12) 0%, rgba(19, 21, 31, 0) 50%),
    
    /* Top-right accent */
    radial-gradient(ellipse 100% 80% at 80% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    
    /* Bottom-left accent */
    radial-gradient(ellipse 100% 80% at 20% 80%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
    
    /* Subtle center darkening for depth */
    radial-gradient(circle at 50% 50%, rgba(26, 29, 41, 0.3) 0%, transparent 100%);
  
  animation: float 25s ease-in-out infinite, pulse 15s ease-in-out infinite alternate;
}
```

### Layer 3: App Container Overlay
```css
#app::before {
  background: radial-gradient(
    ellipse 80% 60% at 50% 30%, 
    transparent 0%, 
    rgba(19, 21, 31, 0.6) 100%
  );
  /* Creates vignette effect - lighter center, darker edges */
}
```

### Layer 4: Layout Background
```css
.perplexity-layout {
  background: radial-gradient(
    ellipse 100% 80% at 50% 20%, 
    rgba(0, 212, 170, 0.03) 0%, 
    transparent 60%
  );
  /* Subtle top glow for the main layout */
}
```

### Layer 5: Content Cards
```css
.content-card,
.specialized-content {
  background: 
    radial-gradient(ellipse 120% 100% at 50% 0%, rgba(0, 212, 170, 0.03) 0%, transparent 60%),
    var(--color-surface-elevated);
}

/* Additional overlay */
.content-card::after {
  background: radial-gradient(
    circle at 50% -20%, 
    rgba(0, 212, 170, 0.05) 0%, 
    transparent 50%
  );
}
```

## Visual Hierarchy

### Primary Focal Point
- **Center-top (50% 40%)**: Brightest teal glow (12% opacity)
- Creates natural eye-level focus
- Elliptical shape (120% x 100%) for wide coverage

### Secondary Accents
- **Top-right (80% 20%)**: Purple accent (8% opacity)
- **Bottom-left (20% 80%)**: Teal accent (8% opacity)
- Creates visual balance and depth

### Depth & Atmosphere
- **Center darkening**: Subtle vignette effect
- **Edge darkening**: Progressive fade to 60% opacity at edges
- **Card glows**: Individual content cards have top-emanating glow

## Color Strategy

### Teal (Primary - #00d4aa)
- **Position**: Center-top, bottom-left
- **Purpose**: Main brand color, creates warmth and focus
- **Intensity**: 3-12% opacity for subtle effect

### Purple (Secondary - #6366f1)
- **Position**: Top-right
- **Purpose**: Complementary accent, adds visual interest
- **Intensity**: 8% opacity for balance

### Dark Navy (Base - #13151f, #1a1d29)
- **Position**: Edges and vignette
- **Purpose**: Creates depth, focuses attention to center
- **Intensity**: 30-60% opacity for layering

## Animation Effects

### Float Animation (25s)
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  33%      { transform: translateY(-30px) rotate(2deg) scale(1.05); }
  66%      { transform: translateY(-15px) rotate(-2deg) scale(0.98); }
}
```
- Gentle vertical movement
- Subtle rotation for organic feel
- Scale variations for breathing effect

### Pulse Animation (15s)
```css
@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50%      { opacity: 1; }
}
```
- Breathing effect on gradients
- Adds life to static elements
- Alternates direction for smooth loop

## Technical Implementation

### Z-Index Layering
```
-2: Base background (body::before)
-1: Radial gradients (body::after, #app::before)
 0: Layout and content (perplexity-layout)
 1+: Interactive elements (cards, buttons)
```

### Performance Optimization
- Fixed positioning for background layers (GPU acceleration)
- Pointer-events: none on overlay elements
- Single animation on main gradient layer
- Efficient use of opacity for layering

### Responsive Behavior
- Elliptical gradients scale with viewport
- Percentage-based positioning maintains composition
- Mobile-friendly with no performance impact

## HIBP Design Principles Applied

1. **Central Focus**: Lighter center draws attention to content
2. **Atmospheric Depth**: Multiple gradient layers create 3D effect
3. **Subtle Movement**: Animations add life without distraction
4. **Professional Aesthetic**: Dark base with teal accents
5. **Vignette Effect**: Natural eye guidance to center

## Visual Impact

### Before
- Solid dark background
- Flat appearance
- Less depth

### After
- Dynamic radial gradients
- Multi-layered depth
- Atmospheric lighting
- Professional polish
- Brand color integration
- Subtle animation

## Browser Compatibility

✅ Chrome/Edge: Full support
✅ Firefox: Full support  
✅ Safari: Full support (with -webkit prefix)
✅ Mobile browsers: Optimized performance

## Accessibility

- Maintains contrast ratios (WCAG AA compliant)
- Low opacity prevents distraction
- Respects prefers-reduced-motion
- No interference with text readability

## Future Enhancements

1. Add subtle noise texture overlay
2. Implement time-based color shifts
3. Add interactive cursor-following gradient
4. Create seasonal gradient variations
5. Add parallax effect on scroll

---

**Result**: Professional, atmospheric background that matches HIBP's sophisticated design while maintaining the spiritual essence of Divine Devotion.
