import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run database migrations");
}

const migrationId = "0000_mysql_hostgator";
const connection = await mysql.createConnection({
  uri: databaseUrl,
  multipleStatements: true,
});

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id varchar(191) NOT NULL,
      applied_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);

  const [applied] = await connection.execute(
    "SELECT id FROM app_migrations WHERE id = ? LIMIT 1",
    [migrationId],
  );

  if (applied.length === 0) {
    const migrationUrl = new URL(
      "../deploy-migrations/0000_mysql_hostgator.sql",
      import.meta.url,
    );
    const migrationSql = await readFile(migrationUrl, "utf8");
    const schemaSql = migrationSql.replace(
      /CREATE INDEX `IDX_certificates_order` ON `certificates` \(`order_id`\);\s*$/,
      "",
    );

    await connection.query(schemaSql);

    const [indexes] = await connection.execute(
      `SELECT 1
         FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'certificates'
          AND index_name = 'IDX_certificates_order'
        LIMIT 1`,
    );
    if (indexes.length === 0) {
      await connection.query(
        "CREATE INDEX `IDX_certificates_order` ON `certificates` (`order_id`)",
      );
    }

    await connection.execute("INSERT INTO app_migrations (id) VALUES (?)", [
      migrationId,
    ]);
    console.log(`Applied migration ${migrationId}`);
  } else {
    console.log(`Migration ${migrationId} is already applied`);
  }
} finally {
  await connection.end();
}
