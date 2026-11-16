import Link from 'next/link';
import { ChevronLeft, ShieldCheck, User } from 'lucide-react';
import { useT } from '@/i18n';
import { Badge, type BadgeTone } from '@/components/ui';
import type { ReviewSubmission, SubmissionStatus } from '../../types/review';

/**
 * Review-mode banner: pinned above the studio topbar, tells the reviewer
 * exactly which submission they are deciding on — id, contributor, items,
 * current status — and links back to the queue.
 */
const statusTone: Readonly<Record<SubmissionStatus, BadgeTone>> = {
  'PENDING REVIEW': 'amber',
  'IN REVIEW': 'blue',
  'REVISION REQUIRED': 'orange',
  ESCALATED: 'red',
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEAEA] border-l-4 border-l-[#132B45] bg-[#F8FAFC] px-4 py-2 text-xs text-[#52525B] sm:px-5">
      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
        <Badge tone="blue" className="gap-1.5 font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-[#00B2A9]" strokeWidth={1.75} />
          {t('Review Mode')}
        </Badge>
        <span className="max-w-[260px] truncate font-semibold text-[#18181B]" title={review.task}>
          {review.task}
        </span>
        <span className="text-[#6B7280]">
          {review.id} · {t(review.taskType)} · {t('{count} items', { count: review.items })} ·{' '}
          {t('submitted by {name} on {date}', {
            name: <strong className="font-semibold text-[#18181B]">{review.contributor}</strong>,
            date: review.submitted,
          })}
        </span>
        <Badge tone={statusTone[review.status] || 'blue'} dot>
          {t(review.status)}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <span
          className="inline-flex items-center gap-1.5 text-[#6B7280]"
          title={t('Decisions are recorded under your name')}
        >
          <User className="h-3.5 w-3.5" strokeWidth={1.6} />
          {reviewerName} · <span className="font-mono">{rubric}</span>
        </span>
        <Link
          href="/dashboard?as=expert"
          className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-[#18181B] transition-colors hover:border-[#132B45]/30 hover:bg-[#F3F4F6]"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          {t('Back to queue')}
        </Link>
      </div>
    </div>
  );
};

export default ReviewBanner;
