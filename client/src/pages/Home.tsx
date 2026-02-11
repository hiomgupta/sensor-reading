import { useState } from 'react';
import { useLocation } from "wouter";
import { Bluetooth, ArrowRight, ShieldCheck, Zap, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Home() {
  const [_, setLocation] = useLocation();
  const { connect, isConnecting, error, isSupported } = useBluetooth();

  const handleConnect = async () => {
    await connect();
  };

  const handleStartDemo = () => {
    connect(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full text-center space-y-8 relative z-10"
      >
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg shadow-blue-500/10 mb-6">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Bluetooth className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
          Wireless Sensor <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Monitoring Lab
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Connect your ESP32 or Nordic BLE device directly to the browser. 
          Visualize real-time data streams, analyze trends, and export for research.
        </p>

        <AnimatePresence>
          {(!isSupported || error?.includes('policy')) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-md mx-auto"
            >
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Environment Limitation</AlertTitle>
                <AlertDescription className="text-sm mt-2 space-y-2">
                  <p>
                    Web Bluetooth is restricted in this environment (e.g., Replit preview).
                    In a local Chrome/Edge browser, live BLE connectivity works as expected.
                  </p>
                  <p className="font-medium text-destructive">
                    Demo Mode is enabled to showcase full application flow.
                  </p>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : (
              <>
                Connect Sensor <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 text-lg rounded-full bg-white/50 backdrop-blur border-border/60"
                  onClick={handleStartDemo}
                >
                  <Zap className="mr-2 w-5 h-5 text-amber-500" />
                  Try Demo Mode
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Simulates a sensor connection without hardware</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {error && !error.includes('policy') && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive font-medium bg-destructive/5 py-2 px-4 rounded-lg inline-block"
          >
            {error}
          </motion.p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          {[
            {
              icon: Zap,
              title: "Real-time",
              desc: "Low-latency streaming directly from hardware characteristic."
            },
            {
              icon: ShieldCheck,
              title: "Secure",
              desc: "Browser-sandboxed connection. No data leaves your device."
            },
            {
              icon: Info,
              title: "Demo Mode",
              desc: "Explore the platform features even without hardware connectivity."
            }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <item.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
