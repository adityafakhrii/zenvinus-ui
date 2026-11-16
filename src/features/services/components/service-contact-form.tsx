import React, { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button, CustomSelect, TextInput, Textarea } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { useT } from '@/i18n';
import SERVICES_CATALOG from '../data/our-service-data';

/**
 * Custom Tailwind service inquiry widget for the /service-details left rail.
 */
const ServiceContactForm = () => {
  const { t } = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState<string>(SERVICES_CATALOG[0].slug);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const options: SelectOption[] = useMemo(
    () => SERVICES_CATALOG.map((s) => ({ value: s.slug, label: t(s.title) })),
    [t],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <TextInput
        label={t('Name')}
        placeholder={t('Your Name*')}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSubmitted(false);
        }}
        required
      />
      <TextInput
        label={t('Email')}
        type="email"
        placeholder={t('Email Address*')}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setSubmitted(false);
        }}
        required
      />
      <CustomSelect
        label={t('Service Type')}
        value={serviceType}
        onChange={setServiceType}
        options={options}
      />
      <Textarea
        label={t('Message')}
        rows={3}
        placeholder={t('Enter Your Message here')}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        block
        rightIcon={<Send className="h-4 w-4" strokeWidth={1.6} />}
      >
        {t('Send Message')}
      </Button>
      {submitted && (
        <p
          role="status"
          className="m-0 rounded-xl border border-teal-ink/25 bg-tint-mint px-3.5 py-2.5 text-xs font-medium text-teal-ink"
        >
          {t('Inquiry noted — our solutions team will reply via email within 1–2 business days.')}
        </p>
      )}
    </form>
  );
};

export default ServiceContactForm;
