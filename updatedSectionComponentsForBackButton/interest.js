const INTERESTSELECTION = ({ navigation, route, initiallyHideNextButton, gotoNextOnboardScreen }) => {
  const [objects, setObjects] = useState([]);
  const [formStatus, setFormStatus] = useState('आगे बढिये')
  const { updateOnBoardingStatus, screens, adminSections, user, selectedInterestsObjects, updateSelectedInterestsObjects } = useContext(onBoardingContext)
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
    });

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
    if (selectedInterestsObjects.includes(objectId)) {
      const newSelectedObjects = selectedInterestsObjects.filter((id) => objectId !== id)
      updateSelectedInterestsObjects(newSelectedObjects);
      // console.log(newSelectedObjects)
    } else {
      updateSelectedInterestsObjects([...selectedInterestsObjects, objectId]);
    }
  };
  // Function to save or delete selected objects
  const saveObjects = async () => {
    setButtonClicked(true);
    setFormStatus(<ActivityIndicator color='#000' size="small"/>)
    gotoNextOnboardScreen()
  };
  const shouldShowNextButton = () => {
    if(!hideNextButton){
      return true
    } else if(selectedInterestsObjects?.length < 5){
      return false
    } else if (selectedInterestsObjects?.length >= 5) {
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
        <InterestItem object={item} onClick={toggleSelection} selectedObjects={selectedInterestsObjects} index={index}></InterestItem>
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