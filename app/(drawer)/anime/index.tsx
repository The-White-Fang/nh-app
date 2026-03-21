import Screen from '@/components/ui/Screen';
import MediaCarousel from '@/components/ui/MediaCarousel';
import tw_colors from '@/constants/tw-colors';
import React, { Suspense } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useQuery, useSuspenseQueries } from '@tanstack/react-query';
import { router } from 'expo-router';
import { fetchLists } from '@/services/lists';
import { fetch_animes } from '@/services/anime';
import { useAuthSession } from '@/context/auth_context';

const MOCK_IMAGE = 'https://via.placeholder.com/300x450';

function HomeSkeleton() {
	return (
		<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
			<MediaCarousel title="Trending Now" data={[]} isLoading={true} />
			<MediaCarousel title="Recently Added Episodes" data={[]} isLoading={true} />
			<MediaCarousel title="Top Rated All Time" data={[]} isLoading={true} />
		</ScrollView>
	);
}

function HomeContent() {
	const { is_logged_in } = useAuthSession();

	const { data: listsData } = useQuery({
		queryKey: ['anime_lists'],
		queryFn: () => fetchLists(),
		enabled: is_logged_in,
	});

	const [
		{ data: trendingData },
		{ data: recentData },
		{ data: topData }
	] = useSuspenseQueries({
		queries: [
			{ queryKey: ['anime_home', 'trending'], queryFn: () => fetch_animes({ page: 1, page_size: 15 }) },
			{ queryKey: ['anime_home', 'recent'], queryFn: () => fetch_animes({ page: 2, page_size: 15 }) },
			{ queryKey: ['anime_home', 'top'], queryFn: () => fetch_animes({ page: 3, page_size: 15 }) },
		]
	});

	const myLists = React.useMemo(() => {
		if (!listsData || !Array.isArray(listsData)) return [];
		return listsData
			.filter((l) => l.is_pinned)
			.map((list) => ({
				id: list.id,
				title: list.name,
				imageUrl: list.preview_images?.[0] ?? 'https://via.placeholder.com/300x450?text=No+Items',
			}));
	}, [listsData]);

	const formatCarouselData = (animes: any[] | undefined) => {
		if (!animes) return [];
		return animes.map(a => ({
			id: a.id,
			title: a.title,
			imageUrl: a.image_url ?? MOCK_IMAGE
		}));
	};

	return (
		<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
			
			{myLists.length > 0 ? (
				<MediaCarousel 
					title="My Lists" 
					data={myLists} 
					onItemPress={(item) => router.push(`/(drawer)/anime/lists/${item.id}`)} 
				/>
			) : null}

			<MediaCarousel 
				title="Trending Now" 
				data={formatCarouselData(trendingData?.animes)} 
				onItemPress={(item) => router.push({ pathname: '/[id]', params: { id: item.id.toString(), type: 'anime' } })} 
			/>

			<MediaCarousel 
				title="Recently Added Episodes" 
				data={formatCarouselData(recentData?.animes)} 
				onItemPress={(item) => router.push({ pathname: '/[id]', params: { id: item.id.toString(), type: 'anime' } })} 
			/>

			<MediaCarousel 
				title="Top Rated All Time" 
				data={formatCarouselData(topData?.animes)} 
				onItemPress={(item) => router.push({ pathname: '/[id]', params: { id: item.id.toString(), type: 'anime' } })} 
			/>
		</ScrollView>
	);
}

export default function Home() {
	return (
		<Screen safe_area={true} style={styles.root}>
			<Suspense fallback={<HomeSkeleton />}>
				<HomeContent />
			</Suspense>
		</Screen>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: tw_colors.zinc950 },
	scrollContent: { paddingBottom: 40 },
});
