/*
 * Project Tracker Application Template
 * Complete template implementation for a GTK-based project tracker
 */

#include <gtk/gtk.h>
#include <sqlite3.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "gtk_templates.h"

/* Database Schema */
static const char *CREATE_TABLES_SQL = 
    "CREATE TABLE IF NOT EXISTS projects ("
    "    id INTEGER PRIMARY KEY AUTOINCREMENT,"
    "    name TEXT NOT NULL,"
    "    description TEXT,"
    "    start_date TEXT,"
    "    end_date TEXT,"
    "    status INTEGER DEFAULT 0,"
    "    progress REAL DEFAULT 0.0,"
    "    created_at TEXT DEFAULT CURRENT_TIMESTAMP,"
    "    modified_at TEXT DEFAULT CURRENT_TIMESTAMP"
    ");"
    
    "CREATE TABLE IF NOT EXISTS tasks ("
    "    id INTEGER PRIMARY KEY AUTOINCREMENT,"
    "    project_id INTEGER REFERENCES projects(id),"
    "    title TEXT NOT NULL,"
    "    description TEXT,"
    "    start_date TEXT,"
    "    due_date TEXT,"
    "    priority INTEGER DEFAULT 1,"
    "    status INTEGER DEFAULT 0,"
    "    progress REAL DEFAULT 0.0,"
    "    assigned_user_id INTEGER REFERENCES users(id),"
    "    parent_task_id INTEGER REFERENCES tasks(id),"
    "    estimated_hours REAL DEFAULT 0.0,"
    "    actual_hours REAL DEFAULT 0.0,"
    "    created_at TEXT DEFAULT CURRENT_TIMESTAMP,"
    "    modified_at TEXT DEFAULT CURRENT_TIMESTAMP"
    ");"
    
    "CREATE TABLE IF NOT EXISTS users ("
    "    id INTEGER PRIMARY KEY AUTOINCREMENT,"
    "    name TEXT NOT NULL,"
    "    email TEXT UNIQUE,"
    "    role TEXT,"
    "    created_at TEXT DEFAULT CURRENT_TIMESTAMP"
    ");"
    
    "CREATE TABLE IF NOT EXISTS task_dependencies ("
    "    id INTEGER PRIMARY KEY AUTOINCREMENT,"
    "    predecessor_id INTEGER REFERENCES tasks(id),"
    "    successor_id INTEGER REFERENCES tasks(id),"
    "    dependency_type INTEGER DEFAULT 0"
    ");";

/* Application Implementation */
ProjectTrackerApp* project_tracker_app_new(void) {
    ProjectTrackerApp *app = g_malloc0(sizeof(ProjectTrackerApp));
    return app;
}

void project_tracker_app_free(ProjectTrackerApp *app) {
    if (app) {
        if (app->database) {
            sqlite3_close(app->database);
        }
        g_free(app->project_file);
        g_free(app);
    }
}

static void activate(GtkApplication *app, gpointer user_data) {
    ProjectTrackerApp *tracker_app = (ProjectTrackerApp*)user_data;
    
    /* Create main window */
    tracker_app->main_window = GTK_WINDOW(create_main_window(tracker_app));
    gtk_application_add_window(app, tracker_app->main_window);
    
    /* Initialize database */
    if (!project_tracker_app_init_database(tracker_app, "project_tracker.db")) {
        show_error_dialog(tracker_app->main_window, "Failed to initialize database");
        return;
    }
    
    /* Show window */
    gtk_window_present(tracker_app->main_window);
}

gboolean project_tracker_app_init_database(ProjectTrackerApp *app, const gchar *db_path) {
    int rc = sqlite3_open(db_path, &app->database);
    if (rc != SQLITE_OK) {
        g_warning("Cannot open database: %s", sqlite3_errmsg(app->database));
        return FALSE;
    }
    
    return db_create_tables(app->database);
}

