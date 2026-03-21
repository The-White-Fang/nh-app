import Screen from '@/components/ui/Screen';
import MediaCarousel from '@/components/ui/MediaCarousel';
import tw_colors from '@/constants/tw-colors';
import React, { Suspense } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useQuery, useSuspenseQueries } from '@tanstack/react-query';
import { router } from 'expo-router';
import { fetchSauceLists } from '@/services/sauce_lists';
import { fetch_sauces } from '@/services/sauce';
import { useAuthSession } from '@/context/auth_context';

const MOCK_IMAGE = 'https://via.placeholder.com/300x450';

function SauceHomeSkeleton() {
	return (
		<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
			<View style={styles.spacer} />
			<MediaCarousel title="Trending Sauce" data={[]} isLoading={true} />
			<MediaCarousel title="New Releases" data={[]} isLoading={true} />
			<MediaCarousel title="Highly Recommended" data={[]} isLoading={true} />
		</ScrollView>
	);
}

function SauceHomeContent() {
	const { is_logged_in } = useAuthSession();

	const { data: listsData } = useQuery({
		queryKey: ['sauce_lists'],
		queryFn: () => fetchSauceLists(),
		enabled: is_logged_in,
	});

	const [
		{ data: trendingData },
		{ data: recentData },
		{ data: topData }
	] = useSuspenseQueries({
		queries: [
			{ queryKey: ['sauce_home', 'trending'], queryFn: () => fetch_sauces({ page: 1, page_size: 15 }) },
			{ queryKey: ['sauce_home', 'recent'], queryFn: () => fetch_sauces({ page: 2, page_size: 15 }) },
			{ queryKey: ['sauce_home', 'top'], queryFn: () => fetch_sauces({ page: 3, page_size: 15 }) },
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

	const formatCarouselData = (sauces: any[] | undefined) => {
		if (!sauces) return [];
		return sauces.map(s => ({
			id: s.id,
			title: s.title,
			imageUrl: s.cover ?? MOCK_IMAGE
		}));
	};

	return (
		<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
			<View style={styles.spacer} />
			
			{myLists.length > 0 ? (
				<MediaCarousel 
					title="My Lists" 
					data={myLists} 
					onItemPress={(item) => router.push(`/(drawer)/sauce/lists/${item.id}`)} 
				/>
			) : null}

			<MediaCarousel 
				title="Trending Sauce" 
				data={formatCarouselData(trendingData?.sauces)} 
				onItemPress={(item) => router.push({ pathname: '/[id]', params: { id: item.id.toString(), type: 'sauce' } })} 
			/>

			<MediaCarousel 
				title="New Releases" 
				data={formatCarouselData(recentData?.sauces)} 
				onItemPress={(item) => router.push({ pathname: '/[id]', params: { id: item.id.toString(), type: 'sauce' } })} 
			/>

			<MediaCarousel 
				title="Highly Recommended" 
				data={formatCarouselData(topData?.sauces)} 
				onItemPress={(item) => router.push({ pathname: '/[id]', params: { id: item.id.toString(), type: 'sauce' } })} 
			/>
		</ScrollView>
	);
}

export default function SauceHome() {
	return (
		<Screen safe_area={true} style={styles.root}>
			<Suspense fallback={<SauceHomeSkeleton />}>
				<SauceHomeContent />
			</Suspense>
		</Screen>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: tw_colors.zinc950 },
	scrollContent: { paddingBottom: 40 },
	spacer: { height: 20 },
});
