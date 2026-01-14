# 🍝 ZuppaClaude

[![npm version](https://badge.fury.io/js/zuppaclaude.svg)](https://www.npmjs.com/package/zuppaclaude)
[![npm downloads](https://img.shields.io/npm/dm/zuppaclaude.svg)](https://www.npmjs.com/package/zuppaclaude)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ⚡ Claude Code için tek komutla kurulum paketi - SuperClaude + Spec Kit + Claude-Z + Claude HUD

<p align="center">
  <a href="#-türkçe">🇹🇷 Türkçe</a> •
  <a href="#-english">🇬🇧 English</a>
</p>

---

## 🇹🇷 Türkçe

### 📦 Nedir?

ZuppaClaude, Claude Code deneyiminizi güçlendiren araçları tek komutla kurar:

| Araç | Açıklama |
|------|----------|
| ⚡ **SuperClaude** | 30+ slash komutu ile gelişmiş iş akışları |
| 📋 **Spec Kit** | Spec-driven development CLI aracı |
| 🌐 **Claude-Z** | z.ai backend desteği (opsiyonel) |
| 📊 **Claude HUD** | Gerçek zamanlı durum göstergesi (opsiyonel) |
| 📝 **CLAUDE.md** | Optimize edilmiş sistem talimatları |

### 🚀 Hızlı Kurulum

#### 📦 NPM ile (Önerilen)
```bash
npx zuppaclaude
```

Veya global kurulum:
```bash
npm install -g zuppaclaude
zuppaclaude
```

#### 🐚 Shell ile

**🍎 macOS / 🐧 Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/install.sh | bash
```

**🌍 Alternatif (jsDelivr CDN):**
```bash
curl -fsSL https://cdn.jsdelivr.net/gh/hasankaantan/zuppaclaude@main/install.sh | bash
```

**🪟 Windows:**
```powershell
# Winget ile (önerilen)
winget install Anthropic.ClaudeCode

# veya PowerShell script ile
irm https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/install.ps1 | iex
```

### 📋 Gereksinimler

Kurulum scripti eksik bağımlılıkları otomatik kontrol eder:

| Gereksinim | Açıklama |
|------------|----------|
| 💻 **OS** | macOS, Linux veya Windows 10+ |
| 📦 **Node.js** | 18.0 veya üzeri |
| 🐍 **Python** | 3.8 veya üzeri |
| 📂 **git** | Versiyon kontrol |
| 🤖 **Claude Code** | v2.x (önerilir) |

### ✅ Kurulum Sonrası

1. 🔄 **Claude Code'u yeniden başlat**

2. ⚡ **SuperClaude test et:**
   ```
   /sc:help
   ```

3. 📋 **Spec Kit test et:**
   ```bash
   specify --help
   ```

4. 🌐 **Claude-Z test et (kurulduysa):**
   ```bash
   claude-z
   ```

### ⚡ SuperClaude Komutları

#### 🎯 Planlama & Tasarım
| Komut | Açıklama |
|-------|----------|
| `/sc:brainstorm` | 💡 Fikir geliştirme |
| `/sc:design` | 🏗️ Mimari tasarım |
| `/sc:estimate` | ⏱️ Zaman/kaynak tahmini |
| `/sc:spec-panel` | 📑 Spesifikasyon paneli |

#### 💻 Geliştirme
| Komut | Açıklama |
|-------|----------|
| `/sc:implement` | ⚙️ Kod implementasyonu |
| `/sc:build` | 🔨 Build ve derleme |
| `/sc:improve` | ✨ Kod iyileştirme |
| `/sc:explain` | 📖 Kod açıklama |

#### 🧪 Test & Kalite
| Komut | Açıklama |
|-------|----------|
| `/sc:test` | 🧪 Test oluşturma |
| `/sc:analyze` | 🔍 Kod analizi |
| `/sc:troubleshoot` | 🐛 Hata ayıklama |
| `/sc:reflect` | 🪞 Retrospektif |

#### 📊 Proje Yönetimi
| Komut | Açıklama |
|-------|----------|
| `/sc:task` | ✅ Görev yönetimi |
| `/sc:workflow` | 🔄 İş akışı yönetimi |
| `/sc:pm` | 📈 Proje yönetimi |

### 📋 Spec Kit İş Akışı

```bash
specify init         # 🚀 Proje başlat
specify constitution # 📜 Proje kuralları
specify spec         # 📋 Fonksiyonel gereksinimler
specify plan         # 📐 Teknik plan
specify tasks        # ✅ Görev breakdown
```

### 🌐 Claude-Z (z.ai Backend)

Kurulum sırasında Z.AI API key'inizi girmeniz istenir ([z.ai](https://z.ai) adresinden alın).

```bash
# z.ai backend ile Claude Code çalıştır
claude-z
```

**🔌 Sağladığı MCP Serverlar:**
| Server | Açıklama |
|--------|----------|
| `web-search-prime` | 🔍 Gelişmiş web arama |
| `web-reader` | 📄 Web sayfası okuma |
| `zread` | 📚 Doküman okuma |
| `zai-mcp-server` | 🔗 Z.AI MCP entegrasyonu |

### 📊 Claude HUD (Durum Göstergesi)

Claude Code'a gerçek zamanlı statusline ekler. Kurulum sırasında etkinleştirmeyi seçebilirsiniz.

**📈 Gösterdikleri:**
- 📊 Context window kullanımı
- 🔧 Aktif araçlar ve dosya işlemleri
- 🤖 Çalışan agent'lar
- ✅ Todo/görev ilerlemesi

**⚙️ Kurulum sonrası:**
```bash
setup-claude-hud  # Talimatları gösterir
```

Ardından Claude Code içinde:
```
/plugin marketplace add jarrodwatts/claude-hud
/plugin install claude-hud
/claude-hud:setup
```

### 🩺 Sistem Kontrolü (Doctor)

ZuppaClaude kurulumunuzun sağlığını kontrol edin:

```bash
npx zuppaclaude doctor    # 🔍 Sistem kontrolü
```

Veya Claude Code içinden:
```
/zc:doctor
```

**🔍 Kontrol Edilen Öğeler:**
| Kategori | Kontroller |
|----------|------------|
| 💻 Sistem | OS, Node.js versiyonu, disk alanı |
| 🤖 Claude Code | Versiyon, güncellik, dizin |
| 📦 ZuppaClaude | Versiyon, güncellik, ayarlar |
| 🧩 Bileşenler | SuperClaude, Spec Kit, Claude-Z, HUD, rclone |
| 🔧 Bağımlılıklar | Git, Python, Pip |
| 🌐 Ortam | Environment variables |

### ⚙️ Ayar Yönetimi

ZuppaClaude seçimlerinizi kaydeder ve tekrar kurulumda otomatik kullanır.

**📦 NPM ile:**
```bash
npx zuppaclaude settings show              # 👁️ Ayarları görüntüle
npx zuppaclaude settings export ~/backup.json  # 💾 Dışa aktar
npx zuppaclaude settings import ~/backup.json  # 📥 İçe aktar
npx zuppaclaude settings reset             # 🔄 Fabrika ayarları
```

**🐚 Shell ile:**
```bash
./zc-settings.sh show              # 👁️ Ayarları görüntüle
./zc-settings.sh export ~/backup.json  # 💾 Dışa aktar
./zc-settings.sh import ~/backup.json  # 📥 İçe aktar
./zc-settings.sh reset             # 🔄 Fabrika ayarları
```

**✨ Özellikler:**
| Özellik | Açıklama |
|---------|----------|
| 💾 Otomatik kayıt | Kurulum sonrası tercihler kaydedilir |
| ⚡ Hızlı kurulum | Önceki ayarlarla tek komutla kurulum |
| 🔐 API key koruması | Base64 encoded saklama |
| 🛡️ Uninstall koruması | Kaldırırken ayarları koruma opsiyonu |

### 💾 Yedekleme & Geri Yükleme

Claude Code session'larınızı ve ayarlarınızı yedekleyin. Context kaybı, format veya compacting durumlarında kullanışlı.

**🔄 Tam Yedekleme (Sessions + Ayarlar):**
```bash
npx zuppaclaude backup              # 💾 Lokal tam yedek
npx zuppaclaude backup --cloud gdrive  # ☁️ Google Drive'a yedekle
npx zuppaclaude restore <id>        # ♻️ Yedekten geri yükle
npx zuppaclaude restore <id> --cloud gdrive  # ☁️ Cloud'dan geri yükle
```

**📋 Sadece Session İşlemleri:**
```bash
npx zuppaclaude session list        # 📋 Tüm session'ları listele
npx zuppaclaude session backup      # 💾 Sadece session'ları yedekle
npx zuppaclaude session backups     # 📦 Mevcut yedekleri listele
```

### ☁️ Cloud Yedekleme (rclone)

Google Drive, Dropbox, OneDrive, S3, SFTP ve 40+ cloud servise yedekleme.

```bash
# Kurulum
brew install rclone      # macOS
rclone config            # Remote ayarla (gdrive, dropbox vs.)

# Kullanım
npx zuppaclaude cloud setup         # 📖 Kurulum talimatları
npx zuppaclaude cloud remotes       # 📋 Mevcut remote'ları listele
npx zuppaclaude backup --cloud gdrive  # ☁️ Yedekle ve upload et
npx zuppaclaude cloud backups gdrive   # 📦 Cloud'daki yedekleri listele
```

**✨ Özellikler:**
| Özellik | Açıklama |
|---------|----------|
| 🔒 Güvenli restore | Mevcut session'lar üzerine yazılmaz |
| 📜 Tam yedek | Sessions + Settings + History |
| ☁️ 40+ cloud | rclone ile Google Drive, Dropbox, S3, SFTP... |
| 🔐 Encryption | rclone encryption desteği |

### 🤖 Ralph (Otonom PRD Geliştirme)

PRD (Product Requirements Document) dosyasındaki user story'leri otomatik olarak implement eden otonom AI agent döngüsü.

**🚀 Başlatma:**
```bash
npx zuppaclaude ralph init       # 📁 Proje dosyalarını oluştur
npx zuppaclaude ralph run        # 🔄 Döngüyü başlat (varsayılan: 10 iterasyon)
npx zuppaclaude ralph run 20     # 🔄 20 iterasyon ile çalıştır
npx zuppaclaude ralph status     # 📊 PRD durumunu göster
```

**📂 Dosyalar:**
| Dosya | Açıklama |
|-------|----------|
| `prd.json` | User story'ler ve pass/fail durumu |
| `ralph-prompt.md` | Her iterasyona verilen talimatlar |
| `progress.txt` | Öğrenilen şeyler (kalıcı bellek) |
| `AGENTS.md` | Kod pattern'leri ve convention'lar |

**🔄 Nasıl Çalışır:**
1. PRD'den en yüksek öncelikli incomplete story'yi seçer
2. Minimal, focused değişiklikler yapar
3. Quality check'leri çalıştırır (typecheck, lint, test)
4. `progress.txt`'e öğrenilenleri yazar
5. Story'yi `passes: true` olarak işaretler
6. Sonraki iterasyona geçer

> 💡 [snarktank/ralph](https://github.com/snarktank/ralph) projesinden esinlenilmiştir.

### 🗑️ Kaldırma

**📦 NPM ile:**
```bash
npx zuppaclaude uninstall
```

**🐚 Shell ile:**

**🍎 macOS / 🐧 Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/uninstall.sh | bash
```

**🪟 Windows:**
```powershell
irm https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/uninstall.ps1 | iex
```

### 📁 Dosya Konumları

| Dosya | 🍎🐧 macOS/Linux | 🪟 Windows |
|-------|------------------|------------|
| ⚡ SuperClaude | `~/.claude/commands/sc/` | `%USERPROFILE%\.claude\commands\sc\` |
| 📝 Konfigürasyon | `~/.claude/CLAUDE.md` | `%USERPROFILE%\.claude\CLAUDE.md` |
| 🌐 Claude-Z | `~/.local/bin/claude-z` | `%USERPROFILE%\.local\bin\claude-z.cmd` |
| 📊 Claude HUD | `~/.local/bin/setup-claude-hud` | `%USERPROFILE%\.local\bin\setup-claude-hud.cmd` |
| 🔧 Z.AI Config | `~/.config/zai/` | `%USERPROFILE%\.config\zai\` |
| ⚙️ Ayarlar | `~/.config/zuppaclaude/` | `%USERPROFILE%\.config\zuppaclaude\` |

---

## 🇬🇧 English

### 📦 What is it?

ZuppaClaude installs tools to supercharge your Claude Code experience with a single command:

| Tool | Description |
|------|-------------|
| ⚡ **SuperClaude** | 30+ slash commands for enhanced workflows |
| 📋 **Spec Kit** | Spec-driven development CLI tool |
| 🌐 **Claude-Z** | z.ai backend support (optional) |
| 📊 **Claude HUD** | Real-time status display (optional) |
| 📝 **CLAUDE.md** | Optimized system instructions |

### 🚀 Quick Install

#### 📦 Via NPM (Recommended)
```bash
npx zuppaclaude
```

Or install globally:
```bash
npm install -g zuppaclaude
zuppaclaude
```

#### 🐚 Via Shell

**🍎 macOS / 🐧 Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/install.sh | bash
```

**🌍 Alternative (jsDelivr CDN):**
```bash
curl -fsSL https://cdn.jsdelivr.net/gh/hasankaantan/zuppaclaude@main/install.sh | bash
```

**🪟 Windows:**
```powershell
# With Winget (recommended)
winget install Anthropic.ClaudeCode

# or PowerShell script
irm https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/install.ps1 | iex
```

### 📋 Requirements

The installer automatically checks for missing dependencies:

| Requirement | Description |
|-------------|-------------|
| 💻 **OS** | macOS, Linux, or Windows 10+ |
| 📦 **Node.js** | 18.0 or higher |
| 🐍 **Python** | 3.8 or higher |
| 📂 **git** | Version control |
| 🤖 **Claude Code** | v2.x (recommended) |

### ✅ After Installation

1. 🔄 **Restart Claude Code**

2. ⚡ **Test SuperClaude:**
   ```
   /sc:help
   ```

3. 📋 **Test Spec Kit:**
   ```bash
   specify --help
   ```

4. 🌐 **Test Claude-Z (if installed):**
   ```bash
   claude-z
   ```

### ⚡ SuperClaude Commands

#### 🎯 Planning & Design
| Command | Description |
|---------|-------------|
| `/sc:brainstorm` | 💡 Idea development |
| `/sc:design` | 🏗️ Architectural design |
| `/sc:estimate` | ⏱️ Time/resource estimation |
| `/sc:spec-panel` | 📑 Specification panel |

#### 💻 Development
| Command | Description |
|---------|-------------|
| `/sc:implement` | ⚙️ Code implementation |
| `/sc:build` | 🔨 Build and compile |
| `/sc:improve` | ✨ Code improvement |
| `/sc:explain` | 📖 Code explanation |

#### 🧪 Testing & Quality
| Command | Description |
|---------|-------------|
| `/sc:test` | 🧪 Test creation |
| `/sc:analyze` | 🔍 Code analysis |
| `/sc:troubleshoot` | 🐛 Debugging |
| `/sc:reflect` | 🪞 Retrospective |

#### 📊 Project Management
| Command | Description |
|---------|-------------|
| `/sc:task` | ✅ Task management |
| `/sc:workflow` | 🔄 Workflow management |
| `/sc:pm` | 📈 Project management |

### 📋 Spec Kit Workflow

```bash
specify init         # 🚀 Initialize project
specify constitution # 📜 Project rules
specify spec         # 📋 Functional requirements
specify plan         # 📐 Technical plan
specify tasks        # ✅ Task breakdown
```

### 🌐 Claude-Z (z.ai Backend)

During installation, you'll be asked for your Z.AI API key (get it from [z.ai](https://z.ai)).

```bash
# Run Claude Code with z.ai backend
claude-z
```

**🔌 Provided MCP Servers:**
| Server | Description |
|--------|-------------|
| `web-search-prime` | 🔍 Enhanced web search |
| `web-reader` | 📄 Web page reading |
| `zread` | 📚 Document reading |
| `zai-mcp-server` | 🔗 Z.AI MCP integration |

### 📊 Claude HUD (Status Display)

Adds a real-time statusline to Claude Code. You can enable it during installation.

**📈 What it shows:**
- 📊 Context window usage
- 🔧 Active tools and file operations
- 🤖 Running agents
- ✅ Todo/task progress

**⚙️ After installation:**
```bash
setup-claude-hud  # Shows instructions
```

Then inside Claude Code:
```
/plugin marketplace add jarrodwatts/claude-hud
/plugin install claude-hud
/claude-hud:setup
```

### 🩺 System Health Check (Doctor)

Check your ZuppaClaude installation health:

```bash
npx zuppaclaude doctor    # 🔍 System health check
```

Or from within Claude Code:
```
/zc:doctor
```

**🔍 What it Checks:**
| Category | Checks |
|----------|--------|
| 💻 System | OS, Node.js version, disk space |
| 🤖 Claude Code | Version, updates, directory |
| 📦 ZuppaClaude | Version, updates, settings |
| 🧩 Components | SuperClaude, Spec Kit, Claude-Z, HUD, rclone |
| 🔧 Dependencies | Git, Python, Pip |
| 🌐 Environment | Environment variables |

### ⚙️ Settings Management

ZuppaClaude saves your choices and automatically uses them on reinstall.

**📦 Via NPM:**
```bash
npx zuppaclaude settings show              # 👁️ View settings
npx zuppaclaude settings export ~/backup.json  # 💾 Export
npx zuppaclaude settings import ~/backup.json  # 📥 Import
npx zuppaclaude settings reset             # 🔄 Reset to defaults
```

**🐚 Via Shell:**

**🍎🐧 macOS/Linux:**
```bash
./zc-settings.sh show              # 👁️ View settings
./zc-settings.sh export ~/backup.json  # 💾 Export
./zc-settings.sh import ~/backup.json  # 📥 Import
./zc-settings.sh reset             # 🔄 Reset to defaults
```

**🪟 Windows:**
```powershell
.\zc-settings.ps1 show
.\zc-settings.ps1 export ~\backup.json
.\zc-settings.ps1 import ~\backup.json
.\zc-settings.ps1 reset
```

**✨ Features:**
| Feature | Description |
|---------|-------------|
| 💾 Auto-save | Preferences saved after installation |
| ⚡ Quick reinstall | One-command reinstall with previous settings |
| 🔐 API key protection | Base64 encoded storage |
| 🛡️ Uninstall protection | Option to preserve settings when uninstalling |

### 💾 Backup & Restore

Backup your Claude Code sessions and settings. Useful for context loss, formatting, or conversation compacting.

**🔄 Full Backup (Sessions + Settings):**
```bash
npx zuppaclaude backup              # 💾 Local full backup
npx zuppaclaude backup --cloud gdrive  # ☁️ Backup to Google Drive
npx zuppaclaude restore <id>        # ♻️ Restore from backup
npx zuppaclaude restore <id> --cloud gdrive  # ☁️ Restore from cloud
```

**📋 Session-only Operations:**
```bash
npx zuppaclaude session list        # 📋 List all sessions
npx zuppaclaude session backup      # 💾 Backup sessions only
npx zuppaclaude session backups     # 📦 List available backups
```

### ☁️ Cloud Backup (rclone)

Backup to Google Drive, Dropbox, OneDrive, S3, SFTP, and 40+ cloud services.

```bash
# Setup
brew install rclone      # macOS
rclone config            # Configure remote (gdrive, dropbox, etc.)

# Usage
npx zuppaclaude cloud setup         # 📖 Setup instructions
npx zuppaclaude cloud remotes       # 📋 List configured remotes
npx zuppaclaude backup --cloud gdrive  # ☁️ Backup and upload
npx zuppaclaude cloud backups gdrive   # 📦 List cloud backups
```

**✨ Features:**
| Feature | Description |
|---------|-------------|
| 🔒 Safe restore | Existing sessions are not overwritten |
| 📜 Full backup | Sessions + Settings + History |
| ☁️ 40+ clouds | Google Drive, Dropbox, S3, SFTP via rclone |
| 🔐 Encryption | rclone encryption support |

### 🤖 Ralph (Autonomous PRD Development)

Autonomous AI agent loop that implements user stories from a PRD (Product Requirements Document) automatically.

**🚀 Getting Started:**
```bash
npx zuppaclaude ralph init       # 📁 Create project files
npx zuppaclaude ralph run        # 🔄 Start loop (default: 10 iterations)
npx zuppaclaude ralph run 20     # 🔄 Run with 20 iterations
npx zuppaclaude ralph status     # 📊 Show PRD status
```

**📂 Files:**
| File | Description |
|------|-------------|
| `prd.json` | User stories with pass/fail status |
| `ralph-prompt.md` | Instructions for each iteration |
| `progress.txt` | Learnings (persistent memory) |
| `AGENTS.md` | Code patterns and conventions |

**🔄 How it Works:**
1. Selects highest priority incomplete story from PRD
2. Makes minimal, focused changes
3. Runs quality checks (typecheck, lint, test)
4. Documents learnings in `progress.txt`
5. Marks story as `passes: true`
6. Moves to next iteration

> 💡 Inspired by [snarktank/ralph](https://github.com/snarktank/ralph)

### 🗑️ Uninstall

**📦 Via NPM:**
```bash
npx zuppaclaude uninstall
```

**🐚 Via Shell:**

**🍎 macOS / 🐧 Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/uninstall.sh | bash
```

**🪟 Windows:**
```powershell
irm https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/uninstall.ps1 | iex
```

### 📁 File Locations

| File | 🍎🐧 macOS/Linux | 🪟 Windows |
|------|------------------|------------|
| ⚡ SuperClaude | `~/.claude/commands/sc/` | `%USERPROFILE%\.claude\commands\sc\` |
| 📝 Configuration | `~/.claude/CLAUDE.md` | `%USERPROFILE%\.claude\CLAUDE.md` |
| 🌐 Claude-Z | `~/.local/bin/claude-z` | `%USERPROFILE%\.local\bin\claude-z.cmd` |
| 📊 Claude HUD | `~/.local/bin/setup-claude-hud` | `%USERPROFILE%\.local\bin\setup-claude-hud.cmd` |
| 🔧 Z.AI Config | `~/.config/zai/` | `%USERPROFILE%\.config\zai\` |
| ⚙️ Settings | `~/.config/zuppaclaude/` | `%USERPROFILE%\.config\zuppaclaude\` |

### 🔧 Troubleshooting

#### ❌ "specify" command not found
**🍎🐧 macOS/Linux:** Add to `~/.zshrc` or `~/.bashrc`:
```bash
export PATH="$HOME/.local/bin:$PATH"
```
**🪟 Windows:** Restart PowerShell or add `%USERPROFILE%\.local\bin` to PATH.

#### ❌ SuperClaude commands not showing
🔄 Restart Claude Code completely (quit and reopen).

#### ❌ Execution Policy Error (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🙏 Credits

| Project | Author |
|---------|--------|
| [Claude Code](https://claude.ai/code) | Anthropic |
| [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) | SuperClaude Org |
| [Spec Kit](https://github.com/github/spec-kit) | GitHub |
| [z.ai](https://z.ai) | Z.AI |
| [Claude HUD](https://github.com/jarrodwatts/claude-hud) | Jarrod Watts |
| [Ralph](https://github.com/snarktank/ralph) | Snarktank |

## 📄 License

MIT
