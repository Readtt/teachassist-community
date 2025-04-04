import type { Course } from "./teachassist";

export interface ReportsResponse {
    error: string | null;
    courses: Course[]
}