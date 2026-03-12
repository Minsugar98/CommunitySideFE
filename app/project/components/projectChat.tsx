'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '../../store/useUserStore';
import styles from './projectChat.module.css';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getChatMessages } from '../../api/project';

interface ProjectChatProps {
  projectId: string;
}

export default function ProjectChat({ projectId }: ProjectChatProps) {
  const { id: userId } = useUserStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<any[]>([]);
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

  // 무한 스크롤 관련 상태
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 💡 핵심: API 중복 호출을 방지하기 위한 물리적 잠금 장치
  const isFetching = useRef(false);

  // 💡 스크롤 하단 이동 함수 (즉시 이동하도록 auto 설정)
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'auto',
      });
    }
  }, []);

  // 1. 과거 메시지 불러오기 함수
  const fetchMessages = useCallback(
    async (pageNum: number) => {
      // 이미 데이터를 가져오는 중이거나 더 이상 데이터가 없으면 중단
      if (isFetching.current || !hasMore) return;

      const node = scrollRef.current;
      const previousScrollHeight = node?.scrollHeight || 0;

      isFetching.current = true; // 잠금 시작
      setIsLoading(true);

      try {
        const res = await getChatMessages(Number(projectId), pageNum);
        if (res.success) {
          const newMessages = res.data;

          if (newMessages.length === 0) {
            setHasMore(false);
          } else {
            setChatLog((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const uniqueNew = newMessages.filter(
                (m: any) => !existingIds.has(m.id),
              );
              return [...uniqueNew, ...prev];
            });

            // 💡 과거 데이터 로드 시 스크롤 위치 보정 (떨림 방지 핵심)
            if (pageNum > 1) {
              requestAnimationFrame(() => {
                if (node) {
                  // 새 데이터가 추가된 후, 이전 높이 차이만큼 스크롤을 아래로 밀어 0점 탈출
                  node.scrollTop = node.scrollHeight - previousScrollHeight;
                }
              });
            }
          }
        }
      } catch (error) {
        console.error('채팅 로딩 에러:', error);
      } finally {
        setIsLoading(false);
        isFetching.current = false; // 잠금 해제
      }
    },
    [projectId, hasMore],
  );

  // 2. 초기 로딩 및 하단 정렬
  useEffect(() => {
    fetchMessages(1).then(() => {
      setTimeout(scrollToBottom, 100);
    });
  }, []);

  // 3. 상단 도달 감지 (무한 스크롤 이벤트)
  const handleScroll = () => {
    const node = scrollRef.current;
    // 상단 20px 지점에 도달하면 미리 다음 페이지 로드
    if (node && node.scrollTop <= 20 && hasMore && !isFetching.current) {
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

      // 사용자가 하단 근처에 있을 때만 자동 스크롤
      setTimeout(() => {
        const node = scrollRef.current;
        if (node) {
          const isNearBottom =
            node.scrollHeight - node.scrollTop - node.clientHeight < 250;
          if (isNearBottom) {
            scrollToBottom();
          }
        }
      }, 50);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [projectId, serverUrl, scrollToBottom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    socket.emit('sendMessage', { projectId, content: message });
    setMessage('');
    // 내가 보낸 메시지는 즉시 하단 이동
    setTimeout(scrollToBottom, 50);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3 className={styles.title}>팀 실시간 채팅</h3>
        <span
          className={
            socket?.connected ? styles.statusOnline : styles.statusOffline
          }
        >
          {socket?.connected ? 'Online' : 'Offline'}
        </span>
      </div>

      <div
        className={styles.messageList}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {isLoading && (
          <div className={styles.loader}>이전 대화 불러오는 중...</div>
        )}

        {chatLog.map((chat, index) => {
          const isMine = chat.user?.id === userId || chat.userId === userId;
          return (
            <div
              key={chat.id || index}
              className={`${styles.messageWrapper} ${isMine ? styles.myMessage : styles.otherMessage}`}
            >
              {!isMine && (
                <div className={styles.senderName}>
                  {chat.user?.nickname || '익명'}
                </div>
              )}
              <div className={styles.bubble}>
                {chat.content}
                <span className={styles.time}>
                  {new Date(chat.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
        <button type="submit" className={styles.sendBtn}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
