'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  useFieldErrors,
  type FieldErrorMap,
} from '@/components/ui/useFieldErrors';
import {
  fetchTransmitLogs,
  postTransmitLog,
  transmitKeys,
} from '@/lib/transmit/client';
import { getNodeId, setNodeId } from '@/lib/transmit/nodeIdentity';
import { useT } from '@/lib/langContext';

type TransmitField = 'handle' | 'message';

export function useTransmit() {
  const t = useT();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [handle, setHandle] = useState(() => getNodeId());
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const {
    fieldErrors,
    setFieldErrors,
    clearFieldError,
    showFieldErrors,
  } = useFieldErrors<TransmitField>('transmit');
  const [formError, setFormError] = useState('');
  const idempotencyKeyRef = useRef<string | null>(null);

  const {
    data: logPage,
    isLoading: isInitialLoad,
    isFetching,
    isError: isLogError,
    refetch,
  } = useQuery({
    queryKey: transmitKeys.list(currentPage),
    queryFn: () => fetchTransmitLogs(currentPage),
    placeholderData: keepPreviousData,
  });

  const { mutate: submitLog, isPending: isSubmitting } = useMutation({
    mutationFn: postTransmitLog,
    onSuccess: () => {
      setMessage('');
      setFieldErrors({});
      setFormError('');
      setSent(true);
      idempotencyKeyRef.current = null;
      setCurrentPage(1);
      queryClient.invalidateQueries({ queryKey: transmitKeys.all });
      setTimeout(() => setSent(false), 2500);
    },
    onError: (mutationError) => {
      const errorKey = mutationError instanceof Error ? mutationError.message : '';
      if (errorKey === 'MESSAGE_TOO_LONG') {
        showFieldErrors({ message: t.transmit.errors.tooLong });
      } else if (errorKey === 'HANDLE_REQUIRED' || errorKey === 'MESSAGE_REQUIRED') {
        showFieldErrors({
          [errorKey === 'HANDLE_REQUIRED' ? 'handle' : 'message']:
            t.transmit.errors.required,
        });
      } else {
        setFormError(t.transmit.errors.failed);
      }
    },
  });

  const handleHandleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHandle(event.target.value);
    setNodeId(event.target.value);
    idempotencyKeyRef.current = null;
    clearFieldError('handle');
  };

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    idempotencyKeyRef.current = null;
    clearFieldError('message');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const errors: FieldErrorMap<TransmitField> = {};
    if (!handle.trim()) errors.handle = t.transmit.errors.required;
    if (!message.trim()) errors.message = t.transmit.errors.required;
    else if (message.length > 280) errors.message = t.transmit.errors.tooLong;

    if (Object.keys(errors).length > 0) {
      setFormError('');
      showFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError('');
    idempotencyKeyRef.current ??= crypto.randomUUID().replaceAll('-', '');
    submitLog({
      handle: handle.trim(),
      message: message.trim(),
      idempotencyKey: idempotencyKeyRef.current,
    });
  };

  const { logs = [], total = 0, totalPages = 1 } = logPage ?? {};

  return {
    t,
    currentPage,
    handle,
    message,
    sent,
    fieldErrors,
    formError,
    logs,
    total,
    totalPages,
    isInitialLoad,
    isFetching,
    isLogError,
    isSubmitting,
    handleHandleChange,
    handleMessageChange,
    handleSubmit,
    retryLogs: () => void refetch(),
    showPreviousPage: () => setCurrentPage(page => page - 1),
    showNextPage: () => setCurrentPage(page => page + 1),
  };
}
