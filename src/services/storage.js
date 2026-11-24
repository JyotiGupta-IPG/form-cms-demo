const KEY = "form-cms-demo-v1";

export function loadStore() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.warn("Could not read saved Form CMS data:", error);
  }
  return null;
}

export function saveStore(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Could not save Form CMS data:", error);
    return false;
  }
}

export function createId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}