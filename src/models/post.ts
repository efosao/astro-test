import { caching } from "cache-manager";
import d from "dayjs";
import { z } from "zod";

import cache from "cache";
import { prisma } from "db";
import { getFriendlyDuration } from "lib/date";
import { cleanText, convertTextToHtml } from "lib/page";
import { genPostUrl } from "lib/url";
import type { TagType } from "types/post.type";

const memoryCache = await caching("memory", {
  max: 100,
  ttl: 30 * 1000 // 30 seconds
});

const isProd = process.env.NODE_ENV === "production";

export type DetailsMetadataType = {
  apply_options?: {
    link: string;
    title: string;
  }[];
} | null;

export type PostDetails = {
  company: {
    id: string;
    name: string;
  } | null;
  company_name: string;
  created_at: string;
  created_by_user_id: string | null;
  description: string;
  external_id: string | null;
  details_metadata: DetailsMetadataType;
  id: string;
  location: string | null;
  pinned_until: string | null;
  published_at: string | null;
  published_at_display: string | null;
  tags: string[];
  thumbnail: string | null;
  title: string;
  updated_at: string;
  url: string | null;
};

const postDetailSelect = {
  company: {
    select: {
      id: true,
      name: true
    }
  },
  company_name: true,
  created_at: true,
  created_by_user_id: true,
  details_metadata: true,
  description: true,
  external_id: true,
  id: true,
  location: true,
  pinned_until: true,
  published_at: true,
  tags: true,
  thumbnail: true,
  title: true,
  updated_at: true
};

const ownerPostDetailSelect = {
  company: {
    select: {
      id: true,
      name: true
    }
  },
  company_name: true,
  created_at: true,
  created_by_user_id: true,
  details_metadata: true,
  description: true,
  external_id: true,
  id: true,
  location: true,
  post_checkout_sessions: {
    select: {
      session_status: true
    }
  },
  published_at: true,
  tags: true,
  thumbnail: true,
  title: true,
  updated_at: true
};

function formatPostDetails<T>(
  post: {
    company_name: string;
    description: string;
    id: string;
    title: string;
    published_at: Date | null;
  },
  convertDescToHtml = true
): T & { url: string } {
  const description = convertDescToHtml
    ? convertTextToHtml(post.description)
    : cleanText(post.description);

  return {
    ...post,
    url: genPostUrl(post),
    description,
    published_at_display: post.published_at
      ? getFriendlyDuration(post.published_at)
      : ""
  } as unknown as T & { url: string };
}

export function getPostById(postId: string) {
  return prisma.post
    .findUnique({
      select: postDetailSelect,
      where: {
        id: postId
      }
    })
    .then((post) => {
      if (post) return formatPostDetails<PostDetails>(post, false);
      return null;
    });
}

export function getPostDetailById(
  postId: string
): Promise<{ description: string } | null> {
  return prisma.post
    .findUnique({
      select: { description: true },
      where: {
        id: postId
      }
    })
    .then((post) => ({
      description: convertTextToHtml(post?.description || "")
    }));
}

export function getFormattedPostById(
  postId: string
): Promise<PostResult | null> {
  return prisma.post
    .findUnique({
      select: postDetailSelect,
      where: {
        id: postId
      }
    })
    .then((post) => {
      if (post) return formatPostDetails(post);
      return null;
    });
}

// const companyFilterList = ["Jobot", "CyberCoders", "Upwork"];
// const companyFilterList = ["Jobot", "CyberCoders"];

export type PostsResult = {} & NonNullable<
  Awaited<ReturnType<typeof getPostById>>
>[];
export type PostResult = {} & Awaited<ReturnType<typeof getPostById>>;

export async function getPublishedPosts({
  skip,
  take,
  excludeDesc = false
}: {
  skip: number | undefined;
  take: number | undefined;
  excludeDesc?: boolean;
}): Promise<PostsResult> {
  const key = `getPublishedPosts-${skip}-${take}-${excludeDesc}`;
  const isCached = await memoryCache.get<PostsResult>(key);
  if (isCached) {
    return isCached;
  }

  const description = excludeDesc ? false : true;

  return prisma.post
    .findMany({
      orderBy: [
        {
          pinned_until: {
            sort: "desc",
            nulls: "last"
          }
        },
        {
          published_at: {
            sort: "desc",
            nulls: "last"
          }
        }
      ],
      select: { ...postDetailSelect, description },
      skip,
      take,
      where: {
        published_at: { not: null }
      }
    })
    .then((posts) => posts.map((p) => formatPostDetails<typeof p>(p)))
    .then(async (posts) => {
      memoryCache.set(key, posts);
      return posts;
    }) as Promise<PostsResult>;
}

export function getPostsByUserId(params: { userId: string }) {
  const CreatePostParamsSchema = z.object({
    userId: z.string()
  });

  const validationResult = CreatePostParamsSchema.safeParse(params);
  if (!validationResult.success) return Promise.reject(false);

  return prisma.post
    .findMany({
      orderBy: { created_at: "desc" },
      select: ownerPostDetailSelect,
      where: {
        OR: [{ created_by_user_id: params.userId }]
      }
    })
    .then((post) => post.map((p) => formatPostDetails<typeof p>(p)));
}

