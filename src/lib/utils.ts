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

export function schoolIdentifierToAcronym(schoolIdentifier: string) {
  return schoolIdentifier
    .split(" ")
    .map((word) => word[0])
    .join("");
}
