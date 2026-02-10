#include "chasm_terminal.h"
#include <sys/ioctl.h>
#include <fcntl.h>

static chasm_terminal_config_t g_terminal_config = {0};

// ============================================================================
// TERMINAL INITIALIZATION AND CLEANUP
// ============================================================================

void chasm_terminal_init(void) {
    // Save original terminal settings
    tcgetattr(STDIN_FILENO, &g_terminal_config.original_termios);
    
    // Set raw mode
    struct termios raw = g_terminal_config.original_termios;
    raw.c_lflag &= ~(ECHO | ICANON | ISIG | IEXTEN);
    raw.c_iflag &= ~(IXON | ICRNL | BRKINT | INPCK | ISTRIP);
    raw.c_cflag |= CS8;
    raw.c_oflag &= ~OPOST;
    raw.c_cc[VMIN] = 0;
    raw.c_cc[VTIME] = 1;
    tcsetattr(STDIN_FILENO, TCSAFLUSH, &raw);
    
    // Get terminal size
    chasm_terminal_get_size(&g_terminal_config.width, &g_terminal_config.height);
    
    // Enable colors and unicode
    g_terminal_config.colors_enabled = true;
    g_terminal_config.unicode_enabled = true;
    
    // Setup terminal
    chasm_terminal_cursor_hide();
    chasm_terminal_clear_screen();
}

void chasm_terminal_cleanup(void) {
    chasm_terminal_cursor_show();
    chasm_terminal_reset_colors();
    chasm_terminal_clear_screen();
    
    // Restore original terminal settings
    tcsetattr(STDIN_FILENO, TCSAFLUSH, &g_terminal_config.original_termios);
}

chasm_terminal_config_t* chasm_terminal_get_config(void) {
    return &g_terminal_config;
}

// ============================================================================
// SCREEN MANAGEMENT
// ============================================================================

void chasm_terminal_clear_screen(void) {
    printf(CHASM_TERM_CLEAR_SCREEN CHASM_TERM_CURSOR_HOME);
    fflush(stdout);
}

void chasm_terminal_cursor_goto(int x, int y) {
    printf(CHASM_TERM_ESC "%d;%dH", y + 1, x + 1);
    fflush(stdout);
}

void chasm_terminal_cursor_hide(void) {
    printf(CHASM_TERM_CURSOR_HIDE);
    fflush(stdout);
}

void chasm_terminal_cursor_show(void) {
    printf(CHASM_TERM_CURSOR_SHOW);
    fflush(stdout);
}

void chasm_terminal_get_size(int* width, int* height) {
    struct winsize ws;
    if (ioctl(STDOUT_FILENO, TIOCGWINSZ, &ws) == -1) {
        *width = 80;  // Default fallback
        *height = 24;
    } else {
        *width = ws.ws_col;
        *height = ws.ws_row;
    }
}

// ============================================================================
// COLOR AND STYLING
// ============================================================================

void chasm_terminal_set_fg_color(chasm_terminal_color_t color) {
    if (!g_terminal_config.colors_enabled) return;
    
    if (color < 8) {
        printf(CHASM_TERM_ESC "3%dm", color);
    } else {
        printf(CHASM_TERM_ESC "9%dm", color - 8);
    }
    fflush(stdout);
}

void chasm_terminal_set_bg_color(chasm_terminal_color_t color) {
    if (!g_terminal_config.colors_enabled) return;
    
    if (color < 8) {
        printf(CHASM_TERM_ESC "4%dm", color);
    } else {
        printf(CHASM_TERM_ESC "10%dm", color - 8);
    }
    fflush(stdout);
}

void chasm_terminal_reset_colors(void) {
    printf(CHASM_TERM_RESET);
    fflush(stdout);
}

void chasm_terminal_set_bold(bool enabled) {
    if (enabled) {
        printf(CHASM_TERM_ESC "1m");
    } else {
        printf(CHASM_TERM_ESC "22m");
    }
    fflush(stdout);
}

