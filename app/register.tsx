import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import tw_colors from '@/constants/tw-colors';
import { Link, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Dimensions, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { register, checkAvailability } from '@/services/auth';
import { useAuthSession } from '@/context/auth_context';
import { ActivityIndicator, Snackbar, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width: windowWidth } = Dimensions.get('window');

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
			<LinearGradient
				colors={[tw_colors.zinc950, tw_colors.indigo950, tw_colors.zinc950]}
				style={StyleSheet.absoluteFill}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
						<BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
						<Ionicons name="arrow-back" size={24} color={tw_colors.white} />
					</TouchableOpacity>
					
					<View style={styles.titleContainer}>
						<RegularText style={styles.title}>Create Account</RegularText>
						<RegularText style={styles.subtitle}>Join our community today</RegularText>
					</View>
				</View>

				<View style={styles.formCard}>
					<BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
					<View style={styles.formContent}>
						<View style={styles.form}>
							{/* Username */}
							<View style={styles.inputGroup}>
								<View style={[styles.inputWrapper, !isUsernameAvailable && debouncedUsername.length > 2 && styles.inputError]}>
									<Ionicons name="person-outline" size={20} color={tw_colors.zinc500} style={styles.inputIcon} />
									<TextInput
										style={styles.input}
										placeholder="Username"
										placeholderTextColor={tw_colors.zinc500}
										value={username}
										onChangeText={setUsername}
										autoCapitalize="none"
									/>
									{isCheckingUsername ? (
										<ActivityIndicator size="small" color={tw_colors.blue400} />
									) : debouncedUsername.length > 2 && (
										<Ionicons 
											name={isUsernameAvailable ? "checkmark-circle" : "close-circle"} 
											size={20} 
											color={isUsernameAvailable ? tw_colors.green400 : tw_colors.red400} 
										/>
									)}
								</View>
								{debouncedUsername.length > 2 && !isUsernameAvailable && !isCheckingUsername && (
									<HelperText type="error" visible={true} style={styles.helperText}>
										Username is already taken
									</HelperText>
								)}
							</View>
							
							{/* Email */}
							<View style={styles.inputGroup}>
								<View style={[styles.inputWrapper, !isEmailAvailable && debouncedEmail.includes('@') && styles.inputError]}>
									<Ionicons name="mail-outline" size={20} color={tw_colors.zinc500} style={styles.inputIcon} />
									<TextInput
										style={styles.input}
										placeholder="Email Address"
										placeholderTextColor={tw_colors.zinc500}
										value={email}
										onChangeText={setEmail}
										keyboardType="email-address"
										autoCapitalize="none"
									/>
									{isCheckingEmail ? (
										<ActivityIndicator size="small" color={tw_colors.blue400} />
									) : debouncedEmail.includes('@') && debouncedEmail.includes('.') && (
										<Ionicons 
											name={isEmailAvailable ? "checkmark-circle" : "close-circle"} 
											size={20} 
											color={isEmailAvailable ? tw_colors.green400 : tw_colors.red400} 
										/>
									)}
								</View>
								{debouncedEmail.includes('@') && !isEmailAvailable && !isCheckingEmail && (
									<HelperText type="error" visible={true} style={styles.helperText}>
										Email is already registered
									</HelperText>
								)}
							</View>

							{/* Password */}
							<View style={styles.inputGroup}>
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
								{password.length > 0 && password.length < 6 && (
									<HelperText type="info" visible={true} style={styles.helperText}>
										Password must be at least 6 characters
									</HelperText>
								)}
							</View>

							<TouchableOpacity 
								style={[styles.button, (!isFormValid || isPending) && styles.buttonDisabled]} 
								onPress={() => doRegister()} 
								disabled={!isFormValid || isPending}
								activeOpacity={0.8}
							>
								<LinearGradient
									colors={[tw_colors.blue600, tw_colors.indigo700]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={StyleSheet.absoluteFill}
								/>
								{isPending ? (
									<ActivityIndicator color={tw_colors.white} />
								) : (
									<RegularText style={styles.buttonText}>Create Account</RegularText>
								)}
							</TouchableOpacity>

							<View style={styles.linkContainer}>
								<RegularText style={styles.linkTextBase}>Already have an account? </RegularText>
								<Link href="/login" asChild>
									<TouchableOpacity>
										<RegularText style={styles.linkTextAction}>Log in</RegularText>
									</TouchableOpacity>
								</Link>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>

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
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 28,
		paddingBottom: 40,
		justifyContent: 'center',
	},
	header: {
		marginBottom: 32,
		marginTop: 20,
	},
	backButton: {
		width: 44,
		height: 44,
		borderRadius: 14,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
		marginBottom: 32,
	},
	titleContainer: {
		alignItems: 'flex-start',
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
		gap: 8,
	},
	inputGroup: {
		marginBottom: 12,
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
	inputError: {
		borderColor: tw_colors.red400 + '50',
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
	helperText: {
		marginTop: 4,
		paddingLeft: 4,
	},
	button: {
		height: 58,
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		marginTop: 16,
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
		color: tw_colors.white,
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 0.5,
	},
	linkContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 20,
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

export default Register;
