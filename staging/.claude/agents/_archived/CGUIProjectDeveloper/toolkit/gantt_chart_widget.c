/*
 * Custom Gantt Chart Widget Implementation
 * A complete GTK widget for displaying project timelines and task dependencies
 */

#include <gtk/gtk.h>
#include <cairo.h>
#include <math.h>
#include <time.h>

/* Gantt Chart Widget Structure */
typedef struct _GanttChart {
    GtkDrawingArea parent;
    
    /* Data */
    GList *tasks;
    GList *projects;
    
    /* Display properties */
    GDateTime *start_date;
    GDateTime *end_date;
    gint days_visible;
    gdouble pixels_per_day;
    gint row_height;
    gint header_height;
    gint sidebar_width;
    
    /* Interaction */
    gboolean dragging;
    gint drag_task_id;
    gint drag_start_x;
    gint drag_start_y;
    
    /* Scrolling */
    GtkAdjustment *hadjustment;
    GtkAdjustment *vadjustment;
    
    /* Colors */
    GdkRGBA grid_color;
    GdkRGBA header_color;
    GdkRGBA task_color;
    GdkRGBA milestone_color;
    GdkRGBA dependency_color;
    GdkRGBA selection_color;
    
} GanttChart;

typedef struct _GanttChartClass {
    GtkDrawingAreaClass parent_class;
} GanttChartClass;

/* Task data structure for Gantt display */
typedef struct {
    gint id;
    gchar *title;
    GDateTime *start_date;
    GDateTime *end_date;
    gdouble progress;
    gint level;  /* Hierarchy level for indentation */
    gboolean is_milestone;
    gint project_id;
    GdkRGBA color;
    GList *dependencies;  /* List of task IDs this depends on */
} GanttTask;

G_DEFINE_TYPE(GanttChart, gantt_chart, GTK_TYPE_DRAWING_AREA)

/* Forward declarations */
static void gantt_chart_draw_func(GtkDrawingArea *drawing_area, 
                                 cairo_t *cr, 
                                 int width, 
                                 int height, 
                                 gpointer user_data);
static void gantt_chart_finalize(GObject *object);
static void gantt_chart_size_allocate(GtkWidget *widget, 
                                     int width, 
                                     int height, 
                                     int baseline);

/* Utility functions */
static gint datetime_to_x_position(GanttChart *chart, GDateTime *date);
static GDateTime* x_position_to_datetime(GanttChart *chart, gint x);
static gint task_to_y_position(GanttChart *chart, gint task_index);
static gint y_position_to_task_index(GanttChart *chart, gint y);

/* Drawing functions */
static void draw_grid(cairo_t *cr, GanttChart *chart, gint width, gint height);
static void draw_header(cairo_t *cr, GanttChart *chart, gint width);
static void draw_sidebar(cairo_t *cr, GanttChart *chart, gint height);
static void draw_tasks(cairo_t *cr, GanttChart *chart, gint width, gint height);
static void draw_dependencies(cairo_t *cr, GanttChart *chart);
static void draw_task_bar(cairo_t *cr, GanttChart *chart, GanttTask *task, gint y);
static void draw_milestone(cairo_t *cr, GanttChart *chart, GanttTask *task, gint y);

/* Mouse event handlers */
static void on_click_pressed(GtkGestureClick *gesture,
                           gint n_press,
                           gdouble x,
                           gdouble y,
                           gpointer user_data);
static void on_drag_begin(GtkGestureDrag *gesture,
                         gdouble start_x,
                         gdouble start_y,
                         gpointer user_data);
static void on_drag_update(GtkGestureDrag *gesture,
                          gdouble offset_x,
                          gdouble offset_y,
                          gpointer user_data);
static void on_drag_end(GtkGestureDrag *gesture,
                       gdouble offset_x,
                       gdouble offset_y,
                       gpointer user_data);

/* Class initialization */
static void gantt_chart_class_init(GanttChartClass *klass) {
    GObjectClass *object_class = G_OBJECT_CLASS(klass);
    GtkWidgetClass *widget_class = GTK_WIDGET_CLASS(klass);
    
    object_class->finalize = gantt_chart_finalize;
    widget_class->size_allocate = gantt_chart_size_allocate;
}

