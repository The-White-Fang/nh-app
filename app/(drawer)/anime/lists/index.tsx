import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import tw_colors from '@/constants/tw-colors';
import { fetchLists, createList, togglePin, fetchListDetail, ListOverview } from '@/services/lists';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { ActivityIndicator, FAB, Modal, Portal, TextInput, Button, Snackbar } from 'react-native-paper';
import Skeleton from '@/components/ui/Skeleton';
import { Suspense } from 'react';
import ProtectedScreen from '@/components/ProtectedScreen';

function AnimeListsSkeleton() {
	return (
		<View style={styles.listContent}>
			{[1, 2, 3, 4].map((i) => (
				<View key={i} style={styles.card}>
					<Skeleton style={styles.cardPreview} />
					<View style={styles.cardInfo}>
						<Skeleton style={{ width: '70%', height: 20, marginBottom: 8 }} />
						<Skeleton style={{ width: '100%', height: 14, marginBottom: 4 }} />
						<Skeleton style={{ width: '40%', height: 12, marginTop: 8 }} />
					</View>
				</View>
			))}
		</View>
	);
}

function AnimeListsContent({ pinToggle, lists }: any) {
	const queryClient = useQueryClient();
	return (
		<FlatList
			data={lists || []}
			extraData={lists}
			keyExtractor={(item: any) => item.id.toString()}
			contentContainerStyle={styles.listContent}
			showsVerticalScrollIndicator={false}
			ListEmptyComponent={
				<View style={styles.emptyContainer}>
					<Ionicons name='list' size={64} color={tw_colors.zinc700} />
					<RegularText style={styles.emptyText}>You haven't created any lists yet.</RegularText>
				</View>
			}
			renderItem={({ item }) => (
				<TouchableOpacity style={styles.card} onPress={() => router.push(`/(drawer)/anime/lists/${item.id}`)} activeOpacity={0.8}>
					<View style={styles.cardPreview}>
						{item.preview_images && item.preview_images.length > 0 ? (
							<Image source={{ uri: item.preview_images[0] }} style={styles.previewImage} resizeMode='cover' />
						) : (
							<View style={styles.placeholderImage}>
								<Ionicons name='image-outline' size={24} color={tw_colors.zinc600} />
							</View>
						)}
					</View>
					<View style={styles.cardInfo}>
						<View style={styles.cardHeader}>
							<RegularText style={styles.cardTitle} numberOfLines={1}>
								{item.name}
							</RegularText>
							<TouchableOpacity onPress={() => pinToggle(item.id)} style={styles.pinBtn}>
								<Entypo name={'pin'} size={22} color={item.is_pinned ? tw_colors.white : tw_colors.zinc500} />
							</TouchableOpacity>
						</View>
						{item.description ? (
							<RegularText style={styles.cardDesc} numberOfLines={2}>
								{item.description}
							</RegularText>
						) : null}
						<RegularText style={styles.itemCount}>{item.item_count} items</RegularText>
					</View>
				</TouchableOpacity>
			)}
		/>
	);
}

function AnimeListsDataWrapper({ setModalVisible, setIsCreating, setErrorMsg, newListName, newListDesc }: any) {
	const queryClient = useQueryClient();
	const { data: lists } = useSuspenseQuery({
		queryKey: ['anime_lists'],
		queryFn: fetchLists,
	});

	const { mutate: pinToggle } = useMutation({
		mutationFn: (id: number) => togglePin(id),
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: ['anime_lists'] });
			const previousLists = queryClient.getQueryData<ListOverview[]>(['anime_lists']);
			if (previousLists) {
				queryClient.setQueryData(
					['anime_lists'],
					previousLists.map((l) => (l.id === id ? { ...l, is_pinned: !l.is_pinned } : l)),
				);
			}
			return { previousLists };
		},
		onError: (err, id, context: any) => {
			if (context?.previousLists) {
				queryClient.setQueryData(['anime_lists'], context.previousLists);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['anime_lists'] });
		},
	});

	const sortedLists = React.useMemo(() => {
		if (!lists) return [];
		return [...lists].sort((a, b) => {
			if (a.is_pinned === b.is_pinned) return 0;
			return a.is_pinned ? -1 : 1;
		});
	}, [lists]);

	return <AnimeListsContent pinToggle={pinToggle} lists={sortedLists} />;
}

