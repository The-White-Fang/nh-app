import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';

const Login = () => {
	return (
		<Screen style={styles.root}>
			<RegularText>login</RegularText>
		</Screen>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		color: 'blue',
	},
});

export default Login;
