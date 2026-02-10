#include "chasm_cocoa.h"

#ifdef __APPLE__

static ChasmCocoaApp *g_cocoa_app = nil;

// ============================================================================
// COCOA APP IMPLEMENTATION
// ============================================================================

@implementation ChasmCocoaApp

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
    if (self.chasmApp && self.chasmApp->launch_handler) {
        self.chasmApp->launch_handler(self.chasmApp);
    }
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}

- (void)applicationWillTerminate:(NSNotification *)notification {
    if (self.chasmApp && self.chasmApp->terminate_handler) {
        self.chasmApp->terminate_handler(self.chasmApp);
    }
}

@end

// ============================================================================
// COCOA WINDOW IMPLEMENTATION
// ============================================================================

@implementation ChasmCocoaWindow

- (instancetype)initWithChasmWindow:(chasm_window_t*)chasmWindow {
    NSRect frame = NSMakeRect(chasmWindow->position.x, chasmWindow->position.y,
                             chasmWindow->size.width, chasmWindow->size.height);
    
    self = [super initWithContentRect:frame
                            styleMask:(NSWindowStyleMaskTitled | 
                                     NSWindowStyleMaskClosable | 
                                     NSWindowStyleMaskMiniaturizable | 
                                     NSWindowStyleMaskResizable)
                              backing:NSBackingStoreBuffered
                                defer:NO];
    
    if (self) {
        self.chasmWindow = chasmWindow;
        [self setTitle:@(chasmWindow->title)];
        chasmWindow->native_window = (__bridge void*)self;
    }
    
    return self;
}

@end

// ============================================================================
// COCOA VIEW IMPLEMENTATION
// ============================================================================

@implementation ChasmCocoaView

- (instancetype)initWithChasmView:(chasm_view_t*)chasmView {
    NSRect frame = NSMakeRect(chasmView->frame.x, chasmView->frame.y,
                             chasmView->frame.width, chasmView->frame.height);
    
    self = [super initWithFrame:frame];
    if (self) {
        self.chasmView = chasmView;
        chasmView->native_view = (__bridge void*)self;
        
        // Set background color
        self.wantsLayer = YES;
        self.layer.backgroundColor = CGColorCreateGenericRGB(
            chasmView->background_color.r,
            chasmView->background_color.g,
            chasmView->background_color.b,
            chasmView->background_color.a
        );
    }
    
    return self;
}

- (void)drawRect:(NSRect)dirtyRect {
    [super drawRect:dirtyRect];
    
    if (self.chasmView) {
        // Custom drawing can be added here
    }
}

@end

// ============================================================================
// COCOA TEXT VIEW IMPLEMENTATION
// ============================================================================

@implementation ChasmCocoaTextView

- (instancetype)initWithChasmText:(chasm_text_t*)chasmText {
    NSRect frame = NSMakeRect(chasmText->base.frame.x, chasmText->base.frame.y,
                             chasmText->base.frame.width, chasmText->base.frame.height);
    
    self = [super initWithFrame:frame];
    if (self) {
        self.chasmText = chasmText;
        chasmText->base.native_view = (__bridge void*)self;
        
        [self setStringValue:@(chasmText->content)];
        [self setEditable:NO];
        [self setSelectable:YES];
        [self setBezeled:NO];
        [self setDrawsBackground:NO];
        
        // Set text color and font
        NSColor *textColor = [NSColor colorWithRed:chasmText->text_color.r
                                             green:chasmText->text_color.g
                                              blue:chasmText->text_color.b
                                             alpha:chasmText->text_color.a];
        [self setTextColor:textColor];
        
        NSFont *font = [NSFont fontWithName:@(chasmText->font_name) size:chasmText->font_size];
        if (!font) {
            font = [NSFont systemFontOfSize:chasmText->font_size];
        }
        [self setFont:font];
    }
    
    return self;
}

@end

// ============================================================================
// COCOA BUTTON IMPLEMENTATION
// ============================================================================

