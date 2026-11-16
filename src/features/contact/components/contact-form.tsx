import React, { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button, CustomSelect, TextInput, Textarea } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { useT } from '@/i18n';

const TOPICS = [
  'Custom dataset project',
  'Data annotation',
  'A dataset or model in the catalog',
  'Joining as a contributor or expert',
  'Partnership',
  'Something else',
] as const;

export interface ContactFormProps {
  /** Destination contact email address. */
  email: string;
}

/**
 * Contact message form powered completely by custom UI Kit inputs & CustomSelect (no native <select>).
 */
const ContactForm = ({ email }: ContactFormProps) => {
  const { t } = useT();
  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const topicOptions: SelectOption[] = useMemo(
    () => TOPICS.map((item) => ({ value: item, label: t(item) })),
    [t],
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const chosenTopic = topic || TOPICS[0];
    const header = [
      `Name: ${name}`,
      `Email: ${senderEmail}`,
      phone && `Phone: ${phone}`,
      company && `Company: ${company}`,
      `Topic: ${chosenTopic}`,
    ].filter(Boolean);
    const subject = `[Zenvinus] ${chosenTopic} - ${name}`;
    const body = `${header.join('\n')}\n\n${message}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput
          label={`${t('Name')} *`}
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextInput
          label={`${t('Email')} *`}
          name="email"
          type="email"
          autoComplete="email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          required
        />
        <TextInput
          label={t('Phone')}
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextInput
          label={t('Company or institution')}
          name="company"
          type="text"
          autoComplete="organization"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <CustomSelect
        label={`${t('What is it about?')} *`}
        value={topic}
        onChange={setTopic}
        options={topicOptions}
        placeholder={t('Choose a topic')}
      />

      <Textarea
        label={`${t('Message')} *`}
        name="message"
        rows={5}
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('For a data project: the kind of data, the language, and roughly how much you need.')}
      />

      <div className="mt-1 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          size="md"
          rightIcon={<Send className="h-4 w-4" strokeWidth={1.6} />}
        >
          {t('Send Message')}
        </Button>
        <span className="text-xs text-ink-muted">
          {t('This opens your email app with the message filled in.')}
        </span>
      </div>

      {sent && (
        <p
          role="status"
          className="m-0 rounded-xl border border-teal-ink/25 bg-tint-mint px-4 py-3 text-xs font-medium text-teal-ink"
        >
          {t('If your email app did not open, write to us directly at {email}.', { email })}
        </p>
      )}
    </form>
  );
};

export default ContactForm;
