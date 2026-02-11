import { clsx } from "clsx";
import { motion } from "framer-motion";

interface ValueDisplayProps {
  value: number | null;
  unit?: string;
  label?: string;
  className?: string;
}

export function ValueDisplay({ value, unit = "Units", label = "Live Reading", className }: ValueDisplayProps) {
  const hasValue = value !== null;

  return (
    <div className={clsx("flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-border/50 shadow-sm", className)}>
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </span>
      
      <div className="relative flex items-baseline">
        <motion.span 
          key={value} // Trigger animation on value change
          initial={{ opacity: 0.5, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "text-6xl md:text-7xl font-mono font-bold tracking-tight tabular-nums",
            hasValue ? "text-foreground" : "text-muted-foreground/30"
          )}
        >
          {hasValue ? value.toFixed(1) : "--.-"}
        </motion.span>
        
        {hasValue && (
          <span className="ml-2 text-xl font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className={clsx(
          "w-2 h-2 rounded-full animate-pulse",
          hasValue ? "bg-green-500" : "bg-gray-300"
        )} />
        <span className="text-xs text-muted-foreground">
          {hasValue ? "Updating in real-time" : "Waiting for data..."}
        </span>
      </div>
    </div>
  );
}
