import { prisma } from "db";

export type InsertJobApplicationParams = {
  email: string;
  full_name: string;
  phone_number: string;
  post_id: string;
  resume?: Buffer;
  user_id?: string;
};

export const insertJobApplication = async (
  params: InsertJobApplicationParams
) => {
  const userId =
    params.user_id && params.user_id?.length > 0 ? params.user_id : undefined;
  return prisma.jobApplications.create({
    data: {
      email: params.email,
      full_name: params.full_name,
      is_email_verified: !!params.user_id,
      phone_number: params.phone_number,
      post_id: params.post_id,
      resume_upload: params.resume,
      user_id: userId,
    },
  });
};

export function getJobApplicationsByPostId(postId: string) {
  return prisma.jobApplications.findMany({
    where: {
      post_id: postId,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export function getJobApplicationsByUserId(userId: string) {
  return prisma.jobApplications.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export function getJobApplicationIdsByUserId(userId: string) {
  return prisma.jobApplications.findMany({
    select: {
      post_id: true,
    },
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export function getJobApplicationsByPostIdAndUserId(
  postId: string,
  userId: string
) {
  return prisma.jobApplications.findMany({
    where: {
      post_id: postId,
      user_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}
