// React types come from @types/react - no override needed

declare namespace React {
    type FC<P = {}> = (props: P) => any;
    type ReactNode = any;
    type FormEvent = any;
}

declare module 'react' {
    const React: any;
    export default React;
    export const useState: any;
    export const useEffect: any;
    export const useRef: any;
    export const useCallback: any;
    export const useMemo: any;
    export const useContext: any;
    export const createContext: any;
    export const Fragment: any;
    export const StrictMode: any;
    export type FC<P = {}> = (props: P) => any;
    export type ReactNode = any;
    export type FormEvent = any;
}

declare module 'path' {
    const path: any;
    export default path;
    export const resolve: any;
    export const join: any;
}

declare module 'vite' {
    export const defineConfig: any;
    export const loadEnv: any;
}

declare module '@vitejs/plugin-react' {
    const react: any;
    export default react;
}

declare module 'react-dom/client' {
    export const createRoot: any;
}

declare module 'react/jsx-runtime' {
    export const jsx: any;
    export const jsxs: any;
    export const Fragment: any;
}

declare module 'leaflet' {
    const L: any;
    export default L;
}

declare module '@google/genai' {
    export const GoogleGenAI: any;
    export const Type: any;
}

declare module 'lucide-react' {
    export const User: any;
    export const Mail: any;
    export const Shield: any;
    export const Camera: any;
    export const Edit2: any;
    export const Save: any;
    export const X: any;
    export const Star: any;
    export const Trophy: any;
    export const Gift: any;
    export const Lock: any;
    export const Bus: any;
    export const Landmark: any;
    export const Music: any;
    export const Zap: any;
    export const Check: any;
    export const Crown: any;
    export const MapPin: any;
    export const AlertTriangle: any;
    export const Filter: any;
    export const Plus: any;
    export const Search: any;
    export const Menu: any;
    export const LogOut: any;
    export const Settings: any;
    export const ArrowRight: any;
    export const Info: any;
    export const Clock: any;
    export const CheckCircle: any;
    export const ChevronRight: any;
    export const ExternalLink: any;
    export const ShoppingBag: any;
    export const Layout: any;
    export const CreditCard: any;
    export const Send: any;
    export const Map: any;
    export const Layers: any;
    export const Activity: any;
    export const Moon: any;
    export const Sun: any;
    export const SunMoon: any;
    export const Globe: any;
    export const Languages: any;
    export const Building2: any;
    export const TrendingUp: any;
    export const MessageSquare: any;
    export const AlertCircle: any;
    export const ScanEye: any;
    export const Sparkles: any;
    export const FileText: any;
    export const Square: any;
    export const Wallet: any;
    export const HelpCircle: any;
    export const Calendar: any;
    export const Users: any;
    export const Sparkle: any;
}

declare module 'recharts' {
    export const ResponsiveContainer: any;
    export const BarChart: any;
    export const Bar: any;
    export const XAxis: any;
    export const YAxis: any;
    export const CartesianGrid: any;
    export const Tooltip: any;
    export const Legend: any;
    export const Cell: any;
    export const PieChart: any;
    export const Pie: any;
}

declare module 'firebase/auth' {
    export const getAuth: any;
    export const signInWithPopup: any;
    export const GoogleAuthProvider: any;
    export const signOut: any;
    export const onAuthStateChanged: any;
    export const signInWithEmailAndPassword: any;
    export const createUserWithEmailAndPassword: any;
    export const sendPasswordResetEmail: any;
}

declare module 'firebase/app' {
    export const initializeApp: any;
}

declare module 'lodash' {
    const lodash: any;
    export default lodash;
    export const debounce: any;
}

declare const __dirname: string;
declare const process: { env: Record<string, string | undefined> };

declare namespace NodeJS {
    interface ProcessEnv {
        [key: string]: string | undefined;
    }
}
