import { tv } from "tailwind-variants";

export const item = tv({
  base: [
    "group/item flex flex-wrap items-center rounded-md border border-transparent text-sm transition-colors",
    "[a]:hover:bg-accent/50 [a]:transition-colors",
    "focus-visible:border-ring focus-visible:ring-outline/50 outline-none focus-visible:ring-[3px]",
  ],
  variants: {
    variant: {
      default: "bg-transparent",
      outline: "border-border",
      muted: "bg-muted/50",
      navigation:
        "handbook-focus h-full min-h-14 flex-nowrap border-border bg-card font-medium text-foreground no-underline hover:border-primary-accent",
    },
    size: {
      sm: "gap-2.5 px-4 py-3",
      md: "gap-4 p-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const itemActions = tv({
  base: "flex items-center gap-2",
  variants: {
    tone: { accent: "text-primary-accent" },
  },
});

export const itemContent = tv({
  base: "flex flex-1 flex-col gap-1.5 [&+[data-slot=item-content]]:flex-none",
  variants: {
    compact: { true: "gap-0" },
  },
});
