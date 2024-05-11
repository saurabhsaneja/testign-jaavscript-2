import { useEffect, useState ,useCallback, useContext} from 'react';
import React from 'react';
import {
    View, Text, fontSizes, useColorScheme, ImageBackground,
    StyleSheet,
    Alert,
    Image,
    AppState
} from 'react-native';
import {
    SafeAreaProvider
} from 'react-native-safe-area-context';
import { NavigationContainer, StackActionHelpers, DefaultTheme, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NavHeader from './NavHeader';
import Article from './Article';
import Footer from './Footer';
import ImgSlideshow from '../screens/PhotoShow';
import VideoShow from '../screens/VideoShow';
import LiveBlog from '../screens/LiveBlog';
import Horoscope from '../screens/Horoscope';
import HoroscopeScroll from './HoroscopeScroll';
import Section from '../screens/Section';
import MeriKhabarScreen from '../screens/MeriKhabar';
import { gql } from '@apollo/client';
import client from '../graphql/client';
import { DataStore, Auth, syncExpression, Predicates, SortDirection } from 'aws-amplify'; // Import Auth module
import { SQLiteAdapter } from '@aws-amplify/datastore-storage-adapter/SQLiteAdapter';
import { AdminSection, Interest, MasterInterest, Screen, TagsList,ScreenType, Section as SectionModel, UserPreferences, MenuItem } from '../models';
import ScreenGenie from '../screens/ScreenGenie';
import { Images } from './Assets';
import { I18n } from 'aws-amplify';
import initContext from "./InitContext"
import onBoardingContext from './OnBoardingContext';
import Splash from './Splash';
import { createDrawerNavigator } from '@react-navigation/drawer';
import useDataStore from '../helpers/store'
import 'core-js/full/symbol/async-iterator';

const getDrawerIcon = (slug) => {
    // Remove '-menu' from the slug if it exists
    const formattedSlug = slug.replace('-menu', '');
    // Check if the formatted slug exists in the Images object, return the corresponding icon
    return Images[formattedSlug] || Images['default']; // If no matching icon is found, return null or a default icon
};


I18n.setLanguage('hi');
I18n.putVocabularies({
    hi: {
        'Sign In': '',
        'Sign Up': '',
    },
});
import { Button } from 'react-native';

Amplify.configure(awsExports);


import { Amplify, Hub, Logger } from "@aws-amplify/core";
import {
    Authenticator,
    defaultDarkModeOverride,
    ThemeProvider, useAuthenticator
} from '@aws-amplify/ui-react-native';
import awsExports from '../aws-exports';
import OnBoardingSections from '../screens/OnBoardingSections';
import OnBoardingGenie from './OnBoardingGenie';
import { SectionType } from '../models';
import PatrikaQueries from '../graphql/patrika-queries';
import AuthContext from './AuthContext';
import ScreenGenieLoadMore from '../screens/ScreenGenieLoadMore';
import CustomDrawer from './CustomDrawer';
Amplify.configure(awsExports);


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();


const AuthenticatedApp = (props) => {
    // Auth.signOut()
    // const [user, setUser] = useState(user)
    const [appState, setAppState] = useState(AppState.currentState);
    const [initialRoute, setInitialRoute] = useState('home')
    const [initialState, setInitialState] = useState({
        adminSections: [],
        userSections: [],
        screens: [],
        userPreferences: [],
        sections: [],
        interests: [],
        OnBoardingStatus: { OnBoarded: false, slug: null },
        isLoading: true,
        screenID: null,
        menuItems: [],
        multimedia: {},
    })
    const { user, updateUser, isLoading, signIn, signOut } = useContext(AuthContext);
    const [tag, setTag] = useState(null)
	const [tagResults, setTagResults] = useState({});//[TBD] this is a hack, need to be fixed
    const { batchDataUpdate,batchInitialise, fetchDataSuccess, fetchDataFailure } = useDataStore();
    // const {dataFetchList} = useDataStore(state => state)
    const dataFetchList = useDataStore.getState().dataFetchList
    const [initialised, setInitialised] = useState(false)
    const [isOnBoardingCompleted, setIsOnBoardingCompleted] = useState(false)
    const [selectedUserSectionObjects, setSelectedUserSectionObjects] = useState([]);
    const [selectedInterestsObjects, setSelectedInterestsObjects] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null)
    useEffect(() => {
        // console.log("Data Fetch List", dataFetchList)
        if (initialState.isLoading && dataFetchList.length !== 0 && initialState.screens?.length > 0) {            
            if (dataFetchList.every(item => item?.loading === false)) {
                console.log("All data fetched", dataFetchList)
                setInitialState({ ...initialState, isLoading: false })
            }
        }        
    }, [dataFetchList])
    useEffect(() => {
        //initialising datastore
        if (user) {
            //initialising datastore
            DataStore.configure({
                storageAdapter: SQLiteAdapter,
                errorHandler: (error) => {
                    console.warn("Unrecoverable error", { error });
                },
                maxRecordsToSync: 30000,
                syncExpressions: [
                    syncExpression(SectionModel, () => {
                        return section => section.userID.eq(user?.attributes?.sub || user?.signInUserSession?.idToken?.payload?.sub);
                    }),
                    syncExpression(UserPreferences, () => {
                        return userPreferences => userPreferences.cognitoId.eq(user?.attributes?.sub || user?.signInUserSession?.idToken?.payload?.sub);
                    }),
                    syncExpression(Interest, () => {
                        return interest => interest.userID.eq(user?.attributes?.sub || user?.signInUserSession?.idToken?.payload?.sub);
                    }),
                ]
                // fullSyncInterval: 60,    
            });

        }
    }, [user])

    // const [storiesByCategory, setStoriesByCategory] = useState({})

    const changeSync = useCallback(async  () => {
        try {
            await DataStore.stop();
            await DataStore.start();
        } catch (error) {
            console.log(error)
        }
    },[]);

    

    const fetchTagList = async () => {
        try {
            const _tagsList = await DataStore.query(TagsList)
            return _tagsList
        } catch (error) { console.log({ error }) }
    }

    const fetchStory = async () => {
        try {
            // const sectionData = dataFetchList.find(item => item.slug === )
        } catch (error) { console.log({ error }) }
    }


    

    const fetchMenuItems = async () => {
        try {
            const sortDirection = {
                sort: (s) => s.sortPriority(SortDirection.ASCENDING)
            }
            const menuFilter = (s) => (s.visible.eq(true));
            let menuItems = await DataStore.query(MenuItem, menuFilter, sortDirection);
            menuItems = await resolvePromises(menuItems)
            console.log('menuItems', menuItems);
            // const reorderedMenuItems = menuItems.sort(
            //     (a, b) => a.sortPriority - b.sortPriority
            // );
            return (menuItems)
            // console.log(screens.filter(item => item.type === ScreenType.DISTRICT))
            // }
        } catch (error) {
            console.log("Error:", error)
        }
    }

    const fetchUserSections = async () => {
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
    const fetchUserPreferences = async () => {
        try {
            const userFilter = (s) => (s.cognitoId.eq(user?.attributes?.sub || user?.signInUserSession?.idToken?.payload?.sub));
            const userPreferences = await DataStore.query(UserPreferences, userFilter);
            // console.log({userPreferences})
            return (userPreferences)
        } catch (error) {
            console.log("Error:", error)
        }
    }
    const fetchInterests = async () => {
        try {
            if (user) {
                const interestsFilter = (s) => (s.userID.eq(user?.attributes?.sub || user?.signInUserSession?.idToken?.payload?.sub));
                const interests = await DataStore.query(Interest, interestsFilter);
                return (interests)
            }
        } catch (error) {
            console.log("getInterests:", error)
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

    const fetchScreens = async () => {
        try {
            const sortDirection = {
                sort: (s) => s.sortPriority(SortDirection.ASCENDING)
            }
            // if (!screens.length) {
            // const screenFilter = (s) => (s.type.eq(ScreenType.DISTRICT));
            // const screens = await DataStore.query(Screen, screenFilter, sortDirection);
            let screens = await DataStore.query(Screen);
            return (screens)
            // console.log(screens.filter(item => item.type === ScreenType.DISTRICT))
            // }
        } catch (error) {
            console.log("Error:", error)
        }
    }


    const getScreenID = async (screens, slug) => {
        const screen = screens.find(item => item.slug === slug)
        if (screen) {
            return screen.id
        } else {
            return null
        }

    }

    const checkOnBoardingStatus = async (userSections, interests, userPreferences) => {
        console.log("Onboarding check started:")  
        let OnBoardingStatus = {}
        try {

            userSections.length < 5 ?
                OnBoardingStatus = { OnBoarded: false, slug: "category-selection" } :
                interests.length < 5 ?
                    OnBoardingStatus = { OnBoarded: false, slug: "interest-selection" } :
                    !userPreferences[0].dob ?
                        OnBoardingStatus = { OnBoarded: false, slug: "dob-selection" } :
                        !userPreferences[0].locationID ?
                            OnBoardingStatus = { OnBoarded: false, slug: "location-selection" } :
                            OnBoardingStatus = { OnBoarded: true, slug: 'home' }
        } catch (error) {
            console.log("Onboarding check error", error);
        }
        console.log('return OnBoardingStatus', OnBoardingStatus);
        return OnBoardingStatus
    };



    const configureDataRequestsForAllSections = async (userSections, adminSections) => {
        try {
            // console.log(adminSections.forEach((element => console.log(element))))
            const sections = [...userSections, ...adminSections].sort(
                (a, b) => b.sortPriority - a.sortPriority
            );
            const slugFest = ['storiesByCategory']
            if (sections.length !== 0) {
                sections.filter(section =>
                    section.sectionType !== SectionType.STORY
                ).forEach(section => { 
                    if(section) slugFest.push(section.slug)
                    // console.log("Creating data request for", section.slug,section.screenID)
                });
            }
            if(dataFetchList?.length === 0){
                batchInitialise(slugFest)
            }
            // check if batchInitialise wasn't completed (that is some slugs are missing in dataFetchList; add those slugs to dataFetchList)
            else if(dataFetchList?.length < slugFest?.length){
                const missingSlugs = findMissingSlugs(slugFest, dataFetchList)
                batchInitialise(missingSlugs)
            }
            return sections
        } catch (error) { console.log(error) }
        // console.log("This is crazy",sections)
    }

    const updateOnBoardingStatus = () => {
        setInitialState({
            adminSections: [],
            userSections: [],
            screens: [],
            userPreferences: [],
            sections: [],
            interests: [],
            OnBoardingStatus: { OnBoarded: false, slug: null },
            isLoading: true,
            screenID: null,
            menuItems: [],
            multimedia: {},    
        })
        console.log("Init called in updateOnBoardingStatus")
        init()
    };
    const getOnboardingScreenIDs = () => {
        const onBoardingSlugs = [
            "category-selection",
            "interest-selection",
            "dob-selection",
            "location-selection"
        ]
        console.log('initialState.screens', initialState.screens);
        if(initialState.screens?.length > 0){
            return onBoardingSlugs?.map(slug => initialState.screens.find(item => item.slug === slug))?.map(screen => screen.id)
        }else {
            return []
        }
    } 
    const OnBoardingScreens = () => {
        const screenIDs = getOnboardingScreenIDs()
        console.log('screenIDs', screenIDs);
        
        const OnBoardingStack = createNativeStackNavigator();
        const screenOptions = {headerShown: false,};
        return (
            <OnBoardingStack.Navigator
                screenOptions={screenOptions}
                initialRouteName={screenIDs[0]}>
                    {screenIDs
                    ?.map((item, index) => {
                            return (
                        <OnBoardingStack.Screen 
                            name={item}
                            component={OnBoardingGenie}
                            key={item}
                            initialParams={{ screen: item }} />
                        )
                        }
                )}
            </OnBoardingStack.Navigator>
        )
    }

    const init = async () => {
        try {
            console.log({initialised})
            if (!initialised) {
                console.log("Initialising...")
                const interests = await fetchInterests()
                const userSections = await fetchUserSections()
                console.log('userSections', userSections);
                const userPreferences = await fetchUserPreferences()
                const screens = await fetchScreens()
                const OnBoardingStatus = await checkOnBoardingStatus(userSections, interests, userPreferences)   
                const adminSections = await fetchAdminSections()
                const screenID = await getScreenID(screens, OnBoardingStatus.slug)
                console.log('OnBoardingStatus.OnBoarded', OnBoardingStatus.OnBoarded);
                // if(!OnBoardingStatus.OnBoarded){
                if(!OnBoardingStatus.OnBoarded){
                    console.log("Onboarding not completed",OnBoardingStatus.slug)
                    setInitialState({ ...initialState, isLoading: false,OnBoardingStatus,screens,user,screenID,adminSections,userPreferences})
                } else {
                    const sections = await configureDataRequestsForAllSections(userSections, adminSections)
                    const isLoading = true
        
                    // if (storyCategories.length !== 0) {
                    //     const storiesByCategory = await fetchStoriesByCategories(storyCategories)
                    //     setStoriesByCategory(storiesByCategory)
                    // }
                    const multimedia = await fetchMultimedia()
                    const menuItems = await fetchMenuItems()
                    setInitialState({ isLoading, interests, userSections, screens, adminSections, userPreferences, sections, OnBoardingStatus, screenID, menuItems, multimedia })
                    // console.log({isLoading, interests, userSections, screens, adminSections, userPreferences, sections,storiesByCategory, OnBoardingStatus, screenID, menuItems ,multimedia })
                    setInitialised(true)                
    
                }
                console.log("Finished Initialising...")                
            }
            // setIsLoading(false)
        } catch (error) {
            console.log("Init:", error)
        }
    }
    useEffect(() => {
        changeSync()
        // Create listener that will stop observing the model once the sync process is done
        const removeListeners = []
        removeListeners.push(
            Hub.listen("datastore", async (data) => {
                if (data?.payload?.event === 'syncQueriesReady') {
                    console.log("Init called in syncQueriesReady")
                    init()
                }

            })
        )
        removeListeners.push(
            Hub.listen("auth", async (data) => {
                const logger = new Logger('My-Logger');
                logger.info('auth event', data);
                if (data.payload.event === 'signOut') {
                    await DataStore.clear();
                }
            })
        )

        return () => {
            removeListeners.forEach((item) => {
                item()
            });
        };
    }, [])

    useEffect(() => {
        if (initialised) {
            setInitialState({ ...initialState, isLoading: false })
            // if(dataFetchList?.length !== 0 && initialState.isLoading && dataFetchList.every(item => item?.loading === false)) {
            //     setInitialState({ ...initialState, isLoading: false })
            // }
            // //Load all data
            // else if (dataFetchList?.length !== 0) {
            //     dataFetchList.forEach(section => {
            //         if(section && section?.loading) {
            //             fetchDataAsync(section.slug)
            //         }
            //     });
            // } else {
            //     console.log("No data to fetch")
            // }
        }
    }, [initialised])

    // useEffect(() => {
    //     console.log("I am launching again...")
    // },[])

    useEffect(() => {
        // Subscribe to the AppState changes
        const handleAppStateChange = (nextAppState) => {
            if (appState === 'background' && nextAppState === 'active') {
                // App was brought to the foreground; refresh data
                // updateOnBoardingStatus()
                console.log("App brought to foreground")
            }
            setAppState(nextAppState);
        };
        
        return ()=>{AppState.addEventListener('change', handleAppStateChange)}
    }, [appState]);

    const DrawerScreens = () => {
        const MyStack = createNativeStackNavigator();
        const screenOptions = {headerShown: false,};
        let itemsWithSubMenuItems = [] 
        let items = [...initialState?.menuItems?.filter(item => item?.visible === true)]
        itemsWithSubMenuItems.push(...items)
        items?.filter(item => item?.submenuitems?.length > 0)?.filter(item => item?.visible === true).map(el => itemsWithSubMenuItems.push(el))
        itemsWithSubMenuItems = getUniqueObjectsByKey(itemsWithSubMenuItems, 'prettyName')
        return (
            <MyStack.Navigator
                screenOptions={screenOptions}
                initialRouteName={'home'}>
                    {itemsWithSubMenuItems?.map(item => {
                            return (
                        <MyStack.Screen 
                            name={item?.menuItemScreenId}
                            component={RelatedScreen}
                            key={item?.id}
                            initialParams={{ screenID: item?.menuItemScreenId, prettyName: item?.prettyName, slug: item?.slug }} />
                        )
                        })
                }
                
            </MyStack.Navigator>
        )
    }

    const RelatedScreen = useCallback((data) => {
        const currentRoute = useRoute();
        console.log("RelatedScreen currentRoute: ", currentRoute.name);
        console.log('RelatedScreen data', data);
        const slug = getSlug(initialState.menuItems, data?.route?.name);
        console.log('RelatedScreen slug', slug);
        return (
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen
                    name={getSlug(initialState.menuItems, data?.route?.name)}
                    component={TabScreen}
                    initialParams={{ screenID: currentRoute.name, prettyName: data?.route?.params?.prettyName, slug: data?.route?.params?.slug }}
                />
                {initialState.screens
                    // .filter(item => item.slug === 'tag')
                    .map((item, index) => {
                        return <Stack.Screen
                            name={item.type === ScreenType.STORY ? item.slug : item.id}
                            component={ScreenGenie}
                            key={item.id}
                            initialParams={{ screenID: item.id, name: item?.name, slug: item?.slug }} />
                    }
                    )}

                {/* {initialState.screens
                    .filter(item => item.type === ScreenType.STORY)
                    .map((item, index) => {
                        return <Stack.Screen
                            name={item.slug}
                            component={ScreenGenie}
                            key={item.id}
                            initialParams={{ screenID: item.id }} />
                    }
                    )} */}

            </Stack.Navigator>)
    })

    const HomeScreen = useCallback(() => {

        return (
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen
                    name="Home Screen"
                    component={TabScreen}
                />
                {initialState.screens
                    // .filter(item => item.slug === 'tag')
                    .map((item, index) => {
                        return <Stack.Screen
                            name={item.type === ScreenType.STORY ? item.slug : item.id}
                            component={ScreenGenie}
                            key={item.id}
                            initialParams={{ screenID: item.id }} />
                    }
                    )}

                {/* {initialState.screens
                    .filter(item => item.type === ScreenType.STORY)
                    .map((item, index) => {
                        return <Stack.Screen
                            name={item.slug}
                            component={ScreenGenie}
                            key={item.id}
                            initialParams={{ screenID: item.id }} />
                    }
                    )} */}

            </Stack.Navigator>)
    })

    const TabScreen = (data) => {
        const [screenID, setScreenID] = useState(null)
        const [homeSlug, setHomeSlug] = useState("home")
        useEffect(() => {
            console.log('initialState.screens', initialState.screens);
            const screenID = initialState.screens.find(id => id.slug === homeSlug)
            setScreenID(screenID)
        }, [])

        const initialParams = {}
        if(data?.route?.name === 'home Screen'){
            initialParams.relatedScreenName = 'home'
        }else {
            initialParams.relatedScreenname = 'not-home'
        }

        return (<Tab.Navigator
            initialRouteName={homeSlug}
            tabBar={props => <Footer {...props} />}
            screenOptions={{ headerShown: false }}

        >
            {initialState.screens
                .filter(item => item.type === ScreenType.DISTRICT)
                .map((item, index) =>
                    <Tab.Screen
                        name={item.slug}
                        component={ScreenGenie}
                        options={{ tabBarLabel: item.prettyName }}
                        key={item.id}
                        initialParams={{ ...initialParams, 
                            screenID: index === 0 ? data?.route.params.screenID : item.id, 
                            prettyName: index === 0 ? data?.route.params.prettyName : item.prettyName, 
                            slug: index === 0 ? data?.route.params.slug : item.slug,
                            multimedia: initialState.multimedia

                        }}
                    />
                )
            }
        </Tab.Navigator>)

    }

    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: '#fff'
        },
    };

    const renderCustomDrawer = ({navigation}) => (
        <CustomDrawer navigation={navigation} menuItems={initialState.menuItems} />
    );

    return (<NavigationContainer theme={MyTheme}>
        {initialState?.isLoading ? (<Splash></Splash>) :
            initialState?.OnBoardingStatus?.OnBoarded ?
                (<SafeAreaProvider>
                    <initContext.Provider value={{
                        screens: initialState.screens,
                        sections: initialState.sections,
                        // storiesByCategory: storiesByCategory,
                        multimedia: initialState.multimedia,
                        user,
                    }} >
                        
                            <Drawer.Navigator
                                initialRouteName={initialRoute}
                                drawerContent={renderCustomDrawer}
                                screenOptions={{
                                    header: ({ scene, previous, navigation }) => <NavHeader openDrawer={() => navigation.openDrawer()} navigateHome={() => navigation.navigate('home')} />,
                                    drawerStyle: { backgroundColor: '#fff', width: '70%'},
                                    drawerActiveBackgroundColor: '#f5f5f5',
                                    drawerActiveTintColor: '#000',
                                    drawerInactiveTintColor: '#a3a3a3',
                                    drawerLabelStyle: { fontSize: 20, fontFamily: 'NotoSansDevanagari-SemiBold' },
                                    swipeEnabled: false, // Disable swipe gesture
                                    headerShown: false, // this will hide global drawer header on screens
                                }}
                            >
                                <Drawer.Screen
                                    name={'DrawerScreens'}
                                    options={{
                                        swipeEnabled: false,
                                      }}
                                    component={DrawerScreens}
                                />
                            </Drawer.Navigator>
                        </initContext.Provider>
                </SafeAreaProvider>)
                :
                (
                    <SafeAreaProvider>
                        <onBoardingContext.Provider value={{
                            updateOnBoardingStatus,
                            OnBoardingStatus: initialState.OnBoardingStatus,
                            adminSections: initialState.adminSections,
                            screens: initialState.screens,
                            userPreferences: initialState.userPreferences,
                            user,
                            getOnboardingScreenIDs,
                            setIsOnBoardingCompleted,
                            fetchUserSections,
                            fetchInterests,
                            fetchUserPreferences,
                        }} >
                            {initialState.adminSections && <View style={{flex: 1, backgroundColor:'white'}} >
                                {/* <OnBoardingGenie screen={initialState.screenID} key={initialState.screenID} user={user}></OnBoardingGenie> */}
                                <OnBoardingScreens />
                            </View>}
                        </onBoardingContext.Provider>
                    </SafeAreaProvider>
                )
        }
    </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    image1Icon: {
        width: 126,
        height: 30,
    },

});

export default AuthenticatedApp;

async function resolvePromises(data) {
    // Map over each item in the array
    const resolvedData = await Promise.all(data.map(async (item) => {
        // Await the resolution of the 'Screen' promise
        const screen = await item.Screen;
        
        // Await the resolution of the 'submenuitems' promise and map over its values
        let values = await Promise.all((await item.submenuitems.values).map(async (val) => {
            // Await the resolution of each promise in the submenuitems
            let subMenuItem = await val.subMenuItem;
            return { subMenuItem };
        }));
        values = values.map(val => {
            // return { subMenuItem: {...val.subMenuItem, menuItemScreenId : val.subMenuItem.subMenuItemScreenId} }
            return {...val.subMenuItem, menuItemScreenId : val.subMenuItem.subMenuItemScreenId}
        })
        // Return the resolved item with updated values
        return {
            ...item,
            Screen: screen,
            submenuitems: values
        };
    }));

    return resolvedData;
}

const getSlug = (data, name) => {
    const slug = data?.find(el => el.menuItemScreenId === name)?.slug
    console.log('getSlug', slug);
    // return slug?.replace(/-/g, "")
    return slug?.replace(/-/g, " ") + ' Screen'
}

function getUniqueObjectsByKey(arr, key) {
    const uniqueKeys = {};
    return arr.filter(obj => {
        if (!uniqueKeys[obj[key]]) {
            uniqueKeys[obj[key]] = true;
            return true;
        }
        return false;
    });
}
function findMissingSlugs(slugFest, dataFetchList) {
    const missingSlugs = [];
    const dataFetchSlugs = dataFetchList.map(item => item.slug);

    for (const slug of slugFest) {
        if (!dataFetchSlugs.includes(slug)) {
            missingSlugs.push(slug);
        }
    }

    return missingSlugs;
}

