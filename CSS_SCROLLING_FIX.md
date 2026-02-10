# CSS Scrolling Fix for Admin Panel

The file `src/styles/App.css` is being auto-formatted. Here's what needs to be added manually:

## Fix 1: Add scrolling to admin-setup container

Find this CSS rule (around line 209):

```css
.admin-setup {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

**Replace it with:**

```css
.admin-setup {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}
```

## Fix 2: Add scrolling to user lists

Find this CSS rule (around line 273):

```css
.user-list {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}
```

**Replace it with:**

```css
.user-list {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}
```

## What These Changes Do:

1. **`.admin-setup`** - Makes the entire admin panel scrollable if content is too tall
2. **`.user-list`** - Makes the user/template lists scrollable after 400px height

This will fix the scrolling issue you experienced when viewing long lists of note templates!
