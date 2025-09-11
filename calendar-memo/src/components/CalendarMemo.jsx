import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import ReactMarkdown from "react-markdown";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import "../App.css";
import "../firebaseConfig"; // Firebase 초기화 파일

function CalendarMemoApp() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [memo, setMemo] = useState("");
  const [memos, setMemos] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

// ✅ 로컬 기준 날짜 키 생성 함수
  const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchMemos(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      document.body.classList.add("has-selected-date");
    } else {
      document.body.classList.remove("has-selected-date");
    }
  }, [selectedDate]);

  // Firestore에서 메모 불러오기
  const fetchMemos = async (uid) => {
    const docRef = doc(db, "memos", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setMemos(docSnap.data());
    }
  };

  // 로그인
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMemos({});
    setSelectedDate(null);
    setMemo("");
  };

  // 메모 저장
  const handleSave = async () => {
    if (!selectedDate || memo.trim() === "") return;
    const dateKey = getLocalDateKey(selectedDate);
    const updatedMemos = { ...memos, [dateKey]: memo };
    setMemos(updatedMemos);

    if (user) {
      const docRef = doc(db, "memos", user.uid);
      await setDoc(docRef, updatedMemos);
    }
    setIsPreviewMode(true);
  };

  // 메모 삭제
  const handleDelete = async () => {
    if (!selectedDate) return;
    const dateKey = getLocalDateKey(selectedDate);
    const updatedMemos = { ...memos };
    delete updatedMemos[dateKey];
    setMemos(updatedMemos);

    if (user) {
      const docRef = doc(db, "memos", user.uid);
      await setDoc(docRef, updatedMemos);
    }

    setMemo("");
    setSelectedDate(null);
  };

  // 날짜 선택
  const handleDateChange = (date) => {
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    setSelectedDate(localDate);

    const dateKey = getLocalDateKey(localDate);
    const memoText = memos[dateKey] || "";

    setMemo(memoText);
    setIsPreviewMode(memoText !== "");
  };

  // 닫기
  const handleClose = () => {
    setSelectedDate(null);
    setMemo("");
    setIsPreviewMode(false);
  };

  // 로그인 화면
  if (!user) {
    return (
      <div className="login-container">
        <h1>메모 캘린더</h1>
        <button onClick={handleLogin}>구글 로그인</button>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="logout-btn" onClick={handleLogout}>로그아웃</button>

      <div className="wrapper">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={({ date, view }) => {
            if (view === "month") {
              const dateKey = getLocalDateKey(date);
              if (memos[dateKey]) return <div className="dot"></div>;
            }
            return null;
          }}
        />

        {selectedDate && (
          <div className="memo-panel">
            <h2>
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 메모
            </h2>

            {!isPreviewMode ? (
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모를 입력하세요..."
              />
            ) : (
              <div className="markdown-preview">
                <ReactMarkdown>{memo}</ReactMarkdown>
              </div>
            )}

            <div className="memo-actions">
              {!isPreviewMode && <button onClick={handleSave}>저장</button>}
              {isPreviewMode && (
                <button className="delete-btn" onClick={handleDelete}>삭제</button>
              )}
              <button onClick={handleClose}>닫기</button>
              <button onClick={() => setIsPreviewMode(!isPreviewMode)}>
                {isPreviewMode ? "편집" : "미리보기"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarMemoApp;
