import React from 'react';
import AdminSidebar from '@/app/components/admin/AdminSidebar';
// import AdminNavbar from '@/app/components/admin/AdminNavbar'; // Opcional, pode ser parte da Sidebar ou do Layout
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verificação de segurança adicional no lado do servidor para o layout
  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    // Idealmente, o middleware já deve ter redirecionado.
    // Mas como uma camada extra de segurança, redirecionamos aqui também.
    // Ou podemos mostrar uma página de acesso negado específica para o layout.
    console.warn("Tentativa de acesso não autorizado ao layout de admin por:", session?.user?.email);
    redirect("/"); // Redireciona para a home se não for admin
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <AdminNavbar /> // Se tiver uma navbar separada */}
        <header className="bg-white shadow-md p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-700">Painel de Administração Utask</h1>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Olá, {session.user.name || session.user.email}</span>
                <Link href="/api/auth/signout" className="text-sm text-blue-500 hover:underline">Sair</Link>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
