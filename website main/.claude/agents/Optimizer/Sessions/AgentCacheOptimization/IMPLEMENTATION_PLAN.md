# Agent Cache System Optimization Implementation Plan

## Phase 1: Memory-First Caching with Deferred Persistence

**Estimated Timeline:** 1-2 days  
**Performance Impact:** 95% reduction in filesystem operations

### Implementation Steps

1. Create the basic `AgentCacheManager` structure:
   ```rust
   pub struct AgentCacheManager {
       memory_cache: HashMap<String, AgentCacheEntry>,
       last_persistence: SystemTime,
       persistence_interval: Duration,
       cache_dir: PathBuf,
       modified: bool,
   }
   ```

2. Implement core functionality:
   - Constructor that loads existing cache entries
   - In-memory caching of new entries
   - Conditional persistence based on time interval
   - Forced persistence for critical operations

3. Modify agent activation process to use the cache manager:
   - Store new activation in memory immediately
   - Defer persistence to disk until interval elapses
   - Generate markdown file only when persistence occurs

4. Add shutdown hook to ensure cache is persisted when system terminates

### Code Outline

```rust
// Implementation of the core memory-first caching system
impl AgentCacheManager {
    pub fn new(cache_dir: &Path, persistence_interval_seconds: u64) -> Result<Self, Box<dyn Error>> {
        let cache_dir = PathBuf::from(cache_dir);
        if !cache_dir.exists() {
            create_dir_all(&cache_dir)?;
        }
        
        let mut manager = AgentCacheManager {
            memory_cache: HashMap::new(),
            last_persistence: SystemTime::now(),
            persistence_interval: Duration::from_secs(persistence_interval_seconds),
            cache_dir,
            modified: false,
        };
        
        // Load existing cache entries from disk
        manager.load_existing_entries()?;
        
        Ok(manager)
    }
    
    // Create a new cache entry in memory
    pub fn create_agent_cache(&mut self, agent_name: &str, directory: &str, 
                             initializer: &str, intent: &str) -> String {
        let entry_id = format!("{}_{}_{}_{}", 
            self.sanitize(agent_name),
            self.sanitize(directory),
            self.sanitize(initializer),
            SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()
        );
        
        let entry = AgentCacheEntry {
            agent_name: agent_name.to_string(),
            directory: directory.to_string(),
            initializer: initializer.to_string(),
            timestamp: SystemTime::now(),
            intent: intent.to_string(),
            status: AgentStatus::Active,
        };
        
        self.memory_cache.insert(entry_id.clone(), entry);
        self.modified = true;
        
        // Maybe persist changes to disk based on interval
        self.maybe_persist().unwrap_or_else(|e| eprintln!("Error persisting cache: {}", e));
        
        entry_id
    }
    
    // Conditionally persist if interval has elapsed
    fn maybe_persist(&mut self) -> Result<(), Box<dyn Error>> {
        if !self.modified {
            return Ok(());
        }
        
        let now = SystemTime::now();
        if now.duration_since(self.last_persistence)? >= self.persistence_interval {
            self.persist_to_disk()?;
            self.last_persistence = now;
            self.modified = false;
        }
        
        Ok(())
    }
    
    // Force persistence to disk immediately
    pub fn force_persist(&mut self) -> Result<(), Box<dyn Error>> {
        if self.modified {
            self.persist_to_disk()?;
            self.last_persistence = SystemTime::now();
            self.modified = false;
        }
        Ok(())
    }
    
    // Helper to persist all modified entries to disk
    fn persist_to_disk(&self) -> Result<(), Box<dyn Error>> {
        for (id, entry) in &self.memory_cache {
            if entry.is_modified {
                let path = self.cache_dir.join(format!("{}.md", id));
                let content = entry.to_markdown();
                fs::write(path, content)?;
                entry.is_modified = false;
            }
        }
        Ok(())
    }
}
```

## Phase 2: Single-File JSON Database

**Estimated Timeline:** 2-3 days  
**Performance Impact:** 80-90% reduction in disk I/O

### Implementation Steps

1. Design the database structure:
   ```rust
   pub struct AgentCacheDatabase {
       db_path: PathBuf,
       entries: Vec<AgentCacheEntry>,
       modified: bool,
   }
   ```

