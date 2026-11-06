import type { AuthUser } from "../auth.ts";
import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";
import { asNonEmptyString } from "./text.ts";

function buildProfilePayload(user: AuthUser) {
  const displayName =
    asNonEmptyString(user.user_metadata?.display_name) ??
    asNonEmptyString(user.user_metadata?.name) ??
    asNonEmptyString(user.app_metadata?.display_name);
  const locale =
    asNonEmptyString(user.user_metadata?.locale) ??
    asNonEmptyString(user.app_metadata?.locale) ??
    "pt-BR";

  return {
    id: user.id,
    email: asNonEmptyString(user.email) ?? `${user.id}@users.ggastos.local`,
    display_name: displayName,
    locale,
  };
}

// The import writes rows owned by the user, so the profile row must exist first.
export async function ensureProfile(config: SupabaseRestConfig, user: AuthUser): Promise<void> {
  await supabaseRest<void>(config, "/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(buildProfilePayload(user)),
  });
}
