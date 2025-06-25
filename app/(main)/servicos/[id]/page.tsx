'use client';

import { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { useSession } from 'next-auth/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReviewPopup from '../../../components/ReviewPopup'; // Using relative path
import InsufficientFundsModal from '@/components/InsufficientFundsModal'; // Corrected Import Path

// Placeholder icons (Heroicons)
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const ArrowPathIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ExclamationTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
const ThumbUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;

export default function ServiceDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams(); // Initialize useSearchParams
  const serviceId = params.id as string;

  type Photo = { id: string; url: string };
  type BidUser = { id: string; name?: string | null; image?: string | null; rating?: number | null };
  type Bid = {
    id: string;
    providerId: string;
    provider: BidUser;
    price?: number | null;
    message?: string | null;
    proposedDate?: string | null;
    status: string;
    createdAt: string;
  };
  type ServiceCreator = { id: string; name?: string | null; image?: string | null; rating?: number | null; about?: string | null };
  type Service = {
    id: string;
    title: string;
    description: string;
    price?: number | null;
    date?: string | null;
    timeWindow?: number | null;
    address?: string | null;
    profession?: { name: string };
    status: string;
    creatorId: string;
    creator: ServiceCreator;
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState<string | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [serviceProviderForReview, setServiceProviderForReview] = useState<{ id: string; name: string; image?: string | null; } | null>(null);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);

  const fetchService = useCallback(async () => {
    if (!serviceId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Serviço não encontrado ou erro na resposta.' }));
        throw new Error(errData.error || 'Falha ao buscar o serviço');
      }
      const data = await response.json();
      setService(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  // Effect to check for ?promptReview=true query parameter
  useEffect(() => {
    if (!service || !session?.user || !acceptedBid || !searchParams) return; // Guard: ensure data & searchParams are available

    const shouldPromptReview = searchParams.get('promptReview') === 'true';
    
    const currentUserId = session.user.id; // session.user is confirmed by the guard
    const isCreator = service.creatorId === currentUserId; // service is confirmed by the guard
    const localIsCreatorReviewPending = service.status === 'COMPLETED' && isCreator && !showReviewPopup;

    if (shouldPromptReview && localIsCreatorReviewPending && acceptedBid.provider) {
      setServiceProviderForReview({
        id: acceptedBid.provider.id,
        name: acceptedBid.provider.name || 'Prestador Desconhecido',
        image: acceptedBid.provider.image,
      });
      setShowReviewPopup(true);

      // Remove the query parameter to prevent re-triggering on refresh
      const newPath = window.location.pathname; 
      router.replace(newPath, undefined); 
    }
  // Ensure all dependencies that are used and could change are listed.
  }, [service, session, router, showReviewPopup, acceptedBid, searchParams]); 

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBidForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBidSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session || !serviceId) {
      setError('Você precisa estar logado para fazer uma proposta.');
      return;
    }
    setActionLoading('submitBid');
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
      setBidForm({ price: '', message: '', proposedDate: '' });
      setShowBidForm(false);
      fetchService();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplyDirectly = async () => {
    if (!session || !serviceId) {
      setError('Você precisa estar logado para se candidatar a este serviço.');
      return;
    }
    setActionLoading('applyDirectly');
    try {
      const response = await fetch(`/api/services/${serviceId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao se candidatar para o serviço');
      fetchService();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const callApi = async (url: string, method: string, body?: any, successMessage?: string) => {
    setActionLoading(url + method + (body ? JSON.stringify(body.bidId || body.id || '') : ''));
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) {
        // Throw an error object that includes the structured error from API if possible
        const errorToThrow = new Error(data.error || `Falha na operação: ${response.status} ${response.statusText}`);
        (errorToThrow as any).isApiError = true;
        (errorToThrow as any).apiData = data; // Attach full API error data
        throw errorToThrow;
      }
      if (successMessage) {
        console.log(successMessage); // Or use a toast notification
      }
      return data; // Return data on success
    } catch (err: any) {
      // Re-throw the error to be caught by the caller
      throw err; 
    } finally {
      // Removed fetchService() from here to give caller more control
      setActionLoading(null);
    }
  };

  // --- Bid Actions by Service Creator ---
  const handleAcceptBid = async (bidId: string) => {
    try {
      await callApi(`/api/services/${serviceId}/bids/${bidId}/accept`, 'POST', { bidId }, 'Proposta aceita');
      fetchService(); // Fetch service only on successful bid acceptance
    } catch (err: any) {
      if (err.isApiError && err.apiData && err.apiData.error === 'INSUFFICIENT_FUNDS') {
        setShowInsufficientFundsModal(true);
      } else {
        setError(err.message || 'Ocorreu um erro ao aceitar a proposta.');
      }
    }
  };
  const handleRejectBid = (bidId: string) => callApi(`/api/services/${serviceId}/bids/${bidId}/reject`, 'POST', { bidId }, 'Proposta rejeitada');
  const handleCounterOfferToProvider = (bidId: string) => {
    const newPrice = prompt('Digite o novo valor para a contraproposta (R$):');
    if (newPrice === null) return;
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Valor inválido para contraproposta.');
      return;
    }
    const newMessage = prompt('Adicione uma mensagem para a contraproposta (opcional):');
    callApi(`/api/services/${serviceId}/bids/${bidId}/counter`, 'POST', { bidId, price: priceValue, message: newMessage }, 'Contraproposta enviada');
  };

  // --- Bid Actions by Bid Provider ---
  const handleAcceptCounterOfferByProvider = (bidId: string) => callApi(`/api/services/${serviceId}/bids/${bidId}/accept-provider`, 'POST', { bidId }, 'Contraproposta aceita pelo prestador');
  const handleRejectCounterOfferByProvider = (bidId: string) => callApi(`/api/services/${serviceId}/bids/${bidId}/reject-provider`, 'POST', { bidId }, 'Contraproposta rejeitada pelo prestador');
  const handleWithdrawBid = (bidId: string) => callApi(`/api/services/${serviceId}/bids/${bidId}`, 'DELETE', { bidId }, 'Proposta retirada');

  // --- Service Completion/Problem Actions ---
  const handleConfirmCompletion = async () => {
    // The actual acceptedBid details are needed to pass to the review popup
    // This might already be available in the `service` state or might need to be part of the API response from confirm-completion
    const currentServiceState = service; // Use the current state of service
    if (!currentServiceState) return;

    const result = await callApi(`/api/services/${serviceId}/confirm-completion`, 'POST', {}, 'Conclusão confirmada');

    if (result && result.serviceStatus === 'COMPLETED') {
      // Check if current user is the creator
      const isCreator = session?.user?.id === currentServiceState.creatorId;
      if (isCreator) {
        const acceptedBid = currentServiceState.bids?.find(bid => bid.status === 'ACCEPTED');
        if (acceptedBid && acceptedBid.provider) {
          setServiceProviderForReview({
            id: acceptedBid.provider.id,
            name: acceptedBid.provider.name || 'Prestador Desconhecido',
            image: acceptedBid.provider.image,
          });
          setShowReviewPopup(true);
        }
      }
    }
  };

  const handleReportProblem = () => {
    const reason = prompt('Descreva o problema ocorrido:');
    if (reason === null || reason.trim() === '') {
      setError('A descrição do problema é obrigatória.');
      return;
    }
    callApi(`/api/services/${serviceId}/problems`, 'POST', { reason }, 'Problema reportado');
  };

  // --- User Profile Modal ---
  const UserProfileModal = ({ userId, onClose }: { userId: string, onClose: () => void }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`/api/users/${userId}/profile`);
          if (!response.ok) throw new Error('Falha ao carregar perfil');
          const data = await response.json();
          setUser(data);
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }, [userId]);

    if (loading) return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <p className="text-center">Carregando perfil...</p>
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">Perfil do Usuário</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon />
            </button>
          </div>
          
          {user ? (
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-xl font-bold">
                      {user.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm text-gray-600">{user.rating?.toFixed(1) || 'Sem avaliações'}</span>
                  </div>
                </div>
              </div>
              
              {user.about && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Sobre</h4>
                  <p className="text-sm text-gray-600">{user.about}</p>
                </div>
              )}
              
              {user.professions && user.professions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Profissões</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.professions.map((profession: any) => (
                      <span key={profession.id} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                        {profession.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {user.reviews && user.reviews.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Avaliações Recentes</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {user.reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-100 pb-2">
                        <div className="flex items-center">
                          <div className="text-yellow-400 mr-1">{'★'.repeat(review.rating)}</div>
                          <div className="text-gray-400 text-xs">{'★'.repeat(5 - review.rating)}</div>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-600">Não foi possível carregar o perfil.</p>
          )}
          
          <div className="mt-4 space-y-2">
            <Link href={`/perfil/${userId}`} passHref>
              <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium text-center">
                Ver Perfil Completo
              </button>
            </Link>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><p>Carregando detalhes do serviço...</p></div>;
  if (!service) return <div className="max-w-4xl mx-auto px-4 py-12 text-center"><p className="text-red-600">{error || 'Serviço não encontrado.'}</p><Link href="/explorar" className="mt-4 inline-block btn-primary">Voltar</Link></div>;

  const isCreator = session?.user?.id === service.creatorId;
  const canCurrentUserBid = session?.user && !isCreator && service.status === 'OPEN';
  const existingUserBid = service.bids?.find(bid => bid.providerId === session?.user?.id);
  const acceptedBid = service.bids?.find(bid => bid.status === 'ACCEPTED');
  const isServiceInProgress = service.status === 'IN_PROGRESS';
  const isServiceOpen = service.status === 'OPEN';
  const isUserAcceptedProvider = !!session?.user?.id && !!acceptedBid?.providerId && acceptedBid.providerId === session.user.id;

  const { 
    currentUserConfirmed, 
    otherPartyConfirmed, 
    otherPartyName, 
    isCreatorReviewPending 
  } = useMemo(() => {
    let CUC = false;
    let OPC = false;
    let OPN = '';
    let ICRP = false;

    if (service && session?.user && acceptedBid) {
      const creatorId = service.creatorId;
      const providerId = acceptedBid.providerId;
      const currentUserId = session.user.id;

      if (service.completionConfirmations) {
        CUC = service.completionConfirmations.some(c => c.userId === currentUserId);
        const creatorConfirmation = service.completionConfirmations.some(c => c.userId === creatorId);
        const providerConfirmation = service.completionConfirmations.some(c => c.userId === providerId);

        if (currentUserId === creatorId) {
          OPC = providerConfirmation;
          OPN = acceptedBid.provider?.name || 'Prestador';
        } else if (currentUserId === providerId) {
          OPC = creatorConfirmation;
          OPN = service.creator?.name || 'Criador do serviço';
        }
      }
      
      if (service.status === 'COMPLETED' && currentUserId === creatorId) {
        ICRP = !showReviewPopup; 
      }

      console.log({
        currentUserId_memo: currentUserId,
        creatorId_memo: creatorId,
        providerId_memo: providerId,
        completionConfirmations_memo: service.completionConfirmations,
        currentUserConfirmed_memo: CUC,
        otherPartyConfirmed_memo: OPC,
        otherPartyName_memo: OPN,
        serviceStatus_memo: service.status,
        isCreatorReviewPending_memo: ICRP
      });
    }
    return { 
      currentUserConfirmed: CUC, 
      otherPartyConfirmed: OPC, 
      otherPartyName: OPN, 
      isCreatorReviewPending: ICRP 
    };
  }, [service, session, acceptedBid, showReviewPopup]); // Dependencies for useMemo

  // Early returns must come AFTER all hooks are called.
  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><p>Carregando detalhes do serviço...</p></div>;
  
  // Check for service after isLoading is false, because service is fetched asynchronously.
  if (!service) return <div className="max-w-4xl mx-auto px-4 py-12 text-center"><p className="text-red-600">{error || 'Serviço não encontrado.'}</p><Link href="/explorar" className="mt-4 inline-block btn-primary">Voltar</Link></div>;
  
  // Define constants that depend on 'service' and 'session' only after service is guaranteed to exist.
  // The original declarations of these constants were higher up and could run when service was null.
  // 'acceptedBid' is also defined here as it depends on 'service'.
  const isCreator = session?.user?.id === service.creatorId;
  const acceptedBid = service.bids?.find(bid => bid.status === 'ACCEPTED'); // Moved here
  const canCurrentUserBid = session?.user && !isCreator && service.status === 'OPEN';
  const existingUserBid = service.bids?.find(bid => bid.providerId === session?.user?.id);
  const isServiceInProgress = service.status === 'IN_PROGRESS';
  const isServiceOpen = service.status === 'OPEN';
  // isUserAcceptedProvider is used by useMemo, ensure it's defined before or within if not dependent on other derived states.
  // It was: const isUserAcceptedProvider = !!session?.user?.id && !!acceptedBid?.providerId && acceptedBid.providerId === session.user.id;
  // This depends on acceptedBid, which is now defined just above.

  let bidsToDisplay = [];
  if (isCreator) {
    bidsToDisplay = service.bids || [];
  } else if (existingUserBid?.status === 'COUNTER_OFFER') {
    bidsToDisplay = [existingUserBid];
  } else if (acceptedBid) {
    bidsToDisplay = [acceptedBid];
  } else if (existingUserBid) {
    bidsToDisplay = [existingUserBid];
  }

  const getStatusClass = (status: string) => {
    if (status === 'OPEN') return 'bg-green-100 text-green-800';
    if (status === 'IN_PROGRESS') return 'bg-blue-100 text-blue-800';
    if (status === 'COMPLETED') return 'bg-purple-100 text-purple-800';
    if (status === 'CANCELLED') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
  const getStatusText = (status: string) => {
    if (status === 'OPEN') return 'Aberto';
    if (status === 'IN_PROGRESS') return 'Em Andamento';
    if (status === 'COMPLETED') return 'Concluído';
    if (status === 'CANCELLED') return 'Cancelado';
    return status;
  };

  const getBidStatusClass = (status: string) => {
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800';
    if (status === 'ACCEPTED') return 'bg-green-100 text-green-800';
    if (status === 'REJECTED') return 'bg-red-100 text-red-800';
    if (status === 'COUNTER_OFFER') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };
  const getBidStatusText = (status: string) => {
    if (status === 'PENDING') return 'Pendente';
    if (status === 'ACCEPTED') return 'Aceita';
    if (status === 'REJECTED') return 'Rejeitada';
    if (status === 'COUNTER_OFFER') return 'Contraproposta';
    return status;
  };

  // Button Styles
  const btnBase = "px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary = `${btnBase} bg-blue-500 hover:bg-blue-600 text-white`;
  const btnSecondary = `${btnBase} bg-gray-200 hover:bg-gray-300 text-gray-700`;
  const btnSuccess = `${btnBase} bg-green-500 hover:bg-green-600 text-white`;
  const btnWarning = `${btnBase} bg-yellow-500 hover:bg-yellow-600 text-white`;
  const btnDanger = `${btnBase} bg-red-500 hover:bg-red-600 text-white`;

  return (<div>Minimal Content After Hooks and Derived State</div>);
}
