import { useAuthSession } from '@/context/auth_context';
import tw_colors from '@/constants/tw-colors';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import RegularText from '@/components/ui/Text';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import ProtectedScreen from '@/components/ProtectedScreen';

function ProfileContent() {
	const { user, remove_token } = useAuthSession();
	const insets = useSafeAreaInsets();

	const handleLogout = () => {
		Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Log Out',
				style: 'destructive',
				onPress: async () => {
					await remove_token();
					router.replace('/');
				},
			},
		]);
	};

	return (
		<View style={[styles.root, { paddingTop: insets.top }]}>
			{/* Header area with gradient */}
			<LinearGradient colors={[tw_colors.zinc900, tw_colors.zinc950]} style={styles.headerBackground} />

			<View style={styles.topBar}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<MaterialIcons name="arrow-back" size={28} color={tw_colors.white} />
				</TouchableOpacity>
				<RegularText style={styles.topBarTitle}>Profile</RegularText>
			</View>

			{user ? (
				<View style={styles.profileContainer}>
					<View style={styles.avatarWrapper}>
						<Image
							source={{ uri: user.image || 'https://via.placeholder.com/300' }}
							style={styles.avatar}
							contentFit="cover"
						/>
						{user.is_admin && (
							<View style={styles.adminBadge}>
								<MaterialIcons name="verified-user" size={16} color={tw_colors.blue400} />
							</View>
						)}
					</View>

					<RegularText style={styles.username}>{user.username}</RegularText>
					<RegularText style={styles.userId}>User ID: {user.id}</RegularText>
					<View style={styles.roleContainer}>
						<RegularText style={styles.roleText}>{user.is_admin ? 'Administrator' : 'Standard Member'}</RegularText>
					</View>

					{/* Action Buttons */}
					<View style={styles.actionsContainer}>
						<TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(drawer)/settings')}>
							<MaterialIcons name="settings" size={24} color={tw_colors.zinc300} />
							<RegularText style={styles.actionBtnText}>App Settings</RegularText>
							<MaterialIcons name="chevron-right" size={24} color={tw_colors.zinc500} />
						</TouchableOpacity>

						<TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout}>
							<MaterialIcons name="logout" size={24} color={tw_colors.red400} />
							<RegularText style={[styles.actionBtnText, { color: tw_colors.red400 }]}>Log Out</RegularText>
						</TouchableOpacity>
					</View>
				</View>
			) : (
				<View style={styles.center}>
					<RegularText style={{ color: tw_colors.zinc400 }}>No user data available.</RegularText>
				</View>
			)}
		</View>
	);
}

export default function ProfileScreen() {
	return (
		<ProtectedScreen>
			<ProfileContent />
		</ProtectedScreen>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: tw_colors.zinc950,
	},
	headerBackground: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 250,
	},
	topBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		zIndex: 10,
	},
	backBtn: {
		padding: 4,
		marginRight: 16,
	},
	topBarTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: tw_colors.white,
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	profileContainer: {
		flex: 1,
		alignItems: 'center',
		paddingTop: 40,
	},
	avatarWrapper: {
		position: 'relative',
		marginBottom: 16,
	},
	avatar: {
		width: 140,
		height: 140,
		borderRadius: 70,
		borderWidth: 4,
		borderColor: tw_colors.zinc900,
		backgroundColor: tw_colors.zinc800,
	},
	adminBadge: {
		position: 'absolute',
		bottom: 4,
		right: 4,
		backgroundColor: tw_colors.zinc900,
		padding: 6,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: tw_colors.zinc950,
	},
	username: {
		fontSize: 28,
		fontWeight: '800',
		color: tw_colors.white,
		letterSpacing: 0.5,
	},
	userId: {
		fontSize: 14,
		color: tw_colors.zinc400,
		marginTop: 4,
	},
	roleContainer: {
		marginTop: 12,
		paddingHorizontal: 16,
		paddingVertical: 6,
		backgroundColor: 'rgba(59, 130, 246, 0.15)',
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(59, 130, 246, 0.3)',
	},
	roleText: {
		color: tw_colors.blue400,
		fontSize: 12,
		fontWeight: 'bold',
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	actionsContainer: {
		width: '100%',
		paddingHorizontal: 24,
		marginTop: 60,
	},
	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: tw_colors.zinc900,
		padding: 16,
		borderRadius: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: tw_colors.zinc800,
	},
	actionBtnText: {
		flex: 1,
		color: tw_colors.zinc200,
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 16,
	},
	logoutBtn: {
		borderColor: 'rgba(248, 113, 113, 0.2)',
		backgroundColor: 'rgba(248, 113, 113, 0.05)',
		marginTop: 12,
	},
});
