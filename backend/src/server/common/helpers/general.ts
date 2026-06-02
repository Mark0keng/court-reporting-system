import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "crs-super-secret-key-2026";

export const Boom = {
  badRequest: (message: string | Error) => {
    const msg = message instanceof Error ? message.message : String(message);
    const err: any = new Error(msg);
    err.statusCode = 400;
    err.status = 400;
    return err;
  },
  notFound: (message: string | Error) => {
    const msg = message instanceof Error ? message.message : String(message);
    const err: any = new Error(msg);
    err.statusCode = 404;
    err.status = 404;
    return err;
  },
  forbidden: (message: string | Error) => {
    const msg = message instanceof Error ? message.message : String(message);
    const err: any = new Error(msg);
    err.statusCode = 403;
    err.status = 403;
    return err;
  },
  unauthorized: (message: string | Error) => {
    const msg = message instanceof Error ? message.message : String(message);
    const err: any = new Error(msg);
    err.statusCode = 401;
    err.status = 401;
    return err;
  },
};

export function preHandler(req: any, res: any, next: any) {
  const trxId =
    req.headers.trxId || req.headers["x-transaction-id"] || randomUUID();
  req.headers.trxId = trxId;
  req.trxId = trxId;
  res.setHeader("X-Transaction-ID", trxId);
  next();
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
