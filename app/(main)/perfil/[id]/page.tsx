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
  const [userServices, setUserServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [sendServiceLoading, setSendServiceLoading] = useState(false);

  // Original interface definitions
  interface User {
    id: string;
    name?: string;
    image?: string;
    rating?: string;
    city?: string;
    state?: string;
    professions?: { id: string; name: string }[];
    about?: string;
    reviews?: { id: string; giver: { name: string }; rating: number; comment?: string; createdAt: string }[];
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
        console.log("Dados do usuário carregados:", data); // Log for debugging
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
            setUserServices(data);
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
        const response = await fetch(`/api/user-favorites/${targetUserId}`, {
          method: 'DELETE',
        });
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

  // Restore logic for handleSendService function
  const handleSendService = async () => {
    if (!selectedServiceId || !userId || !session?.user?.id) {
      toast.error('Selecione um serviço para enviar.');
      return;
    }

    setSendServiceLoading(true);
    const profileOwnerUserId = userId; // ID of the user whose profile is being viewed

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
        setUserServices([]); // Clear services list
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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Minimal Profile Page (All JS logic restored)</h1>
      <p>User ID: {userId}</p>
      <p>Is Own Profile: {isOwnProfile.toString()}</p>
      {user && <p>User Name: {user.name || 'N/A'}</p>}
      <p>Is Favorite: {isFavorite.toString()}</p>
      <p>Number of user services loaded: {userServices.length}</p>
    </div>
  );
}
