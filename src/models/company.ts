// import { z } from "zod";

import { prisma } from "db";

export type CreateCompanyParams = {
  description: string;
  name: string;
  userId: string;
};

export async function createCompany(params: CreateCompanyParams) {
  return prisma.company.create({
    data: {
      description: params.description,
      name: params.name,
      userId: params.userId,
    },
  });
}

export type EditCompanyParams = {
  id: string;
  name: string;
};

export async function editCompany(params: EditCompanyParams) {
  return prisma.company.update({
    data: {
      name: params.name,
    },
    where: {
      id: params.id,
    },
  });
}

export async function getCompaniesByUserId(userId: string) {
  return prisma.company
    .findMany({
      select: {
        id: true,
        name: true,
        logo_data: true,
      },
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
    })
    .then((c) =>
      c.map(({ logo_data, ...c }) => ({ ...c, hasLogo: !!logo_data }))
    );
}

export async function updateCompanyLogo(
  companyId: string,
  data: Blob
): Promise<{ id: string } | null> {
  const imageBuffer = await data.arrayBuffer();
  const result = await prisma.company
    .update({
      data: {
        logo_data: Buffer.from(imageBuffer),
      },
      where: {
        id: companyId,
      },
      select: {
        id: true,
      },
    })
    .catch((error: any) => {
      console.log("ERROR_UPLOADING_IMAGE", error);
      return null;
    });

  return result;
}

export async function getCompanyLogo(id: string) {
  return prisma.company
    .findUnique({
      where: { id },
      select: {
        logo_data: true,
      },
    })
    .catch((error: any) => {
      console.log("ERROR_GETTING_IMAGE", error);
      return null;
    });
}
