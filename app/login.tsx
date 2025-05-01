import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const Login = () => {
	return (
		<View style={styles.root}>
			<Text>login</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		color: 'blue',
	},
});

export default Login;
