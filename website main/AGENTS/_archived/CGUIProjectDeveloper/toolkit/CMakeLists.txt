# CMake build configuration for GTK C Project Tracker
cmake_minimum_required(VERSION 3.16)
project(ProjectTracker C)

# Set C standard
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Find required packages
find_package(PkgConfig REQUIRED)

# Find GTK4
pkg_check_modules(GTK4 REQUIRED gtk4)
if(NOT GTK4_FOUND)
    message(FATAL_ERROR "GTK4 not found. Please install GTK4 development packages.")
endif()

# Find SQLite3
pkg_check_modules(SQLITE3 REQUIRED sqlite3)
if(NOT SQLITE3_FOUND)
    message(FATAL_ERROR "SQLite3 not found. Please install SQLite3 development packages.")
endif()

# Optional: Find libgit2 for version control integration
pkg_check_modules(LIBGIT2 libgit2)

# Set compiler flags
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra -Werror")
set(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} -g -O0 -DDEBUG")
set(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} -O3 -DNDEBUG")

# Include directories
include_directories(${GTK4_INCLUDE_DIRS})
include_directories(${SQLITE3_INCLUDE_DIRS})
if(LIBGIT2_FOUND)
    include_directories(${LIBGIT2_INCLUDE_DIRS})
    add_definitions(-DHAVE_LIBGIT2)
endif()

# Link directories
link_directories(${GTK4_LIBRARY_DIRS})
link_directories(${SQLITE3_LIBRARY_DIRS})
if(LIBGIT2_FOUND)
    link_directories(${LIBGIT2_LIBRARY_DIRS})
endif()

# Source files
set(SOURCES
    src/main.c
    src/app/application.c
    src/app/project_manager.c
    src/windows/main_window.c
    src/windows/project_dialog.c
    src/windows/task_dialog.c
    src/windows/settings_dialog.c
    src/views/gantt_view.c
    src/views/task_list_view.c
    src/views/calendar_view.c
    src/views/dashboard_view.c
    src/widgets/gantt_chart.c
    src/widgets/task_tree.c
    src/widgets/timeline_widget.c
    src/models/project.c
    src/models/task.c
    src/models/user.c
    src/models/dependency.c
    src/services/database_service.c
    src/services/file_service.c
    src/services/export_service.c
    src/services/import_service.c
    src/utils/date_utils.c
    src/utils/string_utils.c
    src/utils/color_utils.c
    src/utils/validation.c
)

# Header files
set(HEADERS
    include/project_tracker.h
    include/app/application.h
    include/app/project_manager.h
    include/windows/main_window.h
    include/windows/dialogs.h
    include/views/views.h
    include/widgets/custom_widgets.h
    include/models/models.h
    include/services/services.h
    include/utils/utils.h
)

# Create executable
add_executable(project-tracker ${SOURCES} ${HEADERS})

# Link libraries
target_link_libraries(project-tracker 
    ${GTK4_LIBRARIES} 
    ${SQLITE3_LIBRARIES}
    m  # Math library
)

if(LIBGIT2_FOUND)
    target_link_libraries(project-tracker ${LIBGIT2_LIBRARIES})
endif()

# Add compiler flags for libraries
target_compile_options(project-tracker PRIVATE ${GTK4_CFLAGS_OTHER})
target_compile_options(project-tracker PRIVATE ${SQLITE3_CFLAGS_OTHER})

# Set include directories for target
target_include_directories(project-tracker PRIVATE include)

# Resource handling (for UI files, icons, etc.)
find_program(GLIB_COMPILE_RESOURCES glib-compile-resources REQUIRED)

set(RESOURCE_DIR ${CMAKE_SOURCE_DIR}/data)
set(RESOURCE_FILE ${RESOURCE_DIR}/project_tracker.gresource.xml)
set(RESOURCE_OUTPUT ${CMAKE_BINARY_DIR}/resources.c)

if(EXISTS ${RESOURCE_FILE})
    add_custom_command(
        OUTPUT ${RESOURCE_OUTPUT}
        COMMAND ${GLIB_COMPILE_RESOURCES}
        ARGS --target=${RESOURCE_OUTPUT}
             --sourcedir=${RESOURCE_DIR}
             --generate-source
             ${RESOURCE_FILE}
        DEPENDS ${RESOURCE_FILE}
        COMMENT "Compiling resources"
    )
    
    # Add resources to sources
    list(APPEND SOURCES ${RESOURCE_OUTPUT})
    set_source_files_properties(${RESOURCE_OUTPUT} PROPERTIES GENERATED TRUE)
endif()

# Install targets
install(TARGETS project-tracker DESTINATION bin)

