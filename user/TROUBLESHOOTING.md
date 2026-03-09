# Troubleshooting Guide - Dearest Mide User App

## 🔍 Issue: "Home page is not showing details"

If the home page is not displaying content properly, follow these steps:

---

## 📋 Step 1: Identify the Problem

### Option A: Check Browser Console (F12)
1. Press **F12** to open Developer Tools
2. Click the **Console** tab
3. Look for any red error messages
4. Screenshot or note any errors
5. Check if you see: `✨ Dearest Mide Blog App Initialized`

### Option B: Run Diagnostics
1. Open: `diagnostics.html` in your browser
2. Check all resource statuses
3. See recommended actions

### Option C: Test Different Approaches
```bash
# Method 1: Python Server (Recommended)
cd user
python -m http.server 8000
# Then open: http://localhost:8000

# Method 2: Node.js Server
npx http-server

# Method 3: Ruby Server
ruby -run -ehttpd . -p 8000
```

---

## 🛠️ Common Issues & Solutions

### ❌ Issue: Blank/White Page
**Possible Causes:**
- External CDN not loading
- CSS file is broken
- JavaScript errors

**Solutions:**
1. Check internet connection
2. Hard refresh: **Ctrl+Shift+Del** (Windows) or **Cmd+Shift+R** (Mac)
3. Clear browser cache completely
4. Try different browser
5. Check browser console for errors

### ❌ Issue: Content not visible (text is hidden)
**Possible Causes:**
- Text color same as background
- CSS not loaded properly
- Dark mode accidentally enabled

**Solutions:**
1. Check if dark mode toggle is on (moon icon in navbar)
2. Press **F12** and check: Application > Local Storage > theme
3. Force light mode by opening console and running:
```javascript
localStorage.setItem('theme', 'light-mode');
location.reload();
```

### ❌ Issue: Layout is broken/columns misaligned
**Possible Causes:**
- Bootstrap CSS not loading
- CSS file corrupted
- Browser doesn't support CSS Grid

**Solutions:**
1. Check Console tab (F12) for CSS loading errors
2. Try different browser
3. Reload page
4. Check diagnostics.html

### ❌ Issue: Images not loading
**Possible Causes:**
- No internet connection
- Unsplash API down
- CORS issues

**Solutions:**
1. Check internet connection (ping google.com)
2. Try opening images directly in browser
3. Images are from Unsplash - service might be temporarily down
4. Replace image URLs in HTML if needed

### ❌ Issue: Animations not working
**Solutions:**
1. Check if AOS library loaded: `console.log(typeof AOS)`
2. Scroll down to trigger animations
3. Refresh page
4. Try different browser

### ❌ Issue: Search/Forms not working
**Solutions:**
1. Check console for JavaScript errors
2. Ensure JavaScript is enabled
3. Check if appUtils is available: `console.log(window.appUtils)`
4. Try hard refresh

---

## 🔧 Quick Fixes (Copy-Paste to Browser Console)

### Fix 1: Check what's loaded
```javascript
console.log({
    bootstrap: typeof bootstrap !== 'undefined' ? 'Loaded' : 'Missing',
    aos: typeof AOS !== 'undefined' ? 'Loaded' : 'Missing', 
    appUtils: typeof window.appUtils !== 'undefined' ? 'Loaded' : 'Missing',
    storageAvailable: (() => { try { localStorage.test=''; delete localStorage.test; return true; } catch(e) { return false; } })()
});
```

### Fix 2: Force light mode
```javascript
document.body.classList.remove('dark-mode');
localStorage.setItem('theme', 'light-mode');
```

### Fix 3: Enable all elements display
```javascript
const allElements = document.querySelectorAll('*');
allElements.forEach(el => {
    if (getComputedStyle(el).display === 'none') {
        el.style.display = 'block';
    }
});
```

### Fix 4: Reload all resources
```javascript
location.reload(true); // Hard refresh
```

---

## 📱 Testing Responsiveness

### Desktop View
- Content should be in 3-column grid
- Sidebar visible on right
- Full navigation bar

### Tablet View (iPad)
- Content should be in 2-column layout
- Navigation collapses on small tablets

### Mobile View (< 768px)
- Single column layout
- Hamburger menu appears
- Full-width cards

**Test:**
1. Press F12
2. Click device toolbar icon
3. Select different devices
4. Refresh page

---

## 🌐 Browser Compatibility

| Browser | Status | Fix |
|---------|--------|-----|
| Chrome 90+ | ✅ Full Support | Try clearing cache |
| Firefox 88+ | ✅ Full Support | Check extensions |
| Safari 14+ | ✅ Full Support | Try private mode |
| Edge 90+ | ✅ Full Support | Update browser |
| IE 11 | ❌ Not Supported | Use modern browser |

---

## 📊 Advanced Debugging

### Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload page
4. Look for:
   - ❌ Red items = failed to load
   - ⚠️ Grey items = blocked
   - ✅ White items = loaded successfully

### Check CSS Rules
1. Right-click any element
2. Select "Inspect"
3. Look at computed styles
4. Check for conflicting CSS

### Debug JavaScript
1. Open Console
2. Type commands to test functionality
3. Check for runtime errors
4. Verify data is loaded

---

## 💡 Pro Tips

1. **Always hard refresh first**: Ctrl+Shift+Del (or Cmd+Shift+R on Mac)
2. **Try incognito mode**: Extensions might interfere
3. **Check internet**: https://www.google.com
4. **Update browser**: Old versions have bugs
5. **Disable extensions**: Try disabling ad blockers and privacy tools

---

## 🆘 Still Not Working?

Try these URLs in order:
1. `http://localhost:8000/diagnostics.html` - Check resources
2. `http://localhost:8000/pages/search.html` - Try another page
3. `http://localhost:8000/pages/post-detail.html` - Try different page
4. `about:blank` - Test browser itself

---

## 📝 Create a Bug Report

If problem persists, provide:
```
Browser: [Chrome/Firefox/Safari/Edge]
OS: [Windows/Mac/Linux]
Error message (if any): [From console]
What you see: [Blank page? No text? Layout broken?]
What you expected to see: [Featured articles, categories, etc.]
Steps to reproduce:
  1. [First step]
  2. [Second step]
  3. [What happens]
```

---

## 🎯 Common Solutions Summary

| Problem | Quick Fix |
|---------|-----------|
| Nothing shows | Hard refresh: Ctrl+Shift+Del |
| Text not visible | Check dark mode (moon icon) |
| Layout broken | Clear cache, try Chrome |
| Slow loading | Check internet speed |
| Images missing | Check internet access |
| Broken search | Refresh page, check console |

---

**Need more help?** Check QUICKSTART.md or DOCUMENTATION.md
