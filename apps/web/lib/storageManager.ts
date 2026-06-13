/**
 * Storage Quota Manager
 *
 * Industry-standard tiered storage model (inspired by Webflow, Notion, Netlify):
 * - Enforces per-tenant upload quotas based on subscription plan
 * - Tracks usage in LocalDb
 * - Provides human-readable usage stats for UI display
 */

export type PlanId = 'free' | 'starter' | 'growth' | 'scale' | 'enterprise';

// ─── Tier definitions ─────────────────────────────────────────────────────────
export const STORAGE_TIERS: Record<PlanId, { label: string; bytes: number; color: string }> = {
  free: {
    label: 'Free',
    bytes: 50 * 1024 * 1024,       // 50 MB
    color: '#6b7280',
  },
  starter: {
    label: 'Starter',
    bytes: 500 * 1024 * 1024,      // 500 MB
    color: '#6366f1',
  },
  growth: {
    label: 'Growth',
    bytes: 2 * 1024 * 1024 * 1024, // 2 GB
    color: '#10b981',
  },
  scale: {
    label: 'Scale',
    bytes: 10 * 1024 * 1024 * 1024, // 10 GB
    color: '#f59e0b',
  },
  enterprise: {
    label: 'Enterprise',
    bytes: Number.MAX_SAFE_INTEGER,   // Unlimited
    color: '#ec4899',
  },
};

export interface StorageStatus {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  percentUsed: number;
  isUnlimited: boolean;
  canUpload: boolean;      // true if there's space remaining
  tier: PlanId;
  tierLabel: string;
  color: string;
}

/**
 * Calculate storage status for a tenant.
 */
export function getStorageStatus(
  usedBytes: number,
  planId: string
): StorageStatus {
  const tier = (planId as PlanId) in STORAGE_TIERS ? (planId as PlanId) : 'free';
  const { bytes: limitBytes, label: tierLabel, color } = STORAGE_TIERS[tier];
  const isUnlimited = limitBytes === Number.MAX_SAFE_INTEGER;

  const remainingBytes = isUnlimited ? Number.MAX_SAFE_INTEGER : Math.max(0, limitBytes - usedBytes);
  const percentUsed = isUnlimited ? 0 : Math.min(100, (usedBytes / limitBytes) * 100);
  const canUpload = isUnlimited || usedBytes < limitBytes;

  return {
    usedBytes,
    limitBytes,
    remainingBytes,
    percentUsed,
    isUnlimited,
    canUpload,
    tier,
    tierLabel,
    color,
  };
}

/**
 * Check if a new upload of `newFileBytes` would exceed the storage quota.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export function checkUploadAllowed(
  currentUsedBytes: number,
  newFileBytes: number,
  planId: string
): { allowed: boolean; reason?: string } {
  const tier = (planId as PlanId) in STORAGE_TIERS ? (planId as PlanId) : 'free';
  const { bytes: limitBytes, label } = STORAGE_TIERS[tier];

  if (limitBytes === Number.MAX_SAFE_INTEGER) {
    return { allowed: true };
  }

  if (currentUsedBytes + newFileBytes > limitBytes) {
    const remaining = limitBytes - currentUsedBytes;
    const needed = newFileBytes - remaining;
    return {
      allowed: false,
      reason: `Storage limit reached for ${label} plan. Need ${formatStorageBytes(needed)} more space. Upgrade your plan to continue uploading.`,
    };
  }

  return { allowed: true };
}

/** Format bytes into human-readable string */
export function formatStorageBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes === Number.MAX_SAFE_INTEGER) return 'Unlimited';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Get color class based on usage percentage */
export function getUsageColor(percent: number): string {
  if (percent >= 95) return '#ef4444'; // red — critical
  if (percent >= 80) return '#f59e0b'; // amber — warning
  if (percent >= 60) return '#6366f1'; // indigo — moderate
  return '#10b981';                    // green — healthy
}
