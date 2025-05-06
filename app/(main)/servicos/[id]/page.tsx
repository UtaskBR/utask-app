'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ServiceDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const serviceId = params.id;

  type Photo = { id: string; url: string };
  type Bid = {
    id: string;
    providerId: string;
    provider: { name: string; rating: number };
    price?: number;
    message?: string;
    proposedDate?: string;
    status: string;
  };
  type Service = {
    id: string;
    title: string;
    description: string;
    price?: number;
    date?: string;
    timeWindow?: number;
    address?: string;
    profession?: { name: string };
    status: string;
    creatorId: string;
    creator: { id: string; name: string; rating: number; about?: string };
    photos?: Photo[];
    bids?: Bid[];
  };

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidForm, setBidForm] = useState({
    price: '',
    message: '',
    proposedDate: ''
  });
  const [showBidForm, setShowBidForm] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${serviceId}`);

        if (!response.ok) {
          throw new Error('Serviço não encontrado');
        }

        const data = await response.json();
        setService(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBidForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBidSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session) {
      setError('Você precisa estar logado para fazer uma proposta');
      return;
    }

    try {
      const response = await fetch(`/api/services/${serviceId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price: bidForm.price ? parseFloat(bidForm.price) : null,
          message: bidForm.message,
          proposedDate: bidForm.proposedDate || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar proposta');
      }

      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExecutionAction = async (action: 'CONFIRM' | 'PROBLEM') => {
    try {
      const res = await fetch(`/api/services/${serviceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao executar ação');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
        <div className="mt-6">
          <Link href="/explorar" className="btn-primary">
            Voltar para Explorar
          </Link>
        </div>
      </div>
    );
  }

  if (!service) return null;

  const isCreator = session?.user?.id === service.creator?.id;
  const canBid = !isCreator && service.status === 'OPEN';
  const hasUserBid = service.bids?.some(bid => bid.providerId === session?.user?.id);
  const isProvider = service.bids?.some(b => b.providerId === session?.user?.id);

  async function handleAccept(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/services/${serviceId}/bids/${id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao aceitar proposta');
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erro ao aceitar proposta');
    }
  }

  async function handleCounterProposal(id: string): Promise<void> {
    const newPrice = prompt('Digite o valor da contra-proposta (R$):');
    if (newPrice === null) return; // Cancelled

    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Por favor, insira um valor válido para a contra-proposta.');
      return;
    }

    try {
      const response = await fetch(`/api/services/${serviceId}/bids/${id}/counter`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: priceValue })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar contra-proposta');
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar contra-proposta');
    }
  }

  async function handleReject(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/services/${serviceId}/bids/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao rejeitar proposta');
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erro ao rejeitar proposta');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Link href="/explorar" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Voltar para Explorar
          </Link>
          <h1 className="text-2xl font-bold text-secondary-900">{service.title}</h1>
          <div className="mt-1">
            <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
              service.status === 'OPEN' ? 'bg-green-100 text-green-800' :
              service.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              service.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
              'bg-red-100 text-red-800'
            }`}>
              {service.status === 'OPEN' ? 'Aberto' :
               service.status === 'IN_PROGRESS' ? 'Em Andamento' :
               service.status === 'COMPLETED' ? 'Concluído' :
               'Cancelado'}
            </span>
          </div>
          {service.price ? (
            <div className="mt-2 text-xl font-bold text-primary-600">
              R$ {service.price.toFixed(2)}
            </div>
          ) : (
            <div className="mt-2 text-secondary-600">Aberto a propostas</div>
          )}
        </div>

        {service.photos?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-6 border-b border-gray-200">
            {service.photos.slice(0, 5).map((photo) => (
              <div key={photo.id} className="aspect-square overflow-hidden rounded-md">
                <img
                  src={photo.url}
                  alt="Foto do serviço"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/fallback-image.png";
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-medium text-secondary-900">Descrição</h2>
            <p className="mt-2 text-secondary-600 whitespace-pre-line">{service.description}</p>
          </div>
          {service.date && (
            <div>
              <h2 className="text-lg font-medium text-secondary-900">Data e Hora</h2>
              <p className="mt-2 text-secondary-600">
                {new Date(service.date).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {service.timeWindow && ` (Janela de ${service.timeWindow} minutos)`}
              </p>
            </div>
          )}
          {service.address && (
            <div>
              <h2 className="text-lg font-medium text-secondary-900">Localização</h2>
              <p className="mt-2 text-secondary-600">{service.address}</p>
            </div>
          )}
          {service.profession && (
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {service.profession.name}
              </span>
            </div>
          )}
        </div>
          {service.status === 'IN_PROGRESS' && (isCreator || isProvider) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">Ações de Execução</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="btn-primary w-full sm:w-auto"
                  onClick={() => handleExecutionAction('CONFIRM')}
                >
                  Confirmar Conclusão
                </button>
                <button
                  className="btn-warning w-full sm:w-auto"
                  onClick={() => handleExecutionAction('PROBLEM')}
                >
                  Temos um Problema
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-4">Publicado por</h2>
          <Link href={`/perfil/${service.creator.id}`} className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium text-xl">
                {service.creator.name.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-base font-medium text-secondary-900">{service.creator.name}</p>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-sm text-secondary-600">{service.creator.rating}</span>
              </div>
            </div>
          </Link>
          {service.creator.about && (
            <p className="mt-4 text-secondary-600 text-sm">{service.creator.about}</p>
          )}
          <div className="mt-6">
            <Link href={`/perfil/${service.creator.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver perfil completo
            </Link>
          </div>
        </div>
        {isCreator && service.bids && service.bids.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-bold">Propostas Recebidas</h3>
            {service.bids.map((bid) => (
              <div key={bid.id} className="bg-white shadow-md rounded-lg p-6">
                <p><strong>Prestador:</strong> {bid.provider.name}</p>
                <p><strong>Mensagem:</strong> {bid.message}</p>
                <p><strong>Valor:</strong> R$ {bid.price}</p>
                <p><strong>Status:</strong> {bid.status}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleAccept(bid.id)} className="bg-green-500 text-white px-3 py-1 rounded">Aceitar</button>
                  <button onClick={() => handleCounterProposal(bid.id)} className="bg-yellow-500 text-white px-3 py-1 rounded">Contra-proposta</button>
                  <button onClick={() => handleReject(bid.id)} className="bg-red-500 text-white px-3 py-1 rounded">Rejeitar</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-4">Ações</h2>
          {canBid && !hasUserBid && (
            <button onClick={() => setShowBidForm(!showBidForm)} className="w-full btn-primary py-2 mb-4">
              Fazer Proposta
            </button>
          )}
          {canBid && hasUserBid && (
            <div className="text-center text-secondary-600 mb-4">
              Você já fez uma proposta para este serviço
            </div>
          )}
          <button className="w-full btn-outline py-2">Adicionar aos Favoritos</button>
        </div>

        {showBidForm && canBid && !hasUserBid && (
          <div className="mt-6 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Fazer Proposta</h2>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-secondary-700">
                  Valor Proposto (R$)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field mt-1"
                  placeholder="Seu valor para o serviço"
                  value={bidForm.price}
                  onChange={handleBidChange}
                />
              </div>
              <div>
                <label htmlFor="proposedDate" className="block text-sm font-medium text-secondary-700">
                  Data e Hora Proposta
                </label>
                <input
                  id="proposedDate"
                  name="proposedDate"
                  type="datetime-local"
                  className="input-field mt-1"
                  value={bidForm.proposedDate}
                  onChange={handleBidChange}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-secondary-700">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="input-field mt-1"
                  placeholder="Descreva sua proposta, experiência e disponibilidade"
                  value={bidForm.message}
                  onChange={handleBidChange}
                />
              </div>
              <button type="submit" className="w-full btn-primary py-2">
                Enviar Proposta
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}