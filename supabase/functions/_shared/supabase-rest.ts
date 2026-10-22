export type SupabaseRestConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
};

export async function supabaseRest<T>(
  config: SupabaseRestConfig,
  path: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase REST request failed (${response.status}) for ${path}: ${errorText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  if (responseText.trim().length === 0) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}
