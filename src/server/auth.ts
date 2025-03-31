import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { encryptPassword } from "~/lib/crypto";
import { db } from "./db";
import { tryCatch } from "./helpers";
import { loginTA } from "./teachassist";

type AuthContext = {
  path: string;
  body?: { email: string; password: string };
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
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx: AuthContext) => {
      if (ctx.path !== "/sign-up/email" && ctx.path !== "/sign-in/email") {
        return;
      }

      const studentId = ctx.body?.email.split("@")[0];
      const password = ctx.body?.password;
      const { error } = await tryCatch(
        loginTA(studentId ?? "", password ?? ""),
      );

      if (error)
        throw new APIError("FORBIDDEN", {
          message: error.message,
        });

      if (ctx.path == "/sign-up/email") {
        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              taPassword: encryptPassword(
                (ctx.body as unknown as { taPassword: string })?.taPassword,
              ),
            },
          },
        };
      }
    }),
  },
});
