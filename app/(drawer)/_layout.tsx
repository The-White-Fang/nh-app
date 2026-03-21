import tw_colors from '@/constants/tw-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';

export default function DrawerLatout() {
	const pathname = usePathname();
	const isHome = pathname === '/anime' || pathname === '/sauce';

	return (
		<Drawer
			screenOptions={({ navigation }) => ({
				drawerStyle: styles.drawer,
				headerStyle: styles.header,
				headerTitleStyle: styles.title,
				drawerActiveBackgroundColor: tw_colors.zinc800,
				drawerActiveTintColor: tw_colors.white,
				drawerInactiveTintColor: tw_colors.zinc400,
				headerShown: false,
				swipeEnabled: isHome,
				headerLeft: () => (
					<Pressable onPress={navigation.toggleDrawer} style={styles.header_icon}>
						<MaterialIcons color={tw_colors.white} size={28} name='menu' />
					</Pressable>
				),
			})}
		>
			<Drawer.Screen name='anime' options={{ title: 'Anime' }} />
			<Drawer.Screen name='sauce' options={{ title: 'Sauce' }} />
			<Drawer.Screen name='settings' options={{ title: 'Settings', headerShown: false }} />
		</Drawer>
	);
}

const styles = StyleSheet.create({
	header_icon: { width: 50, alignItems: 'center' },
	drawer: { backgroundColor: tw_colors.zinc950 },
	header: { backgroundColor: tw_colors.black },
	title: { color: tw_colors.white },
});
