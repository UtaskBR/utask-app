'use client'; // Para uso de hooks como useState, useEffect

import React, { useEffect, useState } from 'react';
import {
  UsersIcon,
  BriefcaseIcon,
  ShieldCheckIcon, // Para disputas resolvidas ou um status positivo
  ShieldExclamationIcon, // Para disputas abertas
  CreditCardIcon,
  ArrowPathIcon, // Para o botão de recarregar
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AdminDashboardData {
  totalUsers: number;
  totalServices: number;
  servicesByStatus: Record<string, number>;
  disputes: {
    open: number;
    // resolved: number; // Se a API retornar isso no futuro
  };
  adminWalletBalance: number;
  adminWalletReservedBalance: number; // Não usado diretamente nos cards, mas disponível
}

interface InfoCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  bgColorClass?: string; // Tailwind CSS background color class
  textColorClass?: string; // Tailwind CSS text color class
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon: Icon, bgColorClass = 'bg-white', textColorClass = 'text-gray-800' }) => {
  return (
    <div className={`${bgColorClass} ${textColorClass} shadow-lg rounded-xl p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300`}>
      <div className="p-3 bg-gray-100 rounded-full">
        <Icon className="h-8 w-8 text-blue-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-semibold">{value}</p>
      </div>
    </div>
  );
};


export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status} ao buscar dados`);
      }
      const result: AdminDashboardData = await response.json();
      setData(result);
    } catch (err: any) {
      console.error("Falha ao buscar dados do dashboard:", err);
      setError(err.message || "Não foi possível carregar os dados do dashboard.");
      toast.error(err.message || "Não foi possível carregar os dados do dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="ml-3 text-lg text-gray-600">Carregando dados do dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-md">
        <ShieldExclamationIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-xl font-semibold text-red-700">Erro ao carregar dashboard</p>
        <p className="text-red-600 mt-1 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center mx-auto"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2"/>
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-gray-500">Nenhum dado para exibir.</p>;
  }

  const disputedServices = data.servicesByStatus?.DISPUTED ?? 0;
  // const resolvedServices = data.servicesByStatus?.RESOLVED ?? 0; // Se adicionado ao backend

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Visão Geral</h2>
        <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            title="Recarregar dados"
        >
            <ArrowPathIcon className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          title="Total de Usuários"
          value={data.totalUsers}
          icon={UsersIcon}
        />
        <InfoCard
          title="Total de Serviços"
          value={data.totalServices}
          icon={BriefcaseIcon}
        />
        <InfoCard
          title="Serviços em Disputa"
          value={disputedServices}
          icon={ShieldExclamationIcon}
          bgColorClass={disputedServices > 0 ? "bg-yellow-50" : "bg-white"}
          textColorClass={disputedServices > 0 ? "text-yellow-700" : "text-gray-800"}
        />
        <InfoCard
          title="Saldo da Plataforma"
          value={data.adminWalletBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={CreditCardIcon}
        />
      </div>

      {/* Placeholder para Ações Rápidas ou outros componentes */}
      {/* <div className="mt-10">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          // Exemplo de card de ação rápida
          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
            <h4 className="font-semibold text-lg text-blue-600">Gerenciar Usuários</h4>
            <p className="text-sm text-gray-600 mt-1">Ver, editar, bloquear ou notificar usuários.</p>
            <Link href="/admin/users" className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors">
              Ir para Usuários
            </Link>
          </div>
        </div>
      </div> */}
    </div>
  );
}
