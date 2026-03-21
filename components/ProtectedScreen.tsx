import { useAuthSession } from '@/context/auth_context';
import { router } from 'expo-router';
import React, { PropsWithChildren } from 'react';
import { View, ActivityIndicator } from 'react-native';
import tw_colors from '@/constants/tw-colors';

const ProtectedScreen: React.FC<PropsWithChildren> = ({ children }) => {
	const { is_logged_in, is_loading } = useAuthSession();

	const redirected = React.useRef(false);

	React.useEffect(() => {
		if (!is_loading && !is_logged_in) {
			if (!redirected.current) {
				redirected.current = true;
				router.push('/login');
			} else {
				// If we already tried to redirect and the user came back,
				// they probably hit "Back" on the Login screen.
				// In this case, we should take them back to a safe screen to avoid a loop.
				router.replace('/(drawer)/anime');
			}
		}
	}, [is_loading, is_logged_in]);

	if (is_loading || !is_logged_in) {
		return (
			<View style={{ flex: 1, backgroundColor: tw_colors.zinc950, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator color={tw_colors.blue500} size="large" />
			</View>
		);
	}

	return <>{children}</>;
};

export default ProtectedScreen;
