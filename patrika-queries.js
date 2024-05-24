import { gql } from '@apollo/client';

const PatrikaQueries = {
	footermenu: gql`
		query ($filter: JSON, $channel_id: Int) {
			footerMenus(filter: $filter, channel_id: $channel_id) {
				id
				menu {
					id
					name
					slug
					type
					children
					displayheader
					background
					displayFooter
				}
				device_type
			}
		}
	`,

	homePageQuery: gql`
		query ($filter: JSON, $channel_id: Int, $limit: Int) {
			stories(filter: $filter, channel_id: $channel_id, limit: 5) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	storyDetail: gql`
		query ($id: ID) {
			storyDetail(id: $id) {
				id
				slug
				permalink
				permalink_type
				title
				alternate_title
				description
				featured_video
				featured_image_by_sizes
				body_id {
					body
					id
					featured_image_properties
					featured_image
					live_blog_list
					amp_body
					live_blog_title
				}
				location_id {
					name_lng
					name
					slug
				}
				story_location_city_id {
					name_lng
					name
				}
				tag_ids {
					id
					name
					name_lng
					status
					topic_ids {
						id
						name
						name_lng
						slug
						status
					}
				}
				topic_ids {
					id
					name
					name_lng
					slug
					status
				}
				author_ids {
					id
					first_name
					last_name
					slug
					biography
					first_name_lng
					last_name_lng
				}
				related_story_ids {
					id
					title
					permalink
					featured_image_by_sizes
					photo_gallery
					photo_gallery_count
					featured_video
					featured_video_properties
					content_type_id {
						id
					}
					body_id {
						featured_image_properties
						featured_image
					}
				}
				published_date
				modified_date
				updatedAt
				content_type_id {
					id
					name
					slug
				}
				photo_gallery
				photo_gallery_count
				featured_video
				featured_video_properties
				nextStory {
					id
					title
					permalink
					featured_image_by_sizes
					body_id {
						featured_image_properties
					}
				}
				content_type_id{
					name
					slug
				}
				location_id{
					name
					name_lng
				}
				story_location_city_id{
					name
					name_lng
				}
				category_id {
					id
					name_lng
					name
					slug
					parent {
						name
						slug
					}
				}
				category_slug
				location_state_id {
					name
				}
				emotion_id {
					emotion
				}
				parent_loc_channel {
					name
					slug
					location_channel_parent_id {
						id
						name
						slug
					}
				}
				parent_cat_channel {
					name
					slug
					category_channel_parent_id {
						name
						slug
					}
				}
				seo_details
				similarCategoryStoryData {
					id
					title
					permalink
					featured_image_by_sizes
					photo_gallery
					photo_gallery_count
					featured_video
					featured_video_properties
					body_id {
						featured_image_properties
						featured_image
					}
				}
			}
		}
	`,
	nextStoryDetail: gql`
		query ($id: ID, $exclude: [ID]) {
			storyDetail(id: $id, exclude: $exclude) {
				id
				slug
				permalink
				title
				description
				featured_video
				featured_image_by_sizes
				body_id {
					body
					id
					featured_image_properties
				}
				location_id {
					name_lng
				}
				tag_ids {
					id
					name
				}
				topic_ids {
					id
					name
				}
				category_type_id{
					name
					slug
				}
				author_ids {
					id
					first_name
					last_name
					slug
					biography
				}
				related_story_ids {
					id
					title
					permalink
					featured_image_by_sizes
				}
				published_date
				content_type_id {
					id
				}
				photo_gallery
				photo_gallery_count
				featured_video
				featured_video_properties
				nextStory {
					id
					title
					permalink
					featured_image_by_sizes
				}
				category_id {
					id
					name_lng
				}
			}
		}
	`,
	userDetail: gql`
		query ($slug: String) {
			userDetail(slug: $slug) {
				id
				first_name
				last_name
				first_name_lng
				last_name_lng
				slug
				biography
				twitter
				photo
				facebook
				googleplus
				linkedin
				totalStory
			}
		}
	`,
	photoPageQuery: gql`
		query (
			$filter: JSON
			$entertainmentslug: String!
			$sportslug: String!
			$lifestyle: String!
			$business: String!
			$channel_id: Int
		) {
			photo: stories(filter: $filter, limit: 8, channel_id: $channel_id) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
				published_date
				modified_date
			}
			entertainment: storiesByCategory(
				slug: $entertainmentslug
				filter: $filter
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
			}
			sport: storiesByCategory(
				slug: $sportslug
				filter: $filter
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
			}
			lifestyle: storiesByCategory(
				slug: $lifestyle
				filter: $filter
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
			}
			business: storiesByCategory(
				slug: $business
				filter: $filter
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
			}
		}
	`,
	photoListingQuery: gql`
		query (
			$filter: JSON
			$slug: String!
			$skip: Int
			$channel_id: Int
			$catfilter: JSON
		) {
			storiesByCategory: storiesByCategory(
				slug: $slug
				filter: $filter
				limit: 16
				skip: $skip
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
				category_id {
					id
					name_lng
				}
			}
			category: categoryChannels(filter: $catfilter, channel_id: $channel_id) {
				id
				name
				name_lng
				slug
				seo_title
				parent {
					id
					name
					name_lng
					slug
				}
				category_channel_parent_id {
					name
					name_lng
					slug
				}
			}
			location: locations(filter: $catfilter, channel_id: $channel_id) {
				id
				name
				name_lng
				slug
				seo_title
				parent {
					id
					name
					name_lng
					slug
				}
				location_channel_parent_id {
					name
					name_lng
					slug
				}
			}
		}
	`,
	nextphotoListingQuery: gql`
		query ($filter: JSON, $slug: String!, $skip: Int, $channel_id: Int) {
			storiesByCategory(
				slug: $slug
				filter: $filter
				limit: 16
				skip: $skip
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
				category_id {
					id
					name_lng
				}
			}
		}
	`,
	videoListingQuery: gql`
		query (
			$filter: JSON
			$slug: String!
			$skip: Int
			$channel_id: Int
			$catfilter: JSON
		) {
			storiesByCategory: storiesByCategory(
				slug: $slug
				filter: $filter
				limit: 16
				skip: $skip
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				published_date
				category_id {
					id
					name_lng
					name
				}
				body_id {
					featured_image_properties
				}
			}
			category: categoryChannels(filter: $catfilter, channel_id: $channel_id) {
				id
				name
				name_lng
				slug
				seo_title
				parent {
					id
					name
					name_lng
					slug
				}
				category_channel_parent_id {
					name
					name_lng
					slug
				}
			}
			location: locations(filter: $catfilter, channel_id: $channel_id) {
				id
				name
				name_lng
				slug
				seo_title
				parent {
					id
					name
					name_lng
					slug
				}
				location_channel_parent_id {
					name
					name_lng
					slug
				}
			}
		}
	`,
	nextvideoListingQuery: gql`
		query ($filter: JSON, $slug: String!, $skip: Int, $channel_id: Int) {
			storiesByCategory(
				slug: $slug
				filter: $filter
				limit: 16
				skip: $skip
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				published_date
				category_id {
					id
					name_lng
					name
				}
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	videoPageQuery: gql`
		query (
			$filter: JSON
			$entertainmentslug: String!
			$sportslug: String!
			$lifestyle: String!
			$business: String!
			$channel_id: Int
		) {
			photo: stories(filter: $filter, limit: 8, channel_id: $channel_id) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				published_date
				modified_date
				featured_video
				featured_video_properties
				body_id {
					featured_image_properties
				}
			}
			entertainment: storiesByCategory(
				slug: $entertainmentslug
				filter: $filter
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				body_id {
					featured_image_properties
				}
			}
			sport: storiesByCategory(
				slug: $sportslug
				filter: $filter
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				body_id {
					featured_image_properties
				}
			}
			lifestyle: storiesByCategory(
				slug: $lifestyle
				filter: $filter
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				body_id {
					featured_image_properties
				}
			}
			business: storiesByCategory(
				slug: $business
				filter: $filter
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	worldPageStoryQuery: gql`
		query (
			$filter: JSON
			$filtervideo: JSON
			$filterphoto: JSON
			$slug: String!
			$america: String!
			$asia: String!
			$gulf: String!
			$europe: String!
			$miscellenousworld: String!
			$channel_id: Int
		) {
			world: storiesByCategory(
				filter: $filter
				slug: $slug
				limit: 9
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			video: storiesByCategory(
				slug: $slug
				filter: $filtervideo
				limit: 12
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				body_id {
					featured_image_properties
				}
			}
			america: storiesByCategory(filter: $filter, slug: $america, limit: 7) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			asia: storiesByCategory(
				filter: $filter
				slug: $asia
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				category_slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			gulf: storiesByCategory(
				filter: $filter
				slug: $gulf
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				category_slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			europe: storiesByCategory(
				filter: $filter
				slug: $europe
				limit: 7
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				category_slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			photo: storiesByCategory(
				slug: $slug
				filter: $filterphoto
				limit: 12
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
			}
			miscellenousworld: storiesByCategory(
				filter: $filter
				slug: $miscellenousworld
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				category_slug
				permalink
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	entertainmentPageStoryQuery: gql`
		query (
			$filter: JSON
			$filtervideo: JSON
			$filterphoto: JSON
			$slug: String!
			$bollywoodslug: String!
			$hollywoodslug: String!
			$tollywoodslug: String!
			$moviereviews: String!
			$tvnews: String!
			$channel_id: Int
		) {
			entertainment: storiesByCategory(
				filter: $filter
				slug: $slug
				limit: 8
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			video: storiesByCategory(
				slug: $slug
				filter: $filtervideo
				limit: 12
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				body_id {
					featured_image_properties
				}
			}
			bollywood: storiesByCategory(
				filter: $filter
				slug: $bollywoodslug
				limit: 7
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			hollywood: storiesByCategory(
				filter: $filter
				slug: $hollywoodslug
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			tollywood: storiesByCategory(
				filter: $filter
				slug: $tollywoodslug
				limit: 7
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			moviereviews: storiesByCategory(
				filter: $filter
				slug: $moviereviews
				limit: 3
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			tvnews: storiesByCategory(
				filter: $filter
				slug: $tvnews
				limit: 7
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			photo: storiesByCategory(
				slug: $slug
				filter: $filterphoto
				limit: 12
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
			}
		}
	`,
	sportsPageStoryQuery: gql`
		query (
			$filter: JSON
			$filtervideo: JSON
			$filterphoto: JSON
			$slug: String!
			$cricket: String!
			$football: String!
			$tennis: String!
			$ipl: String!
			$other: String!
			$channel_id: Int
		) {
			sport: storiesByCategory(
				filter: $filter
				slug: $slug
				limit: 8
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			video: storiesByCategory(
				slug: $slug
				filter: $filtervideo
				limit: 12
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				body_id {
					featured_image_properties
				}
			}
			cricket: storiesByCategory(filter: $filter, slug: $cricket, limit: 7) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			football: storiesByCategory(
				filter: $filter
				slug: $football
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				category_slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			tennis: storiesByCategory(
				filter: $filter
				slug: $tennis
				limit: 7
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			ipl: storiesByCategory(
				filter: $filter
				slug: $ipl
				limit: 7
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			other: storiesByCategory(
				filter: $filter
				slug: $other
				limit: 4
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				category_slug
				slug
				permalink
				body_id {
					featured_image_properties
				}
			}
			photo: storiesByCategory(
				slug: $slug
				filter: $filterphoto
				limit: 12
				channel_id: $channel_id
			) {
				id
				title
				description
				type_id {
					id
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
			}
		}
	`,
	authorPageStoryQuery: gql`
		query ($filter: JSON, $skip: Int, $channel_id: Int) {
			stories(filter: $filter, skip: $skip, channel_id: $channel_id) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
					name
				}
				permalink
				content_type_id {
					id
					name
					slug
				}
				published_date
				photo_gallery
				photo_gallery_count
				featured_video_properties
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	homeSectionQuery: gql`
		query ($filter: JSON ,$limit: Int) {
			homeblocks(filter: $filter, limit: $limit) {
				id
				label
				name
				index
				Template
				isActive
				category_id {
					slug
					category_id
					name
					name_lng
				}
				type
				story_id {
					id
					title					
					body_id {
						body
						featured_image_properties
					}
					author_ids {
						first_name
						last_name
						slug
						first_name_lng
						last_name_lng
					}
					description
					featured_image_by_sizes
					slug
					permalink
					published_date			
					type_id {
						id
						name
					}
					category_slug
					category_id {
						id
						name_lng
						slug
					}
					content_type_id{
						name
						slug
					}
					story_location_city_id{
						name
						name_lng
					}
					location_slug
					location_id {
						name_lng
					}
				}
				horoscope_stories {
					name
					story_id {
						id
						title
						permalink
					}
				}
				election_result {
					state_id {
						id
						label
						count
					}
					result {
						party_id {
							id
							label
							color
						}
						count
					}
				}
			}
		}
	`,
	preferanceSectionQuery: gql`
		query ($filter: JSON) {
			homeblocks(filter: $filter) {
				id
				name
				Template
			}
		}
	`,
	getMyLocation: gql`
		query ($channel_id: Int) {
			mylocation(channel_id: $channel_id) {
				id
				name
				slug
				name_lng
				location_id {
					id
					name
				}
				parent {
					id
					name
					name_lng
				}
			}
		}
	`,

	listingPageStoryQuery: gql`
		query ($filter: JSON, $slug: String!, $channel_id: Int, $catfilter: JSON) {
			storiesByCategory: storiesByCategory(
				filter: $filter
				slug: $slug
				limit: 10
				channel_id: $channel_id
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				content_type_id {
					id
				}
				photo_gallery_count
				featured_video_properties
				slug
				permalink
				published_date
				body_id {
					featured_image_properties
				}
				author_ids {
					id
					first_name_lng
					last_name_lng
					photo
					slug
				}
			}
			category: categoryChannels(filter: $catfilter, channel_id: $channel_id) {
				id
				name
				name_lng
				slug
				seo_title
				parent {
					id
					name
					name_lng
					slug
				}
				category_channel_parent_id {
					name
					name_lng
					slug
				}
			}
			location: locations(filter: $catfilter, channel_id: $channel_id) {
				id
				name
				name_lng
				slug
				seo_title
				location_id {
					id
				}
				parent {
					id
					name
					name_lng
					slug
				}
				location_channel_parent_id {
					name
					name_lng
					slug
				}
				location_map
			}
		}
	`,

	listingPageNextStoryQuery: gql`
		query ($slug: String!, $channel_id: Int, $skip: Int) {
			storiesByCategory: storiesByCategory(
				slug: $slug
				limit: 10
				channel_id: $channel_id
				skip: $skip
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				permalink
				published_date
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	footer: gql`
		{
			footers {
				id
				sectionName
				label
				link
			}
		}
	`,
	footerFilter: gql`
		query ($filter: JSON) {
			footers(filter: $filter) {
				id
				sectionName
				label
				link
			}
		}
	`,
	menu: gql`
		query ($filter: JSON, $channel_id: Int) {
			menus(filter: $filter, channel_id: $channel_id) {
				id
				menu {
					id
					name
					slug
					type
					children
					displayheader
					background
				}
				device_type
			}
		}
	`,
	locationDropdown: gql`
		query ($filter: JSON, $channel_id: Int) {
			locations(channel_id: $channel_id, filter: $filter) {
				id
				channel_id
				name
				slug
				name_lng
				location_level_id {
					id
					name
				}
			}
		}
	`,
	stateLocationDropdown: gql`
		query ($id: ID!, $filter: JSON, $channel_id: Int) {
			stateslocations(id: $id, channel_id: $channel_id, filter: $filter) {
				id
				channel_id
				name
				slug
				name_lng
				location_level_id {
					id
					name
				}
			}
		}
	`,
	citynews: gql`
		query ($filter: JSON, $slug: String!, $channel_id: Int) {
			storiesByLocation(
				slug: $slug
				limit: 7
				channel_id: $channel_id
				filter: $filter
			) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				permalink
				published_date
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	topicStoriesQuery: gql`
		query ($filter: JSON, $slug: String!, $skip: Int) {
			storiesByTopic(filter: $filter, slug: $slug, limit: 10, skip: $skip) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				permalink
				published_date
				topic_ids {
					id
					name_lng
					name
					slug
				}
				tag_ids {
					id
					name
					topic_ids {
						id
						name
						name_lng
						slug
					}
				}
				body_id {
					body
					featured_image_properties
				}
			}
		}
	`,
	multimedia: gql`
		query ($photofilter: JSON, $videofilter: JSON, $channel_id: Int) {
			photo: stories(filter: $photofilter, limit: 10, channel_id: $channel_id) {
				id
				title
				description
				author_ids {
					id
					first_name_lng
					last_name_lng
					photo
					slug
				}
				category_id {
					id
					name_lng
					name
					slug
					parent {
						name
						slug
					}
				}
				type_id {
					id
				}
				published_date
				body_id {
					featured_image
					featured_image_properties
				}
				slug
				permalink
				photo_gallery
				photo_gallery_count
			}
			video: stories(filter: $videofilter, limit: 10, channel_id: $channel_id) {
				id
				title
				description
				category_id {
					id
					name_lng
					name
					slug
					parent {
						name
						slug
					}
				}
				author_ids {
					id
					first_name_lng
					last_name_lng
					photo
					slug
				}				
				type_id {
					id
				}
				slug
				permalink
				featured_video
				featured_video_properties
				published_date
				body_id {
					featured_image
					featured_image_properties
				}
			}
		}
	`,
	getDailyEdition: gql`
		query ($email: String!, $location: String) {
			dailyEdition(email: $email, location: $location)
		}
	`,
	myLocationstories: gql`
		query (
			$filter: JSON
			$mylocation: ID!
			$mylocparent: ID!
			$defaultlocation: String
			$channel_id: Int
		) {
			myLocationstories(
				location: $mylocation
				parent: $mylocparent
				defaultlocation: $defaultlocation
				filter: $filter
				limit: 3
				channel_id: $channel_id
			) {
				label
				stories {
					id
					title
					permalink
					body_id {
						featured_image_properties
					}
				}
			}
		}
	`,
	homeMyLocationstories: gql`
		query (
			$filter: JSON
			$mylocation: ID!
			$mylocparent: ID!
			$defaultlocation: String
			$channel_id: Int
		) {
			myLocationstories(
				location: $mylocation
				parent: $mylocparent
				defaultlocation: $defaultlocation
				filter: $filter
				limit: 7
				channel_id: $channel_id
			) {
				label
				stories {
					id
					title
					description
					featured_image_by_sizes
					type_id {
						id
					}
					slug
					permalink
					published_date
					body_id {
						featured_image_properties
					}
				}
			}
		}
	`,
	storiesByCategory: gql`
		query ($slug: String!, $channel_id: Int) {
			storiesByCategory(slug: $slug, limit: 10, channel_id: $channel_id) {
				id
				title
				description
				featured_image_by_sizes
				type_id {
					id
				}
				slug
				permalink
				published_date
				author_ids {
					id
					first_name_lng
					last_name_lng
					photo
					slug
				}
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	autoUpdateLiveBlog: gql`
		query ($slug: String) {
			storyDetail(slug: $slug) {
				body_id {
					body
					id
					featured_image_properties
					live_blog_list
					live_blog_title
				}
				modified_date
				updatedAt
			}
		}
	`,
	searchList: gql`
		query ($filter: JSON, $q: String, $skip: Int) {
			searchMongoStrories(q: $q, filter: $filter, skip: $skip) {
				total
				stories {
					title
					alternate_title
					permalink
					description
					content_type_id {
						id
					}
					published_date
					featured_image_by_sizes
					photo_gallery_count
					featured_video_properties
					photo_gallery
					body_id {
						featured_image_properties
					}
				}
			}
		}
	`,
	favouriteStrories: gql`
		{
			favouriteStrories(limit: 6)
		}
	`,
	siteMapCategory: gql`
		{
			categoryChannels(channel_id: 2) {
				id
				name
				slug
			}
		}
	`,
	siteMapTopic: gql`
		query ($filter: JSON) {
			topic(filter: $filter, channel_id: 2) {
				id
				name
				name_lng
				slug
			}
		}
	`,
	siteMapStories: gql`
		query ($filter: JSON, $isSiteMap: Boolean) {
			stories(filter: $filter, limit: 1000, isSiteMap: $isSiteMap) {
				permalink
				modified_date
				body_id {
					featured_image_properties
				}
				title
			}
		}
	`,
	siteMapImage: gql`
		query ($filter: JSON, $isSiteMap: Boolean) {
			stories(filter: $filter, limit: 1000, isSiteMap: $isSiteMap) {
				permalink
				body_id {
					featured_image_properties
				}
				title
			}
		}
	`,
	siteMapVideo: gql`
		query ($filter: JSON, $isSiteMap: Boolean) {
			stories(filter: $filter, limit: 1000, isSiteMap: $isSiteMap) {
				permalink
				title
				tag_ids {
					name
				}
				description
				published_date
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	siteMapNews1: gql`
		query ($filter: JSON, $isSiteMap: Boolean) {
			stories(filter: $filter, limit: 1000, isSiteMap: $isSiteMap) {
				permalink
				title
				published_date
				tag_ids {
					name
				}
				modified_date
				updatedAt
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	siteMapNews2: gql`
		query ($filter: JSON, $isSiteMap: Boolean) {
			stories(filter: $filter, limit: 1000, skip: 1, isSiteMap: $isSiteMap) {
				permalink
				title
				published_date
				tag_ids {
					name
				}
				modified_date
				updatedAt
				body_id {
					featured_image_properties
				}
			}
		}
	`,
	getAudioURL: gql`
		query ($id: ID!) {
			texttospeech(id: $id)
		}
	`,
	getrssfba: gql`
		query ($isSiteMap: Boolean, $channel_id: Int) {
			stories(limit: 100, isSiteMap: $isSiteMap, channel_id: $channel_id) {
				permalink
				title
				published_date
				tag_ids {
					name
				}
				modified_date
				body_id {
					body
					featured_image_properties
				}
				author_ids {
					first_name
					last_name
					id
				}
				permalink_type
				location_id {
					name_lng
					name
					slug
				}
				location_state_id {
					name
				}
				category_id {
					name
					parent {
						name
					}
				}
				emotion_id {
					emotion
				}
				content_type_id {
					name
				}
				id
			}
		}
	`,
	getrssfbacitystate: gql`
		query ($slug: String!, $channel_id: Int, $isSiteMap: Boolean) {
			storiesByLocation(
				slug: $slug
				limit: 100
				channel_id: $channel_id
				isSiteMap: $isSiteMap
			) {
				permalink
				title
				published_date
				tag_ids {
					name
				}
				modified_date
				body_id {
					body
					featured_image_properties
				}
				author_ids {
					first_name
					last_name
					id
				}
				permalink_type
				location_id {
					name_lng
					name
					slug
				}
				location_state_id {
					name
				}
				category_id {
					name
					parent {
						name
					}
				}
				emotion_id {
					emotion
				}
				content_type_id {
					name
				}
				id
			}
		}
	`,
	stateHomeSectionQuery: gql`
		query ($filter: JSON) {
			statehomeblocks(filter: $filter) {
				id
				story_id {
					id
					title
					description
					featured_image_by_sizes
					slug
					permalink
					published_date
					body_id {
						featured_image_properties
					}
				}
			}
		}
	`,

	webStoriesQuery: gql`
		query ($where: JSON, $first: Int, $after: String) {
			webStories(where: $where, first: $first, after: $after) {
				webStories {
					nodes {
						slug
						desiredSlug
						uri
						webStoryId
						featuredImage {
							node {
								sourceUrl
							}
						}
						date
						title
						excerpt
					}
					pageInfo {
						hasNextPage
						hasPreviousPage
						startCursor
						endCursor
					}
				}
			}
		}
	`,
};

export default PatrikaQueries;