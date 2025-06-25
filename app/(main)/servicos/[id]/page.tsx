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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {error && <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4"><p>{error}</p></div>}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Service Details Column */}
        <div className="lg:col-span-2 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <Link href="/explorar" className="text-blue-600 hover:text-blue-700 flex items-center mb-4">
              <ArrowLeftIcon /> Voltar para Explorar
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(service.status)}`}>
                {getStatusText(service.status)}
              </span>
              {service.profession && <span className="text-gray-600 text-sm">{service.profession.name}</span>}
            </div>
            {service.price ? (
              <div className="mt-3 text-2xl font-bold text-blue-600">R$ {service.price.toFixed(2)}</div>
            ) : (
              <div className="mt-3 text-gray-700">Valor a combinar (aberto a propostas)</div>
            )}
          </div>

          {service.photos && service.photos.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Fotos do Serviço</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {service.photos.map((photo) => (
                  <div key={photo.id} className="aspect-square overflow-hidden rounded-lg shadow">
                    <img src={photo.url} alt={`Foto do serviço ${service.title}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Descrição Detalhada</h2>
              <p className="mt-2 text-gray-600 whitespace-pre-line">{service.description}</p>
            </div>
            {service.date && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Data e Hora Preferencial</h2>
                <p className="mt-2 text-gray-600">
                  {new Date(service.date).toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {service.timeWindow && ` (Janela de ${service.timeWindow} min aprox.)`}
                </p>
              </div>
            )}
            {service.address && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Localização</h2>
                <p className="mt-2 text-gray-600">{service.address}</p>
              </div>
            )}
          </div>

          {/* Service Actions Logic Updated */}
          <div className="p-6 border-t border-gray-200">
            {service.status === 'DISPUTED' ? (
              <p className="text-red-600 font-semibold">Este serviço está em disputa.</p>
            ) : service.status === 'COMPLETED' ? (
              isCreator && isCreatorReviewPending && service.price && service.price > 0 ? ( // Only show evaluate if paid service
                <button
                  onClick={() => {
                    if (acceptedBid?.provider) {
                      setServiceProviderForReview({
                        id: acceptedBid.provider.id,
                        name: acceptedBid.provider.name || 'Prestador Desconhecido',
                        image: acceptedBid.provider.image,
                      });
                      setShowReviewPopup(true);
                    }
                  }}
                  className={`${btnPrimary} w-full`}
                >
                  Avaliar {acceptedBid?.provider?.name || 'Prestador'}
                </button>
              ) : (
                <p className="text-green-600 font-semibold">Serviço concluído.</p>
              )
            ) : service.status === 'IN_PROGRESS' && (isCreator || isUserAcceptedProvider) ? (
              currentUserConfirmed && !otherPartyConfirmed ? (
                <p className="text-blue-600 font-semibold">Aguardando confirmação de {otherPartyName}.</p>
              ) : !currentUserConfirmed ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleConfirmCompletion}
                    className={`${btnSuccess} w-full sm:w-auto`}
                    disabled={!!actionLoading}>
                      <CheckCircleIcon /> Confirmar Conclusão
                  </button>
                  <button
                    onClick={handleReportProblem}
                    className={`${btnDanger} w-full sm:w-auto`}
                    disabled={!!actionLoading}>
                      <ExclamationTriangleIcon /> Tenho um Problema
                  </button>
                </div>
              ) : null // Both confirmed, should move to COMPLETED (handled by above) or this state shouldn't be hit if logic is right
            ) : null}
          </div>
        </div>

        {/* Creator Info & Bid Form/List Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Criador do Serviço</h2>
            <div className="flex items-center space-x-3">
              <div
                className="h-12 w-12 rounded-full overflow-hidden bg-primary-100 cursor-pointer"
                onClick={() => setShowUserProfile(service.creatorId)}
              >
                {service.creator.image ? (
                  <img src={service.creator.image} alt={service.creator.name || 'Criador'} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-xl font-bold">
                    {service.creator.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div>
                <p
                  className="font-medium text-gray-900 cursor-pointer hover:underline"
                  onClick={() => setShowUserProfile(service.creatorId)}
                >
                  {service.creator.name}
                </p>
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-sm text-gray-600">{service.creator.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>
            {service.creator.about && <p className="mt-3 text-sm text-gray-600">{service.creator.about}</p>}
            {isCreator && service.status === 'OPEN' && (
                <Link href={`/editar-servico/${service.id}`} className={`mt-4 block text-center ${btnSecondary}`}>Editar Serviço</Link>
            )}
          </div>

          {/* Botão de Candidatura Direta - Apenas para não criadores */}
          {canCurrentUserBid && !existingUserBid && !acceptedBid && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Candidatar-se para este Serviço</h2>
              <div className="space-y-4">
                <button
                  onClick={handleApplyDirectly}
                  className={`${btnSuccess} w-full`}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'applyDirectly' ? 'Enviando...' : <><ThumbUpIcon /> Aceitar Serviço</>}
                </button>
                <div className="text-center">
                  <p className="text-sm text-gray-600">ou</p>
                  <button
                    onClick={() => setShowBidForm(!showBidForm)}
                    className={`mt-2 ${btnSecondary}`}
                  >
                    {showBidForm ? 'Cancelar Proposta' : 'Fazer uma Proposta Personalizada'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bid Form */}
          {canCurrentUserBid && !existingUserBid && !acceptedBid && showBidForm && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Fazer uma Proposta Personalizada</h2>
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Sua Oferta (R$)</label>
                  <input type="number" name="price" id="price" value={bidForm.price} onChange={handleBidChange} className="input-field mt-1 w-full" placeholder="Ex: 150.00" step="0.01" />
                </div>
                <div>
                  <label htmlFor="proposedDate" className="block text-sm font-medium text-gray-700">Data/Hora Proposta (Opcional)</label>
                  <input type="datetime-local" name="proposedDate" id="proposedDate" value={bidForm.proposedDate} onChange={handleBidChange} className="input-field mt-1 w-full" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensagem (Opcional)</label>
                  <textarea name="message" id="message" value={bidForm.message} onChange={handleBidChange} rows={3} className="input-field mt-1 w-full" placeholder="Detalhes adicionais sobre sua proposta..."></textarea>
                </div>
                <button type="submit" className={`${btnPrimary} w-full`} disabled={!!actionLoading}>{actionLoading === 'submitBid' ? 'Enviando...' : 'Enviar Proposta'}</button>
              </form>
            </div>
          )}
          {existingUserBid &&
           existingUserBid.status !== 'COUNTER_OFFER' &&
           existingUserBid.status !== 'ACCEPTED' &&
           !acceptedBid &&
           isServiceOpen && (
            <div className="bg-white shadow-md rounded-lg p-4 text-center">
              <p className="text-gray-700">Você já enviou uma proposta para este serviço.</p>
              {existingUserBid.status === 'PENDING' && ( // Keep withdraw for PENDING bids here
                <button onClick={() => handleWithdrawBid(existingUserBid.id)} className={`mt-2 ${btnDanger}`} disabled={!!actionLoading}><XMarkIcon/> Retirar Proposta</button>
              )}
            </div>
          )}

          {/* Bids List */}
          {bidsToDisplay && bidsToDisplay.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {isCreator ? `Propostas Recebidas (${bidsToDisplay.length})`
                           : existingUserBid?.status === 'COUNTER_OFFER' ? 'Você recebeu uma Contraproposta'
                           : acceptedBid ? 'Proposta Aceita'
                           : 'Sua Proposta'}
              </h2>
              <div className="space-y-4">
                {bidsToDisplay.map((bid) => (
                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-8 w-8 rounded-full overflow-hidden bg-primary-100 cursor-pointer"
                            onClick={() => setShowUserProfile(bid.providerId)}
                          >
                            {bid.provider.image ? (
                              <img src={bid.provider.image} alt={bid.provider.name || 'Prestador'} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-sm font-bold">
                                {bid.provider.name?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <p
                            className="font-semibold text-gray-800 cursor-pointer hover:underline"
                            onClick={() => setShowUserProfile(bid.providerId)}
                          >
                            {isCreator || bid.providerId === session?.user?.id ? bid.provider.name : 'Prestador'} {/* Show name if creator or own bid */}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBidStatusClass(bid.status)}`}>
                          {getBidStatusText(bid.status)}
                        </span>
                      </div>
                      {bid.price && <p className="text-lg font-bold text-blue-600">R$ {bid.price.toFixed(2)}</p>}
                      {bid.proposedDate && (
                        <p className="text-sm text-gray-500">
                          Data: {new Date(bid.proposedDate).toLocaleDateString('pt-BR')} às {new Date(bid.proposedDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                        </p>
                      )}
                      {bid.message && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{bid.message}</p>}

                      {/* Actions for Service Creator */}
                      {isCreator && isServiceOpen && !acceptedBid && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-2">
                          {bid.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleAcceptBid(bid.id)} className={btnSuccess} disabled={!!actionLoading}><CheckIcon /> Aceitar</button>
                              <button onClick={() => handleCounterOfferToProvider(bid.id)} className={btnWarning} disabled={!!actionLoading}><ArrowPathIcon /> Contraproposta</button>
                              <button onClick={() => handleRejectBid(bid.id)} className={btnDanger} disabled={!!actionLoading}><XMarkIcon /> Rejeitar</button>
                            </>
                          )}
                           {/* Creator can also see options if they sent a counter-offer, though they can't act on it */}
                           {bid.status === 'COUNTER_OFFER' && (
                            <p className="text-sm text-blue-600">Contraproposta enviada ao prestador. Aguardando resposta.</p>
                          )}
                        </div>
                      )}

                      {/* Actions for Bid Provider */}
                      {session?.user?.id === bid.providerId && isServiceOpen && !acceptedBid && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-2">
                          {bid.status === 'COUNTER_OFFER' && (
                            <>
                              <button onClick={() => handleAcceptCounterOfferByProvider(bid.id)} className={btnSuccess} disabled={!!actionLoading}><CheckIcon /> Aceitar Contraproposta</button>
                              <button onClick={() => handleRejectCounterOfferByProvider(bid.id)} className={btnDanger} disabled={!!actionLoading}><XMarkIcon /> Rejeitar Contraproposta</button>
                            </>
                          )}
                          {bid.status === 'PENDING' && (
                              <button onClick={() => handleWithdrawBid(bid.id)} className={btnDanger} disabled={!!actionLoading}><XMarkIcon/> Retirar Minha Proposta</button>
                          )}
                        </div>
                      )}
                      {bid.status === 'ACCEPTED' && (
                          <p className="text-sm text-green-600 font-semibold">
                            {isCreator ? `Esta proposta foi aceita.` : `Sua proposta foi aceita!`}
                          </p>
                      )}
                       {bid.status === 'REJECTED' && session?.user?.id === bid.providerId && (
                          <p className="text-sm text-red-600">Sua proposta foi rejeitada.</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
          {bidsToDisplay.length === 0 && isCreator && service.bids?.length === 0 && ( // Show "No bids received" only if creator and bids array is empty
             <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <p className="text-gray-600">Nenhuma proposta recebida ainda.</p>
             </div>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfileModal
          userId={showUserProfile}
          onClose={() => setShowUserProfile(null)}
        />
      )}

      {serviceProviderForReview && service && (
        <ReviewPopup
          show={showReviewPopup}
          onClose={() => {
            setShowReviewPopup(false);
            setServiceProviderForReview(null);
            // Optionally, refresh service data again after review popup closes
            // fetchService();
          }}
          serviceProvider={serviceProviderForReview}
          serviceId={service.id}
          onReviewSubmitted={() => {
            // Can add a toast message here for "Review submitted successfully!"
            console.log('Review submitted, popup will close.');
            // fetchService(); // Refresh data to potentially show updated review info if applicable on this page
          }}
        />
      )}

      <InsufficientFundsModal
        show={showInsufficientFundsModal}
        onClose={() => setShowInsufficientFundsModal(false)}
      />
    </div>
  );
}
