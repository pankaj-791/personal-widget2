import { requireNativeModule } from 'expo';

export type AppInfo = {
  packageName: string;
  label: string;
  icon: string;
};

type NativeInstalledApps = {
  getInstalledApps(): Promise<AppInfo[]>;
  launchApp(packageName: string): Promise<boolean>;
  isAppInstalled(packageName: string): Promise<boolean>;
};

let native: NativeInstalledApps | null = null;
try {
  native = requireNativeModule<NativeInstalledApps>('InstalledApps');
} catch {
  native = null;
}

export async function getInstalledApps(): Promise<AppInfo[]> {
  if (!native) return [];
  try {
    return await native.getInstalledApps();
  } catch {
    return [];
  }
}

export async function launchApp(packageName: string): Promise<boolean> {
  if (!native) return false;
  try {
    return await native.launchApp(packageName);
  } catch {
    return false;
  }
}

export async function isAppInstalled(packageName: string): Promise<boolean> {
  if (!native) return false;
  try {
    return await native.isAppInstalled(packageName);
  } catch {
    return false;
  }
}

export function iconUri(app: { icon: string }): string {
  return `data:image/png;base64,${app.icon}`;
}
