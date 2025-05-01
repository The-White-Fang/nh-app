import { createContext, MutableRefObject, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQuery } from '@tanstack/react-query';

const auth_context = createContext<{
	save_token: (token: string) => Promise<void>;
	remove_token: () => Promise<void>;
	token_ref: MutableRefObject<string | null> | null;
	is_loading: boolean;
	is_logged_in: boolean;
}>({
	token_ref: null,
	is_loading: true,
	is_logged_in: false,
	save_token: async () => {},
	remove_token: async () => {},
});

export function useAuthSession() {
	return useContext(auth_context);
}

export const auth_key = 'auth_token';

export default function AuthProvider({ children }: React.PropsWithChildren) {
	const token_ref = useRef<string | null>(null);

	const { data, isLoading: is_loading } = useQuery({
		queryKey: ['auth_token'],
		queryFn: async function () {
			return SecureStore.getItemAsync(auth_key);
		},
	});

	useEffect(() => {
		if (data) {
			token_ref.current = data;
		}
	}, [data]);

	const is_logged_in = useMemo(() => !!data, [data]);

	const save_token = useCallback(async function (token: string) {
		await SecureStore.setItemAsync(auth_key, token);
		token_ref.current = token;
	}, []);

	const remove_token = useCallback(async function () {
		await SecureStore.deleteItemAsync(auth_key);
		token_ref.current = null;
	}, []);

	return <auth_context.Provider value={{ save_token, remove_token, token_ref, is_loading, is_logged_in }}>{children}</auth_context.Provider>;
}
