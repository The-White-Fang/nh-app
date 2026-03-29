import { useAuthSession } from '@/context/auth_context';
import { Redirect, router, useFocusEffect, useNavigation } from 'expo-router';
import React, { PropsWithChildren, useCallback, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import tw_colors from '@/constants/tw-colors';

const ProtectedScreen: React.FC<PropsWithChildren> = ({ children }) => {
	const { is_logged_in, is_loading } = useAuthSession();

	if (is_loading) {
		return (
			<View style={styles.loading_container}>
				<ActivityIndicator color={tw_colors.blue500} size='large' />
			</View>
		);
	}

	if (!is_logged_in) {
		router.replace('/login');
	}

	return <>{children}</>;
};

const styles = StyleSheet.create({
	loading_container: { flex: 1, backgroundColor: tw_colors.zinc950, justifyContent: 'center', alignItems: 'center' },
});

export default ProtectedScreen;
