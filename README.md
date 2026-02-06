# Safe Walk (Safety Net Connect)

## Project Overview
**Safe Walk** is a personal safety application designed to provide immediate assistance in emergencies. It features a robust **"Guardian Mode"** that monitors for accidents or voice triggers, and a manual **SOS Panic Button**. When triggered, the app captures the user's location, records a 10-second audio clip, and sends emergency alerts via SMS and WhatsApp to trusted contacts.

## Key Features

- **Guardian Mode**: "ARMS" the system to prevent screen sleep, show persistent status notifications, and actively listen for crash/fall detection or voice commands.
- **SOS Panic Button**: Large, accessible button to immediately trigger an emergency alert.
- **Live Location Tracking**: Captures precise latitude/longitude and generates a Google Maps link.
- **Evidence Recording**: Automatically records 10 seconds of audio when an alert is triggered.
- **Offline Support**: Queues alerts if the device is offline and sends them once connectivity is restored.
- **Multi-Channel Alerts**:
    - **Direct SMS**: Uses the device's SIM card to send immediate text messages.
    - **WhatsApp**: Fallback/secondary alert via WhatsApp.
- **Crash Detection**: Uses device sensors (accelerometer) to detect sudden impacts (when Guardian Mode is active).
- **Voice Trigger**: Activates SOS via voice command (when Guardian Mode is active).

## "What is What" - Project Structure

Here is a breakdown of the key files and directories to help you navigate the codebase:

### Root Directory
- **`/android` & `/ios`**: Native project files for building mobile apps with Capacitor.
- **`capacitor.config.ts`**: Configuration for Capacitor (app ID, plugins, etc.).
- **`package.json`**: Lists dependencies (React, Capacitor plugins, etc.) and scripts.

### Source Code (`/src`)

#### **Pages (`/src/pages`)**
- **`Home.tsx`**: The main dashboard. Contains the logic for Guardian Mode, the Panic Button, and orchestrating the alert flow (SMS, Audio, Location).
- **`Contacts.tsx`**: Interface for adding and managing trusted emergency contacts.
- **`History.tsx`**: Displays a log of past SOS events and alerts.
- **`Settings.tsx`**: Application settings.
- **`Onboarding.tsx`**: Initial setup flow for new users.

#### **Components (`/src/components`)**
- **`PanicButton.tsx`**: The UI for the central SOS button with pulse animations.
- **`CountdownModal.tsx`**: The "Cancel" timer that appears before an alert is actually sent (preventing false alarms).
- **`MapComponent.tsx`**: Renders the map view using Leaflet.
- **`EmergencyHelplines.tsx`**: Quick access to standard emergency numbers (Police, Ambulance).
- **`OfflineIndicator.tsx`**: Shows a warning when internet connectivity is lost.

#### **Logic & Helpers**
- **`/src/hooks`**: Custom React hooks for specific functionality:
    - `useLocation.ts`: Manages GPS coordinates.
    - `useEmergencyContacts.ts`: CRUD operations for contacts.
    - `useCrashDetection.ts` & `useVoiceTrigger.ts`: Sensor logic for Guardian Mode.
    - `useOfflineQueue.ts`: Manages unsent alerts when offline.
- **`/src/lib/supabase.ts`**: Client for the Supabase backend (likely used for auth/sync).
- **`/src/types/emergency.ts`**: TypeScript definitions for Alert objects and Triggers.

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Mobile Runtime**: Capacitor (allows running this web app as a native iOS/Android app)
- **Maps**: Leaflet / React-Leaflet
- **Backend/Data**: Supabase

## Setup & Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

4.  **Sync with Mobile Native Projects**:
    ```bash
    npx cap sync
    ```
