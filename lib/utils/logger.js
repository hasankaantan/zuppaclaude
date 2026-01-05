/**
 * Logger utility with colored output
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class Logger {
  constructor() {
    this.colors = colors;
  }

  banner() {
    console.log(`${colors.magenta}
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ███████╗██╗   ██╗██████╗ ██████╗  █████╗                        ║
║   ╚══███╔╝██║   ██║██╔══██╗██╔══██╗██╔══██╗                       ║
║     ███╔╝ ██║   ██║██████╔╝██████╔╝███████║                       ║
║    ███╔╝  ██║   ██║██╔═══╝ ██╔═══╝ ██╔══██║                       ║
║   ███████╗╚██████╔╝██║     ██║     ██║  ██║                       ║
║   ╚══════╝ ╚═════╝ ╚═╝     ╚═╝     ╚═╝  ╚═╝  CLAUDE              ║
║                                                                   ║
║   Claude Code Power-Up Installer                                  ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
${colors.reset}`);
  }

  step(message) {
    console.log(`\n${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}  ${message}${colors.reset}`);
    console.log(`${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}\n`);
  }

  success(message) {
    console.log(`${colors.green}[✓]${colors.reset} ${message}`);
  }

  error(message) {
    console.log(`${colors.red}[✗]${colors.reset} ${message}`);
  }

  warning(message) {
    console.log(`${colors.yellow}[!]${colors.reset} ${message}`);
  }

  info(message) {
    console.log(`${colors.blue}[i]${colors.reset} ${message}`);
  }

  log(message) {
    console.log(message);
  }

  newline() {
    console.log('');
  }

  box(lines, color = 'green') {
    const c = colors[color] || colors.green;
    console.log(`${c}╔═══════════════════════════════════════════════════════════════════╗${colors.reset}`);
    for (const line of lines) {
      const paddedLine = line.padEnd(67);
      console.log(`${c}║${colors.reset}   ${paddedLine}${c}║${colors.reset}`);
    }
    console.log(`${c}╚═══════════════════════════════════════════════════════════════════╝${colors.reset}`);
  }
}

module.exports = { Logger, colors };
