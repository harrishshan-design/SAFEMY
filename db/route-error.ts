export function toRouteErrorMessage(error: unknown, table: string) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const detail =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${message}\n${detail}`;

  if (combined.includes("no such table") || combined.includes(`from "${table}"`)) {
    return `The ${table} table is unavailable. Generate the migration locally with \`npm run db:generate\`, then deploy so the platform can apply the generated SQL to the real D1 database.`;
  }

  return message;
}
