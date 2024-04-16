import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

import firebaseConfig from "@/credentials/firebase.js";

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { ignoreUndefinedProperties: true });

export default db;
