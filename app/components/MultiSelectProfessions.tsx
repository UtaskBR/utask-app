'use client';

import { useState, useEffect } from 'react';

interface Profession {
  id: string;
  name: string;
  icon?: string; // Optional icon field
}

interface MultiSelectProfessionsProps {
  selectedProfessionIds: string[]; // IDs of professions already selected by the user
  onChange: (selectedIds: string[]) => void; // Callback function when selection changes
}

export default function MultiSelectProfessions({ 
  selectedProfessionIds,
  onChange 
}: MultiSelectProfessionsProps) {
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Use a Set for efficient add/remove operations, initialized with current selections
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(new Set(selectedProfessionIds));

  // Fetch available professions on component mount
  useEffect(() => {
    const fetchProfessions = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/professions');
        if (!response.ok) {
          throw new Error('Falha ao buscar profissões');
        }
        const data = await response.json();
        setProfessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessions();
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (professionId: string) => {
    const newSelection = new Set(currentSelection);
    if (newSelection.has(professionId)) {
      newSelection.delete(professionId);
    } else {
      newSelection.add(professionId);
    }
    setCurrentSelection(newSelection);
    // Call the onChange callback with an array of selected IDs
    onChange(Array.from(newSelection));
  };

  if (isLoading) {
    return <p className="text-sm text-secondary-500">Carregando profissões...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">Erro ao carregar profissões: {error}</p>;
  }

  if (professions.length === 0) {
    return <p className="text-sm text-secondary-500">Nenhuma profissão disponível.</p>;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-secondary-700 mb-1">
        Selecione suas profissões
      </label>
      <div className="max-h-60 overflow-y-auto border border-secondary-300 rounded-md p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {professions.map((profession) => (
          <div key={profession.id} className="flex items-center">
            <input
              id={`profession-${profession.id}`}
              name="professions"
              type="checkbox"
              value={profession.id}
              checked={currentSelection.has(profession.id)}
              onChange={() => handleCheckboxChange(profession.id)}
              className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <label 
              htmlFor={`profession-${profession.id}`} 
              className="ml-2 block text-sm text-secondary-900 cursor-pointer"
            >
              {profession.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