# Install desktop file
if(EXISTS ${CMAKE_SOURCE_DIR}/data/project-tracker.desktop)
    install(FILES ${CMAKE_SOURCE_DIR}/data/project-tracker.desktop 
            DESTINATION share/applications)
endif()

# Install icon
if(EXISTS ${CMAKE_SOURCE_DIR}/data/icons/project-tracker.png)
    install(FILES ${CMAKE_SOURCE_DIR}/data/icons/project-tracker.png 
            DESTINATION share/pixmaps)
endif()

# Install schema files (if using GSettings)
if(EXISTS ${CMAKE_SOURCE_DIR}/data/schemas)
    install(DIRECTORY ${CMAKE_SOURCE_DIR}/data/schemas/
            DESTINATION share/glib-2.0/schemas/
            FILES_MATCHING PATTERN "*.gschema.xml")
endif()

# Testing support
enable_testing()

# Find Check framework for unit testing
find_package(PkgConfig)
if(PkgConfig_FOUND)
    pkg_check_modules(CHECK check)
endif()

if(CHECK_FOUND)
    # Test sources
    set(TEST_SOURCES
        tests/test_main.c
        tests/test_models.c
        tests/test_database.c
        tests/test_utils.c
        # Include necessary source files for testing
        src/models/project.c
        src/models/task.c
        src/services/database_service.c
        src/utils/date_utils.c
        src/utils/validation.c
    )
    
    add_executable(project-tracker-tests ${TEST_SOURCES})
    
    target_link_libraries(project-tracker-tests 
        ${CHECK_LIBRARIES}
        ${SQLITE3_LIBRARIES}
        ${GTK4_LIBRARIES}
        m
    )
    
    target_include_directories(project-tracker-tests PRIVATE 
        include 
        ${CHECK_INCLUDE_DIRS}
    )
    
    # Add test
    add_test(NAME unit_tests COMMAND project-tracker-tests)
endif()

# Code coverage (if using gcc)
if(CMAKE_COMPILER_IS_GNUCC)
    option(ENABLE_COVERAGE "Enable coverage reporting" OFF)
    if(ENABLE_COVERAGE)
        target_compile_options(project-tracker PRIVATE --coverage)
        target_link_libraries(project-tracker --coverage)
    endif()
endif()

# Static analysis support
find_program(CPPCHECK cppcheck)
if(CPPCHECK)
    add_custom_target(cppcheck
        COMMAND ${CPPCHECK}
        --enable=warning,performance,portability,information,missingInclude
        --std=c11
        --library=gtk
        --quiet
        --verbose
        --error-exitcode=1
        --inline-suppr
        ${CMAKE_SOURCE_DIR}/src
        COMMENT "Running cppcheck"
    )
endif()

# Packaging
set(CPACK_PACKAGE_NAME "ProjectTracker")
set(CPACK_PACKAGE_VERSION "1.0.0")
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "GTK-based Project Management Tool")
set(CPACK_PACKAGE_VENDOR "Your Organization")
set(CPACK_PACKAGE_CONTACT "your.email@example.com")

# Platform-specific packaging
if(UNIX AND NOT APPLE)
    # Linux packaging
    set(CPACK_GENERATOR "DEB;RPM;TGZ")
    set(CPACK_DEBIAN_PACKAGE_DEPENDS "libgtk-4-1, libsqlite3-0")
    set(CPACK_DEBIAN_PACKAGE_SECTION "utils")
    set(CPACK_RPM_PACKAGE_GROUP "Applications/Productivity")
    set(CPACK_RPM_PACKAGE_REQUIRES "gtk4, sqlite")
elseif(WIN32)
    # Windows packaging
    set(CPACK_GENERATOR "NSIS;ZIP")
    set(CPACK_NSIS_DISPLAY_NAME "Project Tracker")
    set(CPACK_NSIS_PACKAGE_NAME "ProjectTracker")
elseif(APPLE)
    # macOS packaging
    set(CPACK_GENERATOR "DragNDrop")
    set(CPACK_DMG_VOLUME_NAME "Project Tracker")
endif()

include(CPack)

# Print configuration summary
message(STATUS "")
message(STATUS "Project Tracker Configuration Summary:")
message(STATUS "  Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  C Compiler: ${CMAKE_C_COMPILER}")
message(STATUS "  GTK4 version: ${GTK4_VERSION}")
message(STATUS "  SQLite3 version: ${SQLITE3_VERSION}")
if(LIBGIT2_FOUND)
    message(STATUS "  libgit2 version: ${LIBGIT2_VERSION}")
    message(STATUS "  Git integration: Enabled")
else()
    message(STATUS "  Git integration: Disabled")
endif()
if(CHECK_FOUND)
    message(STATUS "  Unit testing: Enabled")
else()
    message(STATUS "  Unit testing: Disabled (Check framework not found)")
endif()
message(STATUS "")