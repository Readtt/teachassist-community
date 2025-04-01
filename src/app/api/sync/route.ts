import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { SyncResponse } from "~/common/types/sync";
import { decryptPassword } from "~/lib/crypto";
import { auth } from "~/server/auth";
import { tryCatch } from "~/server/helpers";
import syncTA from "~/server/sync";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: "You are unauthenticated", success: false },
      { status: 401 },
    );
  }

  const { error } = await tryCatch(
    syncTA(
      session.user.studentId ?? "",
      decryptPassword(session.user.taPassword ?? ""),
    ),
  );

  const response: SyncResponse = {
    success: !error,
    error: error?.message ?? null,
  };

  return NextResponse.json(response);
}
