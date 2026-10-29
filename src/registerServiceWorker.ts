/** Registers the offline cache. Production builds only, so dev and tests never see a stale worker. */
export function registerServiceWorker(
  env: { PROD: boolean; BASE_URL: string } = import.meta.env,
  nav: Pick<Navigator, "serviceWorker"> | { serviceWorker?: undefined } = navigator,
): Promise<ServiceWorkerRegistration | null> {
  if (!env.PROD || !nav.serviceWorker) return Promise.resolve(null);
  return nav.serviceWorker
    .register(`${env.BASE_URL}sw.js`, { scope: env.BASE_URL })
    .catch(() => null);
}
