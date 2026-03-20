import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import tw_colors from '@/constants/tw-colors';
import { fetch_sauce_by_id } from '@/services/sauce';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useMemo, useState, useRef } from 'react';
import { FlatList, StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export default function SauceReader() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const sauceId = parseInt(id as string, 10);
	const [currentPage, setCurrentPage] = useState(1);

	const { data: sauce, isLoading } = useQuery({
		queryKey: ['sauce_detail', sauceId],
		queryFn: () => fetch_sauce_by_id(sauceId),
		enabled: !isNaN(sauceId),
	});

	const mediaId = useMemo(() => {
		if (!sauce?.cover) return null;
		const match = sauce.cover.match(/galleries\/(\d+)/);
		return match ? match[1] : null;
	}, [sauce]);

	const pages = useMemo(() => {
		if (!sauce?.pages || !mediaId) return [];
		return Array.from({ length: sauce.pages }, (_, i) => ({
			id: i + 1,
			url: `https://i.nhentai.net/galleries/${mediaId}/${i + 1}.jpg`,
		}));
	}, [sauce?.pages, mediaId]);

	const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const offset = event.nativeEvent.contentOffset.x;
		const page = Math.round(offset / windowWidth) + 1;
		if (page !== currentPage) {
			setCurrentPage(page);
		}
	};

	if (isLoading) {
		return (
			<Screen style={styles.root}>
				<View style={styles.center}>
					<ActivityIndicator size='large' color={tw_colors.blue500} />
					<RegularText style={styles.loadingText}>Loading Reader...</RegularText>
				</View>
			</Screen>
		);
	}

	if (!sauce || !mediaId) {
		return (
			<Screen style={styles.root}>
				<View style={styles.center}>
					<RegularText style={{ color: tw_colors.zinc400 }}>Failed to load content.</RegularText>
					<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
						<Text style={styles.backBtnText}>Go Back</Text>
					</TouchableOpacity>
				</View>
			</Screen>
		);
	}

	return (
		<View style={styles.root}>
			<FlatList
				data={pages}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item.id.toString()}
				onScroll={onScroll}
				scrollEventThrottle={16}
				renderItem={({ item }) => (
					<View style={[styles.pageWrapper, { width: windowWidth, height: windowHeight }]}>
						<Image source={{ uri: item.url }} style={styles.fullImage} contentFit='contain' transition={300} />
					</View>
				)}
				getItemLayout={(_, index) => ({
					length: windowWidth,
					offset: windowWidth * index,
					index,
				})}
				removeClippedSubviews={true}
				maxToRenderPerBatch={2}
				windowSize={3}
			/>

			{/* Overlays */}
			<TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { top: insets.top + 16 }]}>
				<BlurView intensity={30} tint='dark' style={StyleSheet.absoluteFill} />
				<Ionicons name='close' size={28} color={tw_colors.white} />
			</TouchableOpacity>

			<View style={[styles.pageIndicatorContainer, { bottom: insets.bottom + 16 }]}>
				<BlurView intensity={30} tint='dark' style={StyleSheet.absoluteFill} />
				<Text style={styles.pageIndicatorText}>
					{currentPage} / {sauce.pages}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: '#000' },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	loadingText: { color: tw_colors.zinc400, marginTop: 16, fontSize: 16 },
	pageWrapper: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#000',
	},
	fullImage: {
		width: '100%',
		height: '100%',
	},
	closeBtn: {
		position: 'absolute',
		left: 16,
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
		zIndex: 100,
	},
	pageIndicatorContainer: {
		position: 'absolute',
		alignSelf: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
		zIndex: 100,
	},
	pageIndicatorText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: 'bold',
	},
	backBtn: {
		marginTop: 20,
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: tw_colors.blue600,
		borderRadius: 8,
	},
	backBtnText: {
		color: '#fff',
		fontWeight: 'bold',
	},
});
