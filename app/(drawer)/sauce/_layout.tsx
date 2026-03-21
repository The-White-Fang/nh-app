import { Tabs, useNavigation } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import tw_colors from '@/constants/tw-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
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