/* Window Creation */
GtkWidget* create_main_window(ProjectTrackerApp *app) {
    GtkWidget *window;
    GtkWidget *header_bar;
    GtkWidget *main_box;
    GtkWidget *paned;
    
    /* Create main window */
    window = gtk_application_window_new(GTK_APPLICATION(app->app));
    gtk_window_set_title(GTK_WINDOW(window), "Project Tracker");
    gtk_window_set_default_size(GTK_WINDOW(window), 1200, 800);
    
    /* Create header bar */
    header_bar = gtk_header_bar_new();
    gtk_header_bar_set_show_title_buttons(GTK_HEADER_BAR(header_bar), TRUE);
    gtk_header_bar_set_title_widget(GTK_HEADER_BAR(header_bar), 
                                   gtk_label_new("Project Tracker"));
    gtk_window_set_titlebar(GTK_WINDOW(window), header_bar);
    
    /* Add toolbar buttons */
    GtkWidget *new_project_btn = gtk_button_new_from_icon_name("document-new");
    gtk_widget_set_tooltip_text(new_project_btn, "New Project");
    g_signal_connect(new_project_btn, "clicked", 
                     G_CALLBACK(on_new_project_clicked), app);
    gtk_header_bar_pack_start(GTK_HEADER_BAR(header_bar), new_project_btn);
    
    /* Create main layout */
    main_box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 0);
    gtk_window_set_child(GTK_WINDOW(window), main_box);
    
    /* Create paned widget for sidebar and main content */
    paned = gtk_paned_new(GTK_ORIENTATION_HORIZONTAL);
    gtk_box_append(GTK_BOX(main_box), paned);
    
    /* Create sidebar */
    app->sidebar = create_sidebar(app);
    gtk_paned_set_start_child(GTK_PANED(paned), app->sidebar);
    gtk_paned_set_shrink_start_child(GTK_PANED(paned), FALSE);
    
    /* Create main content area */
    app->main_content = create_main_content_area(app);
    gtk_paned_set_end_child(GTK_PANED(paned), app->main_content);
    
    /* Create status bar */
    app->status_bar = create_status_bar(app);
    gtk_box_append(GTK_BOX(main_box), app->status_bar);
    
    return window;
}

GtkWidget* create_sidebar(ProjectTrackerApp *app) {
    GtkWidget *scrolled;
    GtkWidget *box;
    GtkWidget *projects_label;
    GtkWidget *projects_list;
    
    scrolled = gtk_scrolled_window_new();
    gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(scrolled),
                                  GTK_POLICY_NEVER, GTK_POLICY_AUTOMATIC);
    gtk_widget_set_size_request(scrolled, 250, -1);
    
    box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 6);
    gtk_widget_set_margin_start(box, 12);
    gtk_widget_set_margin_end(box, 12);
    gtk_widget_set_margin_top(box, 12);
    gtk_widget_set_margin_bottom(box, 12);
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled), box);
    
    /* Projects section */
    projects_label = gtk_label_new(NULL);
    gtk_label_set_markup(GTK_LABEL(projects_label), "<b>Projects</b>");
    gtk_widget_set_halign(projects_label, GTK_ALIGN_START);
    gtk_box_append(GTK_BOX(box), projects_label);
    
    /* Projects list */
    projects_list = gtk_list_box_new();
    gtk_widget_add_css_class(projects_list, "navigation-sidebar");
    gtk_box_append(GTK_BOX(box), projects_list);
    
    return scrolled;
}

