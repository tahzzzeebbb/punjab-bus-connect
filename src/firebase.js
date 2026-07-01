import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCnLHx8-k1drsWhIDjPpWPx7TTg-iX5abE",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "punjab-bus-connect.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "punjab-bus-connect",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "punjab-bus-connect.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "790152385396",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:790152385396:web:51de14d43bb063a6539221",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ── Real Punjab Bus Routes Data ──────────────────────────────
const REAL_ROUTES = [
    {
        id: "R1", name: "Shahdara → Thokar Niaz Baig",
        color: "#1a7a3c", freq: 8, first: "5:30 AM", last: "11:00 PM", km: 32,
        stops: ["Shahdara Terminal", "GT Road Shahdara", "Bhatti Chowk", "Lahore Railway Station", "Mall Road", "Charing Cross", "GPO", "Shimla Hill", "Kalma Chowk", "Liberty Market", "Gulberg Main Blvd", "MM Alam Road", "Johar Town Chowk", "Thokar Niaz Baig"],
        coords: [[31.5928, 74.3100], [31.5870, 74.3150], [31.5723, 74.3289], [31.5497, 74.3087], [31.5560, 74.3290], [31.5530, 74.3320], [31.5510, 74.3340], [31.5400, 74.3400], [31.5204, 74.3587], [31.5153, 74.3429], [31.5085, 74.3421], [31.5023, 74.3398], [31.4820, 74.2980], [31.4697, 74.3436]],
    },
    {
        id: "R2", name: "Badami Bagh → DHA Phase 6",
        color: "#1565c0", freq: 10, first: "6:00 AM", last: "10:30 PM", km: 28,
        stops: ["Badami Bagh", "Lohari Gate", "Bhati Gate", "Anarkali Bazaar", "Mall Road", "Shadman", "Gulberg", "Liberty", "MM Alam", "Bahria Town Chowk", "DHA Phase 5", "DHA Phase 6"],
        coords: [[31.5786, 74.3099], [31.5720, 74.3080], [31.5680, 74.3060], [31.5623, 74.3215], [31.5560, 74.3290], [31.5398, 74.3289], [31.5085, 74.3421], [31.5153, 74.3429], [31.5023, 74.3398], [31.4750, 74.3200], [31.4600, 74.3350], [31.4500, 74.3450]],
    },
    {
        id: "R3", name: "Kalma Chowk → Allama Iqbal Airport",
        color: "#6a1b9a", freq: 12, first: "4:00 AM", last: "12:00 AM", km: 18,
        stops: ["Kalma Chowk", "Ferozepur Road", "Kot Lakhpat", "Sundar Industrial", "Raiwind Road", "Airport Terminal"],
        coords: [[31.5204, 74.3587], [31.5012, 74.3321], [31.4820, 74.3100], [31.4698, 74.2951], [31.4600, 74.3800], [31.5216, 74.4039]],
    },
    {
        id: "R4", name: "Data Darbar → Packages Mall",
        color: "#e65100", freq: 10, first: "6:00 AM", last: "10:30 PM", km: 22,
        stops: ["Data Darbar", "Mcleod Road", "Circular Road", "Shadman Chowk", "Gulberg III", "MM Alam Road", "Packages Mall"],
        coords: [[31.5786, 74.3099], [31.5623, 74.3215], [31.5550, 74.3200], [31.5398, 74.3289], [31.5085, 74.3421], [31.5023, 74.3398], [31.4821, 74.3301]],
    },
    {
        id: "R5", name: "Sabzazar → Qila Gujjar Singh",
        color: "#00695c", freq: 15, first: "6:30 AM", last: "9:30 PM", km: 14,
        stops: ["Sabzazar", "Shalamar Garden", "Bund Road", "Baghbanpura", "Railway Station", "Qila Gujjar Singh"],
        coords: [[31.5712, 74.2891], [31.5823, 74.3012], [31.5698, 74.3198], [31.5600, 74.3100], [31.5497, 74.3087], [31.5389, 74.3156]],
    },
    {
        id: "R6", name: "Wagha Border → Minar-e-Pakistan",
        color: "#b71c1c", freq: 20, first: "7:00 AM", last: "9:00 PM", km: 26,
        stops: ["Wagha Border", "GT Road", "Shahdara", "Ravi Bridge", "Mochi Gate", "Delhi Gate", "Minar-e-Pakistan"],
        coords: [[31.6042, 74.5023], [31.5980, 74.4500], [31.5928, 74.3100], [31.5870, 74.3200], [31.5786, 74.3099], [31.5750, 74.3080], [31.5880, 74.3087]],
    },
];

// ── Seed Routes to Firestore ──────────────────────────────────
export async function seedRoutes() {
    const col = collection(db, "routes");
    for (const r of REAL_ROUTES) {
        await addDoc(col, r);
    }
    console.log("✅ Real Punjab routes seeded!");
}

// ── Fetch Routes from Firestore ───────────────────────────────
export async function fetchRoutes() {
    try {
        const snapshot = await getDocs(collection(db, "routes"));
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Fetch error:", e);
        return REAL_ROUTES; // fallback to local data
    }
}

export { REAL_ROUTES };