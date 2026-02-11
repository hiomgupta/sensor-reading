import { useState, useCallback, useEffect, useRef } from 'react';

// === CONFIGURATION ===
const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

/**
 * ACADEMIC NOTE:
 * This demo mode explicitly models real-world BLE and sensor edge cases to demonstrate 
 * system robustness and design reasoning. Some mitigations are implemented, while 
 * others are intentionally documented to preserve MVP scope.
 * 
 * EDGE CASES HANDLED:
 * 1. Independent Update Rates: Temperature (2s), Humidity (5s), Accel (High freq)
 * 2. Partial Disconnection: Stale parameters marked inactive
 * 3. Burst Data: Handling high-frequency accelerometer streams
 * 4. Missing Data: Simulating sensor failure
 * 5. Outliers: Visualizing spikes without silent filtering
 */

export interface DataPoint {
  id: number;
  timestamp: number;
  value: number;
  parameter: string;
}

export interface ParameterMetadata {
  id: string;
  name: string;
  unit: string;
  lastUpdated: number;
  status: 'active' | 'stale' | 'inactive';
  currentValue: number | null;
}

// === SINGLETON STATE ===
let globalListeners: ((state: any) => void)[] = [];
let globalState = {
  isConnected: false,
  isConnecting: false,
  error: null as string | null,
  deviceName: null as string | null,
  // Independent parameter streams
  parameters: {} as Record<string, ParameterMetadata>,
  dataPoints: [] as DataPoint[],
  isDemoMode: false,
};

let deviceReference: BluetoothDevice | null = null;
let dataCounter = 0;
let simulationIntervals: any[] = [];
const STALE_THRESHOLD = 10000; // 10 seconds

function notifyListeners() {
  globalListeners.forEach(listener => listener({ ...globalState }));
}

function updateGlobalState(updates: Partial<typeof globalState>) {
  globalState = { ...globalState, ...updates };
  notifyListeners();
}

