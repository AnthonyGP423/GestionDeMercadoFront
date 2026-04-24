const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// base pública (host), sin /api ni /api/v1
function getPublicBaseUrl() {
  const api = String(API_BASE_URL || "").replace(/\/+$/, "");
  return api.replace(/\/api(\/v\d+)?$/i, "");
}

const PUBLIC_BASE_URL = getPublicBaseUrl();

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function buildPublicImgSrc(raw?: string) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (isAbsoluteUrl(v)) return v;
  if (v.startsWith("/")) return `${PUBLIC_BASE_URL}${v}`; // /media/...
  return `${PUBLIC_BASE_URL}/${v}`;
}