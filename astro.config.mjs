import { fileURLToPath } from "node:url";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { archive, guidance, programGroups } from "./src/lib/navigation.mjs";
import { remarkHandbookLinks } from "./src/lib/remark-handbook-links.mjs";
import { rehypeHandbookSources } from "./src/lib/rehype-handbook-sources.mjs";
import { rehypeHandbookTables } from "./src/lib/rehype-handbook-tables.mjs";

const base = "/";

export default defineConfig({
  site: process.env.HANDBOOK_SITE || "https://handbook.ieraasyl.workers.dev",
  base,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  vite: { plugins: [tailwindcss()] },
  markdown: {
    processor: unified({
      smartypants: false,
      remarkPlugins: [
        [
          remarkHandbookLinks,
          {
            base,
            docsRoot: fileURLToPath(new URL("./src/content/docs/", import.meta.url)),
            readme: fileURLToPath(new URL("./README.md", import.meta.url)),
          },
        ],
      ],
      rehypePlugins: [rehypeHandbookSources, rehypeHandbookTables],
    }),
  },
  integrations: [
    starlight({
      title: "handbook",
      description:
        "Academic calendars, advising, degree requirements, and past grade distributions for Nazarbayev University undergraduates.",
      favicon: "/favicon.png",
      head: [{ tag: "meta", attrs: { name: "twitter:card", content: "summary" } }],
      customCss: ["./src/styles/tailwind.css"],
      pagefind: {
        ranking: { metaWeights: { title: 5, program: 8 } },
      },
      components: {
        PageFrame: "./src/components/shell/PageFrame.astro",
        Header: "./src/components/shell/Header.astro",
        Sidebar: "./src/components/shell/Sidebar.astro",
        TwoColumnContent: "./src/components/shell/TwoColumnContent.astro",
        ContentPanel: "./src/components/shell/ContentPanel.astro",
        PageSidebar: "./src/components/shell/PageSidebar.astro",
        PageTitle: "./src/components/shell/PageTitle.astro",
        ThemeProvider: "./src/components/shell/ThemeProvider.astro",
        Pagination: "./src/components/shell/Pagination.astro",
        MarkdownContent: "./src/components/MarkdownContent.astro",
      },
      social: [
        {
          icon: "github",
          label: "handbook on GitHub",
          href: "https://github.com/ieraasyl/handbook",
        },
        {
          icon: "telegram",
          label: "Contact on Telegram",
          href: "https://t.me/ieraasyl",
        },
      ],
      sidebar: [
        { label: "Academic guidance", items: guidance },
        {
          label: "Programs by school",
          items: programGroups.map((group) => ({ ...group, collapsed: true })),
        },
        { label: "Grade archive", items: archive },
      ],
    }),
  ],
});
