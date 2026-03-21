import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import tw_colors from '@/constants/tw-colors';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/services/auth';
import { useAuthSession } from '@/context/auth_context';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: windowWidth } = Dimensions.get('window');

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
			<LinearGradient
				colors={[tw_colors.zinc950, tw_colors.zinc900, tw_colors.zinc950]}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			/>
			
			<View style={styles.content}>
				<View style={styles.header}>
					<TouchableOpacity 
						onPress={() => {
							if (router.canGoBack()) {
								router.back();
							} else {
								router.replace('/(drawer)/anime');
							}
						}} 
						style={styles.backButton} 
						activeOpacity={0.7}
					>
						<BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
						<Ionicons name="arrow-back" size={24} color={tw_colors.white} />
					</TouchableOpacity>
					
					<View style={styles.logoContainer}>
						<LinearGradient
							colors={[tw_colors.zinc800, tw_colors.zinc700]}
							style={styles.logoBadge}
						>
							<Ionicons name="flash" size={32} color={tw_colors.white} />
						</LinearGradient>
					</View>
					<RegularText style={styles.title}>Welcome Back</RegularText>
					<RegularText style={styles.subtitle}>Sign in to your account</RegularText>
				</View>

				<View style={styles.formCard}>
					<BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
					<View style={styles.formContent}>
						<View style={styles.form}>
							<View style={styles.inputWrapper}>
								<Ionicons name="person-outline" size={20} color={tw_colors.zinc500} style={styles.inputIcon} />
								<TextInput
									style={styles.input}
									placeholder="Username"
									placeholderTextColor={tw_colors.zinc500}
									value={username}
									onChangeText={setUsername}
									autoCapitalize="none"
								/>
							</View>
							
							<View style={styles.inputWrapper}>
								<Ionicons name="lock-closed-outline" size={20} color={tw_colors.zinc500} style={styles.inputIcon} />
								<TextInput
									style={styles.input}
									placeholder="Password"
									placeholderTextColor={tw_colors.zinc500}
									value={password}
									onChangeText={setPassword}
									secureTextEntry
								/>
							</View>

							<TouchableOpacity 
								style={[styles.button, (isPending || !username || !password) && styles.buttonDisabled]} 
								onPress={() => doLogin()} 
								disabled={isPending || !username || !password}
								activeOpacity={0.8}
							>
								<LinearGradient
									colors={[tw_colors.zinc100, tw_colors.zinc300]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={StyleSheet.absoluteFill}
								/>
								{isPending ? (
									<ActivityIndicator color={tw_colors.white} />
								) : (
									<RegularText style={styles.buttonText}>Login</RegularText>
								)}
							</TouchableOpacity>

							<View style={styles.linkContainer}>
								<RegularText style={styles.linkTextBase}>Don't have an account? </RegularText>
								<Link href="/register" asChild>
									<TouchableOpacity>
										<RegularText style={styles.linkTextAction}>Sign up</RegularText>
									</TouchableOpacity>
								</Link>
							</View>
						</View>
					</View>
				</View>
			</View>

			<Snackbar
				visible={!!error_msg}
				onDismiss={() => set_error_msg('')}
				duration={4000}
				style={styles.snackbar}
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
		paddingHorizontal: 28,
	},
	header: {
		alignItems: 'center',
		marginBottom: 32,
		marginTop: 20,
		width: '100%',
	},
	backButton: {
		alignSelf: 'flex-start',
		width: 44,
		height: 44,
		borderRadius: 14,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
		marginBottom: 20,
	},
	logoContainer: {
		marginBottom: 24,
		shadowColor: tw_colors.blue500,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		elevation: 10,
	},
	logoBadge: {
		width: 72,
		height: 72,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontSize: 34,
		fontWeight: '900',
		color: tw_colors.white,
		letterSpacing: -0.5,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 17,
		color: tw_colors.zinc400,
		fontWeight: '500',
	},
	formCard: {
		borderRadius: 32,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.12)',
		backgroundColor: 'rgba(255, 255, 255, 0.03)',
	},
	formContent: {
		padding: 32,
	},
	form: {
		gap: 20,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
		borderRadius: 18,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.08)',
		paddingHorizontal: 16,
	},
	inputIcon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		color: tw_colors.white,
		paddingVertical: 16,
		fontSize: 16,
		fontWeight: '500',
	},
	button: {
		height: 58,
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		marginTop: 8,
		shadowColor: tw_colors.blue600,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		color: tw_colors.black,
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 0.5,
	},
	linkContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 12,
	},
	linkTextBase: {
		color: tw_colors.zinc500,
		fontSize: 15,
	},
	linkTextAction: {
		color: tw_colors.blue400,
		fontSize: 15,
		fontWeight: 'bold',
	},
	snackbar: {
		backgroundColor: tw_colors.zinc800,
		borderRadius: 12,
		bottom: 24,
	},
});

export default Login;
