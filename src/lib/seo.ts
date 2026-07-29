export const fallbackSiteUrl = "https://www.xn--v69av2fwuhz41a.com/";

export function normalizeSiteUrl(value: string) {
  try {
    return new URL(value).toString();
  } catch {
    return fallbackSiteUrl;
  }
}

export function getAbsoluteUrl(siteUrl: string, path = "/") {
  return new URL(path, normalizeSiteUrl(siteUrl)).toString();
}
