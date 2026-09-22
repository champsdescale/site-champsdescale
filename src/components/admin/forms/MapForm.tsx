import type { MapContent } from '@/types/section'

export function MapForm({ content, onChange }: { content: MapContent; onChange: (c: MapContent) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="map-titre">Titre</label>
        <input
          id="map-titre"
          className="w-full border px-3 py-2"
          value={content.titre}
          onChange={(e) => onChange({ ...content, titre: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="map-adresse">Adresse</label>
        <input
          id="map-adresse"
          className="w-full border px-3 py-2"
          value={content.adresse}
          onChange={(e) => onChange({ ...content, adresse: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1" htmlFor="map-lat">Latitude</label>
          <input
            id="map-lat"
            type="number"
            step="any"
            className="w-full border px-3 py-2"
            value={content.latLng?.lat ?? ''}
            onChange={(e) =>
              onChange({
                ...content,
                latLng: { lat: Number(e.target.value), lng: content.latLng?.lng ?? 0 },
              })
            }
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="map-lng">Longitude</label>
          <input
            id="map-lng"
            type="number"
            step="any"
            className="w-full border px-3 py-2"
            value={content.latLng?.lng ?? ''}
            onChange={(e) =>
              onChange({
                ...content,
                latLng: { lat: content.latLng?.lat ?? 0, lng: Number(e.target.value) },
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
