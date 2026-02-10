# Page Links Test - v3.5

Testing internal page references using @mentions and [[wiki-style]] links.

---

## 1. Basic @Mentions

The @NotionManager agent is responsible for Notion integration.

Ask @Developer for implementation details.

See @Athena for knowledge management.

Check with @Researcher for analysis.

---

## 2. Wiki-Style Links

Read [[NotionManager]] documentation for setup instructions.

The [[Athena]] agent maintains the memory system.

View [[Developer]] for technical implementation.

---

## 3. Mixed Formatting

The **@NotionManager** agent with <green>@Athena</green> support.

See [[NotionManager]] for *details* on __implementation__.

---

## 4. Non-Existent Pages (Should Show as Plain Text)

Reference to @NonExistentAgent should show as text.

Link to [[Missing Page]] should also be plain text.

---

## 5. Multiple Links in One Paragraph

The CI system uses @NotionManager, @Athena, @Developer, and @Researcher agents. These work together with [[Database]] for storage and [[Manager]] for coordination.

---

## 6. Links in Lists

Key agents:
- @NotionManager - Notion integration
- @Athena - Memory management
- @Developer - Implementation
- [[Researcher]] - Analysis

---

## 7. Links in Quotes

> The @NotionManager agent provides seamless integration with Notion, as explained in [[Documentation]].

---

## 8. Links with Other Formatting

This is a `@NotionManager` reference in code formatting (should NOT be a link).

This @NotionManager reference is **bold** and <blue>blue</blue>.

---

## 9. Real Use Case: Cross-Referenced Documentation

For Notion integration setup:
1. Configure @NotionManager with API token
2. Review [[Installation Guide]] for dependencies
3. Check @Developer notes for troubleshooting
4. See [[API Reference]] for advanced usage

When syncing agent memory:
- Use @NotionManager service API
- Follow patterns from [[TokenHunter]] integration
- Consult @Athena for memory architecture
- Reference [[MEMORY.md]] structure

---

## 10. Edge Cases

### Multiple @ Symbols
Email: contact@example.com (should not be a link)
Agent: @NotionManager (should be a link)

### Brackets Without Links
Math: f(x) = x^2 (should not be a link)
Code: [1, 2, 3] (should not be a link)
Link: [[NotionManager]] (should be a link)

### Mixed Brackets
[[NotionManager]] and [external link](https://example.com)

---

## Test Summary

**@Mention Syntax**:
- ✅ @NotionManager
- ✅ @Athena
- ✅ @Developer
- ✅ @Researcher
- ❌ @NonExistentAgent (fallback to text)

**[[Wiki-Style]] Syntax**:
- ✅ [[NotionManager]]
- ✅ [[Athena]]
- ✅ [[Developer]]
- ✅ [[Image Test]]
- ❌ [[Missing Page]] (fallback to text)

**Contexts Tested**:
- ✅ Standalone mentions
- ✅ With formatting (bold, colors)
- ✅ In lists
- ✅ In quotes
- ✅ Multiple in one paragraph
- ✅ Mixed with external links

---

**Expected Behavior**:
- Found pages → Blue clickable mentions
- Not found → Plain text (no error)
- In code formatting → Plain text (not parsed)
