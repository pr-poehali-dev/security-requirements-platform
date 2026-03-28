/**
 * Централизованная конфигурация API endpoints.
 * В cloud-режиме используются URL из func2url.json (functions.poehali.dev).
 * В local-режиме используется локальный сервер (по умолчанию http://localhost:8000).
 *
 * Для локального режима бэкенд должен быть запущен через Docker Compose
 * и отдавать каждую функцию по пути /<function-name>.
 * Пример: http://localhost:8000/domains, http://localhost:8000/products и т.д.
 */

export type ApiMode = "cloud" | "local";

export type EndpointKey =
  | "domains"
  | "tech-domains"
  | "technologies"
  | "requirements"
  | "tech-solutions"
  | "hardening"
  | "arch-templates"
  | "products"
  | "db-check";

const CLOUD_URLS: Record<EndpointKey, string> = {
  "domains":        "https://functions.poehali.dev/4c8bda83-18c3-4fd9-bc7f-0764a3511177",
  "tech-domains":   "https://functions.poehali.dev/e3873998-84e0-4b31-af68-5128ea37c246",
  "technologies":   "https://functions.poehali.dev/e6d8d44f-ba31-4ab3-a776-b40bafbcf7e8",
  "requirements":   "https://functions.poehali.dev/f955567c-3548-4631-a5b8-e590ad2c5177",
  "tech-solutions": "https://functions.poehali.dev/99caeca9-833c-478d-b201-139ec6d861a2",
  "hardening":      "https://functions.poehali.dev/5c18ac6b-dfc4-444c-a0bf-7f9f6d9656cf",
  "arch-templates": "https://functions.poehali.dev/642afaea-b869-4493-9e87-b7d0e8d368fa",
  "products":       "https://functions.poehali.dev/83496f55-f31c-499a-8d22-618295a6da0f",
  "db-check":       "https://functions.poehali.dev/5622928b-26f7-4ee8-b41f-03e43463dcc9",
};

const LS_MODE_KEY   = "sa_apiMode";
const LS_BASE_KEY   = "sa_localBase";

export const DEFAULT_LOCAL_BASE = "http://localhost:8000";

export function getApiMode(): ApiMode {
  return (localStorage.getItem(LS_MODE_KEY) as ApiMode) || "cloud";
}

export function getLocalBase(): string {
  return localStorage.getItem(LS_BASE_KEY) || DEFAULT_LOCAL_BASE;
}

export function setApiMode(mode: ApiMode): void {
  localStorage.setItem(LS_MODE_KEY, mode);
}

export function setLocalBase(base: string): void {
  localStorage.setItem(LS_BASE_KEY, base.replace(/\/$/, ""));
}

/**
 * Возвращает полный URL для указанного endpoint с учётом текущего режима.
 * В local-режиме: <localBase>/<key>
 * В cloud-режиме: URL из CLOUD_URLS
 */
export function getApiUrl(key: EndpointKey): string {
  if (getApiMode() === "local") {
    return `${getLocalBase()}/${key}`;
  }
  return CLOUD_URLS[key];
}

/** Возвращает все URL в виде объекта (удобно для диагностики) */
export function getAllUrls(): Record<EndpointKey, string> {
  const keys = Object.keys(CLOUD_URLS) as EndpointKey[];
  return Object.fromEntries(keys.map((k) => [k, getApiUrl(k)])) as Record<EndpointKey, string>;
}
