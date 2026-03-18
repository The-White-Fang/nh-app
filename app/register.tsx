import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import tw_colors from '@/constants/tw-colors';
import { Link, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { register, checkAvailability } from '@/services/auth';
import { useAuthSession } from '@/context/auth_context';
import { ActivityIndicator, Snackbar, HelperText } from 'react-native-paper';

const Register = () => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error_msg, set_error_msg] = useState('');
	const { save_token } = useAuthSession();

	const [debouncedUsername, setDebouncedUsername] = useState(username);
	const [debouncedEmail, setDebouncedEmail] = useState(email);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedUsername(username), 500);
		return () => clearTimeout(timer);
	}, [username]);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedEmail(email), 500);
		return () => clearTimeout(timer);
	}, [email]);

	const { data: isUsernameAvailable, isFetching: isCheckingUsername } = useQuery({
		queryKey: ['check-username', debouncedUsername],
		queryFn: () => checkAvailability('username', debouncedUsername),
		enabled: debouncedUsername.length > 2,
	});

	const { data: isEmailAvailable, isFetching: isCheckingEmail } = useQuery({
		queryKey: ['check-email', debouncedEmail],
		queryFn: () => checkAvailability('email', debouncedEmail),
		enabled: debouncedEmail.includes('@') && debouncedEmail.includes('.'),
	});

	const { mutate: doRegister, isPending } = useMutation({
		mutationFn: () => register(username, email, password),
		onSuccess: async (data) => {
			await save_token(data.token);
			router.replace('/(drawer)/anime');
		},
		onError: (err: any) => {
			set_error_msg(err.message || 'Registration failed.');
		}
	});

	const isFormValid = username.length > 2 && email.includes('@') && password.length > 5 && isUsernameAvailable && isEmailAvailable;
	return (
		<Screen safe_area={true} style={styles.root}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={tw_colors.white} />
				</TouchableOpacity>
			</View>
			<View style={styles.content}>
				<RegularText style={styles.title}>Create Account</RegularText>
				<RegularText style={styles.subtitle}>Sign up to get started</RegularText>

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
							{debouncedUsername.length > 2 && (
								<HelperText type={isUsernameAvailable ? 'info' : 'error'} visible={!isCheckingUsername && debouncedUsername.length > 2} style={{ marginTop: -12 }}>
									{isUsernameAvailable ? 'Username is available' : 'Username is taken'}
								</HelperText>
							)}
							
							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Email Address"
									placeholderTextColor={tw_colors.zinc400}
									value={email}
									onChangeText={setEmail}
									keyboardType="email-address"
									autoCapitalize="none"
								/>
							</View>
							{debouncedEmail.includes('@') && debouncedEmail.includes('.') && (
								<HelperText type={isEmailAvailable ? 'info' : 'error'} visible={!isCheckingEmail && debouncedEmail.includes('@')} style={{ marginTop: -12 }}>
									{isEmailAvailable ? 'Email is valid' : 'Email is already registered'}
								</HelperText>
							)}

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
								style={[styles.button, (!isFormValid || isPending) && { opacity: 0.7 }]} 
								onPress={() => doRegister()} 
								disabled={!isFormValid || isPending}
							>
								{isPending ? (
									<ActivityIndicator color={tw_colors.white} />
								) : (
									<RegularText style={styles.buttonText}>Sign Up</RegularText>
								)}
							</TouchableOpacity>

							<Link href="/login" asChild>
								<TouchableOpacity style={styles.linkButton}>
									<RegularText style={styles.linkText}>Already have an account? Log in</RegularText>
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
	header: {
		paddingHorizontal: 24,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 24,
		paddingBottom: 40,
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

export default Register;
