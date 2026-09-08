# Claudezilla Rice

A **Neo-Tokyo Godzilla** terminal rice for [Claude Code](https://claude.com/claude-code),
fastfetch, and PowerShell on Windows. Hot-magenta / electric-cyan cyberpunk
palette, a two-line telemetry statusline (context / 5-hour / weekly budget
bars), a custom Claude Code theme, kaiju spinner verbs, and a truecolor
half-block Godzilla plate for fastfetch and the CLI launch banners.

> ゴジラ ⚡ KAIJU PROTOCOL // 01

## Screenshots

_Add your own to `docs/` — e.g. `docs/fastfetch.png`, `docs/claude-statusline.png`._

## The palette

| Role            | Hex        | RGB              |
| --------------- | ---------- | ---------------- |
| Hot magenta     | `#FF0087`  | `255, 0, 135`    |
| Electric cyan   | `#00F0FF`  | `0, 240, 255`    |
| Neon violet     | `#B026FF`  | `176, 38, 255`   |
| Neon green      | `#00FF66`  | `0, 255, 102`    |
| Laser yellow    | `#FFE600`  | `255, 230, 0`    |
| Laser red       | `#FF1744`  | `255, 23, 68`    |
| Deep slate      | `#495470`  | `73, 84, 112`    |
| Ice white       | `#F0F4F8`  | `240, 244, 248`  |
| Void background | `#08090F`  | `8, 9, 15`       |

## What's in here

| Path                                   | What it is                                                            |
| -------------------------------------- | -------------------------------------------------------------------- |
| `claude-code/themes/neo-tokyo.json`    | Claude Code custom theme (`custom:neo-tokyo`)                         |
| `claude-code/bin/statusline.js`        | Two-line statusline: identity band + CTX / 5H / WK budget bars       |
| `claude-code/settings.sample.json`     | The `settings.json` keys to merge in                                 |
| `fastfetch/config.jsonc`               | fastfetch layout — SYSTEM TELEMETRY / KAIJU PROTOCOL frame           |
| `fastfetch/godzilla.ans`               | Godzilla bust, 66×25, truecolor half-block (default logo)            |
| `fastfetch/godzilla-full.ans`          | Full figure, 60×33                                                   |
| `fastfetch/banner-mini.ans`            | 40×14 plate used by the PowerShell CLI launch banners               |
| `fastfetch/ansiart.py`, `compose.py`   | Regenerate the `.ans` art from a source image (see below)            |
| `powershell/Microsoft.PowerShell_profile.ps1` | Prompt, PSReadLine neon syntax colors, aliases, `claude`/`agy` launch banners, `Set-GodzillaLogo` |
| `oh-my-posh/cyberpunk.omp.json`        | Matching oh-my-posh prompt (magenta/cyan powerline)                  |
| `oh-my-posh/dracula.omp.json`          | Alternate prompt theme                                               |

## Requirements

- A **Nerd Font** terminal font. This rice was tuned against **JetBrainsMono Nerd Font**.
- A **truecolor** terminal (Windows Terminal, WezTerm, etc.).
- [fastfetch](https://github.com/fastfetch-cli/fastfetch), [oh-my-posh](https://ohmyposh.dev/),
  and optionally `eza`, `bat`, `zoxide`, `fzf`, `Terminal-Icons`, `PSReadLine`.
- Claude Code (for the theme + statusline).

## Install

Paths below assume Windows (`%USERPROFILE%` = `C:\Users\YOU`). Adjust for your OS.

### Claude Code theme + statusline

1. Copy `claude-code/themes/neo-tokyo.json` → `~/.claude/themes/neo-tokyo.json`
2. Copy `claude-code/bin/statusline.js` → `~/.claude/bin/statusline.js`
3. Merge the keys from `claude-code/settings.sample.json` into `~/.claude/settings.json`,
   fixing the absolute path in `statusLine.command` to your home directory.

Claude Code custom themes are real but undocumented: `~/.claude/themes/<slug>.json`
holds `{ name, base, overrides }`, where `overrides` values accept `rgb(r,g,b)`,
`#rrggbb`, `ansi256(n)`, or `ansi:<name>`. **Unknown override keys are dropped
silently** — if a color doesn't take, the key name is probably wrong.

The statusline reads `context_window` and `rate_limits` from the payload Claude
Code pipes in, and renders bars that turn yellow at 75% and red at 90%. Node is
the only dependency.

### fastfetch

1. Copy the four `fastfetch/*.ans` files and `config.jsonc` → `~/.config/fastfetch/`
2. Edit `logo.source` in `config.jsonc` to the **absolute** path of `godzilla.ans`
   (fastfetch does not expand `~` or env vars there).
3. Because the logo type is `file-raw`, `logo.width` / `logo.height` must be set
   by hand — they're already correct for the shipped art (66×25 bust, 60×33 full).

### PowerShell

Append `powershell/Microsoft.PowerShell_profile.ps1` to your profile
(`$PROFILE`), or copy it in. It:

- inits oh-my-posh with `~/.config/oh-my-posh/active.omp.json` (falls back to `cyberpunk.omp.json`),
- sets cyberpunk-neon PSReadLine syntax colors and FZF colors,
- aliases `ls`/`ll`/`lt` → `eza`, `cat` → `bat` (only if installed),
- wraps `claude` and `agy` to print a kaiju launch banner (suppressed automatically
  in print / piped / non-interactive mode),
- runs `fastfetch` on interactive shell start,
- adds `Set-GodzillaLogo bust|full` to swap the fastfetch art,
- adds `Set-PoshTheme <name>` to swap the oh-my-posh prompt.

> **Windows PowerShell 5.1**: save the profile as **UTF-8 with BOM**, or the
> `ゴジラ` glyphs mangle. PowerShell 7 is fine either way.

### oh-my-posh

Copy `oh-my-posh/*.json` → `~/.config/oh-my-posh/`. The profile picks
`cyberpunk.omp.json` by default; `Set-PoshTheme dracula` swaps to the alternate.

## Regenerating the Godzilla art

The source image is **not** included (it's a still from a copyrighted film —
supply your own). `ansiart.py` renders an image to a truecolor half-block `.ans`
at a given column width; `compose.py` stitches the caption rule underneath.
Both expect their input filenames/crop boxes edited at the top of the file for
your source. Rough flow:

```
cd ~/.config/fastfetch
python ansiart.py      # image -> *.ans half-block render
python compose.py      # add the "ゴジラ … KAIJU PROTOCOL 01" caption band
```

Any 16:9-ish portrait works. Keep the render width at 66 (bust) / 60 (full) to
match the `config.jsonc` logo dimensions, or update both.

## Traps this rice already hit for you

1. **JetBrainsMono Nerd Font is missing the obvious geometry glyphs** — no
   `▰ ▱ ↺ ⎇ ✻ ⏵`. This rice uses `█ ░` plus Nerd Font private-use icons
   (`󰑐`  ``) instead. Check any new glyph with `fontTools` `getBestCmap()`
   before shipping it. `ゴジラ` itself is not in the font and survives only on
   font fallback.
2. **Never global-replace `"width": N` in `config.jsonc`** — `display.key.width`,
   `display.bar.width`, and `colors.block.width` all match too. `Set-GodzillaLogo`
   scopes its rewrite to the `logo` block only; do the same by hand.
3. **Don't write these config files with bash heredocs** — backslashes and
   non-ASCII get mangled. Use an editor or a Python `open(...).write(...)`.

## Credits

- Godzilla / ゴジラ is a trademark and character owned by Toho Co., Ltd. This
  repo ships only low-resolution terminal ANSI renders as personal
  customization; no source imagery is redistributed.
- Palette and layout are original. Prompt built on
  [oh-my-posh](https://ohmyposh.dev/).

## License

[MIT](LICENSE) for the configs, scripts, and theme files.