export default function AnimeLists() {
	const queryClient = useQueryClient();
	const [isModalVisible, setModalVisible] = useState(false);
	const [newListName, setNewListName] = useState('');
	const [newListDesc, setNewListDesc] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	const { mutate: doCreateList, isPending: isCreating } = useMutation({
		mutationFn: () => createList(newListName, newListDesc),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['anime_lists'] });
			setModalVisible(false);
			setNewListName('');
			setNewListDesc('');
		},
		onError: (err: any) => {
			setErrorMsg(err.message || 'Failed to create list');
		},
	});

	const handleCreate = () => {
		if (!newListName.trim()) {
			setErrorMsg('Name is required');
			return;
		}
		doCreateList();
	};

	return (
		<ProtectedScreen>
			<Screen safe_area={true} style={styles.root}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
						<Ionicons name='arrow-back' size={24} color={tw_colors.white} />
					</TouchableOpacity>
					<RegularText style={styles.headerTitle}>My Anime Lists</RegularText>
				</View>

				<Suspense fallback={<AnimeListsSkeleton />}>
					<AnimeListsDataWrapper setModalVisible={setModalVisible} setErrorMsg={setErrorMsg} />
				</Suspense>

				<FAB icon='plus' style={styles.fab} color={tw_colors.white} onPress={() => setModalVisible(true)} />

				<Portal>
					<Modal visible={isModalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
						<RegularText style={styles.modalTitle}>Create New List</RegularText>
						<TextInput
							mode='outlined'
							label='List Name'
							value={newListName}
							onChangeText={setNewListName}
							style={styles.input}
							textColor={tw_colors.white}
							theme={{ colors: { background: tw_colors.zinc800, primary: tw_colors.blue500, onSurfaceVariant: tw_colors.zinc400 } }}
						/>
						<TextInput
							mode='outlined'
							label='Description (Optional)'
							value={newListDesc}
							onChangeText={setNewListDesc}
							style={styles.input}
							multiline
							numberOfLines={3}
							textColor={tw_colors.white}
							theme={{ colors: { background: tw_colors.zinc800, primary: tw_colors.blue500, onSurfaceVariant: tw_colors.zinc400 } }}
						/>
						<View style={styles.modalActions}>
							<Button onPress={() => setModalVisible(false)} textColor={tw_colors.zinc300}>
								Cancel
							</Button>
							<Button mode='contained' onPress={handleCreate} loading={isCreating} disabled={isCreating} buttonColor={tw_colors.blue600}>
								Create
							</Button>
						</View>
					</Modal>
				</Portal>

				<Snackbar visible={!!errorMsg} onDismiss={() => setErrorMsg('')} action={{ label: 'Dismiss', onPress: () => setErrorMsg('') }}>
					{errorMsg}
				</Snackbar>
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
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: tw_colors.white,
	},
	listContent: {
		padding: 16,
		paddingBottom: 100,
		gap: 16,
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
	card: {
		flexDirection: 'row',
		backgroundColor: tw_colors.zinc900,
		borderRadius: 16,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: tw_colors.zinc800,
		alignItems: 'center',
	},
	cardPreview: {
		width: 100,
		height: 100,
		backgroundColor: tw_colors.zinc800,
	},
	previewImage: {
		width: '100%',
		height: '100%',
	},
	placeholderImage: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cardInfo: {
		flex: 1,
		padding: 16,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 4,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: tw_colors.white,
		flex: 1,
		marginRight: 8,
	},
	pinBtn: {
		padding: 6,
		borderRadius: 10,
		backgroundColor: tw_colors.zinc800,
	},
	pinBtnActive: {
		backgroundColor: tw_colors.blue600,
	},
	cardDesc: {
		fontSize: 14,
		color: tw_colors.zinc400,
		marginBottom: 8,
	},
	itemCount: {
		fontSize: 12,
		color: tw_colors.zinc500,
		fontWeight: '600',
	},
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
		backgroundColor: tw_colors.blue600,
	},
	modalContent: {
		backgroundColor: tw_colors.zinc900,
		padding: 24,
		margin: 20,
		borderRadius: 16,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: tw_colors.white,
		marginBottom: 16,
	},
	input: {
		marginBottom: 16,
		backgroundColor: tw_colors.zinc800,
	},
	modalActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 8,
		marginTop: 8,
	},
});
