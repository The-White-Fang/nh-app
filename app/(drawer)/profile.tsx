import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
	return (
		<Screen safe_area={true}>
			<RegularText>Profile</RegularText>
		</Screen>
	);
}

const styles = StyleSheet.create({});
