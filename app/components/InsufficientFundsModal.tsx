'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Or use Link for navigation

interface InsufficientFundsModalProps {
  show: boolean;
  onClose: () => void;
}

const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({ show, onClose }) => {
  const router = useRouter();

  if (!show) {
    return null;
  }

  const handleGoToWallet = () => {
    onClose(); // Close modal first
    router.push('/carteira');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center">
        <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
          Saldo Insuficiente
        </h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Você não possui saldo suficiente em sua carteira para aceitar esta proposta.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Por favor, realize um depósito para continuar.
          </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            onClick={handleGoToWallet}
            className="w-full sm:w-auto btn-primary inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Depositar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto btn-outline inline-flex justify-center rounded-md border px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsufficientFundsModal;
