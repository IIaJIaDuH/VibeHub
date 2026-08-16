import { useEffect, useMemo, useRef, useState } from "react";
import { matchesQuery } from "../../lib/search";
import { useHub } from "../../state/HubContext";
import type { Route } from "../../types/hub";
import { IconSearch } from "../icons";
import styles from "./CommandPalette.module.css";

const RECENT_KEY = "vibehub-recent-searches";

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, 6) : [];
  } catch {
    return [];
  }
}

function writeRecent(term: string) {
  const next = [term, ...readRecent().filter((item) => item !== term)].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function CommandPalette() {
  const { searchOpen, setSearchOpen, models, tools, setRoute } = useHub();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    setRecent(readRecent());
    setQ("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const modelHits = models
      .filter((m) => matchesQuery(`${m.name} ${m.provider} ${m.searchText}`, q))
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        title: m.name,
        meta: m.provider,
        kind: "Модель" as const,
        route: "models" as Route,
      }));
    const toolHits = tools
      .filter((t) => matchesQuery(`${t.name} ${t.typeLabel} ${t.searchText}`, q))
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.name,
        meta: `${t.typeLabel} · ${t.category}`,
        kind: "Инструмент" as const,
        route: "tools" as Route,
      }));
    return [...modelHits, ...toolHits];
  }, [q, models, tools]);

  if (!searchOpen) return null;

  const go = (route: Route, term?: string) => {
    if (term?.trim()) writeRecent(term.trim());
    setRoute(route);
    setSearchOpen(false);
  };

  return (
    <div className={styles.overlay} onClick={() => setSearchOpen(false)} role="presentation">
      <div
        className={styles.panel}
        role="dialog"
        aria-label="Поиск"
        onClick={(e) => e.stopPropagation()}
      >
        <label className={styles.field}>
          <IconSearch width={20} height={20} />
          <input
            ref={inputRef}
            value={q}
            placeholder="Поиск моделей и инструментов..."
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].route, q);
            }}
          />
          <kbd>Esc</kbd>
        </label>
        {!q.trim() && recent.length > 0 ? (
          <div className={styles.block}>
            <p>Недавние</p>
            {recent.map((term) => (
              <button key={term} type="button" onClick={() => setQ(term)}>
                {term}
              </button>
            ))}
          </div>
        ) : null}
        {q.trim() ? (
          <div className={styles.block}>
            <p>Результаты</p>
            {results.length === 0 ? (
              <span className={styles.empty}>Ничего не найдено</span>
            ) : (
              results.map((item) => (
                <button
                  key={`${item.kind}-${item.id}`}
                  type="button"
                  onClick={() => go(item.route, q)}
                >
                  <strong>{item.title}</strong>
                  <em>
                    {item.kind} · {item.meta}
                  </em>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
