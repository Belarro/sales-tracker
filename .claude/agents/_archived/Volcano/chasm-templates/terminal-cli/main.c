#include "chasm_terminal.h"

// ============================================================================
// SAMPLE TERMINAL/CLI APPLICATION USING CHASM FRAMEWORK
// ============================================================================

typedef struct {
    chasm_text_t* title_text;
    chasm_text_t* status_text;
    chasm_text_t* progress_text;
    chasm_button_t* start_button;
    chasm_button_t* stop_button;
    chasm_button_t* reset_button;
    bool is_running;
    int progress_value;
    int spinner_frame;
} app_data_t;

// Button callback functions
void start_clicked(void* user_data) {
    app_data_t* data = (app_data_t*)user_data;
    data->is_running = true;
    chasm_text_set_content(data->status_text, "Status: Running ⚡");
}

void stop_clicked(void* user_data) {
    app_data_t* data = (app_data_t*)user_data;
    data->is_running = false;
    chasm_text_set_content(data->status_text, "Status: Stopped ⏹️");
}

void reset_clicked(void* user_data) {
    app_data_t* data = (app_data_t*)user_data;
    data->is_running = false;
    data->progress_value = 0;
    data->spinner_frame = 0;
    chasm_text_set_content(data->status_text, "Status: Ready 🔄");
    chasm_text_set_content(data->progress_text, "Progress: 0%");
}

// Update function called from terminal loop
void update_app(app_data_t* data) {
    if (data->is_running) {
        data->spinner_frame++;
        data->progress_value = (data->progress_value + 1) % 101;
        
        char buffer[64];
        snprintf(buffer, sizeof(buffer), "Progress: %d%%", data->progress_value);
        chasm_text_set_content(data->progress_text, buffer);
        
        if (data->progress_value == 100) {
            data->is_running = false;
            chasm_text_set_content(data->status_text, "Status: Complete ✅");
        }
    }
}

// Custom terminal rendering function
void render_app_ui(app_data_t* data) {
    chasm_terminal_config_t* config = chasm_terminal_get_config();
    int width = config->width;
    int height = config->height;
    
    // Clear screen
    chasm_terminal_clear_screen();
    
    // Draw main border
    chasm_terminal_set_fg_color(CHASM_TERM_COLOR_CYAN);
    chasm_terminal_draw_box(1, 1, width - 2, height - 2);
    
    // Draw title
    chasm_terminal_set_fg_color(CHASM_TERM_COLOR_BRIGHT_BLUE);
    chasm_terminal_set_bold(true);
    chasm_terminal_draw_text_centered(2, 2, width - 4, "🚀 CHASM TERMINAL DEMO 🚀");
    chasm_terminal_reset_colors();
    
    // Draw separator
    chasm_terminal_set_fg_color(CHASM_TERM_COLOR_CYAN);
    chasm_terminal_draw_hline(2, 3, width - 4);
    
    // Draw status section
    chasm_terminal_set_fg_color(CHASM_TERM_COLOR_WHITE);
    chasm_terminal_draw_string(4, 5, data->status_text->content);
    
    // Draw progress section
    chasm_terminal_draw_string(4, 6, data->progress_text->content);
    
    // Draw progress bar
    float progress = data->progress_value / 100.0f;
    chasm_terminal_set_fg_color(CHASM_TERM_COLOR_GREEN);
    chasm_terminal_draw_progress_bar(4, 7, width - 10, progress);
    
    // Draw spinner if running
    if (data->is_running) {
        chasm_terminal_set_fg_color(CHASM_TERM_COLOR_YELLOW);
        chasm_terminal_draw_spinner(width - 6, 6, data->spinner_frame);
    }
    
    // Draw buttons section
    chasm_terminal_set_fg_color(CHASM_TERM_COLOR_WHITE);
    chasm_terminal_draw_string(4, 9, "Controls:");
    
    // Button backgrounds
    int button_y = 10;
    
    // Start button
    if (!data->is_running) {
        chasm_terminal_set_bg_color(CHASM_TERM_COLOR_GREEN);
        chasm_terminal_set_fg_color(CHASM_TERM_COLOR_BLACK);
    } else {
        chasm_terminal_set_bg_color(CHASM_TERM_COLOR_BLACK);
        chasm_terminal_set_fg_color(CHASM_TERM_COLOR_GREEN);
    }
    chasm_terminal_draw_string(4, button_y, " [S] Start ");
    chasm_terminal_reset_colors();
    
    // Stop button
    if (data->is_running) {
        chasm_terminal_set_bg_color(CHASM_TERM_COLOR_RED);
        chasm_terminal_set_fg_color(CHASM_TERM_COLOR_WHITE);
    } else {
        chasm_terminal_set_bg_color(CHASM_TERM_COLOR_BLACK);
        chasm_terminal_set_fg_color(CHASM_TERM_COLOR_RED);
    }
    chasm_terminal_draw_string(16, button_y, " [T] Stop ");
    chasm_terminal_reset_colors();
    
    // Reset button
    chasm_terminal_set_bg_color(CHASM_TERM_COLOR_YELLOW);
    chasm_terminal_set_fg_color(CHASM_TERM_COLOR_BLACK);
    chasm_terminal_draw_string(27, button_y, " [R] Reset ");
    chasm_terminal_reset_colors();
    
    // Draw help
    chasm_terminal_set_fg_color(CHASM_TERM_COLOR_BRIGHT_BLACK);
    chasm_terminal_draw_string(4, height - 4, "Keys: [S]tart, S[T]op, [R]eset, [Q]uit");
    chasm_terminal_draw_string(4, height - 3, "Use arrow keys to navigate, Enter to activate");
    
    // Draw system info
    chasm_terminal_set_fg_color(CHASM_TERM_COLOR_BRIGHT_BLACK);
    char info[128];
    snprintf(info, sizeof(info), "Terminal: %dx%d | Frame: %d", width, height, data->spinner_frame);
    chasm_terminal_draw_string(width - strlen(info) - 2, height - 2, info);
    
    chasm_terminal_reset_colors();
    fflush(stdout);
}

