# Image Support Test - v3.0

This document tests comprehensive image support in NotionManager.

---

## 1. Basic Image (No Caption)

![Architecture Diagram](https://images.unsplash.com/photo-1518770660439-4636190af475?w=800)

Text after image without caption.

---

## 2. Image with Underscore Caption

![Team Collaboration](https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800)
_Team working together on a project_

Text after the caption.

---

## 3. Image with Auto-Detected Caption

![Code Editor](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800)
Developer working on code in modern editor

More text continues here.

---

## 4. Multiple Images in Sequence

![Image 1](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400)
_First image caption_

![Image 2](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400)
_Second image caption_

![Image 3](https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400)
_Third image caption_

---

## 5. Image with Formatted Caption

![Data Visualization](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800)
_Dashboard showing **real-time** metrics with <green>success</green> indicators_

---

## 6. Images in Context

Here's an example of our architecture:

![System Architecture](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)
_High-level system architecture diagram_

As you can see from the diagram above, the system consists of three main components.

---

## 7. Different Image Formats

### PNG Image
![PNG Format](https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png)

### JPEG Image
![JPEG Format](https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800)

### GIF Image
![GIF Format](https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif)
_Animated Earth rotation_

### SVG Image
![SVG Format](https://upload.wikimedia.org/wikipedia/commons/6/6b/Bitmap_VS_SVG.svg)

---

## 8. Images in Lists

Here are our top features:

- **User Management**
  ![Users](https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600)
  _User dashboard interface_

- **Analytics Dashboard**
  ![Analytics](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600)
  _Real-time analytics view_

- **Team Collaboration**
  ![Collaboration](https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600)
  _Team workspace features_

---

## 9. Technical Documentation Example

### System Requirements

Before installation, ensure your system meets these requirements:

![System Requirements](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)
_Minimum hardware and software requirements_

**Hardware**:
- CPU: 2+ cores
- RAM: 8GB minimum
- Storage: 50GB available

### Installation Steps

1. Download the installer
   ![Download Page](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600)
   _Official download page screenshot_

2. Run the installation wizard
   ![Installer](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600)
   _Installation wizard interface_

3. Complete the setup
   ![Setup Complete](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600)
   _Final setup confirmation screen_

---

## 10. Images with Tables

Here's a comparison of different tools:

| Tool | Interface | Rating |
|------|-----------|--------|
| Tool A | ![Tool A](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200) | <green>Excellent</green> |
| Tool B | Modern | <yellow>Good</yellow> |
| Tool C | Basic | <red>Poor</red> |

Note: Images in tables may have limited support depending on Notion's rendering.

---

## 11. Edge Cases

### Empty Alt Text
![](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800)

### Very Long Caption
![Complex System](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800)
_This is a very detailed caption that explains the intricate workings of a complex distributed system architecture featuring multiple microservices, load balancers, and data stores all working together in harmony to deliver a seamless user experience._

### Image URL with Query Parameters
![Parameterized URL](https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop)
_Image with complex URL parameters_

### Image Between Lists
- Item before image
- Another item

![Interleaved Image](https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600)

- Item after image
- Final item

---

## 12. Real-World Use Case: API Documentation

### Authentication Flow

Our API uses OAuth 2.0 for authentication. Here's the flow:

![OAuth Flow](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)
_OAuth 2.0 authentication sequence diagram_

**Steps**:
1. User initiates login
2. Redirected to authorization server
3. User grants permissions
4. Application receives access token
5. API calls made with token

### Response Format

API responses follow this structure:

![JSON Response](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600)
_Example JSON response structure_

```json
{
  "status": "success",
  "data": {
    "id": 123,
    "name": "Example"
  }
}
```

---

## 13. Mixed Content Test

This section combines **all formatting** with images:

> 💡 **Important**: Always review the architecture diagram below before making changes.

![Architecture Overview](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800)
_Complete system architecture with <blue>services</blue>, <green>databases</green>, and <orange>caches</orange>_

***

Key components:
- [x] API Gateway (✅ deployed)
- [x] Microservices (✅ deployed)
- [ ] Monitoring Dashboard (⏳ in progress)

***

For more details, see our [documentation](https://example.com/docs).

---

## Test Summary

**Image Formats Tested**:
- ✅ PNG
- ✅ JPEG
- ✅ GIF (animated)
- ✅ SVG (vector)

**Caption Types Tested**:
- ✅ No caption
- ✅ Underscore caption (_text_)
- ✅ Auto-detected caption
- ✅ Formatted caption (bold, colors, etc.)
- ✅ Long caption (> 100 chars)

**Context Types Tested**:
- ✅ Standalone images
- ✅ Images in lists
- ✅ Images in numbered steps
- ✅ Images in technical docs
- ✅ Images with tables (experimental)
- ✅ Images between other blocks
- ✅ Multiple consecutive images

**Edge Cases Tested**:
- ✅ Empty alt text
- ✅ Complex URLs with parameters
- ✅ Very long captions
- ✅ Images interleaved with lists

---

**Total Images**: 30+
**Test Status**: Ready for Notion sync
**Expected Result**: All images should render with proper captions and formatting