static void gantt_chart_init(GanttChart *chart) {
    /* Initialize default values */
    chart->tasks = NULL;
    chart->projects = NULL;
    chart->days_visible = 30;
    chart->pixels_per_day = 20.0;
    chart->row_height = 24;
    chart->header_height = 40;
    chart->sidebar_width = 200;
    chart->dragging = FALSE;
    chart->drag_task_id = -1;
    
    /* Initialize colors */
    gdk_rgba_parse(&chart->grid_color, "#E0E0E0");
    gdk_rgba_parse(&chart->header_color, "#F5F5F5");
    gdk_rgba_parse(&chart->task_color, "#4A90E2");
    gdk_rgba_parse(&chart->milestone_color, "#E94B3C");
    gdk_rgba_parse(&chart->dependency_color, "#333333");
    gdk_rgba_parse(&chart->selection_color, "#FFD700");
    
    /* Set up drawing function */
    gtk_drawing_area_set_draw_func(GTK_DRAWING_AREA(chart), 
                                  gantt_chart_draw_func, 
                                  chart, 
                                  NULL);
    
    /* Set up mouse event handling */
    GtkGesture *click_gesture = gtk_gesture_click_new();
    g_signal_connect(click_gesture, "pressed", G_CALLBACK(on_click_pressed), chart);
    gtk_widget_add_controller(GTK_WIDGET(chart), GTK_EVENT_CONTROLLER(click_gesture));
    
    GtkGesture *drag_gesture = gtk_gesture_drag_new();
    g_signal_connect(drag_gesture, "drag-begin", G_CALLBACK(on_drag_begin), chart);
    g_signal_connect(drag_gesture, "drag-update", G_CALLBACK(on_drag_update), chart);
    g_signal_connect(drag_gesture, "drag-end", G_CALLBACK(on_drag_end), chart);
    gtk_widget_add_controller(GTK_WIDGET(chart), GTK_EVENT_CONTROLLER(drag_gesture));
    
    /* Set default date range */
    chart->start_date = g_date_time_new_now_local();
    chart->end_date = g_date_time_add_days(chart->start_date, chart->days_visible);
}

/* Public API */
GtkWidget* gantt_chart_new(void) {
    return g_object_new(gantt_chart_get_type(), NULL);
}

void gantt_chart_add_task(GanttChart *chart, GanttTask *task) {
    g_return_if_fail(chart != NULL);
    g_return_if_fail(task != NULL);
    
    chart->tasks = g_list_append(chart->tasks, task);
    gtk_widget_queue_draw(GTK_WIDGET(chart));
}

void gantt_chart_remove_task(GanttChart *chart, gint task_id) {
    g_return_if_fail(chart != NULL);
    
    GList *link = chart->tasks;
    while (link) {
        GanttTask *task = (GanttTask*)link->data;
        if (task->id == task_id) {
            chart->tasks = g_list_delete_link(chart->tasks, link);
            /* Free task data here if needed */
            gtk_widget_queue_draw(GTK_WIDGET(chart));
            break;
        }
        link = link->next;
    }
}

void gantt_chart_set_date_range(GanttChart *chart, 
                               GDateTime *start_date, 
                               GDateTime *end_date) {
    g_return_if_fail(chart != NULL);
    g_return_if_fail(start_date != NULL);
    g_return_if_fail(end_date != NULL);
    
    if (chart->start_date) {
        g_date_time_unref(chart->start_date);
    }
    if (chart->end_date) {
        g_date_time_unref(chart->end_date);
    }
    
    chart->start_date = g_date_time_ref(start_date);
    chart->end_date = g_date_time_ref(end_date);
    
    /* Calculate days visible */
    GTimeSpan span = g_date_time_difference(end_date, start_date);
    chart->days_visible = span / G_TIME_SPAN_DAY;
    
    gtk_widget_queue_draw(GTK_WIDGET(chart));
}

/* Drawing implementation */
static void gantt_chart_draw_func(GtkDrawingArea *drawing_area,
                                 cairo_t *cr,
                                 int width,
                                 int height,
                                 gpointer user_data) {
    GanttChart *chart = GANTT_CHART(user_data);
    
    /* Clear background */
    cairo_set_source_rgb(cr, 1.0, 1.0, 1.0);
    cairo_paint(cr);
    
    /* Draw components */
    draw_grid(cr, chart, width, height);
    draw_header(cr, chart, width);
    draw_sidebar(cr, chart, height);
    draw_tasks(cr, chart, width, height);
    draw_dependencies(cr, chart);
}

static void draw_grid(cairo_t *cr, GanttChart *chart, gint width, gint height) {
    cairo_set_source_rgba(cr, chart->grid_color.red, chart->grid_color.green, 
                          chart->grid_color.blue, chart->grid_color.alpha);
    cairo_set_line_width(cr, 1.0);
    
    /* Vertical grid lines (days) */
    for (gint day = 0; day <= chart->days_visible; day++) {
        gint x = chart->sidebar_width + (day * chart->pixels_per_day);
        if (x >= chart->sidebar_width && x < width) {
            cairo_move_to(cr, x + 0.5, chart->header_height);
            cairo_line_to(cr, x + 0.5, height);
            cairo_stroke(cr);
        }
    }
    
    /* Horizontal grid lines (tasks) */
    gint task_count = g_list_length(chart->tasks);
    for (gint i = 0; i <= task_count; i++) {
        gint y = chart->header_height + (i * chart->row_height);
        if (y >= chart->header_height && y < height) {
            cairo_move_to(cr, chart->sidebar_width, y + 0.5);
            cairo_line_to(cr, width, y + 0.5);
            cairo_stroke(cr);
        }
    }
}

