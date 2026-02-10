#include "chasm.h"

// ============================================================================
// COLOR HELPERS IMPLEMENTATION
// ============================================================================

chasm_color_t chasm_color_rgba(float r, float g, float b, float a) {
    return (chasm_color_t){r, g, b, a};
}

chasm_color_t chasm_color_rgb(float r, float g, float b) {
    return chasm_color_rgba(r, g, b, 1.0f);
}

chasm_color_t chasm_color_white(void) { return chasm_color_rgb(1.0f, 1.0f, 1.0f); }
chasm_color_t chasm_color_black(void) { return chasm_color_rgb(0.0f, 0.0f, 0.0f); }
chasm_color_t chasm_color_red(void) { return chasm_color_rgb(1.0f, 0.0f, 0.0f); }
chasm_color_t chasm_color_green(void) { return chasm_color_rgb(0.0f, 1.0f, 0.0f); }
chasm_color_t chasm_color_blue(void) { return chasm_color_rgb(0.0f, 0.0f, 1.0f); }
chasm_color_t chasm_color_yellow(void) { return chasm_color_rgb(1.0f, 1.0f, 0.0f); }
chasm_color_t chasm_color_orange(void) { return chasm_color_rgb(1.0f, 0.65f, 0.0f); }
chasm_color_t chasm_color_purple(void) { return chasm_color_rgb(0.5f, 0.0f, 0.5f); }
chasm_color_t chasm_color_gray(void) { return chasm_color_rgb(0.5f, 0.5f, 0.5f); }
chasm_color_t chasm_color_clear(void) { return chasm_color_rgba(0.0f, 0.0f, 0.0f, 0.0f); }

// ============================================================================
// UTILITY FUNCTIONS IMPLEMENTATION
// ============================================================================

chasm_rect_t chasm_rect_make(float x, float y, float width, float height) {
    return (chasm_rect_t){x, y, width, height};
}

chasm_size_t chasm_size_make(float width, float height) {
    return (chasm_size_t){width, height};
}

chasm_point_t chasm_point_make(float x, float y) {
    return (chasm_point_t){x, y};
}

// ============================================================================
// APP MANAGEMENT IMPLEMENTATION
// ============================================================================

chasm_app_t* chasm_app_create(const char* name) {
    chasm_app_t* app = malloc(sizeof(chasm_app_t));
    if (!app) return NULL;
    
    app->name = malloc(strlen(name) + 1);
    strcpy(app->name, name);
    app->main_window = NULL;
    app->launch_handler = NULL;
    app->terminate_handler = NULL;
    app->user_data = NULL;
    app->is_running = false;
    
    return app;
}

void chasm_app_destroy(chasm_app_t* app) {
    if (!app) return;
    
    if (app->name) free(app->name);
    if (app->main_window) chasm_window_destroy(app->main_window);
    free(app);
}

void chasm_app_set_launch_handler(chasm_app_t* app, chasm_app_callback_t handler) {
    if (app) app->launch_handler = handler;
}

void chasm_app_set_terminate_handler(chasm_app_t* app, chasm_app_callback_t handler) {
    if (app) app->terminate_handler = handler;
}

void chasm_app_set_user_data(chasm_app_t* app, void* user_data) {
    if (app) app->user_data = user_data;
}

void* chasm_app_get_user_data(chasm_app_t* app) {
    return app ? app->user_data : NULL;
}

void chasm_app_quit(chasm_app_t* app) {
    if (app) app->is_running = false;
}

// ============================================================================
// VIEW MANAGEMENT IMPLEMENTATION
// ============================================================================

chasm_view_t* chasm_view_create(void) {
    chasm_view_t* view = malloc(sizeof(chasm_view_t));
    if (!view) return NULL;
    
    view->frame = chasm_rect_make(0, 0, 0, 0);
    view->background_color = chasm_color_clear();
    view->children = NULL;
    view->child_count = 0;
    view->child_capacity = 0;
    view->native_view = NULL;
    
    return view;
}

void chasm_view_destroy(chasm_view_t* view) {
    if (!view) return;
    
    // Destroy all children
    for (int i = 0; i < view->child_count; i++) {
        chasm_view_destroy(view->children[i]);
    }
    
    if (view->children) free(view->children);
    free(view);
}

void chasm_view_set_frame(chasm_view_t* view, chasm_rect_t frame) {
    if (view) view->frame = frame;
}

void chasm_view_set_background_color(chasm_view_t* view, chasm_color_t color) {
    if (view) view->background_color = color;
}

void chasm_view_add_child(chasm_view_t* parent, chasm_view_t* child) {
    if (!parent || !child) return;
    
    // Expand capacity if needed
    if (parent->child_count >= parent->child_capacity) {
        int new_capacity = parent->child_capacity == 0 ? 4 : parent->child_capacity * 2;
        chasm_view_t** new_children = realloc(parent->children, new_capacity * sizeof(chasm_view_t*));
        if (!new_children) return;
        
        parent->children = new_children;
        parent->child_capacity = new_capacity;
    }
    
    parent->children[parent->child_count++] = child;
}

