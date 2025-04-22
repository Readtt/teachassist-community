import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "~/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseURL() {
  return env.BETTER_AUTH_URL;
}

export function emailToStudentId(email: string) {
  return email.split("@")[0]!;
}

export function studentIdToEmail(studentId: string) {
  return studentId + "@gapps.yrdsb.ca";
}

export function classCodeToGlobalCode(classCode: string) {
  return classCode.split("-")[0]!;
}

export function schoolIdentifierToAcronym(schoolIdentifier: string): string {
  const SCHOOL_REPLACEMENTS: Record<string, string> = {
    "district high school": "D.H.S.",
    "secondary school": "S.S.",
    "high school": "H.S.",
    "collegiate institute": "C.I.",
    "district secondary school": "D.S.S.",
  };

  const sortedKeys = Object.keys(SCHOOL_REPLACEMENTS).sort(
    (a, b) => b.length - a.length,
  );

  const pattern = new RegExp(sortedKeys.join("|"), "gi");

  return schoolIdentifier.replace(pattern, (match) => {
    const normalized = match.toLowerCase();
    return SCHOOL_REPLACEMENTS[normalized] ?? match;
  });
}
