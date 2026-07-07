import Image from "next/image";

import { APP_CONFIG } from "@/shared/config/app";
import { cn } from "@/shared/lib";

type BrandLogoVariant = "default" | "sidebar";

export type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  inverse?: boolean;
  showName?: boolean;
  textClassName?: string;
  variant?: BrandLogoVariant;
};

const BRAND_LOGO_STYLES: Record<
  BrandLogoVariant,
  {
    image: string;
    root: string;
    text: string;
  }
> = {
  default: {
    root: "inline-flex min-w-0 items-center gap-[11px] font-sans text-[26px] font-bold tracking-normal text-foreground max-[600px]:text-[22px]",
    image:
      "block h-[44px] w-[154px] shrink-0 object-contain object-center max-[600px]:h-[30px] max-[600px]:w-[105px]",
    text: "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
  },
  sidebar: {
    root: "inline-flex min-w-0 items-center gap-[10px] font-sans text-[26px] font-bold tracking-normal text-foreground",
    image: "block h-[36px] w-[126px] shrink-0 object-contain object-left",
    text: "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
  },
};

export function BrandLogo({
  className,
  imageClassName,
  inverse = false,
  showName = APP_CONFIG.brand.showName,
  textClassName,
  variant = "default",
}: BrandLogoProps) {
  const styles = BRAND_LOGO_STYLES[variant];

  return (
    <div
      className={cn(
        styles.root,
        inverse && "text-foreground",
        className,
      )}
    >
      <Image
        alt={showName ? "" : APP_CONFIG.brand.logo.alt}
        className={cn(styles.image, imageClassName)}
        height={APP_CONFIG.brand.logo.height}
        priority={variant === "default"}
        src={APP_CONFIG.brand.logo.src}
        unoptimized={APP_CONFIG.brand.logo.src.endsWith(".svg")}
        width={APP_CONFIG.brand.logo.width}
      />
      {showName && (
        <span className={cn(styles.text, textClassName)}>
          {APP_CONFIG.name}
        </span>
      )}
    </div>
  );
}