void chasm_terminal_set_underline(bool enabled) {
    if (enabled) {
        printf(CHASM_TERM_ESC "4m");
    } else {
        printf(CHASM_TERM_ESC "24m");
    }
    fflush(stdout);
}

void chasm_terminal_set_reverse(bool enabled) {
    if (enabled) {
        printf(CHASM_TERM_ESC "7m");
    } else {
        printf(CHASM_TERM_ESC "27m");
    }
    fflush(stdout);
}

// ============================================================================
// DRAWING FUNCTIONS
// ============================================================================

void chasm_terminal_draw_char(int x, int y, const char* ch) {
    chasm_terminal_cursor_goto(x, y);
    printf("%s", ch);
    fflush(stdout);
}

void chasm_terminal_draw_string(int x, int y, const char* str) {
    chasm_terminal_cursor_goto(x, y);
    printf("%s", str);
    fflush(stdout);
}

void chasm_terminal_draw_box(int x, int y, int width, int height) {
    if (width < 2 || height < 2) return;
    
    // Top line
    chasm_terminal_draw_char(x, y, CHASM_TERM_CHAR_CORNER_TL);
    for (int i = 1; i < width - 1; i++) {
        chasm_terminal_draw_char(x + i, y, CHASM_TERM_CHAR_HLINE);
    }
    chasm_terminal_draw_char(x + width - 1, y, CHASM_TERM_CHAR_CORNER_TR);
    
    // Middle lines
    for (int j = 1; j < height - 1; j++) {
        chasm_terminal_draw_char(x, y + j, CHASM_TERM_CHAR_VLINE);
        chasm_terminal_draw_char(x + width - 1, y + j, CHASM_TERM_CHAR_VLINE);
    }
    
    // Bottom line
    chasm_terminal_draw_char(x, y + height - 1, CHASM_TERM_CHAR_CORNER_BL);
    for (int i = 1; i < width - 1; i++) {
        chasm_terminal_draw_char(x + i, y + height - 1, CHASM_TERM_CHAR_HLINE);
    }
    chasm_terminal_draw_char(x + width - 1, y + height - 1, CHASM_TERM_CHAR_CORNER_BR);
}

void chasm_terminal_draw_hline(int x, int y, int length) {
    for (int i = 0; i < length; i++) {
        chasm_terminal_draw_char(x + i, y, CHASM_TERM_CHAR_HLINE);
    }
}

void chasm_terminal_draw_vline(int x, int y, int length) {
    for (int i = 0; i < length; i++) {
        chasm_terminal_draw_char(x, y + i, CHASM_TERM_CHAR_VLINE);
    }
}

void chasm_terminal_fill_rect(int x, int y, int width, int height, const char* ch) {
    for (int j = 0; j < height; j++) {
        for (int i = 0; i < width; i++) {
            chasm_terminal_draw_char(x + i, y + j, ch);
        }
    }
}

void chasm_terminal_draw_text_centered(int x, int y, int width, const char* text) {
    int text_len = strlen(text);
    if (text_len >= width) {
        chasm_terminal_draw_string(x, y, text);
    } else {
        int start_x = x + (width - text_len) / 2;
        chasm_terminal_draw_string(start_x, y, text);
    }
}

void chasm_terminal_draw_progress_bar(int x, int y, int width, float progress) {
    if (progress < 0.0f) progress = 0.0f;
    if (progress > 1.0f) progress = 1.0f;
    
    int filled = (int)(progress * width);
    
    chasm_terminal_cursor_goto(x, y);
    printf("[");
    for (int i = 0; i < width; i++) {
        if (i < filled) {
            printf(CHASM_TERM_CHAR_BLOCK);
        } else {
            printf(CHASM_TERM_CHAR_SHADE_LIGHT);
        }
    }
    printf("]");
    fflush(stdout);
}

void chasm_terminal_draw_spinner(int x, int y, int frame) {
    const char* spinner_chars[] = {"|", "/", "-", "\\"};
    int char_index = frame % 4;
    chasm_terminal_draw_char(x, y, spinner_chars[char_index]);
}

// ============================================================================
// INPUT HANDLING
// ============================================================================

