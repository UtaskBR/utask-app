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
  
  interface Service {
    creatorId: string;
    status: string;
    bids?: { id: string; providerId: string; status: string; value?: number; proposedDate?: string; message?: string; provider?: { rating: number } }[];
    completionConfirmations?: { userId: string }[];
    creator: { id: string; name: string; rating: number; about?: string };
    title: string;
    price?: number;
    description: string;
    date?: string;
    timeWindow?: number;
    address?: string;
    profession?: { name: string };
    photos?: { url: string }[];
  }

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidForm, setBidForm] = useState({
    value: '',
    message: '',
    proposedDate: ''
  });
  const [showBidForm, setShowBidForm] = useState(false);
  const [showCounterOfferForm, setShowCounterOfferForm] = useState(false);
  const [counterOfferForm, setCounterOfferForm] = useState({
    value: '',
    message: '',
    proposedDate: '',
    bidId: ''
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState('');
  const [selectedBidId, setSelectedBidId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problemReason, setProblemReason] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        console.log('Buscando serviço:', serviceId);
        const response = await fetch(`/api/services/${serviceId}`);
        
        if (!response.ok) {
          throw new Error('Serviço não encontrado');
        }
        
        const data = await response.json();
        console.log('Serviço encontrado:', data);
        setService(data);
      } catch (err) {
        console.error('Erro ao buscar serviço:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  // ... restante do código permanece igual até:

              {service.price ? (
                <div className="mt-2 text-xl font-bold text-primary-600">
                  R$ {service.price.toFixed(2)}
                </div>
              ) : (
                <div className="mt-2 text-secondary-600">
                  Aberto a propostas
                </div>
              )}

  // ... restante do código permanece inalterado
}
