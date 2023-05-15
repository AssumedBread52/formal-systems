import { ClientUser } from '@/user/types';
export declare const useReadUserById: (userId: string) => {
    data?: ClientUser | undefined;
    loading: boolean;
};
