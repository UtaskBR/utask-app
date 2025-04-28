'use client';

import { Suspense } from 'react';
import LoginContent from './login-content';

// Componente de fallback para o Suspense
function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-3/4 mx-auto mb-6"></div>
          <div className="h-4 bg-secondary-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-secondary-200 rounded"></div>
          <div className="h-10 bg-secondary-200 rounded"></div>
          <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
          <div className="h-12 bg-secondary-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Componente principal que envolve o conteúdo em um Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
