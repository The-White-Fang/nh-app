import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import ItemCard from '@/components/ui/ItemCard';
import tw_colors from '@/constants/tw-colors';
import { fetchListDetail, removeAnimeFromList, deleteList } from '@/services/lists';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import Skeleton from '@/components/ui/Skeleton';
import { Suspense } from 'react';
import { SkeletonItemCard } from '@/components/ui/ItemCard';
import ProtectedScreen from '@/components/ProtectedScreen';

function ListDetailSkeleton() {
	return (
		<Screen safe_area={true} style={styles.root}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name="arrow-back" size={24} color={tw_colors.white} />
				</TouchableOpacity>
				<View style={styles.headerTextContainer}>
					<Skeleton style={{ width: '60%', height: 20, marginBottom: 8 }} />
					<Skeleton style={{ width: '30%', height: 14 }} />
				</View>
			</View>
			<FlatList
				data={[1,2,3,4,5,6,7,8,9,10,11,12]}
				keyExtractor={(i) => i.toString()}
				numColumns={3}
				columnWrapperStyle={styles.listColumnWrapper}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				renderItem={() => (
					<View style={styles.gridCardWrapper}>
						<SkeletonItemCard style={styles.gridCard} />
					</View>
				)}
			/>
		</Screen>
	);
}

function ListDetailContent({ listId }: { listId: number }) {
	const queryClient = useQueryClient();
	const [errorMsg, setErrorMsg] = useState('');

	const { data: list } = useSuspenseQuery({
		queryKey: ['anime_list', listId],
		queryFn: () => fetchListDetail(listId),
	});

	const { mutate: removeAnime } = useMutation({
		mutationFn: (itemId: number) => removeAnimeFromList(listId, itemId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['anime_list', listId] });
			queryClient.invalidateQueries({ queryKey: ['anime_lists'] });
		},
		onError: (err: any) => setErrorMsg(err.message || 'Failed to remove anime'),
	});

	const { mutate: dropList } = useMutation({
		mutationFn: () => deleteList(listId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['anime_lists'] });
			router.back();
		},
		onError: (err: any) => setErrorMsg(err.message || 'Failed to delete list'),
	});

	const confirmDeleteList = () => {
		Alert.alert(
			"Delete List",
			"Are you sure you want to delete this entire list? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Delete", style: "destructive", onPress: () => dropList() }
			]
		);
	};

	const confirmRemoveItem = (itemId: number, title: string) => {
		Alert.alert(
			"Remove Anime",
			`Remove "${title}" from this list?`,
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Remove", style: "destructive", onPress: () => removeAnime(itemId) }
			]
		);
	};

	return (
		<>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name="arrow-back" size={24} color={tw_colors.white} />
				</TouchableOpacity>
				<View style={styles.headerTextContainer}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<RegularText style={styles.headerTitle} numberOfLines={1}>{list.name}</RegularText>
						{list.is_pinned && <Ionicons name="pin" size={16} color={tw_colors.yellow400} style={{ marginLeft: 6 }} />}
					</View>
					<RegularText style={styles.itemCount}>{list.item_count} items</RegularText>
				</View>
				<TouchableOpacity onPress={confirmDeleteList} style={styles.deleteBtn}>
					<Ionicons name="trash-outline" size={24} color={tw_colors.red400} />
				</TouchableOpacity>
			</View>

			{list.description ? (
				<View style={styles.descContainer}>
					<RegularText style={styles.descText}>{list.description}</RegularText>
				</View>
			) : null}

			<FlatList
				data={list.items}
				keyExtractor={(item) => item.id.toString()}
				numColumns={3}
				columnWrapperStyle={styles.listColumnWrapper}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Ionicons name="folder-open-outline" size={64} color={tw_colors.zinc700} />
						<RegularText style={styles.emptyText}>This list is empty.</RegularText>
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.gridCardWrapper}>
						<ItemCard
							id={item.anime_id}
							title={item.title}
							imageUrl={item.image_url ?? 'https://via.placeholder.com/300x450'}
							style={styles.gridCard}
						/>
						<TouchableOpacity 
							style={styles.removeBtnOverlay}
							onPress={() => confirmRemoveItem(item.id, item.title)}
						>
							<Ionicons name="close-circle" size={24} color={tw_colors.red500} />
						</TouchableOpacity>
					</View>
				)}
			/>

			<Snackbar
				visible={!!errorMsg}
				onDismiss={() => setErrorMsg('')}
				action={{ label: 'Dismiss', onPress: () => setErrorMsg('') }}
			>
				{errorMsg}
			</Snackbar>
		</>
	);
}

export default function AnimeListDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const listId = parseInt(id as string, 10);
	if (isNaN(listId)) return null;

	return (
		<ProtectedScreen>
			<Screen safe_area={true} style={styles.root}>
				<Suspense fallback={<ListDetailSkeleton />}>
					<ListDetailContent listId={listId} />
				</Suspense>
			</Screen>
		</ProtectedScreen>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: tw_colors.zinc950,
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: tw_colors.zinc900,
	},
	backBtn: {
		marginRight: 16,
	},
	deleteBtn: {
		marginLeft: 16,
		padding: 4,
	},
	headerTextContainer: {
		flex: 1,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: tw_colors.white,
	},
	itemCount: {
		fontSize: 14,
		color: tw_colors.zinc500,
	},
	descContainer: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: tw_colors.zinc900,
	},
	descText: {
		color: tw_colors.zinc400,
		fontSize: 14,
	},
	listContent: {
		padding: 12,
		paddingBottom: 40,
	},
	listColumnWrapper: {
		justifyContent: 'flex-start',
		gap: 12,
		marginBottom: 12,
	},
	gridCardWrapper: {
		width: '31%',
		position: 'relative',
	},
	gridCard: {
		width: '100%',
		marginBottom: 0,
	},
	removeBtnOverlay: {
		position: 'absolute',
		top: -8,
		right: -8,
		backgroundColor: tw_colors.zinc950,
		borderRadius: 12,
	},
	emptyContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 100,
		gap: 16,
	},
	emptyText: {
		color: tw_colors.zinc500,
		fontSize: 16,
	},
});
