#!/usr/bin/env node
// ゴジラ — Claude Code statusline
// Two lines: identity band + telemetry bars (context / 5-hour / weekly).
'use strict';
const fs = require('fs');
const path = require('path');

// --- Neo-Tokyo palette -----------------------------------------------------
const E = String.fromCharCode(27) + '[';
const C = {
  mag:    E + '38;2;255;0;135m',
  magHi:  E + '38;2;255;145;205m',
  magLo:  E + '38;2;122;24;74m',
  cyan:   E + '38;2;0;240;255m',
  cyanLo: E + '38;2;20;92;104m',
  green:  E + '38;2;0;255;102m',
  yellow: E + '38;2;255;230;0m',
  yelLo:  E + '38;2;110;98;18m',
  red:    E + '38;2;255;23;68m',
  redLo:  E + '38;2;110;22;40m',
  violet: E + '38;2;176;38;255m',
  slate:  E + '38;2;73;84;112m',
  ice:    E + '38;2;240;244;248m',
  r:      E + '0m',
};
const BS = String.fromCharCode(92); // backslash, kept out of string literals
const SEP = C.slate + '│' + C.r; // │
const DOT = C.slate + '·' + C.r; // ·

// --- helpers ---------------------------------------------------------------
const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

function bar(pct, width) {
  width = width || 10;
  const p = clamp(pct);
  const filled = Math.min(width, Math.round((p / 100) * width));
  let on = C.mag, off = C.magLo;
  if (p >= 90) { on = C.red; off = C.redLo; }
  else if (p >= 75) { on = C.yellow; off = C.yelLo; }
  return on + '█'.repeat(filled) + off + '░'.repeat(width - filled) + C.r;
}

function pctText(pct) {
  const p = clamp(pct);
  const col = p >= 90 ? C.red : p >= 75 ? C.yellow : C.ice;
  return col + String(Math.round(p)).padStart(3) + '%' + C.r;
}

function until(epochSeconds) {
  if (!epochSeconds) return '';
  const ms = epochSeconds * 1000 - Date.now();
  if (ms <= 0) return '';
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  if (d > 0) return d + 'd' + h + 'h';
  if (h > 0) return h + 'h' + String(mm).padStart(2, '0') + 'm';
  return mm + 'm';
}

function gitBranch(startDir) {
  try {
    let dir = startDir;
    for (let i = 0; i < 12 && dir; i++) {
      const g = path.join(dir, '.git');
      let head = null;
      try {
        const st = fs.statSync(g);
        if (st.isDirectory()) {
          head = path.join(g, 'HEAD');
        } else if (st.isFile()) {
          const m = /^gitdir:\s*(.+)$/m.exec(fs.readFileSync(g, 'utf8'));
          if (m) head = path.join(path.resolve(dir, m[1].trim()), 'HEAD');
        }
      } catch (e) { /* no .git at this level */ }
      if (head && fs.existsSync(head)) {
        const txt = fs.readFileSync(head, 'utf8').trim();
        const ref = /^ref:\s*refs\/heads\/(.+)$/.exec(txt);
        return ref ? ref[1] : txt.slice(0, 7);
      }
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
  } catch (e) { /* ignore */ }
  return null;
}

function prettyDir(dir) {
  if (!dir) return '';
  const home = process.env.USERPROFILE || process.env.HOME || '';
  let d = dir;
  if (home && d.toLowerCase().startsWith(home.toLowerCase())) {
    d = '~' + d.slice(home.length);
  }
  const parts = d.split(/[\\/]/).filter(Boolean);
  if (parts.length <= 3) return parts.join(BS);
  return [parts[0], '…'].concat(parts.slice(-2)).join(BS);
}

// --- render ----------------------------------------------------------------
function render(d) {
  const model = (d.model && (d.model.display_name || d.model.id)) || 'Claude';
  const effort = d.effort && d.effort.level;
  const cwd = (d.workspace && d.workspace.current_dir) || d.cwd || '';
  const branch = gitBranch(cwd);
  const cost = d.cost && d.cost.total_cost_usd;

  // ---- line 1: identity band
  const l1 = [];
  l1.push(C.mag + 'ゴジラ' + C.r);

  let badge = C.magHi + '⚡ ' + model + C.r;
  if (effort) badge += ' ' + C.slate + '·' + C.r + ' ' + C.violet + effort + C.r;
  if (d.fast_mode) badge += ' ' + C.yellow + '▸fast' + C.r;
  if (d.thinking && d.thinking.enabled) badge += ' ' + C.cyanLo + '✶' + C.r;
  l1.push(badge);

  if (cwd) {
    let loc = C.cyan + '󰉋 ' + prettyDir(cwd) + C.r;
    if (branch) loc += '  ' + C.mag + ' ' + branch + C.r;
    l1.push(loc);
  }
  if (typeof cost === 'number' && cost > 0) {
    l1.push(C.yellow + '$' + cost.toFixed(2) + C.r);
  }

  // ---- line 2: telemetry bars
  const l2 = [];
  const ctx = d.context_window;
  if (ctx && typeof ctx.used_percentage === 'number') {
    const size = ctx.context_window_size
      ? C.slate + '/' + Math.round(ctx.context_window_size / 1000) + 'k' + C.r
      : '';
    l2.push(C.slate + 'CTX' + C.r + ' ' + bar(ctx.used_percentage) + ' ' + pctText(ctx.used_percentage) + size);
  }

  const rl = d.rate_limits || {};
  const spans = [['5H', rl.five_hour], ['WK', rl.seven_day]];
  for (const pair of spans) {
    const label = pair[0], span = pair[1];
    if (!span || typeof span.used_percentage !== 'number') continue;
    const reset = until(span.resets_at);
    const tail = reset ? ' ' + C.slate + '󰑐' + reset + C.r : '';
    l2.push(C.slate + label + C.r + ' ' + bar(span.used_percentage) + ' ' + pctText(span.used_percentage) + tail);
  }

  const out = [l1.join('  ' + SEP + '  ')];
  if (l2.length) out.push(C.slate + '╰' + C.r + ' ' + l2.join('  ' + DOT + '  '));
  return out.join('\n');
}

// --- entrypoint ------------------------------------------------------------
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { input += c; });
process.stdin.on('end', () => {
  let out;
  try {
    out = render(JSON.parse(input.replace(/^﻿/, '')));
  } catch (e) {
    out = C.mag + 'ゴジラ' + C.r;
  }
  process.stdout.write(out);
});
