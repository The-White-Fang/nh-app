import Screen from '@/components/ui/Screen';
import RegularText from '@/components/ui/Text';
import tw_colors from '@/constants/tw-colors';
import { AnimeShort, fetch_filters, FetchFilterResponse, search_anime } from '@/services/anime';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView, BottomSheetFlashList, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Portal, PortalHost } from '@gorhom/portal';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { ActivityIndicator, Modal, Searchbar, Snackbar } from 'react-native-paper';

type FilterName = keyof FetchFilterResponse;

export default function Search() {
	const [search, set_search] = useState('');
	const [show_filters, set_show_filters] = useState(false);
	const [error_message, set_error_message] = useState('');
	const [selected_filter, set_selected_filter] = useState({} as Partial<{ [key in FilterName]: number[] }>);
	const [opened_filter, set_opened_filter] = useState<FilterName | null>(null);
	const [bottomsheet_opened, set_bottomsheet_opened] = useState(false);
	const search_debounce_ref = useRef<number | null>(null);

	const bottomsheet_ref = useRef<BottomSheet>(null);

	const {
		isLoading: filter_is_loading,
		data: filter_data,
		refetch: filter_refetch,
		error: filter_error,
	} = useQuery({
		queryKey: ['filters'],
		queryFn: async function () {
			return fetch_filters();
		},
		enabled: false,
		retry: false,
		select: function (data) {
			return {
				filter_names: Object.keys(data) as (keyof typeof data)[],
				filters: data,
			};
		},
	});

	const {
		isLoading: anime_is_loading,
		isFetching: anime_is_fetching,
		data: anime_data,
		refetch: anime_refetch,
		error: anime_error,
		hasNextPage: anime_has_next_page,
		fetchNextPage: anime_fetch_next_page,
	} = useInfiniteQuery({
		queryKey: [search, selected_filter],
		queryFn: function ({ pageParam: page_param = 1 }) {
			return search_anime(search, selected_filter as Record<FilterName, number[]>, page_param);
		},
		enabled: false,
		initialPageParam: 1,
		getNextPageParam: function (last_page, all_pages) {
			return last_page.animes.length === 20 ? all_pages.length + 1 : undefined;
		},
		select: function (data) {
			return {
				animes: data.pages.flatMap((page) => page.animes),
			};
		},
	});

	useEffect(
		function () {
			if (!filter_error) {
				return;
			}

			set_error_message((filter_error as Error).message);

			let time_out = setTimeout(function () {
				set_error_message('');
			}, 5000);

			return function () {
				clearTimeout(time_out);
			};
		},
		[filter_error],
	);

	useEffect(
		function () {
			if (!show_filters) {
				set_error_message('');
				return;
			}
			filter_refetch();
		},
		[show_filters],
	);

	useEffect(() => {
		return () => {
			if (search_debounce_ref.current) {
				clearTimeout(search_debounce_ref.current);
			}
		};
	}, []);

	useEffect(
		function () {
			if (!bottomsheet_ref.current) {
				return;
			}

			const sub = BackHandler.addEventListener('hardwareBackPress', function () {
				if (bottomsheet_opened) {
					bottomsheet_ref.current?.close();
					return true;
				}
				return false;
			});

			return sub.remove;
		},
		[bottomsheet_opened],
	);

	function handle_bs_index_change(idx: number) {
		if (!bottomsheet_ref.current) {
			return;
		}

		if (idx === -1) {
			set_bottomsheet_opened(false);
			return;
		}

		set_bottomsheet_opened(true);
	}

	function open(filter_name: FilterName) {
		if (!bottomsheet_ref.current) {
			return;
		}

		set_opened_filter(filter_name);

		bottomsheet_ref.current.expand();
	}

	function close() {
		if (!bottomsheet_ref.current) {
			return;
		}

		bottomsheet_ref.current.close();
	}

	function handle_change(key: FilterName, value: number[]) {
		set_selected_filter((prev) => ({ ...prev, [key]: value }));
	}

	function handle_search_change(text: string) {
		set_search(text);

		if (search_debounce_ref.current) {
			clearTimeout(search_debounce_ref.current);
		}

		search_debounce_ref.current = setTimeout(() => {
			if (text.trim().length < 3) {
				return;
			}
			anime_refetch();
		}, 500);
	}

	return (
		<Screen safe_area style={styles.root}>
			<View style={styles.search_bar_box}>
				<Searchbar placeholder='Search' value={search} onChangeText={handle_search_change} style={styles.search_bar} />
				<TouchableWithoutFeedback onPress={() => set_show_filters((v) => !v)}>
					<View style={styles.search_filter_box}>
						<Ionicons name='options-outline' size={30} color={tw_colors.zinc500} />
					</View>
				</TouchableWithoutFeedback>
			</View>
			<FlatList
				onEndReached={() => anime_has_next_page && !anime_is_fetching && anime_fetch_next_page()}
				data={anime_data?.animes || []}
				keyExtractor={(anime) => anime.id.toString()}
				renderItem={({ item: anime }) => <AnimeCard anime={anime} />}
			/>
			<Modal visible={show_filters} onDismiss={() => set_show_filters(false)} contentContainerStyle={styles.modal_container} dismissable dismissableBackButton>
				{filter_is_loading ? (
					<View style={styles.modal_loading}>
						<ActivityIndicator size={40} />
					</View>
				) : (
					<View style={styles.modal_view}>
						<View style={styles.filter_title_box}>
							<Text style={styles.filter_title}>Filters</Text>
							<TouchableOpacity style={styles.modal_close_btn} onPress={() => set_show_filters(false)}>
								<MaterialIcons name='close' size={24} color={tw_colors.white} />
							</TouchableOpacity>
						</View>
						{!!filter_data &&
							filter_data!.filter_names.map((key) => (
								<Filter
									key={key}
									label={key[0].toUpperCase() + key.slice(1).replace(/_/g, ' ')}
									data={filter_data!.filters[key]}
									value={selected_filter[key]}
									set_value={(vals) => handle_change(key, vals)}
									is_opened={opened_filter === key}
									open={() => open(key)}
									placeholder={`Select ${key.replace(/_/g, ' ')}`}
								/>
							))}
					</View>
				)}
			</Modal>
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
				snapPoints={['75%']}
				index={-1}
				backdropComponent={BottomSheetBackdrop}
				handleStyle={styles.sheet_handle}
				onChange={handle_bs_index_change}
			>
				<BottomSheetView style={styles.sheet_content}>
					<PortalHost name='option_name' />
				</BottomSheetView>
			</BottomSheet>
		</Screen>
	);
}

