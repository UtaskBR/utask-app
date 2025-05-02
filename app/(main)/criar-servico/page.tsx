'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CreateServicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  interface Profession {
    id: string;
    name: string;
  }

  const [professions, setProfessions] = useState<Profession[]>([]);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    timeWindow: 60,
    price: '',
    professionId: '',
    latitude: null,
    longitude: null,
    address: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    const fetchProfessions = async () => {
      try {
        const response = await fetch('/api/professions');
        const data = await response.json();
        setProfessions(data);
      } catch (err) {
        console.error('Erro ao carregar profissões:', err);
      }
    };

    fetchProfessions();
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description) {
      setError('Título e descrição são obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        timeWindow: formData.timeWindow ? parseInt(formData.timeWindow.toString()) : null
      };

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar serviço');
      }

      const data = await response.json();
      const serviceId = data.id;

      if (photos.length > 0) {
        try {
          await uploadPhotos(serviceId);
          toast.success('Serviço criado com sucesso com fotos!');
        } catch (photoErr: any) {
          toast.error(`Serviço criado, mas erro no upload de fotos: ${photoErr.message}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        toast.success('Serviço criado com sucesso!');
      }

      router.push(`/servicos/${serviceId}`);
    } catch (err: any) {
      console.error('Erro ao criar serviço:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Criar Novo Serviço</h1>
        <p className="mt-2 text-secondary-600">
          Preencha os detalhes do serviço que você precisa
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
              Título do Serviço *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="input-field mt-1"
              placeholder="Ex: Instalação de Ar Condicionado"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="input-field mt-1"
              placeholder="Descreva detalhadamente o serviço que você precisa"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="professionId" className="block text-sm font-medium text-secondary-700">
                Tipo de Serviço
              </label>
              <select
                id="professionId"
                name="professionId"
                className="input-field mt-1"
                value={formData.professionId}
                onChange={handleChange}
              >
                <option value="">Selecione uma categoria</option>
                {professions.map((profession) => (
                  <option key={profession.id} value={profession.id}>
                    {profession.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-secondary-700">
                Valor (R$)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                className="input-field mt-1"
                placeholder="Deixe em branco para receber propostas"
                value={formData.price}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-secondary-500">
                Deixe em branco para receber propostas de valor dos prestadores
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex justify-center items-center"
            >
              {isLoading ? 'Processando...' : 'Criar Serviço'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
