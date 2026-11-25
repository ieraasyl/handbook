import { tv } from "tailwind-variants";

export const breadcrumb = tv({
  base: "text-sm",
});

export const breadcrumbItem = tv({
  base: "inline-flex items-center gap-1.5",
});

export const breadcrumbLink = tv({
  base: "handbook-focus rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline",
});

export const breadcrumbList = tv({
  base: "m-0 flex list-none flex-wrap items-center gap-1.5 p-0 wrap-break-word text-muted-foreground sm:gap-2",
});

export const breadcrumbPage = tv({
  base: "truncate font-normal text-foreground",
});

export const breadcrumbSeparator = tv({
  base: "[&>svg]:size-4",
});