function AnimeCard({ anime }: { anime: AnimeShort }) {
	return (
		<TouchableOpacity style={styles.anime_card}>
			<Image source={{ uri: anime.image_url }} style={styles.anime_card_image} />
			<View style={styles.anime_card_content}>
				<RegularText style={styles.anime_card_head}>{anime.title}</RegularText>
				<View style={styles.anime_card_info}>
					{!!anime.episodes && <RegularText style={styles.anime_card_regular}>Episodes: {anime.episodes}</RegularText>}
					{!!anime.status && <RegularText style={styles.anime_card_regular}>Status: {anime.status}</RegularText>}
					{!!anime.type && <RegularText style={styles.anime_card_small}>({anime.type})</RegularText>}
				</View>
				<View style={styles.anime_card_genres}>
					{anime.genres.map((genre) => (
						<View style={styles.anime_card_genre_container} key={genre.id}>
							<RegularText style={styles.anime_card_genre_text}>{genre.name}</RegularText>
						</View>
					))}
				</View>
				{!!anime.synopsis && (
					<RegularText style={styles.anime_card_synopsis} numberOfLines={3}>
						Synopsis: {anime.synopsis}
					</RegularText>
				)}
			</View>
		</TouchableOpacity>
	);
}

function Filter({
	label,
	data,
	value,
	set_value,
	is_opened,
	open,
	placeholder,
}: {
	label: string;
	data: { id: number; name: string }[];
	value?: number[];
	set_value?: (values: number[]) => any;
	is_opened: boolean;
	open: () => any;
	placeholder: string;
}) {
	const [search, set_search] = useState('');

	const filtered_data = useMemo(() => (search ? data.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 75) : data.slice(0, 75)), [data, search]);

	const selected = useMemo(() => value?.map((v) => data.find((i) => i.id == v)?.name).join(', '), [value]);

	function handle_press(item_id: number) {
		if (!set_value) {
			return;
		}

		if (value?.includes(item_id)) {
			set_value(value.filter((id) => id !== item_id));
		} else {
			set_value(value ? [...value, item_id] : [item_id]);
		}
	}

	return (
		<View style={styles.filter}>
			<View style={styles.filter_label_container}>
				<Text style={styles.filter_label}>{label}</Text>
			</View>
			<TouchableOpacity style={styles.filter_btn} onPress={open}>
				{!value?.length && <Text style={styles.filter_placeholder}>{placeholder}</Text>}
				{!!value?.length && (
					<Text style={styles.filter_label} numberOfLines={1}>
						{selected}
					</Text>
				)}
			</TouchableOpacity>
			{is_opened && (
				<Portal hostName='option_name'>
					<View style={styles.filter_sheet_container}>
						<View style={styles.filter_search_bar_box}>
							<BottomSheetTextInput
								style={styles.filter_search_bar}
								placeholder={`Search ${label}`}
								placeholderTextColor={tw_colors.zinc300}
								value={search}
								onChangeText={set_search}
							/>
						</View>
						<BottomSheetFlatList
							data={filtered_data}
							keyExtractor={({ id }) => id.toString()}
							style={styles.filter_options_container_outter}
							contentContainerStyle={styles.filter_options_container_inner}
							renderItem={({ item }) => <Badge key={item.id} text={item.name} selected={value?.includes(item.id)} onPress={() => handle_press(item.id)} />}
						/>
					</View>
				</Portal>
			)}
		</View>
	);
}

