# Hooks Directory

## useModalScrollbar Hook

### Purpose

Manages persistent scrollbar behavior when modals open/close. The scrollbar remains visible globally (like the sun) and never disappears, even when modals are active.

### Features

- ✅ Always shows scrollbar on main page (no content overflow needed)
- ✅ Keeps scrollbar visible when modals open
- ✅ Prevents layout shift caused by scrollbar disappearing
- ✅ Works globally across all modals
- ✅ Automatically cleans up on unmount

### Usage

#### Basic Implementation in Modal Component

```jsx
import { useModalScrollbar } from "@/hooks/useModalScrollbar";

export default function CartModal({ isModalOpen, setIsModalOpen }) {
  // Use the hook - it automatically manages the scrollbar
  useModalScrollbar(isModalOpen);

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-[999] bg-black/40"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Modal content */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

#### What It Does:

1. When `isModalOpen` is `true`:
   - Adds `modal-open` class to `<html>` element
   - Sets `document.body.style.overflow = 'hidden'` to prevent body scroll
   - HTML element scrollbar remains visible (from CSS rules)

2. When `isModalOpen` is `false`:
   - Removes `modal-open` class from `<html>` element
   - Sets `document.body.style.overflow = 'auto'` to restore scroll
   - Everything returns to normal

3. On unmount:
   - Automatically cleans up to prevent memory leaks
   - Ensures overflow styles are reset

### CSS Integration

The hook works in conjunction with these CSS rules in `globals.css`:

```css
html {
  overflow-y: scroll !important;
  scrollbar-gutter: stable; /* Reserves space for scrollbar */
}

html.modal-open {
  overflow-y: scroll !important;
}
```

### How Scrollbar-Gutter Works

- `scrollbar-gutter: stable` reserves space for the scrollbar
- Even with no overflow content, the space is reserved
- This prevents layout shift when scrollbar appears/disappears
- Modern browsers support this (Chrome 94+, Firefox 89+, Safari 16+)

### Implementation Checklist

If you're updating existing modals, follow these steps:

1. **Import the hook at the top of your modal component:**

   ```jsx
   import { useModalScrollbar } from "@/hooks/useModalScrollbar";
   ```

2. **Add the hook call inside your component:**

   ```jsx
   useModalScrollbar(isModalOpen);
   ```

3. **Remove or keep existing overflow handling** - the hook handles it:
   ```jsx
   // This can be removed if present:
   // useEffect(() => {
   //   document.body.style.overflow = isModalOpen ? "hidden" : "auto";
   // }, [isModalOpen]);
   ```

### Files That Need Updates

Common modal components to update:

- `CartModal.jsx` - ✅ Already has manual overflow logic
- `SearchModal/ModalContent.jsx` - Check if it needs this
- `ImageModal.jsx` - Check if it needs this
- Any other custom modals

### Before and After Example

**Before (Manual overflow control):**

```jsx
useEffect(() => {
  document.body.style.overflow = isModalOpen ? "hidden" : "auto";
  return () => {
    document.body.style.overflow = "auto";
  };
}, [isModalOpen]);
```

**After (Using hook):**

```jsx
useModalScrollbar(isModalOpen);
```

### Browser Compatibility

- ✅ Chrome 94+
- ✅ Firefox 89+
- ✅ Safari 16+
- ✅ Edge 94+
- ⚠️ Older browsers: Scrollbar will work but without scrollbar-gutter stable behavior

### Troubleshooting

**Problem**: Scrollbar still disappears

- Solution: Ensure `useModalScrollbar(isModalOpen)` is called in the modal component

**Problem**: Layout shifts when scrollbar appears

- Solution: Ensure `globals.css` has `scrollbar-gutter: stable` on the html element

**Problem**: Multiple modals open simultaneously

- Solution: Call the hook in each modal component; they coordinate via the html class

**Problem**: Scrollbar not visible on mobile

- Solution: Check `globals.css` - mobile scrollbars are intentionally hidden via media query

### Best Practices

1. **Always use the hook in modals**: Don't mix manual overflow control with the hook
2. **Place hook early in component**: Call it near the top of your component
3. **Use with modal state**: Pass the same `isOpen`/`isModalOpen` state to the hook
4. **Let hook handle cleanup**: Don't manually manage body.style.overflow if using this hook
5. **Test on multiple devices**: Test on mobile, tablet, and desktop

### API Reference

```typescript
function useModalScrollbar(isOpen: boolean): void;
```

**Parameters:**

- `isOpen` (boolean): Modal open state. When true, activates persistent scrollbar mode.

**Returns:**

- void: No return value. Effect runs automatically.

---

## Related CSS Configuration

See `src/app/globals.css` for scrollbar styling:

- Scrollbar color and width customization
- Mobile scrollbar hiding
- Scrollbar-gutter stable behavior
