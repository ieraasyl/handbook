import { tv } from "tailwind-variants";

export const sidebar = tv({
  base: "group peer text-sidebar-foreground hidden shrink-0 min-[50rem]:block print:hidden",
});

export const sidebarContent = tv({
  base: [
    "flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-4",
    "group-data-[collapsible=icon]:overflow-hidden",
  ],
});

export const sidebarGap = tv({
  base: [
    "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
    "group-data-[collapsible=offcanvas]:w-0",
    "group-data-[side=right]:rotate-180",
  ],
  variants: {
    variant: {
      sidebar: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
      floating: "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]",
      inset: "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]",
    },
  },
  defaultVariants: {
    variant: "sidebar",
  },
});

export const sidebarContainer = tv({
  base: "fixed top-(--sl-nav-height) bottom-0 z-10 hidden h-[calc(100dvh-var(--sl-nav-height))] w-(--sidebar-width) border-sidebar-border transition-[left,right,width] duration-200 ease-linear group-data-[collapsible=offcanvas]:invisible min-[50rem]:flex motion-reduce:transition-none",
  variants: {
    side: {
      left: "left-[max(0px,calc((100vw-108rem)/2))] group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]",
      right: "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
    },
    variant: {
      sidebar: [
        "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        "group-data-[side=left]:border-r group-data-[side=right]:border-l",
      ],
      floating: "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]",
      inset: "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]",
    },
  },
  defaultVariants: {
    side: "left",
    variant: "sidebar",
  },
});

export const sidebarInner = tv({
  base: "bg-sidebar flex h-full w-full flex-col",
  variants: {
    variant: {
      sidebar: "",
      floating: "border-sidebar-border rounded-lg border shadow-sm",
      inset: "border-sidebar-border rounded-lg border shadow-sm",
    },
  },
  defaultVariants: {
    variant: "sidebar",
  },
});

export const sidebarMobileContent = tv({
  base: "bg-sidebar text-sidebar-foreground inset-y-0 m-0 h-dvh w-[min(var(--sidebar-width),calc(100vw-2rem))] max-w-none gap-0 border-sidebar-border p-0",
});

export const sidebarProvider = tv({
  base: ["group/sidebar-wrapper flex min-h-svh w-full", "has-data-[variant=inset]:bg-sidebar"],
});

export const sidebarTrigger = tv({
  base: "",
});
