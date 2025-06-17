'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import toast from 'react-hot-toast';

export default function NotificacoesPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar notificações');
        }
        
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        toast.error('Não foi possível carregar as notificações');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  interface Notification {
    id: string;
    type: string;
    title: string; // Added title
    message: string;
    createdAt: string;
    read: boolean;
    sender: { // Added sender
      id: string;
      name?: string | null;
      image?: string | null;
    } | null;
    serviceId?: string | null; // Added serviceId
    bidId?: string | null; // Added bidId
  }

  const markAsRead = async (id: string): Promise<void> => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: [id]
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao marcar notificação como lida');
      }
      
      // Atualizar o estado local
      setNotifications((prev: Notification[]) => 
        prev.map((notif: Notification) => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      toast.success('Notificação marcada como lida');
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Não foi possível marcar a notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: []
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao marcar notificações como lidas');
      }
      
      // Atualizar o estado local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
      toast.error('Não foi possível marcar as notificações como lidas');
    }
  };

  // Função para formatar a data
  const formatDate = (dateString: string): string => {
    const date: Date = new Date(dateString);
    const now: Date = new Date();
    const diffMs: number = now.getTime() - date.getTime();
    const diffSec: number = Math.floor(diffMs / 1000);
    const diffMin: number = Math.floor(diffSec / 60);
    const diffHour: number = Math.floor(diffMin / 60);
    const diffDay: number = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'agora mesmo';
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diffHour < 24) {
      return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffDay < 7) {
      return `${diffDay} ${diffDay === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Função para obter o ícone da notificação com base no tipo
  interface NotificationIconProps {
    type: string;
  }

  const getNotificationIcon = (type: NotificationIconProps['type']): React.ReactElement => {
    switch (type) {
      case 'BID':
        return (
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'COUNTER_OFFER':
        return (
          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
      case 'ACCEPTANCE':
        return (
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'REJECTION':
        return (
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'SERVICE_COMPLETION':
        return (
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'REVIEW':
        return (
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">Notificações</h1>
          
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-xl font-medium text-secondary-900 mb-2">Nenhuma notificação</h3>
            <p className="text-secondary-600">
              Você não tem notificações no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const notificationContent = (
                <div className="flex items-start w-full">
                  {/* Sender Avatar */}
                  {notification.sender?.image ? (
                    <img
                      src={notification.sender.image}
                      alt={notification.sender.name || 'Avatar do remetente'}
                      className="h-10 w-10 rounded-full mr-3"
                    />
                  ) : notification.sender ? (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-500 font-semibold">
                      {notification.sender.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  ) : (
                    // Fallback icon if no sender (e.g. system notification)
                    getNotificationIcon(notification.type)
                  )}
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div>
                        {notification.sender && (
                          <p className={`text-sm font-medium text-secondary-700 ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.sender.name || 'Sistema'}
                          </p>
                        )}
                        <p className={`text-lg font-semibold text-secondary-900 ${!notification.read ? 'font-bold' : ''}`}>
                          {notification.title}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.preventDefault(); // Prevent link navigation if inside a link
                            e.stopPropagation(); // Stop event bubbling
                            markAsRead(notification.id);
                          }}
                          className="ml-4 text-primary-600 hover:text-primary-700 text-xs font-medium"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                    <p className={`text-secondary-800 text-sm mt-1 ${!notification.read ? '' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-secondary-500 text-xs mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              );

              return (
                <div
                  key={notification.id}
                  className={`bg-white shadow-md rounded-lg p-4 flex ${
                    !notification.read ? 'border-l-4 border-primary-500' : 'border-l-4 border-transparent'
                  } hover:bg-gray-50 transition-colors duration-150 ease-in-out`}
                >
                  {notification.serviceId ? (
                    <Link href={`/servicos/${notification.serviceId}`} className="block w-full">
                      {notificationContent}
                    </Link>
                  ) : (
                    // Render content without Link if no serviceId
                    notificationContent
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
