import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCnLHx8-k1drsWhIDjPpWPx7TTg-iX5abE",
    authDomain: "punjab-bus-connect.firebaseapp.com",
    projectId: "punjab-bus-connect",
    storageBucket: "punjab-bus-connect.firebasestorage.app",
    messagingSenderId: "790152385396",
    appId: "1:790152385396:web:51de14d43bb063a6539221"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── Seed initial route data into Firestore ──────────────────
export async function seedRoutes() {
    const routes = [
        { id: "R1", name: "Shahdara → Thokar Niaz Baig", stops: ["Shahdara Terminal", "GT Road", "Bhatti Chowk", "Kalma Chowk", "Liberty Market", "Gulberg", "Thokar Niaz Baig"], freq: 8, first: "5:30 AM", last: "11:00 PM", km: 32 },
        { id: "R4", name: "Kalma Chowk → Airport", stops: ["Kalma Chowk", "Ferozepur Road", "Johar Town", "Thokar", "Airport Terminal"], freq: 12, first: "4:00 AM", last: "12:00 AM", km: 18 },
        { id: "R7", name: "Data Darbar → Packages Mall", stops: ["Data Darbar", "Mcleod Road", "Shadman", "Gulberg", "MM Alam", "Packages Mall"], freq: 10, first: "6:00 AM", last: "10:30 PM", km: 22 },
        { id: "R9", name: "Sabzazar → Qila Gujjar Singh", stops: ["Sabzazar", "Shalamar", "Bund Road", "Railway Station", "Qila Gujjar Singh"], freq: 15, first: "6:30 AM", last: "9:30 PM", km: 14 },
    ];
    const col = collection(db, "routes");
    for (const r of routes) {
        await addDoc(col, r);
    }
    console.log("✅ Routes seeded to Firestore!");
}

// ── Fetch routes from Firestore ──────────────────────────────
export async function fetchRoutes() {
    const snapshot = await getDocs(collection(db, "routes"));
    return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
}