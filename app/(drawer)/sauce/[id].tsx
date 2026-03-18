import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import Skeleton from '@/components/ui/Skeleton';
import tw_colors from '@/constants/tw-colors';
import { fetch_sauce_by_id, refresh_sauce } from '@/services/sauce';
import { fetchSauceLists, addSauceToList } from '@/services/sauce_lists';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { ActivityIndicator, Modal, Portal, Button, Snackbar, Menu } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: windowHeight } = Dimensions.get('window');

export default function SauceDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const queryClient = useQueryClient();
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const sauceId = parseInt(id as string, 10);
	
	const [listModalVisible, setListModalVisible] = useState(false);
	const [menuVisible, setMenuVisible] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [successMsg, setSuccessMsg] = useState('');

	useEffect(() => {
		const drawerNav = navigation.getParent('drawer');
		if (drawerNav) drawerNav.setOptions({ swipeEnabled: false });
		return () => {
			if (drawerNav) drawerNav.setOptions({ swipeEnabled: true });
		};
	}, [navigation]);

	const { data: sauce, isLoading } = useQuery({
		queryKey: ['sauce_detail', sauceId],
		queryFn: () => fetch_sauce_by_id(sauceId),
		enabled: !isNaN(sauceId),
	});

	const { data: userLists } = useQuery({
		queryKey: ['sauce_lists'],
		queryFn: () => fetchSauceLists().catch(e => e.message === 'Not authenticated' ? [] : Promise.reject(e)),
	});

	const { mutate: addToList, isPending: isAdding } = useMutation({
		mutationFn: (listId: number) => addSauceToList(listId, sauceId),
		onSuccess: () => {
			setListModalVisible(false);
			queryClient.invalidateQueries({ queryKey: ['sauce_lists'] });
			setSuccessMsg('Successfully added to list!');
		},
		onError: (err: any) => {
			if (err.message?.includes('Duplicate')) setErrorMsg('Already in this list!');
			else setErrorMsg(err.message || 'Failed to add to list');
		}
	});

	const { mutate: doRefresh, isPending: isRefreshing } = useMutation({
		mutationFn: () => refresh_sauce(sauceId),
		onSuccess: () => {
			setMenuVisible(false);
			queryClient.invalidateQueries({ queryKey: ['sauce_detail', sauceId] });
			setSuccessMsg('Item refreshed successfully!');
		},
		onError: (err: any) => setErrorMsg(err.message || 'Failed to refresh item.'),
	});

	if (isLoading) {
		return (
			<Screen style={styles.root}>
				<View style={[styles.header, { top: insets.top + 16 }]}>
					<View style={styles.circularBtn}>
						<BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
						<Ionicons name="arrow-back" size={24} color={tw_colors.white} />
					</View>
					<View style={styles.circularBtn}>
						<BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
						<Ionicons name="ellipsis-vertical" size={24} color={tw_colors.white} />
					</View>
				</View>
				<ScrollView showsVerticalScrollIndicator={false}>
					<Skeleton style={styles.skeletonCover} />
					<View style={styles.content}>
						<Skeleton style={{ width: '80%', height: 32, marginBottom: 12 }} />
						<Skeleton style={{ width: '60%', height: 20, marginBottom: 24 }} />
						<View style={styles.tagsContainer}>
							<Skeleton style={{ width: 60, height: 30, borderRadius: 16 }} />
							<Skeleton style={{ width: 80, height: 30, borderRadius: 16 }} />
							<Skeleton style={{ width: 70, height: 30, borderRadius: 16 }} />
						</View>
						<Skeleton style={{ width: '100%', height: 16, marginBottom: 8 }} />
						<Skeleton style={{ width: '90%', height: 16, marginBottom: 8 }} />
						<Skeleton style={{ width: '95%', height: 16, marginBottom: 8 }} />
					</View>
				</ScrollView>
			</Screen>
		);
	}

	if (!sauce) {
		return (
			<Screen style={styles.root}>
				<View style={[styles.center, { paddingTop: insets.top }]}>
					<RegularText style={{ color: tw_colors.zinc400 }}>Sauce not found.</RegularText>
					<Button onPress={() => router.back()} textColor={tw_colors.blue400} style={{ marginTop: 12 }}>Go Back</Button>
				</View>
			</Screen>
		);
	}

	return (
		<Screen style={styles.root}>
			<View style={[styles.header, { top: insets.top + 16 }]}>
				<TouchableOpacity onPress={() => router.back()} style={styles.circularBtn}>
					<BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
					<Ionicons name="arrow-back" size={24} color={tw_colors.white} />
				</TouchableOpacity>
				<Menu
					visible={menuVisible}
					onDismiss={() => setMenuVisible(false)}
					anchor={
						<TouchableOpacity style={styles.circularBtn} onPress={() => setMenuVisible(true)}>
							<BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
							{isRefreshing ? <ActivityIndicator size={20} color={tw_colors.white} /> : <Ionicons name="ellipsis-vertical" size={24} color={tw_colors.white} />}
						</TouchableOpacity>
					}
					contentStyle={styles.menuContent}
				>
					<Menu.Item 
						onPress={() => { setMenuVisible(false); setListModalVisible(true); }} 
						title="Add to List" 
						leadingIcon="playlist-plus"
						titleStyle={{ color: tw_colors.white }}
					/>
					<Menu.Item 
						onPress={() => doRefresh()} 
						title="Refresh Data" 
						leadingIcon="refresh"
						titleStyle={{ color: tw_colors.white }}
					/>
				</Menu>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.imageContainer}>
					{sauce.cover ? (
						<Image source={{ uri: sauce.cover }} style={styles.coverImage} resizeMode="cover" />
					) : (
						<View style={styles.placeholderImage}>
							<Ionicons name="image-outline" size={64} color={tw_colors.zinc700} />
						</View>
					)}
					<LinearGradient
						colors={['transparent', tw_colors.zinc950]}
						style={styles.gradientOverlay}
					/>
				</View>

				<View style={styles.content}>
					<RegularText style={styles.title}>{sauce.title}</RegularText>
					
					{sauce.english_title && sauce.english_title !== sauce.title && (
						<RegularText style={styles.subtitle}>{sauce.english_title}</RegularText>
					)}
					
					<View style={styles.metaInfoRow}>
						{sauce.pages ? <View style={styles.metaBadge}><RegularText style={styles.metaText}>{sauce.pages} Pages</RegularText></View> : null}
					</View>

					{sauce.tags && sauce.tags.length > 0 && (
						<View style={styles.tagsContainer}>
							{sauce.tags.map((g: any) => (
								<View key={g.id} style={styles.tag}>
									<RegularText style={styles.tagText}>{g.name}</RegularText>
								</View>
							))}
						</View>
					)}

					<RegularText style={styles.sectionTitle}>Details</RegularText>
					
					{sauce.artists && sauce.artists.length > 0 && (
						<View style={styles.attributeRow}>
							<RegularText style={styles.attributeLabel}>Artists:</RegularText>
							<RegularText style={styles.attributeValue}>{sauce.artists.map((a: any) => a.name).join(', ')}</RegularText>
						</View>
					)}
					{sauce.parodies && sauce.parodies.length > 0 && (
						<View style={styles.attributeRow}>
							<RegularText style={styles.attributeLabel}>Parodies:</RegularText>
							<RegularText style={styles.attributeValue}>{sauce.parodies.map((a: any) => a.name).join(', ')}</RegularText>
						</View>
					)}
					{sauce.characters && sauce.characters.length > 0 && (
						<View style={styles.attributeRow}>
							<RegularText style={styles.attributeLabel}>Characters:</RegularText>
							<RegularText style={styles.attributeValue}>{sauce.characters.map((a: any) => a.name).join(', ')}</RegularText>
						</View>
					)}
					
					<View style={{ height: 100 }} />
				</View>
			</ScrollView>

			<Portal>
				<Modal visible={listModalVisible} onDismiss={() => setListModalVisible(false)} contentContainerStyle={styles.modalContent}>
					<RegularText style={styles.modalTitle}>Add to List</RegularText>
					{userLists && userLists.length > 0 ? (
						<ScrollView style={{ maxHeight: 300 }}>
							{userLists.map(list => (
								<TouchableOpacity 
									key={list.id} 
									style={styles.modalListItem} 
									onPress={() => addToList(list.id)}
									disabled={isAdding}
								>
									<Ionicons name="list" size={24} color={tw_colors.zinc400} />
									<RegularText style={styles.modalListText}>{list.name}</RegularText>
								</TouchableOpacity>
							))}
						</ScrollView>
					) : (
						<RegularText style={{ color: tw_colors.zinc500, marginVertical: 12 }}>You don't have any lists yet.</RegularText>
					)}
					<Button onPress={() => setListModalVisible(false)} textColor={tw_colors.zinc400} style={{ marginTop: 12 }}>Cancel</Button>
				</Modal>
			</Portal>

			<Snackbar visible={!!errorMsg} onDismiss={() => setErrorMsg('')} action={{ label: 'Dismiss', onPress: () => setErrorMsg('') }}>{errorMsg}</Snackbar>
			<Snackbar visible={!!successMsg} onDismiss={() => setSuccessMsg('')} action={{ label: 'Dismiss', onPress: () => setSuccessMsg('') }}>{successMsg}</Snackbar>
		</Screen>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: tw_colors.zinc950 },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		position: 'absolute',
		top: 16,
		left: 16,
		right: 16,
		zIndex: 10,
	},
	circularBtn: {
		width: 44,
		height: 44,
		backgroundColor: 'rgba(255,255,255,0.05)',
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
	},
	imageContainer: {
		width: '100%',
		height: windowHeight * 0.55,
		backgroundColor: tw_colors.zinc900,
		position: 'relative',
	},
	coverImage: {
		width: '100%',
		height: '100%',
	},
	placeholderImage: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	gradientOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 200,
	},
	skeletonCover: {
		width: '100%',
		height: windowHeight * 0.55,
		borderRadius: 0,
	},
	content: {
		padding: 24,
		marginTop: -20,
	},
	title: {
		fontSize: 32,
		fontWeight: '900',
		color: tw_colors.white,
		marginBottom: 8,
		lineHeight: 38,
	},
	subtitle: {
		fontSize: 18,
		color: tw_colors.zinc400,
		fontWeight: '600',
		marginBottom: 16,
	},
	metaInfoRow: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 16,
		flexWrap: 'wrap',
	},
	metaBadge: {
		backgroundColor: tw_colors.zinc800,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: tw_colors.zinc700,
	},
	metaText: {
		color: tw_colors.zinc100,
		fontSize: 14,
		fontWeight: '600',
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 32,
	},
	tag: {
		backgroundColor: tw_colors.blue900 + '50',
		borderWidth: 1,
		borderColor: tw_colors.blue600 + '50',
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 16,
	},
	tagText: {
		color: tw_colors.blue300,
		fontSize: 13,
		fontWeight: 'bold',
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: tw_colors.white,
		marginBottom: 16,
		borderTopWidth: 1,
		borderTopColor: tw_colors.zinc800,
		paddingTop: 24,
	},
	attributeRow: {
		flexDirection: 'row',
		marginBottom: 10,
	},
	attributeLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		color: tw_colors.zinc300,
		width: 110,
	},
	attributeValue: {
		flex: 1,
		fontSize: 16,
		color: tw_colors.zinc400,
		lineHeight: 24,
	},
	menuContent: {
		backgroundColor: tw_colors.zinc800,
		borderRadius: 12,
	},
	modalContent: {
		backgroundColor: tw_colors.zinc800,
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
	modalListItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: tw_colors.zinc700,
		gap: 12,
	},
	modalListText: {
		fontSize: 16,
		color: tw_colors.zinc100,
	},
});
