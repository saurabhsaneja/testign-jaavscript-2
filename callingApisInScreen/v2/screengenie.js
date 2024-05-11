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
import { useRoute } from "@react-navigation/native";
import GoBackButton from "../components/GoBackButton";
import NavHeader from "../components/NavHeader";
import AuthContext from "../components/AuthContext";
import ArticleVideo from "../components/ArticleVideo";
import analytics from '@react-native-firebase/analytics';

// [TBD] for further optimisation
// DataStore.configure({
//     storageAdapter: SQLiteAdapter
// });
const nonStorySlugs = [
  'tag-list',
  'badikhabre',
  'breaking-news',
  'tagResults',
  'photo',
  'video',
  'webstories',
  'search',
  'story'
]
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
const missingStoryCollectionSlugs = []
const missingNonStoryCollectionSlugs = []
let storyCollectionData = []
const nonStoryCollectionData = []
const ScreenGenie = ({ route, navigation, screen }) => {
  console.log('{ route, navigation, screen }', JSON.stringify({ route, navigation, screen }));
  const { ChartbeatTracker } = useContext(AuthContext);
  //I can always have a default screen
  const [screenID, setScreenID] = useState(
    screen ? screen : route.params.screenID
  );
  
  const [relatedScreenName, setRelatedScreen] = useState(route.params.relatedScreenName);
  const { screens, sections, fetchDataAsync, fetchStoriesByCategories } = useContext(initContext);
  const [filteredSections, setFilteredSections] = useState([]);
  const { dataFetchList } = useDataStore();
  const currentRoute = useRoute();
  console.log("currentRoute: ", currentRoute.name);
  console.log('relatedScreen name', relatedScreenName);

  useEffect(() => {
    console.log("Screen Genie has been invoked..", screenID);
    // console.log('sections', sections);
    if(currentRoute.name !== 'video-story-screen'){
      async function filterSections() {
        try {
          let filteredSections = sections.filter(
            (id) => screenID === id.screenID && id.visible === true
          );
          // console.log('filteredSections', filteredSections);
          // console.log("Filtered Sections", filteredSections.map((item) => item.viewComponent))
          filteredSectionsLength = filteredSections?.length
          
          const allStoryCollectionSlugs = sections.filter(section => section.sectionType === SectionType.STORYCOLLECTION)?.map(el => el?.slug)
          
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

          if(missingNonStoryCollectionSlugs?.length === 0 && missingStoryCollectionSlugs?.length === 0){
            setFilteredSections(filteredSections)  
          } else {
            if(missingStoryCollectionSlugs?.length > 0){
              storyCollectionData = await fetchStoriesByCategories(missingStoryCollectionSlugs?.map(el => ({slug: el})))
            }
                      
            
            console.log('missingNonStoryCollectionSlugs', missingNonStoryCollectionSlugs);
            if(missingNonStoryCollectionSlugs?.length > 0){
              missingNonStoryCollectionSlugs?.map(async el => {
                nonStoryCollectionData.push(await fetchDataAsync(el))
              })
            }
            console.log('nonStoryCollectionData', nonStoryCollectionData);
            
            filteredSections = filteredSections.map(el => {
              const foundStory = storyCollectionData.find(el2 => el2.slug === el?.slug)
              const foundNonStory = nonStoryCollectionData.find(el2 => el2.slug === el?.slug)
              if(foundStory){
                if(foundStory?.data?.length && foundStory?.slugExists){
                  return {...el, data: foundStory?.data}
                }else {
                  return {...el, data: []}
                }
              }
              else if(foundNonStory){
                if(foundNonStory?.data?.length){
                  return {...el, data: foundNonStory?.data}
                }else {
                  return {...el, data: []}
                }
              }
              else {
                return el
              }
            })
            console.log('filteredSections', filteredSections);
            setFilteredSections(filteredSections)
          }
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
  

  const render = useCallback(({ item, index }) => {
    //figure out the render component
    const SectionComponent = sectionComponentMap[item.viewComponent];
    let relatedScreen = screens.find(
      (screen) => screen.relatedSectionSlug === item.slug
    );
    // console.log('item.slug', item.slug);
    // const foundSection = dataFetchList.find(
    //   (section) => section.slug === item.slug
    // );
    //Bind the view to data
    if (SectionComponent && item.visible) {
      return (
        <SectionComponent
          route={route}
          navigation={navigation}
          meta={{ item, screenID }}
          data={item?.data}
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
