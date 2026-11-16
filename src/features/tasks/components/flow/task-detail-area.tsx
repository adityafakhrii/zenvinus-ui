import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTaskBySlug, joinTask, leaveTask } from '../../services/tasks-api';
import { taskSlugOf } from '../../hooks/use-task-route';
import { ApiError } from '@/services/api';
import { difficultyTone, TASK_TYPES } from '../../data/tasks';
import { useAuth } from '@/features/auth';
import { useT } from '@/i18n';
import Button from '@/components/ui/button';

function renderInstructions(markdown: string) {
  if (!markdown) return null;
  const blocks = markdown.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const b = block.trim();
    if (!b) return null;
    if (b.startsWith('### ')) return <h5 key={i} className="tflow-subtitle">{b.slice(4)}</h5>;
    if (b.startsWith('## ')) return <h4 key={i} className="tflow-subtitle">{b.slice(3)}</h4>;
    if (b.startsWith('# ')) return <h3 key={i} className="tflow-subtitle">{b.slice(2)}</h3>;
    if (/^[-*] /m.test(b)) {
      const items = b.split('\n').filter((l) => /^[-*] /.test(l.trim())).map((l) => l.trim().slice(2));
      return (
        <ul key={i} className="tflow-checklist">
          {items.map((it, j) => <li key={j}><i className="fa-solid fa-circle-check"></i> {it}</li>)}
        </ul>
      );
    }
    return <p key={i} className="tflow-desc">{b}</p>;
  });
}

