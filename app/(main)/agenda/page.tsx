'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, parseISO, isToday, isTomorrow, isYesterday, isSameDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Ícones
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const CurrencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;

export default function AgendaPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);

  // Função para buscar serviços
  const fetchServices = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/agenda?filter=${activeTab}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar serviços da agenda');
      }
      const data = await response.json();
      setServices(data);
      setDebugData(data); // Para debug
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
      setError('Não foi possível carregar sua agenda. Tente novamente mais tarde.');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar serviços quando a tab mudar ou o usuário logar
  useEffect(() => {
    if (session?.user?.id) {
      fetchServices();
    }
  }, [session, activeTab]);

  // Agrupar serviços por data
  const groupServicesByDate = () => {
    const grouped: Record<string, any[]> = {};
    
    services.forEach(service => {
      let dateKey = 'Sem data definida';
      
      if (service.date) {
        try {
          const serviceDate = new Date(service.date);
          
          // Verificar se a data é válida
          if (!isNaN(serviceDate.getTime())) {
            if (isToday(serviceDate)) {
              dateKey = 'Hoje';
            } else if (isTomorrow(serviceDate)) {
              dateKey = 'Amanhã';
            } else if (isYesterday(serviceDate)) {
              dateKey = 'Ontem';
            } else {
              dateKey = format(serviceDate, 'dd/MM/yyyy', { locale: ptBR });
            }
          }
        } catch (error) {
          console.error('Erro ao processar data:', error);
          dateKey = 'Data inválida';
        }
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(service);
    });
    
    return grouped;
  };

  // Filtrar serviços por data selecionada no calendário
  const getFilteredServices = () => {
    if (!selectedDate) {
      return groupServicesByDate();
    }
    
    const filtered = services.filter(service => {
      if (!service.date) return false;
      
      try {
        const serviceDate = new Date(service.date);
        return isSameDay(serviceDate, selectedDate);
      } catch (error) {
        return false;
      }
    });
    
    if (filtered.length === 0) {
      return { 'Nenhum serviço nesta data': [] };
    }
    
    const dateKey = format(selectedDate, 'dd/MM/yyyy', { locale: ptBR });
    return { [dateKey]: filtered };
  };

  // Formatar data e hora
  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "HH:mm", { locale: ptBR });
    } catch (error) {
      return "Horário não definido";
    }
  };

  // Obter classe de status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter texto de status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Aberto';
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Renderizar serviços agrupados
  const renderGroupedServices = () => {
    const groupedServices = getFilteredServices();
    
    return Object.entries(groupedServices).map(([date, dateServices]) => (
      <div key={date} className="mb-8">
        <h2 className="text-xl font-bold mb-4">{date}</h2>
        {dateServices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
            Nenhum serviço agendado para esta data.
          </div>
        ) : (
          dateServices.map(service => (
            <div key={service.id} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(service.status)}`}>
                    {getStatusText(service.status)}
                  </span>
                </div>
                
                <div className="mt-2 space-y-2">
                  {service.date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon />
                      <span className="ml-2">Data e hora: {format(new Date(service.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  )}
                  
                  {service.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <LocationIcon />
                      <span className="ml-2">Local: {service.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyIcon />
                    <span className="ml-2">Valor: {service.price ? `R$ ${service.price.toFixed(2)}` : 'A combinar'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <UsersIcon />
                    <span className="ml-2">
                      Participantes: 
                      {service.bids && service.bids.length > 0 && service.bids[0].provider ? (
                        <span>
                          Prestador: {service.bids[0].provider.name} | Contratante: {service.creator.name}
                        </span>
                      ) : (
                        <span>
                          {service.creatorId === session?.user?.id ? 'Você é o criador' : `Contratante: ${service.creator.name}`}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link 
                    href={`/servicos/${service.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Ver detalhes <ArrowRightIcon />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minha Agenda de Serviços</h1>
        {showDebug && (
          <button 
            onClick={() => setShowDebug(!showDebug)} 
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Debug Agenda
          </button>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'todos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('todos'); setSelectedDate(null); }}
          >
            Todos
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'proximos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('proximos'); setSelectedDate(null); }}
          >
            Próximos
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'passados' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('passados'); setSelectedDate(null); }}
          >
            Passados
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendário */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) {
                  setSelectedDate(value);
                } else if (Array.isArray(value) && value[0] instanceof Date) {
                  setSelectedDate(value[0]);
                } else {
                  setSelectedDate(null);
                }
              }}
              value={selectedDate}
              locale="pt-BR"
              className="w-full border-0"
              tileClassName={({ date }) => {
                // Destacar datas com serviços
                const hasService = services.some(service => {
                  if (!service.date) return false;
                  try {
                    return isSameDay(new Date(service.date), date);
                  } catch (error) {
                    return false;
                  }
                });
                return hasService ? 'bg-blue-100 text-blue-800 rounded-full' : null;
              }}
            />
            
            {selectedDate && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Serviços em {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Limpar seleção
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Lista de Serviços */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando sua agenda...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sua agenda está vazia</h3>
              <p className="text-gray-600 mb-4">Você ainda não tem serviços agendados.</p>
              <Link
                href="/explorar"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Explorar Serviços
              </Link>
            </div>
          ) : (
            renderGroupedServices()
          )}
        </div>
      </div>
      
      {/* Debug View */}
      {showDebug && debugData && (
        <div className="mt-8 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Data</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
