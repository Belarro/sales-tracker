#include "../core-framework/chasm.h"

#ifdef __APPLE__
#include "../cocoa-gui/chasm_cocoa.h"
#else
#include "../terminal-cli/chasm_terminal.h"
#endif

// ============================================================================
// CROSS-PLATFORM CHASM APPLICATION
// Automatically selects GUI on macOS, terminal on other platforms
// ============================================================================

typedef struct {
    chasm_text_t* title_text;
    chasm_text_t* counter_text;
    chasm_button_t* increment_button;
    chasm_button_t* decrement_button;
    chasm_button_t* quit_button;
    int counter_value;
} cross_platform_data_t;

// Button callbacks
void increment_counter(void* user_data) {
    cross_platform_data_t* data = (cross_platform_data_t*)user_data;
    data->counter_value++;
    
    char buffer[64];
    snprintf(buffer, sizeof(buffer), "Counter: %d", data->counter_value);
    chasm_text_set_content(data->counter_text, buffer);
    
    printf("Counter incremented to: %d\n", data->counter_value);
}

void decrement_counter(void* user_data) {
    cross_platform_data_t* data = (cross_platform_data_t*)user_data;
    data->counter_value--;
    
    char buffer[64];
    snprintf(buffer, sizeof(buffer), "Counter: %d", data->counter_value);
    chasm_text_set_content(data->counter_text, buffer);
    
    printf("Counter decremented to: %d\n", data->counter_value);
}

void quit_app(void* user_data) {
    printf("Quit button pressed - exiting application\n");
    exit(0);
}

// Cross-platform UI creation
void create_ui(cross_platform_data_t* data, chasm_app_t* app) {
    // Create main window
    chasm_window_t* window = chasm_window_create("Cross-Platform Chasm App", chasm_size_make(400, 300));
    app->main_window = window;
    
    // Create main container
    chasm_vstack_t* main_stack = chasm_vstack_create(20.0f);
    chasm_view_set_frame(chasm_vstack_as_view(main_stack), chasm_rect_make(10, 10, 380, 280));
    chasm_view_set_background_color(chasm_vstack_as_view(main_stack), chasm_color_rgb(0.95f, 0.95f, 0.95f));
    
    // Create title
    data->title_text = chasm_text_create("Cross-Platform Chasm Framework");
    chasm_text_set_color(data->title_text, chasm_color_blue());
    chasm_text_set_font_size(data->title_text, 20.0f);
    chasm_view_set_frame(chasm_text_as_view(data->title_text), chasm_rect_make(0, 0, 360, 30));
    
    // Create platform info text
    chasm_text_t* platform_text;
#ifdef __APPLE__
    platform_text = chasm_text_create("Platform: macOS (Cocoa GUI)");
    chasm_text_set_color(platform_text, chasm_color_green());
#else
    platform_text = chasm_text_create("Platform: Terminal/CLI");
    chasm_text_set_color(platform_text, chasm_color_orange());
#endif
    chasm_text_set_font_size(platform_text, 14.0f);
    chasm_view_set_frame(chasm_text_as_view(platform_text), chasm_rect_make(0, 0, 360, 20));
    
    // Create counter display
    data->counter_text = chasm_text_create("Counter: 0");
    chasm_text_set_color(data->counter_text, chasm_color_black());
    chasm_text_set_font_size(data->counter_text, 16.0f);
    chasm_view_set_frame(chasm_text_as_view(data->counter_text), chasm_rect_make(0, 0, 200, 25));
    
    // Create buttons
    data->increment_button = chasm_button_create("+ Increment");
    chasm_button_set_callback(data->increment_button, increment_counter, data);
    chasm_button_set_title_color(data->increment_button, chasm_color_white());
    chasm_button_set_background_color(data->increment_button, chasm_color_green());
    chasm_view_set_frame(chasm_button_as_view(data->increment_button), chasm_rect_make(0, 0, 120, 35));
    
    data->decrement_button = chasm_button_create("- Decrement");
    chasm_button_set_callback(data->decrement_button, decrement_counter, data);
    chasm_button_set_title_color(data->decrement_button, chasm_color_white());
    chasm_button_set_background_color(data->decrement_button, chasm_color_red());
    chasm_view_set_frame(chasm_button_as_view(data->decrement_button), chasm_rect_make(0, 0, 120, 35));
    
    data->quit_button = chasm_button_create("Quit");
    chasm_button_set_callback(data->quit_button, quit_app, data);
    chasm_button_set_title_color(data->quit_button, chasm_color_black());
    chasm_button_set_background_color(data->quit_button, chasm_color_yellow());
    chasm_view_set_frame(chasm_button_as_view(data->quit_button), chasm_rect_make(0, 0, 100, 35));
    
    // Create button container
    chasm_hstack_t* button_stack = chasm_hstack_create(15.0f);
    chasm_view_set_frame(chasm_hstack_as_view(button_stack), chasm_rect_make(0, 0, 360, 35));
    
    chasm_hstack_add_child(button_stack, chasm_button_as_view(data->increment_button));
    chasm_hstack_add_child(button_stack, chasm_button_as_view(data->decrement_button));
    chasm_hstack_add_child(button_stack, chasm_button_as_view(data->quit_button));
    
    // Add all elements to main stack
    chasm_vstack_add_child(main_stack, chasm_text_as_view(data->title_text));
    chasm_vstack_add_child(main_stack, chasm_text_as_view(platform_text));
    chasm_vstack_add_child(main_stack, chasm_text_as_view(data->counter_text));
    chasm_vstack_add_child(main_stack, chasm_hstack_as_view(button_stack));
    
#ifdef __APPLE__
    // Create native Cocoa views
    NSView *mainView = chasm_cocoa_create_view(chasm_vstack_as_view(main_stack));
    NSTextField *titleField = chasm_cocoa_create_text_view(data->title_text);
    NSTextField *platformField = chasm_cocoa_create_text_view(platform_text);
    NSTextField *counterField = chasm_cocoa_create_text_view(data->counter_text);
    NSView *buttonStackView = chasm_cocoa_create_view(chasm_hstack_as_view(button_stack));
    NSButton *incButton = chasm_cocoa_create_button(data->increment_button);
    NSButton *decButton = chasm_cocoa_create_button(data->decrement_button);
    NSButton *quitButton = chasm_cocoa_create_button(data->quit_button);
    
    // Add subviews
    [mainView addSubview:titleField];
    [mainView addSubview:platformField];
    [mainView addSubview:counterField];
    [mainView addSubview:buttonStackView];
    [buttonStackView addSubview:incButton];
    [buttonStackView addSubview:decButton];
    [buttonStackView addSubview:quitButton];
    
    // Layout
    chasm_cocoa_layout_vstack(main_stack);
    chasm_cocoa_layout_hstack(button_stack);
#endif
    
    // Set window content
    chasm_window_set_content_view(window, chasm_vstack_as_view(main_stack));
    chasm_window_show(window);
}

