'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './aichat.module.css';
// 1. 만든 API 모듈 import
import { chatApi, ChatHistoryItem } from '../api/api';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

export default function AiChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 사용자 메시지 UI 추가
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      text: input,
    };

    // 백엔드 전송용 히스토리 변환
    const historyPayload: ChatHistoryItem[] = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // ---------------------------------------------------------
      // 2. axios API 호출로 교체
      // ---------------------------------------------------------
      const data = await chatApi.sendMessage({
        message: userMessage.text,
        history: historyPayload,
      });

      // AI 응답 UI 추가
      const botMessage: Message = {
        id: Date.now() + 1,
        role: 'model',
        text: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'model',
        text: error.message || '오류가 발생했습니다.', // API에서 던진 에러 메시지 활용
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (아래 return 부분은 CSS Module 적용한 코드 그대로 유지) ...
  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>AI Chat Bot</h1>
        <span className={styles.badge}>Gemini 2.5</span>
      </header>

      {/* 채팅 영역 */}
      <main className={styles.chatArea}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <p>대화를 시작해보세요!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageRow} ${
              msg.role === 'user' ? styles.rowUser : styles.rowModel
            }`}
          >
            <div
              className={`${styles.bubble} ${
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleModel
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.messageRow} ${styles.rowModel}`}>
            <div
              className={`${styles.bubble} ${styles.bubbleModel} ${styles.loading}`}
            >
              AI가 생각 중입니다...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* 입력 영역 */}
      <footer className={styles.footer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={styles.button}
          >
            전송
          </button>
        </form>
      </footer>
    </div>
  );
}
