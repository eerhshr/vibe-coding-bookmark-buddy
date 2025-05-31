import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  category: text("category"),
  folder: text("folder"),
  favicon: text("favicon"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  count: integer("count").notNull().default(0),
  color: text("color").notNull(),
});

export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  totalBookmarks: integer("total_bookmarks").notNull(),
  totalCategories: integer("total_categories").notNull(),
  totalDomains: integer("total_domains").notNull(),
  duplicates: integer("duplicates").notNull(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;

// Additional types for frontend
export type BookmarkStats = {
  totalBookmarks: number;
  categories: number;
  domains: number;
  duplicates: number;
};

export type DomainCount = {
  domain: string;
  count: number;
};

export type AnalysisData = {
  stats: BookmarkStats;
  categories: Category[];
  topDomains: DomainCount[];
  bookmarks: Bookmark[];
};
