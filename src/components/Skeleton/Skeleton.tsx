import { cn } from '@/utils/cn';
import './Skeleton.css';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <span aria-hidden="true" className={cn('skeleton block rounded-md bg-sunken', className)} />
);
