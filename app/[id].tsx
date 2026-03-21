import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import AnimeDetail from '@/components/screens/AnimeDetail';
import SauceDetail from '@/components/screens/SauceDetail';

export default function DetailDispatcher() {
	const { id, type } = useLocalSearchParams<{ id: string; type: string }>();

	if (type === 'anime') {
		return <AnimeDetail />;
	}

	// Default to sauce or handle specifically
	return <SauceDetail />;
}
