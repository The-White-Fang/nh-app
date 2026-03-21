import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import tw_colors from '@/constants/tw-colors';
import { fetch_sauce_filters, fetch_sauces, SauceSearchParams } from '@/services/sauce';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ItemCard, { SkeletonItemCard } from '@/components/ui/ItemCard';
import { ActivityIndicator, Searchbar, Snackbar, Button } from 'react-native-paper';

export default function Search() {
	const [search, set_search] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [error_message, set_error_message] = useState('');
	const [selected_filter, set_selected_filter] = useState({} as Partial<Record<Exclude<keyof SauceSearchParams, 'search' | 'page' | 'page_size'>, number[]>>);
	const [pending_filter, set_pending_filter] = useState({} as Partial<Record<Exclude<keyof SauceSearchParams, 'search' | 'page' | 'page_size'>, number[]>>);
	const [active_category, set_active_category] = useState<string | null>(null);

	const bottomsheet_ref = useRef<BottomSheet>(null);

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

	const { isLoading: isLoadingFilters, data: filterData, refetch: refetchFilters, error: filterError } = useQuery({
		queryKey: ['sauce_filters'],
		queryFn: fetch_sauce_filters,
		enabled: false,
		retry: false,
	});

	const hasActiveFilters = Object.values(selected_filter).some(arr => arr && arr.length > 0);
	const isSearchActive = debouncedSearch.trim().length > 0 || hasActiveFilters;

	const {
		data: searchData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isLoadingSearch,
		isError,
		error: searchError,
		refetch: refetchSearch,
	} = useInfiniteQuery({
		queryKey: ['sauce_search', debouncedSearch, selected_filter],
		queryFn: ({ pageParam = 1 }) => fetch_sauces({
			search: debouncedSearch,
			...selected_filter,
			page: pageParam,
			page_size: 20
		}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.sauces.length < 20) return undefined;
			return allPages.length + 1;
		},
		enabled: isSearchActive,
	});

	useEffect(() => {
		const error = filterError || searchError;
		if (error) {
			set_error_message((error as Error).message);
		}
	}, [filterError, searchError]);

	function openFilters() {
		refetchFilters();
		set_pending_filter(selected_filter);
		set_active_category(null);
		bottomsheet_ref.current?.expand();
	}

	function handleCategoryPress(key: string) {
		set_active_category(key);
	}

	function handleBackToCategories() {
		set_active_category(null);
	}

	function handleOptionToggle(key: string, id: number) {
		set_pending_filter((prev) => {
			const current = (prev as any)[key] || [];
			if (current.includes(id)) {
				return { ...prev, [key]: current.filter((val: number) => val !== id) };
			} else {
				return { ...prev, [key]: [...current, id] };
			}
		});
	}

	function resetFilters() {
		set_pending_filter({});
	}
	
	function applyFilters() {
		set_selected_filter(pending_filter);
		bottomsheet_ref.current?.close();
	}

	const allSauces = useMemo(() => {
		return searchData?.pages.flatMap(page => page.sauces) ?? [];
	}, [searchData]);

	return (
		<Screen safe_area style={styles.root}>
			<View style={styles.header_container}>
				<View style={styles.search_bar_box}>
					<Searchbar 
						placeholder='Search Sauce...' 
						value={search} 
						onChangeText={set_search} 
						style={styles.search_bar} 
						inputStyle={styles.search_input}
						iconColor={tw_colors.zinc400}
						placeholderTextColor={tw_colors.zinc500}
						loading={isLoadingSearch && allSauces.length === 0}
					/>
					<TouchableOpacity style={styles.filter_icon_btn} onPress={openFilters}>
						<Ionicons name='options-outline' size={24} color={hasActiveFilters ? tw_colors.blue400 : tw_colors.white} />
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.main_view}>
				{!isSearchActive ? (
					<View style={styles.empty_view}>
						<MaterialIcons name='search' size={80} color={tw_colors.zinc800} />
						<Text style={styles.empty_text}>Find your custom sauce</Text>
						<Text style={styles.empty_subtext}>Type a name or hit the filter button above</Text>
					</View>
				) : isLoadingSearch && allSauces.length === 0 ? (
					<FlatList
						data={[1,2,3,4,5,6,7,8,9,10,11,12]}
						keyExtractor={(i) => i.toString()}
						numColumns={3}
						columnWrapperStyle={styles.listColumnWrapper}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
						renderItem={() => <SkeletonItemCard style={styles.gridCard} />}
					/>
				) : allSauces.length === 0 ? (
					<View style={styles.empty_view}>
						<MaterialIcons name='search-off' size={64} color={tw_colors.zinc700} />
						<Text style={styles.empty_text}>No sauce found</Text>
						<Text style={styles.empty_subtext}>Try different search terms or filters</Text>
					</View>
				) : (
					<FlatList
						data={allSauces}
						keyExtractor={(item) => item.id.toString()}
						numColumns={3}
						columnWrapperStyle={styles.listColumnWrapper}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) {
								fetchNextPage();
							}
						}}
						onEndReachedThreshold={0.5}
						ListFooterComponent={
							isFetchingNextPage ? (
								<ActivityIndicator style={{ marginVertical: 20 }} color={tw_colors.blue500} />
							) : null
						}
						renderItem={({ item }) => (
							<ItemCard
								id={item.id}
								title={item.title}
								imageUrl={item.cover ?? 'https://via.placeholder.com/300x450'}
								style={styles.gridCard}
								onPress={() => router.push({ pathname: '/[id]', params: { id: item.id.toString(), type: 'sauce' } })}
							/>
						)}
					/>
				)}
			</View>

			<Snackbar
				rippleColor={tw_colors.amber800}
				visible={!!error_message}
				onDismiss={() => set_error_message('')}
				action={{ label: 'Dismiss', onPress: () => set_error_message('') }}
			>
				{error_message}
			</Snackbar>

			<BottomSheet
				ref={bottomsheet_ref}
				enablePanDownToClose
				snapPoints={['65%', '90%']}
				index={-1}
				backdropComponent={(props) => (
					<BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
				)}
				handleIndicatorStyle={styles.sheet_indicator}
				handleStyle={styles.sheet_handle}
				backgroundStyle={styles.sheet_background}
			>
				<BottomSheetView style={styles.sheet_content}>
					{isLoadingFilters && !filterData ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size={40} color={tw_colors.blue500} />
						</View>
					) : filterData ? (
						<View style={{ flex: 1 }}>
							{!active_category ? (
								<CategoriesView 
									data={filterData} 
									pending_filter={pending_filter} 
									onCategoryPress={handleCategoryPress}
									onReset={resetFilters}
								/>
							) : (
								<OptionsView
									category={active_category}
									options={(filterData as any)[active_category]}
									selectedValues={(pending_filter as any)[active_category] || []}
									onToggle={(id: number) => handleOptionToggle(active_category, id)}
									onBack={handleBackToCategories}
								/>
							)}
							<View style={styles.applyBtnContainer}>
								<Button mode="contained" onPress={applyFilters} buttonColor={tw_colors.blue600}>
									Apply Filters
								</Button>
							</View>
						</View>
					) : null}
				</BottomSheetView>
			</BottomSheet>
		</Screen>
	);
}

