2 options: (second option is more favourable)

first: to go back either use, navigation.navigate,, for that we need to add onboarding screens to stack

second: or when user clicks on back button, get previous screen id and provide it to onboarding genie

before selecting anything:
userPreferences is an array of single object.. has dob and location
userSections and Interests is empty
OnBoardingStatus.slug category-selection

after selecting categories:
userSections has length of 5
userPreferences is an array of single object.. has dob and location
Interests is empty
OnBoardingStatus.slug interest-selection

after selecting interests:
userSections has length of 5
userPreferences is an array of single object.. has dob and location
Interests has length of 5
checkOnboarding OnBoardingStatus.slug dob-selection

after selecting dob:
userSections has length of 5
userPreferences is an array of single object.. has dob value and location value (after getting location automatically in next step)
Interests has length of 5
checkOnboarding OnBoardingStatus.slug dob-selection


