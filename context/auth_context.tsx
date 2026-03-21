import { createContext, MutableRefObject, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthSession, User } from '@/services/auth';

const auth_context = createContext<{
	save_token: (token: string) => Promise<void>;
	remove_token: () => Promise<void>;
	token_ref: MutableRefObject<string | null> | null;
	is_loading: boolean;
	is_logged_in: boolean;
	user: User | null;
}>({
	token_ref: null,
	is_loading: true,
	is_logged_in: false,
	user: null,
	save_token: async () => {},
	remove_token: async () => {},
});

export function useAuthSession() {
	return useContext(auth_context);
}

export const auth_key = 'auth_token';

export default function AuthProvider({ children }: React.PropsWithChildren) {
	const token_ref = useRef<string | null>(null);
	const queryClient = useQueryClient();

	const { data: token, isLoading: is_token_loading } = useQuery({
		queryKey: ['auth_token'],
		queryFn: async function () {
			return SecureStore.getItemAsync(auth_key);
		},
		staleTime: Infinity,
	});

	const { data: session, isLoading: is_session_loading, isFetching: is_session_fetching } = useQuery({
		queryKey: ['auth_session', token],
		queryFn: async function () {
			if (!token) return null;
			return getAuthSession(token);
		},
		enabled: !!token,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	useEffect(() => {
		if (token) {
			token_ref.current = token;
		}
	}, [token]);

	const is_logged_in = useMemo(() => !!token && !!session?.user, [token, session]);
	const user = useMemo(() => session?.user || null, [session]);
	
	// is_loading is ONLY true when we are actively determining if a token exists
	// or if a token exists and we are fetching the session for the first time.
	const is_loading = is_token_loading || (!!token && is_session_loading && !session);

	const save_token = useCallback(async function (newToken: string) {
		await SecureStore.setItemAsync(auth_key, newToken);
		token_ref.current = newToken;
		queryClient.invalidateQueries({ queryKey: ['auth_token'] });
	}, [queryClient]);

	const remove_token = useCallback(async function () {
		await SecureStore.deleteItemAsync(auth_key);
		token_ref.current = null;
		queryClient.invalidateQueries({ queryKey: ['auth_token'] });
		queryClient.setQueryData(['auth_session', token], null);
	}, [queryClient, token]);

	return <auth_context.Provider value={{ save_token, remove_token, token_ref, is_loading, is_logged_in, user }}>{children}</auth_context.Provider>;
}
