import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import './ExpenseListSkeleton.css';

const GROUPS = [3, 2];

export const ExpenseListSkeleton = () => (
  <div
    aria-busy="true"
    aria-label="Loading expenses"
    className="expense-list-skeleton flex flex-col gap-6"
  >
    {GROUPS.map((rows, groupIndex) => (
      <div key={groupIndex}>
        <Skeleton className="mb-3 ml-1 h-4 w-28" />
        <Card padded={false} as="div">
          {Array.from({ length: rows }, (_, index) => (
            <div
              key={index}
              className="expense-list-skeleton__row flex items-center gap-3 px-5 py-3"
            >
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </Card>
      </div>
    ))}
  </div>
);
