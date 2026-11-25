import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const academicYear = z.string().regex(/^\d{4}-\d{4}$/);
const handbookDocsSchema = docsSchema({
  extend: z.object({
    metadata: z
      .discriminatedUnion("kind", [
        z.object({
          kind: z.literal("program"),
          school: z.string().min(1),
          intakeYear: z.int().min(2000),
        }),
        z.object({
          kind: z.literal("report"),
          academicYear,
          term: z.string().min(1),
          school: z.string().min(1),
        }),
        z.object({ kind: z.literal("longitudinal"), academicYear }),
      ])
      .optional(),
  }),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: (context) =>
      handbookDocsSchema(context).transform((data) => {
        const { description, metadata, title } = data;
        if (description || !metadata) return data;

        switch (metadata.kind) {
          case "program":
            return {
              ...data,
              description: `Overview of the ${title} program for the ${metadata.intakeYear} intake at Nazarbayev University.`,
            };
          case "report":
            return {
              ...data,
              description: `Undergraduate grade distribution for ${metadata.school} in ${metadata.term} at Nazarbayev University.`,
            };
          case "longitudinal":
            return {
              ...data,
              description: `Undergraduate course grade counts and mean grade points for the ${metadata.academicYear} academic year at Nazarbayev University.`,
            };
        }
      }),
  }),
};
