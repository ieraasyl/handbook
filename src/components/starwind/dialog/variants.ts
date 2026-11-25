import { tv } from "tailwind-variants";

export const dialogBackdrop = tv({
  base: [
    "fixed inset-0 top-0 left-0 z-50 h-screen w-screen bg-black/80 duration-200",
    "data-starting-style:!animate-none data-starting-style:opacity-0",
    "data-[state=open]:animate-in fade-in",
    "data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards fade-out motion-reduce:animate-none",
  ],
});

export const dialogContent = tv({
  base: [
    "fixed top-16 left-[50%] z-50 translate-x-[-50%] sm:top-[50%] sm:translate-y-[-50%]",
    "bg-background w-full max-w-md rounded-lg border p-8 shadow-lg",
    "data-starting-style:!animate-none data-starting-style:opacity-0",
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards transition-[translate,scale,opacity] duration-200 motion-reduce:animate-none motion-reduce:transition-none",
    "fade-in zoom-in-95 slide-in-from-bottom-2",
    "fade-out zoom-out-95 slide-out-to-bottom-2",
    "data-[state=open]:data-nested-dialog-open:-translate-y-[calc(50%-var(--nested-offset)*var(--nested-dialogs,1))]",
    "data-[state=open]:data-nested-dialog-open:scale-[calc(1-var(--nested-scale)*var(--nested-dialogs,1))]",
    "max-sm:data-[state=open]:data-nested-dialog-open:translate-y-[calc(var(--nested-offset)*var(--nested-dialogs,1))]",
  ],
  variants: {
    variant: {
      search:
        "handbook-search inset-x-0 top-0 bottom-auto mx-auto mt-[min(12dvh,5rem)] max-h-[calc(100dvh-min(12dvh,5rem)-1rem)] w-[calc(100%-1rem)] max-w-2xl translate-x-0 overflow-y-auto overscroll-contain border-border bg-popover p-0 text-foreground shadow-xl sm:top-0 sm:w-[calc(100%-2rem)] sm:translate-y-0",
    },
  },
});

export const dialogCloseButton = tv({
  base: [
    "text-muted-foreground",
    "absolute top-5.5 right-5.5 rounded-sm [&>svg]:opacity-70 hover:[&>svg]:opacity-100",
    "focus-visible:ring-outline/50 transition-[color,box-shadow] outline-none focus-visible:ring-3",
  ],
});

export const dialogTitle = tv({
  base: "font-heading text-xl leading-none font-semibold tracking-tight",
  variants: {
    size: { sm: "text-lg" },
  },
});
