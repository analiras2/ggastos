import { useCallback, useState } from 'react';

import { AuthApiError } from '@supabase/supabase-js';

import { signInWithPassword } from '@/features/auth/auth-service';

const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha inválidos.';
const UNKNOWN_ERROR_MESSAGE = 'Não foi possível entrar. Tente novamente.';

function describeLoginError(error: unknown): string {
  if (error instanceof AuthApiError && error.code === 'invalid_credentials') {
    return INVALID_CREDENTIALS_MESSAGE;
  }

  if (error instanceof Error && error.message) {
    return `Não foi possível entrar: ${error.message}`;
  }

  return UNKNOWN_ERROR_MESSAGE;
}

interface LoginViewModel {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  canSubmit: boolean;
  handleSubmit: () => Promise<void>;
}

export function useLoginViewModel(): LoginViewModel {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signInWithPassword(email.trim(), password);
    } catch (error) {
      setErrorMessage(describeLoginError(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, email, password]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    errorMessage,
    canSubmit,
    handleSubmit,
  };
}
