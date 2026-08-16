export function faviconFor(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export function guessTitle(domain: string) {
  const host = domain.split(".")[0] ?? domain;
  return host.replace(/[-_]+/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function parseSiteUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname) return null;
    const domain = parsed.hostname.replace(/^www\./, "");
    return {
      url: parsed.toString(),
      domain,
      title: guessTitle(domain),
      favicon: faviconFor(domain),
    };
  } catch {
    return null;
  }
}
