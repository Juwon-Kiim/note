import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import ReactMarkdown from "react-markdown";
import "../App.css";

function CalendarMemoApp() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [memo, setMemo] = useState("");
  const [memos, setMemos] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // 로컬스토리지에서 메모 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("memos");
    if (saved) setMemos(JSON.parse(saved));
  }, []);

  // 메모 저장
  const handleSave = () => {
    if (!selectedDate || memo.trim() === "") return;
    const dateKey = selectedDate.toISOString().split("T")[0];
    const updatedMemos = { ...memos, [dateKey]: memo };
    setMemos(updatedMemos);
    localStorage.setItem("memos", JSON.stringify(updatedMemos));
    setIsPreviewMode(true); // 저장 후 미리보기 모드로 전환
  };

  // 메모 삭제
const handleDelete = () => {
  if (!selectedDate) return;
  const dateKey = selectedDate.toISOString().split("T")[0];
  const updatedMemos = { ...memos };
  delete updatedMemos[dateKey]; // 해당 날짜 메모 삭제
  setMemos(updatedMemos);
  localStorage.setItem("memos", JSON.stringify(updatedMemos));
  setMemo(""); // 메모창 초기화
  setSelectedDate(null); // 메모 패널 닫기
};

  // 날짜 선택
  const handleDateChange = (date) => {
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    setSelectedDate(localDate);

    const dateKey = localDate.toISOString().split("T")[0];
    const memoText = memos[dateKey] || "";

    setMemo(memoText);
    setIsPreviewMode(memoText !== ""); // 메모 있으면 미리보기, 없으면 편집
  };

  // 닫기
  const handleClose = () => {
    setSelectedDate(null);
    setMemo("");
    setIsPreviewMode(false);
  };

  return (
    <div className="container">
      <div className="wrapper">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={({ date, view }) => {
            if (view === "month") {
              const dateKey = date.toISOString().split("T")[0];
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
              {!isPreviewMode && (
                <button onClick={handleSave}>저장</button>
              )}
              {isPreviewMode && ( // 미리보기 모드일 때만 삭제 버튼 표시
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