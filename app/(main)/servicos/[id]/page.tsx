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
        if (!response.ok) throw new Error('Serviço não encontrado');
        const data = await response.json();
        setService(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
      } finally {
        setIsLoading(false);
      }
    };
    if (serviceId) fetchService();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: bidForm.price ? parseFloat(bidForm.price) : null,
          message: bidForm.message,
          proposedDate: bidForm.proposedDate || null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao enviar proposta');
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAction = async (bidId: string, action: string) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/bids/${bidId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao executar ação');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Carregando...</p></div>;
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
        <div className="mt-6">
          <Link href="/explorar" className="btn-primary">Voltar para Explorar</Link>
        </div>
      </div>
    );
  }

  if (!service) return null;
  const isCreator = session?.user?.id === service.creatorId;
  const canBid = !isCreator && service.status === 'OPEN';
  const hasUserBid = service.bids?.some(bid => bid.providerId === session?.user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
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
               service.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
            </span>
          </div>
        </div>

        {/* Ações para o criador */}
        {isCreator && service.bids?.length > 0 && (
          <div className="p-6 border-t border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-secondary-800">Propostas Recebidas</h3>
            {service.bids.map(bid => (
              <div key={bid.id} className="border p-4 rounded-md">
                <p><strong>Proposta de:</strong> {bid.provider.name}</p>
                <p><strong>Valor:</strong> R$ {bid.price?.toFixed(2) || 'Não informado'}</p>
                <p><strong>Status:</strong> {bid.status}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleAction(bid.id, 'ACCEPTED')} className="btn-primary">Aceitar</button>
                  <button onClick={() => handleAction(bid.id, 'REJECTED')} className="btn-danger">Rejeitar</button>
                  <button onClick={() => handleAction(bid.id, 'COUNTER_OFFER')} className="btn-secondary">Contra-proposta</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ações para o provedor diante de contra-oferta */}
        {!isCreator && service.bids?.some(b => b.providerId === session?.user?.id && b.status === 'COUNTER_OFFER') && (
          <div className="p-6 border-t border-gray-200 space-y-2">
            <p className="text-sm text-secondary-700">Você recebeu uma contra-proposta para esse serviço.</p>
            {service.bids
              .filter(b => b.providerId === session?.user?.id && b.status === 'COUNTER_OFFER')
              .map(bid => (
                <div key={bid.id} className="flex gap-2">
                  <button onClick={() => handleAction(bid.id, 'ACCEPTED')} className="btn-primary">Aceitar</button>
                  <button onClick={() => handleAction(bid.id, 'REJECTED')} className="btn-danger">Rejeitar</button>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