GtkWidget* create_main_content_area(ProjectTrackerApp *app) {
    GtkWidget *notebook;
    GtkWidget *gantt_page;
    GtkWidget *tasks_page;
    GtkWidget *calendar_page;
    
    notebook = gtk_notebook_new();
    gtk_notebook_set_tab_pos(GTK_NOTEBOOK(notebook), GTK_POS_TOP);
    
    /* Gantt chart page */
    gantt_page = create_gantt_chart_widget();
    gtk_notebook_append_page(GTK_NOTEBOOK(notebook), gantt_page,
                            gtk_label_new("Timeline"));
    
    /* Tasks list page */
    tasks_page = create_task_list_widget();
    gtk_notebook_append_page(GTK_NOTEBOOK(notebook), tasks_page,
                            gtk_label_new("Tasks"));
    
    /* Calendar page */
    calendar_page = create_calendar_view_widget();
    gtk_notebook_append_page(GTK_NOTEBOOK(notebook), calendar_page,
                            gtk_label_new("Calendar"));
    
    return notebook;
}

GtkWidget* create_status_bar(ProjectTrackerApp *app) {
    GtkWidget *status_bar;
    
    status_bar = gtk_statusbar_new();
    gtk_statusbar_push(GTK_STATUSBAR(status_bar), 1, "Ready");
    
    return status_bar;
}

/* Custom Widgets */
GtkWidget* create_gantt_chart_widget(void) {
    GtkWidget *scrolled;
    GtkWidget *drawing_area;
    
    scrolled = gtk_scrolled_window_new();
    gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(scrolled),
                                  GTK_POLICY_AUTOMATIC, GTK_POLICY_AUTOMATIC);
    
    drawing_area = gtk_drawing_area_new();
    gtk_widget_set_size_request(drawing_area, 800, 600);
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled), drawing_area);
    
    /* Connect drawing function */
    /* gtk_drawing_area_set_draw_func(GTK_DRAWING_AREA(drawing_area), 
                                      gantt_draw_func, NULL, NULL); */
    
    return scrolled;
}

GtkWidget* create_task_list_widget(void) {
    GtkWidget *scrolled;
    GtkWidget *tree_view;
    GtkListStore *store;
    GtkTreeViewColumn *column;
    GtkCellRenderer *renderer;
    
    scrolled = gtk_scrolled_window_new();
    gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(scrolled),
                                  GTK_POLICY_AUTOMATIC, GTK_POLICY_AUTOMATIC);
    
    /* Create list store */
    store = gtk_list_store_new(6, 
                              G_TYPE_INT,    /* ID */
                              G_TYPE_STRING, /* Title */
                              G_TYPE_STRING, /* Status */
                              G_TYPE_STRING, /* Priority */
                              G_TYPE_STRING, /* Due Date */
                              G_TYPE_DOUBLE  /* Progress */
                              );
    
    /* Create tree view */
    tree_view = gtk_tree_view_new_with_model(GTK_TREE_MODEL(store));
    gtk_tree_view_set_headers_visible(GTK_TREE_VIEW(tree_view), TRUE);
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled), tree_view);
    
    /* Add columns */
    renderer = gtk_cell_renderer_text_new();
    column = gtk_tree_view_column_new_with_attributes("Task", renderer,
                                                     "text", 1, NULL);
    gtk_tree_view_append_column(GTK_TREE_VIEW(tree_view), column);
    
    renderer = gtk_cell_renderer_text_new();
    column = gtk_tree_view_column_new_with_attributes("Status", renderer,
                                                     "text", 2, NULL);
    gtk_tree_view_append_column(GTK_TREE_VIEW(tree_view), column);
    
    renderer = gtk_cell_renderer_text_new();
    column = gtk_tree_view_column_new_with_attributes("Priority", renderer,
                                                     "text", 3, NULL);
    gtk_tree_view_append_column(GTK_TREE_VIEW(tree_view), column);
    
    renderer = gtk_cell_renderer_text_new();
    column = gtk_tree_view_column_new_with_attributes("Due Date", renderer,
                                                     "text", 4, NULL);
    gtk_tree_view_append_column(GTK_TREE_VIEW(tree_view), column);
    
    renderer = gtk_cell_renderer_progress_new();
    column = gtk_tree_view_column_new_with_attributes("Progress", renderer,
                                                     "value", 5, NULL);
    gtk_tree_view_append_column(GTK_TREE_VIEW(tree_view), column);
    
    g_object_unref(store);
    
    return scrolled;
}

