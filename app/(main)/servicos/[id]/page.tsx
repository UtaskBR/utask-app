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

  const isOwner = session?.user?.id === service.creator?.id;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link href="/explorar" className="text-blue-600 text-sm mb-2 inline-block">&larr; Voltar para Explorar</Link>

      <div className="bg-white shadow rounded p-4">
        <h1 className="text-xl font-semibold mb-2">{service.title}</h1>

        {service.photos?.length ? (
          <div className="flex overflow-x-auto gap-2 mb-4">
            {service.photos.map((photo: any, i: number) => (
              <div key={i} className="relative w-64 h-64 shrink-0 border rounded">
                <Image src={photo.url} alt={`Foto ${i + 1}`} fill className="object-cover rounded" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">Sem imagens disponíveis.</p>
        )}

        <div className="mb-3">
          <p className="font-semibold">Descrição:</p>
          <p className="whitespace-pre-wrap text-gray-800">{service.description}</p>
        </div>

        <div className="mb-3">
          <p className="font-semibold">Data e Hora:</p>
          <p className="text-gray-800">{service.date ? new Date(service.date).toLocaleString('pt-BR') : 'Não informado'}</p>
        </div>

        <div className="mb-3">
          <p className="font-semibold">Localização:</p>
          <p className="text-gray-800">{service.address || 'Não informada'}</p>
        </div>

        <div className="mb-3">
          <p className="font-semibold">Valor:</p>
          <p className="text-gray-800">{service.price ? `R$ ${service.price.toFixed(2)}` : 'Aberto a propostas'}</p>
        </div>

        <div className="mb-3">
          <p className="font-semibold">Status:</p>
          <p className="text-gray-800">{service.status}</p>
        </div>

        {service.profession && (
          <div className="mb-3">
            <p className="font-semibold">Categoria:</p>
            <p className="text-gray-800">{service.profession.name}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="font-semibold">Publicado por</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              {service.creator?.image && (
                <Image src={service.creator.image} alt={service.creator.name} width={32} height={32} />
              )}
            </div>
            <span className="text-gray-800 font-medium">{service.creator?.name}</span>
            {service.creator?.rating !== null && (
              <span className="text-yellow-500 text-sm">★ {service.creator.rating.toFixed(1)}</span>
            )}
          </div>
        </div>

        {isOwner ? (
          <div className="flex gap-2">
            <Link href={`/servicos/editar/${service.id}`} className="btn-primary">Editar</Link>
            <button
              className="btn-danger"
              onClick={async () => {
                if (!confirm('Tem certeza que deseja apagar este serviço?')) return;
                try {
                  const res = await fetch(`/api/services/${service.id}`, {
                    method: 'DELETE'
                  });
                  if (res.ok) {
                    toast.success('Serviço apagado com sucesso.');
                    router.push('/explorar');
                  } else {
                    toast.error('Erro ao apagar serviço.');
                  }
                } catch (err) {
                  toast.error('Erro inesperado.');
                }
              }}
            >
              Apagar
            </button>
          </div>
        ) : (
          <Link href={`/propostas/${service.id}`} className="btn-primary block text-center">
            Fazer Proposta
          </Link>
        )}
      </div>
    </div>
  );
}
