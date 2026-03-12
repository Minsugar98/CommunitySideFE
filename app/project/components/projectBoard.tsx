'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './projectBoard.module.css';
import {
  getProjectPosts,
  getPostDetail,
  createProjectPost,
  updateProjectPost,
  deleteProjectPost,
  createComment,
  deleteComment,
} from '../../api/project';
import toast from 'react-hot-toast';
import Loading from '../../components/loading/loading';
import { useUserStore } from '../../store/useUserStore';
import { Edit3, Trash2, MessageSquare, ArrowLeft, Send } from 'lucide-react';

export default function ProjectBoard({ projectId }: { projectId: string }) {
  const { id: userId } = useUserStore();
  const [activeView, setActiveView] = useState<'list' | 'write' | 'detail'>(
    'list',
  );
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 게시글 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditingPost, setIsEditingPost] = useState(false);

  // 댓글 상태
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💡 삭제 모달 상태
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'post' | 'comment';
    id: number;
  } | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getProjectPosts(Number(projectId), {
        page: 1,
        limit: 10,
      });
      if (res.success) setPosts(res.data.posts);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleViewDetail = async (postId: number) => {
    try {
      setIsLoading(true);
      const res = await getPostDetail(Number(projectId), postId);
      if (res.success) {
        setSelectedPost(res.data);
        setActiveView('detail');
        setIsEditingPost(false);
      }
    } catch (err) {
      toast.error('게시글을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (isEditingPost) {
        await updateProjectPost(Number(projectId), selectedPost.id, {
          title,
          content,
        });
        toast.success('수정되었습니다.');
        handleViewDetail(selectedPost.id);
      } else {
        await createProjectPost(Number(projectId), { title, content });
        toast.success('등록되었습니다.');
        setActiveView('list');
        fetchPosts();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 💡 모달을 통한 실제 삭제 실행
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'post') {
        await deleteProjectPost(Number(projectId), deleteTarget.id);
        toast.success('삭제되었습니다.');
        setActiveView('list');
        fetchPosts();
      } else {
        await deleteComment(
          Number(projectId),
          selectedPost.id,
          deleteTarget.id,
        );
        toast.success('댓글이 삭제되었습니다.');
        handleViewDetail(selectedPost.id);
      }
    } catch (err) {
      toast.error('삭제 실패');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await createComment(Number(projectId), selectedPost.id, {
        content: comment,
      });
      setComment('');
      handleViewDetail(selectedPost.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const enterEditMode = () => {
    setTitle(selectedPost.title);
    setContent(selectedPost.content);
    setIsEditingPost(true);
  };

  return (
    <div className={styles.container}>
      {/* 💡 커스텀 삭제 확인 모달 */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>정말 삭제하시겠습니까?</h3>
            <p>삭제된 내용은 복구할 수 없습니다.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </button>
              <button
                className={styles.modalDeleteBtn}
                onClick={handleConfirmDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'detail' && selectedPost && (
        <>
          <div className={styles.header}>
            <button
              className={styles.iconBtn}
              onClick={() => setActiveView('list')}
            >
              <ArrowLeft size={18} /> 목록으로
            </button>
            <h2>{isEditingPost ? '게시글 수정' : '게시글 상세'}</h2>
          </div>

          <div className={styles.detailCard}>
            {isEditingPost ? (
              <form onSubmit={handlePostSubmit} className={styles.editForm}>
                <input
                  className={styles.titleInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  className={styles.contentInput}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setIsEditingPost(false)}
                  >
                    취소
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    수정 완료
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className={styles.detailHeader}>
                  <div className={styles.titleRow}>
                    <h1 className={styles.detailTitle}>{selectedPost.title}</h1>
                    {userId === selectedPost.user?.id && (
                      <div className={styles.actionButtons}>
                        <button onClick={enterEditMode} title="수정">
                          <Edit3 size={16} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() =>
                            setDeleteTarget({
                              type: 'post',
                              id: selectedPost.id,
                            })
                          }
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={styles.detailMeta}>
                    <span className={styles.metaNickname}>
                      {selectedPost.user?.nickname || '익명'}
                    </span>
                    <span className={styles.metaDate}>
                      {new Date(selectedPost.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className={styles.detailContent}>
                  {selectedPost.content}
                </div>

                <div className={styles.commentSection}>
                  <div className={styles.commentHeader}>
                    <MessageSquare size={18} color="#83c2e4" />
                    <h3>댓글 {selectedPost._count?.comments || 0}</h3>
                  </div>

                  <form
                    onSubmit={handleCommentSubmit}
                    className={styles.commentForm}
                  >
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="팀원들과 의견을 나눠보세요."
                      className={styles.commentInput}
                    />
                    <button
                      type="submit"
                      className={styles.commentSubmitBtn}
                      disabled={isSubmitting}
                    >
                      등록
                    </button>
                  </form>

                  <div className={styles.commentList}>
                    {selectedPost.comments?.map((c: any) => (
                      <div key={c.id} className={styles.commentItem}>
                        <div className={styles.commentContentRow}>
                          <div className={styles.commentMain}>
                            <span className={styles.commentAuthor}>
                              {c.user?.nickname || '익명'}
                            </span>
                            <p className={styles.commentText}>{c.content}</p>
                          </div>
                          {userId === c.user?.id && (
                            <button
                              className={styles.deleteTextBtn}
                              onClick={() =>
                                setDeleteTarget({ type: 'comment', id: c.id })
                              }
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {activeView === 'write' && (
        <>
          <div className={styles.header}>
            <h2>📝 새 게시글 작성</h2>
          </div>
          <form className={styles.writeForm} onSubmit={handlePostSubmit}>
            <input
              placeholder="제목을 입력하세요"
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="프로젝트 진행 상황이나 공지사항을 공유해 주세요."
              className={styles.contentInput}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setActiveView('list')}
              >
                취소
              </button>
              <button type="submit" className={styles.submitBtn}>
                등록하기
              </button>
            </div>
          </form>
        </>
      )}

      {activeView === 'list' && (
        <>
          <div className={styles.header}>
            <h2>📋 팀 게시판</h2>
            <button
              className={styles.writeBtn}
              onClick={() => {
                setTitle('');
                setContent('');
                setActiveView('write');
              }}
            >
              글쓰기
            </button>
          </div>
          {isLoading ? (
            <Loading />
          ) : (
            <div className={styles.boardList}>
              <div className={styles.tableHeader}>
                <div>작성자</div>
                <div className={styles.flex2}>제목</div>
                <div>작성일</div>
              </div>
              {posts.length === 0 ? (
                <div className={styles.emptyState}>
                  등록된 게시글이 없습니다.
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className={styles.postItem}
                    onClick={() => handleViewDetail(post.id)}
                  >
                    <div className={styles.postAuthor}>
                      {post.user?.nickname || '익명'}
                    </div>
                    <div className={`${styles.postTitle} ${styles.flex2}`}>
                      {post.title}
                    </div>
                    <div className={styles.postDate}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
