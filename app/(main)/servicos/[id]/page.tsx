'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper';

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
    <div className="max-w-3xl mx-auto p-4 bg-white shadow rounded-lg">
      <Link href="/explorar" className="text-blue-600 text-sm mb-4 inline-block">&larr; Voltar para Explorar</Link>

      <h1 className="text-2xl font-bold mb-4">{service.title}</h1>

      {service.photos?.length ? (
        <Swiper navigation modules={[Navigation]} className="w-full h-96 mb-6">
          {service.photos.map((photo: any, i: number) => (
            <SwiperSlide key={i}>
              <Image src={photo.url} alt={`Foto ${i + 1}`} layout="fill" className="object-cover rounded-lg" />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-sm text-gray-500 mb-4">Sem imagens disponíveis.</p>
      )}

      <div className="space-y-3 mb-6">
        <div>
          <span className="font-semibold">Descrição:</span>
          <p className="text-gray-700">{service.description}</p>
        </div>
        <div>
          <span className="font-semibold">Data e Hora:</span>
          <p className="text-gray-700">{service.date ? new Date(service.date).toLocaleString('pt-BR') : 'Não informado'}</p>
        </div>
        <div>
          <span className="font-semibold">Localização:</span>
          <p className="text-gray-700">{service.address || 'Não informada'}</p>
        </div>
        <div>
          <span className="font-semibold">Valor:</span>
          <p className="text-gray-700">{service.price ? `R$ ${service.price.toFixed(2)}` : 'Aberto a propostas'}</p>
        </div>
        <div>
          <span className="font-semibold">Status:</span>
          <p className="text-gray-700">{service.status}</p>
        </div>
        {service.profession && (
          <div>
            <span className="font-semibold">Categoria:</span>
            <p className="text-gray-700">{service.profession.name}</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <span className="font-semibold">Publicado por</span>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {service.creator?.image && (
              <Image src={service.creator.image} alt={service.creator.name} width={40} height={40} />
            )}
          </div>
          <span className="text-gray-800 font-medium">{service.creator?.name}</span>
          {service.creator?.rating !== null && (
            <span className="text-yellow-500">★ {service.creator.rating.toFixed(1)}</span>
          )}
        </div>
      </div>

      {isOwner ? (
        <div className="flex gap-3">
          <Link href={`/editar-servico/${service.id}`} className="btn-primary">Editar</Link>
          <button
            className="btn-danger"
            onClick={async () => {
              if (!confirm('Tem certeza que deseja apagar este serviço?')) return;
              try {
                const res = await fetch(`/api/services/${service.id}`, { method: 'DELETE' });
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
  );
}
