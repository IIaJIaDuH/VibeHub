import { PageHeader } from "../../components/PageHeader/PageHeader";
import { EmptyState } from "../../components/EmptyState/EmptyState";
import { QuickAccess } from "../../components/QuickAccess/QuickAccess";
import { useHub } from "../../state/HubContext";
import styles from "./Library.module.css";

export function BookmarksPage() {
  const { models, tools, toggleModelBookmark, toggleToolBookmark } = useHub();
  const savedModels = models.filter((m) => m.bookmarked);
  const savedTools = tools.filter((t) => t.bookmarked);

  return (
    <div className={styles.page}>
      <PageHeader title="Закладки" />
      {!savedModels.length && !savedTools.length ? (
        <EmptyState>Нет сохранённых моделей и инструментов.</EmptyState>
      ) : (
        <>
          {savedModels.map((model) => (
            <p key={model.id} className={styles.saved}>
              <strong>{model.name}</strong>
              <span>{model.provider}</span>
              <button type="button" onClick={() => toggleModelBookmark(model.id)}>
                Убрать
              </button>
            </p>
          ))}
          {savedTools.map((tool) => (
            <p key={tool.id} className={styles.saved}>
              <strong>{tool.name}</strong>
              <span>{tool.typeLabel}</span>
              <button type="button" onClick={() => toggleToolBookmark(tool.id)}>
                Убрать
              </button>
            </p>
          ))}
        </>
      )}
    </div>
  );
}

export function CollectionsPage() {
  return (
    <div className={styles.page}>
      <PageHeader title="Коллекции" />
      <QuickAccess />
      <EmptyState>
        Остальные коллекции появятся позже. Быстрый доступ уже можно собрать под
        свои рабочие сайты.
      </EmptyState>
    </div>
  );
}