GtkWidget* create_calendar_view_widget(void) {
    GtkWidget *box;
    GtkWidget *calendar;
    GtkWidget *scrolled;
    GtkWidget *text_view;
    
    box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 6);
    gtk_widget_set_margin_start(box, 12);
    gtk_widget_set_margin_end(box, 12);
    gtk_widget_set_margin_top(box, 12);
    gtk_widget_set_margin_bottom(box, 12);
    
    /* Calendar widget */
    calendar = gtk_calendar_new();
    gtk_box_append(GTK_BOX(box), calendar);
    
    /* Tasks for selected date */
    scrolled = gtk_scrolled_window_new();
    gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(scrolled),
                                  GTK_POLICY_AUTOMATIC, GTK_POLICY_AUTOMATIC);
    gtk_widget_set_vexpand(scrolled, TRUE);
    
    text_view = gtk_text_view_new();
    gtk_text_view_set_editable(GTK_TEXT_VIEW(text_view), FALSE);
    gtk_scrolled_window_set_child(GTK_SCROLLED_WINDOW(scrolled), text_view);
    
    gtk_box_append(GTK_BOX(box), scrolled);
    
    return box;
}

/* Database Operations */
gboolean db_create_tables(sqlite3 *db) {
    char *err_msg = NULL;
    int rc = sqlite3_exec(db, CREATE_TABLES_SQL, NULL, NULL, &err_msg);
    
    if (rc != SQLITE_OK) {
        g_warning("SQL error: %s", err_msg);
        sqlite3_free(err_msg);
        return FALSE;
    }
    
    return TRUE;
}

/* Signal Handlers */
void on_new_project_clicked(GtkButton *button, gpointer user_data) {
    ProjectTrackerApp *app = (ProjectTrackerApp*)user_data;
    GtkWidget *dialog;
    
    Project project = {0};
    dialog = create_project_dialog(app->main_window, &project);
    
    int response = gtk_dialog_run(GTK_DIALOG(dialog));
    if (response == GTK_RESPONSE_ACCEPT) {
        /* Save project to database */
        if (db_insert_project(app->database, &project)) {
            gtk_statusbar_push(GTK_STATUSBAR(app->status_bar), 1, 
                              "Project created successfully");
        } else {
            show_error_dialog(app->main_window, "Failed to create project");
        }
    }
    
    gtk_widget_destroy(dialog);
}

/* Utility Functions */
void show_error_dialog(GtkWindow *parent, const gchar *message) {
    GtkWidget *dialog;
    
    dialog = gtk_message_dialog_new(parent,
                                   GTK_DIALOG_MODAL | GTK_DIALOG_DESTROY_WITH_PARENT,
                                   GTK_MESSAGE_ERROR,
                                   GTK_BUTTONS_OK,
                                   "%s", message);
    
    gtk_dialog_run(GTK_DIALOG(dialog));
    gtk_widget_destroy(dialog);
}

/* Main Function Template */
int main(int argc, char *argv[]) {
    ProjectTrackerApp *app_data;
    GtkApplication *app;
    int status;
    
    /* Initialize GTK */
    gtk_init();
    
    /* Create application */
    app = gtk_application_new("com.example.projecttracker", G_APPLICATION_DEFAULT_FLAGS);
    
    /* Create app data */
    app_data = project_tracker_app_new();
    app_data->app = app;
    
    /* Connect signals */
    g_signal_connect(app, "activate", G_CALLBACK(activate), app_data);
    
    /* Run application */
    status = g_application_run(G_APPLICATION(app), argc, argv);
    
    /* Cleanup */
    project_tracker_app_free(app_data);
    g_object_unref(app);
    
    return status;
}