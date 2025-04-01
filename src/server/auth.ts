import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { encryptPassword } from "~/lib/crypto";
import { db } from "./db";
import { tryCatch } from "./helpers";
import { loginTA } from "./teachassist";
import { emailToStudentId } from "~/lib/utils";

type AuthContext<T> = {
  path: string;
  body?: T;
};

type SignUpBody = {
  email: string;
  password: string;
  name: string;
  taPassword: string;
  studentId: string;
};

type SignInBody = {
  email: string;
  password: string;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      taPassword: {
        type: "string",
        required: true,
      },
      studentId: {
        type: "string",
        required: true,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (authCtx: AuthContext<unknown>) => {
      if (authCtx.path === "/sign-up/email") {
        const ctx = authCtx as AuthContext<SignUpBody>;
        const studentIdFromEmail = emailToStudentId(ctx.body?.email ?? "");
        const studentId = ctx.body?.studentId;
        const password = ctx.body?.password;
        const taPassword = ctx.body?.taPassword;

        if (studentIdFromEmail !== studentId)
          throw new APIError("CONFLICT", {
            message: "School email and student id do not match.",
          });

        if (password !== taPassword)
          throw new APIError("CONFLICT", {
            message: "Password and ta password do not match.",
          });

        const { error } = await tryCatch(loginTA(studentId, password ?? ""));

        if (error)
          throw new APIError("FORBIDDEN", {
            message: error.message,
          });

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              taPassword: encryptPassword(taPassword ?? ""),
              studentId,
            },
          },
        };
      }

      if (authCtx.path === "/sign-in/email") {
        const ctx = authCtx as AuthContext<SignInBody>;
        const studentId = emailToStudentId(ctx.body?.email ?? "");
        const password = ctx.body?.password;

        const { error } = await tryCatch(loginTA(studentId, password ?? ""));

        if (error)
          throw new APIError("FORBIDDEN", {
            message: error.message,
          });
      }
    }),
  },
});
