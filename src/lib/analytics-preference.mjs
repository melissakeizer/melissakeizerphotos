export function toggleAnalyticsPreference(storage) {
  if (storage.getItem('umami.disabled') === '1') storage.removeItem('umami.disabled');
  else storage.setItem('umami.disabled', '1');
}
