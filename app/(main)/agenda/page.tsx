'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Placeholder icons (Heroicons)
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const CurrencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

type ServiceType = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  date: string | null;
  address: string | null;
  status: string;
  creatorId: string;
  creator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  provider: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

export default function AgendaPage() {
  const { data: session, status } = useSession();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    const fetchAgendaServices = async () => {
      if (status === 'loading') return;
      if (!session?.user?.id) {
        setError('Você precisa estar logado para ver sua agenda.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Buscar serviços em andamento ou concluídos onde o usuário é criador ou prestador
        const response = await fetch('/api/agenda');
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: 'Erro ao buscar serviços agendados.' }));
          throw new Error(errData.error || 'Falha ao buscar serviços agendados');
        }
        
        const data = await response.json();
        setServices(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
        console.error('Erro ao buscar serviços agendados:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgendaServices();
  }, [session, status]);

  // Filtrar serviços com base na seleção
  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    
    const serviceDate = service.date ? new Date(service.date) : null;
    const now = new Date();
    
    if (filter === 'upcoming' && serviceDate) {
      return serviceDate > now;
    }
    
    if (filter === 'past' && serviceDate) {
      return serviceDate <= now;
    }
    
    return true;
  });

  // Ordenar serviços por data (próximos primeiro)
  const sortedServices = [...filteredServices].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : Infinity;
    const dateB = b.date ? new Date(b.date).getTime() : Infinity;
    return dateA - dateB;
  });

  // Agrupar serviços por data
  const groupedServices: Record<string, ServiceType[]> = {};
  sortedServices.forEach(service => {
    if (!service.date) {
      const key = 'Sem data definida';
      if (!groupedServices[key]) groupedServices[key] = [];
      groupedServices[key].push(service);
      return;
    }
    
    const date = new Date(service.date);
    const key = format(date, 'dd/MM/yyyy', { locale: ptBR });
    if (!groupedServices[key]) groupedServices[key] = [];
    groupedServices[key].push(service);
  });

  // Função para formatar data e hora
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  // Função para determinar se o usuário é o criador ou prestador
  const getUserRole = (service: ServiceType) => {
    if (!session?.user?.id) return '';
    if (service.creatorId === session.user.id) return 'Contratante';
    return 'Prestador';
  };

  // Função para obter o nome da outra parte
  const getOtherPartyName = (service: ServiceType) => {
    if (!session?.user?.id) return '';
    if (service.creatorId === session.user.id) {
      return service.provider?.name || 'Prestador';
    }
    return service.creator?.name || 'Contratante';
  };

  // Função para obter a cor de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'DISPUTED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o texto de status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      case 'DISPUTED':
        return 'Em disputa';
      default:
        return status;
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen"><p>Carregando...</p></div>;
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">Você precisa estar logado para ver sua agenda.</p>
        </div>
        <Link href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Fazer login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <CalendarIcon /> Minha Agenda de Serviços
      </h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Passados
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p>Carregando serviços agendados...</p>
        </div>
      ) : sortedServices.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço agendado</h3>
          <p className="text-gray-600 mb-4">
            Você não possui serviços agendados no momento.
          </p>
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Explorar serviços
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedServices).map(([date, dateServices]) => (
            <div key={date} className="border-b pb-6 last:border-b-0">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{date}</h2>
              <div className="space-y-4">
                {dateServices.map((service) => (
                  <Link 
                    href={`/servicos/${service.id}`} 
                    key={service.id}
                    className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{service.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {getStatusText(service.status)}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon />
                        <span>{formatDateTime(service.date)}</span>
                      </div>
                      
                      {service.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon />
                          <span>{service.address}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <CurrencyIcon />
                        <span>{service.price ? `R$ ${service.price.toFixed(2)}` : 'Valor não definido'}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon />
                        <span>
                          <span className="font-medium">{getUserRole(service)}:</span> Você | 
                          <span className="font-medium"> {service.creatorId === session.user.id ? 'Prestador' : 'Contratante'}:</span> {getOtherPartyName(service)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
