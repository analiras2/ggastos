import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

type HttpErrorResponse = {
  json: () => Promise<unknown>;
};

function isHttpErrorResponse(value: unknown): value is HttpErrorResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'json' in value && typeof value.json === 'function';
}

// The Edge Function answers errors with a JSON body that carries a readable `message`.
export function getHttpErrorMessage(error: FunctionsHttpError): Promise<string | null> {
  const response = error.context;
  if (!isHttpErrorResponse(response)) {
    return Promise.resolve(null);
  }

  return response.json()
    .then((body: unknown) => {
      if (!body || typeof body !== 'object' || !('message' in body)) {
        return null;
      }

      const { message } = body;
      return typeof message === 'string' && message.trim().length > 0 ? message : null;
    })
    .catch(() => null);
}

export function formatImportError(error: unknown): string {
  if (error instanceof FunctionsRelayError) {
    return 'A relay do Supabase não conseguiu encaminhar a importação.';
  }

  if (error instanceof FunctionsFetchError) {
    return 'O app não conseguiu alcançar a Edge Function de importação.';
  }

  if (error instanceof FunctionsHttpError) {
    return 'A fatura não pôde ser importada. Verifique o banco selecionado e o arquivo CSV.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível importar a fatura.';
}
