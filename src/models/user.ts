import type { Password, User } from "@prisma/client";
import { UserResourceType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "db";
import { sendWelcomeEmail } from "models/email";
import { EmailTypes } from "~/types/email.type";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByUid(uid: string) {
  return prisma.user.findUnique({ where: { firebase_uid: uid } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      firebase_uid: email, // COMMENT: This is a hack to make the user's email their firebase_uid
    },
  });
}

export async function createUser2(
  uid: string,
  email: string = "",
  full_name: string,
  photoUrl?: string
) {
  const result = await prisma.user.create({
    data: {
      email,
      full_name,
      firebase_uid: uid,
      photo_url: photoUrl,
    },
  });

  // Sends Welcome Email
  await sendWelcomeEmail({
    recipientEmail: email,
    recipientName: full_name || "New User",
    type: EmailTypes.WELCOME_EMAIL,
  });

  return result;
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

const alphaNumericCharsOnly = new RegExp(/^[a-zA-Z0-9 ]*$/);

export const updateUserNameAndBioSchema = z.object({
  fullname: z
    .string()
    .trim()
    .regex(alphaNumericCharsOnly, "Full name contains invalid characters")
    .min(3, "Full name cannot be less than 3 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  bio: z
    .string()
    .trim()
    .min(20, "Bio cannot be less than 20 characters")
    .max(1000, "Bio cannot be exceed 1000 characters")
    .or(z.string().trim().length(0)),
  role: z.enum(["WORKER", "HIRING"], {
    description: "User Role",
    invalid_type_error: "Role is invalid",
  }),
});

export async function updateUserNameAndBio(
  userId: any,
  options: any
): Promise<User> {
  const values = updateUserNameAndBioSchema.safeParse(options);

  if (!values.success) {
    throw new Error(values.error.message);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      full_name: values.data.fullname,
      bio: values.data.bio,
      role: values.data.role,
    },
  });
}

export async function insertUserProfilePhoto(
  userId: string,
  data: Blob
): Promise<{ id: string } | null> {
  const imageBuffer = await data.arrayBuffer();
  const result = await prisma.userResource
    .create({
      data: {
        userId: userId,
        type: UserResourceType.PROFILE_PHOTO,
        data: Buffer.from(imageBuffer),
      },
      select: {
        id: true,
      },
    })
    .catch((error: any) => {
      console.log("ERROR_UPLOADING_IMAGE", error);
      return null;
    });

  if (result) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        profile_image_resource_id: result.id,
      },
    });
  }

  return result;
}

export async function getUserProfilePhoto(userResId: string) {
  return prisma.userResource
    .findUnique({
      where: { id: userResId },
      select: {
        data: true,
      },
    })
    .catch((error: any) => {
      console.log("ERROR_GETTING_IMAGE", error);
      return null;
    });
}

export async function getUsers() {
  return prisma.user.findMany();
}
