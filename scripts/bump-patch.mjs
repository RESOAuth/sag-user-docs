#!/usr/bin/env node
// A patch release corrects the version that is already out, so it edits
// that version's files in place: rename versioned_docs/ and
// versioned_sidebars/, and rewrite the existing versions.json entry, rather
// than adding a new one. A minor or major release is a new cut and goes
// through `npm run cut-version` instead, which snapshots docs/.
import fs from 'node:fs';
import path from 'node:path';

const newVersion = process.argv[2];
if (!newVersion) {
  console.error('Usage: npm run bump-patch -- <new version, e.g. 0.1.1>');
  process.exit(1);
}

const versionsPath = path.resolve('versions.json');
const versions = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));
const oldVersion = versions[0];

if (!oldVersion) {
  console.error('versions.json has no cut versions yet. Run `npm run cut-version` first.');
  process.exit(1);
}

const minorOf = (v) => v.split('.').slice(0, 2).join('.');
if (minorOf(oldVersion) !== minorOf(newVersion) || oldVersion === newVersion) {
  console.error(
    `${newVersion} is not a patch of ${oldVersion}. A patch only changes the last number; ` +
      'a minor or major bump is a new cut, so use `npm run cut-version` instead.',
  );
  process.exit(1);
}

const oldDocsDir = path.resolve('versioned_docs', `version-${oldVersion}`);
const newDocsDir = path.resolve('versioned_docs', `version-${newVersion}`);
const oldSidebar = path.resolve('versioned_sidebars', `version-${oldVersion}-sidebars.json`);
const newSidebar = path.resolve('versioned_sidebars', `version-${newVersion}-sidebars.json`);

fs.renameSync(oldDocsDir, newDocsDir);
fs.renameSync(oldSidebar, newSidebar);

versions[0] = newVersion;
fs.writeFileSync(versionsPath, `${JSON.stringify(versions, null, 2)}\n`);

console.log(`${oldVersion} -> ${newVersion}. Edit the docs under versioned_docs/version-${newVersion}/ and commit.`);
