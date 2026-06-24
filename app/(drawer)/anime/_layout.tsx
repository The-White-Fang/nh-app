import { IconSymbol } from '@/components/ui/IconSymbol';
import tw_colors from '@/constants/tw-colors';
import { useAuthSession } from '@/context/auth_context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, Tabs } from 'expo-router';
import { DrawerToggleButton } from 'expo-router/drawer';
import { Platform, StyleSheet } from 'react-native';

export default function TabLayout() {
	const { is_loading, is_logged_in } = useAuthSession();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: tw_colors.white,
				tabBarInactiveTintColor: tw_colors.slate400,
				headerShown: false,
				tabBarStyle: Platform.select({
					ios: tab_bar_ios,
					default: styles.default,
				}),
				headerStyle: { backgroundColor: tw_colors.black },
				headerTitleStyle: { color: tw_colors.white },
				headerTintColor: tw_colors.white,
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Home',
					headerShown: true,
					headerLeft: () => <DrawerToggleButton tintColor={tw_colors.white} />,
					tabBarIcon: ({ color }) => <IconSymbol size={28} name='house.fill' color={color} />,
				}}
			/>
			<Tabs.Screen
				name='search'
				options={{
					title: 'Search',
					headerShown: false,
					tabBarStyle: { display: 'none' },
					tabBarIcon: ({ color }) => <MaterialIcons name='search' size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name='explore'
				options={{
					title: 'Explore',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name='paperplane.fill' color={color} />,
				}}
			/>
			<Tabs.Screen
				name='my-space'
				options={{
					title: 'My space',
					tabBarIcon: ({ color }) => <MaterialIcons name='grid-view' size={28} color={color} />,
				}}
				listeners={{
					tabPress: function (event) {
						if (is_loading || !is_logged_in) {
							event.preventDefault();
						}

						if (!is_logged_in) {
							router.push('/login');
						}
					},
				}}
			/>
			<Tabs.Screen
				name='lists/index'
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name='lists/[id]'
				options={{
					href: null,
				}}
			/>
		</Tabs>
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
