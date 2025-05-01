import Screen from '@/components/Screen';
import tw_colors from '@/constants/tw-colors';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
	return (
		<Screen status_bar_color={tw_colors.zinc950} style={styles.root}>
			<Text>Home</Text>
		</Screen>
	);
}

const styles = StyleSheet.create({
	root: {},
});
