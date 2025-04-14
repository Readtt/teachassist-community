import {
  betterAuth
} from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import type { Session } from "~/lib/auth-client";
import { encryptPassword } from "~/lib/crypto";
import { emailToStudentId } from "~/lib/utils";
import { db } from "./db";
import { tryCatch } from "./helpers";
import syncTA, { loginTA } from "./teachassist";

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
    before: createAuthMiddleware(async (authCtx) => {
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

        const { error, data } = await tryCatch(loginTA(studentId, password));
        if (error) throw new APIError(500, { message: error.message });

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              taPassword: encryptPassword(taPassword ?? ""),
              studentId,
              loginHtml: data.html,
            },
          },
        };
      }

      if (authCtx.path === "/sign-in/email") {
        const ctx = authCtx as AuthContext<SignInBody>;
        const studentId = emailToStudentId(ctx.body?.email ?? "");
        const password = ctx.body?.password;

        const { error, data } = await tryCatch(loginTA(studentId, password));
        if (error) throw new APIError(500, { message: error.message });

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              loginHtml: data.html,
            },
          },
        };
      }
    }),
    after: createAuthMiddleware(async (authCtx) => {
      if (authCtx.path === "/sign-up/email") {
        const ctx = authCtx as AuthContext<SignUpBody & { loginHtml: string }>;
        if (ctx.body?.loginHtml) {
          const { error } = await syncTA({
            bypassLimit: true,
            html: ctx.body.loginHtml,
            manualSession: authCtx.context.newSession as Session,
          });
          console.log(error);
        }
      }

      if (authCtx.path === "/sign-in/email") {
        const ctx = authCtx as AuthContext<SignInBody & { loginHtml: string }>;
        if (ctx.body?.loginHtml) {
          const { error } = await syncTA({
            bypassLimit: true,
            html: ctx.body.loginHtml,
            manualSession: authCtx.context.newSession as Session,
          });
          console.log(error);
        }
      }
    }),
  },
});
