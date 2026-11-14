import { loadJson, saveJson } from '../storage/storage';
import { deleteStoredImage } from '../native/pickImage';
import { CustomWidgetSpec } from './widgetSpec';

const KEY = 'customWidgets.v1';
const MAX_WIDGETS = 30;

export async function loadWidgets(): Promise<CustomWidgetSpec[]> {
  const list = await loadJson<CustomWidgetSpec[]>(KEY, []);
  return Array.isArray(list) ? list : [];
}

// Adds a new widget, or updates it if the same id already exists.
// Returns false if the library is full.
export async function saveWidget(spec: CustomWidgetSpec): Promise<boolean> {
  const list = await loadWidgets();
  const index = list.findIndex((w) => w.id === spec.id);
  if (index >= 0) {
    list[index] = spec;
  } else {
    if (list.length >= MAX_WIDGETS) return false;
    list.push(spec);
  }
  await saveJson(KEY, list);
  return true;
}

export async function deleteWidget(id: string): Promise<void> {
  const list = await loadWidgets();
  const target = list.find((w) => w.id === id);
  if (target) await deleteStoredImage(target.imageUri);
  await saveJson(
    KEY,
    list.filter((w) => w.id !== id)
  );
}
