import * as React from "react";
import { Component } from 'react';
import { useState, useEffect } from "react";
import { Alert, FlatList } from "react-native";
import {
  ImageBackground,
  Image,
  Text,
  View, Pressable, StyleSheet, TouchableOpacity, KeyboardAvoidingView, TextInput, ActivityIndicator,Platform
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ScrollView } from "react-native";
import client from '../graphql/client';
import PatrikaQueries from '../graphql/patrika-queries';
import FastImage from 'react-native-fast-image';
import PostSmall from '../components/PostSmall';
import PostMedium from '../components/PostMedium';
import PostLarge from '../components/PostLarge';
import HomeHeader from '../components/HomeHeader';
import PostList from '../components/PostList';
import PhotoView from '../components/PhotoView';
import VideoView from '../components/VideoView';
import WebStory from '../components/WebStory';
import SponsorPost from '../components/SponsorPost';
import Footer from '../components/Footer';
import Horoscope from '../components/HoroscopeScroll';
import SectionHeader from '../components/SectionHeader';
import BreakingHeader from "./BreakingHeader";
import SectionHeaderWhite from "../components/SectionHeaderWhite";
import WebStoryWhite from "./WebStoryWhite";
import { Images } from "./Assets";
import { Section, MasterSection, Interest, MasterInterest, UserPreferences, Tags } from "../models"
import { Auth, DataStore, SortDirection } from "aws-amplify";
import { useContext } from "react";
import initContext from "../components/InitContext"
import onBoardingContext from "./OnBoardingContext";
import Article from "./Article";
import { Dimensions } from 'react-native';
import Calendar from "./Calendar";
import GetLocation from 'react-native-get-location';
import ArticleTag from "./ArticleTag";
import VideoShow from "../screens/VideoShow";
import PhotoShow from "../screens/PhotoShow";
import { WebView } from 'react-native-webview';
import DatePicker from 'react-native-modern-datepicker';
import moment from "moment";
import LoadMore from "./LoadMore";
// import { getToday, getFormatedDate } from 'react-native-modern-datepicker';
import { gql } from '@apollo/client';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

const iconMapper = async (objects) => {
  let mappr;

  try {
    // console.log({ objects });
    // console.log(sourceItem.slug)
    mappr = objects.reduce((acc, sourceItem) => {
      // console.log(sourceItem.slug + "Active")
      if (Images && Images[sourceItem.slug + "Active"] && Images[sourceItem.slug + "Inactive"]) {
        acc[sourceItem.slug] = {
          active: Images[sourceItem.slug + "Active"],
          inactive: Images[sourceItem.slug + "Inactive"],
        };
      } else {
        console.log(`Images or properties for slug "${sourceItem.slug}" are undefined.`);
        // console.log([sourceItem.slug + "Active"])
      }
      return acc;
    }, {});
  } catch (error) {
    console.log("Iconmappr This is me:", error);
  }
  // console.log({mappr});
  return mappr;
};


const pageWidth = Dimensions.get('window').width;
const pageHeight = Dimensions.get('window').height;

const articleMap = {
  "Routine": "story",
  "Live Reporting": 'story',
  "Exclusive": "story"
}



const TagsSection = ({ navigation, meta, data }) => {
  const [tags, setTags] = useState(data? data:[]);
  const [tagsList, setTagsList] = useState([])
  const [tagScreen, setTagScreen] = useState(null)
  const [tag, setTag] = useState(null)
  const {screens} = useContext(initContext)
  
  useEffect(() => {
    const fetch = async () => {
      const tagsList = tags.filter(tag => tag.screenID === meta.screenID)
      setTagsList(tagsList)
      const tagScreen = screens.find(screen => screen.slug === 'tag')
      setTagScreen(tagScreen)
    }
    fetch()
  }, []);
  //onPress navigate the user to a new screen with the tag as a parameter
  const onPress = (tag) => {
    if(tag?.relatedScreenID) navigation.navigate(tag.relatedScreenID, { tag: tag })
    else navigation.navigate(tagScreen.id, { tag: tag });
  };

  return (<>
    {tagsList && <View>
      <SectionHeader title={meta.item.prettyName} />
      <View style={{ width: '100%', padding: 16 }}>
        <View style={styles.tagContainer}>
          {tagsList.map((tag, index) => (
            <TouchableOpacity key={index} onPress={() => onPress(tag)}>
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag.prettyName}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>}
  </>
  );
};



export default TagsSection;



const CATEGORYSELECTION = ({ navigation, route, initiallyHideNextButton, gotoNextOnboardScreen }) => {
  const [screen, setScreen] = useState([]);
  const [objects, setObjects] = useState([]);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [buttonStatus, setButtonStatus] = useState(false);
  const { updateOnBoardingStatus, screens, adminSections, user, fetchUserSections } = useContext(onBoardingContext)
  const [formStatus, setFormStatus] = useState('आगे बढिये')
  const [iconMap, setIconMap] = useState([])
  const [hideNextButton, setHideNextButton] = useState(initiallyHideNextButton === 'yes')
  // console.log("CategorySelction")

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setFormStatus('आगे बढिये')
      setButtonClicked(false)
    });
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const CategoryItem = ({ index, object, onClick, selectedObjects}) => {
    // console.log (iconMap) 
    const [isActive, setIsActive] = useState(false)
    useEffect(() => {
      setIsActive(selectedObjects.includes(object.id))
    }, [])


    const categoryStyle = {
      borderRadius: 8,
      backgroundColor: "#fff",
      borderStyle: "solid",
      borderColor: isActive ? "#000" : "#a3a9be",
      borderWidth: isActive ? 1 : 1,
      // width: 180,
      // height: 90,
      // padding: 12,
      justifyContent: "center",
      margin: 5,
    };
    const Press = () => {
      onClick(object.id)
    }; 


    return (
      <TouchableOpacity
        key={object.id}
        onPress={Press}
        style={categoryStyle}
      >{isActive?<LinearGradient
        style
        locations={[0, 1, 1]}
        colors={[
          "rgba(170,74,68, 0.03)",
          "rgba(170,74,68, 0.30)",
          "rgba(170,74,68, 0.06)",
        ]}
        useAngle={true}
        angle={145}
      >
      <View style={{padding:12}}>
      <View style={styles.camera}>
        {/* Use Iconmap[object.slug]*/}
        {/* <Text style={[styles.text, styles.textLayout]}>{require("../assets/Midhun.png")}</Text> */}
        {isActive ? <Image
          source={iconMap[object.slug] && iconMap[object.slug].active}
          style={{width:"90%",resizeMode:"contain", opacity:1 }} // Define your desired width and height
        /> : <Image
        source={iconMap[object.slug] && iconMap[object.slug].active}// Use the active image source
        style={{ width:"90%",resizeMode:"contain", opacity:0.4 }} // Define your desired width and height
      />}

        {/* <Text style={styles.text}>{`🏏 `}</Text> */}
      </View>
      <Text style={[styles.textLayout, isActive ?
        styles.text1Inactive :
        styles.text1Active]}>{object.prettyName}</Text>
        </View>
        </LinearGradient>:<LinearGradient
      style
      locations={[0, 1, 1]}
      colors={[
        "rgba(0, 0, 0, 0.03)",
        "rgba(0, 0, 0, 0.05)",
        "rgba(0, 0, 0, 0.06)",
      ]}
      useAngle={true}
      angle={145}
    >
    <View style={{padding:12}}>
    <View style={styles.camera}>
      {/* Use Iconmap[object.slug]*/}
      {/* <Text style={[styles.text, styles.textLayout]}>{require("../assets/Midhun.png")}</Text> */}
      {isActive ? <Image
        source={iconMap[object.slug] && iconMap[object.slug].active}
        style={{width:"90%",resizeMode:"contain", opacity:1 }} // Define your desired width and height
      /> : <Image
      source={iconMap[object.slug] && iconMap[object.slug].active}// Use the active image source
      style={{ width:"90%",resizeMode:"contain", opacity:0.4 }} // Define your desired width and height
    />}

      {/* <Text style={styles.text}>{`🏏 `}</Text> */}
    </View>
    <Text style={[styles.textLayout, isActive ?
      styles.text1Inactive :
      styles.text1Active]}>{object.prettyName}</Text>
      </View>
      </LinearGradient>}
        
      </TouchableOpacity>

    );
  };
  // Function to toggle the selection of an object
  const toggleSelection = async (objectId) => {
    if (selectedObjects.includes(objectId)) {
      const newSelectedObjects = selectedObjects.filter((id) => objectId !== id)
      setSelectedObjects(newSelectedObjects);
      // console.log(newSelectedObjects)
    } else {
      setSelectedObjects([...selectedObjects, objectId]);
    }
  };
  // Function to save or delete selected objects
  const saveObjects = async () => {
    setButtonClicked(true);
    setFormStatus(<ActivityIndicator color='#000'  size="small"/>)
    updateOnBoardingStatus()
  };

  const shouldShowNextButton = () => {
    if(!hideNextButton){
      return true
    } else if(selectedObjects?.length < 5){
      return false
    } else if (selectedObjects?.length >= 5) {
      return true
    }
  }

  useEffect(() => {
    //Set the first screen for configuration
    const screen = screens.find(id => id.name === 'home')
    setScreen(screen)
  }, [])
  useEffect(() => {
    const fetchMasterSections = async () => {
      const masterSections = await DataStore.query(MasterSection, (s) =>
        s.visible.eq(true)
      );
      setObjects(masterSections);
      console.log('setObjects', masterSections);
      if (masterSections.length !== 0) {
        const iconMap = await iconMapper(masterSections); // Await the async function
        setIconMap(iconMap);
      }
    };
    fetchMasterSections();
  }, [JSON.stringify(objects)]);

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.column}>
        <CategoryItem object={item} onClick={toggleSelection} selectedObjects={selectedObjects} index={index}></CategoryItem>
      </View>

    )
  };
  const inputChangeHandler = () => {
    if (selectedObjects.length < 5 && buttonClicked) {
      setButtonStatus(true);
    } else {
      setButtonStatus(false);
    }
  };
  
  return (
    <View style={{minHeight: Dimensions.get('window').height, justifyContent:"flex-start"}}>
    <ImageBackground
      style={[styles.sectionSelectionIcon, styles.image1WrapperFlexBox]}
      resizeMode="cover"
      source={require("../assets/bg.png")}>
      <View style={{ width: "100%", flexDirection: "column", backgroundColor: '#000', justifyContent: "center", marginBottom: 30, paddingTop:Platform.OS === 'android' ? 0 : 35 }}>
        <View style={styles.onboardingHeader}>
          <Text style={styles.onboardingHeaderText}>न्यूनतम 5 अनुभाग चुनें</Text>
        </View>
        <View style={{ flex: 1, height: 5, width: '100%', justifyContent: 'flex-start', flexDirection: 'column', backgroundColor: "#000" }}>
          <View style={{ height: 5, width: '20%', backgroundColor: '#b50000' }} />
        </View></View>
      {/* <Text>hello bobby</Text> */}

      <FlatList
        style={styles.sections}
        data={objects}
        // ListHeaderComponent={<OnboaringCategoryActive />}
        renderItem={renderItem}
        contentContainerStyle={styles.sectionsFlatListContent}
        numColumns={2}
      />
      {shouldShowNextButton() ?
        <TouchableOpacity
          onPress={() => {
            setButtonClicked(true);
            saveObjects();
            gotoNextOnboardScreen({selectedUserSectionObjects:selectedObjects, userSectionObjects: objects});
          }}
          style={[styles.next, styles.nextLayout]}
          disabled={(buttonClicked)}
        >
          <View style={[styles.buttonBase, styles.nextLayout]}>
            <Text style={[styles.text1button, styles.textTypoButton]}>{formStatus}</Text>
          </View>
        </TouchableOpacity>
      :null}
      {/* <Pressable style={[styles.next, styles.nextLayout]} onPress={() => {saveObjects}}>
        <View style={[styles.buttonBase, styles.nextLayout]}>
          <Text style={[styles.text1, styles.textTypo]}>आगे बढिये</Text>
        </View>
      </Pressable> */}
    </ImageBackground>
    </View>
  );
};
//Video collection view component
const VIDEOCOLLECTION = ({ navigation, meta, data,relatedScreen }) => {
  const [videos, setVideos] = useState(data);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const { screens } = useContext(initContext)
  // const [screen, setScreen] = useState(screens.find(screen => screen.slug === (articleMap[data?.articleTypeId?.name] || articleMap['Routine'])))
  const onPress = (video) => {
    navigation.navigate("video-story-screen", { story: video.story });
  };
  
  const onClose = () => {
    setShowVideo(false);
  };
  const renderItem = ({item, index}) => {
    return (
      <Pressable key={index} onPress={() => onPress(item)}>
        <VideoView video={item} onClose={onClose} />
      </Pressable>
    )
  }
  return (
    <>
      <SectionHeader title={meta.item.prettyName} navigation={navigation}  relatedScreen={relatedScreen}/>
      <FlatList
        data={videos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.story_id}
        renderItem={renderItem}
        initialNumToRender={5}
      />
      {showVideo && (
        <VideoView video={selectedVideo} onClose={onClose} />
      )}
    </>
  );
};

