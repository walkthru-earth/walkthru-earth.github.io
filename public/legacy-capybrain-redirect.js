// Shared by both legacy static documents; preserve encoded query and fragment.
(() => {
  const destination = `/capybrain${window.location.search}${window.location.hash}`;
  for (const link of document.querySelectorAll('a[href="/capybrain"]')) {
    link.setAttribute('href', destination);
  }
  window.location.replace(destination);
})();
