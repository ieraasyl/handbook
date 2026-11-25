import { tv } from "tailwind-variants";

export const card = tv({
  base: [
    "bg-card text-card-foreground group/card ring-border flex flex-col gap-(--card-spacing) rounded-xl py-(--card-spacing) ring-1",
    "has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0",
    "*:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  ],
  variants: {
    size: {
      sm: "[--card-spacing:--spacing(4)] text-sm",
      md: "[--card-spacing:--spacing(5)]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const cardContent = tv({
  base: "px-(--card-spacing)",
});

export const cardHeader = tv({
  base: [
    "@container/card-header grid auto-rows-min items-start gap-1 px-(--card-spacing)",
    "has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
  ],
});
