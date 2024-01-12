export type SessionUserType =
  | {
      displayName: string;
      email: string;
      photoUrl: string | null;
      userId: string;
    }
  | undefined;
