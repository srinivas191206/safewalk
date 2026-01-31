
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
        let watchId: string | null = null;

        const setupLocation = async () => {
            try {
                const permission = await Geolocation.checkPermissions();
                if (permission.location !== 'granted') {
                    await Geolocation.requestPermissions();
                }

                // Initial position
                const coordinates = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 5000
                });
                setPosition([coordinates.coords.latitude, coordinates.coords.longitude]);

                // Continuous watching
                watchId = await Geolocation.watchPosition(
                    { enableHighAccuracy: true, timeout: 5000 },
                    (pos, err) => {
                        if (pos) {
                            setPosition([pos.coords.latitude, pos.coords.longitude]);
                        }
                    }
                );
            } catch (error) {
                console.error('Map location error:', error);
                // Fallback to Delhi if no location after 5s
                if (!position) setPosition([28.6139, 77.2090]);
            }
        };

        setupLocation();

        return () => {
            if (watchId) {
                Geolocation.clearWatch({ id: watchId });
            }
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
