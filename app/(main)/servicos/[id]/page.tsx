'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function ServiceDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id;

  const [service, setService] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${serviceId}`);
        if (!response.ok) {
          throw new Error('Serviço não encontrado');
        }
        const data = await response.json();
        setService(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  if (isLoading) {
    return <p className="text-center py-12">Carregando...</p>;
  }

  if (error || !service) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">{error || 'Serviço não encontrado'}</p>
        <Link href="/explorar" className="text-blue-600 underline">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{service.title}</h1>
      {service.photos?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {service.photos.map((photo: any, i: number) => (
            <div key={i} className="relative w-full aspect-square">
              <Image src={photo.url} alt={`Foto ${i + 1}`} fill className="object-cover rounded" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">Sem imagens disponíveis.</p>
      )}

      <p className="mb-2 font-semibold">Descrição:</p>
      <p className="mb-4 whitespace-pre-wrap">{service.description}</p>

      <p className="mb-2 font-semibold">Valor:</p>
      <p className="mb-4">{service.price ? `R$ ${service.price.toFixed(2)}` : 'Aberto a propostas'}</p>

      <p className="mb-2 font-semibold">Status:</p>
      <p className="mb-4">{service.status}</p>

      <Link href="/explorar" className="btn-primary">Voltar para Explorar</Link>
    </div>
  );
}
