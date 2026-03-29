import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import ItemCard from '@/components/ui/ItemCard';
import tw_colors from '@/constants/tw-colors';
import { fetchSauceListDetail, removeSauceFromList, toggleSaucePin, SauceListDetail as SauceListDetailType } from '@/services/sauce_lists';
// Delete entirely feature for Sauce:
import { api } from '@/helpers/config';
import { getJwt } from '@/services/auth';
import * as SecureStore from 'expo-secure-store';
import { auth_key } from '@/context/auth_context';

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

async function deleteSauceList(id: number): Promise<void> {
	const sessionToken = await SecureStore.getItemAsync(auth_key);
	if (!sessionToken) throw new Error('Not authenticated');
	const jwt = await getJwt(sessionToken);
	const headers = { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' };
	const response = await fetch(`${api}/v1/sauce/lists/${id}`, { method: 'DELETE', headers });
	if (!response.ok) {
		const body = await response.json().catch(() => null);
		throw new Error(body?.message || 'Failed to delete sauce list');
	}
}

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
		queryKey: ['sauce_list', listId],
		queryFn: () => fetchSauceListDetail(listId),
	});

	const { mutate: removeSauce } = useMutation({
		mutationFn: (itemId: number) => removeSauceFromList(listId, itemId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['sauce_list', listId] });
			queryClient.invalidateQueries({ queryKey: ['sauce_lists'] });
		},
		onError: (err: any) => setErrorMsg(err.message || 'Failed to remove sauce'),
	});

	const { mutate: dropList } = useMutation({
		mutationFn: () => deleteSauceList(listId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['sauce_lists'] });
			router.back();
		},
		onError: (err: any) => setErrorMsg(err.message || 'Failed to delete list'),
	});

	const { mutate: pinToggle } = useMutation({
		mutationFn: () => toggleSaucePin(listId),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ['sauce_list', listId] });
			await queryClient.cancelQueries({ queryKey: ['sauce_lists'] });
			
			const previousDetail = queryClient.getQueryData<SauceListDetailType>(['sauce_list', listId]);
			if (previousDetail) {
				queryClient.setQueryData(['sauce_list', listId], {
					...previousDetail,
					is_pinned: !previousDetail.is_pinned
				});
			}
			
			// Also update the index cache if possible
			const previousLists = queryClient.getQueryData<any[]>(['sauce_lists']);
			if (previousLists) {
				queryClient.setQueryData(['sauce_lists'], 
					previousLists.map(l => l.id === listId ? { ...l, is_pinned: !l.is_pinned } : l)
				);
			}

			return { previousDetail, previousLists };
		},
		onError: (err, variables, context: any) => {
			if (context?.previousDetail) {
				queryClient.setQueryData(['sauce_list', listId], context.previousDetail);
			}
			if (context?.previousLists) {
				queryClient.setQueryData(['sauce_lists'], context.previousLists);
			}
			setErrorMsg(err.message || 'Failed to toggle pin');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['sauce_list', listId] });
			queryClient.invalidateQueries({ queryKey: ['sauce_lists'] });
		},
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
			"Remove Sauce",
			`Remove "${title}" from this list?`,
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Remove", style: "destructive", onPress: () => removeSauce(itemId) }
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
					</View>
					<RegularText style={styles.itemCount}>{list.item_count} items</RegularText>
				</View>
				<View style={styles.headerActions}>
					<TouchableOpacity onPress={() => pinToggle()} style={[styles.actionBtn, list.is_pinned && styles.pinBtnActive]}>
						<Ionicons 
							name={list.is_pinned ? "pin" : "pin-outline"} 
							size={20} 
							color={list.is_pinned ? tw_colors.white : tw_colors.zinc400} 
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={confirmDeleteList} style={styles.actionBtn}>
						<Ionicons name="trash-outline" size={20} color={tw_colors.red400} />
					</TouchableOpacity>
				</View>
			</View>

			{list.description ? (
				<View style={styles.descContainer}>
					<RegularText style={styles.descText}>{list.description}</RegularText>
				</View>
			) : null}

			<FlatList
				data={list.items}
				extraData={list}
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
							id={item.sauce_id}
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

export default function SauceListDetail() {
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
	headerTextContainer: {
		flex: 1,
	},
	headerActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	actionBtn: {
		padding: 8,
		borderRadius: 12,
		backgroundColor: tw_colors.zinc900,
		borderWidth: 1,
		borderColor: tw_colors.zinc800,
	},
	pinBtnActive: {
		backgroundColor: tw_colors.blue600,
		borderColor: tw_colors.blue500,
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
