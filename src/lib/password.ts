import { randomBytes, scrypt, timingSafeEqual } from "crypto";

//turn a password and a random salt into a hash
function passwordKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await passwordKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!/^[a-f0-9]{32}$/.test(salt || "") || !/^[a-f0-9]{128}$/.test(hash || "")) return false;
  const key = await passwordKey(password, salt);
  return timingSafeEqual(key, Buffer.from(hash, "hex"));
}
