import { useCallback, useState } from 'react';

import { signInWithPassword } from '@/features/auth/auth-service';

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
    } catch {
      setErrorMessage('E-mail ou senha inválidos.');
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
