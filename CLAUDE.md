# CLAUDE.md - Aosr Plugin Development Guide

## Project Overview

**Aosr** (Another Obsidian plugin for Spaced Repetition) is a TypeScript-based Obsidian plugin that implements spaced repetition learning using flashcards. The plugin offers minute-level review intervals, rich text support (audio, images, videos), a separate review window, and multiple learning types.

- **Current Version**: 1.1.5
- **Author**: linanwx
- **License**: MIT
- **Minimum Obsidian Version**: 0.12.0
- **Repository**: https://github.com/linanwx/aosr

## Quick Start

```bash
# Install dependencies
yarn install

# Development mode (watch)
yarn dev

# Production build
yarn build

# Bump version
yarn version
```

## Project Structure

The project uses a flat structure with all source files at the root level:

```
aosr/
├── main.ts              # Plugin entry point (AosrPlugin class)
├── api.ts               # Public API for external access
├── view.tsx             # Review UI component (ReviewView)
├── card.ts              # Card model and parsing
├── Pattern.ts           # Abstract pattern base class
├── ParserCollection.ts  # Singleton parser registry
├── patternLine.tsx      # Single/multi-line patterns (:: and ::: formats)
├── patternCloze.tsx     # Cloze deletion patterns (== format)
├── schedule.ts          # Spaced repetition algorithm (SM-2 based)
├── arrangement.ts       # Card arrangement logic (New/Review/Learn/Hard)
├── cardSearch.ts        # Card discovery (#Q blocks)
├── db.ts                # Data persistence (lowdb)
├── annotationParse.ts   # Annotation handling (YAML serialization)
├── tag.ts               # Editor decoration for tags (CodeMirror)
├── cardHead.ts          # Card ID tagging (#AOSR/ID)
├── cardWatcher.ts       # Live card tracking
├── setting.ts           # Configuration UI and state
├── language.ts          # i18n translations (25+ languages)
├── markdown.tsx         # Markdown rendering utilities
├── deck.tsx             # Deck rule engine (json-rules-engine)
├── migrate.ts           # Data migration tool
├── nodeContainer.tsx    # React node wrapper
├── hash.ts              # String hashing (cyrb53)
├── manifest.json        # Plugin manifest
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
├── esbuild.config.mjs   # Build configuration
└── styles.css           # Plugin styles
```

## Architecture

### Core Components

1. **Plugin Entry** (`main.ts`): `AosrPlugin` class extends Obsidian's Plugin, registers views, commands, and settings

2. **Card System**:
   - `card.ts`: Defines `Card` interface and `defaultCard` implementation
   - `cardSearch.ts`: Discovers cards using `#Q` block markers
   - `cardWatcher.ts`: Maintains live card index

3. **Pattern System**:
   - `Pattern.ts`: Abstract base class for all pattern types
   - `patternLine.tsx`: Single-line (`::`) and reversible (`:::`) patterns
   - `patternCloze.tsx`: Cloze deletion (`==`) patterns
   - `ParserCollection.ts`: Singleton registry for pattern parsers

4. **Scheduling** (`schedule.ts`):
   - SM-2-based spaced repetition algorithm
   - Key parameters: `DefaultEase` (250), `EasyBonus` (1), `HardBonus` (1)
   - Three stages: New → Learning → Review

5. **Data Persistence** (`db.ts`):
   - Uses lowdb for JSON storage
   - Default path: `.obsidian/aosr.db`
   - `DatabaseHelper` singleton manages all operations

6. **UI Layer** (`view.tsx`):
   - React-based review interface
   - Material-UI components
   - i18next for internationalization

### Design Patterns

- **Singleton**: `ParserCollection.getInstance()`, `DatabaseHelper.getInstance()`, `getAppInstance()`
- **Factory**: `NewCard()`, `NewCardSearch()`, `NewSchedule()`
- **Observer**: Card watcher for live updates
- **Strategy**: Multiple parser implementations

## Key Technologies

| Category | Technologies |
|----------|-------------|
| Language | TypeScript 4.7 |
| UI Framework | React 18, Material-UI 5 |
| Build Tool | esbuild |
| Database | lowdb (JSON) |
| i18n | i18next |
| Rule Engine | json-rules-engine |
| Editor | CodeMirror 6 |

## Development Guidelines

### Naming Conventions

- **Classes**: PascalCase (`AosrPlugin`, `ReviewView`, `PatternSchedule`)
- **Functions**: camelCase (`newCard()`, `findOutline()`)
- **Constants**: UPPERCASE (`CardIDTag`, `VIEW_TYPE_REVIEW`)
- **DOM Elements**: `contentEl`, `containerEl`, `el`

### File Organization

- One main class/component per file
- Exports at file level (default or named)
- Imports at top of file

### TypeScript Configuration

- Target: ES6
- Module: ESNext
- JSX: react
- Strict null checks enabled
- No implicit any

### Code Patterns

