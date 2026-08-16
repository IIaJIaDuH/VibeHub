import type { Model } from "../../types/hub";
import styles from "./ProviderMark.module.css";

export function ProviderMark({
  model,
  size = 44,
}: {
  model: Pick<Model, "name" | "provider" | "providerLogo">;
  size?: number;
}) {
  return (
    <img
      className={styles.mark}
      src={model.providerLogo}
      alt=""
      width={size}
      height={size}
      style={size !== 44 ? { width: size, height: size, borderRadius: 8 } : undefined}
    />
  );
}
