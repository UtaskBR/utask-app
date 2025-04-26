'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function ServiceDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
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
  const [showCounterOfferForm, setShowCounterOfferForm] = useState(false);
  const [counterOfferForm, setCounterOfferForm] = useState({
    value: '',
    message: '',
    proposedDate: '',
    bidId: ''
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState('');
  const [selectedBidId, setSelectedBidId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problemReason, setProblemReason] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        console.log('Buscando serviço:', serviceId);
        const response = await fetch(`/api/services/${serviceId}`);
        
        if (!response.ok) {
          throw new Error('Serviço não encontrado');
        }
        
        const data = await response.json();
        console.log('Serviço encontrado:', data);
        setService(data);
      } catch (err) {
        console.error('Erro ao buscar serviço:', err);
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

  const handleCounterOfferChange = (e) => {
    const { name, value } = e.target;
    setCounterOfferForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      setError('Você precisa estar logado para fazer uma proposta');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Enviando proposta:', bidForm);
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
      
      toast.success('Proposta enviada com sucesso!');
      
      // Atualizar a página para mostrar a nova proposta
      window.location.reload();
    } catch (err) {
      console.error('Erro ao enviar proposta:', err);
      toast.error(err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCounterOfferSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      setError('Você precisa estar logado para fazer uma contraproposta');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Enviando contraproposta:', counterOfferForm);
      const response = await fetch(`/api/services/${serviceId}/bids/${counterOfferForm.bidId}/counter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: counterOfferForm.value ? parseFloat(counterOfferForm.value) : null,
          message: counterOfferForm.message,
          proposedDate: counterOfferForm.proposedDate || null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar contraproposta');
      }
      
      toast.success('Contraproposta enviada com sucesso!');
      setShowCounterOfferForm(false);
      
      // Atualizar a página para mostrar a nova proposta
      window.location.reload();
    } catch (err) {
      console.error('Erro ao enviar contraproposta:', err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptBid = (bidId) => {
    setSelectedBidId(bidId);
    setConfirmationAction('accept-bid');
    setShowConfirmationModal(true);
  };

  const handleRejectBid = (bidId) => {
    setSelectedBidId(bidId);
    setConfirmationAction('reject-bid');
    setShowConfirmationModal(true);
  };

  const handleCounterOffer = (bid) => {
    setCounterOfferForm({
      value: bid.value || '',
      message: '',
      proposedDate: bid.proposedDate || '',
      bidId: bid.id
    });
    setShowCounterOfferForm(true);
  };

  const handleAcceptCounterOffer = (bidId) => {
    setSelectedBidId(bidId);
    setConfirmationAction('accept-counter');
    setShowConfirmationModal(true);
  };

  const handleRejectCounterOffer = (bidId) => {
    setSelectedBidId(bidId);
    setConfirmationAction('reject-counter');
    setShowConfirmationModal(true);
  };

  const handleCompleteService = () => {
    setConfirmationAction('complete');
    setShowConfirmationModal(true);
  };

  const handleReportProblem = () => {
    setShowProblemModal(true);
  };

  const confirmAction = async () => {
    setIsSubmitting(true);
    
    try {
      if (confirmationAction === 'complete') {
        console.log('Confirmando conclusão do serviço');
        const response = await fetch(`/api/services/${serviceId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            confirmCompletion: true
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao confirmar conclusão do serviço');
        }
        
        toast.success('Confirmação de conclusão enviada com sucesso!');
        
        // Atualizar o serviço
        const updatedServiceResponse = await fetch(`/api/services/${serviceId}`);
        const updatedService = await updatedServiceResponse.json();
        setService(updatedService);
      } else if (confirmationAction === 'accept-bid') {
        console.log('Aceitando proposta:', selectedBidId);
        const response = await fetch(`/api/services/${serviceId}/bids/${selectedBidId}/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao aceitar proposta');
        }
        
        toast.success('Proposta aceita com sucesso!');
        
        // Atualizar a página para mostrar as mudanças
        window.location.reload();
      } else if (confirmationAction === 'reject-bid') {
        console.log('Rejeitando proposta:', selectedBidId);
        const response = await fetch(`/api/services/${serviceId}/bids/${selectedBidId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao rejeitar proposta');
        }
        
        toast.success('Proposta rejeitada com sucesso!');
        
        // Atualizar a página para mostrar as mudanças
        window.location.reload();
      } else if (confirmationAction === 'accept-counter') {
        console.log('Prestador aceitando contraproposta:', selectedBidId);
        const response = await fetch(`/api/services/${serviceId}/bids/${selectedBidId}/accept-provider`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao aceitar contraproposta');
        }
        
        toast.success('Contraproposta aceita com sucesso!');
        
        // Atualizar a página para mostrar as mudanças
        window.location.reload();
      } else if (confirmationAction === 'reject-counter') {
        console.log('Prestador rejeitando contraproposta:', selectedBidId);
        const response = await fetch(`/api/services/${serviceId}/bids/${selectedBidId}/reject-provider`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao rejeitar contraproposta');
        }
        
        toast.success('Contraproposta rejeitada com sucesso!');
        
        // Atualizar a página para mostrar as mudanças
        window.location.reload();
      }
    } catch (err) {
      console.error('Erro ao executar ação:', err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
      setShowConfirmationModal(false);
    }
  };

  const handleProblemSubmit = async () => {
    if (!problemReason.trim()) {
      toast.error('Por favor, descreva o problema');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Reportando problema:', problemReason);
      const response = await fetch(`/api/services/${serviceId}/problem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: problemReason
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao reportar problema');
      }
      
      toast.success('Problema reportado com sucesso! O valor será estornado.');
      
      // Atualizar o serviço
      const updatedServiceResponse = await fetch(`/api/services/${serviceId}`);
      const updatedService = await updatedServiceResponse.json();
      setService(updatedService);
      
      setShowProblemModal(false);
      setProblemReason('');
    } catch (err) {
      console.error('Erro ao reportar problema:', err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
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
  const isProvider = service.bids?.some(bid => bid.providerId === session?.user?.id && bid.status === 'ACCEPTED');
  const isInProgress = service.status === 'IN_PROGRESS';
  const canComplete = isInProgress && (isCreator || isProvider);

  // Verificar se o usuário já confirmou a conclusão
  const userHasConfirmed = service.completionConfirmations?.some(
    confirmation => confirmation.userId === session?.user?.id
  );

  // Verificar se o usuário tem uma contraproposta para responder
  const userHasCounterOffer = service.bids?.some(
    bid => bid.providerId === session?.user?.id && bid.status === 'COUNTER_OFFERED'
  );

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
            {service.photos && service.photos.length > 0 ? (
              <div className="h-64 bg-secondary-200 relative">
                <Image 
                  src={service.photos[0].url} 
                  alt={service.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div className="h-64 bg-secondary-200 flex items-center justify-center">
                <span className="text-secondary-400">Sem imagem</span>
              </div>
            )}
            
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
                      
                      {/* Ações para o criador do serviço */}
                      {isCreator && bid.status === 'PENDING' && (
                        <div className="mt-4 flex space-x-2">
                          <button 
                            onClick={() => handleAcceptBid(bid.id)}
                            className="btn-primary py-1 px-3 text-sm"
                          >
                            Aceitar
                          </button>
                          <button 
                            onClick={() => handleCounterOffer(bid)}
                            className="btn-outline py-1 px-3 text-sm"
                          >
                            Contra-proposta
                          </button>
                          <button 
                            onClick={() => handleRejectBid(bid.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-md transition-colors text-sm"
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                      
                      {/* Ações para o prestador que recebeu uma contraproposta */}
                      {!isCreator && bid.providerId === session?.user?.id && bid.status === 'COUNTER_OFFERED' && (
                        <div className="mt-4 flex space-x-2">
                          <button 
                            onClick={() => handleAcceptCounterOffer(bid.id)}
                            className="btn-primary py-1 px-3 text-sm"
                          >
                            Aceitar Contraproposta
                          </button>
                          <button 
                            onClick={() => handleRejectCounterOffer(bid.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-md transition-colors text-sm"
                          >
                            Rejeitar Contraproposta
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
              <div className="mt-4 text-sm text-secondary-600">
                {service.creator.about}
              </div>
            )}
          </div>
          
          {/* Ações */}
          <div className="mt-6">
            {canBid && !hasUserBid && (
              <button
                onClick={() => setShowBidForm(!showBidForm)}
                className="w-full btn-primary py-2 px-4 mb-4"
              >
                Fazer Proposta
              </button>
            )}
            
            {userHasCounterOffer && (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-700 mb-4">
                Você recebeu uma contraproposta! Verifique sua proposta acima.
              </div>
            )}
            
            {canComplete && !userHasConfirmed && (
              <button
                onClick={handleCompleteService}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors mb-2"
              >
                Confirmar Conclusão
              </button>
            )}
            
            {canComplete && (
              <button
                onClick={handleReportProblem}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Temos um Problema
              </button>
            )}
            
            {canComplete && userHasConfirmed && (
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-700">
                Você já confirmou a conclusão deste serviço. Aguardando confirmação da outra parte.
              </div>
            )}
          </div>
          
          {/* Formulário de Proposta */}
          {showBidForm && (
            <div className="mt-6 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Fazer Proposta</h2>
              
              <form onSubmit={handleBidSubmit}>
                <div className="mb-4">
                  <label htmlFor="value" className="block text-sm font-medium text-secondary-700 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    id="value"
                    name="value"
                    step="0.01"
                    min="0"
                    value={bidForm.value}
                    onChange={handleBidChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={service.value ? service.value.toFixed(2) : "Propor valor"}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="proposedDate" className="block text-sm font-medium text-secondary-700 mb-1">
                    Data e Hora Proposta
                  </label>
                  <input
                    type="datetime-local"
                    id="proposedDate"
                    name="proposedDate"
                    value={bidForm.proposedDate}
                    onChange={handleBidChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={bidForm.message}
                    onChange={handleBidChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Descreva sua proposta ou faça perguntas sobre o serviço"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full btn-primary py-2 px-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Proposta'}
                </button>
              </form>
            </div>
          )}
          
          {/* Formulário de Contraproposta */}
          {showCounterOfferForm && (
            <div className="mt-6 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Fazer Contraproposta</h2>
              
              <form onSubmit={handleCounterOfferSubmit}>
                <div className="mb-4">
                  <label htmlFor="counterValue" className="block text-sm font-medium text-secondary-700 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    id="counterValue"
                    name="value"
                    step="0.01"
                    min="0"
                    value={counterOfferForm.value}
                    onChange={handleCounterOfferChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Propor valor"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="counterProposedDate" className="block text-sm font-medium text-secondary-700 mb-1">
                    Data e Hora Proposta
                  </label>
                  <input
                    type="datetime-local"
                    id="counterProposedDate"
                    name="proposedDate"
                    value={counterOfferForm.proposedDate}
                    onChange={handleCounterOfferChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="counterMessage" className="block text-sm font-medium text-secondary-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    id="counterMessage"
                    name="message"
                    rows={4}
                    value={counterOfferForm.message}
                    onChange={handleCounterOfferChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Explique sua contraproposta"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCounterOfferForm(false)}
                    className="btn-outline py-2 px-4"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2 px-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Contraproposta'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Confirmação */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-secondary-900 mb-4">
              {confirmationAction === 'complete' ? 'Confirmar Conclusão' : 
               confirmationAction === 'accept-bid' ? 'Aceitar Proposta' : 
               confirmationAction === 'reject-bid' ? 'Rejeitar Proposta' :
               confirmationAction === 'accept-counter' ? 'Aceitar Contraproposta' :
               'Rejeitar Contraproposta'}
            </h3>
            
            <p className="text-secondary-600 mb-6">
              {confirmationAction === 'complete' ? 
                'Ao confirmar a conclusão deste serviço, você está indicando que o serviço foi realizado satisfatoriamente. O pagamento será liberado quando ambas as partes confirmarem a conclusão.' : 
               confirmationAction === 'accept-bid' ? 
                'Ao aceitar esta proposta, o serviço será iniciado e o valor será reservado da sua carteira. Tem certeza que deseja aceitar?' : 
               confirmationAction === 'reject-bid' ?
                'Tem certeza que deseja rejeitar esta proposta? Esta ação não pode ser desfeita.' :
               confirmationAction === 'accept-counter' ?
                'Ao aceitar esta contraproposta, o serviço será iniciado com os novos termos. Tem certeza que deseja aceitar?' :
                'Tem certeza que deseja rejeitar esta contraproposta? Esta ação não pode ser desfeita.'}
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="btn-outline py-2 px-4"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                className={`${confirmationAction === 'reject-bid' || confirmationAction === 'reject-counter' ? 'bg-red-600 hover:bg-red-700' : 'btn-primary'} py-2 px-4 text-white font-medium rounded-md transition-colors`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Problema */}
      {showProblemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-secondary-900 mb-4">Reportar Problema</h3>
            
            <p className="text-secondary-600 mb-4">
              Descreva o problema que você está enfrentando com este serviço.
              Isso iniciará um processo de estorno do valor pago.
            </p>
            
            <div className="mb-4">
              <label htmlFor="problemReason" className="block text-sm font-medium text-secondary-700 mb-1">
                Descrição do Problema
              </label>
              <textarea
                id="problemReason"
                rows={4}
                value={problemReason}
                onChange={(e) => setProblemReason(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Descreva o problema em detalhes"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowProblemModal(false)}
                className="btn-outline py-2 px-4"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleProblemSubmit}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : 'Reportar Problema'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
