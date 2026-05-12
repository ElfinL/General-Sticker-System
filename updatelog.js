// Update Log page - Language switching and version tracking
const SUPPORTED_LANGS = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko'];
// 直接讀取 manifest.json 的版本號（只需改 manifest.json 即可）
const CURRENT_VERSION = chrome.runtime.getManifest().version;
let currentLang = 'zh-TW';

// 自動識別最新版本的邏輯
function findLatestVersion() {
  // 搜索所有語言版本中的所有版本卡片
  const versionCards = document.querySelectorAll('.version-card');
  let latestVersion = null;
  let latestVersionElements = []; // 存儲所有最新版本的元素

  versionCards.forEach(card => {
    const versionNumber = card.querySelector('.version-number');
    if (versionNumber) {
      const version = versionNumber.textContent;
      // 移除 "v" 前綴並比較版本號
      const cleanVersion = version.replace('v', '');
      console.log(`檢查版本: ${cleanVersion}, 當前最新: ${latestVersion}`);
      if (!latestVersion || compareVersions(cleanVersion, latestVersion) > 0) {
        latestVersion = cleanVersion;
        latestVersionElements = [card]; // 重置數組，只保留當前最新版本
      } else if (latestVersion && compareVersions(cleanVersion, latestVersion) === 0) {
        // 如果是相同版本，添加到數組中
        latestVersionElements.push(card);
      }
    }
  });

  console.log(`最終結果: 最新版本=${latestVersion}, 元素數量=${latestVersionElements.length}`);
  return { latestVersion, latestVersionElements };
}

// 比較版本號（返回 1 如果 version1 > version2）
function compareVersions(version1, version2) {
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

// Get stored language
function getStoredLanguage() {
  try {
    const stored = localStorage.getItem('updatelogLang');
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return stored;
    }
  } catch (e) {
    // localStorage not available
  }
  return 'zh-TW';
}

// Save language preference
function saveLanguagePreference(lang) {
  try {
    localStorage.setItem('updatelogLang', lang);
  } catch (e) {
    // localStorage not available
  }
}

// Mark version as seen
function markVersionAsSeen() {
  try {
    localStorage.setItem('lastSeenVersion', CURRENT_VERSION);
  } catch (e) {
    // localStorage not available
  }
}

// Switch language display
function switchLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;

  currentLang = lang;
  saveLanguagePreference(lang);

  // Hide all content sections
  SUPPORTED_LANGS.forEach(l => {
    const el = document.getElementById(`content-${l}`);
    if (el) el.classList.add('hidden');
  });

  // Show selected language content
  const selectedContent = document.getElementById(`content-${lang}`);
  if (selectedContent) {
    selectedContent.classList.remove('hidden');
  }

  // Update button states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// Initialize
function init() {
  // Mark this version as seen
  markVersionAsSeen();

  // 自動高亮最新版本
  const { latestVersionElements } = findLatestVersion();
  if (latestVersionElements && latestVersionElements.length > 0) {
    // 移除所有非最新版本的 NEW 標籤
    document.querySelectorAll('.version-card').forEach(card => {
      const badge = card.querySelector('.version-badge');
      if (badge && !latestVersionElements.includes(card)) {
        badge.remove();
      }
    });

    // 為所有最新版本元素確保有 NEW 標籤
    latestVersionElements.forEach(latestVersionElement => {
      // 檢查是否已經有 badge
      const existingBadge = latestVersionElement.querySelector('.version-badge');
      if (!existingBadge) {
        const badge = document.createElement('div');
        badge.className = 'version-badge';
        badge.textContent = 'NEW';
        latestVersionElement.insertBefore(badge, latestVersionElement.firstChild);
      }
    });
  }

  // Load preferred language
  const storedLang = getStoredLanguage();
  switchLanguage(storedLang);

  // Set up language button listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang) switchLanguage(lang);
    });
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
