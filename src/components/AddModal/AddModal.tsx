import { useState } from "react";
import { useHub } from "../../state/HubContext";
import { Button } from "../Button/Button";
import styles from "./AddModal.module.css";

const OPTIONS = ["Инструмент", "Skill", "MCP", "Plugin", "Ссылка / находка"];

export function AddModal() {
  const { addOpen, setAddOpen } = useHub();
  const [picked, setPicked] = useState<string | null>(null);

  if (!addOpen) return null;

  const close = () => {
    setAddOpen(false);
    setPicked(null);
  };

  return (
    <div className={styles.overlay} onClick={close} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-labelledby="add-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-title">Чем хотите поделиться?</h2>
        {picked ? (
          <p className={styles.note}>
            Отправка на модерацию будет позже. Сейчас это mock: «{picked}».
          </p>
        ) : (
          <div className={styles.choices}>
            {OPTIONS.map((option) => (
              <Button key={option} onClick={() => setPicked(option)}>
                {option}
              </Button>
            ))}
          </div>
        )}
        <Button variant="text" onClick={close}>
          Закрыть
        </Button>
      </div>
    </div>
  );
}
