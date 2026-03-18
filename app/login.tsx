import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import tw_colors from '@/constants/tw-colors';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/services/auth';
import { useAuthSession } from '@/context/auth_context';
import { ActivityIndicator, Snackbar } from 'react-native-paper';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error_msg, set_error_msg] = useState('');
	const { save_token } = useAuthSession();

	const { mutate: doLogin, isPending } = useMutation({
		mutationFn: () => login(username, password),
		onSuccess: async (data) => {
			await save_token(data.token);
			router.replace('/(drawer)/anime');
		},
		onError: (err: any) => {
			set_error_msg(err.message || 'Login failed.');
		}
	});

	return (
		<Screen safe_area={true} style={styles.root}>
			<View style={styles.content}>
				<RegularText style={styles.title}>Welcome Back</RegularText>
				<RegularText style={styles.subtitle}>Sign in to continue</RegularText>

				<View style={styles.formCard}>
					<BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
					<View style={styles.formContent}>
						<View style={styles.form}>
							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Username"
									placeholderTextColor={tw_colors.zinc400}
									value={username}
									onChangeText={setUsername}
									autoCapitalize="none"
								/>
							</View>
							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Password"
									placeholderTextColor={tw_colors.zinc400}
									value={password}
									onChangeText={setPassword}
									secureTextEntry
								/>
							</View>

							<TouchableOpacity 
								style={[styles.button, isPending && { opacity: 0.7 }]} 
								onPress={() => doLogin()} 
								disabled={isPending || !username || !password}
							>
								{isPending ? (
									<ActivityIndicator color={tw_colors.white} />
								) : (
									<RegularText style={styles.buttonText}>Login</RegularText>
								)}
							</TouchableOpacity>

							<Link href="/register" asChild>
								<TouchableOpacity style={styles.linkButton}>
									<RegularText style={styles.linkText}>Don't have an account? Sign up</RegularText>
								</TouchableOpacity>
							</Link>
						</View>
					</View>
				</View>
			</View>
			<Snackbar
				rippleColor={tw_colors.amber800}
				visible={!!error_msg}
				onDismiss={() => set_error_msg('')}
				action={{ label: 'Dismiss', onPress: () => set_error_msg('') }}
			>
				{error_msg}
			</Snackbar>
		</Screen>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: tw_colors.zinc950,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: tw_colors.white,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: tw_colors.zinc400,
		marginBottom: 32,
	},
	formCard: {
		borderRadius: 24,
		overflow: 'hidden',
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	formContent: {
		padding: 24,
	},
	form: {
		gap: 16,
	},
	inputContainer: {
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	input: {
		color: tw_colors.white,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
	},
	button: {
		backgroundColor: tw_colors.blue600,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 8,
	},
	buttonText: {
		color: tw_colors.white,
		fontSize: 16,
		fontWeight: '600',
	},
	linkButton: {
		alignItems: 'center',
		marginTop: 16,
	},
	linkText: {
		color: tw_colors.zinc400,
		fontSize: 14,
	},
});

export default Login;