@implementation ChasmCocoaButton

- (instancetype)initWithChasmButton:(chasm_button_t*)chasmButton {
    NSRect frame = NSMakeRect(chasmButton->base.frame.x, chasmButton->base.frame.y,
                             chasmButton->base.frame.width, chasmButton->base.frame.height);
    
    self = [super initWithFrame:frame];
    if (self) {
        self.chasmButton = chasmButton;
        chasmButton->base.native_view = (__bridge void*)self;
        
        [self setTitle:@(chasmButton->title)];
        [self setButtonType:NSButtonTypeMomentaryPushIn];
        [self setBezelStyle:NSBezelStyleRounded];
        [self setTarget:self];
        [self setAction:@selector(buttonClicked:)];
        
        // Set colors
        NSColor *titleColor = [NSColor colorWithRed:chasmButton->title_color.r
                                              green:chasmButton->title_color.g
                                               blue:chasmButton->title_color.b
                                              alpha:chasmButton->title_color.a];
        
        NSMutableAttributedString *attrTitle = [[NSMutableAttributedString alloc] 
                                               initWithString:@(chasmButton->title)];
        [attrTitle addAttribute:NSForegroundColorAttributeName
                          value:titleColor
                          range:NSMakeRange(0, [attrTitle length])];
        [self setAttributedTitle:attrTitle];
    }
    
    return self;
}

- (void)buttonClicked:(id)sender {
    if (self.chasmButton && self.chasmButton->callback) {
        self.chasmButton->callback(self.chasmButton->user_data);
    }
}

@end

// ============================================================================
// COCOA BACKEND IMPLEMENTATION
// ============================================================================

void chasm_cocoa_init(void) {
    if (!g_cocoa_app) {
        g_cocoa_app = [[ChasmCocoaApp alloc] init];
        [[NSApplication sharedApplication] setDelegate:g_cocoa_app];
    }
}

NSWindow* chasm_cocoa_create_window(chasm_window_t* window) {
    ChasmCocoaWindow *cocoaWindow = [[ChasmCocoaWindow alloc] initWithChasmWindow:window];
    return cocoaWindow;
}

NSView* chasm_cocoa_create_view(chasm_view_t* view) {
    ChasmCocoaView *cocoaView = [[ChasmCocoaView alloc] initWithChasmView:view];
    return cocoaView;
}

NSTextField* chasm_cocoa_create_text_view(chasm_text_t* text) {
    ChasmCocoaTextView *cocoaTextView = [[ChasmCocoaTextView alloc] initWithChasmText:text];
    return cocoaTextView;
}

NSButton* chasm_cocoa_create_button(chasm_button_t* button) {
    ChasmCocoaButton *cocoaButton = [[ChasmCocoaButton alloc] initWithChasmButton:button];
    return cocoaButton;
}

void chasm_cocoa_layout_vstack(chasm_vstack_t* vstack) {
    if (!vstack || vstack->base.child_count == 0) return;
    
    NSView *containerView = (__bridge NSView*)vstack->base.native_view;
    if (!containerView) return;
    
    float totalHeight = 0;
    float maxWidth = 0;
    
    // Calculate total height and max width
    for (int i = 0; i < vstack->base.child_count; i++) {
        chasm_view_t *child = vstack->base.children[i];
        totalHeight += child->frame.height;
        if (i > 0) totalHeight += vstack->spacing;
        if (child->frame.width > maxWidth) maxWidth = child->frame.width;
    }
    
    // Layout children vertically
    float currentY = containerView.frame.size.height - totalHeight;
    for (int i = 0; i < vstack->base.child_count; i++) {
        chasm_view_t *child = vstack->base.children[i];
        NSView *childView = (__bridge NSView*)child->native_view;
        
        if (childView) {
            float x = 0;
            switch (vstack->alignment) {
                case 0: x = 0; break; // leading
                case 1: x = (containerView.frame.size.width - child->frame.width) / 2; break; // center
                case 2: x = containerView.frame.size.width - child->frame.width; break; // trailing
            }
            
            NSRect frame = NSMakeRect(x, currentY, child->frame.width, child->frame.height);
            [childView setFrame:frame];
            currentY += child->frame.height + vstack->spacing;
        }
    }
}

