import Screen from '@/components/ui/Screen';
import tw_colors from '@/constants/tw-colors';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const TAGS = [
	{ id: 1, name: 'Vanilla', color1: '#ffecd2', color2: '#fcb69f' },
	{ id: 2, name: 'Milf', color1: '#f83600', color2: '#f9d423' },
	{ id: 3, name: 'Harem', color1: '#ff0844', color2: '#ffb199' },
	{ id: 4, name: 'School', color1: '#4facfe', color2: '#00f2fe' },
	{ id: 5, name: 'Maid', color1: '#667eea', color2: '#764ba2' },
	{ id: 6, name: 'Elf', color1: '#11998e', color2: '#38ef7d' },
	{ id: 7, name: 'Succubus', color1: '#b224ef', color2: '#7579ff' },
	{ id: 8, name: 'Monster', color1: '#141E30', color2: '#243B55' },
];

export default function Explore() {
	return (
		<Screen safe_area={true} style={styles.root}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>Explore Tags</Text>
				<View style={styles.grid}>
					{TAGS.map((tag) => (
						<TouchableOpacity key={tag.id} style={styles.cardContainer}>
							<LinearGradient
								colors={[tag.color1, tag.color2]}
								style={styles.card}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
							>
								<View style={styles.overlay}>
									<Text style={styles.tagName}>{tag.name}</Text>
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
		backgroundColor: 'rgba(0,0,0,0.3)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tagName: {
		color: tw_colors.white,
		fontSize: 18,
		fontWeight: 'bold',
	},
});
