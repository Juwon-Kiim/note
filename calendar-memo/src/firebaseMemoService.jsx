import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebaseConfig';

export const saveMemo = async (uid, date, content) => {
    await setDoc(doc(db, "memos", `${uid}_${date}`), {
        content,
        updatedAt: new Date().toISOString()
    });
};

export const getMemo = async (uid, date) => {
    const ref = doc(db, "memos", `${uid}_${date}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
};

export const deleteMemo = async (uid, date) => {
    await deleteDoc(doc(db, "memos", `${uid}_${date}`));
};