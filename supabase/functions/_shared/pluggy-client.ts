export type PluggyItemStatus =
  | "UPDATING"
  | "LOGIN_ERROR"
  | "OUTDATED"
  | "WAITING_USER_INPUT"
  | "UPDATED";

export type PluggyItem = {
  id: string;
  status: PluggyItemStatus;
  executionStatus: string;
  connector: { id: number; name: string };
  lastUpdatedAt: string | null;
  statusDetail?: {
    accounts?: { message?: string | null } | null;
    transactions?: { message?: string | null } | null;
  } | null;
};

export type PluggyBankData = {
  transferNumber?: string | null;
  closingBalance?: number | null;
  automaticallyInvestedBalance?: number | null;
  overdraftContractedLimit?: number | null;
  overdraftUsedLimit?: number | null;
  unarrangedOverdraftAmount?: number | null;
} | null;

export type PluggyCreditData = {
  level?: string | null;
  brand?: string | null;
  balanceCloseDate?: string | null;
  balanceDueDate?: string | null;
  availableCreditLimit?: number | null;
  creditLimit?: number | null;
  minimumPayment?: number | null;
  status?: string | null;
} | null;

export type PluggyAccount = {
  id: string;
  itemId: string;
  type: "BANK" | "CREDIT";
  subtype: string;
  number: string;
  name: string;
  marketingName: string | null;
  balance: number;
  currencyCode: string;
  taxNumber: string | null;
  owner: string | null;
  bankData: PluggyBankData;
  creditData: PluggyCreditData;
};

export type PluggyMerchant = {
  name: string | null;
  businessName: string | null;
  cnpj: string | null;
  category: string | null;
} | null;

export type PluggyCreditCardMetadata = {
  installmentNumber: number | null;
  totalInstallments: number | null;
  totalAmount: number | null;
} | null;

export type PluggyTransaction = {
  id: string;
  accountId: string;
  description: string;
  descriptionRaw: string | null;
  amount: number;
  date: string;
  balance: number | null;
  currencyCode: string;
  category: string | null;
  categoryId: string | null;
  providerCode: string | null;
  type: "DEBIT" | "CREDIT";
  status: "PENDING" | "POSTED";
  creditCardMetadata: PluggyCreditCardMetadata;
  merchant: PluggyMerchant;
  createdAt: string;
  updatedAt: string;
};

export class PluggyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PluggyAuthError";
  }
}

export class PluggyApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "PluggyApiError";
  }
}

function extractPluggyErrorMessage(rawBody: string): string {
  if (!rawBody.trim()) {
    return "(empty response body)";
  }

  try {
    const parsed = JSON.parse(rawBody) as { message?: unknown; error?: unknown };
    if (typeof parsed.message === "string") {
      return parsed.message;
    }
    if (typeof parsed.error === "string") {
      return parsed.error;
    }
  } catch {
    // Not JSON — fall through to raw text.
  }

  return rawBody;
}

export type PluggyClientConfig = {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
};

const API_KEY_TTL_MS = 1000 * 60 * 110; // Pluggy expires it at 2h; refresh 10min early.
const MAX_TRANSACTION_PAGES = 20; // Safety cap: 20 x 500 = 10,000 transactions per account per sync.

export class PluggyClient {
  private readonly config: PluggyClientConfig;
  private apiKey: string | null = null;
  private apiKeyExpiresAt = 0;

  constructor(config: PluggyClientConfig) {
    this.config = config;
  }

  private async authenticate(): Promise<string> {
    const now = Date.now();
    if (this.apiKey && now < this.apiKeyExpiresAt) {
      return this.apiKey;
    }

    const response = await fetch(`${this.config.baseUrl}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      }),
    });

    if (response.status === 401) {
      throw new PluggyAuthError(
        "Pluggy rejected the configured clientId/clientSecret.",
      );
    }
    if (!response.ok) {
      throw new PluggyApiError(
        `Pluggy auth failed with status ${response.status}`,
        response.status,
      );
    }

    const body = (await response.json()) as { apiKey: string };
    this.apiKey = body.apiKey;
    this.apiKeyExpiresAt = now + API_KEY_TTL_MS;
    return this.apiKey;
  }

  private async request<T>(
    path: string,
    init?: { method?: string; body?: unknown },
  ): Promise<T> {
    const apiKey = await this.authenticate();
    const response = await fetch(`${this.config.baseUrl}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        "X-API-KEY": apiKey,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });

    if (response.status === 401) {
      throw new PluggyAuthError("Pluggy API key was rejected.");
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new PluggyApiError(
        `Pluggy request failed (${response.status}) for ${path}: ${extractPluggyErrorMessage(errorText)}`,
        response.status,
      );
    }

    return response.json() as Promise<T>;
  }

  fetchItem(itemId: string): Promise<PluggyItem> {
    return this.request<PluggyItem>(`/items/${itemId}`);
  }

  /**
   * Issues a short-lived Connect Token, scoped to opening the hosted Connect
   * Widget (never the full API key) — safe to hand to the mobile client.
   * Passing `itemId` puts the widget in "update" mode, letting the user
   * re-authenticate a specific existing item instead of creating a new one.
   */
  createConnectToken(
    options: { clientUserId?: string; itemId?: string } = {},
  ): Promise<{ accessToken: string }> {
    const { itemId, ...rest } = options;
    return this.request<{ accessToken: string }>("/connect_token", {
      method: "POST",
      body: {
        ...(itemId ? { itemId } : {}),
        options: rest,
      },
    });
  }

  async fetchAccounts(itemId: string): Promise<PluggyAccount[]> {
    const page = await this.request<{ results: PluggyAccount[] }>(
      `/accounts?itemId=${itemId}`,
    );
    return page.results;
  }

  async fetchTransactions(accountId: string): Promise<PluggyTransaction[]> {
    const transactions: PluggyTransaction[] = [];
    let query = `accountId=${accountId}`;

    for (let page = 0; page < MAX_TRANSACTION_PAGES; page++) {
      const response = await this.request<{
        results: PluggyTransaction[];
        next: string | null;
      }>(`/v2/transactions?${query}`);

      transactions.push(...response.results);

      if (!response.next) {
        break;
      }
      query = response.next.replace(/^\?/, "");
    }

    return transactions;
  }
}
