# 🍝 ZuppaClaude

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

**🍎 macOS / 🐧 Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/install.sh | bash
```

**🌍 Alternatif (jsDelivr CDN):**
```bash
curl -fsSL https://cdn.jsdelivr.net/gh/hasankaantan/zuppaclaude@main/install.sh | bash
```

**🪟 Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/install.ps1 | iex
```

### 📋 Gereksinimler

Kurulum scripti eksik bağımlılıkları otomatik kontrol eder:

| Gereksinim | Açıklama |
|------------|----------|
| 💻 **OS** | macOS, Linux veya Windows 10+ |
| 🐍 **Python** | 3.8 veya üzeri |
| 📂 **git** | Versiyon kontrol |
| 🤖 **Claude Code** | Anthropic CLI (önerilir) |

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

### ⚙️ Ayar Yönetimi

ZuppaClaude seçimlerinizi kaydeder ve tekrar kurulumda otomatik kullanır.

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

### 🗑️ Kaldırma

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

**🍎 macOS / 🐧 Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/install.sh | bash
```

**🌍 Alternative (jsDelivr CDN):**
```bash
curl -fsSL https://cdn.jsdelivr.net/gh/hasankaantan/zuppaclaude@main/install.sh | bash
```

**🪟 Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/hasankaantan/zuppaclaude/main/install.ps1 | iex
```

### 📋 Requirements

The installer automatically checks for missing dependencies:

| Requirement | Description |
|-------------|-------------|
| 💻 **OS** | macOS, Linux, or Windows 10+ |
| 🐍 **Python** | 3.8 or higher |
| 📂 **git** | Version control |
| 🤖 **Claude Code** | Anthropic CLI (recommended) |

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

### ⚙️ Settings Management

ZuppaClaude saves your choices and automatically uses them on reinstall.

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

### 🗑️ Uninstall

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

## 📄 License

MIT
