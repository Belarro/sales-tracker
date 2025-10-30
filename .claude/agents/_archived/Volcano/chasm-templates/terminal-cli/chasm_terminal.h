#ifndef CHASM_TERMINAL_H
#define CHASM_TERMINAL_H

#include "../core-framework/chasm.h"
#include <termios.h>
#include <unistd.h>

// ============================================================================
// CHASM TERMINAL/CLI IMPLEMENTATION
// Terminal-based backend for Chasm framework with rich text UI
// ============================================================================

// Terminal-specific configuration
typedef struct {
    int width;
    int height;
    bool colors_enabled;
    bool unicode_enabled;
    struct termios original_termios;
} chasm_terminal_config_t;

// Terminal colors
typedef enum {
    CHASM_TERM_COLOR_BLACK = 0,
    CHASM_TERM_COLOR_RED = 1,
    CHASM_TERM_COLOR_GREEN = 2,
    CHASM_TERM_COLOR_YELLOW = 3,
    CHASM_TERM_COLOR_BLUE = 4,
    CHASM_TERM_COLOR_MAGENTA = 5,
    CHASM_TERM_COLOR_CYAN = 6,
    CHASM_TERM_COLOR_WHITE = 7,
    CHASM_TERM_COLOR_BRIGHT_BLACK = 8,
    CHASM_TERM_COLOR_BRIGHT_RED = 9,
    CHASM_TERM_COLOR_BRIGHT_GREEN = 10,
    CHASM_TERM_COLOR_BRIGHT_YELLOW = 11,
    CHASM_TERM_COLOR_BRIGHT_BLUE = 12,
    CHASM_TERM_COLOR_BRIGHT_MAGENTA = 13,
    CHASM_TERM_COLOR_BRIGHT_CYAN = 14,
    CHASM_TERM_COLOR_BRIGHT_WHITE = 15
} chasm_terminal_color_t;

// Terminal drawing characters
#define CHASM_TERM_CHAR_HLINE "─"
#define CHASM_TERM_CHAR_VLINE "│"
#define CHASM_TERM_CHAR_CORNER_TL "┌"
#define CHASM_TERM_CHAR_CORNER_TR "┐"
#define CHASM_TERM_CHAR_CORNER_BL "└"
#define CHASM_TERM_CHAR_CORNER_BR "┘"
#define CHASM_TERM_CHAR_CROSS "┼"
#define CHASM_TERM_CHAR_TEE_T "┬"
#define CHASM_TERM_CHAR_TEE_B "┴"
#define CHASM_TERM_CHAR_TEE_L "├"
#define CHASM_TERM_CHAR_TEE_R "┤"
#define CHASM_TERM_CHAR_BLOCK "█"
#define CHASM_TERM_CHAR_SHADE_LIGHT "░"
#define CHASM_TERM_CHAR_SHADE_MEDIUM "▒"
#define CHASM_TERM_CHAR_SHADE_DARK "▓"

// ANSI escape codes
#define CHASM_TERM_ESC "\033["
#define CHASM_TERM_CLEAR_SCREEN CHASM_TERM_ESC "2J"
#define CHASM_TERM_CURSOR_HOME CHASM_TERM_ESC "H"
#define CHASM_TERM_CURSOR_HIDE CHASM_TERM_ESC "?25l"
#define CHASM_TERM_CURSOR_SHOW CHASM_TERM_ESC "?25h"
#define CHASM_TERM_RESET CHASM_TERM_ESC "0m"

// Terminal-specific functions
void chasm_terminal_init(void);
void chasm_terminal_cleanup(void);
chasm_terminal_config_t* chasm_terminal_get_config(void);

// Screen management
void chasm_terminal_clear_screen(void);
void chasm_terminal_cursor_goto(int x, int y);
void chasm_terminal_cursor_hide(void);
void chasm_terminal_cursor_show(void);
void chasm_terminal_get_size(int* width, int* height);

// Color and styling
void chasm_terminal_set_fg_color(chasm_terminal_color_t color);
void chasm_terminal_set_bg_color(chasm_terminal_color_t color);
void chasm_terminal_reset_colors(void);
void chasm_terminal_set_bold(bool enabled);
void chasm_terminal_set_underline(bool enabled);
void chasm_terminal_set_reverse(bool enabled);

// Drawing functions
void chasm_terminal_draw_char(int x, int y, const char* ch);
void chasm_terminal_draw_string(int x, int y, const char* str);
void chasm_terminal_draw_box(int x, int y, int width, int height);
void chasm_terminal_draw_hline(int x, int y, int length);
void chasm_terminal_draw_vline(int x, int y, int length);
void chasm_terminal_fill_rect(int x, int y, int width, int height, const char* ch);

// Text formatting
void chasm_terminal_draw_text_centered(int x, int y, int width, const char* text);
void chasm_terminal_draw_text_wrapped(int x, int y, int width, int height, const char* text);

// Progress and indicators
void chasm_terminal_draw_progress_bar(int x, int y, int width, float progress);
void chasm_terminal_draw_spinner(int x, int y, int frame);

// Input handling
typedef enum {
    CHASM_TERM_KEY_UNKNOWN = 0,
    CHASM_TERM_KEY_ENTER = 13,
    CHASM_TERM_KEY_ESC = 27,
    CHASM_TERM_KEY_SPACE = 32,
    CHASM_TERM_KEY_UP = 256,
    CHASM_TERM_KEY_DOWN,
    CHASM_TERM_KEY_LEFT,
    CHASM_TERM_KEY_RIGHT,
    CHASM_TERM_KEY_F1,
    CHASM_TERM_KEY_F2,
    CHASM_TERM_KEY_F3,
    CHASM_TERM_KEY_F4,
    CHASM_TERM_KEY_F5,
    CHASM_TERM_KEY_F6,
    CHASM_TERM_KEY_F7,
    CHASM_TERM_KEY_F8,
    CHASM_TERM_KEY_F9,
    CHASM_TERM_KEY_F10,
    CHASM_TERM_KEY_F11,
    CHASM_TERM_KEY_F12
} chasm_terminal_key_t;

int chasm_terminal_get_key(void);
bool chasm_terminal_key_available(void);

// Convert Chasm colors to terminal colors
chasm_terminal_color_t chasm_color_to_terminal(chasm_color_t color);

// Terminal-specific view rendering
void chasm_terminal_render_view(chasm_view_t* view, int x, int y);
void chasm_terminal_render_text(chasm_text_t* text, int x, int y);
void chasm_terminal_render_button(chasm_button_t* button, int x, int y, bool focused);
void chasm_terminal_render_vstack(chasm_vstack_t* vstack, int x, int y);
void chasm_terminal_render_hstack(chasm_hstack_t* hstack, int x, int y);

// Terminal event loop
typedef struct {
    chasm_view_t** focusable_views;
    int focusable_count;
    int current_focus;
    bool should_exit;
} chasm_terminal_ui_state_t;

chasm_terminal_ui_state_t* chasm_terminal_ui_create(void);
void chasm_terminal_ui_destroy(chasm_terminal_ui_state_t* ui);
void chasm_terminal_ui_add_focusable(chasm_terminal_ui_state_t* ui, chasm_view_t* view);
void chasm_terminal_ui_run(chasm_terminal_ui_state_t* ui, chasm_view_t* root_view);

#endif // CHASM_TERMINAL_H