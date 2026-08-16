import { readFileSync } from 'node:fs';

const files = ['.env.example', 'env.example', 'apps/mobile/.env.example'];
const forbiddenPatterns = [
  /service_role/i,
  /EXPO_PUBLIC_[A-Z0-9_]*(?:SERVICE_ROLE|SECRET)/,
  /SUPABASE_ACCESS_TOKEN=(?!replace_me_in_github_secrets)/,
  /SUPABASE_DB_PASSWORD=(?!replace_me_in_github_secrets)/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9_-]{20,}/,
];
const publicAppUrlFiles = ['.env.example', 'apps/mobile/.env.example'];

for (const file of files) {
  const content = readFileSync(file, 'utf8');

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      throw new Error(`${file} contains a forbidden secret-like value matching ${pattern}`);
    }
  }
}

for (const file of publicAppUrlFiles) {
  const content = readFileSync(file, 'utf8');
  const publicAppUrl = content.match(/^EXPO_PUBLIC_APP_URL=(.+)$/m)?.[1];

  if (!publicAppUrl || !publicAppUrl.startsWith('https://')) {
    throw new Error(`${file} must define EXPO_PUBLIC_APP_URL as an HTTPS origin`);
  }
}

console.log('Environment example files contain placeholders only.');
