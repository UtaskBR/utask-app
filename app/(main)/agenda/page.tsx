'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function AgendaPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar'); // 'calendar', 'upcoming', 'past'
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewService, setPreviewService] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (session?.user?.id) {
      fetchAppointments();
    }
  }, [session]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${session.user.id}/appointments`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Filtrar apenas serviços aceitos (IN_PROGRESS) que ainda não foram concluídos
        const filteredAppointments = data.filter(appointment => 
          appointment.status === 'IN_PROGRESS'
        );
        
        setAppointments(filteredAppointments);
        
        // Extrair datas para marcar no calendário
        const dates = filteredAppointments
          .filter(appointment => appointment.date)
          .map(appointment => new Date(appointment.date));
        
        setMarkedDates(dates);
      } else {
        toast.error('Erro ao carregar agenda');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar agenda');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar compromissos com base na data selecionada
  const filteredAppointments = selectedDate
    ? appointments.filter(appointment => {
        if (!appointment.date) return false;
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getDate() === selectedDate.getDate() &&
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : appointments;

  // Separar compromissos futuros e passados
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter(appointment => {
    if (!appointment.date) return false;
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  });

  const pastAppointments = appointments.filter(appointment => {
    if (!appointment.date) return false;
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  });

  // Função para formatar o valor do serviço
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'A combinar';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Função para formatar a data do serviço
  const formatDate = (dateString) => {
    if (!dateString) return 'A combinar';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para verificar se uma data tem compromissos
  const hasAppointment = (date) => {
    return markedDates.some(markedDate => 
      markedDate.getDate() === date.getDate() &&
      markedDate.getMonth() === date.getMonth() &&
      markedDate.getFullYear() === date.getFullYear()
    );
  };

  // Função para mostrar preview do serviço
  const showServicePreview = (service, event) => {
    setPreviewService(service);
    setPreviewPosition({
      x: event.clientX,
      y: event.clientY
    });
    setShowPreview(true);
  };

  // Função para esconder preview do serviço
  const hideServicePreview = () => {
    setShowPreview(false);
    setPreviewService(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Agenda</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agenda</h1>
      
      {/* Abas de visualização */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                view === 'calendar'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setView('calendar');
                setSelectedDate(null);
              }}
            >
              Calendário
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                view === 'upcoming'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setView('upcoming');
                setSelectedDate(null);
              }}
            >
              Próximos ({upcomingAppointments.length})
            </button>
          </li>
          <li>
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                view === 'past'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setView('past');
                setSelectedDate(null);
              }}
            >
              Passados ({pastAppointments.length})
            </button>
          </li>
        </ul>
      </div>

      {/* Visualização de calendário */}
      {view === 'calendar' && (
        <div className="mb-8">
          <div className="mb-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="rounded-lg shadow-md border border-gray-200 p-4 w-full max-w-3xl mx-auto"
              tileClassName={({ date }) => 
                hasAppointment(date) ? 'bg-primary-100 text-primary-800 font-bold rounded-full' : null
              }
              tileContent={({ date }) => {
                if (hasAppointment(date)) {
                  const dateAppointments = appointments.filter(appointment => {
                    if (!appointment.date) return false;
                    const appointmentDate = new Date(appointment.date);
                    return (
                      appointmentDate.getDate() === date.getDate() &&
                      appointmentDate.getMonth() === date.getMonth() &&
                      appointmentDate.getFullYear() === date.getFullYear()
                    );
                  });
                  
                  return (
                    <div 
                      className="absolute bottom-0 left-0 right-0 flex justify-center"
                      onMouseEnter={(e) => showServicePreview(dateAppointments[0], e)}
                      onMouseLeave={hideServicePreview}
                    >
                      <span className="h-1.5 w-1.5 bg-primary-500 rounded-full"></span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </div>

          {/* Preview do serviço */}
          {showPreview && previewService && (
            <div 
              className="fixed bg-white rounded-lg shadow-lg p-4 z-50 w-64"
              style={{
                top: `${previewPosition.y + 10}px`,
                left: `${previewPosition.x + 10}px`
              }}
            >
              <h3 className="font-semibold text-gray-900">{previewService.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{formatDate(previewService.date)}</p>
              <p className="text-sm text-gray-600 mt-1">{formatValue(previewService.value)}</p>
              {previewService.client && (
                <p className="text-sm text-gray-600 mt-1">Cliente: {previewService.client.name}</p>
              )}
              {previewService.provider && (
                <p className="text-sm text-gray-600 mt-1">Prestador: {previewService.provider.name}</p>
              )}
            </div>
          )}

          {/* Lista de serviços do dia selecionado */}
          {selectedDate && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Serviços em {selectedDate.toLocaleDateString('pt-BR')}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredAppointments.length})
                </span>
              </h2>
              
              {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-700">Não há serviços agendados para esta data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAppointments.map(appointment => (
                    <ServiceCard 
                      key={appointment.id} 
                      service={appointment} 
                      userId={session?.user?.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Visualização de próximos serviços */}
      {view === 'upcoming' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Próximos serviços
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({upcomingAppointments.length})
            </span>
          </h2>
          
          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-700 mb-4">Você não tem serviços agendados.</p>
              <Link href="/explorar" className="btn-primary">
                Explorar serviços disponíveis
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingAppointments.map(appointment => (
                <ServiceCard 
                  key={appointment.id} 
                  service={appointment} 
                  userId={session?.user?.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visualização de serviços passados */}
      {view === 'past' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Serviços passados
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({pastAppointments.length})
            </span>
          </h2>
          
          {pastAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-700">Você não tem serviços passados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastAppointments.map(appointment => (
                <ServiceCard 
                  key={appointment.id} 
                  service={appointment} 
                  userId={session?.user?.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente de cartão de serviço
function ServiceCard({ service, userId }) {
  // Determinar se o usuário é o criador ou o prestador
  const isCreator = service.creatorId === userId;
  const isProvider = service.bids?.some(bid => 
    bid.providerId === userId && bid.status === 'ACCEPTED'
  );
  
  // Encontrar a proposta aceita
  const acceptedBid = service.bids?.find(bid => bid.status === 'ACCEPTED');
  
  // Função para formatar o valor do serviço
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'A combinar';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Função para formatar a data do serviço
  const formatDate = (dateString) => {
    if (!dateString) return 'A combinar';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {service.title}
          </h3>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-xs text-gray-500">Valor:</p>
            <p className="text-sm font-medium">
              {acceptedBid ? formatValue(acceptedBid.value) : formatValue(service.value)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Data:</p>
            <p className="text-sm font-medium">{formatDate(service.date)}</p>
          </div>
        </div>
        
        {isCreator ? (
          <div className="mb-4">
            <p className="text-xs text-gray-500">Prestador:</p>
            <div className="flex items-center mt-1">
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                {acceptedBid?.provider?.image ? (
                  <Image
                    src={acceptedBid.provider.image}
                    alt={acceptedBid.provider.name || "Prestador"}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <span className="text-xs text-gray-700 font-medium">
                    {acceptedBid?.provider?.name?.charAt(0) || "P"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">
                {acceptedBid?.provider?.name || "Prestador não disponível"}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-xs text-gray-500">Cliente:</p>
            <div className="flex items-center mt-1">
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                {service.creator?.image ? (
                  <Image
                    src={service.creator.image}
                    alt={service.creator.name || "Cliente"}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <span className="text-xs text-gray-700 font-medium">
                    {service.creator?.name?.charAt(0) || "C"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">
                {service.creator?.name || "Cliente não disponível"}
              </span>
            </div>
          </div>
        )}
        
        <Link 
          href={`/servicos/${service.id}`}
          className="w-full block text-center py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
