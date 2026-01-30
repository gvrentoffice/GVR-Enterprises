# Design System

## 🛠 Tailwind Configuration Mapping

### Primary Color (Luxury Zinc)
- **Value:** `#18181B` (Zinc-900)
- Map to `primary` in `tailwind.config.js`
- **Usage:** Primary buttons, headers, dark backgrounds for high contrast
- **Meaning:** Sophistication, Stability, Premium Quality

**Shades (Zinc Scale):**
- `primary-50`: `#F4F4F5` (Page Background)
- `primary-100` to `primary-800`: Zinc Scale
- `primary-900`: `#18181B` (Base/Foreground)

### Secondary Color (Muted Gold)
- **Value:** `#D97706` (Amber-600)
- Map to `secondary`
- **Usage:** Accents, CTAs, Highlights, Badges
- **Meaning:** Luxury, Wealth, Warmth

### Radius
- **Value:** `0.75rem` (rounded-xl) - Refined curve
- **Value:** `1.5rem` (rounded-2xl) - For cards/containers

---

## Tailwind Config Example

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#18181B',  // Zinc 900
          50: '#F4F4F5',       // Background
          // ... zinc scale
        },
        secondary: {
          DEFAULT: '#D97706',  // Amber 600
        },
      },
      borderRadius: {
        DEFAULT: '0.75rem',   // rounded-xl
        '2xl': '1.5rem',
      },
    },
  },
};
```

---

## CSS Variables Approach (Alternative)

```css
:root {
  --color-primary: #4169E1;
  --color-secondary: #FFB84D;
  --radius: 0.5rem;
}
```

---

## Usage in Components

```jsx
// Primary button
<button className="bg-primary hover:bg-primary-700 text-white rounded-lg">
  Click Me
</button>

// Card with medium radius
<div className="bg-white rounded-lg shadow-md">
  Content
</div>

// Link with primary color
<a href="#" className="text-primary hover:text-primary-700">
  Learn More
</a>
```

---

## Locked Design Tokens

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| Primary Color | `#18181B` (Zinc-900) | `bg-primary`, `text-primary` |
| Secondary Color | `#D97706` (Amber-600) | `bg-secondary`, `text-secondary` |
| Border Radius | `0.75rem` / `1.5rem` | `rounded-xl`, `rounded-2xl` |

**Do not deviate from these values.**
