import { faviconFor } from "../lib/siteUrl";
import type { QuickAccessSite } from "../types/hub";

function site(id: string, title: string, url: string, domain: string): QuickAccessSite {
  return { id, title, url, domain, favicon: faviconFor(domain) };
}

export const DEFAULT_QUICK_ACCESS: QuickAccessSite[] = [
  site("openrouter", "OpenRouter", "https://openrouter.ai", "openrouter.ai"),
  site("huggingface", "Hugging Face", "https://huggingface.co", "huggingface.co"),
  site("upcoming", "Upcoming Models", "https://models.dev", "models.dev"),
  site("aa", "Artificial Analysis", "https://artificialanalysis.ai", "artificialanalysis.ai"),
];