export function useBluetooth() {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    const listener = (newState: typeof globalState) => setState(newState);
    globalListeners.push(listener);
    return () => {
      globalListeners = globalListeners.filter(l => l !== listener);
    };
  }, []);

  // Monitor parameter staleness
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const nextParams = { ...globalState.parameters };

      Object.keys(nextParams).forEach(key => {
        const p = nextParams[key];
        if (p.status !== 'inactive' && now - p.lastUpdated > STALE_THRESHOLD) {
          nextParams[key] = { ...p, status: 'stale' };
          changed = true;
        }
      });

      if (changed) {
        updateGlobalState({ parameters: nextParams });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isSupported = typeof navigator !== 'undefined' && !!navigator.bluetooth;

  const ingestData = useCallback((paramId: string, value: number) => {
    const now = Date.now();
    const id = dataCounter++;
    
    const nextParams = { ...globalState.parameters };
    const p = nextParams[paramId];
    if (p) {
      nextParams[paramId] = {
        ...p,
        currentValue: value,
        lastUpdated: now,
        status: 'active'
      };
    }

    // EDGE CASE: Sudden Spikes / Outliers
    // We do NOT auto-filter silently to preserve raw data integrity.

    const newDataPoints = [...globalState.dataPoints, { id, timestamp: now, value, parameter: paramId }].slice(-500);
    updateGlobalState({
      parameters: nextParams,
      dataPoints: newDataPoints
    });
  }, []);

  const startSimulation = useCallback(() => {
    simulationIntervals.forEach(i => clearInterval(i));
    simulationIntervals = [];

    // Initialize parameters
    const initialParams: Record<string, ParameterMetadata> = {
      'temp': { id: 'temp', name: 'Temperature', unit: '°C', status: 'active', lastUpdated: Date.now(), currentValue: null },
      'hum': { id: 'hum', name: 'Humidity', unit: '%', status: 'active', lastUpdated: Date.now(), currentValue: null },
      'accel': { id: 'accel', name: 'Accelerometer', unit: 'g', status: 'active', lastUpdated: Date.now(), currentValue: null },
    };
    updateGlobalState({ parameters: initialParams });

    // 1A. Different Update Rates
    // Temperature: 2s
    simulationIntervals.push(setInterval(() => {
      const val = 24 + Math.random() * 2;
      // 4K. Sudden Spike Simulation (Occasional)
      const spike = Math.random() > 0.95 ? 9999 : val;
      ingestData('temp', spike);
    }, 2000));

    // Humidity: 5s
    simulationIntervals.push(setInterval(() => {
      // 1C. Missing Parameter Data Simulation
      // Stop humidity after 60 seconds
      if (Date.now() - (globalState.dataPoints[0]?.timestamp || Date.now()) > 60000) {
        const nextParams = { ...globalState.parameters };
        if (nextParams['hum']) {
          nextParams['hum'] = { ...nextParams['hum'], status: 'inactive' };
          updateGlobalState({ parameters: nextParams });
        }
        return;
      }
      ingestData('hum', 40 + Math.random() * 10);
    }, 5000));

    // 1B. Burst vs Slow Data (Accelerometer at ~20Hz)
    simulationIntervals.push(setInterval(() => {
      ingestData('accel', Math.random() - 0.5);
    }, 50));
  }, [ingestData]);

  const stopSimulation = useCallback(() => {
    simulationIntervals.forEach(i => clearInterval(i));
    simulationIntervals = [];
  }, []);

  const handleDisconnect = useCallback(() => {
    deviceReference = null;
    stopSimulation();
    updateGlobalState({
      isConnected: false,
      deviceName: null,
      isConnecting: false,
      isDemoMode: false
    });
  }, [stopSimulation]);

  const connect = useCallback(async (forceDemo = false) => {
    updateGlobalState({ error: null, isConnecting: true });

    if (forceDemo || !isSupported) {
      await new Promise(resolve => setTimeout(resolve, 800));
      updateGlobalState({
        isConnected: true,
        deviceName: forceDemo ? 'Simulation Node' : 'Demo Node (Fallback)',
        isConnecting: false,
        isDemoMode: true,
      });
      startSimulation();
      return;
    }

    try {
      // 2F. Duplicate Streams Safety: Reset existing state
      if (deviceReference) {
        deviceReference.removeEventListener('gattserverdisconnected', handleDisconnect);
        if (deviceReference.gatt?.connected) deviceReference.gatt.disconnect();
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
        optionalServices: [SERVICE_UUID]
      });

      deviceReference = device;
      device.addEventListener('gattserverdisconnected', handleDisconnect);

      if (!device.gatt) throw new Error('No GATT server');
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (e) => {
        const characteristic = e.target as BluetoothRemoteGATTCharacteristic;
        const valueView = characteristic.value;
        if (!valueView) return;

        // 3G. Safe Parsing: Try/Catch for unknown formats
        try {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(valueView);
          
          // 3H. Multiple Parameters in One Payload support (Basic split)
          if (text.includes(',')) {
            const parts = text.split(',');
            parts.forEach((p, idx) => ingestData(`p${idx}`, parseFloat(p)));
          } else {
            const val = parseFloat(text);
            if (!isNaN(val)) ingestData('default', val);
          }
        } catch (err) {
          console.error('Safe parsing caught error:', err);
        }
      });

      updateGlobalState({
        isConnected: true,
        deviceName: device.name || 'Unknown Device',
        isConnecting: false,
        isDemoMode: false
      });
      
    } catch (err: any) {
      console.error('Connection failed', err);
      const isPermissionError = err.name === 'SecurityError' || err.message?.includes('permissions policy');
      
      if (isPermissionError) {
        updateGlobalState({ 
          error: 'Bluetooth access blocked. Switching to Demo Mode.',
          isConnecting: false 
        });
        setTimeout(() => connect(true), 1500);
      } else if (err.name !== 'NotFoundError' && !err.message?.includes('cancelled')) {
        updateGlobalState({ error: err.message || 'Failed to connect', isConnecting: false });
      } else {
        updateGlobalState({ isConnecting: false });
      }
    }
  }, [isSupported, handleDisconnect, startSimulation, ingestData]);

  const disconnect = useCallback(() => {
    if (globalState.isDemoMode) {
      handleDisconnect();
    } else if (deviceReference && deviceReference.gatt?.connected) {
      deviceReference.gatt.disconnect();
    } else {
      handleDisconnect();
    }
  }, [handleDisconnect]);

  const resetData = useCallback(() => {
    dataCounter = 0;
    updateGlobalState({
      dataPoints: [],
      // Keep parameter definitions but clear readings
      parameters: Object.keys(globalState.parameters).reduce((acc, key) => {
        acc[key] = { ...globalState.parameters[key], currentValue: null, status: 'active', lastUpdated: Date.now() };
        return acc;
      }, {} as Record<string, ParameterMetadata>)
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    resetData,
    isSupported
  };
}
