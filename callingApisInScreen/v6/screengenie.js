import { Auth, DataStore, SortDirection } from "aws-amplify"; // Import Auth module
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
// import { SQLiteAdapter } from '@aws-amplify/datastore-storage-adapter/SQLiteAdapter';
import { gql } from "@apollo/client";
import * as SectionComponents from "../components/SectionComponents"; // Import all section components
import client from "../graphql/client";
import { useContext } from "react";
import initContext from "../components/InitContext";
import { graphql } from "graphql";
import PatrikaQueries from "../graphql/patrika-queries";
import { ActivityIndicator } from "react-native";
import useDataStore from "../helpers/store";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { Dimensions } from "react-native";
import moment from "moment-timezone";
import { useRoute } from "@react-navigation/native";
import GoBackButton from "../components/GoBackButton";
import NavHeader from "../components/NavHeader";
import AuthContext from "../components/AuthContext";
import ArticleVideo from "../components/ArticleVideo";
import analytics from '@react-native-firebase/analytics';
import { AdminSection, Interest, MasterInterest, Screen, TagsList,ScreenType, Section as SectionModel, UserPreferences, MenuItem, SectionType } from '../models';
// [TBD] for further optimisation
// DataStore.configure({
//     storageAdapter: SQLiteAdapter
// });

const sectionComponentMap = {
  FEATUREDSTORYANDLIST: SectionComponents.FEATUREDSTORYANDLIST,
  VERTICALLISTUNORDERED: SectionComponents.VERTICALLISTUNORDERED,
  HORIZONTALIMAGELIST: SectionComponents.HORIZONTALIMAGELIST,
  TAG: SectionComponents.TAG,
  CATEGORYSELECTION: SectionComponents.CATEGORYSELECTION,
  INTERESTSELECTION: SectionComponents.INTERESTSELECTION,
  STORY: SectionComponents.STORY,
  PHOTOCOLLECTION: SectionComponents.PHOTOCOLLECTION,
  VIDEOCOLLECTION: SectionComponents.VIDEOCOLLECTION,
  TAGLIST: SectionComponents.TagsSection,
  VIDEOSTORY: SectionComponents.VIDEOSTORY,
  PHOTOSTORY: SectionComponents.PHOTOSTORY,
  WEBSTORIES: SectionComponents.WEBSTORIES,
  WEBSTORY: SectionComponents.WEBSTORY,
  HEADLINESSECTION: SectionComponents.HEADLINESSECTION,
  WEBSTORIESVERTICAL: SectionComponents.WEBSTORIESVERTICAL,
  BREAKINGNEWS: SectionComponents.BREAKINGNEWS,
  // FEATUREDIMAGELIST: SectionComponents.FEATUREDIMAGELIST,
  // AD: SectionComponents.AD,
  // TWOCOLUMNHORIZONTALSCROLL: SectionComponents.TWOCOLUMNHORIZONTALSCROLL,
  // VERTICALLISTORDERED: SectionComponents.VERTICALLISTORDERED,
  // VERTICALNAVIGATIONLIST: SectionComponents.VERTICALNAVIGATIONLIST,
  // LIVESCORECRICKET: SectionComponents.LIVESCORECRICKET,
  // LIVESCOREHOCKEY: SectionComponents.LIVESCOREHOCKEY,
};

