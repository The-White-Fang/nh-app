import tw_colors from '@/constants/tw-colors';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonProps {
	style?: StyleProp<ViewStyle>;
}

export default function Skeleton({ style }: SkeletonProps) {
	const opacity = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 0.7,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			])
		).start();
	}, [opacity]);

	return (
		<Animated.View style={[styles.skeleton, style, { opacity }]} />
	);
}

const styles = StyleSheet.create({
	skeleton: {
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		borderRadius: 8,
	},
});
