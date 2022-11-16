import crypto from "crypto";
const PASSWORD_SALT = process.env.PASSWORD_SALT ?? "";

export function passwordToHash(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}
