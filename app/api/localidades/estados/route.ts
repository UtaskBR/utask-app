import { NextResponse } from 'next/server';

interface IBGEEstado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface AppEstado {
  sigla: string;
  nome: string;
}

export async function GET() {
  try {
    const response = await fetch(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
      {
        // Optional: Add cache revalidation strategy if desired, e.g., next: { revalidate: 3600 * 24 } // Revalidate once a day
        cache: 'force-cache', // Aggressively cache, as this data rarely changes.
      }
    );

    if (!response.ok) {
      // Log the status and response body for more detailed error information
      const errorBody = await response.text();
      console.error('Failed to fetch states from IBGE:', response.status, errorBody);
      throw new Error(`Failed to fetch states from IBGE API. Status: ${response.status}`);
    }

    const data: IBGEEstado[] = await response.json();

    const estados: AppEstado[] = data.map(uf => ({
      sigla: uf.sigla,
      nome: uf.nome,
    }));
    // Already sorted by nome due to query param `orderBy=nome`

    return NextResponse.json(estados);

  } catch (error) { // Corrected catch syntax
    console.error('Error in /api/localidades/estados:', error);
    // Provide a more generic error message to the client for security/simplicity
    return NextResponse.json(
      { error: 'Failed to fetch list of states.' }, // Corrected error message
      { status: 500 }
    );
  }
}
