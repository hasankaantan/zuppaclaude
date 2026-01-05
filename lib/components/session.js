/**
 * Session Manager - Backup and restore Claude Code sessions
 */

const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

class SessionManager {
  constructor() {
    this.platform = new Platform();
    this.logger = new Logger();
    this.claudeDir = this.platform.claudeDir;
    this.projectsDir = path.join(this.claudeDir, 'projects');
    // New structure: backups/{hostname}/{username}/sessions/
    this.backupDir = this.platform.backupBasePath;
  }

  /**
   * Get all projects with sessions
   */
  getProjects() {
    if (!fs.existsSync(this.projectsDir)) {
      return [];
    }

    return fs.readdirSync(this.projectsDir)
      .filter(name => {
        const projectPath = path.join(this.projectsDir, name);
        return fs.statSync(projectPath).isDirectory() && name !== '.' && name !== '..';
      })
      .map(name => {
        const projectPath = path.join(this.projectsDir, name);
        const sessions = this.getProjectSessions(projectPath);
        const realPath = name.replace(/-/g, '/').replace(/^\//, '');

        return {
          id: name,
          path: realPath,
          sessionsDir: projectPath,
          sessions: sessions,
          totalSize: sessions.reduce((sum, s) => sum + s.size, 0)
        };
      })
      .filter(p => p.sessions.length > 0);
  }

  /**
   * Get sessions for a project
   */
  getProjectSessions(projectPath) {
    if (!fs.existsSync(projectPath)) {
      return [];
    }

    return fs.readdirSync(projectPath)
      .filter(name => name.endsWith('.jsonl'))
      .map(name => {
        const filePath = path.join(projectPath, name);
        const stats = fs.statSync(filePath);
        const isAgent = name.startsWith('agent-');

        return {
          id: name.replace('.jsonl', ''),
          file: name,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          isAgent: isAgent,
          type: isAgent ? 'agent' : 'main'
        };
      })
      .sort((a, b) => b.modified - a.modified);
  }

  /**
   * List all sessions
   */
  list(options = {}) {
    const projects = this.getProjects();

    if (projects.length === 0) {
      this.logger.warning('No sessions found');
      return [];
    }

    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    Claude Code Sessions\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');

    let totalSessions = 0;
    let totalSize = 0;

    for (const project of projects) {
      const shortPath = project.path.length > 50
        ? '...' + project.path.slice(-47)
        : project.path;

      console.log(`\x1b[36m📁 ${shortPath}\x1b[0m`);

      for (const session of project.sessions) {
        const sizeStr = this.formatSize(session.size);
        const dateStr = this.formatDate(session.modified);
        const typeIcon = session.isAgent ? '🤖' : '💬';
        const shortId = session.id.length > 20 ? session.id.slice(0, 20) + '...' : session.id;

        console.log(`   ${typeIcon} ${shortId}  ${sizeStr}  ${dateStr}`);
        totalSessions++;
        totalSize += session.size;
      }
      console.log('');
    }

    console.log(`Total: ${totalSessions} sessions, ${this.formatSize(totalSize)}`);
    console.log('');

    return projects;
  }

  /**
   * Format timestamp as Jan-05-2026-13.56
   */
  formatTimestamp(date = new Date()) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month}-${day}-${year}-${hours}.${minutes}`;
  }

  /**
   * Backup all sessions
   */
  backup(options = {}) {
    const projects = this.getProjects();

    if (projects.length === 0) {
      this.logger.warning('No sessions to backup');
      return null;
    }

    // Create backup directory with timestamp (Jan-05-2026-13.56 format)
    const timestamp = this.formatTimestamp();
    const sessionsBackupPath = path.join(this.backupDir, 'sessions', timestamp);

    this.platform.ensureDir(sessionsBackupPath);

    console.log('');
    this.logger.step('Backing up Claude Code sessions...');
    console.log('');

    let backedUp = 0;
    let totalSize = 0;
    const manifest = {
      timestamp: timestamp,
      timestampISO: new Date().toISOString(),
      version: require('../../package.json').version,
      hostname: this.platform.hostname,
      username: this.platform.username,
      projects: []
    };

    for (const project of projects) {
      const projectBackupPath = path.join(sessionsBackupPath, project.id);
      this.platform.ensureDir(projectBackupPath);

      const projectManifest = {
        id: project.id,
        path: project.path,
        sessions: []
      };

      for (const session of project.sessions) {
        try {
          const destPath = path.join(projectBackupPath, session.file);
          fs.copyFileSync(session.path, destPath);

          projectManifest.sessions.push({
            id: session.id,
            file: session.file,
            size: session.size,
            modified: session.modified.toISOString(),
            type: session.type
          });

          backedUp++;
          totalSize += session.size;
        } catch (error) {
          this.logger.warning(`Failed to backup ${session.id}: ${error.message}`);
        }
      }

      manifest.projects.push(projectManifest);
    }

    // Also backup history.jsonl if exists
    const historyPath = path.join(this.claudeDir, 'history.jsonl');
    if (fs.existsSync(historyPath)) {
      try {
        fs.copyFileSync(historyPath, path.join(sessionsBackupPath, 'history.jsonl'));
        const historyStats = fs.statSync(historyPath);
        manifest.history = {
          size: historyStats.size,
          modified: historyStats.mtime.toISOString()
        };
        totalSize += historyStats.size;
        this.logger.success('Command history backed up');
      } catch (error) {
        this.logger.warning(`Failed to backup history: ${error.message}`);
      }
    }

    // Save manifest
    fs.writeFileSync(
      path.join(sessionsBackupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log('');
    this.logger.success(`Backup complete: ${backedUp} sessions, ${this.formatSize(totalSize)}`);
    this.logger.info(`Location: ${sessionsBackupPath}`);
    console.log('');

    return {
      path: sessionsBackupPath,
      sessions: backedUp,
      size: totalSize,
      timestamp: timestamp
    };
  }

  /**
   * List available backups
   */
  listBackups() {
    const sessionsDir = path.join(this.backupDir, 'sessions');

    if (!fs.existsSync(sessionsDir)) {
      this.logger.warning('No backups found');
      return [];
    }

    const backups = fs.readdirSync(sessionsDir)
      .filter(name => {
        const backupPath = path.join(sessionsDir, name);
        return fs.statSync(backupPath).isDirectory();
      })
      .map(name => {
        const backupPath = path.join(sessionsDir, name);
        const manifestPath = path.join(backupPath, 'manifest.json');

        let manifest = null;
        if (fs.existsSync(manifestPath)) {
          try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          } catch (e) {
            // Ignore parse errors
          }
        }

        const totalSessions = manifest?.projects?.reduce(
          (sum, p) => sum + (p.sessions?.length || 0), 0
        ) || 0;

        return {
          id: name,
          path: backupPath,
          timestamp: manifest?.timestamp || name,
          sessions: totalSessions,
          projects: manifest?.projects?.length || 0
        };
      })
      .sort((a, b) => b.id.localeCompare(a.id));

    if (backups.length === 0) {
      this.logger.warning('No backups found');
      return [];
    }

    console.log('');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[35m                    Available Backups\x1b[0m');
    console.log('\x1b[35m═══════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('');
    console.log(`  🖥️  Host: ${this.platform.hostname}`);
    console.log(`  👤 User: ${this.platform.username}`);
    console.log('');

    for (const backup of backups) {
      console.log(`  📦 ${backup.id}`);
      console.log(`     ${backup.projects} projects, ${backup.sessions} sessions`);
      console.log('');
    }

    return backups;
  }

  /**
   * Restore from backup
   */
  restore(backupId) {
    const backupPath = path.join(this.backupDir, 'sessions', backupId);

    if (!fs.existsSync(backupPath)) {
      this.logger.error(`Backup not found: ${backupId}`);
      return false;
    }

    const manifestPath = path.join(backupPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      this.logger.error('Invalid backup: manifest.json not found');
      return false;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    console.log('');
    this.logger.step(`Restoring from backup: ${backupId}`);
    console.log('');

    let restored = 0;

    for (const project of manifest.projects) {
      // Sessions are directly under the backup path (not in a nested sessions folder)
      const projectBackupPath = path.join(backupPath, project.id);
      const projectDestPath = path.join(this.projectsDir, project.id);

      if (!fs.existsSync(projectBackupPath)) continue;

      this.platform.ensureDir(projectDestPath);

      for (const session of project.sessions) {
        const srcPath = path.join(projectBackupPath, session.file);
        const destPath = path.join(projectDestPath, session.file);

        if (fs.existsSync(srcPath)) {
          try {
            // Don't overwrite existing sessions, create with .restored suffix
            if (fs.existsSync(destPath)) {
              const restoredPath = destPath.replace('.jsonl', '.restored.jsonl');
              fs.copyFileSync(srcPath, restoredPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
            restored++;
          } catch (error) {
            this.logger.warning(`Failed to restore ${session.id}: ${error.message}`);
          }
        }
      }
    }

    // Restore history if exists
    const historyBackupPath = path.join(backupPath, 'history.jsonl');
    if (fs.existsSync(historyBackupPath)) {
      const historyDestPath = path.join(this.claudeDir, 'history.jsonl');
      try {
        if (fs.existsSync(historyDestPath)) {
          fs.copyFileSync(historyBackupPath, historyDestPath + '.restored');
          this.logger.info('History restored as history.jsonl.restored');
        } else {
          fs.copyFileSync(historyBackupPath, historyDestPath);
          this.logger.success('Command history restored');
        }
      } catch (error) {
        this.logger.warning(`Failed to restore history: ${error.message}`);
      }
    }

    console.log('');
    this.logger.success(`Restored ${restored} sessions`);
    this.logger.info('Restart Claude Code to see restored sessions');
    console.log('');

    return true;
  }

  /**
   * Export a specific session to a file
   */
  export(sessionId, outputPath) {
    const projects = this.getProjects();

    let foundSession = null;
    let foundProject = null;

    for (const project of projects) {
      for (const session of project.sessions) {
        if (session.id === sessionId || session.id.startsWith(sessionId)) {
          foundSession = session;
          foundProject = project;
          break;
        }
      }
      if (foundSession) break;
    }

    if (!foundSession) {
      this.logger.error(`Session not found: ${sessionId}`);
      return false;
    }

    const destPath = outputPath || `${foundSession.id}.jsonl`;

    try {
      fs.copyFileSync(foundSession.path, destPath);
      this.logger.success(`Session exported to: ${destPath}`);
      this.logger.info(`Size: ${this.formatSize(foundSession.size)}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to export: ${error.message}`);
      return false;
    }
  }

  /**
   * Format file size
   */
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Format date
   */
  formatDate(date) {
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';

    return date.toISOString().slice(0, 10);
  }
}

module.exports = { SessionManager };
