import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export type TypeRoutes =
    '/'
    | '/signIn'
    | '/signUp'
    | '/profile'
    | '/profile/settings'
    | '/profile/editing'
    | '/choosePlace'
    | '/choosePlace/cards'
    | '/findFriend'
    | '/T-A-T'
    | '/messager'

type TypedRouter = Omit<AppRouterInstance, 'push' | 'replace'> & {
    push: (path: TypeRoutes) => ReturnType<AppRouterInstance['push']>;
    replace: (path: TypeRoutes) => ReturnType<AppRouterInstance['replace']>;
};

export const useTypedRouter = (): TypedRouter => {
    const router = useRouter();

    return {
        ...router,
        push: (path: TypeRoutes) => router.push(path),
        replace: (path: TypeRoutes) => router.replace(path),
    };
};