```typescript
// Singleton pattern
class DatabaseHelper {
    private static instance: DatabaseHelper;
    static getInstance(): DatabaseHelper {
        if (!this.instance) {
            this.instance = new DatabaseHelper();
        }
        return this.instance;
    }
}

// Factory pattern
function NewCard(text: string, path: string): Card {
    return defaultCard(text, path);
}

// Interface-based contracts
interface Card {
    ID: string;
    text: string;
    path: string;
    // ...
}
```

### React Patterns

- Functional components with hooks
- JSX in `.tsx` files
- Material-UI component usage
- i18next context (`I18nextProvider`)

## Card Format Reference

### Card Markers

- **Block Card**: Starts with `#Q`, ends with empty line
- **Range Card**: Starts with `#Q`, ends with `#/Q` (supports empty lines)
- **Sub-card separator**: `***`

### Pattern Types

| Pattern | Syntax | Description |
|---------|--------|-------------|
| Single-line | `word::definition` | Question → Answer |
| Reversible | `word:::definition` | Bidirectional |
| Multi-line | `Question\n?\nAnswer` | Multi-line Q&A |
| Cloze | `A ==cloze==` | Fill-in-the-blank |
| Multicloze | `==a== and ==b== #multicloze` | Grouped cloze |

### Regular Expressions

```typescript
// Card detection
/(^#Q\b.*|^#\/Q\b.*)/gm

// Cloze patterns
/==(\S[\s\S]*?)==/gm

// Tag extraction
/#[\/\w]+/gm
```

## Configuration

### User Settings (`setting.ts`)

| Setting | Default | Description |
|---------|---------|-------------|
| `DefaultEase` | 250 | Base difficulty multiplier |
| `EasyBonus` | 1 | Extra days for easy answers |
| `HardBonus` | 1 | Reduced days for hard answers |
| `AosrDbPath` | `.obsidian/aosr.db` | Database location |
| `ExcludeWorkingPathesPattern` | (empty) | Glob patterns to exclude |
| `HideContext` | false | Hide surrounding context |
| `ShowHardCardsArrangement` | false | Enable hard cards mode |

### Customizable Delimiters

| Setting | Default |
|---------|---------|
| `OneLineDelimeter` | `::` |
| `OneLineReversedDelimeter` | `:::` |
| `MultiLineDelimeter` | `?` |

## Build System

### esbuild Configuration

- **Entry**: `main.ts`
- **Output**: `main.js` (CommonJS)
- **Target**: ES2018
- **Source maps**: Inline in dev, none in prod
- **External**: `obsidian`, `electron`, CodeMirror, Node builtins

### Scripts

```bash
# Watch mode development
yarn dev

# Type check + production build
yarn build

# Version bump (updates manifest.json and versions.json)
yarn version
```

## CI/CD

GitHub Actions workflow (`.github/workflows/releases.yml`):

1. Triggers on git tag push
2. Runs on Ubuntu latest with Node 20.x
3. Installs dependencies (`yarn --frozen-lockfile`)
4. Builds (`tsc -noEmit && esbuild production`)
5. Creates GitHub release
6. Uploads: `main.js`, `manifest.json`, `styles.css`, `.zip`

## Testing

**Note**: No automated testing framework is currently configured. Quality assurance relies on:
- ESLint for static analysis
- TypeScript type checking (strict mode)
- Manual testing

## Common Tasks

### Adding a New Pattern Type

1. Create new parser class extending `Pattern` in a new `.tsx` file
2. Implement `parse()` method to detect and extract patterns
3. Register parser in `ParserCollection`
4. Add UI component for review display

### Modifying Scheduling Algorithm

Edit `schedule.ts`:
- `PatternSchedule` interface defines schedule structure
- `Operation` enum defines review actions
- `ReviewOpt` and `LearnOpt` handle review logic

### Adding New Settings

1. Add property to `AOSRSettings` interface in `setting.ts`
2. Add default value to `DEFAULT_SETTINGS`
3. Add UI control in `AOSRSettingTab.display()`
4. Update `loadSettings()` and `saveSettings()` if needed

### Database Operations

```typescript
// Get database instance
const db = DatabaseHelper.getInstance();

// Read card data
const cardDoc = await db.read(cardId);

// Write card data
await db.write(cardId, scheduleData);
```

## Debugging

Enable debug logging by setting `DEBUG_ENABLED = true` in `main.ts`:

```typescript
export var DEBUG_ENABLED = true;

export function debugLog(...args: any[]) {
    if (DEBUG_ENABLED) {
        console.log(...args);
    }
}
```

## Key Files to Understand

For new contributors, start with these files in order:

1. `main.ts` - Plugin lifecycle and registration
2. `card.ts` - Core card data structure
3. `Pattern.ts` - Pattern abstraction
4. `schedule.ts` - Spaced repetition logic
5. `view.tsx` - Review UI
6. `db.ts` - Data persistence

## Known Limitations

- No duplicate pattern content in the same file (relies on unique string matching)
- "Strict line breaks" mode in Obsidian may cause issues (recommended off)
- No automated test coverage
- Code comments primarily in Chinese

## External Resources

- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [json-rules-engine Documentation](https://github.com/CacheControl/json-rules-engine)
- [lowdb Documentation](https://github.com/typicode/lowdb)
- [Material-UI Documentation](https://mui.com/material-ui/)
