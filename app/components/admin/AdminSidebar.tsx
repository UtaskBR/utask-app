'use client'; // Necessário para hooks como usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  CreditCardIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon, // Ícone genérico para Utask
} from '@heroicons/react/24/outline'; // Usando outline icons

const navigationItems = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Profissões', href: '/admin/professions', icon: BriefcaseIcon },
  { name: 'Usuários', href: '/admin/users', icon: UsersIcon },
  { name: 'Carteira Admin', href: '/admin/wallet', icon: CreditCardIcon },
  { name: 'Disputas', href: '/admin/disputes', icon: ShieldExclamationIcon },
  { name: 'Métricas', href: '/admin/metrics', icon: ChartBarIcon },
  { name: 'Logs de Auditoria', href: '/admin/audit-logs', icon: DocumentTextIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        {/* Pode adicionar um logo aqui */}
        <CogIcon className="h-8 w-8 text-blue-400 mr-2" />
        <h1 className="text-2xl font-semibold">Utask Admin</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-md
                transition-colors duration-150 ease-in-out
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-6 w-6 ${
                  isActive ? 'text-blue-300' : 'text-gray-400 group-hover:text-gray-300'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        {/* Pode adicionar informações do usuário ou link de logout aqui também, se não estiver no Navbar */}
        <p className="text-xs text-gray-400">© Utask 2024</p>
      </div>
    </aside>
  );
}
