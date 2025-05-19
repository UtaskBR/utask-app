'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Placeholder icons (Heroicons)
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;

export default function EditServicePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [professions, setProfessions] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    date: '',
    address: '',
    professionId: '',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/services/${serviceId}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: 'Serviço não encontrado ou erro na resposta.' }));
          throw new Error(errData.error || 'Falha ao buscar o serviço');
        }
        const data = await response.json();
        
        // Check if user is the creator
        if (session?.user?.id !== data.creatorId) {
          router.push(`/servicos/${serviceId}`);
          return;
        }
        
        // Check if service can be edited
        if (data.status !== 'OPEN' && data.status !== 'PENDING') {
          setError('Este serviço não pode ser editado pois já foi aceito ou está em andamento.');
          router.push(`/servicos/${serviceId}`);
          return;
        }
        
        // Format date for input
        let formattedDate = '';
        if (data.date) {
          const date = new Date(data.date);
          formattedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16);
        }
        
        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          date: formattedDate,
          address: data.address || '',
          professionId: data.profession?.id || '',
        });
        
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProfessions = async () => {
      try {
        const response = await fetch('/api/professions');
        if (!response.ok) throw new Error('Falha ao buscar profissões');
        const data = await response.json();
        setProfessions(data);
      } catch (err) {
        console.error('Erro ao buscar profissões:', err);
      }
    };

    if (session) {
      fetchService();
      fetchProfessions();
    }
  }, [serviceId, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) {
      setError('Você precisa estar logado para editar um serviço.');
      return;
    }
    
    setActionLoading('save');
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : undefined,
          date: formData.date || undefined,
          address: formData.address,
          professionId: formData.professionId || undefined,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao atualizar serviço');
      
      router.push(`/servicos/${serviceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setActionLoading('delete');
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao excluir serviço');
      
      router.push('/meus-servicos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
    } finally {
      setActionLoading(null);
      setConfirmDelete(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><p>Carregando...</p></div>;

  // Button Styles
  const btnBase = "px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary = `${btnBase} bg-blue-500 hover:bg-blue-600 text-white`;
  const btnSecondary = `${btnBase} bg-gray-200 hover:bg-gray-300 text-gray-700`;
  const btnDanger = `${btnBase} bg-red-500 hover:bg-red-600 text-white`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/servicos/${serviceId}`} className="text-blue-600 hover:text-blue-700 flex items-center mb-6">
        <ArrowLeftIcon /> Voltar para o serviço
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Serviço</h1>
      
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Serviço</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ex: Conserto de encanamento"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição Detalhada</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Descreva o serviço com detalhes..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: 150.00"
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data e Hora</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ex: Rua Exemplo, 123 - Bairro, Cidade"
          />
        </div>
        
        <div>
          <label htmlFor="professionId" className="block text-sm font-medium text-gray-700">Categoria/Profissão</label>
          <select
            id="professionId"
            name="professionId"
            value={formData.professionId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecione uma categoria</option>
            {professions.map((profession) => (
              <option key={profession.id} value={profession.id}>
                {profession.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleDelete}
            className={`${btnDanger} order-2 sm:order-1`}
            disabled={!!actionLoading}
          >
            <TrashIcon />
            {confirmDelete ? 'Confirmar Exclusão' : 'Excluir Serviço'}
          </button>
          
          <button
            type="submit"
            className={`${btnPrimary} order-1 sm:order-2`}
            disabled={!!actionLoading}
          >
            <SaveIcon />
            {actionLoading === 'save' ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
