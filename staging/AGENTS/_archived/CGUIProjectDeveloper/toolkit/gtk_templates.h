/*
 * GTK Application Templates for Project Tracker Development
 * Provides reusable code templates and patterns for C/GTK applications
 */

#ifndef GTK_TEMPLATES_H
#define GTK_TEMPLATES_H

#include <gtk/gtk.h>
#include <sqlite3.h>

/* Application Structure Template */
typedef struct {
    GtkApplication *app;
    GtkWindow *main_window;
    GtkWidget *sidebar;
    GtkWidget *main_content;
    GtkWidget *status_bar;
    sqlite3 *database;
    gchar *project_file;
} ProjectTrackerApp;

/* Data Model Templates */
typedef enum {
    PROJECT_STATUS_PLANNING,
    PROJECT_STATUS_ACTIVE,
    PROJECT_STATUS_ON_HOLD,
    PROJECT_STATUS_COMPLETED,
    PROJECT_STATUS_CANCELLED
} ProjectStatus;

typedef enum {
    TASK_PRIORITY_LOW,
    TASK_PRIORITY_NORMAL,
    TASK_PRIORITY_HIGH,
    TASK_PRIORITY_CRITICAL
} TaskPriority;

typedef enum {
    TASK_STATUS_NOT_STARTED,
    TASK_STATUS_IN_PROGRESS,
    TASK_STATUS_BLOCKED,
    TASK_STATUS_COMPLETED,
    TASK_STATUS_CANCELLED
} TaskStatus;

typedef struct {
    gint id;
    gchar *name;
    gchar *description;
    GDateTime *start_date;
    GDateTime *end_date;
    ProjectStatus status;
    gdouble progress;
    GDateTime *created_at;
    GDateTime *modified_at;
} Project;

typedef struct {
    gint id;
    gint project_id;
    gchar *title;
    gchar *description;
    GDateTime *start_date;
    GDateTime *due_date;
    TaskPriority priority;
    TaskStatus status;
    gdouble progress;
    gint assigned_user_id;
    gint parent_task_id;
    gdouble estimated_hours;
    gdouble actual_hours;
    GDateTime *created_at;
    GDateTime *modified_at;
} Task;

typedef struct {
    gint id;
    gchar *name;
    gchar *email;
    gchar *role;
    GDateTime *created_at;
} User;

/* Application Lifecycle Functions */
ProjectTrackerApp* project_tracker_app_new(void);
void project_tracker_app_free(ProjectTrackerApp *app);
void project_tracker_app_activate(GtkApplication *app, gpointer user_data);
gboolean project_tracker_app_init_database(ProjectTrackerApp *app, const gchar *db_path);

/* Window Creation Templates */
GtkWidget* create_main_window(ProjectTrackerApp *app);
GtkWidget* create_sidebar(ProjectTrackerApp *app);
GtkWidget* create_main_content_area(ProjectTrackerApp *app);
GtkWidget* create_status_bar(ProjectTrackerApp *app);

/* Custom Widget Templates */
GtkWidget* create_gantt_chart_widget(void);
GtkWidget* create_task_list_widget(void);
GtkWidget* create_project_dashboard_widget(void);
GtkWidget* create_calendar_view_widget(void);

/* Dialog Templates */
GtkWidget* create_project_dialog(GtkWindow *parent, Project *project);
GtkWidget* create_task_dialog(GtkWindow *parent, Task *task);
GtkWidget* create_user_dialog(GtkWindow *parent, User *user);
GtkWidget* create_settings_dialog(GtkWindow *parent);

/* Database Operation Templates */
gboolean db_create_tables(sqlite3 *db);
gboolean db_insert_project(sqlite3 *db, const Project *project);
gboolean db_update_project(sqlite3 *db, const Project *project);
gboolean db_delete_project(sqlite3 *db, gint project_id);
GList* db_get_all_projects(sqlite3 *db);

gboolean db_insert_task(sqlite3 *db, const Task *task);
gboolean db_update_task(sqlite3 *db, const Task *task);
gboolean db_delete_task(sqlite3 *db, gint task_id);
GList* db_get_tasks_by_project(sqlite3 *db, gint project_id);

/* Utility Functions */
gchar* format_date_for_display(GDateTime *date);
gchar* format_duration(gdouble hours);
GdkRGBA get_priority_color(TaskPriority priority);
GdkRGBA get_status_color(TaskStatus status);
gdouble calculate_project_progress(sqlite3 *db, gint project_id);

/* Memory Management Helpers */
void project_free(Project *project);
void task_free(Task *task);
void user_free(User *user);
void free_project_list(GList *projects);
void free_task_list(GList *tasks);

/* Signal Handlers Template */
void on_new_project_clicked(GtkButton *button, gpointer user_data);
void on_edit_project_clicked(GtkButton *button, gpointer user_data);
void on_delete_project_clicked(GtkButton *button, gpointer user_data);
void on_new_task_clicked(GtkButton *button, gpointer user_data);
void on_task_selection_changed(GtkTreeSelection *selection, gpointer user_data);

/* File Operations */
gboolean save_project_file(ProjectTrackerApp *app, const gchar *filename);
gboolean load_project_file(ProjectTrackerApp *app, const gchar *filename);
gboolean export_to_csv(ProjectTrackerApp *app, const gchar *filename);
gboolean import_from_csv(ProjectTrackerApp *app, const gchar *filename);

/* Error Handling */
void show_error_dialog(GtkWindow *parent, const gchar *message);
void show_info_dialog(GtkWindow *parent, const gchar *message);
gboolean show_confirmation_dialog(GtkWindow *parent, const gchar *message);

#endif /* GTK_TEMPLATES_H */