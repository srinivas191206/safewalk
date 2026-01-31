
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
    className?: string;
}

const MapComponent = ({ className }: MapComponentProps) => {
    const [position, setPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        const getCurrentLocation = async () => {
            try {
                const permission = await Geolocation.checkPermissions();
                if (permission.location === 'denied' || permission.location === 'prompt') {
                    await Geolocation.requestPermissions();
                }

                const coordinates = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true
                });

                setPosition([coordinates.coords.latitude, coordinates.coords.longitude]);
            } catch (error) {
                console.error('Error getting location:', error);
                // Fallback to default location (Delhi) if error
                if (!position) setPosition([28.6139, 77.2090]);
            }
        };

        getCurrentLocation();

        // Watch position updates
        const watchId = Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
            if (position) {
                setPosition([position.coords.latitude, position.coords.longitude]);
            }
        });

        return () => {
            Geolocation.clearWatch({ id: Promise.resolve(watchId).then(id => id) as any });
            // Note: the return type of watchPosition is Promise<string> in newer capacitor versions, handling might vary slightly
        };
    }, []);

    if (!position) {
        return <div className="h-full w-full flex items-center justify-center bg-secondary/30 rounded-2xl">
            <p className="text-muted-foreground animate-pulse">Locating...</p>
        </div>;
    }

    return (
        <div className={`rounded-2xl overflow-hidden border border-border shadow-sm ${className}`}>
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        You are here. <br /> Guardian Mode Active.
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapComponent;