let filteredSectionsLength = 0
const ScreenGenie = ({ route, navigation, screen }) => {
  console.log('{ route, navigation, screen }', JSON.stringify({ route, navigation, screen }));
  const { ChartbeatTracker } = useContext(AuthContext);
  //I can always have a default screen
  const [screenID, setScreenID] = useState(
    screen ? screen : route.params.screenID
  );
  
  const [relatedScreenName, setRelatedScreen] = useState(route.params.relatedScreenName);
  const { screens, sections, user } = useContext(initContext);
  const [filteredSections, setFilteredSections] = useState(sections.filter(
    (id) => screenID === id.screenID && id.visible === true
  ));
  const { dataFetchList, batchDataUpdate, fetchDataSuccess, fetchDataFailure } = useDataStore();
  const currentRoute = useRoute();
  console.log("currentRoute: ", currentRoute.name);
  console.log('relatedScreen name', relatedScreenName);

  const isDataReady = () => {
    let dataReady = true
    for(const section of filteredSections){
      if(section?.loading){
        dataReady = false
      }
    }
    return dataReady
  }

  useEffect(async () => {
    if(!isDataReady()){
      const res = await getScreenData(screenID)
      console.log('await getScreenData', res);
    }
  }, [])

  useEffect(() => {
    console.log("Screen Genie has been invoked..", screenID);
    // console.log('sections', sections);
    if(currentRoute.name !== 'video-story-screen'){
      async function filterSections() {
        try {
          const filteredSections = sections.filter(
            (id) => screenID === id.screenID && id.visible === true
          );
          // console.log("Filtered Sections", filteredSections.map((item) => item.viewComponent))
          setFilteredSections(filteredSections);
          filteredSectionsLength = filteredSections?.length
          // track STORY sectionType in Story section component 
          if(!filteredSections?.find(el => el.sectionType === "STORY")){
            ChartbeatTracker.trackView({
              viewId: route?.params?.slug,
              title: route?.params?.prettyName,
            });
            await analytics().logScreenView({
              screen_name: route?.params?.slug,
              screen_class: route?.params?.prettyName,
            });
          }
        } catch (error) {
          console.error("ScreenGenie:", error);
        }
      }
      filterSections();
    }else {
      const story = route?.params?.story
      ChartbeatTracker.trackView({
        viewId: story?.id,
        title: story?.title,
        authors: story?.author_ids?.map((author) => `${author.first_name_lng} ${author.last_name_lng}`),
        sections: [story?.permalink?.split('/')[0]?.split('-')[0]]
      });
      async function logScreenForFirebaseAnalytics() {
        await analytics().logScreenView({
          screen_name: story?.title,
          screen_class: story?.id,
        });
      }
      logScreenForFirebaseAnalytics();
    }
  }, []);

  const getScreenData = async (
    screenID
  ) => {
    const missingStoryCollectionSlugs = [];
    const missingNonStoryCollectionSlugs = [];
    const userSections = await fetchUserSections(user)
    const adminSections = await fetchAdminSections()
    const sections = configureDataRequestsForAllSections(userSections, adminSections)
    const allStoryCollectionSlugs = sections
    .filter((section) => section.sectionType === SectionType.STORYCOLLECTION)
    ?.map((el) => el?.slug);
    const filteredSections = sections.filter(
      (id) => screenID === id.screenID && id.visible === true
    );
    filteredSections?.map((item) => {
      const found = dataFetchList?.find(
        (section) => section?.slug === item?.slug
      );
      if (found) {
        if (found?.loading) {
          if (allStoryCollectionSlugs?.includes(found?.slug)) {
            missingStoryCollectionSlugs.push(found?.slug);
          } else {
            missingNonStoryCollectionSlugs.push(found?.slug);
          }
        }
      }
    });
    console.log("here3");
    const data = missingNonStoryCollectionSlugs.map((slug) => ({
      slug,
      slugData: [],
    }));
    data.push({
      slug: "storiesByCategory",
      slugData: missingStoryCollectionSlugs?.map(el => ({slug: el})),
    });
    data.forEach((el) => {
      fetchDataAsync(el)
    }
    );
    console.log('sectionsData', sectionsData);
    return sectionsData
  };

  const fetchDataAsync = async (
    { slug, slugData },
  ) => {
    console.log('slug, slugData', slug, slugData);
    let data = [];
    let slugExists = false;
    try {
      // console.log(dataFetchList)
      switch (slug) {
        case "storiesByCategory":
          data = await fetchStoriesByCategories(slugData);
          slugExists = true;
          break;
        case "tag-list":
          data = await fetchTagList();
          slugExists = true;
          break;
        case "badikhabre":
          data = await fetchBadiKhabre();
          slugExists = true;
          break;
        case "breaking-news":
          data = await fetchBreakingNews();
          slugExists = true;
          break;
        case "tagResults":
          data = await fetchTagResults();
          slugExists = true;
          break;
        case "photo":
          data = await fetchPhotoCollection();
          slugExists = true;
          break;
        case "video":
          data = await fetchVideoCollection();
          slugExists = true;
          break;
        case "webstories":
          data = await fetchWebStories();
          slugExists = true;
          break;
        case "search":
          data = await fetchTagResults(tag);
          slugExists = true;
          break;
        case "story":
          data = await fetchStory();
          slugExists = true;
          break;
        // Add more cases for other section types as needed
      }
      if (data?.length && slugExists) {
        fetchDataSuccess(slug, data);
      } else {
        fetchDataFailure(slug, {});
      }
    } catch (error) {
      console.log("DataAsync Error", error);
      // fetchDataFailure(slug, error.message);
    }
  };
  const fetchStoriesByCategories = async (customSections) => {
    console.log('customSections', customSections);
    let storiesSlugMap = {}
    try {
        let query = ` query($channel_id:Int,`;
        let query1 = ``;
        let variable = { channel_id: 2 };
        // console.log("Filtered", filteredSections.length)
        customSections.map((section, index) => {
            // const limit = section.config['limit']
            query1 =
                query1 +
                `data${index}:storiesByCategory(slug:$slug${index}, limit: 5,channel_id:$channel_id) {
                        id
                        title
                        description
                        featured_image_by_sizes
                        type_id {
                            id
                            name
                        }
                        slug
                        permalink
                        location_id {
                            name_lng
                        }
                        category_id {
                            id
                            name_lng
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
                        category_slug
                        published_date
                        author_ids{id  first_name_lng last_name_lng photo  slug}
                        body_id{
                            id
                            featured_image_properties
                            featured_image
                            live_blog_list
                            live_blog_title
                        }
                    }`;
            variable[`slug${index}`] = section.slug
            // console.log(variable)
            query = query + `$slug${index}:String!,`;
            storiesSlugMap[section.slug] = `data${index}`
            // console.log(section.slug, `data${index}`)
        });
        // console.log(dataFetchList)
        let finalquery = `${query}){${query1} }`;
        // console.log(finalquery)
        console.log('before finalquery', variable);
        const storiesByCategory = await client.query({
            query: gql(finalquery),
            variables: variable,
        });
        console.log('storiesByCategory _data', storiesByCategory);
        let _data = []
        customSections.forEach(item => {
            const dataIndex = storiesSlugMap[item.slug]
            // console.log("Data Index", dataIndex)
            if (Object.keys(storiesByCategory).length) {                    
                return _data.push({"slug":item.slug, "data":storiesByCategory.data[dataIndex]});
            } else {
                return _data.push(item.slug, [])
            }
        })
        console.log("_Data", _data)
        batchDataUpdate(_data)
        return storiesByCategory
    } catch (error) {
        console.log("Error", error)
        return {}
    }
}

  const configureDataRequestsForAllSections = (userSections, adminSections) => {
    try {
        // console.log(adminSections.forEach((element => console.log(element))))
        const sections = [...userSections, ...adminSections].sort(
            (a, b) => b.sortPriority - a.sortPriority
        );
        return sections
    } catch (error) { console.log(error) }
    // console.log("This is crazy",sections)
}
const fetchTagList = async () => {
    try {
        const _tagsList = await DataStore.query(TagsList)
        return _tagsList
    } catch (error) { console.log({ error }) }
}
const fetchBadiKhabre = async () => {
    const badiKhabre = await client
        .query({
            query: PatrikaQueries.homeSectionQuery,
            variables: {
                filter: {
                    isActive: true,
                    Template: ["badiKhabare"]
                },
            },
        })
        .catch((err) => {
            console.log("err : ", err);
            badiKhabre = {}
        });

    const data = badiKhabre?.data?.homeblocks[0]?.story_id;
    // console.log(data)
    return data
}
const fetchBreakingNews = async () => {
    let breakingNews = await client
        .query({
            query: PatrikaQueries.homeSectionQuery,
            variables: {
                filter: {
                    isActive: true,
                    Template: ["breakingNews"]
                },
            },
        })
        .catch((err) => {
            console.log("err : ", err);
            breakingNews = {}
        });
    const data = breakingNews?.data?.homeblocks[0]?.story_id;
    return data
}
const fetchTagResults = async (tag) => {
    let tagResults = {}
    try {
        const storiesByTopicQuery = PatrikaQueries.topicStoriesQuery
        const variables = {
            slug: tag.slug
        }
        tagResults = await client.query({
            query: storiesByTopicQuery,
            variables: variables,
        });
        return tagResults?.data?.storiesByTopic
    } catch (error) {
        return {}
    }
}
const fetchPhotoCollection = async () => {
    let photosCollection = []
    const multimedia = await fetchMultimedia()
    const photos = multimedia?.data?.photo
    try {
        // Iterate through the nested objects and arrays to extract the URLs.
        photosCollection = photos.map(itemObject => ({
            story_id: itemObject?.id,
            url: itemObject?.body_id?.featured_image_properties?.url,
            title: itemObject?.title,
            articleTypeId: itemObject?.type_id,
            story: itemObject
        }))
        return photosCollection
        //   console.log("Photos Collection",photosCollection[0].articleTypeId)				
    } catch (error) {
        console.error('Photocollection:', error);
        return {}
    }
}
const fetchVideoCollection = async () => {
    let videosCollection = {}
    const multimedia = await fetchMultimedia()
    const videos = multimedia?.data?.video
    try {
        // Iterate through the nested objects and arrays to extract the URLs.
        videosCollection = videos.map(itemObject => ({
            story_id: itemObject?.id,
            url: itemObject?.body_id?.featured_image_properties?.url,
            title: itemObject?.title,
            articleTypeId: itemObject?.type_id,
            story: itemObject
        }))
        return videosCollection
        //   console.log("Photos Collection",photosCollection[0].articleTypeId)				
    } catch (error) {
        console.error('Video collection:', error);
        return {}
    }
}
const fetchWebStories = async () => {
    const TOTAL_ITEMS = 100;
    const afterCursor = '';
    const category = 'All';
    try {
        const queryVariables = {
            first: TOTAL_ITEMS,
            after: afterCursor,
            ...(category === 'All'
                ? {
                    where: '{orderby: {field: DATE, order: DESC}}',
                }
                : {
                    where: `{orderby: {field: DATE, order: DESC}, search: "${category}"}`,
                }),
        };

        const stories = await client.query({
            query: PatrikaQueries.webStoriesQuery,
            variables: queryVariables,
        });

        if (
            stories.data.webStories.webStories.nodes.length
        ) {
            return stories.data.webStories.webStories.nodes
        } else {
            return {}
        }
    } catch (error) {
        return {}
    }
}
const fetchStory = async () => {
    try {
        // const sectionData = dataFetchList.find(item => item.slug === )
    } catch (error) { console.log({ error }) }
}
const fetchMultimedia = async () => {
  let multimedia = {}
  try {
      multimedia = await client.query({
          query: PatrikaQueries.multimedia,
          variables: {
              "photofilter": { "content_type_id": 43 },
              "videofilter": { "content_type_id": 44 },
              channel_id: 2,
          }
      })
  } catch (err) {
      console.log('err : ', err);
      return { error: true }
  };
  return multimedia
}
const fetchUserSections = async (user) => {
  try {
      if (user) {
          const sortDirection = {
              sort: (s) => s.sortPriority(SortDirection.ASCENDING)
          }
          const sectionFilter = (s) => (s.userID.eq(user?.attributes?.sub || user?.signInUserSession?.idToken?.payload?.sub));
          const sections = await DataStore.query(SectionModel, sectionFilter, sortDirection);
          return (sections)
      }
  } catch (error) {
      console.log("Error Fetching User Sections:", error)

  }
}
const fetchAdminSections = async () => {
  try {
      const adminSections = await DataStore.query(AdminSection, (s) =>
          s.visible.eq(true));
      return (adminSections)
      // console.log(adminSections)
  } catch (error) {
      console.log("fetchAdminSections", error)
  }
}

  const render = useCallback(({ item, index }) => {
    //figure out the render component
    const SectionComponent = sectionComponentMap[item.viewComponent];
    let relatedScreen = screens.find(
      (screen) => screen.relatedSectionSlug === item.slug
    );
    // console.log('item.slug', item.slug);
    const foundSection = dataFetchList.find(
      (section) => section.slug === item.slug && section.loading === false
    );
    // const foundSection2 = screenData.find(
    //   (section) => section.slug === item.slug
    // )
    const data = foundSection ? foundSection.data : [];
    //Bind the view to data
    if (SectionComponent && item.visible) {
      return (
        <SectionComponent
          route={route}
          navigation={navigation}
          meta={{ item, screenID }}
          data={data}
          relatedScreen={relatedScreen}
          isPaginationScreen={relatedScreen?.pagination && filteredSectionsLength === 1}
        />
      );
    }
  }, []);

  return (
    <View
      style={{
        backgroundColor: "#fff",
      }}
    >
      <NavHeader openDrawer={() => navigation.openDrawer()} navigateHome={() => navigation.navigate('home')} showOpenMenu={relatedScreenName === 'home'} /> 
     
      {/* {!["home", "election-screen", "anveshan", "webstories-screen"].includes(
        currentRoute.name
      ) && <GoBackButton />} */}
      {currentRoute.name === 'video-story-screen' ?
      <ArticleVideo story={route?.params?.story} /> 
      :
      isDataReady() ? (
        <FlatList
          data={filteredSections}
          keyExtractor={(item) => item.id}
          renderItem={render}
          maxToRenderPerBatch={1}
          updateCellsBatchingPeriod={1}
          // windowSize={5}
          initialNumToRender={1}
          decelerationRate={0.9}
          pagingEnabled={true}
          contentContainerStyle={{ paddingBottom: 70 }}
          snapToInterval={10}
        />
      ) : (
        <View
          style={{
            height: Dimensions.get("window").height,
            width: Dimensions.get("window").width,
            alignItems: "center",
          }}
        >
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              marginVertical={20}
            >
              <SkeletonPlaceholder.Item
                width={60}
                height={60}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item marginLeft={20}>
                <SkeletonPlaceholder.Item
                  width={260}
                  height={20}
                  borderRadius={4}
                />
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={160}
                  height={20}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              marginVertical={20}
            >
              <SkeletonPlaceholder.Item
                width={60}
                height={60}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item marginLeft={20}>
                <SkeletonPlaceholder.Item
                  width={260}
                  height={20}
                  borderRadius={4}
                />
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={160}
                  height={20}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              marginVertical={20}
            >
              <SkeletonPlaceholder.Item
                width={60}
                height={60}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item marginLeft={20}>
                <SkeletonPlaceholder.Item
                  width={260}
                  height={20}
                  borderRadius={4}
                />
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={160}
                  height={20}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              marginVertical={20}
            >
              <SkeletonPlaceholder.Item
                width={60}
                height={60}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item marginLeft={20}>
                <SkeletonPlaceholder.Item
                  width={260}
                  height={20}
                  borderRadius={4}
                />
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={160}
                  height={20}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              marginVertical={20}
            >
              <SkeletonPlaceholder.Item
                width={60}
                height={60}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item marginLeft={20}>
                <SkeletonPlaceholder.Item
                  width={260}
                  height={20}
                  borderRadius={4}
                />
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={160}
                  height={20}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              marginVertical={20}
            >
              <SkeletonPlaceholder.Item
                width={60}
                height={60}
                borderRadius={10}
              />
              <SkeletonPlaceholder.Item marginLeft={20}>
                <SkeletonPlaceholder.Item
                  width={260}
                  height={20}
                  borderRadius={4}
                />
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={160}
                  height={20}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
      )}
    </View>
  );
}; // End of ScreenGenie

export default ScreenGenie;
