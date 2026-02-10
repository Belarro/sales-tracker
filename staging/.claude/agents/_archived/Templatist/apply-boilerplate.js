#!/usr/bin/env node

/**
 * Direct Boilerplate Application Module
 * For use by Templatist agent to apply templates programmatically
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class BoilerplateApplicator {
  constructor(config) {
    this.config = {
      projectName: 'My Project',
      projectDescription: 'A new project',
      primaryColor: '#3B82F6',
      secondaryColor: '#6366F1',
      accentColor: '#8B5CF6',
      taskStatuses: ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'],
      priorityLevels: ['Critical', 'High', 'Normal', 'Low'],
      ownerFilters: ['All', 'Unassigned', 'My Tasks'],
      apiEndpoint: 'http://localhost:3001',
      databaseType: 'sqlite',
      ...config
    };
    
    this.replacements = this.buildReplacements();
  }

  buildReplacements() {
    const { config } = this;
    return {
      '{{PROJECT_NAME}}': config.projectName,
      '{{PROJECT_DESCRIPTION}}': config.projectDescription,
      '{{PRIMARY_COLOR}}': config.primaryColor,
      '{{SECONDARY_COLOR}}': config.secondaryColor,
      '{{ACCENT_COLOR}}': config.accentColor,
      '{{API_ENDPOINT}}': config.apiEndpoint,
      '{{DATABASE_TYPE}}': config.databaseType,
      
      // Array replacements
      '{{TASK_STATUSES}}': config.taskStatuses.map(s => `'${s}'`).join(' | '),
      '{{TASK_STATUSES_JSON}}': JSON.stringify(config.taskStatuses),
      '{{PRIORITY_LEVELS}}': config.priorityLevels.map(p => `'${p}'`).join(' | '),
      '{{PRIORITY_LEVELS_JSON}}': JSON.stringify(config.priorityLevels),
      '{{OWNER_FILTERS}}': config.ownerFilters.map(o => `'${o}'`).join(' | '),
      '{{OWNER_FILTERS_JSON}}': JSON.stringify(config.ownerFilters),
      
      // Computed replacements
      '{{KANBAN_COLUMNS}}': this.generateKanbanColumns(),
      '{{STATUS_COLUMN_MAP}}': this.generateStatusColumnMap(),
      '{{KANBAN_COLUMNS_CONFIG}}': this.generateKanbanConfig(),
      '{{COLUMN_COUNT}}': config.taskStatuses.length.toString(),
      '{{THEME_NAMES}}': this.generateThemeNames(),
      
      // Defaults
      '{{TOTAL_TASKS}}': '0',
      '{{COMPLETION_PERCENTAGE}}': '0'
    };
  }

  generateKanbanColumns() {
    return this.config.taskStatuses
      .map(status => {
        const key = status.toLowerCase().replace(/\s+/g, '');
        return `${key}: Task[]`;
      })
      .join(';\n  ');
  }

  generateStatusColumnMap() {
    return this.config.taskStatuses
      .map(status => {
        const key = status.toLowerCase().replace(/\s+/g, '');
        return `'${key}': '${status}' as TaskStatus`;
      })
      .join(',\n      ');
  }

  generateKanbanConfig() {
    const configs = this.config.taskStatuses.map(status => {
      const id = status.toLowerCase().replace(/\s+/g, '');
      const icon = this.getStatusIcon(status);
      return `{
        id: '${id}',
        title: '${status}',
        key: '${id}',
        icon: ${icon}
      }`;
    });
    
    return `[\n    ${configs.join(',\n    ')}\n  ]`;
  }

  getStatusIcon(status) {
    const iconMap = {
      'backlog': '<ClockIcon />',
      'todo': '<ListIcon />',
      'pending': '<ClockIcon />',
      'in progress': '<PlayIcon />',
      'inprogress': '<PlayIcon />',
      'review': '<EyeIcon />',
      'ready': '<CheckIcon />',
      'done': '<CheckDoubleIcon />',
      'completed': '<CheckDoubleIcon />'
    };
    
    const key = status.toLowerCase().replace(/\s+/g, '');
    return iconMap[key] || '<CircleIcon />';
  }

  generateThemeNames() {
    const themes = [
      'light', 'dark', 'blue', 'green', 'purple', 
      'orange', 'red', 'teal', 'indigo', 'pink'
    ];
    return themes.map(t => `'${t}'`).join(' | ');
  }

  async replaceInFile(filePath, replacements) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      
      for (const [placeholder, value] of Object.entries(replacements)) {
        const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
        content = content.replace(regex, value);
      }
      
      await fs.writeFile(filePath, content);
      return true;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      let destPath = path.join(dest, entry.name);
      
      // Remove .template extension
      if (destPath.endsWith('.template')) {
        destPath = destPath.slice(0, -9);
      }
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        // Copy and transform file
        let content = await fs.readFile(srcPath, 'utf8');
        
        // Apply replacements
        for (const [placeholder, value] of Object.entries(this.replacements)) {
          const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
          content = content.replace(regex, value);
        }
        
        await fs.writeFile(destPath, content);
      }
    }
  }

  async applyTemplate(templatePath, targetPath) {
    console.log('📦 Applying template...\n');
    
    // Create target directory
    await fs.mkdir(targetPath, { recursive: true });
    
    // Copy source files
    const srcPath = path.join(templatePath, 'src');
    if (await this.exists(srcPath)) {
      await this.copyDirectory(srcPath, targetPath);
      console.log('✅ Template files copied and transformed');
    }
    
    // Copy configuration
    const configSrc = path.join(templatePath, 'config', 'template.config.json');
    if (await this.exists(configSrc)) {
      const configDest = path.join(targetPath, 'project.config.json');
      let configContent = await fs.readFile(configSrc, 'utf8');
      
      // Apply replacements to config
      for (const [placeholder, value] of Object.entries(this.replacements)) {
        const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
        configContent = configContent.replace(regex, value);
      }
      
      await fs.writeFile(configDest, configContent);
      console.log('✅ Configuration created');
    }
    
    // Initialize git repository
    try {
      execSync('git init', { cwd: targetPath, stdio: 'ignore' });
      console.log('✅ Git repository initialized');
    } catch (error) {
      console.log('⚠️  Could not initialize git repository');
    }
    
    // Create .gitignore
    const gitignoreContent = `
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
*.db
*.sqlite
.next/
out/
.vercel
    `.trim();
    
    await fs.writeFile(path.join(targetPath, '.gitignore'), gitignoreContent);
    console.log('✅ .gitignore created');
    
    // Install dependencies
    await this.installDependencies(targetPath);
    
    // Initialize database if needed
    if (this.config.databaseType) {
      await this.initializeDatabase(targetPath);
    }
    
    console.log('\n✅ Boilerplate applied successfully!');
    console.log('\nNext steps:');
    console.log(`1. cd ${targetPath}`);
    console.log('2. npm run dev (in frontend/ and backend/ if applicable)');
    console.log('3. Open http://localhost:3000\n');
  }

  async installDependencies(targetPath) {
    const dirs = ['frontend', 'backend', '.'];
    
    for (const dir of dirs) {
      const packagePath = path.join(targetPath, dir, 'package.json');
      if (await this.exists(packagePath)) {
        console.log(`📦 Installing dependencies in ${dir}...`);
        try {
          execSync('npm install', { 
            cwd: path.join(targetPath, dir),
            stdio: 'ignore'
          });
          console.log(`✅ Dependencies installed in ${dir}`);
        } catch (error) {
          console.log(`⚠️  Could not install dependencies in ${dir}`);
        }
      }
    }
  }

  async initializeDatabase(targetPath) {
    if (this.config.databaseType === 'sqlite') {
      const dbDir = path.join(targetPath, 'backend', 'data');
      await fs.mkdir(dbDir, { recursive: true });
      
      const schemaPath = path.join(targetPath, 'backend', 'schema.sql');
      if (await this.exists(schemaPath)) {
        console.log('✅ Database directory created');
      }
    }
  }

  async exists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

// Export for use by other scripts
module.exports = BoilerplateApplicator;

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node apply-boilerplate.js <template-path> <target-path> [config-json]');
    process.exit(1);
  }
  
  const [templatePath, targetPath, configJson] = args;
  const config = configJson ? JSON.parse(configJson) : {};
  
  const applicator = new BoilerplateApplicator(config);
  applicator.applyTemplate(templatePath, targetPath)
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}