import tw_colors from '@/constants/tw-colors';
import { StyleSheet, Text, TextProps } from 'react-native';

export default function RegularText({ children, ...rest_props }: TextProps) {
	return (
		<Text style={[styles.regular_text, rest_props.style]} {...rest_props}>
			{children}
		</Text>
	);
}

const styles = StyleSheet.create({
	regular_text: {
		color: tw_colors.white,
	},
});
