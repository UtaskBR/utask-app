'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ReviewPopupProps {
  show: boolean;
  onClose: () => void;
  serviceProvider: {
    id: string;
    name: string;
    image?: string | null;
  };
  serviceId: string;
  // Function to be called after successful submission, e.g. to update UI
  onReviewSubmitted?: () => void; 
}

// Placeholder Star Icon
const StarIcon = ({ filled, onClick }: { filled: boolean; onClick: () => void }) => (
  <svg
    onClick={onClick}
    className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ReviewPopup: React.FC<ReviewPopupProps> = ({
  show,
  onClose,
  serviceProvider,
  serviceId,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const minCommentLength = 19;

  useEffect(() => {
    if (show) {
      // Reset state when popup is shown
      setRating(0);
      setComment('');
      setError('');
      setSubmitting(false);
    }
  }, [show]);

  if (!show) {
    return null;
  }

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Por favor, selecione uma avaliação em estrelas.');
      return;
    }
    if (comment.length < minCommentLength) {
      setError(`A avaliação deve ter pelo menos ${minCommentLength} caracteres.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/services/${serviceId}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          testimonial: comment, // Changed from comment to testimonial to match API
          providerId: serviceProvider.id, // Ensure this is the ID of the user who performed the service
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar avaliação.');
      }

      // Successfully submitted
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      onClose(); // Close popup
      // Potentially show a success toast message here
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Avaliar Serviço</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary-200">
            {serviceProvider.image ? (
              <Image
                src={serviceProvider.image}
                alt={serviceProvider.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold">
                {serviceProvider.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <p className="text-gray-700">
            Como você avalia o serviço prestado por <span className="font-semibold">{serviceProvider.name}</span>?
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sua Avaliação (estrelas):</label>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  filled={star <= rating}
                  onClick={() => handleRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Comentário (mínimo {minCommentLength} caracteres):
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
              placeholder="Descreva sua experiência com o profissional..."
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/{minCommentLength} caracteres
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0 || comment.length < minCommentLength}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewPopup;