function CategoriesView({ data, pending_filter, onCategoryPress, onReset }: any) {
	const filter_names = Object.keys(data);
	return (
		<View style={styles.viewContainer}>
			<View style={styles.sheet_header}>
				<Text style={styles.sheet_title}>Filters</Text>
				<TouchableOpacity onPress={onReset}>
					<Text style={styles.sheet_subtitle_action}>Clear All</Text>
				</TouchableOpacity>
			</View>

			<BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.categories_list}>
				{filter_names.map((key: string) => {
					const selections = (pending_filter as any)[key] || [];
					const count = selections.length;
					const label = key[0].toUpperCase() + key.slice(1);
					
					return (
						<TouchableOpacity 
							key={key} 
							style={styles.category_row} 
							onPress={() => onCategoryPress(key)}
						>
							<Text style={styles.category_label}>{label}</Text>
							<View style={styles.category_right}>
								{count > 0 && (
									<View style={styles.category_badge}>
										<Text style={styles.category_badge_text}>{count}</Text>
									</View>
								)}
								<MaterialIcons name='chevron-right' size={28} color={tw_colors.zinc500} />
							</View>
						</TouchableOpacity>
					);
				})}
			</BottomSheetScrollView>
		</View>
	);
}

function OptionsView({ category, options, selectedValues, onToggle, onBack }: any) {
	const [searchQuery, setSearchQuery] = useState('');
	
	const filteredOptions = useMemo(() => {
		if (!searchQuery) return options.slice(0, 50); // limit to 50 for performance
		return options.filter((o: any) => o.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 50);
	}, [options, searchQuery]);

	const label = category[0].toUpperCase() + category.slice(1);

	return (
		<View style={styles.viewContainer}>
			<View style={styles.sheet_header_back}>
				<TouchableOpacity style={styles.back_btn} onPress={onBack}>
					<MaterialIcons name='arrow-back-ios' size={22} color={tw_colors.white} />
				</TouchableOpacity>
				<Text style={styles.sheet_title_centered}>{label}</Text>
				<View style={{ width: 40 }} />
			</View>

			<View style={styles.options_search_box}>
				<MaterialIcons name='search' size={20} color={tw_colors.zinc400} />
				<BottomSheetTextInput 
					style={styles.options_search_input}
					placeholder={`Search ${label}...`}
					placeholderTextColor={tw_colors.zinc500}
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
			</View>

			<BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.options_list}>
				{filteredOptions.map((opt: any) => {
					const isSelected = selectedValues.includes(opt.id);
					return (
						<TouchableOpacity 
							key={opt.id} 
							style={[styles.option_row, isSelected && styles.option_row_selected]}
							onPress={() => onToggle(opt.id)}
						>
							<Text style={[styles.option_label, isSelected && styles.option_label_selected]}>{opt.name}</Text>
							{isSelected && (
								<Ionicons name='checkmark-circle' size={24} color={tw_colors.blue500} />
							)}
						</TouchableOpacity>
					);
				})}
				{filteredOptions.length === 0 && (
					<Text style={styles.no_results_text}>No results found.</Text>
				)}
			</BottomSheetScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: tw_colors.zinc950,
	},
	header_container: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: tw_colors.zinc900,
	},
	search_bar_box: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	search_bar: {
		flex: 1,
		backgroundColor: tw_colors.zinc900,
		borderRadius: 12,
		height: 48,
	},
	search_input: {
		color: tw_colors.white,
		fontSize: 16,
		paddingBottom: 0,
		textAlignVertical: 'center',
	},
	filter_icon_btn: {
		backgroundColor: tw_colors.zinc800,
		width: 48,
		height: 48,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: tw_colors.zinc700,
	},
	main_view: {
		flex: 1,
		paddingHorizontal: 12,
		paddingTop: 10,
	},
	loading_view: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 12,
	},
	loading_text: {
		color: tw_colors.zinc400,
		fontSize: 16,
	},
	empty_view: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 100,
	},
	empty_text: {
		color: tw_colors.zinc100,
		fontSize: 20,
		fontWeight: 'bold',
		marginTop: 20,
	},
	empty_subtext: {
		color: tw_colors.zinc500,
		fontSize: 16,
		marginTop: 8,
	},
	listColumnWrapper: {
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	listContent: {
		paddingBottom: 40,
	},
	gridCard: {
		width: '32%',
		marginBottom: 0,
	},
	sheet_background: {
		backgroundColor: tw_colors.zinc900,
	},
	sheet_handle: {
		backgroundColor: tw_colors.zinc900,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingVertical: 14,
	},
	sheet_indicator: {
		backgroundColor: tw_colors.zinc600,
		width: 50,
		height: 6,
		borderRadius: 10,
	},
	sheet_content: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	viewContainer: {
		flex: 1,
		paddingHorizontal: 20,
	},
	sheet_header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: tw_colors.zinc800,
		marginBottom: 10,
	},
	sheet_title: {
		fontSize: 26,
		fontWeight: 'bold',
		color: tw_colors.white,
	},
	sheet_subtitle_action: {
		fontSize: 16,
		color: tw_colors.blue400,
		fontWeight: '600',
	},
	categories_list: {
		paddingBottom: 80,
	},
	category_row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 18,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: tw_colors.zinc800,
	},
	category_label: {
		fontSize: 18,
		fontWeight: '500',
		color: tw_colors.zinc100,
	},
	category_right: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	category_badge: {
		backgroundColor: tw_colors.blue600,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	category_badge_text: {
		color: tw_colors.white,
		fontSize: 14,
		fontWeight: 'bold',
	},
	sheet_header_back: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingBottom: 16,
	},
	back_btn: {
		width: 40,
		height: 40,
		justifyContent: 'center',
	},
	sheet_title_centered: {
		fontSize: 20,
		fontWeight: 'bold',
		color: tw_colors.white,
	},
	options_search_box: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: tw_colors.zinc800,
		borderRadius: 12,
		paddingHorizontal: 14,
		marginBottom: 16,
		height: 48,
		borderWidth: 1,
		borderColor: tw_colors.zinc700,
	},
	options_search_input: {
		flex: 1,
		height: '100%',
		color: tw_colors.white,
		fontSize: 16,
		marginLeft: 8,
	},
	options_list: {
		paddingBottom: 100,
	},
	option_row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 16,
		paddingHorizontal: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: tw_colors.zinc800,
		borderRadius: 8,
	},
	option_row_selected: {
		backgroundColor: tw_colors.zinc800 + '80', // slight highlight
	},
	option_label: {
		fontSize: 16,
		color: tw_colors.zinc300,
	},
	option_label_selected: {
		color: tw_colors.white,
		fontWeight: '600',
	},
	no_results_text: {
		color: tw_colors.zinc500,
		fontSize: 16,
		textAlign: 'center',
		marginTop: 20,
		paddingBottom: 20,
	},
	applyBtnContainer: {
		position: 'absolute',
		bottom: 20,
		left: 20,
		right: 20,
	},
});
