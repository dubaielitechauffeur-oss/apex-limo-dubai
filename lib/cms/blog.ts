import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Prisma, PublishStatus } from "@/lib/generated/prisma/client";
import { requireCmsPermission } from "./guard";
import { isValidSlug } from "./slug";
import { emptyLocalizedText, type LocalizedText } from "./localized";
import { emptySeoMeta, type SeoMeta } from "./seo";

// ── Categories ───────────────────────────────────────────────────────────

export interface BlogCategoryItem {
  id: string;
  slug: string;
  name: LocalizedText;
  sortOrder: number;
  postCount: number;
}

export async function listBlogCategories(): Promise<RoleAdminResult<BlogCategoryItem[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_READ);
  if (!gate.success) return gate;

  const rows = await prisma.blogCategory.findMany({ orderBy: [{ sortOrder: "asc" }], include: { _count: { select: { posts: true } } } });
  return { success: true, data: rows.map((r) => ({ id: r.id, slug: r.slug, name: (r.name as LocalizedText | null) ?? emptyLocalizedText(), sortOrder: r.sortOrder, postCount: r._count.posts })) };
}

export interface BlogCategoryInput {
  slug: string;
  name: LocalizedText;
  sortOrder: number;
}

export async function createBlogCategory(input: BlogCategoryInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_CREATE);
  if (!gate.success) return gate;
  if (!isValidSlug(input.slug)) return { success: false, error: "Slug must be lowercase letters, numbers, and hyphens only." };
  if (!input.name.en.trim()) return { success: false, error: "English name is required." };

  const existing = await prisma.blogCategory.findUnique({ where: { slug: input.slug } });
  if (existing) return { success: false, error: "This slug is already in use." };

  const created = await prisma.blogCategory.create({ data: { slug: input.slug, name: input.name as Prisma.InputJsonValue, sortOrder: input.sortOrder } });
  await writeAuditLog({ action: "create", entityType: "blog_category", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", after: created.slug }] });
  return { success: true, data: { id: created.id } };
}

export async function updateBlogCategory(id: string, input: BlogCategoryInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_UPDATE);
  if (!gate.success) return gate;
  const existing = await prisma.blogCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Category not found." };
  if (!isValidSlug(input.slug)) return { success: false, error: "Slug must be lowercase letters, numbers, and hyphens only." };

  const slugOwner = await prisma.blogCategory.findUnique({ where: { slug: input.slug } });
  if (slugOwner && slugOwner.id !== id) return { success: false, error: "This slug is already in use." };

  await prisma.blogCategory.update({ where: { id }, data: { slug: input.slug, name: input.name as Prisma.InputJsonValue, sortOrder: input.sortOrder } });
  await writeAuditLog({ action: "update", entityType: "blog_category", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug, after: input.slug }] });
  return { success: true, data: { id } };
}

export async function deleteBlogCategory(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_DELETE);
  if (!gate.success) return gate;
  const existing = await prisma.blogCategory.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Category not found." };

  await prisma.blogCategory.delete({ where: { id } });
  await writeAuditLog({ action: "delete", entityType: "blog_category", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug }] });
  return { success: true, data: { id } };
}

// ── Tags ─────────────────────────────────────────────────────────────────

export interface TagItem {
  id: string;
  slug: string;
  name: string;
  postCount: number;
}

export async function listTags(): Promise<RoleAdminResult<TagItem[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_READ);
  if (!gate.success) return gate;
  const rows = await prisma.tag.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { blogPosts: true } } } });
  return { success: true, data: rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, postCount: r._count.blogPosts })) };
}

export async function createTag(name: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_CREATE);
  if (!gate.success) return gate;
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Tag name is required." };
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) return { success: false, error: "Tag name must contain letters or numbers." };

  const existing = await prisma.tag.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "This tag already exists." };

  const created = await prisma.tag.create({ data: { slug, name: trimmed } });
  return { success: true, data: { id: created.id } };
}

export async function deleteTag(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_DELETE);
  if (!gate.success) return gate;
  await prisma.tag.delete({ where: { id } }).catch(() => null);
  return { success: true, data: { id } };
}

// ── Posts ────────────────────────────────────────────────────────────────

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  status: PublishStatus;
  categoryName: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
}