// App launch handler
void app_launched(chasm_app_t* app) {
#ifdef __APPLE__
    printf("🚀 Cross-Platform Chasm App Launched (macOS Cocoa GUI)\n");
#else
    printf("🚀 Cross-Platform Chasm App Launched (Terminal UI)\n");
#endif
    
    cross_platform_data_t* data = (cross_platform_data_t*)chasm_app_get_user_data(app);
    data->counter_value = 0;
    
    create_ui(data, app);
    
    printf("✅ Cross-platform UI created and displayed\n");
}

// App terminate handler
void app_terminated(chasm_app_t* app) {
    printf("🛑 Cross-Platform Chasm App Terminated\n");
    
    cross_platform_data_t* data = (cross_platform_data_t*)chasm_app_get_user_data(app);
    if (data) {
        printf("Final counter value: %d\n", data->counter_value);
        printf("🧹 Cleaned up app data\n");
    }
}

int main(int argc, const char * argv[]) {
    printf("🚀 Starting Cross-Platform Chasm Demo\n");
    
#ifdef __APPLE__
    printf("Detected platform: macOS - Using Cocoa GUI\n");
#else
    printf("Detected platform: Other - Using Terminal UI\n");
#endif
    
    // Initialize platform
    chasm_platform_init();
    
    // Create app data
    cross_platform_data_t* data = malloc(sizeof(cross_platform_data_t));
    memset(data, 0, sizeof(cross_platform_data_t));
    
    // Create Chasm app
    chasm_app_t* app = chasm_app_create("Cross-Platform Chasm Demo");
    chasm_app_set_user_data(app, data);
    chasm_app_set_launch_handler(app, app_launched);
    chasm_app_set_terminate_handler(app, app_terminated);
    
    // Print usage instructions
    printf("\n📖 Usage Instructions:\n");
#ifdef __APPLE__
    printf("- Native macOS window will appear\n");
    printf("- Click buttons to interact\n");
    printf("- Close window to quit\n");
#else
    printf("- Terminal-based UI will appear\n");
    printf("- Use keyboard shortcuts to interact\n");
    printf("- Press 'q' or ESC to quit\n");
#endif
    printf("\n");
    
    // Run the app
    int result = chasm_app_run(app);
    
    // Cleanup
    free(data);
    chasm_app_destroy(app);
    chasm_platform_cleanup();
    
    printf("👋 Cross-Platform Chasm Demo finished with result: %d\n", result);
    return result;
}