import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import tw_colors from '@/constants/tw-colors';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: tw_colors.white,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: Platform.select({ ios: tab_bar_ios, default: styles.default }),
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
				name='explore'
				options={{
					title: 'Explore',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name='paperplane.fill' color={color} />,
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
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
