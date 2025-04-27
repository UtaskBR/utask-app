'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Definir interface para o tipo de compromisso
interface Appointment {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string | null;
  value: number | null;
  creatorId: string;
  creator?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  bids?: Array<{
    id: string;
    status: string;
    value: number | null;
    providerId: string;
    provider?: {
      id: string;
      name: string | null;
      image: string | null;
      professions?: any[];
    };
  }>;
}

export default function AgendaPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar'); // 'calendar', 'upcoming', 'past'
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [markedDates, setMarkedDates] = useState<Date[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewService, setPreviewService] = useState<Appointment | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (session?.user?.id) {
      fetchAppointments();
    }
  }, [session]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Adicionar verificação de nulidade usando o operador opcional
      const response = await fetch(`/api/users/${session?.user?.id}/appointments`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Filtrar apenas serviços aceitos (IN_PROGRESS) que ainda não foram concluídos
        const filteredAppointments = data.filter((appointment: Appointment) => 
          appointment.status === 'IN_PROGRESS'
        );
        
        setAppointments(filteredAppointments);
        
        // Extrair datas para marcar no calendário
        const dates = filteredAppointments
          .filter((app: Appointment) => app.date)
          .map((app: Appointment) => new Date(app.date as string));
        
        setMarkedDates(dates);
      } else {
        toast.error('Erro ao carregar compromissos');
      }
    } catch (error) {
      console.error('Erro ao buscar compromissos:', error);
      toast.error('Erro ao carregar compromissos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar compromissos por data selecionada
  const filteredAppointments = selectedDate
    ? appointments.filter(app => {
        if (!app.date) return false;
        const appDate = new Date(app.date);
        return (
          appDate.getDate() === selectedDate.getDate() &&
          appDate.getMonth() === selectedDate.getMonth() &&
          appDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : appointments;

  // Separar compromissos futuros e passados
  const now = new Date();
  const upcomingAppointments = appointments.filter(app => {
    if (!app.date) return false;
    return new Date(app.date) >= now;
  });
  
  const pastAppointments = appointments.filter(app => {
    if (!app.date) return false;
    return new Date(app.date) < now;
  });

  // Função para mostrar preview do serviço
  const handleShowPreview = (service: Appointment, event: React.MouseEvent) => {
    setPreviewService(service);
    setPreviewPosition({
      x: event.clientX,
      y: event.clientY
    });
    setShowPreview(true);
  };

  // Função para esconder preview
  const handleHidePreview = () => {
    setShowPreview(false);
  };

  // Função para renderizar marcações no calendário
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasAppointment = markedDates.some(
        markedDate =>
          markedDate.getDate() === date.getDate() &&
          markedDate.getMonth() === date.getMonth() &&
          markedDate.getFullYear() === date.getFullYear()
      );

      return hasAppointment ? (
        <div className="h-2 w-2 bg-primary-500 rounded-full mx-auto mt-1"></div>
      ) : null;
    }
    return null;
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="mb-6">Faça login para acessar sua agenda de serviços.</p>
        <Link
          href="/login"
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Minha Agenda</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-md ${
            view === 'calendar'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Calendário
        </button>
        <button
          onClick={() => setView('upcoming')}
          className={`px-4 py-2 rounded-md ${
            view === 'upcoming'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Próximos ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setView('past')}
          className={`px-4 py-2 rounded-md ${
            view === 'past'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Passados ({pastAppointments.length})
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div>
          {view === 'calendar' && (
            <div className="mb-8">
              <div className="calendar-container mb-6">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="rounded-lg shadow-md border border-gray-200 p-4 w-full"
                />
              </div>
              
              {selectedDate && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Serviços em {selectedDate.toLocaleDateString('pt-BR')}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredAppointments.length})
                    </span>
                  </h2>
                  
                  {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                      <p className="text-gray-700">Nenhum serviço agendado para esta data.</p>
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
                  <p className="text-gray-700">Você não tem serviços agendados.</p>
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
      )}
    </div>
  );
}

// Componente de cartão de serviço
interface ServiceCardProps {
  service: Appointment;
  userId: string | undefined;
}

function ServiceCard({ service, userId }: ServiceCardProps) {
  // Determinar se o usuário é o criador ou o prestador
  const isCreator = service.creatorId === userId;
  const isProvider = service.bids?.some(bid => 
    bid.providerId === userId && bid.status === 'ACCEPTED'
  );
  
  // Encontrar a proposta aceita
  const acceptedBid = service.bids?.find(bid => bid.status === 'ACCEPTED');
  
  // Função para formatar o valor do serviço
  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'A combinar';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Função para formatar a data do serviço
  const formatDate = (dateString: string | null | undefined) => {
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
