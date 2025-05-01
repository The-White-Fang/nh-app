import { View, Text, StyleSheet, ViewProps } from 'react-native';
import React, { PropsWithChildren } from 'react';
import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw_colors from '@/constants/tw-colors';

export const DEFAULT_STATUS_BAR_COLOR = '#000000';

export interface ScreenProps extends ViewProps {
	status_bar_color?: string;
	status_bar_style?: StatusBarStyle;
}

const Screen: React.FC<PropsWithChildren<ScreenProps>> = ({ children, style, status_bar_color = DEFAULT_STATUS_BAR_COLOR, status_bar_style = 'auto', ...other_props }) => {
	return (
		<SafeAreaView style={[styles.root, style]} {...other_props}>
			<StatusBar backgroundColor={status_bar_color} style={status_bar_style} />
			{children}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: tw_colors.black,
	},
});

export default Screen;
