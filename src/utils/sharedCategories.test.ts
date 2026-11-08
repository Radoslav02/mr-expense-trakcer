import { describe, expect, it } from 'vitest';
import type { Category } from '@/types/category';
import { isEmptyPlan, planCategorySync } from './sharedCategories';

const OLD = '1970-01-01T00:00:00.000Z';
const T1 = '2026-11-01T10:00:00.000Z';
const T2 = '2026-11-02T10:00:00.000Z';

const cat = (overrides: Partial<Category> & Pick<Category, 'id'>): Category => ({
  name: overrides.id,
  color: '#000',
  isDefault: false,
  sharedKey: overrides.id,
  updatedAt: OLD,
  ...overrides,
});

describe('planCategorySync', () => {
  it('does nothing when both lists already match', () => {
    const mine = [cat({ id: 'default-food', name: 'Food' })];
    const theirs = [cat({ id: 'default-food', name: 'Food' })];
    expect(isEmptyPlan(planCategorySync(mine, theirs))).toBe(true);
  });

  it('copies a category the partner added, keyed by their id', () => {
    const plan = planCategorySync([], [cat({ id: 'gym', name: 'Gym', updatedAt: T1 })]);
    expect(plan.upserts).toEqual([
      {
        id: 'gym',
        fields: { name: 'Gym', color: '#000', sharedKey: 'gym', deleted: false },
        updatedAt: T1,
        create: true,
      },
    ]);
  });

  it('takes the partner’s newer edit and ignores an older one', () => {
    const mine = [cat({ id: 'gym', name: 'Gym', updatedAt: T1 })];
    const newer = planCategorySync(mine, [cat({ id: 'gym', name: 'Fitness', updatedAt: T2 })]);
    expect(newer.upserts[0]).toMatchObject({
      id: 'gym',
      fields: { name: 'Fitness' },
      create: false,
    });

    const older = planCategorySync(
      [cat({ id: 'gym', name: 'Fitness', updatedAt: T2 })],
      [cat({ id: 'gym', name: 'Gym', updatedAt: T1 })],
    );
    expect(isEmptyPlan(older)).toBe(true);
  });

  it('removes my copy when the partner deleted it later, but never Other', () => {
    const plan = planCategorySync(
      [cat({ id: 'gym', updatedAt: T1 }), cat({ id: 'default-other', updatedAt: T1 })],
      [
        cat({ id: 'gym', deleted: true, updatedAt: T2 }),
        cat({ id: 'default-other', deleted: true, updatedAt: T2 }),
      ],
    );
    expect(plan.removals.map((removal) => removal.category.id)).toEqual(['gym']);
    expect(plan.removals[0].deletedAt).toBe(T2);
  });

  it('keeps my copy when I edited it after their deletion', () => {
    const plan = planCategorySync(
      [cat({ id: 'gym', updatedAt: T2 })],
      [cat({ id: 'gym', deleted: true, updatedAt: T1 })],
    );
    expect(isEmptyPlan(plan)).toBe(true);
  });

  it('doesn’t copy back a category I deleted, unless they edited it afterwards', () => {
    const tombstone = cat({ id: 'gym', deleted: true, updatedAt: T2 });
    expect(isEmptyPlan(planCategorySync([tombstone], [cat({ id: 'gym', updatedAt: T1 })]))).toBe(
      true,
    );
    const revived = planCategorySync(
      [cat({ id: 'gym', deleted: true, updatedAt: T1 })],
      [cat({ id: 'gym', updatedAt: T2 })],
    );
    expect(revived.upserts[0]).toMatchObject({ id: 'gym', fields: { deleted: false } });
  });

  it('merges same-name categories onto the smaller key, from one side only', () => {
    const a = cat({ id: 'aaa', name: 'Gym' });
    const b = cat({ id: 'bbb', name: 'gym' });
    // I hold the larger key, so I move onto theirs.
    expect(planCategorySync([b], [a]).upserts).toEqual([
      expect.objectContaining({ id: 'bbb', fields: expect.objectContaining({ sharedKey: 'aaa' }) }),
    ]);
    // I hold the smaller key, so I wait for them.
    expect(isEmptyPlan(planCategorySync([a], [b]))).toBe(true);
  });

  it('ignores private categories on either side', () => {
    const plan = planCategorySync(
      [cat({ id: 'mine', isPrivate: true })],
      [cat({ id: 'theirs', isPrivate: true })],
    );
    expect(isEmptyPlan(plan)).toBe(true);
  });
});
