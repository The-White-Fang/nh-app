import { useAuthSession } from '@/context/auth_context';
import { router } from 'expo-router';
import React, { PropsWithChildren } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import tw_colors from '@/constants/tw-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RegularText from '@/components/ui/Text';

const ProtectedScreen: React.FC<PropsWithChildren> = ({ children }) => {
	const { is_logged_in, is_loading } = useAuthSession();

	if (is_loading) {
		return (
			<View style={{ flex: 1, backgroundColor: tw_colors.zinc950, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator color={tw_colors.blue500} size="large" />
			</View>
		);
	}

	if (!is_logged_in) {
		return (
			<View style={{ flex: 1, backgroundColor: tw_colors.zinc950, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
				<View style={{ backgroundColor: tw_colors.zinc900, padding: 32, borderRadius: 24, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: tw_colors.zinc800 }}>
					<View style={{ backgroundColor: tw_colors.zinc800, padding: 16, borderRadius: 20, marginBottom: 20 }}>
						<MaterialIcons name="lock-outline" size={40} color={tw_colors.blue400} />
					</View>
					<RegularText style={{ color: tw_colors.white, fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>Login Required</RegularText>
					<RegularText style={{ color: tw_colors.zinc400, fontSize: 16, textAlign: 'center', marginTop: 8, marginBottom: 28 }}>Please sign in to access this section and view your items.</RegularText>
					
					<TouchableOpacity 
						onPress={() => router.push('/login')}
						style={{ backgroundColor: tw_colors.blue500, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, width: '100%', alignItems: 'center' }}
					>
						<RegularText style={{ color: tw_colors.white, fontSize: 16, fontWeight: 'bold' }}>Sign In</RegularText>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return <>{children}</>;
};

export default ProtectedScreen;
