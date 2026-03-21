import { Tabs, useNavigation, useNavigationContainerRef } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import tw_colors from '@/constants/tw-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
	const ref = useNavigation();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: tw_colors.white,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: Platform.select({
					ios: tab_bar_ios,
					default: styles.default,
				}),
			}}
			screenListeners={{
				focus: function (event) {
					const target = event.target || '';
					if (target.startsWith('search-') || target.startsWith('[id]-') || target.startsWith('lists/[id]-')) {
						ref.setOptions({ headerShown: false });
					} else {
						ref.setOptions({ headerShown: true });
					}
				},
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name='house.fill' color={color} />,
				}}
			/>
			<Tabs.Screen
				name='search'
				options={{
					title: 'Search',
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
					tabBarIcon: ({ color }) => <MaterialIcons name='account-circle' size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name='[id]'
				options={{
					href: null,
					tabBarStyle: { display: 'none' }
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
