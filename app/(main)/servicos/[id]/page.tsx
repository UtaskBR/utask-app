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
  
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidForm, setBidForm] = useState({
    value: '',
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
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const handleBidChange = (e) => {
    const { name, value } = e.target;
    setBidForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBidSubmit = async (e) => {
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
          value: bidForm.value ? parseFloat(bidForm.value) : null,
          message: bidForm.message,
          proposedDate: bidForm.proposedDate || null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar proposta');
      }
      
      // Atualizar a página para mostrar a nova proposta
      window.location.reload();
    } catch (err) {
      setError(err.message);
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

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-secondary-900 mb-2">Serviço não encontrado</h3>
          <p className="text-secondary-600 mb-6">
            O serviço que você está procurando não existe ou foi removido.
          </p>
          <Link href="/explorar" className="btn-primary py-2 px-4">
            Explorar Serviços
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = session?.user?.id === service.creatorId;
  const canBid = !isCreator && service.status === 'OPEN';
  const hasUserBid = service.bids?.some(bid => bid.providerId === session?.user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/explorar" className="text-primary-600 hover:text-primary-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Voltar para Explorar
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detalhes do Serviço */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="h-64 bg-secondary-200 flex items-center justify-center">
              <span className="text-secondary-400">Imagem do Serviço</span>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-secondary-900">{service.title}</h1>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
              </div>
              
              {service.value ? (
                <div className="mt-2 text-xl font-bold text-primary-600">
                  R$ {service.value.toFixed(2)}
                </div>
              ) : (
                <div className="mt-2 text-secondary-600">
                  Aberto a propostas
                </div>
              )}
              
              <div className="mt-6">
                <h2 className="text-lg font-medium text-secondary-900">Descrição</h2>
                <p className="mt-2 text-secondary-600 whitespace-pre-line">{service.description}</p>
              </div>
              
              {service.date && (
                <div className="mt-6">
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
                <div className="mt-6">
                  <h2 className="text-lg font-medium text-secondary-900">Localização</h2>
                  <p className="mt-2 text-secondary-600">{service.address}</p>
                </div>
              )}
              
              {service.profession && (
                <div className="mt-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {service.profession.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Propostas */}
          {(isCreator || hasUserBid) && service.bids && service.bids.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-secondary-900 mb-4">
                {isCreator ? 'Propostas Recebidas' : 'Sua Proposta'}
              </h2>
              
              <div className="space-y-4">
                {service.bids
                  .filter(bid => isCreator || bid.providerId === session?.user?.id)
                  .map((bid) => (
                    <div key={bid.id} className="bg-white shadow-md rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-medium">
                              {bid.provider.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-secondary-900">{bid.provider.name}</p>
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="ml-1 text-sm text-secondary-600">{bid.provider.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bid.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          bid.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {bid.status === 'PENDING' ? 'Pendente' :
                           bid.status === 'ACCEPTED' ? 'Aceita' :
                           bid.status === 'REJECTED' ? 'Rejeitada' :
                           'Contra-proposta'}
                        </span>
                      </div>
                      
                      {bid.value && (
                        <div className="mt-4 text-lg font-bold text-primary-600">
                          R$ {bid.value.toFixed(2)}
                        </div>
                      )}
                      
                      {bid.message && (
                        <div className="mt-2 text-secondary-600">
                          {bid.message}
                        </div>
                      )}
                      
                      {bid.proposedDate && (
                        <div className="mt-2 text-sm text-secondary-500">
                          Data proposta: {new Date(bid.proposedDate).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                      
                      {isCreator && bid.status === 'PENDING' && (
                        <div className="mt-4 flex space-x-2">
                          <button className="btn-primary py-1 px-3 text-sm">
                            Aceitar
                          </button>
                          <button className="btn-outline py-1 px-3 text-sm">
                            Contra-proposta
                          </button>
                          <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-md transition-colors text-sm">
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Informações do Criador */}
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
          
          {/* Ações */}
          <div className="mt-6 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Ações</h2>
            
            {canBid && !hasUserBid && (
              <button
                onClick={() => setShowBidForm(!showBidForm)}
                className="w-full btn-primary py-2 mb-4"
              >
                Fazer Proposta
              </button>
            )}
            
            {canBid && hasUserBid && (
              <div className="text-center text-secondary-600 mb-4">
                Você já fez uma proposta para este serviço
              </div>
            )}
            
            <button className="w-full btn-outline py-2">
              Adicionar aos Favoritos
            </button>
          </div>
          
          {/* Formulário de Proposta */}
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
                  <label htmlFor="value" className="block text-sm font-medium text-secondary-700">
                    Valor Proposto (R$)
                  </label>
                  <input
                    id="value"
                    name="value"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field mt-1"
                    placeholder="Seu valor para o serviço"
                    value={bidForm.value}
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
                
                <button
                  type="submit"
                  className="w-full btn-primary py-2"
                >
                  Enviar Proposta
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