static void draw_header(cairo_t *cr, GanttChart *chart, gint width) {
    /* Header background */
    cairo_set_source_rgba(cr, chart->header_color.red, chart->header_color.green,
                          chart->header_color.blue, chart->header_color.alpha);
    cairo_rectangle(cr, 0, 0, width, chart->header_height);
    cairo_fill(cr);
    
    /* Date labels */
    cairo_set_source_rgb(cr, 0.0, 0.0, 0.0);
    cairo_select_font_face(cr, "Sans", CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_NORMAL);
    cairo_set_font_size(cr, 10);
    
    GDateTime *current_date = g_date_time_ref(chart->start_date);
    for (gint day = 0; day < chart->days_visible; day++) {
        gint x = chart->sidebar_width + (day * chart->pixels_per_day);
        
        if (x >= chart->sidebar_width && x < width - chart->pixels_per_day) {
            gchar *date_str = g_date_time_format(current_date, "%m/%d");
            
            cairo_text_extents_t extents;
            cairo_text_extents(cr, date_str, &extents);
            
            cairo_move_to(cr, x + (chart->pixels_per_day - extents.width) / 2, 
                         chart->header_height / 2 + extents.height / 2);
            cairo_show_text(cr, date_str);
            
            g_free(date_str);
        }
        
        GDateTime *next_date = g_date_time_add_days(current_date, 1);
        g_date_time_unref(current_date);
        current_date = next_date;
    }
    g_date_time_unref(current_date);
}

static void draw_sidebar(cairo_t *cr, GanttChart *chart, gint height) {
    /* Sidebar background */
    cairo_set_source_rgba(cr, chart->header_color.red, chart->header_color.green,
                          chart->header_color.blue, chart->header_color.alpha);
    cairo_rectangle(cr, 0, 0, chart->sidebar_width, height);
    cairo_fill(cr);
    
    /* Task names */
    cairo_set_source_rgb(cr, 0.0, 0.0, 0.0);
    cairo_select_font_face(cr, "Sans", CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_NORMAL);
    cairo_set_font_size(cr, 11);
    
    GList *link = chart->tasks;
    gint task_index = 0;
    
    while (link) {
        GanttTask *task = (GanttTask*)link->data;
        gint y = chart->header_height + (task_index * chart->row_height);
        
        /* Indentation for hierarchy */
        gint indent = task->level * 15;
        
        cairo_move_to(cr, 10 + indent, y + chart->row_height / 2 + 4);
        cairo_show_text(cr, task->title);
        
        link = link->next;
        task_index++;
    }
}

static void draw_tasks(cairo_t *cr, GanttChart *chart, gint width, gint height) {
    GList *link = chart->tasks;
    gint task_index = 0;
    
    while (link) {
        GanttTask *task = (GanttTask*)link->data;
        gint y = chart->header_height + (task_index * chart->row_height);
        
        if (task->is_milestone) {
            draw_milestone(cr, chart, task, y);
        } else {
            draw_task_bar(cr, chart, task, y);
        }
        
        link = link->next;
        task_index++;
    }
}

static void draw_task_bar(cairo_t *cr, GanttChart *chart, GanttTask *task, gint y) {
    gint start_x = datetime_to_x_position(chart, task->start_date);
    gint end_x = datetime_to_x_position(chart, task->end_date);
    gint bar_y = y + 4;
    gint bar_height = chart->row_height - 8;
    
    if (end_x <= chart->sidebar_width || start_x >= chart->sidebar_width + (chart->days_visible * chart->pixels_per_day)) {
        return; /* Task not visible */
    }
    
    /* Task bar background */
    cairo_set_source_rgba(cr, task->color.red, task->color.green, 
                          task->color.blue, 0.3);
    cairo_rectangle(cr, start_x, bar_y, end_x - start_x, bar_height);
    cairo_fill(cr);
    
    /* Progress bar */
    if (task->progress > 0.0) {
        cairo_set_source_rgba(cr, task->color.red, task->color.green, 
                              task->color.blue, task->color.alpha);
        gint progress_width = (end_x - start_x) * task->progress;
        cairo_rectangle(cr, start_x, bar_y, progress_width, bar_height);
        cairo_fill(cr);
    }
    
    /* Task bar border */
    cairo_set_source_rgba(cr, task->color.red * 0.8, task->color.green * 0.8, 
                          task->color.blue * 0.8, task->color.alpha);
    cairo_set_line_width(cr, 1.0);
    cairo_rectangle(cr, start_x + 0.5, bar_y + 0.5, end_x - start_x - 1, bar_height - 1);
    cairo_stroke(cr);
}

