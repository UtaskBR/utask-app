'use client';

type Service = {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
};

type Props = {
  userLocation: { lat: number; lng: number };
  services: Service[];
};

export default function StaticMap({ userLocation, services }: Props) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const width = 600;
  const height = 400;

  const points = [
    `pin-s+0000ff(${userLocation.lng},${userLocation.lat})`,
    ...services
      .filter(s => s.latitude != null && s.longitude != null)
      .map(s => `pin-s+ff0000(${s.longitude},${s.latitude})`),
  ].join(',');

  const center = `${userLocation.lng},${userLocation.lat},12`;
  const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${points}/${center}/${width}x${height}?access_token=${token}`;

  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <img
        src={url}
        width={width}
        height={height}
        alt="Mapa estático de serviços próximos"
        className="max-w-full max-h-full"
      />
    </div>
  );
}
