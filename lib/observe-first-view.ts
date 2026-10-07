/** Activate once on viewport entry, ignoring queued observations after cleanup. */
export function observeFirstView(
  element: Element,
  activate: () => void
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    activate();
    return () => {};
  }

  let active = true;
  const observer = new IntersectionObserver((entries) => {
    if (!active || !entries.some((entry) => entry.isIntersecting)) return;
    active = false;
    observer.disconnect();
    activate();
  });
  observer.observe(element);
  return () => {
    active = false;
    observer.disconnect();
  };
}
