#include "chasm_cocoa.h"

// ============================================================================
// SAMPLE COCOA GUI APPLICATION USING CHASM FRAMEWORK
// ============================================================================

typedef struct {
    chasm_text_t* title_text;
    chasm_text_t* counter_text;
    chasm_button_t* increment_button;
    chasm_button_t* decrement_button;
    chasm_button_t* reset_button;
    int counter_value;
} app_data_t;

// Button callback functions
void increment_clicked(void* user_data) {
    app_data_t* data = (app_data_t*)user_data;
    data->counter_value++;
    
    char buffer[64];
    snprintf(buffer, sizeof(buffer), "Counter: %d", data->counter_value);
    chasm_text_set_content(data->counter_text, buffer);
}

void decrement_clicked(void* user_data) {
    app_data_t* data = (app_data_t*)user_data;
    data->counter_value--;
    
    char buffer[64];
    snprintf(buffer, sizeof(buffer), "Counter: %d", data->counter_value);
    chasm_text_set_content(data->counter_text, buffer);
}

void reset_clicked(void* user_data) {
    app_data_t* data = (app_data_t*)user_data;
    data->counter_value = 0;
    
    chasm_text_set_content(data->counter_text, "Counter: 0");
}

// App launch handler
void app_launched(chasm_app_t* app) {
    printf("🚀 Chasm Cocoa GUI App Launched!\n");
    
    // Get user data
    app_data_t* data = (app_data_t*)chasm_app_get_user_data(app);
    
    // Create main window
    chasm_window_t* window = chasm_window_create("Chasm Cocoa Demo", chasm_size_make(400, 300));
    app->main_window = window;
    
    // Create main container (VStack)
    chasm_vstack_t* main_stack = chasm_vstack_create(20.0f);
    chasm_view_set_frame(chasm_vstack_as_view(main_stack), chasm_rect_make(0, 0, 400, 300));
    chasm_view_set_background_color(chasm_vstack_as_view(main_stack), chasm_color_rgb(0.95f, 0.95f, 0.95f));
    
    // Create title text
    data->title_text = chasm_text_create("Chasm Framework Demo");
    chasm_text_set_color(data->title_text, chasm_color_blue());
    chasm_text_set_font_size(data->title_text, 24.0f);
    chasm_text_set_font_name(data->title_text, "Helvetica-Bold");
    chasm_view_set_frame(chasm_text_as_view(data->title_text), chasm_rect_make(0, 0, 300, 30));
    
    // Create counter text
    data->counter_text = chasm_text_create("Counter: 0");
    chasm_text_set_color(data->counter_text, chasm_color_black());
    chasm_text_set_font_size(data->counter_text, 18.0f);
    chasm_view_set_frame(chasm_text_as_view(data->counter_text), chasm_rect_make(0, 0, 200, 25));
    
    // Create buttons
    data->increment_button = chasm_button_create("+ Increment");
    chasm_button_set_callback(data->increment_button, increment_clicked, data);
    chasm_button_set_title_color(data->increment_button, chasm_color_white());
    chasm_button_set_background_color(data->increment_button, chasm_color_green());
    chasm_view_set_frame(chasm_button_as_view(data->increment_button), chasm_rect_make(0, 0, 120, 35));
    
    data->decrement_button = chasm_button_create("- Decrement");
    chasm_button_set_callback(data->decrement_button, decrement_clicked, data);
    chasm_button_set_title_color(data->decrement_button, chasm_color_white());
    chasm_button_set_background_color(data->decrement_button, chasm_color_red());
    chasm_view_set_frame(chasm_button_as_view(data->decrement_button), chasm_rect_make(0, 0, 120, 35));
    
    data->reset_button = chasm_button_create("Reset");
    chasm_button_set_callback(data->reset_button, reset_clicked, data);
    chasm_button_set_title_color(data->reset_button, chasm_color_black());
    chasm_button_set_background_color(data->reset_button, chasm_color_yellow());
    chasm_view_set_frame(chasm_button_as_view(data->reset_button), chasm_rect_make(0, 0, 100, 35));
    
    // Create horizontal stack for buttons
    chasm_hstack_t* button_stack = chasm_hstack_create(15.0f);
    chasm_view_set_frame(chasm_hstack_as_view(button_stack), chasm_rect_make(0, 0, 380, 35));
    
    chasm_hstack_add_child(button_stack, chasm_button_as_view(data->increment_button));
    chasm_hstack_add_child(button_stack, chasm_button_as_view(data->decrement_button));
    chasm_hstack_add_child(button_stack, chasm_button_as_view(data->reset_button));
    
    // Add all elements to main stack
    chasm_vstack_add_child(main_stack, chasm_text_as_view(data->title_text));
    chasm_vstack_add_child(main_stack, chasm_text_as_view(data->counter_text));
    chasm_vstack_add_child(main_stack, chasm_hstack_as_view(button_stack));
    
    // Create native views
    NSView *mainView = chasm_cocoa_create_view(chasm_vstack_as_view(main_stack));
    NSTextField *titleField = chasm_cocoa_create_text_view(data->title_text);
    NSTextField *counterField = chasm_cocoa_create_text_view(data->counter_text);
    NSView *buttonStackView = chasm_cocoa_create_view(chasm_hstack_as_view(button_stack));
    NSButton *incButton = chasm_cocoa_create_button(data->increment_button);
    NSButton *decButton = chasm_cocoa_create_button(data->decrement_button);
    NSButton *resetButton = chasm_cocoa_create_button(data->reset_button);
    
    // Add subviews
    [mainView addSubview:titleField];
    [mainView addSubview:counterField];
    [mainView addSubview:buttonStackView];
    [buttonStackView addSubview:incButton];
    [buttonStackView addSubview:decButton];
    [buttonStackView addSubview:resetButton];
    
    // Layout the stacks
    chasm_cocoa_layout_vstack(main_stack);
    chasm_cocoa_layout_hstack(button_stack);
    
    // Set window content and show
    chasm_window_set_content_view(window, chasm_vstack_as_view(main_stack));
    chasm_window_show(window);
    
    printf("✅ Window created and displayed\n");
}

// App terminate handler
void app_terminated(chasm_app_t* app) {
    printf("🛑 Chasm Cocoa GUI App Terminated\n");
    
    app_data_t* data = (app_data_t*)chasm_app_get_user_data(app);
    if (data) {
        // Cleanup would go here
        printf("🧹 Cleaned up app data\n");
    }
}

int main(int argc, const char * argv[]) {
    printf("🚀 Starting Chasm Cocoa GUI Demo\n");
    
    // Initialize platform
    chasm_platform_init();
    
    // Create app data
    app_data_t* data = malloc(sizeof(app_data_t));
    data->counter_value = 0;
    data->title_text = NULL;
    data->counter_text = NULL;
    data->increment_button = NULL;
    data->decrement_button = NULL;
    data->reset_button = NULL;
    
    // Create Chasm app
    chasm_app_t* app = chasm_app_create("Chasm Cocoa Demo");
    chasm_app_set_user_data(app, data);
    chasm_app_set_launch_handler(app, app_launched);
    chasm_app_set_terminate_handler(app, app_terminated);
    
    // Run the app
    int result = chasm_app_run(app);
    
    // Cleanup
    free(data);
    chasm_app_destroy(app);
    chasm_platform_cleanup();
    
    printf("👋 Chasm Cocoa GUI Demo finished with result: %d\n", result);
    return result;
}