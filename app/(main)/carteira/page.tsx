'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import toast from 'react-hot-toast';

export default function CarteiraPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionForm, setTransactionForm] = useState<TransactionForm>({
    amount: '',
    type: 'DEPOSIT',
    description: ''
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch('/api/wallet');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar carteira');
        }
        
        const data = await response.json();
        setWallet(data);
      } catch (error) {
        console.error('Erro ao buscar carteira:', error);
        toast.error('Não foi possível carregar os dados da carteira');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWallet();
  }, []);

  interface TransactionForm {
    amount: string;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    description: string;
  }

  interface TransactionChangeEvent extends React.ChangeEvent<HTMLInputElement | HTMLSelectElement> {}

  const handleTransactionChange = (e: TransactionChangeEvent) => {
    const { name, value } = e.target;
    setTransactionForm((prev: TransactionForm) => ({ ...prev, [name]: value }));
  };

  interface TransactionResponse {
    id: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'RECEIPT';
    description: string | null;
    createdAt: string;
  }

  interface WalletResponse {
    balance: number;
    transactions: TransactionResponse[];
  }

  const handleTransactionSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response: Response = await fetch('/api/wallet/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(transactionForm.amount),
          type: transactionForm.type,
          description: transactionForm.description
        })
      });
      
      if (!response.ok) {
        const data: { error?: string } = await response.json();
        throw new Error(data.error || 'Erro ao processar transação');
      }
      
      // Recarregar dados da carteira
      const walletResponse: Response = await fetch('/api/wallet');
      const walletData: WalletResponse = await walletResponse.json();
      setWallet(walletData);
      
      // Limpar formulário
      setTransactionForm({
        amount: '',
        type: 'DEPOSIT',
        description: ''
      });
      
      setShowTransactionForm(false);
      
      toast.success('Transação realizada com sucesso');
    } catch (error: unknown) {
      console.error('Erro ao processar transação:', error);
      toast.error((error as Error).message || 'Não foi possível processar a transação');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar valor monetário
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">Carteira Virtual</h1>
        
        {isLoading && !wallet ? (
          <div className="flex justify-center items-center h-64">
            <p>Carregando dados da carteira...</p>
          </div>
        ) : (
          <>
            {/* Saldo */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-secondary-600">Saldo Disponível</h2>
                  <p className="text-3xl font-bold text-primary-600 mt-1">
                    {formatCurrency(wallet?.balance || 0)}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowTransactionForm(!showTransactionForm)}
                  className="btn-primary py-2 px-4"
                >
                  {showTransactionForm ? 'Cancelar' : 'Nova Transação'}
                </button>
              </div>
              
              {/* Formulário de Transação */}
              {showTransactionForm && (
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">Nova Transação</h3>
                  
                  <form onSubmit={handleTransactionSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-secondary-700">
                        Tipo de Transação
                      </label>
                      <select
                        id="type"
                        name="type"
                        className="input-field mt-1"
                        value={transactionForm.type}
                        onChange={handleTransactionChange}
                      >
                        <option value="DEPOSIT">Depósito</option>
                        <option value="WITHDRAWAL">Saque</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-secondary-700">
                        Valor (R$)
                      </label>
                      <input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field mt-1"
                        placeholder="0,00"
                        value={transactionForm.amount}
                        onChange={handleTransactionChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
                        Descrição (opcional)
                      </label>
                      <input
                        id="description"
                        name="description"
                        type="text"
                        className="input-field mt-1"
                        placeholder="Descrição da transação"
                        value={transactionForm.description}
                        onChange={handleTransactionChange}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary py-2 px-4"
                      >
                        {isLoading ? 'Processando...' : 'Confirmar'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            {/* Histórico de Transações */}
            <div>
              <h2 className="text-xl font-bold text-secondary-900 mb-4">Histórico de Transações</h2>
              
              {wallet?.transactions?.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">Nenhuma transação</h3>
                  <p className="text-secondary-600 mb-4">
                    Você ainda não realizou nenhuma transação.
                  </p>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {wallet?.transactions?.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'DEPOSIT' || transaction.type === 'RECEIPT'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'DEPOSIT'
                                ? 'Depósito'
                                : transaction.type === 'WITHDRAWAL'
                                ? 'Saque'
                                : transaction.type === 'PAYMENT'
                                ? 'Pagamento'
                                : 'Recebimento'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                            {transaction.description || '-'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                            transaction.type === 'DEPOSIT' || transaction.type === 'RECEIPT'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'DEPOSIT' || transaction.type === 'RECEIPT' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
