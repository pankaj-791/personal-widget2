import { requireNativeModule } from 'expo';

type NativeImageFilter = {
  applyFilter(
    uri: string,
    matrix: number[],
    maxSize: number
  ): Promise<string>;
};

let native: NativeImageFilter | null = null;
try {
  native = requireNativeModule<NativeImageFilter>('ImageFilter');
} catch {
  native = null;
}

export async function applyFilter(
  uri: string,
  matrix: number[],
  maxSize: number = 1080
): Promise<string | null> {
  if (!native) return null;
  try {
    return await native.applyFilter(uri, matrix, maxSize);
  } catch {
    return null;
  }
}
