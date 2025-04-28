'use client';
import { useState, useCallback } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useEffect } from 'react';

interface ImageUploadProps {
  onChange: (value: string) => void;
  value: string;
  label?: string;
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
}

export default function ImageUpload({ 
  onChange, 
  value, 
  label = "Enviar imagem",
  disabled = false,
  maxFiles = 1,
  maxFileSize = 10485760, // 10MB
  acceptedFileTypes = ["image/*"]
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Garantir que o componente só seja renderizado no cliente
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleUpload = useCallback((result: any) => {
    onChange(result.info.secure_url);
  }, [onChange]);
  
  if (!isMounted) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center justify-center gap-4">
        {value && (
          <div className="relative w-full h-64 overflow-hidden rounded-lg">
            <Image
              fill
              className="object-cover w-full h-full"
              src={value}
              alt="Imagem enviada"
            />
            <button
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
              type="button"
              disabled={disabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        {!value && (
          <CldUploadWidget
            onUpload={handleUpload}
            uploadPreset="servicos-app"
            options={{
              maxFiles,
              maxFileSize,
              resourceType: "image",
              sources: ["local", "camera"]
            }}
          >
            {({ open }: { open?: () => void }) => (
              <button
                onClick={() => open?.()}
                disabled={disabled}
                className="
                  relative
                  w-full
                  h-64
                  border-2
                  border-dashed
                  border-secondary-300
                  rounded-lg
                  p-6
                  flex
                  flex-col
                  justify-center
                  items-center
                  gap-4
                  hover:border-primary-500
                  transition
                  cursor-pointer
                  disabled:opacity-70
                  disabled:cursor-not-allowed
                "
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-center">
                  <p className="font-semibold text-secondary-700">{label}</p>
                  <p className="text-xs text-secondary-500 mt-2">
                    Formatos suportados: JPG, PNG, GIF
                  </p>
                  <p className="text-xs text-secondary-500">
                    Tamanho máximo: 10MB
                  </p>
                </div>
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>
    </div>
  );
}
