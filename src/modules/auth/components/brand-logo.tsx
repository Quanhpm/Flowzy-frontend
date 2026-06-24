import { Sparkles } from "lucide-react";

import { cn } from "@/shared/lib";

type BrandLogoProps = {
  inverse?: boolean;
};

export function BrandLogo({ inverse = false }: BrandLogoProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-[11px] font-sans text-[26px] font-bold tracking-normal text-foreground max-[600px]:text-[22px]",
        inverse && "text-foreground",
      )}
    >
      <span
        className="grid size-[38px] rotate-[-6deg] place-items-center rounded-full border-2 border-brand-primary text-brand-primary max-[600px]:size-[34px]"
        aria-hidden="true"
      >
        <Sparkles size={22} strokeWidth={2.4} />
      </span>
      <span>F-Spark</span>
    </div>
  );
}
