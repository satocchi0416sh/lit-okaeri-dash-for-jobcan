#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Update version across all relevant files
 */
function updateVersion(newVersion) {
  // Update package.json
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated package.json: ${oldVersion} → ${newVersion}`);

  // Update manifest.json
  const manifestPath = join(projectRoot, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  manifest.version = newVersion;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ Updated manifest.json: ${oldVersion} → ${newVersion}`);

  return oldVersion;
}

/**
 * Calculate new version based on type
 */
function calculateNewVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const versionType = args[0] || 'patch';

  if (!['major', 'minor', 'patch'].includes(versionType)) {
    console.error('❌ Invalid version type. Use: major, minor, or patch');
    process.exit(1);
  }

  // Read current version
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const currentVersion = packageJson.version;

  // Calculate new version
  const newVersion = calculateNewVersion(currentVersion, versionType);

  // Update versions
  updateVersion(newVersion);

  console.log(`
🎉 Version bump complete!
   Type: ${versionType}
   From: v${currentVersion}
   To:   v${newVersion}

Next steps:
1. Review changes
2. Commit: git add -A && git commit -m "chore: bump version to v${newVersion}"
3. Push to main branch to trigger release
`);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
