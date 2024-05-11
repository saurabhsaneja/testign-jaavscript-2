import { Auth, DataStore } from "aws-amplify"; // Import Auth module
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
// import { SQLiteAdapter } from '@aws-amplify/datastore-storage-adapter/SQLiteAdapter';
import { gql } from "@apollo/client";
import * as SectionComponents from "../components/SectionComponents"; // Import all section components
import client from "../graphql/client";
import { EditorialSection, TagsList } from "../models";
import { useContext } from "react";
import initContext from "../components/InitContext";
import { ScreenType } from "../models";
import { SectionType } from "../models";
import { graphql } from "graphql";
import PatrikaQueries from "../graphql/patrika-queries";
import { ActivityIndicator } from "react-native";
import useDataStore from "../helpers/store";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { Dimensions } from "react-native";
import moment from "moment-timezone";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import GoBackButton from "../components/GoBackButton";
import NavHeader from "../components/NavHeader";
import AuthContext from "../components/AuthContext";
import ArticleVideo from "../components/ArticleVideo";
import analytics from '@react-native-firebase/analytics';

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
  const { screens, sections } = useContext(initContext);
  const [filteredSections, setFilteredSections] = useState(sections.filter(
    (id) => screenID === id.screenID && id.visible === true
  ));
  const { dataFetchList, fetchDataSuccess, fetchDataFailure, batchDataUpdate } = useDataStore();
  const currentRoute = useRoute();
  console.log("currentRoute: ", currentRoute.name);
  console.log('relatedScreen name', relatedScreenName);
  
  useFocusEffect(
    React.useCallback(() => {
      getScreenData(screenID, sections, dataFetchList, route?.params?.fetchDataAsync, fetchDataSuccess, fetchDataFailure, route?.params?.multimedia)  
    }, [])
  );
  useEffect(() => {
    console.log("Screen Genie has been invoked..", screenID);
    // console.log('sections', sections);
    if(currentRoute.name !== 'video-story-screen'){
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

  async function filterSections() {
    try {
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

  const render = useCallback(({ item, index }) => {
    //figure out the render component
    const SectionComponent = sectionComponentMap[item.viewComponent];
    let relatedScreen = screens.find(
      (screen) => screen.relatedSectionSlug === item.slug
    );
    // console.log('item.slug', item.slug);
    const foundSection = dataFetchList.find(
      (section) => section.slug === item.slug
    );
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
      filteredSections.length ? (
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

const getScreenData = async (screenID, sections, dataFetchList, fetchDataSuccess, fetchDataFailure, batchDataUpdate, multimedia) => {
  console.log('getScreenData called');
  const missingStoryCollectionSlugs = []
  const missingNonStoryCollectionSlugs = []
  const allStoryCollectionSlugs = sections.filter(section => section.sectionType === SectionType.STORYCOLLECTION)?.map(el => el?.slug)
  console.log('here');
  const filteredSections = sections.filter(
    (id) => screenID === id.screenID && id.visible === true
  );
  filteredSections?.map(item => {
      const found = dataFetchList?.find(section => section?.slug === item?.slug)
      if(found){
          if(found?.loading){
              if(allStoryCollectionSlugs?.includes(found?.slug)){
                  missingStoryCollectionSlugs.push(found?.slug)
          }else{
              missingNonStoryCollectionSlugs.push(found?.slug)
          }
      }
  }
  })
  console.log('here2');
  const data = missingNonStoryCollectionSlugs.map(slug => ({slug, slugData: []}))
  data.push({slug: 'storiesByCategory', slugData: missingStoryCollectionSlugs})  
  console.log('getScreenData', data);
  missingNonStoryCollectionSlugs.forEach(el => 
      fetchDataAsync(el, fetchDataSuccess, fetchDataFailure, batchDataUpdate, multimedia)
  )
}
const fetchDataAsync = async ({slug, slugData}, fetchDataSuccess, fetchDataFailure, batchDataUpdate, multimedia) => {
  let data = []
  let slugExists = false
  try {
      // console.log(dataFetchList)
      switch (slug) {
          case 'storiesByCategory':                    
              data = await fetchStoriesByCategories(slugData, batchDataUpdate);
              slugExists = true
              break;
          case 'tag-list':
              data = await fetchTagList();
              slugExists = true
              break;
          case 'badikhabre':
              data = await fetchBadiKhabre();
              slugExists = true
              break;
          case 'breaking-news':
              data = await fetchBreakingNews();
              slugExists = true
              break;
          case 'tagResults':
              data = await fetchTagResults();
              slugExists = true
              break;
          case 'photo':
              data = await fetchPhotoCollection(multimedia);
              slugExists = true
              break;
          case 'video':
              data = await fetchVideoCollection(multimedia);
              slugExists = true
              break;
          case 'webstories':
              data = await fetchWebStories();
              slugExists = true
              break;
          case 'search':
              data = await fetchTagResults(tag);
              slugExists = true
              break;
          case 'story':
              data = await fetchStory();
              slugExists = true
              break;
          // Add more cases for other section types as needed
      }
      if (data?.length && slugExists) {
          // console.log("Data Success", slug)
          fetchDataSuccess(slug, data);
      } else {
          fetchDataFailure(slug, {})
      }
  } catch (error) {
      console.log("DataAsync Error", error)
      // fetchDataFailure(slug, error.message);
  }
};

const fetchStoriesByCategories = async (customSections, batchDataUpdate) => {
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
      const storiesByCategory = await client.query({
          query: gql(finalquery),
          variables: variable,
      });

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
      // console.log("Data", _data)
      batchDataUpdate(_data)
      return storiesByCategory
  } catch (error) {
      console.log("Error", error)
      return {}
  }
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
//doing this for the purpose of optimisation else each section should fetch their own data


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

//fetch photo collection
const fetchPhotoCollection = async (multimedia) => {
  let photosCollection = []
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
//fetch video collection
const fetchVideoCollection = async (multimedia) => {
  let videosCollection = {}
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