export interface BlogPostDetail {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  authorName: string;
  authorTitle: LocalizedText;
  authorEmail: string;
  categoryId: string | null;
  featuredImageId: string | null;
  tagIds: string[];
  readingTimeMinutes: number;
  seo: SeoMeta;
  status: PublishStatus;
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostInput {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  authorName: string;
  authorTitle: LocalizedText;
  authorEmail: string;
  categoryId: string | null;
  featuredImageId: string | null;
  tagIds: string[];
  readingTimeMinutes: number;
  seo: SeoMeta;
  status: PublishStatus;
  sortOrder: number;
}

export interface ListBlogPostsParams {
  q?: string;
  status?: PublishStatus;
  categoryId?: string;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListBlogPostsResult {
  items: BlogPostListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;

/** `content` is stored as `BlogContentBlock[]` (data/blog.ts's shape:
 *  heading/paragraph/list/faq blocks) so a future rich(er) editor or public
 *  render stays data-compatible. This phase's admin form only creates
 *  `paragraph` blocks (one blank-line-separated paragraph per block) — a
 *  deliberately simple editor per the Phase 7 brief ("do not build an
 *  advanced rich-text editor"). Existing heading/list/faq blocks from any
 *  other source are preserved on read via `blocksToText`/lost only if
 *  re-saved through this form (documented in CMS.md). */
function textToParagraphBlocks(value: LocalizedText): Prisma.InputJsonValue {
  const locales = Object.keys(value) as (keyof LocalizedText)[];
  const paragraphCounts = locales.map((l) => value[l].split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length);
  const blockCount = Math.max(0, ...paragraphCounts);
  const blocks: { type: "paragraph"; text: LocalizedText }[] = [];
  for (let i = 0; i < blockCount; i++) {
    const text = emptyLocalizedText();
    for (const locale of locales) {
      const paragraphs = value[locale].split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      text[locale] = paragraphs[i] ?? "";
    }
    blocks.push({ type: "paragraph", text });
  }
  return blocks as unknown as Prisma.InputJsonValue;
}

function blocksToText(value: unknown): LocalizedText {
  const result = emptyLocalizedText();
  if (!Array.isArray(value)) return result;
  const paragraphs: Record<string, string[]> = {};
  for (const block of value) {
    if (block && typeof block === "object" && "text" in block) {
      const text = (block as { text?: Record<string, string> }).text ?? {};
      for (const [locale, paragraph] of Object.entries(text)) {
        (paragraphs[locale] ??= []).push(paragraph);
      }
    }
  }
  for (const locale of Object.keys(result)) {
    result[locale as keyof LocalizedText] = (paragraphs[locale] ?? []).join("\n\n");
  }
  return result;
}

function toListItem(row: { id: string; slug: string; title: Prisma.JsonValue; status: PublishStatus; category: { name: Prisma.JsonValue } | null; publishedAt: Date | null; updatedAt: Date }): BlogPostListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: (row.title as LocalizedText | null)?.en ?? row.slug,
    status: row.status,
    categoryName: (row.category?.name as LocalizedText | null)?.en ?? null,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
  };
}

export async function listBlogPosts(params: ListBlogPostsParams): Promise<RoleAdminResult<ListBlogPostsResult>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_READ);
  if (!gate.success) return gate;

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.BlogPostWhereInput = {
    ...(params.includeDeleted ? {} : { deletedAt: null }),
    ...(params.status ? { status: params.status } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    // `path` is required for `string_contains` to match inside an
    // object-shaped Json column (LocalizedText) — without it Prisma never
    // matches. Searches English text.
    ...(params.q
      ? {
          OR: [
            { slug: { contains: params.q, mode: "insensitive" as const } },
            { title: { path: ["en"], string_contains: params.q } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { name: true } } },
    }),
  ]);

  return { success: true, data: { items: rows.map(toListItem), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getBlogPost(id: string): Promise<RoleAdminResult<BlogPostDetail>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_READ);
  if (!gate.success) return gate;

  const row = await prisma.blogPost.findFirst({ where: { id, deletedAt: null }, include: { tags: { select: { tagId: true } } } });
  if (!row) return { success: false, error: "Blog post not found." };

  const author = (row.author as { name?: string; title?: LocalizedText; email?: string } | null) ?? {};

  return {
    success: true,
    data: {
      id: row.id,
      slug: row.slug,
      title: (row.title as LocalizedText | null) ?? emptyLocalizedText(),
      excerpt: (row.excerpt as LocalizedText | null) ?? emptyLocalizedText(),
      content: blocksToText(row.content),
      authorName: author.name ?? "",
      authorTitle: author.title ?? emptyLocalizedText(),
      authorEmail: author.email ?? "",
      categoryId: row.categoryId,
      featuredImageId: row.featuredImageId,
      tagIds: row.tags.map((t) => t.tagId),
      readingTimeMinutes: row.readingTimeMinutes,
      seo: (row.seo as unknown as SeoMeta | null) ?? emptySeoMeta(),
      status: row.status,
      sortOrder: row.sortOrder,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
  };
}

async function assertSlugAvailable(slug: string, excludeId?: string): Promise<string | null> {
  if (!isValidSlug(slug)) return "Slug must be lowercase letters, numbers, and hyphens only.";
  const existing = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== excludeId) return "This slug is already in use by another post.";
  return null;
}

