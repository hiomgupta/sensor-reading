import { useState, createContext, useContext, ReactNode } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { Badge } from "@/components/ui/badge";

// Create a context to hold the Bluetooth state globally
// This ensures connection persists across route changes if needed,
// or allows the App to coordinate which page to show.
const BluetoothContext = createContext<ReturnType<typeof useBluetooth> | null>(null);

export function useBluetoothContext() {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error("useBluetoothContext must be used within a BluetoothProvider");
  }
  return context;
}

function BluetoothProvider({ children }: { children: ReactNode }) {
  const bluetooth = useBluetooth();
  return (
    <BluetoothContext.Provider value={bluetooth}>
      {children}
    </BluetoothContext.Provider>
  );
}

// Wrapper for Home that redirects if connected
function HomeWrapper() {
  const { isConnected } = useBluetoothContext();
  if (isConnected) {
    return <DashboardWrapper />;
  }
  return <Home />;
}

// Wrapper to provide context to Dashboard (though we are using global context now)
function DashboardWrapper() {
  return <Dashboard />;
}

// Since we modified Home/Dashboard to use the hook directly in previous files,
// we need to make sure they actually use the CONTEXT, not a new hook instance.
// BUT, I already generated those files importing `useBluetooth` directly.
// To fix this without regenerating all files, I will use a clever trick:
// I will implement the Router such that it conditionally renders Dashboard 
// when connected, overriding the Route logic slightly, or just pass the context.

// Actually, the cleanest way given the constraints is to modify how `useBluetooth` behaves 
// by making it a singleton OR simpler:
// The generated `Home.tsx` and `Dashboard.tsx` import `useBluetooth`.
// If I change `client/src/hooks/use-bluetooth.ts` to use a singleton context it would work, 
// but I've already output that file.

// CHANGE OF STRATEGY for App.tsx:
// I will re-implement the `useBluetooth` hook inside the components by 
// defining a Context Provider here that *shadows* the hook imports if I could, 
// but I can't.
// Instead, I will assume the user will stick to a single page app flow where 
// `App` decides what to render based on connection state.

function MainLayout() {
  const { isConnected, isDemoMode } = useBluetoothContext();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Header />
      <main className="flex-1">
        {isConnected ? <Dashboard /> : <Home />}
        {isDemoMode && (
          <div className="fixed bottom-4 right-4 z-50">
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg border-none px-3 py-1 text-xs font-bold uppercase tracking-widest">
              Demo Mode
            </Badge>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// IMPORTANT: Because I cannot change the imports in Home.tsx and Dashboard.tsx 
// (they import from @/hooks/use-bluetooth), they will instantiate their OWN bluetooth hooks 
// if I don't provide the state.
//
// WAIT - `useBluetooth` hook creates local state. If Home uses it, and Dashboard uses it, 
// they are separate states. Connection in Home won't be seen in Dashboard.
//
// CORRECTION: I MUST modify `useBluetooth` in the hook file to be a singleton or context.
// Since I already wrote the hook file as a standard hook, I made a mistake in the architectural plan 
// for a multi-page app. 
//
// HOWEVER, I can fix this by Making `App.tsx` the ONLY place that uses `useBluetooth`, 
// and passing the data down as props to Home and Dashboard.
// But Home and Dashboard imports are already written to use the hook.
// 
// THE FIX: I will rewrite the hook file content in the `client/src/hooks/use-bluetooth.ts` block ABOVE
// if I could go back. I cannot.
//
// FORWARD FIX: I will implement a "Smart" Router in App.tsx that uses the hook 
// and passes the values to a Context. 
// I will override the `useBluetooth` hook implementation by leveraging the file overwriting 
// if I were doing this in a real editor.
// 
// Since I am generating code linearly:
// I will rely on the fact that I can't change the past. 
// I will output a `client/src/lib/bluetooth-context.tsx` and updated App.tsx.
// AND I will regenerate `client/src/hooks/use-bluetooth.ts` with a singleton pattern 
// so that regardless of where it's called, it shares state.
// 
// Let's regenerate `client/src/hooks/use-bluetooth.ts` with a singleton pattern 
// (global variable outside the hook) to save the day!

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BluetoothProvider>
           <MainLayout />
        </BluetoothProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
