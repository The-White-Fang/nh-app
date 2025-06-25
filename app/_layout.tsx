import tw_colors from '@/constants/tw-colors';
import AuthProvider from '@/context/auth_context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { LogBox, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { PortalProvider } from '@gorhom/portal';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([new RegExp('StatusBar backgroundColor is not supported with edge-to-edge enabled. Render a view under the status bar to change its background.')]);

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
			<PortalProvider>
				<QueryClientProvider client={query_client}>
					<PaperProvider>
						<AuthProvider>
							<Stack>
								<Stack.Screen name='(drawer)' options={{ headerShown: false }} />
								<Stack.Screen name='login' />
								<Stack.Screen name='register' />
							</Stack>
						</AuthProvider>
					</PaperProvider>
				</QueryClientProvider>
			</PortalProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	flex1: {
		flex: 1,
	},
	tab_bar_ios: {
		position: 'absolute',
	},
	default: {
		backgroundColor: tw_colors.zinc950,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: tw_colors.zinc800,
	},
});

const tab_bar_ios = StyleSheet.flatten([styles.tab_bar_ios, styles.default]);
