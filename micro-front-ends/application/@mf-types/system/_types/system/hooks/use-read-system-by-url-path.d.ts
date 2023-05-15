import { ClientSystem } from '@/system/types';
export declare const useReadSystemByUrlPath: (urlPath: string, skip?: boolean) => {
    data?: ClientSystem | undefined;
    errorMessage: string;
    loading: boolean;
};