// photoCollection view component
const PHOTOCOLLECTION = ({ navigation, meta, data ,relatedScreen}) => {
  const [photos, setPhotos] = useState(data);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const { screens } = useContext(initContext)
  // const [screen, setScreen] = useState(screens.find(screen => screen.slug === (articleMap[data?.articleTypeId?.name] || articleMap['Routine'])))


  const onPress = (photo) => {
    navigation.navigate("photo-story-screen", { story: photo.story });
  };

  const onClose = () => {
    setShowPhoto(false);
  };
  const renderItem = ({item, index}) => {
    return (
      <Pressable key={index} onPress={() => onPress(item)}>
        <PhotoView photo={item} onClose={onClose} />
      </Pressable>
    )
  }
  return (
    <>
      <SectionHeader title={meta.item.prettyName} navigation={navigation}  relatedScreen={relatedScreen} />
      <FlatList
        data={photos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.story_id}
        renderItem={renderItem}
        initialNumToRender={5}
      />
      {showPhoto && (
        <PhotoView photo={selectedPhoto} onClose={onClose} />
      )}
    </>
  );
};



const INTERESTSELECTION = ({ navigation, route, initiallyHideNextButton, gotoNextOnboardScreen, selectedUserSectionObjects, userSectionObjects }) => {
  const [objects, setObjects] = useState([]);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [formStatus, setFormStatus] = useState('आगे बढिये')
  const { updateOnBoardingStatus, screens, adminSections, user } = useContext(onBoardingContext)
  const [iconMap,setIconMap] = useState([])
  const [buttonClicked, setButtonClicked] = useState(false);
  const [hideNextButton, setHideNextButton] = useState(initiallyHideNextButton === 'yes')
  const iconMapper = async (objects) => {
    let mappr; // Declare mappr in the outer scope  
    try {
      mappr = objects.reduce((acc, sourceItem) => {
        acc[sourceItem.slug] = {
          active: Images[sourceItem?.slug + "Active"],
          inactive: Images[sourceItem?.slug + "Inactive"],
        };
        return acc;
      }, {});
    } catch (error) {
      console.log("Iconmappr:", error);
    }
  
    // console.log(mappr); // Now you can access mappr in the outer scope
    return mappr;
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setFormStatus('आगे बढिये')
      setButtonClicked(false)
    });
    console.log('route?.params?.selectedUserSectionObjects', route?.params?.selectedUserSectionObjects);
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const InterestItem = ({ index, object, onClick, selectedObjects }) => {
    const [isActive, setIsActive] = useState(false)
    useEffect(() => {
      setIsActive(selectedObjects.includes(object.id))
    }, [])

    const chip = {
      borderRadius: 10,
      backgroundColor: "#fff",
      borderStyle: "solid",
      borderColor: "#a3a9be",
      borderWidth: 1,
      flex: 1,
      width: "50%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
    };
    const Press = () => {
      onClick(object.id)
    };


    return (
      // <TouchableOpacity
      //   key={object.id}
      //   onPress={Press}
      //   style={chip}
      // >
      //   <View style={styles.label}>
      //     <Text style={[styles.text, styles.textLayout]}>{`🏏 `}</Text>
      //   </View>
      //   <Text style={[styles.textLayout, isActive ?
      //     styles.text1Inactive :
      //     styles.text1Active]}>{object.prettyName}</Text>
      // </TouchableOpacity>


      <TouchableOpacity key={object.id} onPress={Press} style={isActive ? styles.categoryStyleActive : styles.categoryStyleInactive}>
        <Text style={styles.label}>
          {/* Use Iconmap[object.slug]*/}
          {/* <Text style={styles.text}>{`🏏 `}</Text> */}
          <Text style={[styles.textLayout, isActive ? styles.interestTextInactive : styles.interestTextActive]}>{object.prettyName}</Text>
        </Text>
      </TouchableOpacity>
    );
  };
  // Function to toggle the selection of an object
  const toggleSelection = async (objectId) => {
    if (selectedObjects.includes(objectId)) {
      const newSelectedObjects = selectedObjects.filter((id) => objectId !== id)
      setSelectedObjects(newSelectedObjects);
      // console.log(newSelectedObjects)
    } else {
      setSelectedObjects([...selectedObjects, objectId]);
    }
  };
  // Function to save or delete selected objects
  const saveObjects = async () => {
    setButtonClicked(true);
    setFormStatus(<ActivityIndicator color='#000' size="small"/>)
    updateOnBoardingStatus()
    gotoNextOnboardScreen({selectedInterestObjects:selectedObjects, interestObjects: objects,selectedUserSectionObjects, userSectionObjects});
  };
  const shouldShowNextButton = () => {
    if(!hideNextButton){
      return true
    } else if(selectedObjects?.length < 5){
      return false
    } else if (selectedObjects?.length >= 5) {
      return true
    }
  }

  useEffect(() => {
    const fetchMasterInterests = async () => {
      const masterInterests = await DataStore.query(MasterInterest, (s) =>
        s.visible.eq(true)
      );
      if (masterInterests.length !== 0) {
        const iconMap = iconMapper(masterInterests)
        setIconMap(iconMap)
      }

      setObjects(masterInterests);
      const iconMap = await iconMapper(masterInterests)
      // setIconMap(iconMap)      
      // console.log(masterInterests)
    }
    fetchMasterInterests()

  }, [JSON.stringify(objects)])


  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.column}>
        <InterestItem object={item} onClick={toggleSelection} selectedObjects={selectedObjects} index={index}></InterestItem>
      </View>

    )
  };

  return (
    <View style={{minHeight: Dimensions.get('window').height}}>
    <ImageBackground
      style={[styles.sectionSelectionIcon, styles.image1WrapperFlexBox]}
      // resizeMode="cover"
      source={require("../assets/bg.png")}
    >
      <View style={{ width: "100%", flexDirection: "column", backgroundColor: '#000', justifyContent: "center", marginBottom: 30, }}>
        <View style={styles.onboardingHeader}>
          <Text style={styles.onboardingHeaderText}>कम से कम 5 दिलचस्पी चुनें</Text>
        </View>
        <View style={{ flex: 1, height: 5, width: '100%', justifyContent: 'flex-start', flexDirection: 'column' }}>
          <View style={{ height: 5, width: '50%', backgroundColor: '#b50000' }} />
        </View></View>
      <FlatList
        style={styles.sectionsInterest}
        data={objects}
        // ListHeaderComponent={<OnboaringCategoryActive />}
        renderItem={renderItem}
        contentContainerStyle={styles.sectionsFlatListContent}
        numColumns={3}
      />
      {shouldShowNextButton() ?
        <TouchableOpacity
          onPress={saveObjects}
          disabled={buttonClicked}
          style={[styles.next, styles.nextLayout]}
        >
          <View style={[styles.buttonBase, styles.nextLayout]}>
            <Text style={[styles.text1button, styles.textTypoButton]}>{formStatus}</Text>
          </View>
        </TouchableOpacity>
      :null}
      {/* <Pressable style={[styles.next, styles.nextLayout]} onPress={() => {saveObjects}}>
        <View style={[styles.buttonBase, styles.nextLayout]}>
          <Text style={[styles.text1, styles.textTypo]}>आगे बढिये</Text>
        </View>
      </Pressable> */}
    </ImageBackground>
    </View>
  );
};


