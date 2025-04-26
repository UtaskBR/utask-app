'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const userId = params.id;
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('sobre');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Usuário não encontrado');
        }
        
        const data = await response.json();
        console.log("Dados do usuário carregados:", data); // Log para depuração
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId]);

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
      {/* Cabeçalho do Perfil */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="h-48 bg-primary-600"></div>
        <div className="px-6 py-4 relative">
          <div className="absolute -top-16 left-6">
            {/* CORREÇÃO: Exibir imagem do avatar se disponível */}
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name || 'Avatar'} 
                className="h-32 w-32 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full border-4 border-white bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-bold text-4xl">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          
          <div className="ml-36">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">{user.name}</h1>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-secondary-600">{user.rating || 'Sem avaliações'}</span>
                </div>
                <p className="text-secondary-600 mt-1">
                  {user.city && user.state ? `${user.city}, ${user.state}` : 'Localização não informada'}
                </p>
              </div>
              
              {isOwnProfile ? (
                <Link href="/perfil/editar" className="btn-outline py-2 px-4">
                  Editar Perfil
                </Link>
              ) : (
                <button className="btn-primary py-2 px-4">
                  Enviar Mensagem
                </button>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
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
        
        {/* Tabs */}
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
      </div>
      
      {/* Conteúdo da Tab */}
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
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {review.giver.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-secondary-900">{review.giver.name}</p>
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
                {/* CORREÇÃO: Exibir imagens reais da galeria */}
                {user.photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt="Trabalho" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error("Erro ao carregar imagem:", photo.url);
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300?text=Imagem+não+disponível";
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
    </div>
  );
}
