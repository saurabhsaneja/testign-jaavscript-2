const DOBSELECTION = ({ navigation, meta, gotoNextOnboardScreen }) => {
  const [formStatus, setFormStatus] = useState('आगे बढिये')
  const { updateOnBoardingStatus, user, userPreferences, selectedDate, updateSelectedDate } = useContext(onBoardingContext)
  const saveDOB = async () => {
    gotoNextOnboardScreen()
  }

  const formattedDateTime = (date) => {
    const dateParts = date.split("/");
    const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;  
    return formattedDate;
  }

  const onDateSelected = (date) => {
    // setShowCalendar(!showCalendar);
    updateSelectedDate(date);
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
        updateSelectedDate(formattedDateTime(date))
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