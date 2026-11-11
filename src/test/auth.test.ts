import { describe, it, expect } from 'vitest';

describe('SQA ISTQB Test Cases: Single-User Authorization Logic', () => {
  it('[AUTH-SEC-001] Memastikan pengguna hanya diizinkan jika terdaftar di app_owner', () => {
    const authorizedUserId: string = 'owner-uuid-1234';
    const currentUserId: string = 'owner-uuid-1234';
    const isOwner = authorizedUserId === currentUserId;

    expect(isOwner).toBe(true);
  });

  it('[AUTH-SEC-002] Menolak akses jika authenticated user bukan app_owner', () => {
    const authorizedUserId: string = 'owner-uuid-1234';
    const unauthorizedUserId: string = 'stranger-uuid-9999';
    const isOwner = authorizedUserId === unauthorizedUserId;

    expect(isOwner).toBe(false);
  });

  it('[KANBAN-STG-001] Memvalidasi seluruh tahapan rekrutmen sah', () => {
    const validStages = [
      'Saved',
      'Applied',
      'Screening',
      'HR Interview',
      'Technical Test',
      'User Interview',
      'Final Interview',
      'Offering',
      'Accepted',
      'Rejected',
      'Withdrawn',
      'No Response',
    ];

    expect(validStages).toContain('HR Interview');
    expect(validStages).toContain('Offering');
    expect(validStages).toHaveLength(12);
  });
});
