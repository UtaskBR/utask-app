'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import {
  UserCircleIcon,
  BriefcaseIcon,
  CalendarIcon,
  CreditCardIcon,
  HeartIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon, // For notifications, if not already there
  Bars3Icon, // For mobile menu hamburger
  XMarkIcon, // For mobile menu close
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Explorar', href: '/explorar' },
    { name: 'Mapa', href: '/mapa' },
    { name: 'Encontrar Profissionais', href: '/buscar-profissionais' },
    { name: 'Como Funciona', href: '/como-funciona' },
  ];

  const userNavigation = session?.user?.id ? [
    { name: 'Meu Perfil', href: `/perfil/${session.user.id}`, icon: UserCircleIcon },
    { name: 'Meus Serviços', href: '/meus-servicos', icon: BriefcaseIcon },
    { name: 'Agenda', href: '/agenda', icon: CalendarIcon },
    { name: 'Carteira', href: '/carteira', icon: CreditCardIcon },
    { name: 'Favoritos', href: '/favoritos', icon: HeartIcon },
  ] : [];

  // Buscar contagem de notificações não lidas
  useEffect(() => {
    if (session?.user?.id) {
      const fetchNotifications = async () => {
        try {
          const response = await fetch('/api/notifications?unreadOnly=true');
          if (response.ok) {
            const data = await response.json();
            setNotificationsCount(data.length || 0);
          }
        } catch (error) {
          console.error('Erro ao buscar notificações:', error);
        }
      };
      
      fetchNotifications();
      
      // Atualizar a cada minuto
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  // Fechar menu quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (
        userMenuRef.current && 
        (!target || !userMenuRef.current.contains(target)) &&
        userButtonRef.current &&
        (!target || !userButtonRef.current.contains(target))
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fechar menu quando mudar de página
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-primary-600 font-bold text-xl">
                UTASK
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <div className="ml-3 relative flex items-center">
                <Link href="/criar-servico" className="btn-primary mr-4">
                  Criar Serviço
                </Link>
                
                {/* Ícone de Notificações */}
                <Link href="/notificacoes" className="relative mr-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-secondary-500 hover:text-secondary-700" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                  </svg>
                  {notificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationsCount > 9 ? '9+' : notificationsCount}
                    </span>
                  )}
                </Link>
                
                {/* Menu do Usuário */}
                <div className="relative">
                  <button 
                    ref={userButtonRef}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Abrir menu do usuário</span>
                    <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center overflow-hidden">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Usuário"}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <span className="text-primary-700 font-medium">
                          {session.user?.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                  </button>
                  
                  {/* Menu Dropdown */}
                  {userMenuOpen && (
                    <div 
                      ref={userMenuRef}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10"
                    >
                      {userNavigation.map((item) => (
                        {userNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="group flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 rounded-md"
                            >
                              <Icon className="h-5 w-5 mr-3 text-secondary-400 group-hover:text-secondary-500" aria-hidden="true" />
                              {item.name}
                            </Link>
                          );
                        })}
                      <div className="my-1"> {/* Removed px-4, border will span full width of items if items have px-4 */}
                        <div className="border-t border-gray-200 mx-2"></div> {/* Added mx-2 to not have border hit edges of dropdown if items have padding */}
                      </div>
                      <button
                        onClick={() => signOut()}
                        className="group flex items-center w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 rounded-md"
                      >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-secondary-400 group-hover:text-secondary-500" aria-hidden="true" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href="/auth/login"
                  className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Entrar
                </Link>
                <Link href="/auth/register" className="btn-primary ml-2">
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
          
          {/* Menu Hambúrguer para Mobile */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Abrir menu principal</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300 hover:text-secondary-800'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          {session ? (
            <div className="pt-4 pb-3 border-t border-secondary-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "Usuário"}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <span className="text-primary-700 font-medium">
                        {session.user?.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-secondary-800">
                    {session.user?.name}
                  </div>
                  <div className="text-sm font-medium text-secondary-500">
                    {session.user?.email}
                  </div>
                </div>
                {notificationsCount > 0 && (
                  <div className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationsCount > 9 ? '9+' : notificationsCount}
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/criar-servico"
                  className="block px-4 py-2 text-base font-medium text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100"
                >
                  Criar Serviço
                </Link>
                <Link
                  href="/notificacoes"
                  className="block px-4 py-2 text-base font-medium text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100"
                >
                  Notificações {notificationsCount > 0 && `(${notificationsCount})`}
                </Link>
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-base font-medium text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100"
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100"
                >
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-secondary-200">
              <div className="flex items-center justify-around">
                <Link
                  href="/auth/login"
                  className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-base font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary"
                >
                  Cadastrar
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
