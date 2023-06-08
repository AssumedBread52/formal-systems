import { Tags } from '@/app/constants/tags';

export type TagTypes = typeof Tags[keyof typeof Tags];
