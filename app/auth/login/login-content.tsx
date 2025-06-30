'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validação básica
    if (!formData.email || !formData.password) {
      setError('Email e senha são obrigatórios');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Usar o parâmetro callbackUrl para garantir o redirecionamento correto
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: callbackUrl
      });
      
      if (result?.error) {
        // The error from NextAuth for custom errors thrown in `authorize`
        // is often the error message itself, or "CredentialsSignin" with the message sometimes embedded.
        // We specifically used `throw new EmailNotVerifiedError()` which has message "EMAIL_NOT_VERIFIED".
        if (result.error === "EMAIL_NOT_VERIFIED" || result.error.includes("EMAIL_NOT_VERIFIED")) {
          setError("Seu email ainda não foi verificado. Por favor, verifique sua caixa de entrada.");
          setShowResendVerification(true);
          setEmailForResend(formData.email);
          setResendStatus('idle'); // Reset resend status
          setResendMessage('');
        } else {
          setError("Email ou senha inválidos. Por favor, tente novamente.");
          setShowResendVerification(false);
        }
        setIsLoading(false);
        return;
      }
      
      if (result?.ok) {
        setShowResendVerification(false); // Clear any resend UI on successful login
        router.push(callbackUrl);
        setTimeout(() => { // Fallback redirection
          window.location.href = callbackUrl;
        }, 500);
      } else {
        // Handle cases where result is not ok and no specific error was caught above
        setError("Falha no login. Por favor, tente novamente.");
        setShowResendVerification(false);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado durante o login.');
      setShowResendVerification(false);
      console.error("Erro no login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!emailForResend) {
      setResendMessage('Email não disponível para reenvio.');
      setResendStatus('error');
      return;
    }
    setResendStatus('loading');
    setResendMessage('');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForResend }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao reenviar o email de verificação.');
      }
      setResendMessage(data.message || 'Email de verificação reenviado com sucesso!');
      setResendStatus('success');
    } catch (err: any) {
      setResendMessage(err.message || 'Ocorreu um erro ao tentar reenviar o email.');
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Ou{' '}
            <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
              crie uma nova conta
            </Link>
          </p>
        </div>
        
        {registered && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-700">Conta criada com sucesso! Faça login para continuar.</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {showResendVerification && (
          <div className="mt-4 p-4 border border-blue-300 bg-blue-50 rounded-md text-center">
            <p className="text-sm text-blue-700 mb-2">
              Seu email (<strong>{emailForResend}</strong>) precisa ser verificado.
            </p>
            <button
              onClick={handleResendVerificationEmail}
              disabled={resendStatus === 'loading'}
              className="w-full text-sm btn-secondary py-2 px-4 disabled:opacity-50"
            >
              {resendStatus === 'loading' ? 'Enviando...' : 'Reenviar email de verificação'}
            </button>
            {resendMessage && (
              <p className={`text-sm mt-2 ${resendStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {resendMessage}
              </p>
            )}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field mt-1"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field mt-1"
                placeholder="Sua senha"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-900">
                Lembrar de mim
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex justify-center items-center"
            >
              {isLoading ? 'Processando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