static void draw_milestone(cairo_t *cr, GanttChart *chart, GanttTask *task, gint y) {
    gint x = datetime_to_x_position(chart, task->start_date);
    gint center_y = y + chart->row_height / 2;
    gint size = 8;
    
    /* Diamond shape for milestone */
    cairo_move_to(cr, x, center_y - size);
    cairo_line_to(cr, x + size, center_y);
    cairo_line_to(cr, x, center_y + size);
    cairo_line_to(cr, x - size, center_y);
    cairo_close_path(cr);
    
    cairo_set_source_rgba(cr, chart->milestone_color.red, chart->milestone_color.green,
                          chart->milestone_color.blue, chart->milestone_color.alpha);
    cairo_fill_preserve(cr);
    
    cairo_set_source_rgb(cr, 0.0, 0.0, 0.0);
    cairo_set_line_width(cr, 1.0);
    cairo_stroke(cr);
}

static void draw_dependencies(cairo_t *cr, GanttChart *chart) {
    /* TODO: Implement dependency line drawing */
    /* This would draw arrows between dependent tasks */
}

/* Utility functions */
static gint datetime_to_x_position(GanttChart *chart, GDateTime *date) {
    GTimeSpan diff = g_date_time_difference(date, chart->start_date);
    gdouble days = diff / (gdouble)G_TIME_SPAN_DAY;
    return chart->sidebar_width + (gint)(days * chart->pixels_per_day);
}

static GDateTime* x_position_to_datetime(GanttChart *chart, gint x) {
    gdouble days = (x - chart->sidebar_width) / chart->pixels_per_day;
    return g_date_time_add_days(chart->start_date, (gint)days);
}

static gint task_to_y_position(GanttChart *chart, gint task_index) {
    return chart->header_height + (task_index * chart->row_height);
}

static gint y_position_to_task_index(GanttChart *chart, gint y) {
    return (y - chart->header_height) / chart->row_height;
}

/* Mouse event handlers */
static void on_click_pressed(GtkGestureClick *gesture,
                           gint n_press,
                           gdouble x,
                           gdouble y,
                           gpointer user_data) {
    GanttChart *chart = GANTT_CHART(user_data);
    
    /* Handle task selection */
    if (x > chart->sidebar_width && y > chart->header_height) {
        gint task_index = y_position_to_task_index(chart, (gint)y);
        /* TODO: Implement task selection logic */
    }
}

static void on_drag_begin(GtkGestureDrag *gesture,
                         gdouble start_x,
                         gdouble start_y,
                         gpointer user_data) {
    GanttChart *chart = GANTT_CHART(user_data);
    
    if (start_x > chart->sidebar_width && start_y > chart->header_height) {
        chart->dragging = TRUE;
        chart->drag_start_x = (gint)start_x;
        chart->drag_start_y = (gint)start_y;
        
        /* Determine which task is being dragged */
        gint task_index = y_position_to_task_index(chart, (gint)start_y);
        /* TODO: Set drag_task_id based on task_index */
    }
}

static void on_drag_update(GtkGestureDrag *gesture,
                          gdouble offset_x,
                          gdouble offset_y,
                          gpointer user_data) {
    GanttChart *chart = GANTT_CHART(user_data);
    
    if (chart->dragging) {
        /* TODO: Update task position based on drag offset */
        gtk_widget_queue_draw(GTK_WIDGET(chart));
    }
}

static void on_drag_end(GtkGestureDrag *gesture,
                       gdouble offset_x,
                       gdouble offset_y,
                       gpointer user_data) {
    GanttChart *chart = GANTT_CHART(user_data);
    
    if (chart->dragging) {
        chart->dragging = FALSE;
        chart->drag_task_id = -1;
        
        /* TODO: Finalize task position change */
        /* Emit signal for task updated */
    }
}

/* Cleanup */
static void gantt_chart_finalize(GObject *object) {
    GanttChart *chart = GANTT_CHART(object);
    
    if (chart->start_date) {
        g_date_time_unref(chart->start_date);
    }
    if (chart->end_date) {
        g_date_time_unref(chart->end_date);
    }
    
    /* Free task list */
    g_list_free_full(chart->tasks, g_free);
    g_list_free_full(chart->projects, g_free);
    
    G_OBJECT_CLASS(gantt_chart_parent_class)->finalize(object);
}

static void gantt_chart_size_allocate(GtkWidget *widget,
                                     int width,
                                     int height,
                                     int baseline) {
    /* Update scrollbar ranges based on content size */
    GTK_WIDGET_CLASS(gantt_chart_parent_class)->size_allocate(widget, width, height, baseline);
}