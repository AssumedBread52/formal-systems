import { TagTypes } from '@/app/constants/tag-types';

export type TagTypes = typeof TagTypes[keyof typeof TagTypes];
