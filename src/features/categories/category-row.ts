import { impactTypeSchema, type ImpactType } from '@/shared/contracts/finance';

export type CategoryOption = {
  id: string;
  code: string;
  name: string;
  impactType: ImpactType;
  isPersonal: boolean;
  isActive: boolean;
  icon: string | null;
  color: string | null;
};

export const CATEGORY_COLUMNS = 'id,code,name,impact_type,user_id,is_active,parent_id,icon,color';

// A row of the categories table as the client returns it.
type CategoryRow = {
  id: string;
  code: string;
  name: string;
  impact_type: string;
  user_id: string | null;
  is_active: boolean;
  icon: string | null;
  color: string | null;
};

export function categoryOptionFromRow(row: CategoryRow): CategoryOption {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    impactType: impactTypeSchema.parse(row.impact_type),
    isPersonal: row.user_id !== null,
    isActive: row.is_active,
    icon: row.icon ?? null,
    color: row.color ?? null,
  };
}