const TaskDetailArea = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t, locale } = useT();
  const [actionError, setActionError] = useState('');

  const slug = router.isReady ? taskSlugOf(router.query.task) : null;

  const { data: task, isLoading, isError, error } = useQuery({
    queryKey: ['task', slug],
    queryFn: () => fetchTaskBySlug(slug ?? ''),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  const joinMutation = useMutation({
    mutationFn: () => {
      // The join button only renders once the task has loaded
      if (!task) return Promise.reject(new Error(t('Action failed.')));
      return task.joined ? leaveTask(task.id) : joinTask(task.id);
    },
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['task', slug] });
    },
    onError: (err: Error) => setActionError(err.message || t('Action failed.')),
  });

  const handleJoin = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    joinMutation.mutate();
  };

  if (!router.isReady || isLoading) {
    return <div className="tflow-loading"><span className="spinner-border"></span></div>;
  }

  if (isError || !task) {
    return (
      <section className="tflow-area pt-40 pb-120">
        <div className="container">
          <p className="pf2-empty">
            {error instanceof ApiError && error.status === 404
              ? t('Task not found.')
              : t('Task not found ({reason}).', { reason: error?.message || t('load failed') })}{' '}
            <Link href="/tasks">{t('Back to Task List')}</Link>
          </p>
        </div>
      </section>
    );
  }

  const meta = TASK_TYPES[task.type];
  const joinable = task.status === 'OPEN' || task.status === 'ACTIVE';

  return (
    <section className="tflow-area pt-40 pb-120">
      <div className="container">
        <div className="tflow-detail-hero tflow-panel">
          <div className="tflow-detail-hero-main">
            <div className="tflow-detail-badges">
              <span className={`tflow-type-badge tflow-tone-${meta.tone}`}>
                <i className={meta.icon}></i> {t('{type} workspace', { type: t(meta.label) })}
              </span>
              <span className="tflow-badge-soft">
                <i className={`pf2-diff-dot pf2-diff-${difficultyTone[task.difficulty]}`}></i> {t(task.difficulty)}
              </span>
              <span className="tflow-badge-soft">
                <i className="fa-solid fa-circle-info"></i> {t(task.statusLabel)}
              </span>
            </div>
            <h2 className="tflow-title">{task.title}</h2>
            <p className="tflow-desc">{task.desc}</p>
            <div className="tflow-meta-row">
              {task.unit && <span><i className="fa-regular fa-image"></i> {task.unit}</span>}
              {task.daysLeft !== null && <span><i className="fa-regular fa-clock"></i> {t('{count} days left', { count: task.daysLeft })}</span>}
              {task.organization && <span><i className="fa-regular fa-building"></i> {task.organization}</span>}
              <span><i className="fa-solid fa-users"></i> {t('{count} contributors', { count: task.contributors.toLocaleString(locale) })}</span>
            </div>
          </div>
          <div className="tflow-detail-hero-side">
            <div className="tflow-price-card">
              <div className="tflow-price-main">
                <strong>Rp {task.price.toLocaleString(locale)}</strong>
                <span>{t('/ per task')}</span>
              </div>
              <ul className="tflow-price-list">
                {task.bonus > 0 && <li><i className="fa-solid fa-coins"></i> {t('Bonus up to Rp {amount}', { amount: task.bonus.toLocaleString(locale) })}</li>}
                <li><i className="fa-solid fa-users"></i> {t('{count} contributors joined', { count: task.contributors.toLocaleString(locale) })}</li>
              </ul>
              {joinable ? (
                task.joined ? (
                  <Button className="tflow-btn" onClick={handleJoin} disabled={joinMutation.isPending}>
                    {joinMutation.isPending ? t('Processing…') : t('Leave Task')}
                  </Button>
                ) : (
                  <Button className="tflow-btn" onClick={handleJoin} disabled={joinMutation.isPending}>
                    {joinMutation.isPending ? t('Joining…') : t('Join Task')} <i className="fa-solid fa-arrow-right"></i>
                  </Button>
                )
              ) : (
                <span className="pf2-join" style={{ opacity: 0.5 }}>{t('Closed')}</span>
              )}
              {actionError && <p className="pf2-empty" style={{ color: '#dc3545' }}>{actionError}</p>}
              {!user && joinable && (
                <p className="pf2-empty">{t('You need to {link} to join.', { link: <Link href={`/login?next=${encodeURIComponent(router.asPath)}`}>{t('sign in')}</Link> })}</p>
              )}
            </div>
          </div>
        </div>

        <div className="tflow-detail-cols">
          <div className="tflow-detail-main">
            <div className="tflow-panel">
              <h4 className="tflow-subtitle"><i className="fa-solid fa-book-open"></i> {t('Instructions')}</h4>
              {task.instructions ? renderInstructions(task.instructions) : (
                <p className="tflow-desc">{task.desc}</p>
              )}
            </div>

            <div className="tflow-panel">
              <h4 className="tflow-subtitle"><i className="fa-solid fa-laptop-code"></i> {t('How the workspace works')}</h4>
              <p className="tflow-desc">
                {t('The {name} workspace is picked automatically from the {field} sent by the backend — you do not need to choose any tool.', {
                  name: <strong>{t(meta.label)}</strong>,
                  field: <code>dataType</code>,
                })}{' '}{t(meta.desc)}
              </p>
            </div>
          </div>

          <aside className="tflow-detail-aside">
            <div className="tflow-panel">
              <h4 className="tflow-subtitle"><i className="fa-solid fa-tags"></i> {t('Tags')}</h4>
              <div className="tflow-tags">
                {task.tags.length > 0
                  ? task.tags.map((tag) => <span key={tag} className="pf2-tag">{tag}</span>)
                  : <span className="pf2-tag">{task.dataType}</span>}
              </div>
            </div>
            <div className="tflow-panel">
              <h4 className="tflow-subtitle"><i className="fa-solid fa-chart-line"></i> {t('Statistics')}</h4>
              <div className="tflow-stat-grid">
                <div className="tflow-stat"><strong>{task.contributors.toLocaleString(locale)}</strong><span>{t('contributors')}</span></div>
                {task.quantity && <div className="tflow-stat"><strong>{task.quantity.toLocaleString(locale)}</strong><span>{task.unit || t('items')}</span></div>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default TaskDetailArea;