void chasm_view_remove_child(chasm_view_t* parent, chasm_view_t* child) {
    if (!parent || !child) return;
    
    for (int i = 0; i < parent->child_count; i++) {
        if (parent->children[i] == child) {
            // Shift remaining children
            for (int j = i; j < parent->child_count - 1; j++) {
                parent->children[j] = parent->children[j + 1];
            }
            parent->child_count--;
            break;
        }
    }
}

// ============================================================================
// TEXT VIEWS IMPLEMENTATION
// ============================================================================

chasm_text_t* chasm_text_create(const char* content) {
    chasm_text_t* text = malloc(sizeof(chasm_text_t));
    if (!text) return NULL;
    
    // Initialize base view
    text->base.frame = chasm_rect_make(0, 0, 0, 0);
    text->base.background_color = chasm_color_clear();
    text->base.children = NULL;
    text->base.child_count = 0;
    text->base.child_capacity = 0;
    text->base.native_view = NULL;
    
    // Initialize text properties
    text->content = malloc(strlen(content) + 1);
    strcpy(text->content, content);
    text->text_color = chasm_color_black();
    text->font_size = 16.0f;
    text->font_name = malloc(strlen("System") + 1);
    strcpy(text->font_name, "System");
    
    return text;
}

void chasm_text_destroy(chasm_text_t* text) {
    if (!text) return;
    
    if (text->content) free(text->content);
    if (text->font_name) free(text->font_name);
    chasm_view_destroy(&text->base);
}

void chasm_text_set_content(chasm_text_t* text, const char* content) {
    if (!text || !content) return;
    
    if (text->content) free(text->content);
    text->content = malloc(strlen(content) + 1);
    strcpy(text->content, content);
}

void chasm_text_set_color(chasm_text_t* text, chasm_color_t color) {
    if (text) text->text_color = color;
}

void chasm_text_set_font_size(chasm_text_t* text, float size) {
    if (text) text->font_size = size;
}

void chasm_text_set_font_name(chasm_text_t* text, const char* font_name) {
    if (!text || !font_name) return;
    
    if (text->font_name) free(text->font_name);
    text->font_name = malloc(strlen(font_name) + 1);
    strcpy(text->font_name, font_name);
}

chasm_view_t* chasm_text_as_view(chasm_text_t* text) {
    return text ? &text->base : NULL;
}

// ============================================================================
// BUTTON IMPLEMENTATION
// ============================================================================

chasm_button_t* chasm_button_create(const char* title) {
    chasm_button_t* button = malloc(sizeof(chasm_button_t));
    if (!button) return NULL;
    
    // Initialize base view
    button->base.frame = chasm_rect_make(0, 0, 100, 30);
    button->base.background_color = chasm_color_gray();
    button->base.children = NULL;
    button->base.child_count = 0;
    button->base.child_capacity = 0;
    button->base.native_view = NULL;
    
    // Initialize button properties
    button->title = malloc(strlen(title) + 1);
    strcpy(button->title, title);
    button->callback = NULL;
    button->user_data = NULL;
    button->title_color = chasm_color_black();
    button->background_color = chasm_color_gray();
    
    return button;
}

void chasm_button_destroy(chasm_button_t* button) {
    if (!button) return;
    
    if (button->title) free(button->title);
    chasm_view_destroy(&button->base);
}

void chasm_button_set_title(chasm_button_t* button, const char* title) {
    if (!button || !title) return;
    
    if (button->title) free(button->title);
    button->title = malloc(strlen(title) + 1);
    strcpy(button->title, title);
}

void chasm_button_set_callback(chasm_button_t* button, chasm_button_callback_t callback, void* user_data) {
    if (!button) return;
    button->callback = callback;
    button->user_data = user_data;
}

void chasm_button_set_title_color(chasm_button_t* button, chasm_color_t color) {
    if (button) button->title_color = color;
}

void chasm_button_set_background_color(chasm_button_t* button, chasm_color_t color) {
    if (button) button->background_color = color;
}

chasm_view_t* chasm_button_as_view(chasm_button_t* button) {
    return button ? &button->base : NULL;
}

// ============================================================================
// LAYOUT CONTAINERS IMPLEMENTATION
// ============================================================================

chasm_vstack_t* chasm_vstack_create(float spacing) {
    chasm_vstack_t* vstack = malloc(sizeof(chasm_vstack_t));
    if (!vstack) return NULL;
    
    // Initialize base view
    vstack->base.frame = chasm_rect_make(0, 0, 0, 0);
    vstack->base.background_color = chasm_color_clear();
    vstack->base.children = NULL;
    vstack->base.child_count = 0;
    vstack->base.child_capacity = 0;
    vstack->base.native_view = NULL;
    
    vstack->spacing = spacing;
    vstack->alignment = 1; // center
    
    return vstack;
}