function buildData(input: BlogPostInput): Omit<Prisma.BlogPostUncheckedCreateInput, "tags"> {
  return {
    slug: input.slug,
    title: input.title as Prisma.InputJsonValue,
    excerpt: input.excerpt as Prisma.InputJsonValue,
    content: textToParagraphBlocks(input.content),
    author: { name: input.authorName, title: input.authorTitle, ...(input.authorEmail ? { email: input.authorEmail } : {}) } as Prisma.InputJsonValue,
    categoryId: input.categoryId,
    featuredImageId: input.featuredImageId,
    readingTimeMinutes: input.readingTimeMinutes,
    seo: input.seo as unknown as Prisma.InputJsonValue,
    status: input.status,
    sortOrder: input.sortOrder,
    publishedAt: input.status === "published" ? new Date() : null,
  };
}

export async function createBlogPost(input: BlogPostInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_CREATE);
  if (!gate.success) return gate;

  const slugError = await assertSlugAvailable(input.slug);
  if (slugError) return { success: false, error: slugError };
  if (!input.title.en.trim()) return { success: false, error: "English title is required." };

  const created = await prisma.blogPost.create({
    data: { ...buildData(input), tags: { create: input.tagIds.map((tagId) => ({ tagId })) } },
  });
  await writeAuditLog({ action: "create", entityType: "blog_post", entityId: created.id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", after: created.slug }] });

  return { success: true, data: { id: created.id } };
}

export async function updateBlogPost(id: string, input: BlogPostInput): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_UPDATE);
  if (!gate.success) return gate;

  const existing = await prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Blog post not found." };

  const slugError = await assertSlugAvailable(input.slug, id);
  if (slugError) return { success: false, error: slugError };
  if (!input.title.en.trim()) return { success: false, error: "English title is required." };

  const wasPublished = existing.status === "published";
  const willBePublished = input.status === "published";
  const data = buildData(input);
  data.publishedAt = willBePublished ? (existing.publishedAt ?? new Date()) : wasPublished ? existing.publishedAt : null;

  await prisma.$transaction([
    prisma.blogPostTag.deleteMany({ where: { blogPostId: id } }),
    prisma.blogPost.update({ where: { id }, data: { ...data, tags: { create: input.tagIds.map((tagId) => ({ tagId })) } } }),
  ]);
  await writeAuditLog({ action: "update", entityType: "blog_post", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug, after: input.slug }] });

  return { success: true, data: { id } };
}

export async function setBlogPostStatus(id: string, status: PublishStatus): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_PUBLISH);
  if (!gate.success) return gate;

  const existing = await prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Blog post not found." };

  await prisma.blogPost.update({ where: { id }, data: { status, publishedAt: status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt } });
  await writeAuditLog({
    action: status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish",
    entityType: "blog_post", entityId: id, userId: gate.data.userId, userName: gate.data.roleName,
    changes: [{ field: "status", before: existing.status, after: status }],
  });

  return { success: true, data: { id } };
}

export async function softDeleteBlogPost(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false, error: "Blog post not found." };

  await prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAuditLog({ action: "delete", entityType: "blog_post", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", before: existing.slug }] });

  return { success: true, data: { id } };
}

export async function restoreBlogPost(id: string): Promise<RoleAdminResult<{ id: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.BLOG_DELETE);
  if (!gate.success) return gate;

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing || !existing.deletedAt) return { success: false, error: "Blog post not found or not deleted." };

  await prisma.blogPost.update({ where: { id }, data: { deletedAt: null } });
  await writeAuditLog({ action: "restore", entityType: "blog_post", entityId: id, userId: gate.data.userId, userName: gate.data.roleName, changes: [{ field: "slug", after: existing.slug }] });

  return { success: true, data: { id } };
}
