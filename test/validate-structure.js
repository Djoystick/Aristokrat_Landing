const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
console.log('🎭 Начинаем валидацию проекта Театральной студии «Артистократ»...\n');

let hasErrors = false;

function checkFile(relPath, required = true) {
  const full = path.join(root, relPath);
  const exists = fs.existsSync(full);
  if (!exists) {
    if (required) {
      console.error(`❌ Отсутствует обязательный файл: ${relPath}`);
      hasErrors = true;
    } else {
      console.warn(`⚠️ Файл не найден: ${relPath}`);
    }
  } else {
    const sz = fs.statSync(full).size;
    console.log(`✓ [${(sz / 1024).toFixed(1)} KB] ${relPath}`);
  }
}

// 1. Проверка конфигураций и документации
console.log('--- 1. Проверка конфигураций и документации ---');
checkFile('package.json');
checkFile('vercel.json');
checkFile('PROJECT_MEMORY.md');
checkFile('CHANGELOG.md');

// 2. Проверка публичных файлов
console.log('\n--- 2. Проверка веб-страницы и ресурсов ---');
checkFile('public/index.html');
checkFile('public/css/style.css');
checkFile('public/js/spotlight.js');
checkFile('public/js/gallery-data.js');
checkFile('public/js/main.js');
checkFile('public/images/logo.png');

// 3. Синтаксическая проверка JS файлов
console.log('\n--- 3. Синтаксическая проверка JS скриптов ---');
const jsFiles = [
  'server.js',
  'public/js/spotlight.js',
  'public/js/gallery-data.js',
  'public/js/main.js'
];

jsFiles.forEach(file => {
  try {
    execSync(`node -c "${path.join(root, file)}"`);
    console.log(`✓ Синтаксис корректен: ${file}`);
  } catch (err) {
    console.error(`❌ Синтаксическая ошибка в ${file}:`, err.message);
    hasErrors = true;
  }
});

// 4. Проверка картинок из gallery-data.js
console.log('\n--- 4. Проверка целостности медиа-ассетов ---');
const galleryCode = fs.readFileSync(path.join(root, 'public/js/gallery-data.js'), 'utf8');
const imgMatches = [...galleryCode.matchAll(/['"](\/images\/[^'"]+)['"]/g)].map(m => m[1]);
const uniqueImgs = [...new Set(imgMatches)];

uniqueImgs.forEach(imgPath => {
  const rel = path.join('public', imgPath.replace(/^\//, ''));
  checkFile(rel);
});

console.log('\n==========================================');
if (hasErrors) {
  console.error('❌ Валидация завершилась с ошибками!');
  process.exit(1);
} else {
  console.log('✨ Валидация проекта успешно пройдена! Все компоненты и файлы в наличии.');
  process.exit(0);
}
