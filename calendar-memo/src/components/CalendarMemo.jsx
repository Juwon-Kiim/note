import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import ReactMarkdown from "react-markdown";
import "react-calendar/dist/Calendar.css";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import "../App.css";
import "../firebaseConfig";

function CalendarMemo() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [memo, setMemo] = useState("");
  const [memos, setMemos] = useState({});
  const [preview, setPreview] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const getKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,"0");
    const d = String(date.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  };

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>{
      setUser(u);
      if(u) load(u.uid);
    });
    return ()=>unsub();
  }, []);
  
  useEffect(() => {
    const handlePopState = () => {
      setSelectedDate(null);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    }
  }, [])

  const load = async(uid)=>{
    const snap = await getDoc(doc(db,"memos",uid));
    if(snap.exists()) setMemos(snap.data());
  };

  const login = async()=>{
    await signInWithPopup(auth,new GoogleAuthProvider());
  };

  const logout = async()=>{
    await signOut(auth);
    setUser(null);
  };

  const selectDate = (date)=>{
    setSelectedDate(date);
    const text = memos[getKey(date)] || "";
    setMemo(text);
    setPreview(text !== "");
    
    window.history.pushState({ modal: true }, "");
  };

  const save = async()=>{
    const key = getKey(selectedDate);
    const updated = {...memos,[key]:memo};
    setMemos(updated);
    await setDoc(doc(db,"memos",user.uid),updated);
    setPreview(true);
  };

  const remove = async()=>{
    const key = getKey(selectedDate);
    const updated = {...memos};
    delete updated[key];
    setMemos(updated);
    await setDoc(doc(db,"memos",user.uid),updated);
    setSelectedDate(null);
  };

  if(!user){
    return(
      <div className="login">
        <h1>Memo Calendar</h1>
        <button onClick={login}>Google Login</button>
      </div>
    )
  }

  return (
    <div className="app">

      <button className="logout" onClick={logout}>
        로그아웃
      </button>

      <div className="calendar-card">
        <Calendar
          onChange={selectDate}
          value={selectedDate}
          tileContent={({date,view})=>
            view==="month" && memos[getKey(date)]
            ? <div className="dot"/>
            : null
          }
        />
      </div>

      {selectedDate && (
        <div className="modal">

          <div className="memo">

            <div className="memo-header">
              <h2>
                {`${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`}
              </h2>

              <button
                className="close"
                onClick={()=>setSelectedDate(null)}
              >
                ✕
              </button>
            </div>

            {!preview ? (
              <textarea
                value={memo}
                onChange={(e)=>setMemo(e.target.value)}
              />
            ):(
              <div className="preview">
                <ReactMarkdown>
                  {memo}
                </ReactMarkdown>
              </div>
            )}

            <div className="actions">

              {!preview && (
                <button onClick={save}>저장</button>
              )}

              {preview && (
                <button
                  className="delete"
                  onClick={remove}
                >
                  삭제
                </button>
              )}

              <button
                onClick={()=>setPreview(!preview)}
              >
                {preview?"편집":"미리보기"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default CalendarMemo;
