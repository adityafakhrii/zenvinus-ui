import Link from 'next/link';
import { useT } from '@/i18n';
import type { Tone } from '../../data/tasks';
import type { ReviewSubmission, SubmissionStatus } from '../../types/review';

/**
 * Review-mode banner: pinned above the studio topbar, tells the reviewer
 * exactly which submission they are deciding on — id, contributor, items,
 * current status — and links back to the queue.
 */
const statusTone: Readonly<Record<SubmissionStatus, Tone>> = {
  'PENDING REVIEW': 'amber',
  'IN REVIEW': 'blue',
  'REVISION REQUIRED': 'orange',
  ESCALATED: 'purple',
  APPROVED: 'mint',
  REJECTED: 'red',
};

export interface ReviewBannerProps {
  review: ReviewSubmission;
  reviewerName: string;
  rubric: string;
}

const ReviewBanner = ({ review, reviewerName, rubric }: ReviewBannerProps) => {
  const { t } = useT();
  return (
    <div className="tflow-review-banner">
      <div className="tflow-review-banner-main">
        <span className="tflow-review-banner-tag">
          <i className="fa-solid fa-shield-halved"></i> {t('Review Mode')}
        </span>
        <span className="tflow-review-banner-title" title={review.task}>
          {review.task}
        </span>
        <span className="tflow-review-banner-meta">
          {review.id} · {t(review.taskType)} · {t('{count} items', { count: review.items })} ·{' '}
          {t('submitted by {name} on {date}', { name: <strong>{review.contributor}</strong>, date: review.submitted })}
        </span>
        <span className={`edash-status edash-status-${statusTone[review.status] || 'blue'}`}>{t(review.status)}</span>
      </div>
      <div className="tflow-review-banner-side">
        <span className="tflow-review-banner-reviewer" title={t('Decisions are recorded under your name')}>
          <i className="fa-regular fa-user"></i> {reviewerName} · {rubric}
        </span>
        <Link href="/dashboard?as=expert" className="tflow-review-banner-back">
          <i className="fa-solid fa-angle-left"></i> {t('Back to queue')}
        </Link>
      </div>
    </div>
  );
};

export default ReviewBanner;