2. Implement serialization/deserialization:
   - Load database from disk or create new
   - Save database when modified
   - Maintain entries in memory

3. Migrate the existing per-file cache to the database format:
   - Scan existing cache files
   - Add entries to database
   - Save consolidated database

4. Update the cache manager to use the database:
   - Create entries in memory
   - Add to database when persisting
   - Read from database when loading

### Code Outline

```rust
// Implementation of the single-file database
impl AgentCacheDatabase {
    pub fn load(db_path: &Path) -> Result<Self, Box<dyn Error>> {
        let db_path = PathBuf::from(db_path);
        
        if db_path.exists() {
            let content = fs::read_to_string(&db_path)?;
            let entries: Vec<AgentCacheEntry> = serde_json::from_str(&content)?;
            
            Ok(AgentCacheDatabase {
                db_path,
                entries,
                modified: false,
            })
        } else {
            Ok(AgentCacheDatabase {
                db_path,
                entries: Vec::new(),
                modified: false,
            })
        }
    }
    
    pub fn save(&mut self) -> Result<(), Box<dyn Error>> {
        if !self.modified {
            return Ok(());
        }
        
        let content = serde_json::to_string_pretty(&self.entries)?;
        fs::write(&self.db_path, content)?;
        self.modified = false;
        
        Ok(())
    }
    
    pub fn add_entry(&mut self, entry: AgentCacheEntry) {
        self.entries.push(entry);
        self.modified = true;
    }
    
    pub fn get_entries_for_agent(&self, agent_name: &str) -> Vec<&AgentCacheEntry> {
        self.entries.iter()
            .filter(|entry| entry.agent_name == agent_name)
            .collect()
    }
    
    pub fn get_latest_entry_for_agent(&self, agent_name: &str) -> Option<&AgentCacheEntry> {
        self.entries.iter()
            .filter(|entry| entry.agent_name == agent_name)
            .max_by_key(|entry| entry.timestamp)
    }
}
```

## Phase 3: Indexed Lookups

**Estimated Timeline:** 1-2 days  
**Performance Impact:** Reduction from O(n) to O(1) for lookups

### Implementation Steps

1. Design the index structure:
   ```rust
   pub struct AgentCacheIndex {
       agent_index: HashMap<String, Vec<usize>>,
       context_index: HashMap<(String, String), Vec<usize>>,
       timestamp_index: BTreeMap<u64, usize>,
   }
   ```

2. Implement index building and maintenance:
   - Build indices from database entries
   - Update indices when entries are added/modified
   - Optimize for common lookup patterns

3. Modify lookup operations to use indices:
   - Agent-based lookups
   - Context-based lookups
   - Time-based lookups

### Code Outline

```rust
// Implementation of the indexed lookups
impl AgentCacheIndex {
    pub fn build(entries: &[AgentCacheEntry]) -> Self {
        let mut agent_index = HashMap::new();
        let mut context_index = HashMap::new();
        let mut timestamp_index = BTreeMap::new();
        
        for (i, entry) in entries.iter().enumerate() {
            // Build agent index
            agent_index.entry(entry.agent_name.clone())
                .or_insert_with(Vec::new)
                .push(i);
                
            // Build context index
            context_index.entry((entry.agent_name.clone(), entry.directory.clone()))
                .or_insert_with(Vec::new)
                .push(i);
                
            // Build timestamp index
            let timestamp = entry.timestamp.duration_since(UNIX_EPOCH).unwrap().as_secs();
            timestamp_index.insert(timestamp, i);
        }
        
        AgentCacheIndex {
            agent_index,
            context_index,
            timestamp_index,
        }
    }
    
    pub fn get_latest_for_agent(&self, agent_name: &str, entries: &[AgentCacheEntry]) 
        -> Option<&AgentCacheEntry> {
        if let Some(indices) = self.agent_index.get(agent_name) {
            if indices.is_empty() {
                return None;
            }
            
            let latest_idx = indices.iter()
                .map(|&idx| (entries[idx].timestamp, idx))
                .max_by_key(|(timestamp, _)| *timestamp)
                .map(|(_, idx)| idx);
                
            latest_idx.map(|idx| &entries[idx])
        } else {
            None
        }
    }
}
```

