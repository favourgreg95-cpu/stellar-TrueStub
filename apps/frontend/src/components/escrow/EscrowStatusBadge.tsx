'use client';

/**
 * EscrowStatusBadge Component
 *
 * A unified status badge that supports two modes:
 *
 * 1. **Static mode** — pass a `status` string and the badge renders
 *    immediately using the presentational styling from the former
 *    `dashboard/EscrowStatusBadge`. No polling, no hooks. Use this when
 *    you already know the status (e.g. from mock data or a list view).
 *
 * 2. **Polling mode** — pass `escrowId` (contract ID) and `signer`
 *    (wallet address) and the badge polls the on-chain escrow indexer
 *    at the given interval, updating automatically. Use this for
 *    detail views where live status matters.
 *
 * Issue #368 consolidated the former `dashboard/EscrowStatusBadge`
 * (static) and `escrow/EscrowStatusBadge` (polling) into this single
 * component.
 *
 * @example Static mode
 * ```tsx
 * <EscrowStatusBadge status="FUNDED" />
 * ```
 *
 * @example Polling mode
 * ```tsx
 * <EscrowStatusBadge
 *   escrowId="CONTRACT_ID"
 *   signer="WALLET_ADDRESS"
 *   refetchInterval={30000}
 * />
 * ```
 */

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  useEscrowStatus,
  getEscrowStatusString,
  getStatusVariant,
  formatStatus,
} from './hook/useEscrowStatus';

interface EscrowStatusBadgeProps {
  /** Direct status string — renders immediately without polling (static mode) */
  status?: string;
  /** Contract ID for on-chain status polling (polling mode) */
  escrowId?: string;
  /** Wallet address of the signer (polling mode) */
  signer?: string;
  /** Refetch interval in ms (polling mode, default 30000) */
  refetchInterval?: number;
  /** Validate on-chain (polling mode, default true) */
  validateOnChain?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Show loading indicator (polling mode, default true) */
  showLoading?: boolean;
}

/**
 * Presentational status configuration for static mode.
 * Mirrors the former `dashboard/EscrowStatusBadge` styling.
 */
const statusConfig: Record<string, { className: string; icon: string; text: string }> = {
  PENDING: {
    className:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    icon: '🟡',
    text: 'Pending',
  },
  ACTIVE: {
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    icon: '🟢',
    text: 'Active',
  },
  FUNDED: {
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    icon: '🟢',
    text: 'Funded',
  },
  COMPLETED: {
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    icon: '🔵',
    text: 'Completed',
  },
  RELEASED: {
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    icon: '🔵',
    text: 'Released',
  },
  DISPUTED: {
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    icon: '🔴',
    text: 'Disputed',
  },
  INDISPUTE: {
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    icon: '🔴',
    text: 'In Dispute',
  },
  RESOLVED: {
    className:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    icon: '⚖️',
    text: 'Resolved',
  },
  CANCELLED: {
    className:
      'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    icon: '⚪',
    text: 'Cancelled',
  },
};

/**
 * Unified escrow status badge component supporting both static and
 * polling modes (issue #368).
 */
export function EscrowStatusBadge({
  status,
  escrowId,
  signer,
  refetchInterval = 30000,
  validateOnChain = true,
  className = '',
  showLoading = true,
}: EscrowStatusBadgeProps) {
  // ── Static mode ──────────────────────────────────────────────────────────
  // When a `status` prop is provided, render immediately without polling.
  if (status !== undefined) {
    const normalizedKey = status.toUpperCase().replace(/[_\s-]/g, '');
    const config =
      statusConfig[normalizedKey] ||
      statusConfig[status.toUpperCase()] || {
        className:
          'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
        icon: 'ℹ️',
        text: status,
      };

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
          config.className,
          className,
        )}
      >
        <span className="text-xs">{config.icon}</span>
        {config.text}
      </span>
    );
  }

  // ── Polling mode ─────────────────────────────────────────────────────────
  // When `escrowId` and `signer` are provided, poll on-chain status.
  const {
    data: escrow,
    isLoading,
    error,
  } = useEscrowStatus({
    contractId: escrowId ?? '',
    signer: signer ?? '',
    refetchInterval,
    validateOnChain,
  });

  // Handle loading state
  if (isLoading && showLoading) {
    return (
      <Badge variant="outline" className={className}>
        <span className="flex items-center gap-1">
          <span className="animate-pulse">Loading...</span>
        </span>
      </Badge>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Badge variant="destructive" className={className}>
        Error
      </Badge>
    );
  }

  // Get the status string and variant
  const resolvedStatus = getEscrowStatusString((escrow as any) ?? null);
  const variant = getStatusVariant(resolvedStatus);
  const formattedStatus = formatStatus(resolvedStatus);

  return (
    <Badge variant={variant} className={className}>
      <span className="flex items-center gap-1">
        <StatusIcon status={resolvedStatus} />
        {formattedStatus}
      </span>
    </Badge>
  );
}

/**
 * Status icon component for polling mode.
 */
function StatusIcon({ status }: { status: string }) {
  const statusLower = status.toLowerCase();

  // Success states
  if (statusLower === 'released' || statusLower === 'completed') {
    return (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  }

  // In progress states
  if (
    statusLower === 'working' ||
    statusLower === 'pending' ||
    statusLower === 'funded' ||
    statusLower === 'pendingrelease'
  ) {
    return (
      <svg
        className="w-3 h-3 animate-spin"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    );
  }

  // Dispute/error states
  if (
    statusLower === 'indispute' ||
    statusLower === 'disputed' ||
    statusLower === 'cancelled' ||
    statusLower === 'failed'
  ) {
    return (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );
  }

  // Default/unknown state
  return (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
