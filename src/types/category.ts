export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  /**
   * Links the copies of one shared category kept by each partner. Defaults to the document id;
   * the built-in categories use the same ids for everyone, so they line up on their own.
   */
  sharedKey: string;
  /** Private categories live in an owner-only collection and only hold private expenses. */
  isPrivate?: boolean;
  /** A deleted shared category stays as a tombstone so the partner's copy is removed too. */
  deleted?: boolean;
  updatedAt: string;
}

export type CategoryInput = Pick<Category, 'name' | 'color' | 'icon'>;

export type CategoryChanges = Partial<CategoryInput>;
