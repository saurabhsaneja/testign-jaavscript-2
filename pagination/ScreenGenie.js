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

const ScreenGenie = ({ route, navigation, screen }) => {
  //I can always have a default screen
  const [screenID, setScreenID] = useState(
    screen ? screen : route.params.screenID
  );
  const { screens, sections } = useContext(initContext);
  const [filteredSections, setFilteredSections] = useState([]);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(1);
  const [SectionComponent, setSectionComponent] = useState();
  const [relatedScreen, setRelatedScreen] = useState();
  const { dataFetchList } = useDataStore();
  const currentRoute = useRoute();
  console.log("currentRoute: ", currentRoute.name);

  useEffect(() => {
    console.log("Screen Genie has been invoked..", screenID);
    async function filterSections() {
      try {
        const filteredSections = sections.filter(
          (id) => screenID === id.screenID && id.visible === true
        );
        // console.log("Filtered Sections", filteredSections.map((item) => item.viewComponent))
        setFilteredSections(filteredSections);
        if(filteredSections?.length > 0){
          setSectionComponent(sectionComponentMap[filteredSections[0]?.viewComponent]);
          setRelatedScreen(screens.find(
            (screen) => screen.relatedSectionSlug === filteredSections[0]?.slug
          ));
          const foundSection = dataFetchList.find(
            (section) => section.slug === filteredSections[0]?.slug
          );
          const sectionData = foundSection ? foundSection.data : [];
          setData([...sectionData])
        }
      } catch (error) {
        console.error("ScreenGenie:", error);
      }
    }
    filterSections();
  }, []);

  const render = useCallback(async ( item ) => {
    //figure out the render component
    // const SectionComponent = sectionComponentMap[item.viewComponent];
    // let relatedScreen = screens.find(
    //   (screen) => screen.relatedSectionSlug === item.slug
    // );
    // console.log('item.slug', item.slug);
    // const foundSection = dataFetchList.find(
    //   (section) => section.slug === item.slug
    // );
    // const data = foundSection ? foundSection.data : [];
    //Bind the view to data
    if (SectionComponent && item.visible) {
      return (
        <SectionComponent
          route={route}
          navigation={navigation}
          meta={{ item, screenID }}
          data={data}
          relatedScreen={relatedScreen}
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
      {!["home", "election-screen", "anveshan", "webstories-screen"].includes(
        currentRoute.name
      ) && <GoBackButton />}
      {filteredSections.length ? (
        filteredSections?.map(item => render(item))
        // <FlatList
        //   data={filteredSections}
        //   keyExtractor={(item) => item.id}
        //   renderItem={render}
        //   maxToRenderPerBatch={1}
        //   updateCellsBatchingPeriod={1}
        //   windowSize={5}
        //   initialNumToRender={1}
        //   decelerationRate={0.9}
        //   pagingEnabled={true}
        //   contentContainerStyle={{ paddingBottom: 70 }}
        //   snapToInterval={10}
        // />
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