// Custom terminal event loop
void run_terminal_ui(app_data_t* data) {
    bool should_exit = false;
    
    while (!should_exit) {
        // Update app state
        update_app(data);
        
        // Render UI
        render_app_ui(data);
        
        // Handle input (non-blocking)
        if (chasm_terminal_key_available()) {
            int key = chasm_terminal_get_key();
            
            switch (key) {
                case 'q':
                case 'Q':
                case CHASM_TERM_KEY_ESC:
                    should_exit = true;
                    break;
                    
                case 's':
                case 'S':
                    start_clicked(data);
                    break;
                    
                case 't':
                case 'T':
                    stop_clicked(data);
                    break;
                    
                case 'r':
                case 'R':
                    reset_clicked(data);
                    break;
                    
                case CHASM_TERM_KEY_ENTER:
                case CHASM_TERM_KEY_SPACE:
                    if (!data->is_running) {
                        start_clicked(data);
                    } else {
                        stop_clicked(data);
                    }
                    break;
            }
        }
        
        // Small delay to control frame rate
        usleep(100000); // 100ms (10 FPS)
    }
}

// App launch handler
void app_launched(chasm_app_t* app) {
    printf("🚀 Chasm Terminal App Launched!\n");
    printf("Initializing terminal interface...\n");
    
    // Get user data
    app_data_t* data = (app_data_t*)chasm_app_get_user_data(app);
    
    // Initialize app state
    data->is_running = false;
    data->progress_value = 0;
    data->spinner_frame = 0;
    
    // Create text elements (for data storage, actual rendering is custom)
    data->title_text = chasm_text_create("Chasm Terminal Demo");
    data->status_text = chasm_text_create("Status: Ready 🔄");
    data->progress_text = chasm_text_create("Progress: 0%");
    
    // Create buttons (for data storage)
    data->start_button = chasm_button_create("Start");
    chasm_button_set_callback(data->start_button, start_clicked, data);
    
    data->stop_button = chasm_button_create("Stop");
    chasm_button_set_callback(data->stop_button, stop_clicked, data);
    
    data->reset_button = chasm_button_create("Reset");
    chasm_button_set_callback(data->reset_button, reset_clicked, data);
    
    printf("✅ Terminal interface initialized\n");
    printf("Press any key to start...\n");
    chasm_terminal_get_key();
    
    // Run custom terminal UI
    run_terminal_ui(data);
}

// App terminate handler
void app_terminated(chasm_app_t* app) {
    printf("🛑 Chasm Terminal App Terminated\n");
    
    app_data_t* data = (app_data_t*)chasm_app_get_user_data(app);
    if (data) {
        // Cleanup
        if (data->title_text) chasm_text_destroy(data->title_text);
        if (data->status_text) chasm_text_destroy(data->status_text);
        if (data->progress_text) chasm_text_destroy(data->progress_text);
        if (data->start_button) chasm_button_destroy(data->start_button);
        if (data->stop_button) chasm_button_destroy(data->stop_button);
        if (data->reset_button) chasm_button_destroy(data->reset_button);
        printf("🧹 Cleaned up app data\n");
    }
}

int main(int argc, const char * argv[]) {
    printf("🚀 Starting Chasm Terminal Demo\n");
    
    // Initialize platform
    chasm_platform_init();
    
    // Create app data
    app_data_t* data = malloc(sizeof(app_data_t));
    memset(data, 0, sizeof(app_data_t));
    
    // Create Chasm app
    chasm_app_t* app = chasm_app_create("Chasm Terminal Demo");
    chasm_app_set_user_data(app, data);
    chasm_app_set_launch_handler(app, app_launched);
    chasm_app_set_terminate_handler(app, app_terminated);
    
    // Run the app
    int result = chasm_app_run(app);
    
    // Cleanup
    free(data);
    chasm_app_destroy(app);
    chasm_platform_cleanup();
    
    printf("👋 Chasm Terminal Demo finished with result: %d\n", result);
    return result;
}