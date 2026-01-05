/**
 * User prompts utility
 */

const readline = require('readline');

class Prompts {
  constructor() {
    this.rl = null;
  }

  createInterface() {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }
    return this.rl;
  }

  close() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * Ask a yes/no question
   */
  async confirm(question, defaultYes = true) {
    const rl = this.createInterface();
    const suffix = defaultYes ? '[Y/n]' : '[y/N]';

    return new Promise((resolve) => {
      rl.question(`${question} ${suffix} `, (answer) => {
        const normalized = answer.trim().toLowerCase();
        if (normalized === '') {
          resolve(defaultYes);
        } else {
          resolve(normalized === 'y' || normalized === 'yes');
        }
      });
    });
  }

  /**
   * Ask for text input
   */
  async input(question, defaultValue = '') {
    const rl = this.createInterface();
    const suffix = defaultValue ? ` [${defaultValue}]` : '';

    return new Promise((resolve) => {
      rl.question(`${question}${suffix}: `, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  /**
   * Ask for password (hidden input)
   */
  async password(question) {
    const rl = this.createInterface();

    return new Promise((resolve) => {
      // Disable echo
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }

      let password = '';
      process.stdout.write(`${question}: `);

      const onData = (char) => {
        char = char.toString();

        switch (char) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            if (process.stdin.isTTY) {
              process.stdin.setRawMode(false);
            }
            process.stdin.removeListener('data', onData);
            console.log('');
            resolve(password);
            break;
          case '\u0003': // Ctrl+C
            if (process.stdin.isTTY) {
              process.stdin.setRawMode(false);
            }
            process.exit();
            break;
          case '\u007F': // Backspace
            password = password.slice(0, -1);
            break;
          default:
            password += char;
        }
      };

      process.stdin.on('data', onData);
      process.stdin.resume();
    });
  }

  /**
   * Ask a multiple choice question
   */
  async select(question, options) {
    const rl = this.createInterface();

    console.log(`\n${question}`);
    options.forEach((opt, i) => {
      console.log(`  ${i + 1}) ${opt}`);
    });

    return new Promise((resolve) => {
      rl.question('Select option: ', (answer) => {
        const index = parseInt(answer, 10) - 1;
        if (index >= 0 && index < options.length) {
          resolve(index);
        } else {
          resolve(0); // Default to first option
        }
      });
    });
  }

  /**
   * Ask for a number within a range
   */
  async number(question, min = 1, max = 10) {
    const rl = this.createInterface();

    return new Promise((resolve) => {
      rl.question(`${question} `, (answer) => {
        const num = parseInt(answer, 10);
        if (!isNaN(num) && num >= min && num <= max) {
          resolve(num);
        } else {
          resolve(null);
        }
      });
    });
  }
}

module.exports = { Prompts };
