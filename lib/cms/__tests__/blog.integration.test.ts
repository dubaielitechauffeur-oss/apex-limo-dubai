import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createTestUsers, cleanupTestUsers, type TestUser } from "@/lib/permissions/__tests__/fixtures";
import type { SystemRole } from "@/lib/permissions/roles";

const mockGetSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getSession: () => mockGetSession() }));

import { prisma } from "@/lib/db";
import {
  listBlogCategories,
  createBlogCategory,
  deleteBlogCategory,
  listTags,
  createTag,
  deleteTag,
  listBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  setBlogPostStatus,
  softDeleteBlogPost,
  restoreBlogPost,
  type BlogPostInput,
} from "@/lib/cms/blog";
import { emptyLocalizedText } from "@/lib/cms/localized";
import { emptySeoMeta } from "@/lib/cms/seo";

let users: Record<SystemRole, TestUser>;
const postIds: string[] = [];
const categoryIds: string[] = [];
const tagIds: string[] = [];

beforeAll(async () => {
  users = await createTestUsers();
});

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { entityId: { in: [...postIds, ...categoryIds] } } });
  await prisma.blogPostTag.deleteMany({ where: { blogPostId: { in: postIds } } });
  await prisma.blogPost.deleteMany({ where: { id: { in: postIds } } });
  await prisma.blogCategory.deleteMany({ where: { id: { in: categoryIds } } });
  await prisma.tag.deleteMany({ where: { id: { in: tagIds } } });
  await cleanupTestUsers(users);
});

function mockSessionFor(user: { id: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user: { id: user.id } } : null);
}

function postFixture(overrides?: Partial<BlogPostInput>): BlogPostInput {
  return {
    slug: `vitest-post-${Math.random().toString(36).slice(2, 10)}`,
    title: emptyLocalizedText("Vitest Post"),
    excerpt: emptyLocalizedText("An excerpt."),
    content: emptyLocalizedText("Paragraph one.\n\nParagraph two."),
    authorName: "Vitest Author",
    authorTitle: emptyLocalizedText("Staff Writer"),
    authorEmail: "",
    categoryId: null,
    featuredImageId: null,
    tagIds: [],
    readingTimeMinutes: 3,
    seo: emptySeoMeta(),
    status: "draft",
    sortOrder: 0,
    ...overrides,
  };
}

async function makePost(overrides?: Partial<BlogPostInput>): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createBlogPost(postFixture(overrides));
  if (!result.success) throw new Error(`Fixture post creation failed: ${result.error}`);
  postIds.push(result.data.id);
  return result.data.id;
}

async function makeCategory(): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createBlogCategory({ slug: `vitest-cat-${Math.random().toString(36).slice(2, 10)}`, name: emptyLocalizedText("Vitest Category"), sortOrder: 0 });
  if (!result.success) throw new Error(`Fixture category creation failed: ${result.error}`);
  categoryIds.push(result.data.id);
  return result.data.id;
}

async function makeTag(): Promise<string> {
  mockSessionFor(users.content_manager);
  const result = await createTag(`Vitest Tag ${Math.random().toString(36).slice(2, 8)}`);
  if (!result.success) throw new Error(`Fixture tag creation failed: ${result.error}`);
  tagIds.push(result.data.id);
  return result.data.id;
}

describe("blog categories and tags — permission gating and CRUD", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createBlogCategory({ slug: "denied", name: emptyLocalizedText("Denied"), sortOrder: 0 });
    expect(result.success).toBe(false);
  });

  it("booking_manager lacks blog:create and is denied", async () => {
    mockSessionFor(users.booking_manager);
    const result = await createBlogCategory({ slug: "denied2", name: emptyLocalizedText("Denied"), sortOrder: 0 });
    expect(result.success).toBe(false);
  });

  it("creates, lists, and deletes a category", async () => {
    const id = await makeCategory();
    mockSessionFor(users.viewer);
    const listResult = await listBlogCategories();
    expect(listResult.success).toBe(true);
    if (listResult.success) expect(listResult.data.some((c) => c.id === id)).toBe(true);

    mockSessionFor(users.content_manager);
    const deleteResult = await deleteBlogCategory(id);
    expect(deleteResult.success).toBe(true);
    categoryIds.splice(categoryIds.indexOf(id), 1);
  });

  it("creates, lists, and deletes a tag", async () => {
    const id = await makeTag();
    mockSessionFor(users.viewer);
    const listResult = await listTags();
    expect(listResult.success).toBe(true);
    if (listResult.success) expect(listResult.data.some((t) => t.id === id)).toBe(true);

    mockSessionFor(users.content_manager);
    const deleteResult = await deleteTag(id);
    expect(deleteResult.success).toBe(true);
    tagIds.splice(tagIds.indexOf(id), 1);
  });
});

