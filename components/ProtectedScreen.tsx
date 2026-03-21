import { useAuthSession } from '@/context/auth_context';
import { Redirect } from 'expo-router';
import React, { PropsWithChildren } from 'react';
import { View, ActivityIndicator } from 'react-native';
import tw_colors from '@/constants/tw-colors';

const ProtectedScreen: React.FC<PropsWithChildren> = ({ children }) => {
	const { is_logged_in, is_loading } = useAuthSession();

	if (is_loading) {
		return (
			<View style={{ flex: 1, backgroundColor: tw_colors.zinc950, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator color={tw_colors.blue500} size="large" />
			</View>
		);
	}

	if (!is_logged_in) {
		return <Redirect href='/login' />;
	}

	return <>{children}</>;
};

export default ProtectedScreen;
