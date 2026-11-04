export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault: boolean;
}

export type CategoryInput = Pick<Category, 'name' | 'color' | 'icon'>;

export type CategoryChanges = Partial<CategoryInput>;
