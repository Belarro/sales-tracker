#ifndef CHASM_H
#define CHASM_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#ifdef __APPLE__
#include <CoreGraphics/CoreGraphics.h>
#include <QuartzCore/QuartzCore.h>
#endif

// ============================================================================
// CHASM FRAMEWORK - Core Types and API
// Cross-platform UI framework inspired by SwiftUI declarative patterns
// ============================================================================

// Forward declarations
typedef struct chasm_app chasm_app_t;
typedef struct chasm_window chasm_window_t;
typedef struct chasm_view chasm_view_t;
typedef struct chasm_text chasm_text_t;
typedef struct chasm_button chasm_button_t;
typedef struct chasm_vstack chasm_vstack_t;
typedef struct chasm_hstack chasm_hstack_t;

// Basic types
typedef struct {
    float r, g, b, a;
} chasm_color_t;

typedef struct {
    float x, y, width, height;
} chasm_rect_t;

typedef struct {
    float width, height;
} chasm_size_t;

typedef struct {
    float x, y;
} chasm_point_t;

// Callback types
typedef void (*chasm_button_callback_t)(void* user_data);
typedef void (*chasm_app_callback_t)(chasm_app_t* app);

// Core structures
struct chasm_app {
    char* name;
    chasm_window_t* main_window;
    chasm_app_callback_t launch_handler;
    chasm_app_callback_t terminate_handler;
    void* user_data;
    bool is_running;
};

struct chasm_window {
    char* title;
    chasm_size_t size;
    chasm_point_t position;
    chasm_view_t* content_view;
    void* native_window;
    bool is_visible;
};

struct chasm_view {
    chasm_rect_t frame;
    chasm_color_t background_color;
    chasm_view_t** children;
    int child_count;
    int child_capacity;
    void* native_view;
};

struct chasm_text {
    chasm_view_t base;
    char* content;
    chasm_color_t text_color;
    float font_size;
    char* font_name;
};

struct chasm_button {
    chasm_view_t base;
    char* title;
    chasm_button_callback_t callback;
    void* user_data;
    chasm_color_t title_color;
    chasm_color_t background_color;
};

struct chasm_vstack {
    chasm_view_t base;
    float spacing;
    int alignment; // 0=leading, 1=center, 2=trailing
};

struct chasm_hstack {
    chasm_view_t base;
    float spacing;
    int alignment; // 0=top, 1=center, 2=bottom
};

// ============================================================================
// COLOR HELPERS
// ============================================================================

chasm_color_t chasm_color_rgba(float r, float g, float b, float a);
chasm_color_t chasm_color_rgb(float r, float g, float b);
chasm_color_t chasm_color_white(void);
chasm_color_t chasm_color_black(void);
chasm_color_t chasm_color_red(void);
chasm_color_t chasm_color_green(void);
chasm_color_t chasm_color_blue(void);
chasm_color_t chasm_color_yellow(void);
chasm_color_t chasm_color_orange(void);
chasm_color_t chasm_color_purple(void);
chasm_color_t chasm_color_gray(void);
chasm_color_t chasm_color_clear(void);

// ============================================================================
// APP MANAGEMENT
// ============================================================================

chasm_app_t* chasm_app_create(const char* name);
void chasm_app_destroy(chasm_app_t* app);
void chasm_app_set_launch_handler(chasm_app_t* app, chasm_app_callback_t handler);
void chasm_app_set_terminate_handler(chasm_app_t* app, chasm_app_callback_t handler);
void chasm_app_set_user_data(chasm_app_t* app, void* user_data);
void* chasm_app_get_user_data(chasm_app_t* app);
int chasm_app_run(chasm_app_t* app);
void chasm_app_quit(chasm_app_t* app);

// ============================================================================
// WINDOW MANAGEMENT
// ============================================================================

chasm_window_t* chasm_window_create(const char* title, chasm_size_t size);
void chasm_window_destroy(chasm_window_t* window);
void chasm_window_set_title(chasm_window_t* window, const char* title);
void chasm_window_set_size(chasm_window_t* window, chasm_size_t size);
void chasm_window_set_position(chasm_window_t* window, chasm_point_t position);
void chasm_window_set_content_view(chasm_window_t* window, chasm_view_t* view);
void chasm_window_show(chasm_window_t* window);
void chasm_window_hide(chasm_window_t* window);
chasm_size_t chasm_window_get_size(chasm_window_t* window);

// ============================================================================
// VIEW MANAGEMENT
// ============================================================================

chasm_view_t* chasm_view_create(void);
void chasm_view_destroy(chasm_view_t* view);
void chasm_view_set_frame(chasm_view_t* view, chasm_rect_t frame);
void chasm_view_set_background_color(chasm_view_t* view, chasm_color_t color);
void chasm_view_add_child(chasm_view_t* parent, chasm_view_t* child);
void chasm_view_remove_child(chasm_view_t* parent, chasm_view_t* child);

// ============================================================================
// TEXT VIEWS
// ============================================================================

chasm_text_t* chasm_text_create(const char* content);
void chasm_text_destroy(chasm_text_t* text);
void chasm_text_set_content(chasm_text_t* text, const char* content);
void chasm_text_set_color(chasm_text_t* text, chasm_color_t color);
void chasm_text_set_font_size(chasm_text_t* text, float size);
void chasm_text_set_font_name(chasm_text_t* text, const char* font_name);
chasm_view_t* chasm_text_as_view(chasm_text_t* text);

// ============================================================================
// BUTTONS
// ============================================================================

chasm_button_t* chasm_button_create(const char* title);
void chasm_button_destroy(chasm_button_t* button);
void chasm_button_set_title(chasm_button_t* button, const char* title);
void chasm_button_set_callback(chasm_button_t* button, chasm_button_callback_t callback, void* user_data);
void chasm_button_set_title_color(chasm_button_t* button, chasm_color_t color);
void chasm_button_set_background_color(chasm_button_t* button, chasm_color_t color);
chasm_view_t* chasm_button_as_view(chasm_button_t* button);

// ============================================================================
// LAYOUT CONTAINERS
// ============================================================================

chasm_vstack_t* chasm_vstack_create(float spacing);
void chasm_vstack_destroy(chasm_vstack_t* vstack);
void chasm_vstack_set_spacing(chasm_vstack_t* vstack, float spacing);
void chasm_vstack_set_alignment(chasm_vstack_t* vstack, int alignment);
void chasm_vstack_add_child(chasm_vstack_t* vstack, chasm_view_t* child);
chasm_view_t* chasm_vstack_as_view(chasm_vstack_t* vstack);

chasm_hstack_t* chasm_hstack_create(float spacing);
void chasm_hstack_destroy(chasm_hstack_t* hstack);
void chasm_hstack_set_spacing(chasm_hstack_t* hstack, float spacing);
void chasm_hstack_set_alignment(chasm_hstack_t* hstack, int alignment);
void chasm_hstack_add_child(chasm_hstack_t* hstack, chasm_view_t* child);
chasm_view_t* chasm_hstack_as_view(chasm_hstack_t* hstack);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

chasm_rect_t chasm_rect_make(float x, float y, float width, float height);
chasm_size_t chasm_size_make(float width, float height);
chasm_point_t chasm_point_make(float x, float y);

// Platform-specific initialization (called internally)
void chasm_platform_init(void);
void chasm_platform_cleanup(void);

#endif // CHASM_H