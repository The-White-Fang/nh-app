import Screen from '@/components/ui/Screen';
import tw_colors from '@/constants/tw-colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function Settings() {
	const [notifications, setNotifications] = useState(true);
	const [autoPlay, setAutoPlay] = useState(false);
	const [blurNsfw, setBlurNsfw] = useState(true);

	const renderSettingItem = (icon: any, title: string, rightElement: React.ReactNode, onPress?: () => void) => (
		<TouchableOpacity 
			style={styles.settingItem} 
			onPress={onPress}
			disabled={!onPress}
		>
			<View style={styles.settingLeft}>
				<Ionicons name={icon} size={24} color={tw_colors.zinc400} style={styles.settingIcon} />
				<Text style={styles.settingTitle}>{title}</Text>
			</View>
			<View>{rightElement}</View>
		</TouchableOpacity>
	);

	return (
		<Screen safe_area={true} style={styles.root}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
					<Ionicons name="arrow-back" size={24} color={tw_colors.white} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Settings</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account</Text>
					<View style={styles.card}>
						{renderSettingItem('person-outline', 'Edit Profile', <Ionicons name="chevron-forward" size={20} color={tw_colors.zinc500} />, () => {})}
						<View style={styles.divider} />
						{renderSettingItem('shield-checkmark-outline', 'Privacy & Security', <Ionicons name="chevron-forward" size={20} color={tw_colors.zinc500} />, () => {})}
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Preferences</Text>
					<View style={styles.card}>
						{renderSettingItem(
							'notifications-outline', 
							'Push Notifications', 
							<Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: tw_colors.blue500 }} />
						)}
						<View style={styles.divider} />
						{renderSettingItem(
							'play-circle-outline', 
							'Auto-Play Videos', 
							<Switch value={autoPlay} onValueChange={setAutoPlay} trackColor={{ true: tw_colors.blue500 }} />
						)}
						<View style={styles.divider} />
						{renderSettingItem(
							'eye-off-outline', 
							'Blur NSFW Content', 
							<Switch value={blurNsfw} onValueChange={setBlurNsfw} trackColor={{ true: tw_colors.blue500 }} />
						)}
					</View>
				</View>

				<View style={styles.section}>
					<View style={styles.card}>
						<TouchableOpacity style={[styles.settingItem, { justifyContent: 'center' }]}>
							<Text style={styles.logoutText}>Log Out</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: tw_colors.zinc950,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: tw_colors.zinc900,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: tw_colors.white,
	},
	iconButton: {
		padding: 8,
		width: 40,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 40,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: tw_colors.zinc500,
		textTransform: 'uppercase',
		marginBottom: 8,
		marginLeft: 12,
	},
	card: {
		backgroundColor: tw_colors.zinc900,
		borderRadius: 16,
		overflow: 'hidden',
	},
	settingItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	settingLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	settingIcon: {
		marginRight: 16,
	},
	settingTitle: {
		fontSize: 16,
		color: tw_colors.white,
	},
	divider: {
		height: 1,
		backgroundColor: tw_colors.zinc800,
		marginLeft: 56,
	},
	logoutText: {
		color: tw_colors.red500,
		fontSize: 16,
		fontWeight: '600',
	},
});
