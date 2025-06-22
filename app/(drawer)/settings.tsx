import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import { StyleSheet, Text, View } from 'react-native';

export default function Settings() {
	return (
		<Screen safe_area={true}>
			<RegularText>Settings</RegularText>
		</Screen>
	);
}

const styles = StyleSheet.create({});
