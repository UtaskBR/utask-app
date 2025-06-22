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

  // Logic for the first useEffect (fetchUser) - already restored
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

  // Restore logic for the second useEffect (fetchFavoriteStatus)
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
            // Don't toast error here, as it might be common if user is not favorited yet (404)
            console.error('Erro ao buscar status de favorito:', response.statusText);
          }
        } catch (err) {
          console.error('Erro ao buscar status de favorito:', err);
          // toast.error('Não foi possível verificar o status de favorito.');
        } finally {
          setFavoriteLoading(false);
        }
      };
      fetchFavoriteStatus();
    }
  }, [userId, session?.user?.id]);

  // Third useEffect remains empty
  useEffect(() => {
    // Content intentionally left empty for this iteration
  }, [showSendServiceModal, session?.user?.id]);

  // Handler functions remain empty
  const handleToggleFavorite = async () => {
    // Content intentionally left empty for this iteration
  };

  const handleSendService = async () => {
    // Content intentionally left empty for this iteration
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
      <h1>Minimal Profile Page (with Early Returns & First/Second useEffect Logic)</h1>
      <p>User ID: {userId}</p>
      <p>Is Own Profile: {isOwnProfile.toString()}</p>
      {user && <p>User Name: {user.name || 'N/A'}</p>}
      <p>Is Favorite: {isFavorite.toString()}</p>
    </div>
  );
}
