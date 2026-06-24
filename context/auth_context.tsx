import { createContext, MutableRefObject, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthSession, User } from '@/services/auth';

const auth_context = createContext<{
	token_ref: MutableRefObject<string | null> | null;
	is_loading: boolean;
	is_logged_in: boolean;
	user: User | null;
	save_token: (token: string, user?: User) => Promise<void>;
	remove_token: () => Promise<void>;
	refresh_session: () => void;
	update_user: (user: User) => Promise<void>;
}>({
	token_ref: null,
	is_loading: true,
	is_logged_in: false,
	user: null,
	save_token: async () => {},
	remove_token: async () => {},
	refresh_session: () => {},
	update_user: async () => {},
});

export function useAuthSession() {
	return useContext(auth_context);
}

export const auth_key = 'auth_token';
export const auth_user_key = 'auth_user';

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

	const { data: cached_user, isLoading: is_user_loading } = useQuery({
		queryKey: ['auth_user'],
		queryFn: async function () {
			const data = await SecureStore.getItemAsync(auth_user_key);
			return data ? (JSON.parse(data) as User) : null;
		},
		staleTime: Infinity,
	});

	const {
		data: session,
		isLoading: is_session_loading,
		isFetching: is_session_fetching,
	} = useQuery({
		queryKey: ['auth_session', token],
		queryFn: async function () {
			if (!token) return null;
			const data = await getAuthSession(token);
			// Update the cache if we get a response
			if (data.user) {
				await SecureStore.setItemAsync(auth_user_key, JSON.stringify(data.user));
				queryClient.setQueryData(['auth_user'], data.user);
			}
			return data;
		},
		enabled: !!token,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	useEffect(() => {
		if (token) {
			token_ref.current = token;
		}
	}, [token]);

	const is_logged_in = useMemo(() => !!token && (!!session?.user || !!cached_user), [token, session, cached_user]);
	const user = useMemo(() => session?.user || cached_user || null, [session, cached_user]);

	// is_loading is ONLY true when we are actively determining if a token exists
	// or if a token exists and we are fetching the session for the first time.
	const is_loading = is_token_loading || is_user_loading || (!!token && is_session_loading && !session && !cached_user);

	const save_token = useCallback(
		async function (newToken: string, newUser?: User) {
			await SecureStore.setItemAsync(auth_key, newToken);
			if (newUser) {
				await SecureStore.setItemAsync(auth_user_key, JSON.stringify(newUser));
				queryClient.setQueryData(['auth_user'], newUser);
				queryClient.setQueryData(['auth_session', newToken], { jwt: newToken, user: newUser });
			}
			token_ref.current = newToken;
			queryClient.invalidateQueries({ queryKey: ['auth_token'] });
		},
		[queryClient],
	);

	const remove_token = useCallback(
		async function () {
			await SecureStore.deleteItemAsync(auth_key);
			await SecureStore.deleteItemAsync(auth_user_key);
			token_ref.current = null;
			queryClient.invalidateQueries({ queryKey: ['auth_token'] });
			queryClient.setQueryData(['auth_user'], null);
			queryClient.setQueryData(['auth_session', token], null);
		},
		[queryClient, token],
	);

	const update_user = useCallback(
		async function (newUser: User) {
			await SecureStore.setItemAsync(auth_user_key, JSON.stringify(newUser));
			queryClient.setQueryData(['auth_user'], newUser);
			// Update session cache too if possible
			if (token) {
				const currentSession = queryClient.getQueryData<{ jwt: string; user: User }>(['auth_session', token]);
				if (currentSession) {
					queryClient.setQueryData(['auth_session', token], { ...currentSession, user: newUser });
				}
			}
		},
		[queryClient, token],
	);

	const refresh_session = useCallback(
		function () {
			queryClient.invalidateQueries({ queryKey: ['auth_session', token] });
		},
		[queryClient, token],
	);

	return <auth_context.Provider value={{ save_token, remove_token, refresh_session, update_user, token_ref, is_loading, is_logged_in, user }}>{children}</auth_context.Provider>;
}
