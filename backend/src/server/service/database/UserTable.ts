import { eq, and, or } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import * as dbModule from "../../../db/index.js";
import * as schema from "../../../db/schema.js";
import * as CommonHelper from "../../common/index.js";

const db = dbModule ? dbModule.db : null;

export const getUsers = async (
  trxId: string,
  filters?: {
    role?: string;
    location?: string;
    availability?: boolean;
    operator?: "and" | "or";
  },
) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }

    const conditions = [];
    if (filters) {
      if (filters.role !== undefined) {
        conditions.push(eq(schema.users.role, filters.role as any));
      }
      if (filters.location !== undefined) {
        conditions.push(eq(schema.users.location, filters.location));
      }
      if (filters.availability !== undefined) {
        conditions.push(eq(schema.users.availability, filters.availability));
      }
    }

    let query = db.select().from(schema.users);
    if (conditions.length > 0) {
      const op = filters?.operator === "or" ? or : and;
      query = query.where(op(...conditions)) as any;
    }

    const result = await query;
    return Promise.resolve(result);
  } catch (error) {
    CommonHelper.log(["UserTable", "Get Users", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const createUser = async (dataObject: any) => {
  const {
    trxId,
    name,
    email,
    role,
    baseRate,
    location,
    availability,
    password,
  } = dataObject;
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const inserted = await db
      .insert(schema.users)
      .values({
        name,
        email,
        role,
        baseRate: baseRate !== undefined ? String(baseRate) : "0.00",
        location: location || null,
        availability: availability !== undefined ? Boolean(availability) : true,
        password: hashedPassword,
      })
      .returning();
    return Promise.resolve(inserted[0]);
  } catch (error) {
    CommonHelper.log(["UserTable", "Create User", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const findUserByEmail = async (email: string, trxId: string) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }

    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return Promise.resolve(result[0] || null);
  } catch (error) {
    CommonHelper.log(["UserTable", "Find User By Email", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};

export const getUserById = async (id: number, trxId: string) => {
  try {
    if (!db) {
      throw new Error("Database connection not established");
    }

    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return Promise.resolve(result[0] || null);
  } catch (error) {
    CommonHelper.log(["UserTable", "Get User By Id", "ERROR"], {
      trxId,
      info: `${error}`,
    });
    return Promise.reject(error);
  }
};
