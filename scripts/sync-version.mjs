import { readFile, writeFile } from 'node:fs/promises';

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error('Usage: node scripts/sync-version.mjs <semver>');
}

await updateTextFile('src-tauri/Cargo.toml', (source) =>
  source.replace(/^version = ".+"$/m, `version = "${version}"`)
);

await updateTextFile('src-tauri/Cargo.lock', (source) =>
  source.replace(
    /(\[\[package\]\]\nname = "the-stocks-app"\nversion = ")[^"]+(")/,
    `$1${version}$2`
  )
);

await updateJsonFile('src-tauri/tauri.conf.json', (config) => ({
  ...config,
  version
}));

async function updateTextFile(path, update) {
  const source = await readFile(path, 'utf8');
  await writeFile(path, update(source));
}

async function updateJsonFile(path, update) {
  const source = await readFile(path, 'utf8');
  const updated = update(JSON.parse(source));
  await writeFile(path, `${JSON.stringify(updated, null, 2)}\n`);
}
