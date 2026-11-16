/**
 * Help topics and answers for /dashboard/support. Every answer describes how the app works today (taken from the
 * project request flow, payment, reward and team screens); update it when those screens change.
 * Text is English and is the i18n key; Indonesian is in src/i18n/id/support.ts.
 */
export const SUPPORT_TOPICS = [
  { key: 'start', label: 'Getting started', icon: 'fa-solid fa-flag-checkered' },
  { key: 'projects', label: 'Projects & payments', icon: 'fa-solid fa-diagram-project' },
  { key: 'tasks', label: 'Tasks & rewards', icon: 'fa-solid fa-list-check' },
  { key: 'datasets', label: 'Datasets & Studio', icon: 'fa-solid fa-database' },
  { key: 'account', label: 'Account & team', icon: 'fa-solid fa-user-gear' },
] as const;

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]['key'];

export interface FaqItem {
  id: string;
  topic: SupportTopic;
  question: string;
  answer: string;
  /** A page that answers the question further */
  link?: { href: string; label: string };
}

export const FAQ: readonly FaqItem[] = [
  {
    id: 'sign-in',
    topic: 'start',
    question: 'How do I sign in?',
    answer:
      'With a one-time code sent to your email, or with Google or GitHub. There is no password. If the code does not arrive, check your spam folder and use "Resend" on the sign-in page.',
  },
  {
    id: 'workspaces',
    topic: 'start',
    question: 'What are the Enterprise, Community, Internal and Expert workspaces?',
    answer:
      'Each one is a dashboard for a different job: companies order data, contributors work on tasks, the Zenvinus team handles requests, and experts review submissions. Switch with the Workspace bar under the main menu.',
  },
  {
    id: 'language',
    topic: 'start',
    question: 'How do I change the language?',
    answer: 'Use the ID / EN picker in the header. Your choice is saved in this browser.',
  },
  {
    id: 'request-flow',
    topic: 'projects',
    question: 'What happens after I submit a project request?',
    answer:
      'The Zenvinus team reviews it, usually within 1–2 business days, and attaches a proposal with the scope and the price. You can follow every status on the project page.',
    link: { href: '/dashboard/projects', label: 'Open projects' },
  },
  {
    id: 'payment-terms',
    topic: 'projects',
    question: 'When do I pay?',
    answer:
      'In two parts: a 50% down payment after you accept the proposal, which starts the work, and the remaining 50% when the work is done, which unlocks full delivery.',
  },
  {
    id: 'payment-methods',
    topic: 'projects',
    question: 'Which payment methods can I use?',
    answer: 'BCA virtual account, credit card (Visa / Mastercard), e-wallet (GoPay, OVO, DANA) and QRIS.',
  },
  {
    id: 'invoices',
    topic: 'projects',
    question: 'Where can I find my invoices?',
    answer: 'On the Billing page, together with your payment methods.',
    link: { href: '/dashboard/billing', label: 'Open billing' },
  },
  {
    id: 'start-tasks',
    topic: 'tasks',
    question: 'How do I start working on a task?',
    answer:
      'Open Find Tasks, choose a task, read its guidelines and join. Some tasks ask for a short qualification first.',
    link: { href: '/dashboard/tasks', label: 'Find tasks' },
  },
  {
    id: 'quality',
    topic: 'tasks',
    question: 'When does my work count?',
    answer: 'Every submitted item goes through a quality check. Only approved items count toward your reward.',
  },
  {
    id: 'payout',
    topic: 'tasks',
    question: 'How do I get paid?',
    answer:
      'On the reward page, choose bank transfer (BCA, BNI, Mandiri; 1–2 business days), e-wallet (GoPay, OVO, DANA) or crypto (USDT on TRC-20).',
  },
  {
    id: 'expert-ledger',
    topic: 'tasks',
    question: 'How do expert rewards work?',
    answer:
      'An approved review enters your ledger as Pending and becomes Available in the next payout cycle, on the 1st of each month. You cannot review your own submissions.',
  },
  {
    id: 'license',
    topic: 'datasets',
    question: 'Can I use a dataset in my product?',
    answer: 'Check the license on the dataset page before you download it: the license decides how you may use the data.',
    link: { href: '/dashboard/datasets', label: 'Browse datasets' },
  },
  {
    id: 'studio-access',
    topic: 'datasets',
    question: 'Why can\'t I open the Dataset Studio?',
    answer:
      'The Studio is only available to accounts with dataset access. Ask your workspace owner, or send us a request below.',
  },
  {
    id: 'invite',
    topic: 'account',
    question: 'How do I invite a teammate?',
    answer: 'On the Team page, use Invite Member and choose a role: Owner, Admin, Reviewer or Annotator.',
    link: { href: '/dashboard/team', label: 'Open team' },
  },
  {
    id: 'company-details',
    topic: 'account',
    question: 'Where do I change company details or notifications?',
    answer: 'In Settings: company profile, notifications and security.',
    link: { href: '/dashboard/settings', label: 'Open settings' },
  },
];
