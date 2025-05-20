// Arquivo de utilidades para formatação de dados
// Localização: app/utils/formatters.ts

import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata um valor monetário para exibição
 * @param value Valor numérico ou null/undefined
 * @returns String formatada no padrão brasileiro
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "A combinar";
  
  try {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  } catch (error) {
    console.error("Erro ao formatar valor monetário:", error);
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
};

/**
 * Formata uma data para exibição
 * @param dateString String de data, objeto Date ou null/undefined
 * @param includeTime Se deve incluir o horário na formatação
 * @returns String formatada no padrão brasileiro
 */
export const formatDate = (
  dateString: string | Date | null | undefined, 
  includeTime: boolean = true
): string => {
  if (!dateString) return "Data não especificada";
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (isNaN(date.getTime())) return "Data inválida";
    
    if (isToday(date)) {
      return includeTime 
        ? `Hoje às ${format(date, 'HH:mm', { locale: ptBR })}` 
        : 'Hoje';
    }
    
    return format(
      date, 
      includeTime ? "dd 'de' MMMM 'de' yyyy 'às' HH:mm" : "dd 'de' MMMM 'de' yyyy", 
      { locale: ptBR }
    );
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
};

/**
 * Formata um texto para notificações, garantindo tamanho máximo
 * @param text Texto a ser formatado
 * @param maxLength Tamanho máximo (padrão: 100)
 * @returns Texto formatado com reticências se necessário
 */
export const formatNotificationText = (text: string | null | undefined, maxLength: number = 100): string => {
  if (!text) return "";
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Formata o status de um serviço para exibição
 * @param status Status do serviço
 * @returns Texto formatado em português
 */
export const formatServiceStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'OPEN': 'Aberto',
    'IN_PROGRESS': 'Em andamento',
    'COMPLETED': 'Concluído',
    'CANCELLED': 'Cancelado'
  };
  
  return statusMap[status] || status;
};

/**
 * Retorna a classe CSS para o status de um serviço
 * @param status Status do serviço
 * @returns Classes CSS para estilização
 */
export const getStatusColorClass = (status: string): string => {
  const colorMap: Record<string, string> = {
    'OPEN': 'bg-blue-100 text-blue-800',
    'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};
