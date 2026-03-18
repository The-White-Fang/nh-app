import tw_colors from '@/constants/tw-colors';
import React from 'react';
import { FlatList, StyleSheet, Text, View, ScrollView } from 'react-native';
import ItemCard, { SkeletonItemCard } from './ItemCard';

interface MediaItem {
	id: string | number;
	title: string;
	imageUrl: string;
}

interface MediaCarouselProps {
	title: string;
	data: MediaItem[];
	onItemPress?: (item: MediaItem) => void;
	isLoading?: boolean;
}

export default function MediaCarousel({ title, data, onItemPress, isLoading }: MediaCarouselProps) {
	return (
		<View style={styles.container}>
			<Text style={styles.headerTitle}>{title}</Text>
			{isLoading ? (
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
					{[1, 2, 3, 4, 5].map((i) => (
						<SkeletonItemCard key={i} />
					))}
				</ScrollView>
			) : (
				<FlatList
					data={data}
					horizontal
					showsHorizontalScrollIndicator={false}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContainer}
					renderItem={({ item }) => (
						<ItemCard
							id={item.id}
							title={item.title}
							imageUrl={item.imageUrl}
							onPress={() => onItemPress?.(item)}
						/>
					)}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 24,
	},
	headerTitle: {
		color: tw_colors.white,
		fontSize: 22,
		fontWeight: '900',
		marginBottom: 16,
		marginLeft: 16,
		letterSpacing: 0.5,
		textTransform: 'capitalize',
	},
	listContainer: {
		paddingLeft: 16,
		paddingRight: 6,
	},
});