export type CreatePostParams = {
  company_id: string;
  created_by_user_id: string;
  description: string;
  external_id: string;
  title: string;
  location: string;
  state: string;
  tags_additional: string;
  thumbnail: string;
};

export function createPost(data: CreatePostParams) {
  const CreatePostParamsSchema = z.object({
    company_id: z.string(),
    created_by_user_id: z.string(),
    description: z.string(),
    // employment_type: z.string(),
    title: z.string().min(3).max(100),
    tag_primary: z.string().optional(),
    tags_additional: z.string()
  });

  const validationResult = CreatePostParamsSchema.safeParse(data);
  if (!validationResult.success) return Promise.reject(false);

  const {
    company_id,
    created_by_user_id,
    description,
    external_id,
    location,
    state,
    tags_additional,
    thumbnail,
    title
  } = data;

  return prisma.post.create({
    data: {
      company_id,
      company_name: "",
      created_by_user_id,
      description,
      external_id,
      location,
      state,
      tags: tags_additional.split(",").map((t) => t.trim()),
      thumbnail,
      title
    },
    select: {
      id: true
    }
  });
}

export type EditPostParams = {
  id: string;
  company_id: string;
  created_by_user_id: string;
  description: string;
  title: string;
  location: string;
  state: string;
  tags_additional: string;
  thumbnail: string;
};

export function editPost(data: EditPostParams) {
  const CreatePostParamsSchema = z.object({
    id: z.string().min(1),
    company_id: z.string(),
    description: z.string(),
    // employment_type: z.string(),
    title: z.string().min(3).max(100),
    tag_primary: z.string().optional(),
    tags_additional: z.string()
  });

  const validationResult = CreatePostParamsSchema.safeParse(data);
  if (!validationResult.success) return Promise.reject(false);

  const {
    company_id,
    description,
    // employment_type, // BUG: save employment type
    id,
    location,
    state,
    thumbnail,
    title,
    tags_additional
  } = data;

  return prisma.post.update({
    where: {
      id
    },
    data: {
      company_id,
      description,
      location,
      state,
      thumbnail,
      tags: tags_additional.split(",").map((t) => t.trim()),
      title
    },
    select: {
      id: true
    }
  });
}

export type PublishPostParams = {
  daysToPin?: number;
  daysToPublish?: number;
  postId: string;
};

export async function publishPost(params: PublishPostParams) {
  const post = await getFormattedPostById(params.postId);
  const isPublished = !!post?.published_at;
  if (isPublished) return post;

  const published_at = d.utc().toDate();

  const pinned_until = params.daysToPin
    ? d.utc().add(params.daysToPin, "days").toDate()
    : undefined;
  const publish_until = params.daysToPublish
    ? d.utc().add(params.daysToPublish, "days").toDate()
    : undefined;

  return prisma.post
    .update({
      where: {
        id: params.postId
      },
      data: {
        published_at,
        pinned_until,
        publish_until
      },
      select: postDetailSelect
    })
    .then((post) => formatPostDetails(post));
}

export async function unpublishPost(postId: string) {
  const post = await getFormattedPostById(postId);
  const isNotPublished = !post?.published_at;
  if (isNotPublished) return post;

  return prisma.post.update({
    where: { id: postId },
    data: { published_at: null }
  });
}

export function getFilteredPostsByTag({
  excludeDesc = false,
  skip,
  take,
  tags
}: {
  excludeDesc?: boolean;
  skip: number | undefined;
  take: number | undefined;
  tags: string[];
}): Promise<PostDetails[]> {
  if (tags.length === 0) return Promise.resolve([]);

  const select = excludeDesc
    ? { ...postDetailSelect, description: false }
    : postDetailSelect;

  const where = {
    tags: {
      hasEvery: tags
    },
    published_at: { not: null }
  };

  return prisma.post
    .findMany({
      select,
      skip,
      take,
      where,
      orderBy: [
        {
          pinned_until: {
            sort: "desc",
            nulls: "last"
          }
        },
        {
          published_at: {
            sort: "desc",
            nulls: "last"
          }
        }
      ]
    })
    .then((posts) => posts.map((p) => formatPostDetails(p)));
}

export async function getTotalFilteredPostsByTag(
  tags: string[]
): Promise<number> {
  if (tags.length === 0) return Promise.resolve(0);

  const where = {
    tags: {
      hasEvery: tags
    },
    published_at: { not: null }
  };

  return prisma.post.count({ where });
}

type TagsType = { n: string; c: string };

export async function getPostTags(): Promise<TagsType[]> {
  const key = "get_post_tags";
  const cachedTags = await cache.get<TagsType[]>(key);
  if (cachedTags) {
    console.log("cache hit", key);
    return cachedTags;
  }

  const result: TagsType[] = await prisma.$queryRaw`
    SELECT unnest(tags) AS n, count(*)::text AS c
    FROM posts
    WHERE published_at IS NOT NULL
    GROUP by n
    ORDER BY count(*) DESC;
  `;

  cache.set(key, result);

  return result;
}

export async function getMappedAndSortedTags(): Promise<TagType[]> {
  return [{ id: "all", name: "All" }];
  const tags = await getPostTags();
  return tags.map(({ n }) => ({
    id: n,
    name: n
  }));
  // .sort((a, b) => a.name.localeCompare(b.name));
}
