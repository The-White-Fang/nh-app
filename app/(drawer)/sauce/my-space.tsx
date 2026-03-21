import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import tw_colors from '@/constants/tw-colors';
import { fetchSauceLists, SauceListOverview } from '@/services/sauce_lists';
import { getDownloadedSauces } from '@/services/offline';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, FlatList } from 'react-native';
import ProtectedScreen from '@/components/ProtectedScreen';

interface SectionProps {
	title: string;
	onSeeAll?: () => void;
	children: React.ReactNode;
}

const Section = ({ title, onSeeAll, children }: SectionProps) => (
	<View style={styles.section}>
		<View style={styles.sectionHeader}>
			<RegularText style={styles.sectionTitle}>{title}</RegularText>
			{onSeeAll && (
				<TouchableOpacity onPress={onSeeAll}>
					<RegularText style={styles.seeAll}>See All</RegularText>
				</TouchableOpacity>
			)}
		</View>
		{children}
	</View>
);

const ListCard = ({ id, name, itemCount, image }: { id: number, name: string, itemCount: number, image: string | null }) => (
	<TouchableOpacity 
		style={styles.listCard} 
		onPress={() => router.push(`/(drawer)/sauce/lists/${id}`)}
	>
		<View style={styles.listPreview}>
			{image ? (
				<Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
			) : (
				<View style={styles.placeholderPreview}>
					<Ionicons name="list" size={32} color={tw_colors.zinc700} />
				</View>
			)}
		</View>
		<View style={styles.listInfo}>
			<RegularText style={styles.listName} numberOfLines={1}>{name}</RegularText>
			<RegularText style={styles.listItemCount}>{itemCount} items</RegularText>
		</View>
	</TouchableOpacity>
);

const OfflineCard = ({ sauce }: { sauce: any }) => (
	<TouchableOpacity 
		style={styles.listCard} 
		onPress={() => router.push({ pathname: '/[id]', params: { id: sauce.id, type: 'sauce' } })}
	>
		<View style={styles.listPreview}>
			{sauce.cover ? (
				<Image source={{ uri: sauce.cover }} style={styles.previewImage} resizeMode="cover" />
			) : (
				<View style={styles.placeholderPreview}>
					<Ionicons name="cloud-offline" size={32} color={tw_colors.zinc700} />
				</View>
			)}
		</View>
		<View style={styles.listInfo}>
			<RegularText style={styles.listName} numberOfLines={1}>{sauce.title}</RegularText>
			<RegularText style={styles.listItemCount}>{sauce.pages} pages</RegularText>
		</View>
	</TouchableOpacity>
);

export default function MySpace() {
	const { data: lists, isLoading: listsLoading } = useQuery({
		queryKey: ['sauce_lists'],
		queryFn: fetchSauceLists,
	});

	const { data: offlineSauces, isLoading: offlineLoading } = useQuery({
		queryKey: ['offline_sauce'],
		queryFn: getDownloadedSauces,
	});

	const customLists = lists?.filter(l => !l.name.toLowerCase().includes('favorite') && !l.name.toLowerCase().includes('liked')) || [];
	const favoriteList = lists?.find(l => l.name.toLowerCase().includes('favorite'));
	const likedList = lists?.find(l => l.name.toLowerCase().includes('liked'));

	return (
		<ProtectedScreen>
			<Screen safe_area={true} style={styles.root}>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
					<View style={styles.header}>
						<RegularText style={styles.headerTitle}>My Space</RegularText>
						<TouchableOpacity onPress={() => router.push('/settings')}>
							<Ionicons name="settings-outline" size={24} color={tw_colors.white} />
						</TouchableOpacity>
					</View>

					<Section title="My Lists" onSeeAll={() => router.push('/(drawer)/sauce/lists')}>
						<FlatList
							horizontal
							data={customLists}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => (
								<ListCard 
									id={item.id} 
									name={item.name} 
									itemCount={item.item_count} 
									image={item.preview_images?.[0] || null} 
								/>
							)}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.horizontalList}
							ListEmptyComponent={
								<TouchableOpacity 
									style={[styles.listCard, styles.addListCard]}
									onPress={() => router.push('/(drawer)/sauce/lists')}
								>
									<Ionicons name="add" size={32} color={tw_colors.zinc600} />
									<RegularText style={styles.addListText}>New List</RegularText>
								</TouchableOpacity>
							}
						/>
					</Section>

					<Section title="Offline Content">
						<FlatList
							horizontal
							data={offlineSauces || []}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => <OfflineCard sauce={item} />}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.horizontalList}
							ListEmptyComponent={
								<View style={styles.emptyHorizontal}>
									<RegularText style={styles.emptyText}>No offline items.</RegularText>
								</View>
							}
						/>
					</Section>

					<Section title="Favorites">
						{favoriteList ? (
							<ListCard 
								id={favoriteList.id} 
								name={favoriteList.name} 
								itemCount={favoriteList.item_count} 
								image={favoriteList.preview_images?.[0] || null} 
							/>
						) : (
							<View style={styles.emptySection}>
								<RegularText style={styles.emptyText}>No favorites yet.</RegularText>
							</View>
						)}
					</Section>

					<Section title="Liked Items">
						{likedList ? (
							<ListCard 
								id={likedList.id} 
								name={likedList.name} 
								itemCount={likedList.item_count} 
								image={likedList.preview_images?.[0] || null} 
							/>
						) : (
							<View style={styles.emptySection}>
								<RegularText style={styles.emptyText}>No liked items yet.</RegularText>
							</View>
						)}
					</Section>
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
	scrollContent: {
		paddingBottom: 40,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 20,
	},
	headerTitle: {
		fontSize: 32,
		fontWeight: 'bold',
		color: tw_colors.white,
	},
	section: {
		marginTop: 24,
		paddingHorizontal: 20,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: tw_colors.white,
	},
	seeAll: {
		color: tw_colors.blue500,
		fontSize: 14,
	},
	horizontalList: {
		gap: 16,
	},
	listCard: {
		width: 140,
		backgroundColor: tw_colors.zinc900,
		borderRadius: 16,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: tw_colors.zinc800,
	},
	listPreview: {
		height: 100,
		backgroundColor: tw_colors.zinc800,
	},
	previewImage: {
		width: '100%',
		height: '100%',
	},
	placeholderPreview: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	listInfo: {
		padding: 10,
	},
	listName: {
		fontSize: 14,
		fontWeight: 'bold',
		color: tw_colors.white,
	},
	listItemCount: {
		fontSize: 12,
		color: tw_colors.zinc500,
	},
	addListCard: {
		justifyContent: 'center',
		alignItems: 'center',
		borderStyle: 'dashed',
		height: 160,
	},
	addListText: {
		marginTop: 8,
		color: tw_colors.zinc600,
		fontSize: 14,
	},
	emptySection: {
		padding: 20,
		backgroundColor: tw_colors.zinc900,
		borderRadius: 16,
		alignItems: 'center',
	},
	emptyHorizontal: {
		width: 140,
		height: 160,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: tw_colors.zinc900,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: tw_colors.zinc800,
	},
	emptyText: {
		color: tw_colors.zinc500,
		textAlign: 'center',
		fontSize: 12,
	},
});
