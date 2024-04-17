//react components
import React, {
    useState,
    useCallback,
    useEffect,
    useContext,
    useRef,
  } from "react";
  import {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    Text,
    FlatList,
    useWindowDimensions,
    Dimensions,
  } from "react-native";
  import { Images } from "./Assets";
  import AuthContext from "./AuthContext";
  import Animated, {
    Easing,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    useDerivedValue,
    useAnimatedReaction,
    runOnJS,
  } from "react-native-reanimated";
  
  //custom components
  const CustomDrawer = ({ navigation, menuItems }) => {
    const { height } = useWindowDimensions("");
    const { signOut } = useContext(AuthContext);
    //   console.log('CustomDrawer', JSON.stringify(menuItems));
    const [selectedItem, setSelectedItem] = useState(
      menuItems.find((item) => item.visible === true)?.menuItemScreenId
    );
    const [updatedMenuItems, setUpdatedMenuItems] = useState(
      getUpdatedMenuItems(menuItems)
    );
  
    // Create a shared value for the scroll position
    const animatedScrollY = useSharedValue(0);
    const contentHeight = useSharedValue(0);
    const scrollIndicatorHeight = useSharedValue(height * 0.35);
    const scrollViewHeight = useSharedValue(Dimensions.get("window").height);
  
    // Create an animated style for the scroll indicator
    const scrollIndicatorAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: animatedScrollY.value }],
        // transform: [{ translateY: withSpring(animatedScrollY.value, { damping: 10, stiffness: 100 }) }],
      };
    });
    const handleContentSizeChange = (contentWidth, height) => {
      contentHeight.value = height;
    };
    // Observe changes in scroll position to calculate indicator height
    useAnimatedReaction(
      () => animatedScrollY.value,
      (scrollValue) => {
        // const indicatorHeight = calculateScrollIndicatorHeight(scrollValue);
        const screenHeight = scrollViewHeight.value;
        const totalContentHeight = contentHeight.value - screenHeight;
        const visibleHeightRatio = screenHeight / contentHeight.value;
        const indicatorheight = Math.max(screenHeight * visibleHeightRatio, 50); // Ensure a minimum height
        scrollIndicatorHeight.value = Math.min(indicatorheight, screenHeight);
        // Use indicatorHeight as needed, such as updating a shared value for indicator height
      }
    );
    //UI
    return (
      <View style={styles.container}>
        <ScrollView
          style={[styles.mainView, {backgroundColor:'red'}]}
          contentContainerStyle={styles.scrollViewContentContainerStyle}
          // showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            animatedScrollY.value = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            scrollViewHeight.value = height;
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.leftVerticalLine} />
            <View style={styles.menuContainer}>
              {updatedMenuItems
                .filter((item) => item.visible === true)
                .map((item, index) => {
                  return (
                    <DrawerItem
                      // Icon={Images.drawerItemIcon.termIcon}
                      Title={item.prettyName}
                      slug={item.slug}
                      submenuitems={item.submenuitems || null}
                      isSelected={selectedItem === item.menuItemScreenId}
                      isSignOut={item.isSignOut}
                      navigation={navigation}
                      setSelectedItem={setSelectedItem}
                      menuItemScreenId={item.menuItemScreenId}
                      onPress={
                        item.isSignOut
                          ? signOut
                          : () => {
                              setSelectedItem(item.menuItemScreenId);
                              navigation.navigate(item.menuItemScreenId, {
                                name: item.menuItemScreenId,
                                key: item.id,
                                screenID: item.menuItemScreenId,
                              });
                            }
                      }
                    />
                  );
                })}
            </View>
            <Animated.View
              style={[
                styles.scrollIndicatorStyle,
                // { height: height * 0.35 },
                { height: scrollIndicatorHeight },
                scrollIndicatorAnimatedStyle,
              ]}
            />
          </View>
        </ScrollView>
      </View>
    );
  };
  
  export default CustomDrawer;
  // add sign out button to drawer
  const getUpdatedMenuItems = (menuItems) => {
    let updatedItems = [...menuItems?.map((el) => ({ ...el, isSignOut: false }))];
    const signOutItem = {
      _lastChangedAt: 1699082150522,
      _version: 7,
      updatedAt: "2023-11-04T07:15:50.503Z",
      sortPriority: 1,
      visible: true,
      mostVisited: false,
      config: null,
      createdAt: "2023-09-27T18:34:20.918Z",
      _deleted: null,
      prettyName: "Sign Out",
      slug: "sign-out",
      menuItemScreenId: "eeeedeee-eeee-eeee-eeee-eeaeeaeeeeee", //using distinct menuItemScreenId for signOutItem
      id: "c624e1ff-b447-402f-bf73-87720e4711cc",
      isSignOut: true,
    };
    updatedItems.push(signOutItem);
    return updatedItems;
  };
  
  const DrawerItem = ({
    slug,
    submenuitems,
    Title,
    isSelected,
    isSignOut,
    navigation,
    setSelectedItem,
    menuItemScreenId,
    onPress = () => {},
  }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const changeDropdownPosition = () => {
      setIsDropdownOpen((prev) => !prev);
    };
    return (
      // <View style={isSelected ? { backgroundColor: "#f5f5f5" } : null}>
      <View>
        <View style={styles.menuItemContainer}>
          <TouchableOpacity
            style={[
              styles.menuItemView,
              { width: submenuitems?.length > 0 ? "90%" : "100%" },
            ]}
            onPress={onPress}
          >
            <View style={styles.drawerIconView}>
              <Image
                style={{ maxHeight: 20, width: 20 }}
                resizeMode="contain"
                source={
                  isSignOut
                    ? require("../assets/signout-icon.jpeg")
                    : getDrawerIcon(slug)
                }
              />
            </View>
  
            <Text
              style={[
                styles.menuItemText,
                {
                  // color: isSignOut ? "red" : isSelected ? "#000" : "#a3a3a3",
                  color: "#000",
                },
              ]}
              numberOfLines={1}
            >
              {Title}
            </Text>
          </TouchableOpacity>
          {submenuitems?.length > 0 ? (
            <TouchableOpacity
              onPress={changeDropdownPosition}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image
                style={styles.vectorIcon}
                resizeMode="cover"
                source={
                  isDropdownOpen
                    ? require("../assets/chevron-up.png")
                    : require("../assets/chevron-down.png")
                }
              />
            </TouchableOpacity>
          ) : null}
        </View>
        {submenuitems?.length > 0 && isDropdownOpen ? (
          <View style={styles.subMenuContainer}>
            {submenuitems?.map((item, index) => {
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedItem(menuItemScreenId);
                      navigation.navigate(item.menuItemScreenId, {
                        name: item.menuItemScreenId,
                        key: item.id,
                        screenID: item.menuItemScreenId,
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.subMenuItemText,
                        index === submenuitems?.length - 1
                          ? { marginBottom: 0 }
                          : null,
                      ]}
                      numberOfLines={1}
                    >
                      {item.prettyName}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  };
  
  const getDrawerIcon = (slug) => {
    // Remove '-menu' from the slug if it exists
    const formattedSlug = slug.replace("-menu", "");
    // Check if the formatted slug exists in the Images object, return the corresponding icon
    return Images[formattedSlug] || Images["default"]; // If no matching icon is found, return null or a default icon
  };
  
  export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    mainView: {
      // margin: 20,
      paddingVertical: 24,
      paddingHorizontal: 20,
      // backgroundColor: "red",
    },
    scrollViewContentContainerStyle: {
      alignItems: "center",
      paddingBottom: "20%",
    },
    menuContainer: {
      width: "88%",
      marginLeft: 10,
    },
    leftVerticalLine: {
      backgroundColor: "#D4D4D4",
      width: 2,
      height: "100%",
    },
    vectorIcon: {
      height: 26,
      width: 26,
    },
    drawerIconView: {
      backgroundColor: "#ECEDEE",
      borderRadius: 8,
      justifyContent: "center",
      padding: 5,
    },
    menuItemContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      marginVertical: 10,
      // height: 55,
    },
    menuItemView: {
      flexDirection: "row",
      alignItems: "center",
    },
    subMenuItemText: {
      marginHorizontal: 10,
      marginBottom: 15,
      color: "#000",
      fontSize: 16,
      fontFamily: "NotoSansDevanagari-Medium",
    },
    menuItemText: {
      marginLeft: 17,
      marginRight: 10,
      fontSize: 18,
      fontFamily: "NotoSansDevanagari-Medium",
    },
    subMenuContainer: {
      backgroundColor: "#E2E8EF",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 3,
      width: "93%",
      alignSelf: "center",
    },
    scrollIndicatorStyle: {
      position: "absolute",
      right: 0,
      top: 0,
      width: 4,
      // height: 400,
      backgroundColor: "#D4D4D4",
      borderRadius: 4 / 2,
    },
  });
  