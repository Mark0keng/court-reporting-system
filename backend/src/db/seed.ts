import "dotenv/config";
import bcryptjs from "bcryptjs";
import * as dbModule from "./index.js";
import * as schema from "./schema.js";

async function main() {
  const db = dbModule.db;
  if (!db) {
    console.error("Database Error");
    process.exit(1);
  }

  try {
    // 1. Clear old data
    await db.delete(schema.payments);
    await db.delete(schema.transcripts);
    await db.delete(schema.jobs);
    await db.delete(schema.users);

    // 2. Users Data
    const usersList = await db
      .insert(schema.users)
      .values([
        {
          name: "Ahmad Subardjo",
          email: "ahmad@court.go.id",
          role: "reporter",
          baseRate: "2500.00",
          password: bcryptjs.hashSync("reporter123", 10),
          location: "Jakarta",
          availability: true,
        },
        {
          name: "Bambang Tri",
          email: "bambang@court.go.id",
          role: "reporter",
          baseRate: "2500.00",
          password: bcryptjs.hashSync("reporter456", 10),
          location: "Surabaya",
          availability: true,
        },
        {
          name: "Rina Wijaya",
          email: "rina@court.go.id",
          role: "editor",
          baseRate: "150000.00",
          password: bcryptjs.hashSync("editor123", 10),
          location: "Surabaya",
          availability: true,
        },
        {
          name: "Budi Santoso",
          email: "budi@court.go.id",
          role: "admin",
          baseRate: "0.00",
          password: bcryptjs.hashSync("admin123", 10),
          location: "Jakarta",
          availability: true,
        },
      ])
      .returning();

    // 3. Jobs Data
    const jobsList = await db
      .insert(schema.jobs)
      .values([
        {
          title: "Sidang Perkara No. 12/Pdt.G/2026/PN.JKT.SEL",
          description:
            "Sidang pemeriksaan saksi ahli kasus perdata sengketa tanah.",
          audioUrl: "https://storage.court.go.id/audio1.mp3",
          audioDurationSeconds: 3600,
          status: "NEW",
          location: "Jakarta",
          reporterId: null,
          editorId: null,
          reporterRatePerMinute: null,
          editorFlatFee: null,
        },
        {
          title: "Sidang Perkara No. 45/Pid.B/2026/PN.JKT.TIM",
          description:
            "Sidang pembacaan eksepsi terdakwa kasus kelalaian lalu lintas.",
          audioUrl: "https://storage.court.go.id/audio2.mp3",
          audioDurationSeconds: 1800,
          status: "NEW",
          location: "remote",
          reporterId: null,
          editorId: null,
          reporterRatePerMinute: null,
          editorFlatFee: null,
        },
      ])
      .returning();

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
