import crypto from "crypto";
import { env } from "~/env";

const algorithm = "aes-256-cbc";

// Generate a key from the environment variable
const key = crypto.createHash("sha256").update(env.TA_AUTH_SECRET).digest();
const iv = crypto.randomBytes(16);

export function encryptPassword(password: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptPassword(encryptedPassword: string): string {
  const textParts = encryptedPassword.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
