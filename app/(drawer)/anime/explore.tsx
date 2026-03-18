import Screen from '@/components/ui/Screen';
import tw_colors from '@/constants/tw-colors';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GENRES = [
	{ id: 1, name: 'Action', color1: '#FF416C', color2: '#FF4B2B' },
	{ id: 2, name: 'Romance', color1: '#ff9a9e', color2: '#fecfef' },
	{ id: 3, name: 'Comedy', color1: '#f6d365', color2: '#fda085' },
	{ id: 4, name: 'Sci-Fi', color1: '#4facfe', color2: '#00f2fe' },
	{ id: 5, name: 'Horror', color1: '#434343', color2: '#000000' },
	{ id: 6, name: 'Fantasy', color1: '#b224ef', color2: '#7579ff' },
	{ id: 7, name: 'Slice of Life', color1: '#a18cd1', color2: '#fbc2eb' },
	{ id: 8, name: 'Mystery', color1: '#30cfd0', color2: '#330867' },
];

export default function Explore() {
	return (
		<Screen safe_area={true} style={styles.root}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>Explore Genres</Text>
				<View style={styles.grid}>
					{GENRES.map((genre) => (
						<TouchableOpacity key={genre.id} style={styles.cardContainer}>
							<LinearGradient
								colors={[genre.color1, genre.color2]}
								style={styles.card}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
							>
								<View style={styles.overlay}>
									<Text style={styles.genreName}>{genre.name}</Text>
								</View>
							</LinearGradient>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: tw_colors.zinc950,
	},
	scrollContent: {
		paddingBottom: 40,
		paddingHorizontal: 16,
		paddingTop: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: tw_colors.white,
		marginBottom: 20,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	cardContainer: {
		width: '48%',
		aspectRatio: 1.5,
		marginBottom: 16,
		borderRadius: 12,
		overflow: 'hidden',
	},
	card: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.2)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	genreName: {
		color: tw_colors.white,
		fontSize: 18,
		fontWeight: 'bold',
	},
});
