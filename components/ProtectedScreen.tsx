import { useAuthSession } from '@/context/auth_context';
import { Redirect } from 'expo-router';
import React, { PropsWithChildren } from 'react';

const ProtectedScreen: React.FC<PropsWithChildren> = ({ children }) => {
	const { is_logged_in, is_loading } = useAuthSession();

	if (is_loading) {
		return <></>;
	}

	if (!is_logged_in) {
		return <Redirect href='/login' />;
	}

	return <>{children}</>;
};

export default ProtectedScreen;
