import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const changelogPath = join(rootDir, 'data', 'changelog.json');
const readmePath = join(rootDir, 'README.md');
const startMarker = '<!-- changelog:start -->';
const endMarker = '<!-- changelog:end -->';
const sectionHeading = '<h2>开发日志</h2>';

const changelog = JSON.parse(readFileSync(changelogPath, 'utf8'));
const entries = Array.isArray(changelog.entries) ? changelog.entries : [];

const tableRows = entries.map(({ date, description }) => `    <tr>
      <td>${date}</td>
      <td>${description}</td>
    </tr>`).join('\n');

const changelogSection = `${sectionHeading}

${startMarker}
<table>
  <thead>
    <tr>
      <th align="left">日期</th>
      <th align="left">说明</th>
    </tr>
  </thead>
  <tbody>
${tableRows}
  </tbody>
</table>
${endMarker}
`;

let readme = readFileSync(readmePath, 'utf8');
const sectionIndex = readme.indexOf(sectionHeading);

if (sectionIndex === -1) {
    throw new Error('README.md 中未找到开发日志区块，请确认 <h2>开发日志</h2> 段落存在。');
}

const readmePrefix = readme.slice(0, sectionIndex).replace(/\s*$/, '\n\n');
writeFileSync(readmePath, `${readmePrefix}${changelogSection}`, 'utf8');
console.log(`已根据 ${changelogPath} 更新 README.md 开发日志。`);
