import { getStudentTAInfo } from "./teachassist";

export default async function syncTA(studentId: string, password: string) {
  const data = await getStudentTAInfo(studentId, password);
}
