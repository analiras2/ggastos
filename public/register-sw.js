(function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Skip local dev servers so Metro hot reload is never served from a stale cache.
  // Add ?sw=1 to the URL to test the service worker locally.
  var isLocalHost = ['localhost', '127.0.0.1'].indexOf(location.hostname) !== -1;
  if (isLocalHost && location.search.indexOf('sw=1') === -1) {
    return;
  }

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (error) {
      console.warn('Service worker registration failed.', error);
    });
  });
})();