const STATESELECTION = ({ navigation, route }) => {
  const [objects, setObjects] = useState([]);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [formStatus, setFormStatus] = useState('आगे बढिये')
  const { updateOnBoardingStatus, screens, adminSections, user } = useContext(onBoardingContext)
  const [iconMap,setIconMap] = useState([])
  const [buttonClicked, setButtonClicked] = useState(false);
  const iconMapper = async (objects) => {
    let mappr; // Declare mappr in the outer scope  
    try {
      mappr = objects.reduce((acc, sourceItem) => {
        acc[sourceItem.slug] = {
          active: Images[sourceItem?.slug + "Active"],
          inactive: Images[sourceItem?.slug + "Inactive"],
        };
        return acc;
      }, {});
    } catch (error) {
      console.log("Iconmappr:", error);
    }
  
    // console.log(mappr); // Now you can access mappr in the outer scope
    return mappr;
  };

  const InterestItem = ({ index, object, onClick, selectedObjects }) => {
    const [isActive, setIsActive] = useState(false)
    useEffect(() => {
      setIsActive(selectedObjects.includes(object.id))
    }, [])

    const chip = {
      borderRadius: 10,
      backgroundColor: "#fff",
      borderStyle: "solid",
      borderColor: "#a3a9be",
      borderWidth: 1,
      flex: 1,
      width: "50%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
    };
    const Press = () => {
      onClick(object.id)
    };


    return (
      // <TouchableOpacity
      //   key={object.id}
      //   onPress={Press}
      //   style={chip}
      // >
      //   <View style={styles.label}>
      //     <Text style={[styles.text, styles.textLayout]}>{`🏏 `}</Text>
      //   </View>
      //   <Text style={[styles.textLayout, isActive ?
      //     styles.text1Inactive :
      //     styles.text1Active]}>{object.prettyName}</Text>
      // </TouchableOpacity>


      <TouchableOpacity key={object.id} onPress={Press} style={styles.stateParent}>


{isActive ? <Image
          source={require("../assets/states/active/Rajasthan.png")}
          style={styles.stateIcon} // Define your desired width and height
        /> : <Image
        source={require("../assets/states/inactive/Rajasthan.png")}// Use the active image source
        style={styles.stateIcon} // Define your desired width and height
      />}
      <Text style={isActive ? styles.stateLabelActive : styles.stateLabelInactive}>{object.prettyName}</Text>
     
      </TouchableOpacity>
    );
  };
  // Function to toggle the selection of an object
  const toggleSelection = async (objectId) => {
    if (selectedObjects.includes(objectId)) {
      const newSelectedObjects = selectedObjects.filter((id) => objectId !== id)
      setSelectedObjects(newSelectedObjects);
      // console.log(newSelectedObjects)
    } else {
      setSelectedObjects([...selectedObjects, objectId]);
    }
  };
  // Function to save or delete selected objects
  const saveObjects = async () => {
    setButtonClicked(true);
    setFormStatus(<ActivityIndicator color='#000' size="small"/>)
    try {
      for (const objectId of selectedObjects) {
        const objectIndex = objects.findIndex((obj) => obj.id === objectId);
        const item = objects[objectIndex]
        await DataStore.save(new Interest({
          prettyName: item.prettyName,
          name: item.name,
          userID: user?.attributes?.sub || user?.signInUserSession?.idToken?.payload?.sub,
        }))
      }
      updateOnBoardingStatus()
      setSelectedObjects([]);
      setObjects([...objects]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchMasterInterests = async () => {
      const masterInterests = await DataStore.query(MasterInterest, (s) =>
        s.visible.eq(true)
      );
      if (masterInterests.length !== 0) {
        const iconMap = iconMapper(masterInterests)
        setIconMap(iconMap)
      }

      setObjects(masterInterests);
      const iconMap = await iconMapper(masterInterests)
      // setIconMap(iconMap)      
      // console.log(masterInterests)
    }
    fetchMasterInterests()

  }, [JSON.stringify(objects)])


  const renderItem = ({ item, index }) => {
    return (
      <View style={{padding:10}}>
        <InterestItem object={item} onClick={toggleSelection} selectedObjects={selectedObjects} index={index}></InterestItem>
      </View>

    )
  };

  return (
    <View style={{minHeight: Dimensions.get('window').height}}>
    <ImageBackground
      style={[styles.sectionSelectionIcon, styles.image1WrapperFlexBox]}
      // resizeMode="cover"
      source={require("../assets/bg.png")}
    >
      <View style={{ width: "100%", flexDirection: "column", backgroundColor: '#000', justifyContent: "center", marginBottom: 30, }}>
        <View style={styles.onboardingHeader}>
          <Text style={styles.onboardingHeaderText}>कम से कम 5 दिलचस्पी चुनें</Text>
        </View>
        <View style={{ flex: 1, height: 5, width: '100%', justifyContent: 'flex-start', flexDirection: 'column' }}>
          <View style={{ height: 5, width: '50%', backgroundColor: '#b50000' }} />
        </View></View>
      <FlatList
        style={styles.stateSelection}
        data={objects}
        // ListHeaderComponent={<OnboaringCategoryActive />}
        renderItem={renderItem}
        contentContainerStyle={styles.sectionsFlatListContent}
        numColumns={3}
      />
      <TouchableOpacity
        // key={}
        onPress={saveObjects}
        disabled={buttonClicked}
        style={[styles.next, styles.nextLayout]}
      >
        <View style={[styles.buttonBase, styles.nextLayout]}>
          <Text style={[styles.text1button, styles.textTypoButton]}>{formStatus}</Text>
        </View>
      </TouchableOpacity>
      {/* <Pressable style={[styles.next, styles.nextLayout]} onPress={() => {saveObjects}}>
        <View style={[styles.buttonBase, styles.nextLayout]}>
          <Text style={[styles.text1, styles.textTypo]}>आगे बढिये</Text>
        </View>
      </Pressable> */}
    </ImageBackground>
    </View>
  );
};



const HorizontalFragment = ({ item, index, navigation }) => {
  // console.log(item?.type_id?.name)
  const { screens } = useContext(initContext)
  const [screen, setScreen] = useState(screens.find(screen => screen.slug === (articleMap[item?.type_id?.name] || articleMap['Routine'])))
  // console.log(item?.content_type_id?.slug)
  // console.log(item?.content_type_id?.name)
  const [showText, setShowText] = useState(true);
  

  useEffect(() => {
    // Change the state every second or the time given by User.
    const interval = setInterval(() => {
      setShowText((showText) => !showText);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onPress = () => {
    navigation.navigate(screen.name, { story: item });
  };

  return (

    <TouchableOpacity onPress={onPress}>
      <View key={item.id} >
          {item && (
            <View style={[styles.imageIconLayout]}>
              <View style={styles.postSmall}>
                {item?.body_id?.featured_image_properties?.url && (
                  <View style={styles.imageSmall}>
                    <View style={styles.sourceImagesSmall}>
                      <FastImage
                        style={[styles.imageIcon, styles.imageIconLayout]}
                        resizeMode="cover"
                        source={{ uri: item?.body_id?.featured_image_properties?.url }}
                      />
                    </View>
                  </View>
                )}
                <View style={styles.postTitle}>
                  <View style={[styles.postTitleHeaderGroup, styles.dateFlexBox]}>
                    <View style={[styles.bylineDate, styles.dateFlexBox]}>
                      <View style={styles.byline}>
                        {item?.content_type_id?.slug === 'live-blog-patrika' ? (
                          <View style={[styles.postTitleOverline, styles.dateFlexBox]}>
                            <Text style={styles.overline}>{item?.category_id?.name_lng}</Text>
                            <Text style={[styles.liveText, { display: showText ? 'none' : 'flex' }]}>
                              LIVE
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.postTitleOverline, styles.dateFlexBox]}>
                            <Text style={styles.overline}>{item?.category_id?.name_lng}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <Text numberOfLines={2} style={styles.headline}>{item?.title}</Text>
                  <View style={[styles.postTitleFooterGroup, styles.dateFlexBox]}>
                    <View style={[styles.bylineDate, styles.dateFlexBox]}>
                      <View style={[styles.postTitleFooterDate, styles.dateFlexBox]}>
                        <Text style={[styles.date, styles.dateTypo]}>
                        {moment(item.published_date).add(-330, 'minutes').fromNow()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )
        }
      </View>
    </TouchableOpacity>
  )

}


const BreakingHorizontalFragment = ({ item, index, navigation }) => {
  // console.log(item?.type_id?.name)
  const { screens } = useContext(initContext)
  const [screen, setScreen] = useState(screens.find(screen => screen.slug === (articleMap[item?.type_id?.name] || articleMap['Routine'])))
  // console.log(item?.content_type_id?.slug)
  // console.log(item?.content_type_id?.name)
  const [showText, setShowText] = useState(true);
  

  useEffect(() => {
    // Change the state every second or the time given by User.
    const interval = setInterval(() => {
      setShowText((showText) => !showText);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onPress = () => {
    navigation.navigate(screen.name, { story: item });
  };

  return (

    <TouchableOpacity onPress={onPress}>
      <View key={item.id} >
          {item && (
            <View style={[styles.imageIconLayout]}>
              <View style={styles.postSmall}>
                {item?.body_id?.featured_image_properties?.url && (
                  <View style={styles.imageSmall}>
                    <View style={styles.sourceImagesSmall}>
                      <FastImage
                        style={[styles.imageIcon, styles.imageIconLayout]}
                        resizeMode="cover"
                        source={{ uri: item?.body_id?.featured_image_properties?.url }}
                      />
                    </View>
                  </View>
                )}
                <View style={styles.postTitle}>
                  <View style={[styles.postTitleHeaderGroup, styles.dateFlexBox]}>
                    <View style={[styles.bylineDate, styles.dateFlexBox]}>
                      <View style={styles.byline}>
                        {item?.content_type_id?.slug === 'live-blog-patrika' ? (
                          <View style={[styles.postTitleOverline, styles.dateFlexBox]}>
                            <Text style={styles.overline}>{item?.category_id?.name_lng}</Text>
                            <Text style={[styles.liveText, { display: showText ? 'none' : 'flex' }]}>
                              LIVE
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.postTitleOverline, styles.dateFlexBox]}>
                            <Text style={[styles.overline]}>{item?.category_id?.name_lng}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <Text numberOfLines={2} style={[styles.headline, { fontWeight:'bold'}]}>{item?.title}</Text>
                  <View style={[styles.postTitleFooterGroup, styles.dateFlexBox]}>
                    <View style={[styles.bylineDate, styles.dateFlexBox]}>
                      <View style={[styles.postTitleFooterDate, styles.dateFlexBox]}>
                        <Text style={[styles.date, styles.dateTypo]}>
                        {moment(item.published_date).add(-330, 'minutes').fromNow()}
                        </Text>
                        {/* <Text style={[styles.liveText, { display: showText ? 'none' : 'flex' }]}>
                              BREAKING NEWS
                            </Text> */}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )
        }
      </View>
    </TouchableOpacity>
  )

}




const FeaturedFragment = ({ item, index, navigation }) => {
  const { screens } = useContext(initContext)
  const [screen, setScreen] = useState(screens.find(screen => screen.slug === (articleMap[item?.type_id?.name] || articleMap['Routine'])))
  const onPress = () => {
    navigation.navigate(screen.name, { story: item });
  };
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.postLarge, styles.vectorParent]}>
<>
        {item?.body_id?.featured_image_properties?.url &&
          <View style={styles.imageLarge}>
            <View style={styles.sourceImagesLarge}>
              <FastImage
                style={[styles.imageIcon, styles.imageIconLayout]}
                resizeMode="cover"
                source={{ uri: item?.body_id?.featured_image_properties?.url }}
              />
            </View>
          </View>}
        <View style={styles.spacer} />

        <View style={styles.postTitle}>
          <View style={[styles.postTitleHeaderGroup, styles.dateFlexBox]}>
            <View style={[styles.bylineDate, styles.dateFlexBox]}>
              <View style={styles.byline}>
                <View style={[styles.postTitleOverline, styles.dateFlexBox]}>
                  <Text style={styles.overline}>{item?.category_id?.name_lng}</Text>
                </View>
              </View>
            </View>
          </View>
          <Text
            style={[styles.headlineLarge, styles.headlineSpaceBlock]}
            numberOfLines={3}
          >
            {item?.title}

          </Text>
          <View style={[styles.postTitleFooterGroup, styles.dateFlexBox]}>
            <View style={[styles.postTitleFooterDate, styles.dateFlexBox]}>
              <Text style={[styles.date, styles.dateTypo]}>{moment(item.published_date).add(-330, 'minutes').fromNow()}</Text>
            </View>
          </View>
        </View>
        </>
      </View>
    </TouchableOpacity>
  );
}

const BreakingFragment = ({ item, index, navigation }) => {
  const { screens } = useContext(initContext)
  const [screen, setScreen] = useState(screens.find(screen => screen.slug === (articleMap[item?.type_id?.name] || articleMap['Routine'])))

  const [showText, setShowText] = useState(true);
  
  useEffect(() => {
    // Change the state every second or the time given by User.
    const interval = setInterval(() => {
      setShowText((showText) => !showText);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onPress = () => {
    navigation.navigate(screen.name, { story: item });
  };
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.postLarge, styles.vectorParent]}>
<>
        {item?.body_id?.featured_image_properties?.url &&
          <View style={styles.imageLarge}>
            <View style={styles.sourceImagesLarge}>
              <FastImage
                style={[styles.imageIcon, styles.imageIconLayout]}
                resizeMode="cover"
                source={{ uri: item?.body_id?.featured_image_properties?.url }}
              />
            </View>
          </View>}
        <View style={styles.spacer} />

        <View style={styles.postTitle}>
        
          {/* <View style={[styles.postTitleHeaderGroup, styles.dateFlexBox]}>
            <View style={[styles.bylineDate, styles.dateFlexBox]}>
              <View style={styles.byline}>
                <View style={[styles.postTitleOverline, styles.dateFlexBox]}>
                

                  <Image source={require("../assets/breakingNews.png")} style={{height:30, width:70}}/>
                </View>
              </View>
            </View>
          </View> */}
          <Text
            style={[styles.headlineLarge, styles.headlineSpaceBlock, { fontWeight:'bold'}]}
            numberOfLines={3}
          >
            {item?.title}

          </Text>
          <View style={[styles.postTitleFooterGroup, styles.dateFlexBox]}>
            <View style={[styles.postTitleFooterDate, styles.dateFlexBox]}>
              <Text style={[styles.date, styles.dateTypo, ]}>{moment(item.published_date).add(-330, 'minutes').fromNow()}</Text>
              {/* <Text style={[styles.liveText, { display: showText ? 'none' : 'flex' }]}>
                              BREAKING NEWS
                            </Text> */}
            </View>
          </View>
        </View>
        </>
      </View>
    </TouchableOpacity>
  );
}


const VERTICALLISTUNORDERED = ({ navigation, meta, data,relatedScreen, isPaginationScreen }) => {
  const [sectionData, setSectionData] = useState(data);
  const [isLoading, setIsLoading] = useState(false); 
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(isPaginationScreen);
  // const navigation = useNavigation();
  // const onPress = () => {
  //   navigation.navigate('Article'); 

  // const entertainmentCategoryMapping = {
  //   "bollywood-news": "Bollywood",
  //   ""
  // }
  const loadMore = async () => {
    setIsLoading(true)
    try {
      const response = await fetchStoriesByCategory();
      // if data length is less than limit variable value in query, that means all data is fetched 
      if(response?.data?.storiesByCategory?.length < 5){
        setShowLoadMoreButton(false)
      }
      console.log('fetchStoriesByCategory response', [...sectionData, ...response?.data?.storiesByCategory]);
      if(response?.data?.storiesByCategory?.length){
        setSectionData([...sectionData, ...response?.data?.storiesByCategory])
      }
    } catch (error) {
      console.log('error fetchStoriesByCategory', error);
    }
    setIsLoading(false)
  }
  const fetchStoriesByCategory = React.useCallback(async () => {
    try {
        let query = ` query($channel_id:Int, $skip:Int, $slug:String!`;
        let query1 = ``;
        let variable = { channel_id: 2, skip: sectionData?.length, slug: meta?.item?.slug };
        
        query1 =
                query1 +
                `storiesByCategory(slug:$slug, limit: 5,channel_id:$channel_id, skip: $skip) {
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
        
        // console.log(dataFetchList)
        let finalquery = `${query}){${query1} }`;
        console.log('finalquery', finalquery);
        console.log('variable', variable);
        // console.log(finalquery)
        const storiesByCategory = await client.query({
            query: gql(finalquery),
            variables: variable,
        });
        // batchDataUpdate(storiesByCategory)
        return storiesByCategory
    } catch (error) {
        console.log("Error", error)
        return {}
    }
  })
  const renderItem = ({item, index}) => {
    return (
      <HorizontalFragment item={item} index={index} key={item.id} navigation={navigation}></HorizontalFragment>
    )
  }
  if(!data) data = []
  return (
    (data.length !== 0 && <View style={{ paddingVertical: 20 }}>
      <SectionHeader title={meta.item.prettyName} navigation={navigation}  relatedScreen={relatedScreen} isPaginationScreen={isPaginationScreen}/>
      {/* {data.map((item, index) => (
        <HorizontalFragment item={item} index={index} key={item.id} navigation={navigation}></HorizontalFragment>
      ))
      } */}
      <FlatList
        data={sectionData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        initialNumToRender={5}
      />
      {showLoadMoreButton ?
      <>
        <LoadMore onPress={loadMore} />
        {isLoading && <ActivityIndicator color='#000'  size="large"/>} 
      </>
      :null}
    </View>)
  )
}

const AstrologySection = ({ navigation, story }) => {
  // const navigation = useNavigation();
  // const onPress = () => {
  //   navigation.navigate('Article'); 


  return (
    <>
      <SectionHeader title="Astrology" />
      <ScrollView horizontal={true} disableIntervalMomentum={true} showsHorizontalScrollIndicator={true} style={styles.frameParentAstro}>
        <Pressable style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon}
            resizeMode="cover"
            source={require("../assets/Mesh.png")}
          />
          <Text style={styles.headlineAstro}>मेष</Text>
        </Pressable>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon1}
            resizeMode="cover"
            source={require("../assets/Vrush.png")}
          />
          <Text style={styles.headlineAstro}>वृष</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon2}
            resizeMode="cover"
            source={require("../assets/Midhun.png")}
          />
          <Text style={styles.headlineAstro}>मिथुन</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon3}
            resizeMode="cover"
            source={require("../assets/Karka.png")}
          />
          <Text style={styles.headlineAstro}>कर्क</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon4}
            resizeMode="cover"
            source={require("../assets/Simh.png")}
          />
          <Text style={styles.headlineAstro}>सिंह</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon5}
            resizeMode="cover"
            source={require("../assets/Kanya.png")}
          />
          <Text style={styles.headlineAstro}>कन्या</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon6}
            resizeMode="cover"
            source={require("../assets/Tula.png")}
          />
          <Text style={styles.headlineAstro}>तुला</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon7}
            resizeMode="cover"
            source={require("../assets/Vrushchik.png")}
          />
          <Text style={styles.headlineAstro}>वृश्चिक</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon8}
            resizeMode="cover"
            source={require("../assets/Dhanu.png")}
          />
          <Text style={styles.headlineAstro}>धनु</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon9}
            resizeMode="cover"
            source={require("../assets/Makar.png")}
          />
          <Text style={styles.headlineAstro}>मकर</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon10}
            resizeMode="cover"
            source={require("../assets/Kumbh.png")}
          />
          <Text style={styles.headlineAstro}>कुंभ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vectorGroup}>
          <Image
            style={styles.vectorIcon11}
            resizeMode="cover"
            source={require("../assets/Meena.png")}
          />
          <Text style={styles.headlineAstro}>मीन</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const DOBSELECTION = ({ navigation, route,  meta, gotoNextOnboardScreen, selectedUserSectionObjects, userSectionObjects, selectedInterestObjects, interestObjects }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [formStatus, setFormStatus] = useState('आगे बढिये')
  const { updateOnBoardingStatus, user, userPreferences } = useContext(onBoardingContext)
  console.log('DOBSELECTION', {selectedUserSectionObjects, userSectionObjects, selectedInterestObjects, selectedDate});
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setFormStatus('आगे बढिये')
    });
    console.log('route?.params?.selectedUserSectionObjects', route?.params?.selectedUserSectionObjects);
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);
  const saveDOB = async () => {
    gotoNextOnboardScreen({selectedUserSectionObjects, userSectionObjects, selectedInterestObjects, selectedDate, interestObjects});
  }

  const formattedDateTime = (date) => {
    const dateParts = date.split("/");
    const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;  
    return formattedDate;
  }

  const onDateSelected = (date) => {
    // setShowCalendar(!showCalendar);
    setSelectedDate(date);
    // console.log(date)

  };

  return (
    <View style={{minHeight: Dimensions.get('window').height}}>
    <ImageBackground
      style={[styles.sectionSelectionIcon, styles.image1WrapperFlexBox]}
      // resizeMode="cover"
      source={require("../assets/bg.png")}
    >
      <View style={{ width: "100%", flexDirection: "column", backgroundColor: '#000', justifyContent: "center", marginBottom: 30,paddingTop:Platform.OS === 'android' ? 0 : 35  }}>
        <View style={styles.onboardingHeader}>
          <Text style={styles.onboardingHeaderText}>अपनी जन्मतिथि बताएं</Text>
        </View>
        <View style={{ flex: 1, height: 5, width: '100%', justifyContent: 'flex-start', flexDirection: 'column' }}>
          <View style={{ height: 5, width: '80%', backgroundColor: '#b50000' }} />
        </View></View>
      {/* <Calendar onDateSelected={onDateSelected} /> */}
      {/* <Calendar onSelectedChange={date => setSelectedDate(date)} /> */}
      {/* <Calendar onSelectedChange={date => console.log(date)} /> */}


      <View style={{height:"60%", width:"100%", borderRadius: 10, }}>
				{/* <View style={styles.modalView}>					 */}
				<DatePicker options={{
        backgroundColor: '#fff',
        textHeaderColor: '#000',
        textDefaultColor: '#494E50',
        selectedTextColor: '#fff',
        mainColor: '#000',
        textSecondaryColor: '#424242',
        borderColor: '#E0E0E0',
      }}  
	  mode="calendar"
    current="1990-07-13"
    maximumDate="2013-07-25"					
	  onSelectedChange={date => {
        setSelectedDate(formattedDateTime(date))
    }}
      // onSelectedChange={date => console.log(date)}
    />
			{/* </View> */}
			</View>
      <TouchableOpacity
        // key={}
        onPress={saveDOB}
        style={[styles.next, styles.nextLayout]}
      >
        <View style={[styles.buttonBase, styles.nextLayout]}>
          <Text style={[styles.text1button, styles.textTypoButton]}>{formStatus}</Text>
        </View>
      </TouchableOpacity>
    </ImageBackground>
    </View>
  );
};

const LOCATIONSELECTION = ({ navigation, route, meta, stories, selectedUserSectionObjects, userSectionObjects, selectedInterestObjects, interestObjects, selectedDate, gotoNextOnboardScreen }) => {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [formStatus, setFormStatus] = useState('आगे बढिये')
  const { updateOnBoardingStatus, user, userPreferences, setIsOnBoardingCompleted, screens } = useContext(onBoardingContext)
  useEffect(() => {
    console.log('LOCATIONSELECTION interestObjects', interestObjects);
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then((location) => {
        setSelectedLocation(location);
      })
      .catch((error) => {
        const { code, message } = error;
        console.warn(code, message);
        if (code === 'CANCELLED') {
          console.warn('Location request was canceled by the user');
        } else if (code === 'UNAVAILABLE') {
          console.warn('Location service is unavailable');
        } else if (code === 'TIMEOUT') {
          console.warn('Location request timed out');
        } else if (code === 'UNAUTHORIZED') {
          console.warn('Location permission denied by the user');
          // You can prompt the user to enable location services or request permissions here
        } else {
          console.warn('An error occurred while getting the location:', message);
        }
        // temporary holder...
        setSelectedLocation({ latitude: 0, longitude: 0 })
      });
  }, []);

  useEffect(() => {
    if (selectedLocation) saveLocation()
  }, [selectedLocation])

  const saveLocation = async () => {
    try {
      const updatedUserPreference = await DataStore.save(
        UserPreferences.copyOf(userPreferences[0], updated => {
          updated.locationID = selectedLocation
        }))
        saveUserObjects()
          .then(r => {
            saveInterestObjects().then(r1 => {
              saveDOB().then(r3 => {
                updateOnBoardingStatus();
              })
            }).catch((e) => {
              console.error(e.message); // "oh, no!"
            })
          })
          .catch((e) => {
            console.error(e.message); // "oh, no!"
          })
        
        // setIsOnBoardingCompleted(true);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const saveUserObjects = async () => {
    try {
      for (const objectId of selectedUserSectionObjects) {
        const objectIndex = userSectionObjects.findIndex((obj) => obj.id === objectId);
        const item = userSectionObjects[objectIndex]
        await DataStore.save(new Section({
          screenID: screens.find(id => id.name === 'home').id,
          viewComponent: item.viewComponent,
          sortPriority: item.sortPriority,
          prettyName: item.prettyName,
          slug: item.slug,
          name: item.name,
          userID: user?.attributes?.sub || user?.signInUserSession?.idToken?.payload?.sub,
          visible: true,
          sectionType: item.sectionType
        }))
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const saveInterestObjects = async () => {
    try {
      for (const objectId of selectedInterestObjects) {
        const objectIndex = interestObjects.findIndex((obj) => obj.id === objectId);
        const item = interestObjects[objectIndex]
        await DataStore.save(new Interest({
          prettyName: item.prettyName,
          name: item.name,
          userID: user?.attributes?.sub || user?.signInUserSession?.idToken?.payload?.sub,
        }))
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const saveDOB = async () => {
    try {
      const updatedUserPreference = await DataStore.save(
        UserPreferences.copyOf(userPreferences[0], updated => {
          updated.dob = selectedDate
        }))
      } catch (error) {
      console.error('Error:', error);
    }
  }
  return (
    <ImageBackground
      style={{ width: '100%', height: '100%', flex: 1 }}
      //style={[styles.sectionSelectionIcon, styles.image1WrapperFlexBox]}
      // resizeMode="cover"
      source={require("../assets/bg.png")}
    >
      <View style={{ flex: 1 }}></View>
    </ImageBackground>
  )

}
const FEATUREDSTORYANDLIST = ({ navigation, meta, data,relatedScreen }) => {
  // console.log("Inside FSL..",data[0])
  if(!data) data = []
  if (meta.item.slug === 'international-news') {
    // console.log(meta.slug,Object.keys(data))
    (data.length !== 0 ? (<View style={{ paddingVertical: 20 }}>
      <SectionHeader title={meta.item.prettyName} navigation={navigation}  relatedScreen={relatedScreen} />
      {data?.map((item, index) => (

        <React.Fragment key={item.id}>
          {index === 0 ? (
            <FeaturedFragment item={item} index="0" key={item?.id} navigation={navigation}></FeaturedFragment>
          ) : (
            <HorizontalFragment item={item} index={index} key={item.id} navigation={navigation}></HorizontalFragment>
          )}
        </React.Fragment>
      ))}
    </View>) : <View style={{ paddingVertical: 20 }}><Text>No data</Text></View>)


  } else {
    return (
      (data.length !== 0 && <View style={{ paddingVertical: 20 }}>
        <SectionHeader title={meta.item.prettyName} navigation={navigation}  relatedScreen={relatedScreen} />
        {data?.map((item, index) => (
          <React.Fragment key={item.id}>
            {index === 0 ? (
              <FeaturedFragment item={item} index="0" key={item?.id} navigation={navigation}></FeaturedFragment>
            ) : (
              <HorizontalFragment item={item} index={index} key={item.id} navigation={navigation}></HorizontalFragment>
            )}
          </React.Fragment>
        ))}
      </View>)
    )
  }

}




const OpinionSection = ({ navigation, story }) => {
  // const navigation = useNavigation();
  // const onPress = () => {
  //   navigation.navigate('Article'); 


  return (
    <View style={{ paddingVertical: 20 }}>
      <SectionHeader title="Opinion" />
      <TouchableOpacity style={styles.opinion}>
        <View style={styles.opinionPost}>
          <View style={[styles.opinionAuthorView, styles.opinionFlexBox]}>
            <ImageBackground
              style={styles.opinionAuthorDp}
              resizeMode="cover"
              source={require("../assets/opinionauthor.png")}
            />
            <Text
              style={[styles.opinionAuthorName, styles.opinionTypo1]}
              numberOfLines={1}
            >
              Subramanian Swamy
            </Text>
          </View>
          <Text style={styles.opinionTitle} numberOfLines={3}>
            कपिल मिश्रा को मिली बड़ी जिम्मेदारी, दिल्ली बीजेपी ने बनाया प्रदेश
            उपाध्यक्ष
          </Text>
          <View style={[styles.opinionFooter, styles.opinionFlexBox]}>
            <Text
              style={[styles.opinionSection, styles.opinionTypo1]}
              numberOfLines={1}
            >
              Editorial
            </Text>
            <Text style={[styles.opinionBullet, styles.opinionTypo]}>•</Text>
            <Text
              style={[styles.opinionDate, styles.opinionTypo]}
              numberOfLines={1}
            >
              March 9, 2022
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.opinion}>
        <View style={styles.opinionPost}>
          <View style={[styles.opinionAuthorView, styles.opinionFlexBox]}>
            <ImageBackground
              style={styles.opinionAuthorDp}
              resizeMode="cover"
              source={require("../assets/opinionauthor.png")}
            />
            <Text
              style={[styles.opinionAuthorName, styles.opinionTypo1]}
              numberOfLines={1}
            >
              Subramanian Swamy
            </Text>
          </View>
          <Text style={styles.opinionTitle} numberOfLines={3}>
            कपिल मिश्रा को मिली बड़ी जिम्मेदारी, दिल्ली बीजेपी ने बनाया प्रदेश
            उपाध्यक्ष
          </Text>
          <View style={[styles.opinionFooter, styles.opinionFlexBox]}>
            <Text
              style={[styles.opinionSection, styles.opinionTypo1]}
              numberOfLines={1}
            >
              Editorial
            </Text>
            <Text style={[styles.opinionBullet, styles.opinionTypo]}>•</Text>
            <Text
              style={[styles.opinionDate, styles.opinionTypo]}
              numberOfLines={1}
            >
              March 9, 2022
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.opinion}>
        <View style={styles.opinionPost}>
          <View style={[styles.opinionAuthorView, styles.opinionFlexBox]}>
            <ImageBackground
              style={styles.opinionAuthorDp}
              resizeMode="cover"
              source={require("../assets/opinionauthor.png")}
            />
            <Text
              style={[styles.opinionAuthorName, styles.opinionTypo1]}
              numberOfLines={1}
            >
              Subramanian Swamy
            </Text>
          </View>
          <Text style={styles.opinionTitle} numberOfLines={3}>
            कपिल मिश्रा को मिली बड़ी जिम्मेदारी, दिल्ली बीजेपी ने बनाया प्रदेश
            उपाध्यक्ष
          </Text>
          <View style={[styles.opinionFooter, styles.opinionFlexBox]}>
            <Text
              style={[styles.opinionSection, styles.opinionTypo1]}
              numberOfLines={1}
            >
              Editorial
            </Text>
            <Text style={[styles.opinionBullet, styles.opinionTypo]}>•</Text>
            <Text
              style={[styles.opinionDate, styles.opinionTypo]}
              numberOfLines={1}
            >
              March 9, 2022
            </Text>
          </View>
        </View>
      </TouchableOpacity>

    </View>
  );
}

const HEADLINESSECTION = ({ navigation, meta, data }) => {
  if(!data)data = []
  return (
    <>
    {data.length !== 0 && <View style={{ paddingVertical: 20 }}>
      {data?.map((item, index) => (
        <React.Fragment key={item.id}>
          {index === 0 ? (
            <FeaturedFragment item={item} index="0" key={item?.id} navigation={navigation}></FeaturedFragment>
          ) : (
            <HorizontalFragment item={item} index={index} key={item.id} navigation={navigation}></HorizontalFragment>
          )}
        </React.Fragment>
      ))}
    </View>}
    </>
  )
}

const BREAKINGNEWS = ({ navigation, meta, data,relatedScreen }) => {
  // console.log("Inside FSL..",data[0])
  if(!data) data = []
  
    return (
      (data.length !== 0 && <View style={{ paddingVertical: 0 }}>
        <LinearGradient
                  // locations={[0, 1, 0]}
                  colors={[
                    "rgba(146, 43, 33, 1)",
                    "rgba(146, 43, 33, 0.85)",
                    "rgba(146, 43, 33, 0.55)",
                    "rgba(146, 43, 33, 0.15)",
                    "rgba(146, 43, 33, 0.10)",
                    "rgba(146, 43, 33, 0.00)",
                    "rgba(146, 43, 33, 0.00)",
                  ]}
                  useAngle={true}
                  angle={180}
                >
        <BreakingHeader title={meta.item.prettyName} navigation={navigation}  relatedScreen={relatedScreen} />
        {data?.map((item, index) => (
          <React.Fragment key={item.id}>
            {index === 0 ? (
              <BreakingFragment item={item} index="0" key={item?.id} navigation={navigation}></BreakingFragment>
            ) : (
              <BreakingHorizontalFragment item={item} index={index} key={item.id} navigation={navigation}></BreakingHorizontalFragment>
            )}
          </React.Fragment>
        ))}
        </LinearGradient>
      </View>)
    )
  }



const HORIZONTALIMAGELIST = ({ navigation, story }) => {
  return (
    <View style={{ paddingVertical: 20, backgroundColor: '#f5f5f5' }}>
      <SectionHeaderWhite title="वेब कहानियाँ" />
      <ScrollView horizontal={true} disableIntervalMomentum={true} showsHorizontalScrollIndicator={true}>
        <WebStoryWhite />
        <WebStoryWhite />
        <WebStoryWhite />
        <WebStoryWhite />
      </ScrollView>
    </View>
  )
}

const TAG = ({ navigation, route, meta, data }) => {
  //add a state for query
  const [slug, setSlug] = useState(route?.params?.tag?.slug || meta.item.config.slug)
  const [tagResults, setTagResults] = useState([])
  useEffect(() => {
    if(slug) {
      fetchTagResults(slug)
    }

  }, [slug])

  const fetchTagResults = async (slug) => {
    let tagResults = {}
    try {
      const storiesByTopicQuery = PatrikaQueries.topicStoriesQuery
      const variables = {
        slug: slug
      }
      tagResults = await client.query({
        query: storiesByTopicQuery,
        variables: variables,
      });
      setTagResults(tagResults?.data?.storiesByTopic)
    } catch (error) {
      return {}
    }
  }

  return (
    <KeyboardAvoidingView style={{ width: "100%" }}>
      <SectionHeader title={route?.params?.tag?.prettyName || meta.item.prettyName} />
      {tagResults && <HEADLINESSECTION navigation={navigation} meta={meta} data={tagResults}></HEADLINESSECTION>}
    </KeyboardAvoidingView>
  );
};

const STORY = ({ navigation, route, meta}) => {
  //fetch the story data based on story id
  const [storyID, setStoryID] = useState(route?.params?.story?.id)
  const [story, setStory] = useState({})
  
  useEffect(() => {
    const fetchStory = async (id) => {
      let story = {}
      try {
        const storyQuery = PatrikaQueries.storyDetail
        const variables = {
          id: id
        }
        story = await client.query({
          query: storyQuery,
          variables: variables
        });
        setStory(story?.data?.storyDetail)
      } catch (error) {
        return {}
      }
    }
    if(storyID) fetchStory(storyID)
  }, [storyID])
  return (<>
  {Object.keys(story).length !=0 ? 
  (<Article navigation={navigation} story={story}></Article>):
  <ActivityIndicator color='#000' size='large' /> 
}
  </>)
}

const VIDEOSTORY = ({ navigation, route, meta}) => {
  // console.log("Video Story", route?.params?.story)
  return (<VideoShow navigation={navigation} story={route?.params?.story}></VideoShow>)
}

const PHOTOSTORY = ({ navigation, route, meta}) => {
  return (<PhotoShow navigation={navigation} story={route?.params?.story}></PhotoShow>)
}

const WEBSTORIES = ({ navigation, route, meta, data,relatedScreen }) => {
  const [webstories, setWebStories] = useState(data ? data : []);
  return (
    <>
    {Object.keys(webstories).length !=0  && <View style={{ paddingBottom: 20, backgroundColor: '#f5f5f5' }}>
      <SectionHeader title={meta.item.prettyName} navigation={navigation}  relatedScreen={relatedScreen}/>
      {/* {console.log(webstories)} */}
      <ScrollView horizontal={true} disableIntervalMomentum={true} showsHorizontalScrollIndicator={true}>
      {webstories.map((item, index) => (<WebStoryWhite navigation={navigation} item={item} key={index}></WebStoryWhite>))}
      </ScrollView>
    </View>} 
    </>
  )
}

const WEBSTORIESVERTICAL = ({ navigation, route, meta, data }) => {
  const [webstories, setWebStories] = useState(data ? data : []);
  return (
    <>
    {webstories.length  && <View style={{ paddingBottom: 20, backgroundColor: '#f5f5f5', backgroundColor: '#fff', alignItems:"center"}}>
      <SectionHeader title={meta.item.prettyName} />
      {/* {console.log(webstories)} */}
      <FlatList
        data={webstories}
        // horizontal={true}
        numColumns={2}
        showsHorizontalScrollIndicator={true}
        disableIntervalMomentum={true} // Note that FlatList doesn't have a direct prop for this, you might need to handle it differently.
        keyExtractor={(item, index) => index.toString()}
        // contentContainerStyle={{}}
        renderItem={({ item, index }) => (
          <WebStoryWhite navigation={navigation} item={item} key={index} />
        )}
      />
    </View>} 
    </>
  )
}




const WEBSTORY = ({ navigation, route, meta }) => {
  function LoadingIndicatorView() {
    return <ActivityIndicator color='#000' size='large' />
  }

  const [uri, setURI] = useState(route?.params?.data?.uri)
  // console.log(uri)
  return <WebView 
    source={{ uri: `https://webstories.zimbea.com${uri}` }}  
    style={{ width: deviceWidth, height: deviceHeight, flex:1 }}

    // style={{width:'100%',height:'100%', backgroundColor:"#000"}}
    javaScriptEnabled={true} 
    scrollEnabled={false}
    allowsFullscreenVideo={true}
    renderLoading={this.LoadingIndicatorView}
    startInLoadingState={true}
    userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 
    (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"    
    />
}









const styles = StyleSheet.create({
  image1WrapperFlexBox: {
    justifyContent: "space-between",
    alignItems: "center",
    // flex:1,

  },

  textinput: {
    fontFamily: "NotoSansDevanagari-Regular",
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    flex:1,
  },
  vectorIcon: {
    width: 32,
    height: 32,
  },
  parent: {
    borderRadius: 10,
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderColor: "#e6e6e6",
    borderWidth: 1,
    width: "90%",
    marginTop: 20,
    // flexDirection: "row",
    // paddingHorizontal: 7,
    marginHorizontal: 16,
    // alignItems: "center",
    // justifyContent: "space-between",
  },
  searchParent:{
    paddingHorizontal:10, 
    paddingVertical:3, 
    flexDirection:"row", 
    justifyContent:"space-between",
    alignItems:"center",
  },
  overlineTypo: {
    lineHeight: 16,
    letterSpacing: 1,
    fontSize: 12,
    textAlign: "left",
  },
  postFlexBoxLarge: {
    paddingTop: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  headlineSpaceBlock: {
    // marginTop: 4,
    alignSelf: "stretch",
  },
  dateTypo: {
    color: "#a3a9be",
    letterSpacing: 0,
    textAlign: "left",
    lineHeight: 16,
    fontSize: 12,
  },
  imageIconLarge: {
    alignSelf: "stretch",
    flex: 1,
  },
  sourceImagesLarge: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
    position: "absolute",
  },
  vectorIcon: {
    height: "10.96%",
    width: "7.32%",
    top: "3.65%",
    right: "2.44%",
    bottom: "85.39%",
    left: "90.24%",
    maxWidth: "100%",
    maxHeight: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  imageLarge: {
    height: 219,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  spacer: {
    width: 328,
    height: 16,
    overflow: "hidden",
  },
  // overline: {
  //   fontWeight: "700",
  //   fontFamily: "NotoSansDevanagari-Bold",
  //   color: "#f24a4a",
  //   textAlign: "left",
  // },
  liveOverline: {
    fontWeight: "600",
    fontFamily: "NotoSansDevanagari-SemiBold",
    color: "#fff",
    textAlign: "left",
  },
  postTitleOverline1: {
    backgroundColor: "#fb6969",
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  postTitleHeaderGroupLarge: {
    flexDirection: "row",
  },
  headlineLarge: {
    fontSize: 21,
    //lineHeight: 30,
    // fontWeight: "600",
    fontFamily: "NotoSansDevanagari-Bold",
    color: "#07153a",
    textAlign: "left",
  },
  overline1: {
    color: "#f67807",
    fontFamily: "NotoSansDevanagari-Regular",
    textAlign: "left",
  },
  postTitleOverline2: {
    paddingBottom: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  bullet: {
    fontFamily: "NotoSansDisplay-Regular",
    marginLeft: 8,
  },
  date: {
    fontFamily: "NotoSansDevanagari-Regular",
  },
  postTitleFooterDate: {
    marginLeft: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  bylineDate: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  postTitleHeaderGroup: {
    // paddingTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  postTitleLarge: {
    justifyContent: "center",
    overflow: "hidden",
    alignSelf: "stretch",
  },
  postLarge: {
    width: "100%",
    padding: 16,
    alignItems: "center",
    flex: 1,
    // backgroundColor:"#fff"
  },
  ndaTypo: {
    textAlign: "left",
    color: "#000",
    fontSize: 13,
  },
  wrapperFlexBox: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
  text: {
    fontFamily: "NotoSansDevanagari-Regular",
  },
  nda: {
    fontFamily: "Noto Sans Devanagari Condensed",
  },
  ndaWrapper: {
    margin: 5,
  },
  frameParent: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    alignContent: 'space-evenly',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  vectorIcon: {
    width: 40,
    height: 40,
  },
  image1Icon: {
    width: 126,
    height: 50,
  },
  vectorParent: {
    //flex: 1,
    width: "100%",
    height: 74,
    flexDirection: "row",
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 10,
    //marginBottom:10,
    justifyContent: "space-between",
    backgroundColor: '#ffffff',
    borderBlockColor: "#EEEEEE",
    borderBottomWidth: 2,
  },
  imageFlexBox: {
    overflow: "hidden",
    flex: 1,
  },
  dateFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  dateTypo: {
    color: "#a3a9be",
    letterSpacing: 0,
    lineHeight: 16,
    fontSize: 12,
    textAlign: "left",
  },
  // headline: {
  //   fontSize: 20,
  //   lineHeight: 24,
  //   // fontWeight: "500",
  //   fontFamily: "NotoSansDevanagari-SemiBold",
  //   color: "#07153a",
  //   textAlign: "left",
  //   alignSelf: "stretch",
  // },
  elementsPostTitle: {
    justifyContent: "center",
  },
  imageIconMedium: {
    alignSelf: "stretch",
    flex: 1,
  },
  sourceImagesMedium: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
  },
  imageMedium: {
    height: 104,
    marginLeft: 16,
  },
  titleImage: {
    flexDirection: "row",
    alignSelf: "stretch",
  },
  overline: {
    letterSpacing: 1,
    color: "#b50000",
    fontFamily: "NotoSansDevanagari-Regular",
    lineHeight: 20,
    fontSize: 13,
    textAlign: "left",
  },
  postTitleOverline: {
    paddingBottom: 1,
  },
  bullet: {
    fontFamily: "NotoSansDisplay-Regular",
    marginLeft: 8,
  },
  byline: {
    flexDirection: "row",
  },
  date: {
    fontFamily: "NotoSansDevanagari-Regular",
  },
  bylineDate: {
    flex: 1,
  },
  postTitleFooterGroup: {
    paddingTop: 4,
    // marginTop: 8,
    alignSelf: "stretch",
  },
  postMedium: {
    width: "100%",
    padding: 16,
    flex: 1,
  },
  imageIconLayout: {
    width: "100%",
    flex: 1,
    borderRadius: 4,
  },
  dateTypo: {
    color: "#a3a9be",
    letterSpacing: 0,
    lineHeight: 16,
    fontSize: 12,
    textAlign: "left",
  },
  // headline: {
  //   fontSize: 18,
  //   lineHeight: 24,
  //   fontWeight: "500",
  //   fontFamily: "NotoSansDevanagari-Medium",
  //   color: "#07153a",
  //   textAlign: "left",
  //   alignSelf: "stretch",
  // },
  postTitleOverline: {
    paddingBottom: 1,
  },
  bullet: {
    fontFamily: "NotoSansDisplay-Regular",
    marginLeft: 8,
  },
  byline: {
    flexDirection: "row",
  },
  date: {
    fontFamily: "NotoSansDevanagari-Regular",
  },
  bylineDate: {
    flex: 1,
  },
  // postTitleFooterGroup: {
  //   paddingTop: 4,
  //   marginTop: 4,
  //   alignSelf: "stretch",
  // },
  postTitle: {
    // justifyContent: "center",
    overflow: "hidden",
    flex: 1,
    alignItems: "flex-start",
  },
  sourceImagesSmall: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
  },
  imageSmall: {
    maxWidth: 120,
    minWidth:120,
    // height: 80,
    marginRight: 16,
    overflow: "hidden",
    aspectRatio: 3/2,
  },
  postSmall: {
    width: "100%",
    padding: 16,
    flexDirection: "row",
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "flex-start"
  },
  postSmallParent: {
    padding: 16,
  },
  overlineTypo: {
    lineHeight: 16,
    letterSpacing: 1,
    fontSize: 12,
    textAlign: "left",
  },
  // headlineSpaceBlock: {
  //   marginTop: 4,
  //   alignSelf: "stretch",
  // },
  dateTypo: {
    color: "#a3a9be",
    letterSpacing: 0,
    textAlign: "left",
    lineHeight: 16,
    fontSize: 12,
  },
  liveOverline: {
    fontWeight: "600",
    fontFamily: "NotoSansDevanagari-SemiBold",
    color: "#fff",
    textAlign: "left",
  },
  postTitleOverlineSmall: {
    backgroundColor: "#fb6969",
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  postTitleHeaderGroup: {
    flexDirection: "row",
  },
  headline: {
    fontSize: 18,
    lineHeight: 24,
    // fontWeight: "500",
    fontFamily: "NotoSansDevanagari-SemiBold",
    color: "#07153a",
    textAlign: "left",
  },
  overlineSmall: {
    color: "#f67807",
    fontFamily: "NotoSansDevanagari-Regular",
    textAlign: "left",
  },
  postTitleOverline1: {
    paddingBottom: 1,
  },
  bullet: {
    fontFamily: "NotoSansDisplay-Regular",
    marginLeft: 8,
  },
  date: {
    fontFamily: "NotoSansDevanagari-Regular",
  },
  bylineDate: {
    flex: 1,
  },
  // postTitleFooterGroup: {
  //   paddingTop: 4,
  //   alignItems: "center",
  //   flexDirection: "row",
  // },
  // postTitle: {
  //   overflow: "hidden",
  //   justifyContent: "center",
  //   flex: 1,
  // },
  imageLayout: {
    overflow: "hidden",
    width: 156,
  },
  sourceImagesPosition: {
    left: 0,
    top: 0,
    position: "absolute",
  },
  photoLayout: {
    height: 10,
    width: 10,
  },
  photoCamera2Icon: {
    left: 0,
    top: 0,
    position: "absolute",
  },
  camera:{
    height:25,
    width:25,
  },
  lock: {
    top: 76,
    right: 132,
    borderRadius: 25,
    backgroundColor: "#fb6969",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
    elevation: 2,
    shadowOpacity: 1,
    padding: 5,
    position: "absolute",
    overflow: "hidden",
  },
  imageIcon: {
    flex: 1,
    alignSelf: "stretch",
    // aspectRatio: 3/2,

  },
  sourceImages: {
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  image: {
    height: 104,
  },
  headlineMedia: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "NotoSansDevanagari-Medium",
    color: "#fff",
    textAlign: "left",
    alignSelf: "stretch",
  },
  elementsPostTitle: {
    justifyContent: "center",
    marginTop: 16,
  },
  postMedium: {
    padding: 16,
  },
  rectangleLayout: {
    height: 214,
    width: 152,
  },
  icon: {
    borderRadius: 4,
    height: "100%",
    backgroundColor: "transparent",
    width: "100%",
  },
  rectangle: {
    left: 0,
    top: 0,
    position: "absolute",
  },
  vectorIcon: {
    height: "11.21%",
    width: "15.79%",
    top: "7.48%",
    right: "73.68%",
    bottom: "81.31%",
    left: "10.53%",
    maxWidth: "100%",
    overflow: "hidden",
    maxHeight: "100%",
    position: "absolute",
  },
  textWebStory: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "NotoSerifDevanagari-SemiBold",
    color: "#fff",
    textAlign: "left",
    display: "flex",
    alignItems: "flex-end",
    width: 145,
    marginTop: 8,
  },
  cardRecent: {
    flex: 1,
    padding: 16,
    width: "100%",
  },
  vectorIcon: {
    width: 102,
    height: 90,
  },
  headlineAstro: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "NotoSansDevanagari-Medium",
    color: "#07153a",
    textAlign: "center",
    marginTop: 10,
  },
  vectorParent: {
    alignItems: "center",
  },
  vectorIcon1: {
    width: 94,
    height: 90,
  },
  vectorGroup: {
    marginLeft: 20,
    alignItems: "center",
  },
  vectorIcon2: {
    width: 83,
    height: 90,
  },
  vectorIcon3: {
    width: 101,
    height: 90,
  },
  vectorIcon4: {
    width: 90,
    height: 90,
  },
  vectorIcon5: {
    width: 84,
    height: 90,
  },
  vectorIcon6: {
    width: 92,
    height: 90,
  },
  vectorIcon7: {
    width: 74,
    height: 90,
  },
  vectorIcon8: {
    width: 89,
    height: 90,
  },
  vectorIcon9: {
    width: 78,
    height: 90,
  },
  vectorIcon10: {
    width: 77,
    height: 90,
  },
  vectorIcon11: {
    width: 75,
    height: 90,
  },
  frameParentAstro: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    //alignItems: "center",
    paddingVertical: 10,
  },
  frameParentFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  textTypo: {
    textAlign: "left",
    color: "#000",
    fontSize: 12,
  },
  wrapperFlexBox: {
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#eee",
    borderRadius: 4,
    alignItems: "center",
    flexDirection: "row",
  },
  locationPin1Icon: {
    width: 15,
    height: 15,
  },
  text: {
    marginLeft: 5,
    color: "#000",
    fontSize: 12,
  },
  locationPin1Parent: {
    flexDirection: "row",
  },
  text1: {
    color: "#000",
    fontSize: 12,
  },
  nda: {
    fontFamily: "Noto Sans Devanagari Condensed",
    color: "#000",
    fontSize: 12,
  },
  ndaWrapper: {
    marginLeft: 7,
  },
  frameParent: {
    width: 264,
  },
  themelightComponentnavbarInner: {
    height: 23,
    flexDirection: "row",
  },
  themelightComponentnavbar: {
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderColor: "#eee",
    borderBottomWidth: 1,
    flex: 1,
    width: "100%",
    paddingHorizontal: 11,
    paddingTop: 9,
    paddingBottom: 11,
    justifyContent: "space-between",
  },
  opinionFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  opinionTypo1: {
    lineHeight: 16,
    letterSpacing: 1,
    fontSize: 12,
    textAlign: "left",
  },
  opinionTypo: {
    marginLeft: 8,
    color: "#a3a9be",
    letterSpacing: 0,
    textAlign: "left",
    lineHeight: 16,
    fontSize: 12,
  },
  opinionAuthorDp: {
    width: 21,
    height: 21,
  },
  opinionAuthorName: {
    textTransform: "uppercase",
    fontFamily: "NotoSans-Regular",
    color: "#58cb98",
    marginLeft: 9,
    textAlign: "left",
  },
  opinionAuthorView: {
    paddingBottom: 1,
  },
  opinionTitle: {
    alignSelf: "stretch",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "NotoSansDevanagari-Medium",
    color: "#07153a",
    marginTop: 4,
    textAlign: "left",
  },
  opinionSection: {
    color: "#f67807",
    fontFamily: "NotoSansDevanagari-Regular",
    textAlign: "left",
  },
  opinionBullet: {
    fontFamily: "NotoSansDisplay-Regular",
  },
  opinionDate: {
    fontFamily: "NotoSansDevanagari-Regular",
  },
  opinionFooter: {
    width: 328,
    paddingTop: 4,
    marginTop: 4,
    flex: 1,
  },
  opinionPost: {
    overflow: "hidden",
    justifyContent: "center",
    flex: 1,
  },
  opinion: {
    width: "100%",
    padding: 16,
    flexDirection: "row",
    flex: 1,
  },
  chineseTypo: {
    fontWeight: "700",
    lineHeight: 24,
    fontSize: 18,
    textAlign: "left",
  },
  chineseStocksAre: {
    fontFamily: "NotoSans-SemiBold",
    color: "#fff",
    textAlign: "left",
  },
  chineseStocksAreOnARollerWrapper: {
    borderRadius: 50,
    backgroundColor: "#d50000",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  chineseStocksAre1: {
    fontFamily: "NotoSansDevanagari-SemiBold",
    color: "rgba(0, 0, 0, 0.9)",
    alignSelf: "stretch",
    textAlign: "left",
  },
  badidate: {
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 16,
    fontFamily: "NotoSansDisplay-Regular",
    color: "rgba(0, 0, 0, 0.6)",
    textAlign: "left",
  },
  badibylineDate: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  badipostTitleFooterGroup: {
    marginTop: 4,
    alignSelf: "stretch",
    alignItems: "center",
    flexDirection: "row",
  },
  badipostTitle: {
    overflow: "hidden",
    marginLeft: 16,
    justifyContent: "center",
    flex: 1,
  },
  badipostSmall: {
    width: "100%",
    padding: 16,
    flexDirection: "row",
    flex: 1,
  },
  buttonBase: {
    shadowColor: "rgba(16, 24, 40, 0.05)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
    elevation: 2,
    shadowOpacity: 1,
    borderColor: "#000",
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: "center",
    borderStyle: "solid",
    backgroundColor: "#fff",
    alignItems: "center",
    overflow: "hidden",
    flex: 1,
  },
  nextLayout: {
    borderRadius: 8,
    flexDirection: "row",
    // position:"absolute",
    // bottom:0,
    // left:0,
    // width:"100%"
  },
  next: {
    width: 320,
    height: 40,
  },
  textLayout: {
    width: 147,
    textAlign: "left",
  },
  sectionSelectionIcon: {
    // maxHeight: Dimensions.get('window').height,
    paddingBottom: 40,
    // overflow: "hidden",
    flex: 1,
    minWidth: pageWidth,
    backgroundColor: "#fff",
  },
  sections: {
    flex: 1,
    flexDirection: "column",
    width: "95%",
    // height:pageHeight-150,
    alignItems: "center",
    paddingBottom:30,
  },
  sectionsInterest: {
    flex: 1,
    flexDirection: "column",
    width: "95%",
    // height:pageHeight-150,
    // alignItems: "center",
    // paddingBottom:30,
  },
  stateSelection: {
    flex: 1,
    flexDirection: "column",
    width: "95%",
    // height:pageHeight-150,
    alignItems: "center",
    // paddingBottom:30,
  },
  sectionsFlatListContent: {
    flexDirection: "row",
    alignSelf: "center",
    paddingHorizontal: 10,
    width: "100%",
    paddingTop: 10,
  },
  text1Inactive: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "NotoSansDevanagari-Regular",
    color: "#000",
    marginTop: 16,
    fontWeight: 'bold',
  },
  text1Active: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "NotoSansDevanagari-Regular",
    color: "#a3a9be",
    marginTop: 16,
    fontWeight: 'bold',
  },
  onboardingHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSerifDevanagari-Bold",
    color: "#fff",
    textAlign: "left",
  },
  onboardingHeader: {
    backgroundColor: "#000",
    // flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 20,
    // marginBottom:30,
  },
  text1button: {
    color: "#000",
    fontSize: 16,
    fontWeight: 'bold',
  },
  textTypoButton: {
    textAlign: "left",
    color: "#000",
  },
  label: {
    fontSize: 17,
    letterSpacing: 0,
    // lineHeight: 22,
    color: "#a3a9be",
    textAlign: "center",
    // marginLeft: 10,
  },
  categoryStyleActive: {
    borderRadius: 28,
    backgroundColor: "#000",
    borderStyle: "solid",
    borderColor: "#000",
    // borderWidth: 1.5,
    // width: 180,
    // height: 90,
    paddingHorizontal: 15,
    paddingVertical:10,
    margin: 7,
    // justifyContent: "center",
    // margin: 5,
    alignSelf: "flex-start",
    alignItems: "flex-start"
  },
  categoryStyleInactive: {
    borderRadius: 28,
    backgroundColor: "#E0E0E0",
    borderStyle: "solid",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    // width: 180,
    // height: 90,
    // justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical:10,
    margin: 7,
    alignSelf: "flex-start",
    alignItems: "flex-start"
  },
  interestTextActive: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "NotoSansDevanagari-Regular",
    color: "#000",
    // marginTop: 16,
    // fontWeight: 'bold',
  },
  interestTextInactive: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "NotoSansDevanagari-Regular",
    color: "#fff",
    // marginTop: 16,
    fontWeight: 'bold',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F8F9F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    marginHorizontal: 5,
    marginVertical: 5,
    borderColor: '#d5d5d5',
    borderWidth: 1,
  },
  tagText: {
    color: '#000',
  },
  searchIcon:{
    height:30,
    width:30,
  },
  liveText:{
    fontSize:10, 
    fontWeight:"bold",
    color:"#fff",
    backgroundColor:"red",
    paddingHorizontal:5,
    paddingVertical:2, 
    borderRadius:8,
    marginLeft:6, 
  },
  frameSpaceBlock: {
    marginTop: 12,
    height: 15,
    backgroundColor: "rgba(217, 217, 217, 0.6)",
  },
  frameChild: {
    height: 80,
    width: "20%",
    backgroundColor: "rgba(217, 217, 217, 0.6)",
  },
  frameItem: {
    height: 15,
    width: "20%",
    backgroundColor: "rgba(217, 217, 217, 0.6)",
  },
  frameInner: {
    width: "100%",
  },
  frameChild1: {
    width: "60%",
  },
  rectangleGroup: {
    marginLeft: 17,
    width:"70%"
  },
  rectangleParent: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical:30,
    alignSelf:"center",
    justifyContent:'center',
    // marginLeft: 17,
  },
  frameSpaceBlockLarge: {
    marginTop: 12,
    height: 15,
    backgroundColor: "rgba(217, 217, 217, 0.6)",
  },
  frameChildLarge: {
    height: 200,
    width: "100%",
    backgroundColor: "rgba(217, 217, 217, 0.6)",
  },
  frameItemLarge: {
    height: 15,
    width: "40%",
    backgroundColor: "rgba(217, 217, 217, 0.6)",
  },
  frameInnerLarge: {
    width: "100%",
  },
  frameChild1Large: {
    width: "80%",
  },
  rectangleGroupLarge: {
    marginTop: 17,
    width:"100%"
  },
  rectangleParentLarge: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    // flexWrap: "wrap",
    paddingVertical:20,
    alignContent:"center",
  },
  column:{
    flexDirection:"column",
    flexWrap:"wrap",
  },
  stateParent:{
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  stateIcon:{
    width: 94,
    height: 94,
  },
  stateLabelInactive:{
    fontSize: 17,
    letterSpacing: 0,
    lineHeight: 22,
    fontWeight: "500",
    fontFamily: "NotoSansDevanagari-Medium",
    color: "#a3a9be",
    textAlign: "center",
    marginTop: 10,
  },
  stateLabelActive:{
    fontSize: 17,
    letterSpacing: 0,
    lineHeight: 22,
    fontWeight: "500",
    fontFamily: "NotoSansDevanagari-Medium",
    color: "#000",
    textAlign: "center",
    marginTop: 10,
  }

});

export {
  FEATUREDSTORYANDLIST,
  VERTICALLISTUNORDERED,
  HORIZONTALIMAGELIST,
  AstrologySection,
  OpinionSection,
  HEADLINESSECTION,
  BREAKINGNEWS,
  TAG,
  CATEGORYSELECTION,
  INTERESTSELECTION,
  STORY,
  DOBSELECTION,
  LOCATIONSELECTION,
  TagsSection,
  PHOTOCOLLECTION,
  VIDEOCOLLECTION,
  VIDEOSTORY,
  PHOTOSTORY,
  WEBSTORIES,
  WEBSTORY,
  WEBSTORIESVERTICAL
}