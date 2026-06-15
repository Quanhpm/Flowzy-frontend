import { Sparkles } from "lucide-react";

import styles from "./login.module.css";

type BrandLogoProps = {
  inverse?: boolean;
};

export function BrandLogo({ inverse = false }: BrandLogoProps) {
  return (
    <div className={`${styles.brand} ${inverse ? styles.brandInverse : ""}`}>
      <span className={styles.brandMark} aria-hidden="true">
        <Sparkles size={22} strokeWidth={2.4} />
      </span>
      <span>F-Spark</span>
    </div>
  );
}