int chasm_terminal_get_key(void) {
    int ch = getchar();
    
    if (ch == 27) { // ESC sequence
        int ch2 = getchar();
        if (ch2 == '[') {
            int ch3 = getchar();
            switch (ch3) {
                case 'A': return CHASM_TERM_KEY_UP;
                case 'B': return CHASM_TERM_KEY_DOWN;
                case 'C': return CHASM_TERM_KEY_RIGHT;
                case 'D': return CHASM_TERM_KEY_LEFT;
                default: return CHASM_TERM_KEY_UNKNOWN;
            }
        }
        return CHASM_TERM_KEY_ESC;
    }
    
    return ch;
}

bool chasm_terminal_key_available(void) {
    int flags = fcntl(STDIN_FILENO, F_GETFL, 0);
    fcntl(STDIN_FILENO, F_SETFL, flags | O_NONBLOCK);
    
    int ch = getchar();
    
    fcntl(STDIN_FILENO, F_SETFL, flags);
    
    if (ch != EOF) {
        ungetc(ch, stdin);
        return true;
    }
    return false;
}

// ============================================================================
// COLOR CONVERSION
// ============================================================================

chasm_terminal_color_t chasm_color_to_terminal(chasm_color_t color) {
    // Simple color mapping based on RGB values
    if (color.r > 0.8f && color.g < 0.3f && color.b < 0.3f) return CHASM_TERM_COLOR_RED;
    if (color.r < 0.3f && color.g > 0.8f && color.b < 0.3f) return CHASM_TERM_COLOR_GREEN;
    if (color.r < 0.3f && color.g < 0.3f && color.b > 0.8f) return CHASM_TERM_COLOR_BLUE;
    if (color.r > 0.8f && color.g > 0.8f && color.b < 0.3f) return CHASM_TERM_COLOR_YELLOW;
    if (color.r > 0.8f && color.g < 0.3f && color.b > 0.8f) return CHASM_TERM_COLOR_MAGENTA;
    if (color.r < 0.3f && color.g > 0.8f && color.b > 0.8f) return CHASM_TERM_COLOR_CYAN;
    if (color.r > 0.8f && color.g > 0.8f && color.b > 0.8f) return CHASM_TERM_COLOR_WHITE;
    if (color.r < 0.2f && color.g < 0.2f && color.b < 0.2f) return CHASM_TERM_COLOR_BLACK;
    return CHASM_TERM_COLOR_WHITE;
}

// ============================================================================
// TERMINAL VIEW RENDERING
// ============================================================================

void chasm_terminal_render_view(chasm_view_t* view, int x, int y) {
    if (!view) return;
    
    // Set background color if not transparent
    if (view->background_color.a > 0.0f) {
        chasm_terminal_color_t bg_color = chasm_color_to_terminal(view->background_color);
        chasm_terminal_set_bg_color(bg_color);
        chasm_terminal_fill_rect(x, y, (int)view->frame.width, (int)view->frame.height, " ");
        chasm_terminal_reset_colors();
    }
}

void chasm_terminal_render_text(chasm_text_t* text, int x, int y) {
    if (!text || !text->content) return;
    
    chasm_terminal_color_t fg_color = chasm_color_to_terminal(text->text_color);
    chasm_terminal_set_fg_color(fg_color);
    
    if (text->font_size > 18.0f) {
        chasm_terminal_set_bold(true);
    }
    
    chasm_terminal_draw_string(x, y, text->content);
    chasm_terminal_reset_colors();
}

void chasm_terminal_render_button(chasm_button_t* button, int x, int y, bool focused) {
    if (!button || !button->title) return;
    
    int width = (int)button->base.frame.width;
    int height = (int)button->base.frame.height;
    
    if (focused) {
        chasm_terminal_set_reverse(true);
    }
    
    chasm_terminal_color_t bg_color = chasm_color_to_terminal(button->background_color);
    chasm_terminal_color_t fg_color = chasm_color_to_terminal(button->title_color);
    
    chasm_terminal_set_bg_color(bg_color);
    chasm_terminal_set_fg_color(fg_color);
    
    // Draw button background
    chasm_terminal_fill_rect(x, y, width, height, " ");
    
    // Draw button text centered
    int title_len = strlen(button->title);
    int text_x = x + (width - title_len) / 2;
    int text_y = y + height / 2;
    
    chasm_terminal_draw_string(text_x, text_y, button->title);
    chasm_terminal_reset_colors();
}

