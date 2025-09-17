// Extend the ImportMeta interface to include env
interface ImportMetaEnv {
  MODE: string;
  DEV: boolean;
  BASE_URL: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}

export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development, use relative paths
  if (import.meta.env.MODE === 'development') {
    return `/${cleanPath}`;
  }
  
  // In production, use relative paths starting with ./
  return `./${cleanPath}`;
}

export function getImagePath(path: string): string {
  return getAssetPath(`assets/img/${path}`);
}

export function getCssPath(path: string): string {
  return getAssetPath(`assets/css/${path}`);
}

export function getJsPath(path: string): string {
  return getAssetPath(`assets/js/${path}`);
}
