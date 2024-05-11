const LOCATIONSELECTION = ({ navigation, meta, stories }) => {
    const [formStatus, setFormStatus] = useState('आगे बढिये')
    const { updateOnBoardingStatus, user, userPreferences, selectedLocation, updateSelectedLocation } = useContext(onBoardingContext)
    useEffect(() => {
      GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      })
        .then((location) => {
          updateSelectedLocation(location);
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
          updateSelectedLocation({ latitude: 0, longitude: 0 })
        });
    }, []);
  
    useEffect(() => {
      if (selectedLocation) saveLocation()
    }, [selectedLocation])
  
    const saveLocation = async () => {
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