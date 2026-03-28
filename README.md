# Hamz Swim School - UI Modernization

This repository contains the source code for the Hamz Swim School website. 
Recently, the user interface was overhauled to feature a modern **Glassmorphism** aesthetic, inspired by platforms like Menu256. 

This README explains the core concepts behind the CSS changes, making it easier to maintain or tweak the design in the future.

## What is Glassmorphism?
Glassmorphism is a UI trend characterized by:
1. **Translucency (Frosted Glass Effect):** Elements look like panes of frosted glass.
2. **Vivid Backgrounds:** The glass effect only works if there is something colorful behind it to blur.
3. **Light Borders:** A sheer, 1px light border is added to elements to simulate the edge of a piece of glass.
4. **Subtle Shadows:** Elements float above the background.

---

## Key CSS Concepts in this Codebase

### 1. The Background Blobs (`.glass-bg-blobs` & `.blob`)
To make the glass effect visible on plain pages (like the Shop and Services), we injected animated, blurred circles into the background of the HTML.
*   **How it works:** The `.blob` class uses `filter: blur(80px)` to turn a solid circle of color into a massive, soft neon glow.
*   **Animation:** An `@keyframes float` animation is applied so the blobs slowly drift around the screen, making the glass reflections dynamic.

### 2. The Base Glass Utility (`.glass-panel`)
Instead of rewriting the glass CSS for every single card, hero, and section, a utility class was created in `style.css`.
*   If you want *any* `div` to look like glass, simply add `class="glass-panel"` to it in the HTML.
*   **The Magic Property:** `backdrop-filter: blur(16px);`. This is the CSS property that actually creates the frosted glass look. It blurs whatever elements are *behind* the panel.

### 3. Dynamic Variables (`:root` & `body.dark-theme`)
The glass properties are tied to CSS variables. 
*   In **Light Mode**, the glass panels have a white tint (`rgba(255, 255, 255, 0.4)`).
*   In **Dark Mode**, the glass panels switch to a dark navy tint (`rgba(15, 23, 42, 0.6)`), and the shadows become heavier so the cards don't get lost in the dark background. 

### 4. The Hero Section Blend (`mix-blend-mode`)
The main image of Coach Hamz in the `index.html` Hero section was updated to blend with the new aesthetic.
*   Instead of putting the background image directly on the `.hero` div, it was moved to a `::before` pseudo-element.
*   `mix-blend-mode: overlay` was applied. This forces the photograph to chemically blend with the neon `.blob` colors sitting behind it, rather than just covering them up.

### 5. Responsive Wrapping (`.about-flex`)
The About section on the homepage was updated using CSS Flexbox.
*   On **mobile screens**, `flex-wrap: wrap-reverse` is used so the Text appears *below* the Image.
*   A media query (`@media (min-width: 900px)`) watches for desktop screens. When triggered, it switches to `flex-direction: row-reverse;`, placing the Image cleanly on the right and the Text on the left.

---

## How to Edit the Theme
*   **Change the Main Color:** Open `css/style.css` and find `--primary-blue: #0ea5e9;` in the `:root`. Change this hex code, and all buttons and primary blobs will update.
*   **Change the Glass Blur:** Find the `.glass-panel` class and change `backdrop-filter: blur(16px)` to a higher number for more frost, or a lower number for clearer glass.