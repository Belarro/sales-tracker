# Notion Rich Text Formatting Demo

## Basic Text Styles

This demonstrates all supported rich text formatting options.

### Bold Text
Use **bold text** to emphasize important content.
Multiple **bold** items in **one sentence** work great.

### Italic Text
Use *italic text* for emphasis or titles.
Mix with regular text: The *Quick Reference Guide* is available.

### Underline
Use __underlined text__ for headings or emphasis.
Works well __standalone__ or in combination.

### Code
Use `code formatting` for technical terms like `npm install` or `function_name()`.
Inline code: `const x = 42` is a variable assignment.

### Strikethrough
~~This text is outdated~~ and should be ignored.
Status: ~~In Progress~~ → **Complete**

---

## Links

Check out the [Notion API](https://developers.notion.com) for more details.
View our [Dashboard](https://www.notion.so/29560b6e8d1881bab5aad92f8fbffdac) in Notion.
Read the [Documentation](https://github.com/anthropics/claude-code) on GitHub.

---

## Colors

Notion supports 9 text colors and 9 background colors!

### Text Colors

<red>Red text for errors or warnings</red>
<orange>Orange text for alerts</orange>
<yellow>Yellow text for cautions</yellow>
<green>Green text for success messages</green>
<blue>Blue text for information</blue>
<purple>Purple text for special notes</purple>
<pink>Pink text for highlights</pink>
<brown>Brown text for neutral emphasis</brown>
<gray>Gray text for secondary content</gray>

### Background Colors

<red_background>Red background for critical alerts</red_background>
<orange_background>Orange background for warnings</orange_background>
<yellow_background>Yellow background for highlights</yellow_background>
<green_background>Green background for success</green_background>
<blue_background>Blue background for info boxes</blue_background>
<purple_background>Purple background for special sections</purple_background>
<pink_background>Pink background for emphasis</pink_background>
<brown_background>Brown background for neutral blocks</brown_background>
<gray_background>Gray background for subdued content</gray_background>

---

## Practical Examples

### Status Indicators

Status: <green>Active</green>
Phase: <blue>Implementation</blue>
Warning: <yellow_background>Review Required</yellow_background>
Error: <red_background>Action Needed</red_background>

### Code References

The `parseRichText()` function is defined in `markdown-parser-enhanced.js`.
Run `node sync-with-enhanced-formatting.js` to test the new parser.
Check __line 42__ for the color validation logic.

### Important Notices

<yellow_background>**Note:** This feature requires Node.js 18+</yellow_background>

<red_background>**Warning:** Breaking changes in v2.0</red_background>

<green_background>**Success:** All tests passing (98% coverage)</green_background>

### Formatted Lists

- **Bold item** with emphasis
- *Italic item* for titles
- `Code item` for technical terms
- <red>Red item</red> for errors
- [Link item](https://example.com) for references
- __Underlined item__ for headings
- ~~Deprecated item~~ that's obsolete

### Task Checklist

- [x] **Basic formatting** (bold, italic, code) ✅
- [x] __Underline support__ ✅
- [x] <green>Color support</green> ✅
- [x] [Link support](https://notion.com) ✅
- [x] ~~Strikethrough~~ ✅
- [ ] Nested formatting (future enhancement)

---

## Mixed Formatting Examples

Normal text with **bold**, *italic*, `code`, __underline__, and <red>color</red> all together.

Key: <yellow_background>Important</yellow_background> | Status: <green>Active</green> | [Docs](https://docs.example.com) | `v1.2.3`

Result: **Success** → <green_background>All systems operational</green_background>

---

## Callouts

!> **Important:** Read the documentation before proceeding.

?> **Tip:** Use color backgrounds for visual hierarchy.

*> **Note:** Enhanced parser supports 19 Notion colors!

---

## Technical Documentation Example

### API Response Format

The `NotionService.logSession()` method returns a **page object** with the following structure:

- `id` - <blue>String</blue> - Unique page identifier
- `created_time` - <blue>Date</blue> - Timestamp when created
- `url` - <blue>String</blue> - Public URL to view page
- `properties` - <purple>Object</purple> - Page properties and values

Example usage:
```javascript
const page = await NotionService.logSession({
  title: 'My Task',
  agent: 'Developer',
  status: 'Completed'
});
```

Status codes:
- <green>200</green> - Success
- <yellow>429</yellow> - Rate limited
- <red>401</red> - Unauthorized

---

## Summary

### Supported Formats ✅

| Format | Syntax | Example | Works |
|--------|--------|---------|-------|
| Bold | `**text**` | **bold** | ✅ |
| Italic | `*text*` | *italic* | ✅ |
| Underline | `__text__` | __underline__ | ✅ |
| Code | `` `text` `` | `code` | ✅ |
| Strikethrough | `~~text~~` | ~~strike~~ | ✅ |
| Link | `[text](url)` | [link](https://example.com) | ✅ |
| Color | `<color>text</color>` | <red>red</red> | ✅ |
| Background | `<color_background>text</color_background>` | <yellow_background>highlight</yellow_background> | ✅ |

### Total Formatting Options

- **5** basic text styles (bold, italic, underline, code, strikethrough)
- **9** text colors
- **9** background colors
- **1** link format
- **= 24** total formatting capabilities! 🎉

---

**Created**: 2025-10-23
**Parser**: `markdown-parser-enhanced.js`
**Version**: 2.0.0 - Enhanced Edition
**Status**: <green_background>Production Ready</green_background>