## Phase 4: Compression and Binary Format

**Estimated Timeline:** 1 day  
**Performance Impact:** 60-70% reduction in storage requirements

### Implementation Steps

1. Choose a binary serialization format (MessagePack recommended)
2. Update the AgentCacheEntry to use the binary format:
   - Add serialization/deserialization methods
   - Optimize field sizes and representations

3. Modify the database to use binary format:
   - Save/load using binary serialization
   - Compress data during storage/transmission

### Code Outline

```rust
// Implementation using MessagePack for binary serialization
impl AgentCacheDatabase {
    pub fn load_binary(db_path: &Path) -> Result<Self, Box<dyn Error>> {
        let db_path = PathBuf::from(db_path);
        
        if db_path.exists() {
            let bytes = fs::read(&db_path)?;
            let entries: Vec<AgentCacheEntry> = rmp_serde::from_slice(&bytes)?;
            
            Ok(AgentCacheDatabase {
                db_path,
                entries,
                modified: false,
            })
        } else {
            Ok(AgentCacheDatabase {
                db_path,
                entries: Vec::new(),
                modified: false,
            })
        }
    }
    
    pub fn save_binary(&mut self) -> Result<(), Box<dyn Error>> {
        if !self.modified {
            return Ok(());
        }
        
        let bytes = rmp_serde::to_vec(&self.entries)?;
        fs::write(&self.db_path, bytes)?;
        self.modified = false;
        
        Ok(())
    }
}
```

## Phase 5: Lazy Loading with LRU Cache

**Estimated Timeline:** 1 day  
**Performance Impact:** 95-99% reduction in repeat lookups

### Implementation Steps

1. Add an LRU cache to the system:
   ```rust
   pub struct AgentCacheSystem {
       database: AgentCacheDatabase,
       index: AgentCacheIndex,
       memory_cache: LruCache<String, AgentCacheEntry>,
   }
   ```

2. Implement caching logic:
   - Cache frequently accessed entries
   - Invalidate cache entries when modified
   - Size cache based on expected usage patterns

3. Update lookup operations to use the cache:
   - Check cache first
   - Fall back to database if not found
   - Update cache with retrieved entries

### Code Outline

```rust
// Implementation of the LRU cache
impl AgentCacheSystem {
    pub fn new(db_path: &Path, cache_size: usize) -> Result<Self, Box<dyn Error>> {
        let database = AgentCacheDatabase::load(db_path)?;
        let index = AgentCacheIndex::build(&database.entries);
        
        Ok(AgentCacheSystem {
            database,
            index,
            memory_cache: LruCache::new(cache_size),
        })
    }
    
    pub fn get_agent_cache(&mut self, agent_name: &str) -> Option<AgentCacheEntry> {
        // Check in memory cache first
        if let Some(entry) = self.memory_cache.get(agent_name) {
            return Some(entry.clone());
        }
        
        // Get from database using index
        if let Some(entry) = self.index.get_latest_for_agent(agent_name, &self.database.entries) {
            let entry_clone = entry.clone();
            self.memory_cache.put(agent_name.to_string(), entry_clone.clone());
            return Some(entry_clone);
        }
        
        None
    }
}
```

## Testing Plan

1. **Unit Tests**:
   - Test each component in isolation
   - Verify correctness of cache operations
   - Ensure database integrity

2. **Performance Tests**:
   - Measure time for agent activations
   - Compare file I/O operations
   - Benchmark lookup times
   - Test with various cache sizes and intervals

3. **Integration Tests**:
   - Test interaction with agent activation system
   - Verify proper shutdown persistence
   - Test compatibility with existing cache files

## Deployment Plan

1. Phase 1 deployment:
   - Implement memory-first caching
   - Test in development environment
   - Measure performance improvements

2. Phases 2-3 deployment:
   - Add single-file database and indexing
   - Migrate existing cache files
   - Monitor performance improvements

3. Phases 4-5 deployment (if needed):
   - Add compression and LRU caching
   - Optimize based on real-world usage patterns
   - Fine-tune parameters for optimal performance