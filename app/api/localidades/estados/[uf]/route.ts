// app/api/localidades/estados/[uf]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface IBGEMunicipio {
  id: number;
  nome: string;
  // Add other fields if needed from IBGE response, like microrregiao, etc.
}

interface AppMunicipio { // Ensure this matches what frontend expects
  id: number; // Or string, depending on usage - using number as IBGE id is number
  nome: string;
}

interface RouteContext {
  params: {
    uf: string;
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { params } = context;
  const uf = params.uf?.toUpperCase();

  if (!uf || uf.length !== 2) {
    return NextResponse.json({ error: 'Valid State UF (2 letters) is required.' }, { status: 400 });
  }

  try {
    const ibgeApiUrl = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;
    const response = await fetch(ibgeApiUrl, {
      next: { revalidate: 3600 * 24 * 30 } // Cache for 30 days, as this data rarely changes
    });

    if (!response.ok) {
      // Log the error status and text from IBGE API for server-side debugging
      const errorText = await response.text(); // Read error text if possible
      console.error(`IBGE API error for UF ${uf}: ${response.status} ${response.statusText} - ${errorText}`);
      return NextResponse.json({ error: 'Failed to fetch municipalities from IBGE API.' }, { status: response.status });
    }

    const ibgeMunicipios: IBGEMunicipio[] = await response.json();

    if (!Array.isArray(ibgeMunicipios)) {
      console.error(`IBGE API unexpected response for UF ${uf}: Data is not an array.`);
      return NextResponse.json({ error: 'Unexpected response format from IBGE API.' }, { status: 500 });
    }

    // Transform to the structure expected by the frontend (AppMunicipio)
    const municipios: AppMunicipio[] = ibgeMunicipios.map(municipio => ({
      id: municipio.id, 
      nome: municipio.nome,
    }));
    
    // Sort municipalities by name
    municipios.sort((a, b) => a.nome.localeCompare(b.nome));

    return NextResponse.json(municipios);

  } catch (error) {
    console.error(`Error fetching municipalities for UF ${uf}:`, error);
    return NextResponse.json({ error: 'Internal server error while fetching municipalities.' }, { status: 500 });
  }
}
