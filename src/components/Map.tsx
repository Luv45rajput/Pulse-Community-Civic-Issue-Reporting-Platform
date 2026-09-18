import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { divIcon } from "leaflet"
import "leaflet/dist/leaflet.css"

type Issue = {
  id: string
  title: string
  location: string
  latitude: number
  longitude: number
  status: string
  category: string
}

type MapProps = {
  issues: Issue[]
}

const issueIcon = divIcon({
  className: "",
  html: `
    <div style="
      background: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 2px solid #0f172a;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      ⚠️
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

function Map({ issues }: MapProps) {
  return (
    <div className="h-[450px] w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={[28.50, 77.40]}
        zoom={11}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={issueIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <h3 className="font-semibold">
                  {issue.title}
                </h3>

                <p className="mt-1 text-sm">
                  {issue.location}
                </p>

                <p className="mt-1 text-sm">
                  Category: {issue.category}
                </p>

                <p className="mt-1 text-sm">
                  Status: {issue.status}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default Map