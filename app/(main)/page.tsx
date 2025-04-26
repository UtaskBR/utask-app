'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [topProfessionals, setTopProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulação de dados para demonstração
    // Em produção, isso seria substituído por chamadas de API reais
    setFeaturedServices([
      {
        id: '1',
        title: 'Instalação de Ar Condicionado',
        description: 'Instalação profissional com garantia de serviço.',
        value: 250,
        creator: {
          name: 'Carlos Silva',
          rating: 4.8,
          image: null
        },
        profession: { name: 'Eletricista' }
      },
      {
        id: '2',
        title: 'Desenvolvimento de Site',
        description: 'Criação de site responsivo com design moderno.',
        value: 1500,
        creator: {
          name: 'Ana Oliveira',
          rating: 4.9,
          image: null
        },
        profession: { name: 'Desenvolvedor Web' }
      },
      {
        id: '3',
        title: 'Pintura Residencial',
        description: 'Pintura interna e externa com acabamento de qualidade.',
        value: 800,
        creator: {
          name: 'Roberto Pereira',
          rating: 4.7,
          image: null
        },
        profession: { name: 'Pintor' }
      }
    ]);

    setTopProfessionals([
      {
        id: '1',
        name: 'Maria Santos',
        about: 'Especialista em design de interiores com mais de 10 anos de experiência.',
        rating: 4.9,
        image: null,
        professions: [{ name: 'Designer de Interiores' }]
      },
      {
        id: '2',
        name: 'João Costa',
        about: 'Encanador certificado, atendimento rápido e eficiente.',
        rating: 4.8,
        image: null,
        professions: [{ name: 'Encanador' }]
      },
      {
        id: '3',
        name: 'Fernanda Lima',
        about: 'Professora de inglês com metodologia diferenciada para todas as idades.',
        rating: 5.0,
        image: null,
        professions: [{ name: 'Professor de Inglês' }]
      }
    ]);

    setIsLoading(false);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Encontre os melhores profissionais para seus serviços
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Conectamos você a profissionais qualificados para realizar seus serviços com qualidade, segurança e praticidade.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/explorar" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 text-base font-medium">
                Explorar Serviços
              </Link>
              <Link href="/criar-servico" className="btn-outline bg-transparent border-white text-white hover:bg-primary-700 px-8 py-3 text-base font-medium">
                Publicar Serviço
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900">Como Funciona</h2>
            <p className="mt-4 text-xl text-secondary-600">
              Simples, rápido e seguro
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold">
                1
              </div>
              <h3 className="mt-6 text-xl font-medium text-secondary-900">Publique seu serviço</h3>
              <p className="mt-2 text-base text-secondary-600">
                Descreva o serviço que você precisa, adicione fotos e defina um valor.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold">
                2
              </div>
              <h3 className="mt-6 text-xl font-medium text-secondary-900">Receba propostas</h3>
              <p className="mt-2 text-base text-secondary-600">
                Profissionais qualificados enviarão propostas para realizar seu serviço.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold">
                3
              </div>
              <h3 className="mt-6 text-xl font-medium text-secondary-900">Escolha e contrate</h3>
              <p className="mt-2 text-base text-secondary-600">
                Analise as propostas, escolha o melhor profissional e contrate com segurança.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços em Destaque */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900">Serviços em Destaque</h2>
            <p className="mt-4 text-xl text-secondary-600">
              Confira os serviços mais procurados na plataforma
            </p>
          </div>

          {isLoading ? (
            <div className="mt-12 flex justify-center">
              <p>Carregando serviços...</p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((service) => (
                <Link href={`/servicos/${service.id}`} key={service.id}>
                  <div className="card h-full flex flex-col">
                    <div className="h-48 bg-secondary-200 rounded-t-lg flex items-center justify-center">
                      <span className="text-secondary-400">Imagem do Serviço</span>
                    </div>
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-secondary-900">{service.title}</h3>
                        <span className="text-primary-600 font-bold">
                          R$ {service.value.toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-2 text-secondary-600 line-clamp-2">{service.description}</p>
                      <div className="mt-4 flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {service.creator.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-secondary-900">{service.creator.name}</p>
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1 text-sm text-secondary-600">{service.creator.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {service.profession.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/explorar" className="btn-outline">
              Ver Mais Serviços
            </Link>
          </div>
        </div>
      </section>

      {/* Profissionais em Destaque */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900">Profissionais em Destaque</h2>
            <p className="mt-4 text-xl text-secondary-600">
              Conheça os profissionais mais bem avaliados
            </p>
          </div>

          {isLoading ? (
            <div className="mt-12 flex justify-center">
              <p>Carregando profissionais...</p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {topProfessionals.map((professional) => (
                <Link href={`/perfil/${professional.id}`} key={professional.id}>
                  <div className="card h-full flex flex-col items-center p-6">
                    <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-medium text-2xl">
                        {professional.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-medium text-secondary-900">{professional.name}</h3>
                    <div className="mt-1 flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-secondary-600">{professional.rating}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {professional.professions.map((profession, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {profession.name}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-center text-secondary-600 line-clamp-3">{professional.about}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/profissionais" className="btn-outline">
              Ver Mais Profissionais
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Pronto para começar?</h2>
            <p className="mt-4 text-xl">
              Junte-se a milhares de pessoas que já estão usando nossa plataforma
            </p>
            <div className="mt-8">
              <Link href="/auth/register" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 text-base font-medium">
                Cadastre-se Gratuitamente
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