function Badge({ text, selected, onPress }: { text: string; selected?: boolean; onPress?: () => any }) {
	return (
		<TouchableOpacity style={styles.badge_container} onPress={onPress}>
			<RegularText>{text}</RegularText>
			{selected ? (
				<Ionicons name='remove-circle-outline' style={styles.badge_icon} size={20} color={tw_colors.red500} />
			) : (
				<Ionicons name='add' style={styles.badge_icon} size={20} color={tw_colors.green500} />
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	root: {},
	search_bar_box: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingLeft: 8,
	},
	search_bar: {
		flex: 1,
	},
	search_filter_box: {
		paddingVertical: 5,
		paddingHorizontal: 8,
	},
	modal_container: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
		backgroundColor: tw_colors.white + '20',
	},
	modal_loading: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '25%',
		width: '80%',
		backgroundColor: tw_colors.zinc950,
		borderRadius: 10,
	},
	modal_view: {
		padding: 30,
		paddingTop: 15,
		minHeight: 200,
		width: '90%',
		backgroundColor: tw_colors.zinc950,
		borderRadius: 10,
	},
	main_view: {
		padding: 10,
		paddingBottom: 0,
	},
	filter_title_box: {
		paddingBottom: 10,
		flexDirection: 'row',
	},
	modal_close_btn: {
		padding: 8,
		bottom: 10,
		left: 25,
	},
	filter_title: {
		fontSize: 30,
		color: tw_colors.blue500,
		flex: 1,
	},
	filter: {
		paddingVertical: 10,
	},
	filter_label_placeholder: {
		color: tw_colors.zinc200,
		fontSize: 16,
	},
	filter_label: {
		color: tw_colors.white,
		fontSize: 16,
	},
	filter_label_container: {
		flexDirection: 'row',
		paddingBottom: 5,
		paddingLeft: 5,
		flexWrap: 'wrap',
	},
	filter_btn: {
		backgroundColor: tw_colors.zinc700,
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 8,
	},
	filter_placeholder: {
		fontSize: 16,
		color: tw_colors.gray300,
	},
	sheet_content: {
		flex: 1,
		padding: 30,
		paddingTop: 10,
		alignItems: 'center',
		backgroundColor: tw_colors.zinc800,
	},
	sheet_handle: {
		backgroundColor: tw_colors.zinc800,
		borderTopLeftRadius: 14,
		borderTopRightRadius: 14,
	},
	filter_sheet_container: {
		flex: 1,
		width: '100%',
	},
	badge_container: {
		flexDirection: 'row',
		padding: 5,
		paddingHorizontal: 10,
		borderRadius: 8,
		backgroundColor: tw_colors.slate500,
		alignItems: 'center',
	},
	badge_icon: {
		marginLeft: 8,
	},
	filter_options_container_outter: {
		flex: 1,
	},
	filter_options_container_inner: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	filter_search_bar: {
		color: tw_colors.white,
		width: '100%',
		height: 40,
	},
	filter_search_bar_box: {
		backgroundColor: tw_colors.zinc700,
		borderRadius: 100,
		overflow: 'hidden',
		marginBottom: 10,
		paddingHorizontal: 15,
		paddingVertical: 5,
	},
	anime_card: {
		backgroundColor: tw_colors.zinc800,
		borderRadius: 10,
		margin: 10,
		flexDirection: 'row',
	},
	anime_card_image: {
		width: 110,
		height: 150,
		borderRadius: 10,
		flex: 0,
	},
	anime_card_content: {
		flex: 1,
		padding: 10,
	},
	anime_card_head: {
		fontSize: 18,
		color: tw_colors.blue600,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	anime_card_info: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		columnGap: 40,
	},
	anime_card_small: {
		fontSize: 12,
		color: tw_colors.zinc400,
	},
	anime_card_regular: {
		fontSize: 14,
		color: tw_colors.zinc300,
	},
	anime_card_synopsis: {
		fontSize: 14,
		color: tw_colors.zinc300,
		marginTop: 4,
	},
	anime_card_genres: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 5,
		marginTop: 5,
	},
	anime_card_genre_container: {
		backgroundColor: tw_colors.blue900,
		borderRadius: 100,
	},
	anime_card_genre_text: {
		fontWeight: 'light',
		color: tw_colors.white,
		paddingHorizontal: 5,
		paddingVertical: 2,
		fontSize: 12,
	},
});
