import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function emailToStudentId(email: string) {
  return email.split("@")[0]!;
}

export function studentIdToEmail(studentId: string) {
  return studentId + "@gapps.yrdsb.ca";
}