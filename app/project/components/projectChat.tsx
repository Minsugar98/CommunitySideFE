'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '../../store/useUserStore';
import styles from './projectChat.module.css';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import {getChatMessages} from '../../api/project'; // 설정하신 apiClient 사용

interface ProjectChatProps {
  projectId: string;
}

export default function ProjectChat({ projectId }: ProjectChatProps) {
  const { id: userId } = useUserStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<any[]>([]);
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
  
  
  // 무한 스크롤 관련 상태
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true); // 처음 로딩인지 확인

  // 1. 과거 메시지 불러오기 함수
  const fetchMessages = useCallback(async (pageNum: number) => {
    // 💡 이미 로딩 중이거나 데이터가 없으면 즉시 차단
    if (isLoading) return; 
    
    setIsLoading(true);
    try {
      const res = await getChatMessages(Number(projectId), pageNum);
      if (res.success) {
        const newMessages = res.data;
        
        // 💡 중복 방지 로직: 기존 chatLog와 새로 들어온 메시지의 ID를 비교해서 합치기
        setChatLog((prev) => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNew = newMessages.filter((m: any) => !existingIds.has(m.id));
          return [...uniqueNew, ...prev];
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, isLoading]);

  // 2. 초기 로딩 (1페이지)
  useEffect(() => {
    fetchMessages(1);
  }, []);

  // 3. 상단 도달 감지 (무한 스크롤 이벤트)
  const handleScroll = () => {
    const node = scrollRef.current;
    if (node && node.scrollTop === 0 && hasMore && !isLoading) {
      setPage((prev) => {
        const nextPage = prev + 1;
        fetchMessages(nextPage);
        return nextPage;
      });
    }
  };

  // 4. 소켓 연결
  useEffect(() => {
    const newSocket = io(serverUrl, {
      transports: ['websocket'],
      withCredentials: true,
      query: { projectId: String(projectId) },
    });

    setSocket(newSocket);

    newSocket.on('receiveMessage', (data) => {
      setChatLog((prev) => [...prev, data]);
      // 새 메시지 수신 시 스크롤이 거의 하단이면 아래로 내려줌
      setTimeout(() => {
        const node = scrollRef.current;
        if (node) {
          const isNearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 100;
          if (isNearBottom) node.scrollTop = node.scrollHeight;
        }
      }, 0);
    });

    return () => { newSocket.disconnect(); };
  }, [projectId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    socket.emit('sendMessage', { projectId, content: message });
    setMessage('');
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3 className={styles.title}>팀 실시간 채팅</h3>
        <span className={socket?.connected ? styles.statusOnline : styles.statusOffline}>
          {socket?.connected ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className={styles.messageList} ref={scrollRef} onScroll={handleScroll}>
        {isLoading && <div className={styles.loader}>이전 대화 불러오는 중...</div>}
        
        {chatLog.map((chat, index) => {
          const isMine = chat.user?.id === userId || chat.userId === userId;
          return (
            <div key={chat.id || index} className={`${styles.messageWrapper} ${isMine ? styles.myMessage : styles.otherMessage}`}>
              {!isMine && <div className={styles.senderName}>{chat.user?.nickname}</div>}
              <div className={styles.bubble}>
                {chat.content}
                <span className={styles.time}>
                  {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <form className={styles.inputArea} onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="메시지를 입력하세요..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className={styles.sendBtn}><Send size={18} /></button>
      </form>
    </div>
  );
}