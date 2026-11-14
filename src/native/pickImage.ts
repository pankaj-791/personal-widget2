import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const IMAGE_DIR = `${FileSystem.documentDirectory}images/`;

export async function pickAndStoreImage(
  slotId: string
): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (result.canceled || result.assets.length === 0) return null;

    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
    const destination = `${IMAGE_DIR}${slotId}-${Date.now()}.jpg`;
    await FileSystem.copyAsync({
      from: result.assets[0].uri,
      to: destination,
    });
    return destination;
  } catch {
    return null;
  }
}

export async function deleteStoredImage(uri: string | null): Promise<void> {
  if (!uri) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Nothing to do. The file may already be gone.
  }
}
