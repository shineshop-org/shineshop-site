// Script to force reload page and clear cache
(function() {
  // Set a version number in localStorage
  const CURRENT_VERSION = '20240717-v4';
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
  
  // Image error handler - reload images that fail to load
  window.addEventListener('load', function() {
    // Find all images
    const images = document.querySelectorAll('img');
    
    // Add error handler to each image
    images.forEach(function(img) {
      img.addEventListener('error', function() {
        console.log('Image failed to load, attempting to reload:', img.src);
        
        // Add timestamp or random query param to force reload
        const src = img.src;
        const hasParams = src.includes('?');
        const newSrc = hasParams 
          ? `${src}&t=${Date.now()}` 
          : `${src}?t=${Date.now()}`;
          
        // Set new source to reload
        img.src = newSrc;
      });
    });
  });
})(); 