import tw_colors from '@/constants/tw-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

export default function DrawerLatout() {
	return (
		<Drawer
			screenOptions={({ navigation }) => ({
				drawerStyle: styles.drawer,
				headerStyle: styles.header,
				headerTitleStyle: styles.title,
				drawerInactiveTintColor: tw_colors.white,
				headerLeft: () => (
					<Pressable onPress={navigation.toggleDrawer} style={styles.header_icon}>
						<MaterialIcons color={tw_colors.white} size={28} name='menu' />
					</Pressable>
				),
			})}
		>
			<Drawer.Screen name='anime' options={{ title: 'Anime' }} />
			<Drawer.Screen name='sauce' options={{ title: 'Sauce' }} />
			<Drawer.Screen name='profile' options={{ title: 'Profile', headerShown: false }} />
			<Drawer.Screen name='settings' options={{ title: 'Settings', headerShown: false }} />
		</Drawer>
	);
}

const styles = StyleSheet.create({
	header_icon: { width: 50, alignItems: 'center' },
	drawer: { backgroundColor: tw_colors.zinc900 },
	header: { backgroundColor: tw_colors.black },
	title: { color: tw_colors.white },
});
