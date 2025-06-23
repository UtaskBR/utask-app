'use client';

// Original imports
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import React from 'react';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id;

  // Original state variables
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [activeTab, setActiveTab] = useState('sobre');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showSendServiceModal, setShowSendServiceModal] = useState(false);
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [sendServiceLoading, setSendServiceLoading] = useState(false);

  // Original interface definitions
  interface User {
    id: string;
    name?: string;
    image?: string;
    averageRating?: number | null; // Changed from rating: string to averageRating: number | null
    city?: string;
    state?: string;
    professions?: { id: string; name: string }[];
    about?: string;
    reviews?: { 
      id: string; 
      giver: { name: string; image?: string | null }; // Added image to giver
      rating: number; 
      comment?: string; 
      createdAt: string 
    }[];
    certificates?: { id: string; title: string; institution: string; issueDate: string; url?: string }[];
    photos?: { id: string; url: string }[];
  }

  interface Service {
    id: string;
    title: string;
    description: string;
  }

  // Logic for useEffect hooks - already restored
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Usuário não encontrado');
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && session?.user?.id && userId !== session.user.id) {
      const fetchFavoriteStatus = async () => {
        setFavoriteLoading(true);
        try {
          const response = await fetch(`/api/user-favorites/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setIsFavorite(data.isFavorite);
          } else {
            console.error('Erro ao buscar status de favorito:', response.statusText);
          }
        } catch (err) {
          console.error('Erro ao buscar status de favorito:', err);
        } finally {
          setFavoriteLoading(false);
        }
      };
      fetchFavoriteStatus();
    }
  }, [userId, session?.user?.id]);

  useEffect(() => {
    if (showSendServiceModal && session?.user?.id) {
      const fetchUserServices = async () => {
        setSendServiceLoading(true); 
        try {
          const response = await fetch(`/api/services?creatorId=${session.user.id}&status=OPEN&limit=100`);
          if (response.ok) {
            const data = await response.json();
            setUserServices(data.services || []); 
          } else {
            toast.error('Erro ao buscar seus serviços.');
            setUserServices([]); 
          }
        } catch (err) {
          console.error('Erro ao buscar serviços:', err);
          toast.error('Não foi possível carregar seus serviços.');
          setUserServices([]);
        } finally {
          setSendServiceLoading(false);
        }
      };
      fetchUserServices();
    }
  }, [showSendServiceModal, session?.user?.id]);

  // Logic for handleToggleFavorite function - already restored
  const handleToggleFavorite = async () => {
    if (!userId || !session?.user?.id) return;
    setFavoriteLoading(true);
    const targetUserId = userId; 
    try {
      if (isFavorite) {
        const response = await fetch(`/api/user-favorites/${targetUserId}`, { method: 'DELETE' });
        if (response.ok) {
          setIsFavorite(false);
          toast.success('Removido dos favoritos!');
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erro ao remover dos favoritos.' }));
          toast.error(errorData.message || 'Erro ao remover dos favoritos.');
        }
      } else {
        const response = await fetch('/api/user-favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favoriteUserId: targetUserId }),
        });
        if (response.ok) {
          setIsFavorite(true);
          toast.success('Adicionado aos favoritos!');
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Erro ao adicionar aos favoritos.' }));
          toast.error(errorData.message || 'Erro ao adicionar aos favoritos.');
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar favoritos:', err);
      toast.error('Ocorreu um erro ao atualizar os favoritos.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Logic for handleSendService function - already restored
  const handleSendService = async () => {
    if (!selectedServiceId || !userId || !session?.user?.id) {
      toast.error('Selecione um serviço para enviar.');
      return;
    }
    setSendServiceLoading(true);
    const profileOwnerUserId = userId; 
    try {
      const response = await fetch(`/api/users/${profileOwnerUserId}/send-service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selectedServiceId }),
      });
      if (response.ok) {
        toast.success('Serviço enviado com sucesso!');
        setShowSendServiceModal(false);
        setSelectedServiceId(null);
        setUserServices([]); 
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erro ao enviar o serviço.' }));
        toast.error(errorData.message || 'Erro ao enviar o serviço.');
      }
    } catch (err) {
      console.error('Erro ao enviar serviço:', err);
      toast.error('Ocorreu um erro ao enviar o serviço.');
    } finally {
      setSendServiceLoading(false);
    }
  };

  // Original early returns
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
          <Link href="/" className="btn-primary">
            Voltar para Início
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-secondary-900 mb-2">Usuário não encontrado</h3>
          <p className="text-secondary-600 mb-6">
            O usuário que você está procurando não existe ou foi removido.
          </p>
          <Link href="/" className="btn-primary py-2 px-4">
            Voltar para Início
          </Link>
        </div>
      </div>
    );
  }
  
  const isOwnProfile = session?.user?.id === user.id; 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Cabeçalho do Perfil com Layout Responsivo */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="h-48 bg-primary-600"></div>
        {/* Container para avatar e texto, agora com flex responsivo */}
        <div className="px-4 sm:px-6 py-4 relative flex flex-col items-center md:flex-row md:items-start md:px-6">
          {/* Avatar container */}
          <div className="relative -top-16 md:absolute md:-top-16 md:left-6 mb-4 md:mb-0">
            {user.image ? (
              <Image // Using next/image
                src={user.image} 
                alt={user.name || 'Avatar'} 
                width={128} // h-32 w-32 -> 8rem -> 128px
                height={128}
                className="rounded-full border-4 border-white object-cover mx-auto md:mx-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/img/avatar_placeholder.png'; }} // Fallback for next/image
              />
            ) : (
              <div className="h-32 w-32 rounded-full border-4 border-white bg-primary-100 flex items-center justify-center mx-auto md:mx-0">
                <span className="text-primary-700 font-bold text-4xl">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          
          {/* Text content + buttons container */}
          <div className="w-full text-center md:text-left md:ml-36">
            {/* Name/details and action buttons row */}
            <div className="flex flex-col items-center md:flex-row md:justify-between md:items-start">
              {/* Name, rating, location block */}
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-secondary-900">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start mt-1">
                  {user.averageRating !== null && typeof user.averageRating === 'number' ? (
                    <>
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-secondary-600 font-semibold">{user.averageRating.toFixed(1)}</span>
                    </>
                  ) : (
                    <span className="ml-1 text-secondary-500 text-sm">Sem avaliações</span>
                  )}
                </div>
                <p className="text-secondary-600 mt-1">
                  {user.city && user.state ? `${user.city}, ${user.state}` : 'Localização não informada'}
                </p>
              </div>
              
              {/* Action buttons container */}
              <div className="flex items-center space-x-2">
                {isOwnProfile && (
                  <Link href="/perfil/editar" className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" title="Editar Perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                  </Link>
                )}
                {!isOwnProfile && session?.user && (
                  <>
                    <button
                      onClick={handleToggleFavorite}
                      disabled={favoriteLoading || !userId || isLoading}
                      aria-label={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                      title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                      className={`p-2 rounded-full transition-colors duration-150 ease-in-out 
                                  ${isFavorite 
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                    : 'bg-primary-100 text-primary-600 hover:bg-primary-200'}
                                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                                  ${isFavorite ? 'focus:ring-red-500' : 'focus:ring-primary-500'}`}
                    >
                      {favoriteLoading ? (
                        <svg className="animate-spin h-5 w-5 text-currentColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : isFavorite ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383-.218l-.022.012-.007.004-.004.001a.752.752 0 01-.704 0l-.004-.001z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      )}
                    </button>
          
                    <button
                      onClick={() => setShowSendServiceModal(true)}
                      disabled={isLoading} 
                      aria-label="Enviar Serviço Diretamente"
                      title="Enviar Serviço Diretamente" 
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {sendServiceLoading ? ( 
                        <svg className="animate-spin h-5 w-5 text-currentColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Professions container - Modified for responsive layout */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              {user.professions && user.professions.map((profession) => (
                <span key={profession.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {profession.name}
                </span>
              ))}
              {(!user.professions || user.professions.length === 0) && (
                <span className="text-secondary-500 text-sm">Nenhuma profissão cadastrada</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs - JSX Reintroduced */}
        <div className="border-t border-secondary-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('sobre')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'sobre'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              Sobre
            </button>
            <button
              onClick={() => setActiveTab('avaliacoes')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'avaliacoes'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              Avaliações
            </button>
            <button
              onClick={() => setActiveTab('certificacoes')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'certificacoes'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              Certificações
            </button>
            <button
              onClick={() => setActiveTab('galeria')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'galeria'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              Galeria
            </button>
          </nav>
        </div>
      </div> {/* This closes the "bg-white shadow-md rounded-lg overflow-hidden" div for Profile Header + Tabs */}
      
      {/* Conteúdo da Tab - JSX Reintroduced */}
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        {activeTab === 'sobre' && (
          <div>
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Sobre</h2>
            {user.about ? (
              <p className="text-secondary-600 whitespace-pre-line">{user.about}</p>
            ) : (
              <p className="text-secondary-500">Nenhuma informação disponível.</p>
            )}
          </div>
        )}
        
        {activeTab === 'avaliacoes' && (
          <div>
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Avaliações</h2>
            {user.reviews && user.reviews.length > 0 ? (
              <div className="space-y-6">
                {user.reviews.map((review) => (
                  <div key={review.id} className="border-b border-secondary-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                        {review.giver.image ? (
                          <Image
                            src={review.giver.image}
                            alt={review.giver.name || 'Reviewer'}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // Prevent infinite loop if placeholder also fails
                              target.src = '/img/avatar_placeholder.png'; // Default placeholder
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                            {review.giver.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-secondary-900">{review.giver.name || 'Avaliador Anônimo'}</p>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-${i < review.rating ? 'yellow' : 'secondary'}-400`}>★</span>
                            ))}
                          </div>
                          <span className="ml-2 text-xs text-secondary-500">
                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-secondary-600">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500">Nenhuma avaliação disponível.</p>
            )}
          </div>
        )}
        
        {activeTab === 'certificacoes' && (
          <div>
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Certificações</h2>
            {user.certificates && user.certificates.length > 0 ? (
              <div className="space-y-4">
                {user.certificates.map((certificate) => (
                  <div key={certificate.id} className="border border-secondary-200 rounded-lg p-4">
                    <h3 className="font-medium text-secondary-900">{certificate.title}</h3>
                    <p className="text-secondary-600 text-sm mt-1">{certificate.institution}</p>
                    <p className="text-secondary-500 text-sm mt-1">
                      Emitido em: {new Date(certificate.issueDate).toLocaleDateString('pt-BR')}
                    </p>
                    {certificate.url && (
                      <a
                        href={certificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                      >
                        Ver certificado
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500">Nenhuma certificação disponível.</p>
            )}
          </div>
        )}
        
        {activeTab === 'galeria' && (
          <div>
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Galeria de Trabalhos</h2>
            {user.photos && user.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {user.photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt="Trabalho" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error("Erro ao carregar imagem:", photo.url);
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=Imagem+não+disponível";
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500">Nenhuma foto disponível.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Send Service Modal - JSX Reintroduced */}
      {showSendServiceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Enviar Serviço Diretamente</h2>
            
            {sendServiceLoading && !userServices.length ? (
              <p>Carregando seus serviços...</p>
            ) : userServices.length === 0 ? (
              <p className="text-secondary-600 mb-4">Você não possui serviços abertos para enviar.</p>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto mb-6">
                {userServices.map((service: Service) => (
                  <label key={service.id} className="flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer border border-gray-200">
                    <input
                      type="radio"
                      name="selectedService"
                      value={service.id}
                      checked={selectedServiceId === service.id}
                      onChange={() => setSelectedServiceId(service.id)}
                      className="form-radio h-5 w-5 text-primary-600"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-secondary-800">{service.title}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSendServiceModal(false);
                  setSelectedServiceId(null);
                  setUserServices([]); 
                }}
                className="btn-outline py-2 px-4"
                disabled={sendServiceLoading && userServices.length > 0}
              >
                Cancelar
              </button>
              <button
                onClick={handleSendService}
                disabled={!selectedServiceId || (sendServiceLoading && userServices.length > 0) || userServices.length === 0}
                className="btn-primary py-2 px-4"
              >
                {sendServiceLoading && userServices.length > 0 ? 'Enviando...' : 'Confirmar e Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
