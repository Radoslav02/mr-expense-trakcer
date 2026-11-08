import { OTHER_CATEGORY_ID } from '@/constants/categories';
import type { Category } from '@/types/category';

/** Fields written to one of my shared category documents to match the partner's copy. */
export interface CategoryUpsert {
  id: string;
  fields: {
    name: string;
    color: string;
    icon?: string;
    sharedKey: string;
    deleted: boolean;
  };
  updatedAt: string;
  /** True when the document doesn't exist on my side yet. */
  create: boolean;
}

export interface CategoryRemoval {
  category: Category;
  /** The partner's deletion time, copied so both tombstones agree. */
  deletedAt: string;
}

export interface CategorySyncPlan {
  upserts: CategoryUpsert[];
  removals: CategoryRemoval[];
}

const nameKey = (name: string) => name.trim().toLowerCase();

const sameLook = (a: Category, b: Category) =>
  a.name === b.name && a.color === b.color && (a.icon ?? '') === (b.icon ?? '');

const fieldsOf = (source: Category, sharedKey: string): CategoryUpsert['fields'] => ({
  name: source.name,
  color: source.color,
  ...(source.icon ? { icon: source.icon } : {}),
  sharedKey,
  deleted: false,
});

/**
 * Works out what I need to change so my shared categories match my partner's.
 *
 * Both apps run this against each other, so it only ever writes to my own data. Each shared
 * category is identified by `sharedKey`; the newest `updatedAt` wins. Deletions are tombstones,
 * so a category one partner deletes is removed on the other side instead of being copied back.
 * Two categories with the same name but different keys (made before syncing existed) are merged
 * by moving the one with the larger key onto the smaller, so both sides pick the same key.
 */
export const planCategorySync = (
  mine: readonly Category[],
  theirs: readonly Category[],
): CategorySyncPlan => {
  const ownShared = mine.filter((category) => !category.isPrivate);
  const byKey = new Map(ownShared.map((category) => [category.sharedKey, category]));
  const byId = new Map(ownShared.map((category) => [category.id, category]));
  const liveByName = new Map(
    ownShared
      .filter((category) => !category.deleted)
      .map((category) => [nameKey(category.name), category]),
  );
  const upserts: CategoryUpsert[] = [];
  const removals: CategoryRemoval[] = [];

  for (const other of theirs) {
    if (other.isPrivate) continue;
    const key = other.sharedKey;
    const own = byKey.get(key);

    if (other.deleted) {
      if (own && !own.deleted && own.id !== OTHER_CATEGORY_ID && other.updatedAt > own.updatedAt) {
        removals.push({ category: own, deletedAt: other.updatedAt });
      }
      continue;
    }

    if (own) {
      const newer = other.updatedAt > own.updatedAt;
      if (newer && (own.deleted || !sameLook(own, other))) {
        upserts.push({
          id: own.id,
          fields: fieldsOf(other, key),
          updatedAt: other.updatedAt,
          create: false,
        });
      }
      continue;
    }

    const namesake = liveByName.get(nameKey(other.name));
    if (namesake) {
      // Only the side holding the larger key moves; the other waits for it.
      if (key < namesake.sharedKey) {
        upserts.push({
          id: namesake.id,
          fields: fieldsOf(namesake, key),
          updatedAt: namesake.updatedAt,
          create: false,
        });
      }
      continue;
    }

    // A document with this id but another key would be overwritten; leave it alone.
    if (byId.has(key)) continue;
    upserts.push({
      id: key,
      fields: fieldsOf(other, key),
      updatedAt: other.updatedAt,
      create: true,
    });
  }

  return { upserts, removals };
};

export const isEmptyPlan = (plan: CategorySyncPlan): boolean =>
  plan.upserts.length === 0 && plan.removals.length === 0;
