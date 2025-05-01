import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import AuthProvider from '@/context/auth_context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [query_client] = useState(() => new QueryClient());

	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<GestureHandlerRootView style={styles.flex1}>
			<QueryClientProvider client={query_client}>
				<PaperProvider>
					<AuthProvider>
						<Stack screenOptions={{ headerShown: false }} />
					</AuthProvider>
				</PaperProvider>
			</QueryClientProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	flex1: {
		flex: 1,
	},
});
