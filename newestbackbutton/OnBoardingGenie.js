import { Auth, DataStore } from 'aws-amplify'; // Import Auth module
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
// import { SQLiteAdapter } from '@aws-amplify/datastore-storage-adapter/SQLiteAdapter';
import { gql } from '@apollo/client';
import * as SectionComponents from './SectionComponents'; // Import all section components
import client from '../graphql/client';
import { SectionType } from '../models';
import { useContext } from "react";
import onBoardingContext from './OnBoardingContext';

// [TBD] for further optimisation
// DataStore.configure({
//     storageAdapter: SQLiteAdapter
// });


const sectionComponentMap = {
	CATEGORYSELECTION: SectionComponents.CATEGORYSELECTION,
	INTERESTSELECTION: SectionComponents.INTERESTSELECTION,
	DOBSELECTION: SectionComponents.DOBSELECTION,
	LOCATIONSELECTION: SectionComponents.LOCATIONSELECTION,
};


const OnBoardingGenie = ({ route, navigation,  }) => {
	const [screenID, setScreenID] = useState(route?.params?.screen);
	const {  screens,adminSections, getOnboardingScreenIDs, fetchUserSections, homeScreenID } = useContext(onBoardingContext)
	console.log("OnBoarding Genie has been invoked..",route?.params?.screen)
	// const { updateOnBoardingStatus, adminSections, user } = useContext(onBoardingContext)
	const [filteredSections,setFilteredSections] = useState([])

	useEffect(async () => {
		// console.log(adminSections,route?.params?.screen)
		async function filterSections() {
			try {				
				
				const filteredSections = adminSections.filter((section) => (
					section.screenID === route?.params?.screen && 
					section.sectionType === SectionType.ONBOARDING 
					))
				// console.log(screens.find(screen => screen.id === "549e9a10-4f9b-4e1b-b90e-b64b175afc48"))
				// console.log(adminSections.length)

				setFilteredSections(filteredSections)
				console.log('setFilteredSections', filteredSections);
			} catch (error) {
				console.error('OnBoardingGenie:', error);
			}			
		}
		filterSections();
	}, [screenID]);

	const getNextOnboardingScreenId = () => {
		const onboardingScreenIDs = getOnboardingScreenIDs();
		const currentOnboardingScreenIndex = onboardingScreenIDs.indexOf(route?.params?.screen)
		return onboardingScreenIDs[currentOnboardingScreenIndex + 1]
		
	}
	const render = ({ item, index }) => {
		let gotoNextOnboardScreen = null
		const nextOnboardingScreenId = getNextOnboardingScreenId()
		gotoNextOnboardScreen = (params = {}) => navigation.navigate(nextOnboardingScreenId, params)
		console.log('nextOnboardingScreenId', nextOnboardingScreenId);
		const SectionComponent = sectionComponentMap[item.viewComponent];
		// console.log('SectionComponent', SectionComponent);
		if (SectionComponent && item.visible) {
				return <SectionComponent meta={item} gotoNextOnboardScreen={gotoNextOnboardScreen} initiallyHideNextButton={'yes'} navigation={navigation} selectedUserSectionObjects={route?.params?.selectedUserSectionObjects} userSectionObjects={route?.params?.userSectionObjects} selectedInterestObjects={route?.params?.selectedInterestObjects} interestObjects={route?.params?.interestObjects} selectedDate={route?.params?.selectedDate}/>;
		} else {
			return null; // Return a default component or nothing for unknown sections
		}
	};
	return (
				<View >
					<FlatList
						data={filteredSections}
						keyExtractor={(item) => item.id}
						renderItem={render}
						initialNumToRender={10}
					/>
				</View>
			)
};

export default OnBoardingGenie;
