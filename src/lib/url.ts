import * as urlSlug from "url-slug";

type PostUrlParams = {
  company?: { name?: string } | null;
  company_name: string;
  id: string;
  title: string;
} | null;

export function genPostUrl(post: PostUrlParams): string {
  if (!post) return "";
  const companyName = (post.company?.name || post.company_name).replaceAll(
    " ",
    "-"
  );
  const slugText = `${companyName}__${post.title}__${post.id}`;
  const dictionary = { "%": "percent" };
  return `/p/${urlSlug.convert(slugText, { dictionary })}`;
}

export function getTagsUrl(tags: string[]): string {
  return `/t/${tags.map(encodeURIComponent).join("--")}`;
}

export const tagRoutes = [
  { tags: ["remote"], title: "Remote Software Engineers" },
  { tags: ["remote", "javascript"], title: "Remote Javascript Engineers" },
  { tags: ["remote", "frontend"], title: "Remote Frontend Engineers" },
  { tags: ["remote", "backend"], title: "Remote Backend Engineers" },
  { tags: ["remote", "fullstack"], title: "Remote Fullstack Engineers" },
  { tags: ["react"], title: "React Engineers" },
  { tags: ["react", "senior"], title: "Senior React Engineers" },
  { tags: ["react", "lead"], title: "Lead React Engineers" },
  { tags: ["rust"], title: "Rust Engineers" },
  { tags: ["golang"], title: "Golang Engineers" },
  { tags: ["c#"], title: "C# Engineers" },
  { tags: [".net"], title: "DotNet Engineers" },
  { tags: ["blockchain"], title: "Blockchain Engineers" },
  { tags: ["solidity"], title: "Solidity Engineers" }
];
