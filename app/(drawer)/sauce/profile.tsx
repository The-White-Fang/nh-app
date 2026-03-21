import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import { StyleSheet, Text, View } from 'react-native';
import ProtectedScreen from '@/components/ProtectedScreen';

export default function Profile() {
	return (
		<ProtectedScreen>
			<Screen safe_area={true}>
				<RegularText>Profile</RegularText>
			</Screen>
		</ProtectedScreen>
	);
}

const styles = StyleSheet.create({});
