import { api, resolveImageUrl } from '@/helpers/config';
import tw_colors from '@/constants/tw-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { usePathname, router } from 'expo-router';
import { useAuthSession } from '@/context/auth_context';
import RegularText from '@/components/ui/Text';
import { Image } from 'expo-image';

function CustomDrawerContent(props: DrawerContentComponentProps) {
	const { user, is_logged_in } = useAuthSession();

	return (
		<DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: tw_colors.zinc950 }}>
			<View style={styles.drawerHeader}>
				{is_logged_in && user ? (
					<Pressable style={styles.userInfo} onPress={() => router.push('/(drawer)/profile')}>
						<Image source={{ uri: user.image || 'https://via.placeholder.com/150' }} style={styles.avatar} contentFit='cover' transition={200} />
						<View style={styles.userDetails}>
							<RegularText style={styles.username} numberOfLines={1}>
								{user.username}
							</RegularText>
							<RegularText style={styles.userRole}>{user.is_admin ? 'Admin' : 'Member'}</RegularText>
						</View>
					</Pressable>
				) : (
					<View style={styles.guestInfo}>
						<View style={styles.guestAvatar}>
							<MaterialIcons name='person' size={32} color={tw_colors.zinc500} />
						</View>
						<View style={styles.userDetails}>
							<RegularText style={styles.username}>Guest</RegularText>
							<Pressable onPress={() => router.push('/login')}>
								<RegularText style={styles.signInBtn}>Sign In</RegularText>
							</Pressable>
						</View>
					</View>
				)}
			</View>

			<View style={styles.drawerItemsContainer}>
				<DrawerItemList {...props} />
			</View>
		</DrawerContentScrollView>
	);
}

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
			drawerContent={(props) => <CustomDrawerContent {...props} />}
		>
			<Drawer.Screen name='anime' options={{ title: 'Anime', drawerIcon: ({ color }) => <MaterialIcons name='ondemand-video' size={24} color={color} /> }} />
			<Drawer.Screen name='sauce' options={{ title: 'Sauce', drawerIcon: ({ color }) => <MaterialIcons name='menu-book' size={24} color={color} /> }} />
			<Drawer.Screen name='profile' options={{ title: 'Profile', drawerItemStyle: { display: 'none' } }} />
			<Drawer.Screen
				name='settings'
				options={{ title: 'Settings', headerShown: false, drawerIcon: ({ color }) => <MaterialIcons name='settings' size={24} color={color} /> }}
			/>
		</Drawer>
	);
}

const styles = StyleSheet.create({
	header_icon: { width: 50, alignItems: 'center' },
	drawer: { backgroundColor: tw_colors.zinc950, width: 280 },
	header: { backgroundColor: tw_colors.black },
	title: { color: tw_colors.white },
	drawerHeader: {
		padding: 20,
		paddingTop: 40,
		borderBottomWidth: 1,
		borderBottomColor: tw_colors.zinc900,
		marginBottom: 10,
	},
	userInfo: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	guestInfo: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: tw_colors.zinc800,
	},
	guestAvatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: tw_colors.zinc800,
		justifyContent: 'center',
		alignItems: 'center',
	},
	userDetails: {
		marginLeft: 16,
		flex: 1,
	},
	username: {
		color: tw_colors.white,
		fontSize: 16,
		fontWeight: 'bold',
	},
	userRole: {
		color: tw_colors.zinc400,
		fontSize: 12,
		marginTop: 2,
	},
	signInBtn: {
		color: tw_colors.blue400,
		fontSize: 14,
		fontWeight: '600',
		marginTop: 4,
	},
	drawerItemsContainer: {
		flex: 1,
	},
});
