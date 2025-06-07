// Script to force reload page and clear cache
(function() {
  // Set a version number in localStorage
  const CURRENT_VERSION = '20240717-v3';
  const STORED_VERSION = localStorage.getItem('site-version');
  
  // Clear all cache storage
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      cacheNames.forEach(function(cacheName) {
        caches.delete(cacheName);
      });
    });
  }
  
  // Clear localStorage except necessary items
  const preserve = ['shineshop-theme'];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !preserve.includes(key)) {
      localStorage.removeItem(key);
    }
  }
  
  // Set current version
  localStorage.setItem('site-version', CURRENT_VERSION);
  
  // Force reload if version changed
  if (STORED_VERSION !== CURRENT_VERSION) {
    console.log('New version detected, reloading page...');
    window.location.reload(true);
  }
})(); 