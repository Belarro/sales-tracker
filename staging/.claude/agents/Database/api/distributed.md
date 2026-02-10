# Distributed Database Management

## Overview
The Database agent supports distributed database instances across multiple projects while maintaining central coordination.

## Architecture

### Database Types

1. **Master Database** (`ci_master.db`)
   - Located in CollaborativeIntelligence/data/
   - Contains global agent registry and metadata
   - Tracks all project databases
   
2. **Project Databases** (`[project]_data.db`)
   - Located in each project's data/ directory
   - Contains project-specific data
   - Links back to master database

### Initialization Protocol

```bash
# Database agent command to initialize project DB
database init-project --path=/path/to/project --name=ProjectName
```

This creates:
- Project-specific database with base schema
- Registration in master database
- Configuration for synchronization

### Schema Distribution

1. **Core Schema** (all databases)
   ```sql
   -- Required in every database
   CREATE TABLE project_metadata (
       project_id TEXT PRIMARY KEY,
       name TEXT NOT NULL,
       path TEXT NOT NULL,
       master_db_path TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Project-Specific Extensions**
   - Each project can extend the base schema
   - Extensions tracked in master database
   - Version control for schema evolution

### Synchronization

1. **Metadata Sync**
   - Project status updates to master
   - Agent activity tracking
   - Cross-project references

2. **Selective Data Sync**
   - Configure which data syncs to master
   - Privacy controls per project
   - Conflict resolution protocols

### API Design

```python
class DistributedDatabase:
    def init_project_db(self, project_path, project_name):
        """Initialize a new project database"""
        
    def register_in_master(self, project_db_path):
        """Register project DB in master registry"""
        
    def sync_metadata(self, project_id):
        """Sync project metadata to master"""
        
    def query_cross_project(self, query, projects=[]):
        """Execute query across multiple project DBs"""
```

## ProjectAnalytics Integration

ProjectAnalytics can:
1. Use its local database for project-specific data
2. Query the master database for cross-project insights
3. Register its schema extensions with Database agent

## Implementation Steps

1. Create distributed database API in Database agent
2. Add project initialization commands
3. Implement metadata synchronization
4. Create cross-database query capabilities
5. Add privacy and access controls

## Benefits

- Each project maintains data locality
- Central coordination without coupling
- Flexible schema evolution per project
- Efficient cross-project queries
- Clear separation of concerns