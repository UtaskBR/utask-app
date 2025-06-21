import { NextRequest, NextResponse } from 'next/server';

interface IBGEMunicipio {
  id: number;
  nome: string;
  // outras propriedades que não usaremos diretamente, como microrregiao
}

export interface AppMunicipio {
  id: number; // Using IBGE's municipio ID as it's unique
  nome: string;
}

// Define params type for context
interface RouteContext {
  params: {
    uf: string; // This will hold the dynamic segment [uf]
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { params } = context;
  const uf = params.uf?.toUpperCase(); // Extract uf from path and normalize to uppercase

  if (!uf || uf.length !== 2) { // Basic validation for UF
    return NextResponse.json({ error: 'Valid State UF (2 letters) is required.' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
      {
        // Optional: Add cache revalidation strategy. Cities for a state change even less frequently than states themselves.
        cache: 'force-cache',
      }
    );

    if (!response.ok) {
      // IBGE API returns 404 if UF is invalid, handle this gracefully
      if (response.status === 404) {
        return NextResponse.json({ error: `No cities found for UF: ${uf}. It may be an invalid state code.` }, { status: 404 });
      }
      const errorBody = await response.text(); // Read error body for logging
      console.error(`Failed to fetch cities for UF ${uf} from IBGE:`, response.status, errorBody);
      throw new Error(`Failed to fetch cities for UF ${uf} from IBGE API. Status: ${response.status}`);
    }

    const data: IBGEMunicipio[] = await response.json();

    if (data.length === 0) {
      // This case might happen if a valid UF has no municipios listed, though unlikely for BR states.
      // Or if the IBGE API returns an empty array for a valid UF for some reason.
       return NextResponse.json({ error: `No cities found for UF: ${uf}, although the state code was recognized.` }, { status: 404 });
    }

    const municipios: AppMunicipio[] = data.map(municipio => ({
      id: municipio.id,
      nome: municipio.nome,
    }));
    // Already sorted by nome due to query param `orderBy=nome`

    return NextResponse.json(municipios);

  } catch (error) {
    console.error(`Error in /api/localidades/estados/${uf}/municipios:`, error);
    return NextResponse.json(
      { error: `Failed to fetch cities list for UF ${uf}.` },
      { status: 500 }
    );
  }
}
