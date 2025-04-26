import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">UTASK</h3>
            <p className="text-secondary-600 text-sm">
              Conectando clientes e profissionais de forma simples, segura e eficiente.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-4">
              Navegação
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/explorar" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Explorar
                </Link>
              </li>
              <li>
                <Link href="/mapa" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Mapa
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-4">
              Recursos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/criar-servico" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Criar Serviço
                </Link>
              </li>
              <li>
                <Link href="/meus-servicos" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Meus Serviços
                </Link>
              </li>
              <li>
                <Link href="/agenda" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Agenda
                </Link>
              </li>
              <li>
                <Link href="/carteira" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Carteira
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/termos" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-secondary-600 hover:text-secondary-900 text-sm">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-secondary-200">
          <p className="text-center text-secondary-500 text-sm">
            &copy; {new Date().getFullYear()} UTASK. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