void chasm_cocoa_layout_hstack(chasm_hstack_t* hstack) {
    if (!hstack || hstack->base.child_count == 0) return;
    
    NSView *containerView = (__bridge NSView*)hstack->base.native_view;
    if (!containerView) return;
    
    float totalWidth = 0;
    float maxHeight = 0;
    
    // Calculate total width and max height
    for (int i = 0; i < hstack->base.child_count; i++) {
        chasm_view_t *child = hstack->base.children[i];
        totalWidth += child->frame.width;
        if (i > 0) totalWidth += hstack->spacing;
        if (child->frame.height > maxHeight) maxHeight = child->frame.height;
    }
    
    // Layout children horizontally
    float currentX = 0;
    for (int i = 0; i < hstack->base.child_count; i++) {
        chasm_view_t *child = hstack->base.children[i];
        NSView *childView = (__bridge NSView*)child->native_view;
        
        if (childView) {
            float y = 0;
            switch (hstack->alignment) {
                case 0: y = containerView.frame.size.height - child->frame.height; break; // top
                case 1: y = (containerView.frame.size.height - child->frame.height) / 2; break; // center
                case 2: y = 0; break; // bottom
            }
            
            NSRect frame = NSMakeRect(currentX, y, child->frame.width, child->frame.height);
            [childView setFrame:frame];
            currentX += child->frame.width + hstack->spacing;
        }
    }
}

void chasm_cocoa_setup_event_handling(void) {
    // Event handling setup can be added here
}

// ============================================================================
// OVERRIDE WEAK IMPLEMENTATIONS WITH COCOA VERSIONS
// ============================================================================

chasm_window_t* chasm_window_create(const char* title, chasm_size_t size) {
    chasm_window_t* window = malloc(sizeof(chasm_window_t));
    if (!window) return NULL;
    
    window->title = malloc(strlen(title) + 1);
    strcpy(window->title, title);
    window->size = size;
    window->position = chasm_point_make(100, 100);
    window->content_view = NULL;
    window->is_visible = false;
    
    // Create native Cocoa window
    NSWindow *cocoaWindow = chasm_cocoa_create_window(window);
    window->native_window = (__bridge void*)cocoaWindow;
    
    return window;
}

void chasm_window_show(chasm_window_t* window) {
    if (window && window->native_window) {
        window->is_visible = true;
        NSWindow *cocoaWindow = (__bridge NSWindow*)window->native_window;
        [cocoaWindow makeKeyAndOrderFront:nil];
    }
}

void chasm_window_hide(chasm_window_t* window) {
    if (window && window->native_window) {
        window->is_visible = false;
        NSWindow *cocoaWindow = (__bridge NSWindow*)window->native_window;
        [cocoaWindow orderOut:nil];
    }
}

void chasm_window_set_content_view(chasm_window_t* window, chasm_view_t* view) {
    if (!window || !view) return;
    
    window->content_view = view;
    
    if (window->native_window && view->native_view) {
        NSWindow *cocoaWindow = (__bridge NSWindow*)window->native_window;
        NSView *cocoaView = (__bridge NSView*)view->native_view;
        [cocoaWindow setContentView:cocoaView];
    }
}

int chasm_app_run(chasm_app_t* app) {
    if (!app) return -1;
    
    chasm_cocoa_init();
    g_cocoa_app.chasmApp = app;
    
    app->is_running = true;
    
    NSApplication *nsApp = [NSApplication sharedApplication];
    [nsApp run];
    
    return 0;
}

void chasm_platform_init(void) {
    chasm_cocoa_init();
}

void chasm_platform_cleanup(void) {
    // Cleanup code
}

#endif // __APPLE__