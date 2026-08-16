import { useEffect, useRef, useState } from "react";
import { DEFAULT_QUICK_ACCESS } from "../../data/quickAccess";
import { parseSiteUrl } from "../../lib/siteUrl";
import type { QuickAccessSite } from "../../types/hub";
import { Button } from "../Button/Button";
import { IconMore, IconPlus } from "../icons";
import styles from "./QuickAccess.module.css";

const STORAGE_KEY = "vibehub-quick-access";

function loadSites(): QuickAccessSite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_QUICK_ACCESS;
    const parsed = JSON.parse(raw) as QuickAccessSite[];
    if (!Array.isArray(parsed)) return DEFAULT_QUICK_ACCESS;
    return parsed;
  } catch {
    return DEFAULT_QUICK_ACCESS;
  }
}

export function QuickAccess() {
  const [sites, setSites] = useState<QuickAccessSite[]>(loadSites);
  const [modal, setModal] = useState<"add" | QuickAccessSite | null>(null);

  const persist = (next: QuickAccessSite[]) => {
    setSites(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <section className={styles.section} aria-labelledby="quick-access-title">
      <h2 id="quick-access-title">Быстрый доступ</h2>
      <ul className={styles.grid}>
        {sites.map((site) => (
          <li key={site.id}>
            <SiteTile
              site={site}
              onEdit={() => setModal(site)}
              onRemove={() => persist(sites.filter((item) => item.id !== site.id))}
            />
          </li>
        ))}
        <li>
          <button type="button" className={styles.add} onClick={() => setModal("add")}>
            <span className={styles.addMark} aria-hidden>
              <IconPlus width={16} height={16} />
            </span>
            <span className={styles.meta}>
              <strong>Добавить</strong>
            </span>
          </button>
        </li>
      </ul>
      {modal ? (
        <SiteModal
          site={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(draft) => {
            if (modal === "add") persist([...sites, draft]);
            else persist(sites.map((item) => (item.id === draft.id ? draft : item)));
            setModal(null);
          }}
        />
      ) : null}
    </section>
  );
}

function SiteTile({
  site,
  onEdit,
  onRemove,
}: {
  site: QuickAccessSite;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const [broken, setBroken] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menu]);

  return (
    <div className={styles.tileWrap} ref={wrap}>
      <a
        className={styles.tile}
        href={site.url}
        target="_blank"
        rel="noreferrer"
      >
        {broken ? (
          <span className={styles.fallback} aria-hidden>
            {site.title.slice(0, 1)}
          </span>
        ) : (
          <img
            className={styles.icon}
            src={site.favicon}
            alt=""
            width={20}
            height={20}
            onError={() => setBroken(true)}
          />
        )}
        <span className={styles.meta}>
          <strong>{site.title}</strong>
          <em>{site.domain}</em>
        </span>
      </a>
      <button
        type="button"
        className={styles.more}
        title="Ещё"
        aria-label="Ещё"
        onClick={(e) => {
          e.preventDefault();
          setMenu((v) => !v);
        }}
      >
        <IconMore width={16} height={16} />
      </button>
      {menu ? (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              onEdit();
            }}
          >
            Изменить
          </button>
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              onRemove();
            }}
          >
            Удалить
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SiteModal({
  site,
  onClose,
  onSave,
}: {
  site: QuickAccessSite | null;
  onClose: () => void;
  onSave: (site: QuickAccessSite) => void;
}) {
  const [url, setUrl] = useState(site?.url ?? "");
  const [title, setTitle] = useState(site?.title ?? "");
  const [autoTitle, setAutoTitle] = useState(!site);
  const parsed = parseSiteUrl(url);

  const titleGuess = parsed?.title;

  useEffect(() => {
    if (autoTitle && titleGuess) setTitle(titleGuess);
  }, [autoTitle, titleGuess]);

  const submit = () => {
    if (!parsed) return;
    onSave({
      id: site?.id ?? `site-${Date.now()}`,
      url: parsed.url,
      domain: parsed.domain,
      favicon: parsed.favicon,
      title: title.trim() || parsed.title,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-labelledby="qa-title"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
        <label className={styles.field}>
          Ссылка
          <input
            autoFocus
            value={url}
            placeholder="https://..."
            onChange={(e) => {
              setUrl(e.target.value);
              if (!autoTitle) return;
            }}
          />
        </label>
        <label className={styles.field}>
          Название
          <input
            value={title}
            placeholder={parsed?.title ?? "Название"}
            onChange={(e) => {
              setAutoTitle(false);
              setTitle(e.target.value);
            }}
          />
        </label>
        {parsed ? (
          <p className={styles.hint}>
            {parsed.domain}
            {parsed.favicon ? " · favicon подставится автоматически" : ""}
          </p>
        ) : url.trim() ? (
          <p className={styles.hint}>Проверьте ссылку</p>
        ) : null}
        <div className={styles.actions}>
          <Button variant="text" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" disabled={!parsed} type="submit">
            {site ? "Сохранить" : "Добавить"}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
}
