## Packages
chart.js | Core charting library
react-chartjs-2 | React wrapper for Chart.js
framer-motion | Smooth animations for UI elements
lucide-react | Icon system (already in base, but ensuring usage)
clsx | Utility for constructing className strings
tailwind-merge | Utility for merging tailwind classes

## Notes
Browser must support Web Bluetooth API (Chrome, Edge, Opera).
Data export will be client-side CSV generation.
The application will use a mock BLE implementation if `navigator.bluetooth` is missing for development preview purposes, but includes real implementation code.
Fonts: 'Inter' for UI, 'JetBrains Mono' for data values.
