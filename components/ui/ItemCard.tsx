import tw_colors from '@/constants/tw-colors';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface ItemCardProps {
	id: string | number;
	title: string;
	imageUrl: string;
	onPress?: () => void;
	blurhash?: string;
	style?: StyleProp<ViewStyle>;
}

const defaultBlurhash =
	'|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function ItemCard({ id, title, imageUrl, onPress, blurhash, style }: ItemCardProps) {
	return (
		<Pressable onPress={onPress} style={({ pressed }) => [styles.container, style, pressed && styles.pressed]}>
			<Image
				style={styles.image}
				source={{ uri: imageUrl }}
				placeholder={blurhash ?? defaultBlurhash}
				contentFit="cover"
				transition={200}
			/>
			<View style={styles.contentOverlay}>
				<BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
				<LinearGradient
					colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
					style={StyleSheet.absoluteFill}
				/>
				<Text style={styles.title} numberOfLines={2}>
					{title}
				</Text>
			</View>
		</Pressable>
	);
}

import Skeleton from './Skeleton';
export function SkeletonItemCard({ style }: { style?: StyleProp<ViewStyle> }) {
	return <Skeleton style={[styles.container, style]} />;
}

const styles = StyleSheet.create({
	container: {
		width: 120,
		height: 180,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: tw_colors.zinc900,
		marginRight: 10,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	pressed: {
		opacity: 0.8,
		transform: [{ scale: 0.98 }],
	},
	image: {
		width: '100%',
		height: '100%',
		position: 'absolute',
	},
	contentOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 70,
		justifyContent: 'flex-end',
		padding: 8,
		overflow: 'hidden',
	},
	title: {
		color: tw_colors.white,
		fontSize: 12,
		fontWeight: '600',
	},
});
