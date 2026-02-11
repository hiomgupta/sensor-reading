import { useEffect, useState } from 'react';
import { useLocation } from "wouter";
import { Download, RefreshCw, BluetoothOff, Info, AlertTriangle, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { ValueDisplay } from "@/components/ValueDisplay";
import { SensorChart } from "@/components/SensorChart";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { 
    isConnected, 
    disconnect, 
    dataPoints, 
    parameters,
    deviceName, 
    resetData,
    isDemoMode
  } = useBluetooth();
  const { toast } = useToast();
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    'temp': true, 'hum': true, 'accel': true
  });

  const handleExportCSV = () => {
    if (dataPoints.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    // 5N. Correct Format: timestamp,parameter,value,unit
    const headers = "Timestamp,Parameter,Value,Unit\n";
    const csvContent = dataPoints.map(p => {
      const meta = parameters[p.parameter];
      return `${new Date(p.timestamp).toISOString()},${meta?.name || p.parameter},${p.value},${meta?.unit || ''}`;
    }).join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${isDemoMode ? 'DEMO_' : ''}sensor_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isConnected && dataPoints.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-xl font-bold">No Active Session</h1>
        <Button onClick={() => setLocation("/")}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* 4L. Demo/Sync Warning */}
      {isDemoMode && (
        <AlertTriangle className="w-full text-center text-amber-600 bg-amber-50 p-2 rounded-lg text-xs font-medium border border-amber-200">
          Parameters update independently. Synchronization is not assumed. Visualization downsampled for performance.
        </AlertTriangle>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{deviceName || "Sensor Node"}</h1>
            {isDemoMode && <Badge variant="outline" className="bg-amber-50 text-amber-700">Simulation Active</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isConnected ? "Streaming via BLE GATT" : "Disconnected"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { disconnect(); setLocation("/"); }} className="text-red-600 border-red-100 hover:bg-red-50">
          <BluetoothOff className="w-4 h-4 mr-2" /> Disconnect
        </Button>
      </div>

      {/* Parameters Grid */}
      <div className="space-y-6">
        {Object.values(parameters).map((p) => (
          <Collapsible
            key={p.id}
            open={openCards[p.id]}
            onOpenChange={(open) => setOpenCards(prev => ({ ...prev, [p.id]: open }))}
            className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${p.status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Activity className={`w-5 h-5 ${p.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-bold">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-green-500' : p.status === 'stale' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold">
                    {p.currentValue !== null ? (p.currentValue > 9000 ? 'OUTLIER' : p.currentValue.toFixed(p.id === 'accel' ? 3 : 1)) : '--'}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">{p.unit}</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon"><ChevronDown className={`w-4 h-4 transition-transform ${openCards[p.id] ? 'rotate-180' : ''}`} /></Button>
                </CollapsibleTrigger>
              </div>
            </div>

            <CollapsibleContent>
              <div className="px-4 pb-4 border-t border-border/30 pt-4">
                <SensorChart 
                  dataPoints={dataPoints} 
                  parameterId={p.id} 
                  parameterName={p.name} 
                  unit={p.unit} 
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={resetData}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reset Session
        </Button>
        <Button onClick={handleExportCSV} className="shadow-lg shadow-primary/20">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>
    </div>
  );
}