describe("createBlogPost — permission gating and validation", () => {
  it("is denied without a session", async () => {
    mockSessionFor(null);
    const result = await createBlogPost(postFixture());
    expect(result.success).toBe(false);
  });

  it("booking_manager lacks blog:create and is denied, with an audit entry", async () => {
    mockSessionFor(users.booking_manager);
    const before = await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } });
    const result = await createBlogPost(postFixture());
    expect(result.success).toBe(false);
    expect(await prisma.auditLog.count({ where: { action: "unauthorized_access", userId: users.booking_manager.id } })).toBe(before + 1);
  });

  it("rejects a duplicate slug", async () => {
    const slug = `vitest-dup-post-${Math.random().toString(36).slice(2, 8)}`;
    await makePost({ slug });
    mockSessionFor(users.content_manager);
    const result = await createBlogPost(postFixture({ slug }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid slug format", async () => {
    mockSessionFor(users.content_manager);
    const result = await createBlogPost(postFixture({ slug: "Not A Valid Slug!" }));
    expect(result.success).toBe(false);
  });

  it("rejects a missing English title", async () => {
    mockSessionFor(users.content_manager);
    const result = await createBlogPost(postFixture({ title: emptyLocalizedText() }));
    expect(result.success).toBe(false);
  });

  it("content_manager can create a post with category and tags, audit-logged", async () => {
    const categoryId = await makeCategory();
    const tagId = await makeTag();
    mockSessionFor(users.content_manager);
    const before = await prisma.auditLog.count({ where: { action: "create", entityType: "blog_post" } });
    const id = await makePost({ categoryId, tagIds: [tagId] });
    const row = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("draft");
    expect(row.categoryId).toBe(categoryId);
    expect(await prisma.auditLog.count({ where: { action: "create", entityType: "blog_post" } })).toBe(before + 1);
  });
});

describe("getBlogPost — round-trips content paragraph blocks correctly", () => {
  it("splits/rejoins content into paragraph blocks and back", async () => {
    const id = await makePost();
    mockSessionFor(users.viewer);
    const result = await getBlogPost(id);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content.en).toBe("Paragraph one.\n\nParagraph two.");
      expect(result.data.authorName).toBe("Vitest Author");
    }
  });
});

describe("updateBlogPost", () => {
  it("viewer (read-only) is denied", async () => {
    const id = await makePost();
    mockSessionFor(users.viewer);
    const result = await updateBlogPost(id, postFixture({ title: emptyLocalizedText("Hacked") }));
    expect(result.success).toBe(false);
  });

  it("content_manager can update, and slug can be reused by the same row; tags are replaced", async () => {
    const slug = `vitest-self-post-${Math.random().toString(36).slice(2, 8)}`;
    const tagA = await makeTag();
    const tagB = await makeTag();
    const id = await makePost({ slug, tagIds: [tagA] });
    mockSessionFor(users.content_manager);
    const result = await updateBlogPost(id, postFixture({ slug, title: emptyLocalizedText("Updated Title"), tagIds: [tagB] }));
    expect(result.success).toBe(true);

    const detail = await getBlogPost(id);
    expect(detail.success).toBe(true);
    if (detail.success) {
      expect(detail.data.title.en).toBe("Updated Title");
      expect(detail.data.tagIds).toEqual([tagB]);
    }
  });
});

describe("setBlogPostStatus — publish/unpublish/archive", () => {
  it("publishing stamps publishedAt; unpublishing keeps it (not cleared)", async () => {
    const id = await makePost();
    mockSessionFor(users.content_manager);

    const publishResult = await setBlogPostStatus(id, "published");
    expect(publishResult.success).toBe(true);
    const afterPublish = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
    expect(afterPublish.status).toBe("published");
    expect(afterPublish.publishedAt).not.toBeNull();

    const unpublishResult = await setBlogPostStatus(id, "draft");
    expect(unpublishResult.success).toBe(true);
    const afterUnpublish = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
    expect(afterUnpublish.status).toBe("draft");
  });

  it("seo_manager lacks blog:publish and is denied", async () => {
    const id = await makePost();
    mockSessionFor(users.seo_manager);
    const result = await setBlogPostStatus(id, "published");
    expect(result.success).toBe(false);
  });
});

describe("softDeleteBlogPost / restoreBlogPost", () => {
  it("soft-deletes and excludes from listBlogPosts by default", async () => {
    const id = await makePost();
    mockSessionFor(users.content_manager);
    const deleteResult = await softDeleteBlogPost(id);
    expect(deleteResult.success).toBe(true);

    const row = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
    expect(row.deletedAt).not.toBeNull();

    mockSessionFor(users.viewer);
    const listResult = await listBlogPosts({});
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.data.items.some((p) => p.id === id)).toBe(false);
    }
  });

  it("restores a soft-deleted post", async () => {
    const id = await makePost();
    mockSessionFor(users.content_manager);
    await softDeleteBlogPost(id);
    const restoreResult = await restoreBlogPost(id);
    expect(restoreResult.success).toBe(true);

    const row = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
    expect(row.deletedAt).toBeNull();
  });
});
