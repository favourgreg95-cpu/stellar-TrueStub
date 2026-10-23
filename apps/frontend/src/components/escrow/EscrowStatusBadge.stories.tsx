import type { Meta, StoryObj } from '@storybook/react';
import { EscrowStatusBadge } from './EscrowStatusBadge';

// Mock the polling hook so Storybook doesn't make live network calls.
jest.mock('./hook/useEscrowStatus', () => ({
  useEscrowStatus: jest.fn(),
  getEscrowStatusString: (escrow: { status?: string } | null) =>
    escrow?.status ?? 'unknown',
  getStatusVariant: (status: string) => {
    const s = status.toLowerCase();
    if (s === 'released' || s === 'completed') return 'default';
    if (s === 'indispute' || s === 'disputed' || s === 'cancelled') return 'destructive';
    return 'outline';
  },
  formatStatus: (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1),
}));

const meta: Meta<typeof EscrowStatusBadge> = {
  title: 'Escrow/EscrowStatusBadge',
  component: EscrowStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [
        'PENDING',
        'ACTIVE',
        'FUNDED',
        'COMPLETED',
        'RELEASED',
        'DISPUTED',
        'IN_DISPUTE',
        'RESOLVED',
        'CANCELLED',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EscrowStatusBadge>;

// ── Static mode ─────────────────────────────────────────────────────────────

export const Pending: Story = { args: { status: 'PENDING' } };

export const Funded: Story = { args: { status: 'FUNDED' } };

export const Released: Story = { args: { status: 'RELEASED' } };

export const InDispute: Story = { args: { status: 'in_dispute' } };

export const Resolved: Story = { args: { status: 'RESOLVED' } };

export const Cancelled: Story = { args: { status: 'CANCELLED' } };

/** Unrecognised statuses fall back to a neutral badge showing the raw value. */
export const UnknownStatus: Story = { args: { status: 'awaiting_review' } };

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {['PENDING', 'ACTIVE', 'FUNDED', 'COMPLETED', 'RELEASED', 'DISPUTED', 'RESOLVED', 'CANCELLED'].map(
        (status) => (
          <EscrowStatusBadge key={status} status={status} />
        ),
      )}
    </div>
  ),
};

// ── Polling mode ─────────────────────────────────────────────────────────────

export const Polling: Story = {
  args: {
    escrowId: 'CONTRACT_ID',
    signer: 'WALLET_ADDRESS',
  },
};

export const PollingLoading: Story = {
  args: {
    escrowId: 'CONTRACT_ID',
    signer: 'WALLET_ADDRESS',
    showLoading: true,
  },
};
