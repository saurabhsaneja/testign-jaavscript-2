const CATEGORYSELECTION = ({ navigation, route, initiallyHideNextButton, gotoNextOnboardScreen }) => {
  const [screen, setScreen] = useState([]);
  const [objects, setObjects] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [buttonStatus, setButtonStatus] = useState(false);
  const { updateOnBoardingStatus, screens, adminSections, user, selectedUserSectionObjects, updateSelectedUserSectionObjects } = useContext(onBoardingContext)
  const [formStatus, setFormStatus] = useState('आगे बढिये')
  const [iconMap, setIconMap] = useState([])
  const [hideNextButton, setHideNextButton] = useState(initiallyHideNextButton === 'yes')
  // console.log("CategorySelction")

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
    if (selectedUserSectionObjects.includes(objectId)) {
      const newSelectedObjects = selectedUserSectionObjects.filter((id) => objectId !== id)
      updateSelectedUserSectionObjects(newSelectedObjects);
      // console.log(newSelectedObjects)
    } else {
      updateSelectedUserSectionObjects([...selectedUserSectionObjects, objectId]);
    }
  };
  // Function to save or delete selected objects
  const saveObjects = async () => {
    setButtonClicked(true);
    setFormStatus(<ActivityIndicator color='#000'  size="small"/>)
    gotoNextOnboardScreen()
  };

  const shouldShowNextButton = () => {
    if(!hideNextButton){
      return true
    } else if(selectedUserSectionObjects?.length < 5){
      return false
    } else if (selectedUserSectionObjects?.length >= 5) {
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
        <CategoryItem object={item} onClick={toggleSelection} selectedObjects={selectedUserSectionObjects} index={index}></CategoryItem>
      </View>

    )
  };
  const inputChangeHandler = () => {
    if (selectedUserSectionObjects.length < 5 && buttonClicked) {
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