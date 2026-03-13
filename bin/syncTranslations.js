#!/usr/bin/env node

/**
 * Sync translation files from the code-dot-org monorepo.
 *
 * Usage:
 *   node bin/syncTranslations.js                          # from GitHub API (default branch)
 *   node bin/syncTranslations.js --local ~/code/code-dot-org  # from local checkout
 *
 * Downloads all non-English locale JSON files from apps/i18n/fish/ and saves
 * them to i18n/locales/ in this repo.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const LOCALES_DIR = path.resolve(__dirname, '..', 'i18n', 'locales');
const GITHUB_API =
  'https://api.github.com/repos/code-dot-org/code-dot-org/contents/apps/i18n/fish';

function parseArgs() {
  const args = process.argv.slice(2);
  const localIdx = args.indexOf('--local');
  if (localIdx !== -1) {
    const localPath = args[localIdx + 1];
    if (!localPath) {
      console.error('Error: --local requires a path argument');
      process.exit(1);
    }
    return {mode: 'local', repoPath: localPath};
  }
  return {mode: 'github'};
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
}

function syncFromLocal(repoPath) {
  const fishDir = path.join(repoPath, 'apps', 'i18n', 'fish');
  if (!fs.existsSync(fishDir)) {
    console.error(`Error: ${fishDir} does not exist`);
    process.exit(1);
  }

  ensureDir(LOCALES_DIR);

  const files = fs.readdirSync(fishDir).filter(
    f => f.endsWith('.json') && f !== 'en_us.json'
  );

  for (const file of files) {
    fs.copyFileSync(path.join(fishDir, file), path.join(LOCALES_DIR, file));
  }

  console.log(`Synced ${files.length} locale files from ${fishDir}`);
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers: {'User-Agent': 'ml-activities-sync'}}, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        resolve(JSON.parse(data));
      });
      res.on('error', reject);
    });
  });
}

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers: {'User-Agent': 'ml-activities-sync'}}, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        resolve(data);
      });
      res.on('error', reject);
    });
  });
}

async function syncFromGitHub() {
  ensureDir(LOCALES_DIR);

  console.log('Fetching file list from GitHub...');
  const contents = await fetchJSON(GITHUB_API);

  const localeFiles = contents.filter(
    f => f.name.endsWith('.json') && f.name !== 'en_us.json'
  );

  console.log(`Found ${localeFiles.length} locale files. Downloading...`);

  let downloaded = 0;
  for (const file of localeFiles) {
    const raw = await fetchRaw(file.download_url);
    fs.writeFileSync(path.join(LOCALES_DIR, file.name), raw);
    downloaded++;
    if (downloaded % 10 === 0) {
      console.log(`  ${downloaded}/${localeFiles.length}...`);
    }
  }

  console.log(`Synced ${downloaded} locale files from GitHub`);
}

async function main() {
  const opts = parseArgs();
  if (opts.mode === 'local') {
    syncFromLocal(opts.repoPath);
  } else {
    await syncFromGitHub();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