void chasm_vstack_destroy(chasm_vstack_t* vstack) {
    if (vstack) chasm_view_destroy(&vstack->base);
}

void chasm_vstack_set_spacing(chasm_vstack_t* vstack, float spacing) {
    if (vstack) vstack->spacing = spacing;
}

void chasm_vstack_set_alignment(chasm_vstack_t* vstack, int alignment) {
    if (vstack) vstack->alignment = alignment;
}

void chasm_vstack_add_child(chasm_vstack_t* vstack, chasm_view_t* child) {
    if (vstack) chasm_view_add_child(&vstack->base, child);
}

chasm_view_t* chasm_vstack_as_view(chasm_vstack_t* vstack) {
    return vstack ? &vstack->base : NULL;
}

chasm_hstack_t* chasm_hstack_create(float spacing) {
    chasm_hstack_t* hstack = malloc(sizeof(chasm_hstack_t));
    if (!hstack) return NULL;
    
    // Initialize base view
    hstack->base.frame = chasm_rect_make(0, 0, 0, 0);
    hstack->base.background_color = chasm_color_clear();
    hstack->base.children = NULL;
    hstack->base.child_count = 0;
    hstack->base.child_capacity = 0;
    hstack->base.native_view = NULL;
    
    hstack->spacing = spacing;
    hstack->alignment = 1; // center
    
    return hstack;
}

void chasm_hstack_destroy(chasm_hstack_t* hstack) {
    if (hstack) chasm_view_destroy(&hstack->base);
}

void chasm_hstack_set_spacing(chasm_hstack_t* hstack, float spacing) {
    if (hstack) hstack->spacing = spacing;
}

void chasm_hstack_set_alignment(chasm_hstack_t* hstack, int alignment) {
    if (hstack) hstack->alignment = alignment;
}

void chasm_hstack_add_child(chasm_hstack_t* hstack, chasm_view_t* child) {
    if (hstack) chasm_view_add_child(&hstack->base, child);
}

chasm_view_t* chasm_hstack_as_view(chasm_hstack_t* hstack) {
    return hstack ? &hstack->base : NULL;
}

// ============================================================================
// PLACEHOLDER IMPLEMENTATIONS (to be implemented per platform)
// ============================================================================

// These are basic implementations - platform-specific code should override these
__attribute__((weak)) chasm_window_t* chasm_window_create(const char* title, chasm_size_t size) {
    chasm_window_t* window = malloc(sizeof(chasm_window_t));
    if (!window) return NULL;
    
    window->title = malloc(strlen(title) + 1);
    strcpy(window->title, title);
    window->size = size;
    window->position = chasm_point_make(100, 100);
    window->content_view = NULL;
    window->native_window = NULL;
    window->is_visible = false;
    
    return window;
}

__attribute__((weak)) void chasm_window_destroy(chasm_window_t* window) {
    if (!window) return;
    
    if (window->title) free(window->title);
    if (window->content_view) chasm_view_destroy(window->content_view);
    free(window);
}

__attribute__((weak)) void chasm_window_set_title(chasm_window_t* window, const char* title) {
    if (!window || !title) return;
    
    if (window->title) free(window->title);
    window->title = malloc(strlen(title) + 1);
    strcpy(window->title, title);
}

__attribute__((weak)) void chasm_window_set_size(chasm_window_t* window, chasm_size_t size) {
    if (window) window->size = size;
}

__attribute__((weak)) void chasm_window_set_position(chasm_window_t* window, chasm_point_t position) {
    if (window) window->position = position;
}

__attribute__((weak)) void chasm_window_set_content_view(chasm_window_t* window, chasm_view_t* view) {
    if (window) window->content_view = view;
}

__attribute__((weak)) void chasm_window_show(chasm_window_t* window) {
    if (window) {
        window->is_visible = true;
        printf("Window '%s' shown\n", window->title);
    }
}

__attribute__((weak)) void chasm_window_hide(chasm_window_t* window) {
    if (window) {
        window->is_visible = false;
        printf("Window '%s' hidden\n", window->title);
    }
}

__attribute__((weak)) chasm_size_t chasm_window_get_size(chasm_window_t* window) {
    return window ? window->size : chasm_size_make(0, 0);
}

__attribute__((weak)) int chasm_app_run(chasm_app_t* app) {
    if (!app) return -1;
    
    printf("Starting app: %s\n", app->name);
    
    if (app->launch_handler) {
        app->launch_handler(app);
    }
    
    app->is_running = true;
    
    // Basic terminal-based event loop
    printf("Press Enter to quit...\n");
    getchar();
    
    if (app->terminate_handler) {
        app->terminate_handler(app);
    }
    
    return 0;
}

__attribute__((weak)) void chasm_platform_init(void) {
    // Platform-specific initialization
}

__attribute__((weak)) void chasm_platform_cleanup(void) {
    // Platform-specific cleanup
}