// ============================================================================
// TERMINAL UI STATE MANAGEMENT
// ============================================================================

chasm_terminal_ui_state_t* chasm_terminal_ui_create(void) {
    chasm_terminal_ui_state_t* ui = malloc(sizeof(chasm_terminal_ui_state_t));
    if (!ui) return NULL;
    
    ui->focusable_views = NULL;
    ui->focusable_count = 0;
    ui->current_focus = 0;
    ui->should_exit = false;
    
    return ui;
}

void chasm_terminal_ui_destroy(chasm_terminal_ui_state_t* ui) {
    if (!ui) return;
    
    if (ui->focusable_views) {
        free(ui->focusable_views);
    }
    free(ui);
}

void chasm_terminal_ui_add_focusable(chasm_terminal_ui_state_t* ui, chasm_view_t* view) {
    if (!ui || !view) return;
    
    ui->focusable_views = realloc(ui->focusable_views, 
                                 (ui->focusable_count + 1) * sizeof(chasm_view_t*));
    ui->focusable_views[ui->focusable_count++] = view;
}

void chasm_terminal_ui_run(chasm_terminal_ui_state_t* ui, chasm_view_t* root_view) {
    if (!ui || !root_view) return;
    
    while (!ui->should_exit) {
        // Clear and render
        chasm_terminal_clear_screen();
        chasm_terminal_render_view(root_view, 0, 0);
        
        // Handle input
        if (chasm_terminal_key_available()) {
            int key = chasm_terminal_get_key();
            
            switch (key) {
                case 'q':
                case 'Q':
                case CHASM_TERM_KEY_ESC:
                    ui->should_exit = true;
                    break;
                    
                case CHASM_TERM_KEY_UP:
                    if (ui->focusable_count > 0) {
                        ui->current_focus = (ui->current_focus - 1 + ui->focusable_count) % ui->focusable_count;
                    }
                    break;
                    
                case CHASM_TERM_KEY_DOWN:
                    if (ui->focusable_count > 0) {
                        ui->current_focus = (ui->current_focus + 1) % ui->focusable_count;
                    }
                    break;
                    
                case CHASM_TERM_KEY_ENTER:
                case CHASM_TERM_KEY_SPACE:
                    // Activate focused element
                    if (ui->focusable_count > 0 && ui->current_focus < ui->focusable_count) {
                        // Handle button activation here
                    }
                    break;
            }
        }
        
        // Small delay to prevent excessive CPU usage
        usleep(50000); // 50ms
    }
}

// ============================================================================
// OVERRIDE WEAK IMPLEMENTATIONS WITH TERMINAL VERSIONS
// ============================================================================

int chasm_app_run(chasm_app_t* app) {
    if (!app) return -1;
    
    chasm_terminal_init();
    
    if (app->launch_handler) {
        app->launch_handler(app);
    }
    
    app->is_running = true;
    
    // Create terminal UI state
    chasm_terminal_ui_state_t* ui = chasm_terminal_ui_create();
    
    // Run terminal UI loop
    if (app->main_window && app->main_window->content_view) {
        chasm_terminal_ui_run(ui, app->main_window->content_view);
    } else {
        // Fallback: simple "Press any key to continue"
        printf("Chasm Terminal App: %s\n", app->name);
        printf("Press any key to continue...\n");
        chasm_terminal_get_key();
    }
    
    chasm_terminal_ui_destroy(ui);
    
    if (app->terminate_handler) {
        app->terminate_handler(app);
    }
    
    chasm_terminal_cleanup();
    return 0;
}

void chasm_platform_init(void) {
    chasm_terminal_init();
}

void chasm_platform_cleanup(void) {
    chasm_terminal_cleanup();
}