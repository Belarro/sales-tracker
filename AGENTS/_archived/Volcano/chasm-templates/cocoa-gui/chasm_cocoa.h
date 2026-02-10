#ifndef CHASM_COCOA_H
#define CHASM_COCOA_H

#include "../core-framework/chasm.h"

#ifdef __APPLE__
#import <Cocoa/Cocoa.h>
#import <Foundation/Foundation.h>

// ============================================================================
// CHASM COCOA GUI IMPLEMENTATION
// Native macOS Cocoa backend for Chasm framework
// ============================================================================

// Cocoa-specific app interface
@interface ChasmCocoaApp : NSObject <NSApplicationDelegate>
@property (strong) NSWindow *window;
@property (strong) NSView *contentView;
@property (assign) chasm_app_t *chasmApp;
@end

// Cocoa-specific window interface
@interface ChasmCocoaWindow : NSWindow
@property (assign) chasm_window_t *chasmWindow;
@end

// Cocoa-specific view interface
@interface ChasmCocoaView : NSView
@property (assign) chasm_view_t *chasmView;
@end

// Cocoa-specific text view interface
@interface ChasmCocoaTextView : NSTextField
@property (assign) chasm_text_t *chasmText;
@end

// Cocoa-specific button interface
@interface ChasmCocoaButton : NSButton
@property (assign) chasm_button_t *chasmButton;
- (void)buttonClicked:(id)sender;
@end

// ============================================================================
// COCOA-SPECIFIC API EXTENSIONS
// ============================================================================

// Initialize Cocoa backend
void chasm_cocoa_init(void);

// Create native Cocoa window
NSWindow* chasm_cocoa_create_window(chasm_window_t* window);

// Create native Cocoa view
NSView* chasm_cocoa_create_view(chasm_view_t* view);

// Create native Cocoa text view
NSTextField* chasm_cocoa_create_text_view(chasm_text_t* text);

// Create native Cocoa button
NSButton* chasm_cocoa_create_button(chasm_button_t* button);

// Layout management
void chasm_cocoa_layout_vstack(chasm_vstack_t* vstack);
void chasm_cocoa_layout_hstack(chasm_hstack_t* hstack);

// Event handling
void chasm_cocoa_setup_event_handling(void);

#endif // __APPLE__

#endif // CHASM_COCOA_H