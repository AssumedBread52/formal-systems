import { PaginatedResults, PaginationParameters } from '@/system/types';
export declare const useReadPaginatedSystems: (paginationParameters: PaginationParameters) => {
    data?: PaginatedResults | undefined;
    errorMessage: string;
    loading: boolean;
};
