import Screen from '@/components/ui/Screen';
import tw_colors from '@/constants/tw-colors';
import ProtectedScreen from '@/components/ProtectedScreen';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

export default function Profile() {
	return (
		<ProtectedScreen>
			<Screen safe_area={true} style={styles.root}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
					<Ionicons name="arrow-back" size={24} color={tw_colors.white} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
					<Ionicons name="settings-outline" size={24} color={tw_colors.white} />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
				<View style={styles.profileSection}>
					<View style={styles.avatarContainer}>
						<Image
							source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
							style={styles.avatar}
							contentFit="cover"
						/>
					</View>
					<Text style={styles.name}>Otaku Master</Text>
					<Text style={styles.handle}>@otakumaster99</Text>

					<View style={styles.statsContainer}>
						<View style={styles.statBox}>
							<Text style={styles.statNumber}>142</Text>
							<Text style={styles.statLabel}>Watched</Text>
						</View>
						<View style={styles.statDivider} />
						<View style={styles.statBox}>
							<Text style={styles.statNumber}>15</Text>
							<Text style={styles.statLabel}>Following</Text>
						</View>
						<View style={styles.statDivider} />
						<View style={styles.statBox}>
							<Text style={styles.statNumber}>8K</Text>
							<Text style={styles.statLabel}>Favorites</Text>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Recent Activity</Text>
					{[1, 2, 3].map((item) => (
						<View key={item} style={styles.activityCard}>
							<Image
								source={{ uri: `https://picsum.photos/seed/activity${item}/100/100` }}
								style={styles.activityImage}
							/>
							<View style={styles.activityInfo}>
								<Text style={styles.activityTitle}>Jujutsu Kaisen</Text>
								<Text style={styles.activityDesc}>Watched Episode {item + 10}</Text>
								<Text style={styles.activityTime}>{item} hours ago</Text>
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		</Screen>
		</ProtectedScreen>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: tw_colors.zinc950,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	iconButton: {
		padding: 8,
	},
	scrollContent: {
		paddingBottom: 40,
	},
	profileSection: {
		alignItems: 'center',
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: tw_colors.zinc800,
	},
	avatarContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 3,
		borderColor: tw_colors.blue500,
		overflow: 'hidden',
		marginBottom: 16,
	},
	avatar: {
		width: '100%',
		height: '100%',
	},
	name: {
		fontSize: 24,
		fontWeight: 'bold',
		color: tw_colors.white,
		marginBottom: 4,
	},
	handle: {
		fontSize: 16,
		color: tw_colors.zinc400,
		marginBottom: 24,
	},
	statsContainer: {
		flexDirection: 'row',
		width: '80%',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	statBox: {
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 20,
		fontWeight: 'bold',
		color: tw_colors.white,
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 14,
		color: tw_colors.zinc400,
	},
	statDivider: {
		width: 1,
		height: 30,
		backgroundColor: tw_colors.zinc800,
	},
	section: {
		padding: 20,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: tw_colors.white,
		marginBottom: 16,
	},
	activityCard: {
		flexDirection: 'row',
		backgroundColor: tw_colors.zinc900,
		borderRadius: 12,
		padding: 12,
		marginBottom: 12,
	},
	activityImage: {
		width: 60,
		height: 60,
		borderRadius: 8,
	},
	activityInfo: {
		marginLeft: 12,
		justifyContent: 'center',
	},
	activityTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: tw_colors.white,
		marginBottom: 4,
	},
	activityDesc: {
		fontSize: 14,
		color: tw_colors.zinc300,
		marginBottom: 4,
	},
	activityTime: {
		fontSize: 12,
		color: tw_colors.zinc500,
	},
});
