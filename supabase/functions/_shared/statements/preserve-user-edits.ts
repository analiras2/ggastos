// Importing a statement again upserts rows that already exist. Those rows may have been edited by
// the user since the first import, so the edited columns must survive the upsert.

export type ExistingUserEdits = {
  internal_category_id: string | null;
  note: string | null;
};

type EditableImportedRow = {
  statement_source_fingerprint: string;
  internal_category_id: string | null;
  note: string | null;
};

// For rows that already exist, keeps the category and note stored in the database. A stored
// category always wins; when there is none yet, the category resolved by the rules is used.
export function preserveUserEdits<Row extends EditableImportedRow>(
  rows: readonly Row[],
  existingByFingerprint: ReadonlyMap<string, ExistingUserEdits>,
): Row[] {
  return rows.map((row) => {
    const existing = existingByFingerprint.get(row.statement_source_fingerprint);
    if (!existing) {
      return row;
    }

    return {
      ...row,
      internal_category_id: existing.internal_category_id ?? row.internal_category_id,
      note: existing.note ?? row.note,
    };
  });
}
