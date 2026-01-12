/**
 * Ralph - PRD-Driven Autonomous Development
 * Inspired by: https://github.com/snarktank/ralph
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Logger } = require('../utils/logger');
const { Platform } = require('../utils/platform');

class RalphManager {
  constructor() {
    this.logger = new Logger();
    this.platform = new Platform();
    this.assetsDir = path.join(__dirname, '../../assets/ralph');
  }

  /**
   * Initialize Ralph in current directory
   */
  async init() {
    this.logger.step('Initializing Ralph');

    const cwd = process.cwd();
    const files = [
      { src: 'prd.json.example', dest: 'prd.json' },
      { src: 'ralph-prompt.md', dest: 'ralph-prompt.md' },
      { src: 'ralph.sh', dest: 'ralph.sh' }
    ];

    let created = 0;

    for (const file of files) {
      const srcPath = path.join(this.assetsDir, file.src);
      const destPath = path.join(cwd, file.dest);

      if (fs.existsSync(destPath)) {
        this.logger.warning(`${file.dest} already exists, skipping`);
        continue;
      }

      if (!fs.existsSync(srcPath)) {
        this.logger.error(`Template not found: ${file.src}`);
        continue;
      }

      fs.copyFileSync(srcPath, destPath);

      // Make shell script executable
      if (file.dest.endsWith('.sh')) {
        fs.chmodSync(destPath, '755');
      }

      this.logger.success(`Created ${file.dest}`);
      created++;
    }

    // Create progress.txt
    const progressPath = path.join(cwd, 'progress.txt');
    if (!fs.existsSync(progressPath)) {
      fs.writeFileSync(progressPath, `# Progress Log - ${new Date().toISOString()}\n\n`);
      this.logger.success('Created progress.txt');
      created++;
    }

    // Create AGENTS.md if not exists
    const agentsPath = path.join(cwd, 'AGENTS.md');
    if (!fs.existsSync(agentsPath)) {
      fs.writeFileSync(agentsPath, `# AGENTS.md - Code Patterns & Conventions\n\nThis file documents patterns for AI agents working on this codebase.\n\n## Patterns\n\n<!-- Add reusable patterns here -->\n`);
      this.logger.success('Created AGENTS.md');
      created++;
    }

    console.log('');
    this.logger.info(`Created ${created} files`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Edit prd.json with your user stories');
    console.log('  2. Run: zuppaclaude ralph run');
    console.log('');

    return true;
  }

  /**
   * Run Ralph loop
   */
  async run(iterations = 10) {
    const cwd = process.cwd();
    const scriptPath = path.join(cwd, 'ralph.sh');

    if (!fs.existsSync(scriptPath)) {
      this.logger.error('ralph.sh not found. Run: zuppaclaude ralph init');
      return false;
    }

    // Check for prd.json
    const prdPath = path.join(cwd, 'prd.json');
    if (!fs.existsSync(prdPath)) {
      this.logger.error('prd.json not found. Run: zuppaclaude ralph init');
      return false;
    }

    // Check for Claude Code
    if (!this.platform.commandExists('claude')) {
      this.logger.error('Claude Code not found');
      this.logger.info('Install: npm install -g @anthropic-ai/claude-code');
      return false;
    }

    this.logger.step(`Starting Ralph (${iterations} iterations)`);

    return new Promise((resolve) => {
      const child = spawn('bash', [scriptPath, iterations.toString()], {
        cwd,
        stdio: 'inherit',
        env: { ...process.env }
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.logger.success('Ralph completed successfully');
          resolve(true);
        } else {
          this.logger.warning(`Ralph exited with code ${code}`);
          resolve(false);
        }
      });

      child.on('error', (err) => {
        this.logger.error(`Failed to start Ralph: ${err.message}`);
        resolve(false);
      });
    });
  }

  /**
   * Show status
   */
  status() {
    const cwd = process.cwd();
    const prdPath = path.join(cwd, 'prd.json');

    if (!fs.existsSync(prdPath)) {
      this.logger.error('prd.json not found. Run: zuppaclaude ralph init');
      return false;
    }

    try {
      const prd = JSON.parse(fs.readFileSync(prdPath, 'utf8'));

      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`  PRD: ${prd.name || 'Unnamed'}`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');

      if (prd.description) {
        console.log(`  ${prd.description}`);
        console.log('');
      }

      const stories = prd.stories || [];
      let completed = 0;
      let total = stories.length;

      console.log('  Stories:');
      console.log('');

      for (const story of stories) {
        const status = story.passes ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
        const priority = story.priority ? `[P${story.priority}]` : '';
        console.log(`    ${status} ${story.id}: ${story.title} ${priority}`);

        if (story.passes) completed++;
      }

      console.log('');
      console.log(`  Progress: ${completed}/${total} stories complete`);

      const progressPath = path.join(cwd, 'progress.txt');
      if (fs.existsSync(progressPath)) {
        const stats = fs.statSync(progressPath);
        console.log(`  Progress file: ${(stats.size / 1024).toFixed(1)} KB`);
      }

      console.log('');

      if (completed === total && total > 0) {
        console.log('\x1b[32m  All stories complete!\x1b[0m');
      } else {
        console.log(`  Next: zuppaclaude ralph run`);
      }

      console.log('');

      return true;
    } catch (err) {
      this.logger.error(`Failed to parse prd.json: ${err.message}`);
      return false;
    }
  }

  /**
   * Display help
   */
  help() {
    console.log('');
    console.log('Ralph - PRD-Driven Autonomous Development');
    console.log('');
    console.log('Usage:');
    console.log('  zuppaclaude ralph init              Initialize Ralph in current project');
    console.log('  zuppaclaude ralph run [iterations]  Run Ralph loop (default: 10)');
    console.log('  zuppaclaude ralph status            Show PRD status');
    console.log('  zuppaclaude ralph help              Show this help');
    console.log('');
    console.log('Files:');
    console.log('  prd.json          User stories with pass/fail status');
    console.log('  ralph-prompt.md   Instructions for each iteration');
    console.log('  progress.txt      Learnings across iterations');
    console.log('  AGENTS.md         Code patterns & conventions');
    console.log('  ralph.sh          Main loop script');
    console.log('');
    console.log('Credits:');
    console.log('  Inspired by https://github.com/snarktank/ralph');
    console.log('');
  }
}

module.exports = { RalphManager };
