// auth/AmplifyAuthProvider.js
import { useNavigation, NavigationContainer, StackActionHelpers, DefaultTheme } from '@react-navigation/native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DataStore, Auth, Predicates, SortDirection } from 'aws-amplify'; // Import Auth module
import AuthenticatedApp from '../components/AuthenticatedApp';
import UnAuthenticatedApp from '../components/UnAuthenticatedApp';
import AuthContext from '../components/AuthContext';
import Splash from '../components/Splash';


export function CustomAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [appToLoad, setAppToLoad] = useState('splash');
    const [loggedIn,setLoggedIn] = useState(false)
 
    useEffect(() => {
        Auth.currentAuthenticatedUser()
            .then((user) => {
                console.log('CustomAuthProvider user', user);
                setUser(user);
                setAppToLoad('authenticated');
            })
            .catch((error) => {
                setUser(null);
                setAppToLoad('unauthenticated');               
            });
    }, []);
    

    const renderChildComponent = () => {
        switch (appToLoad) {
          case 'authenticated':
            return (
                <NavigationContainer theme={MyTheme}>
                    <AuthenticatedApp user={user}/>
                </NavigationContainer>
            );
          case 'unauthenticated':
            return <UnAuthenticatedApp />;
          case 'spash':
            return <Splash />;
        }
    };

    async function signIn(username, password) {
        try {            
          await Auth.signIn(username, password);
          const user = await Auth.currentAuthenticatedUser();
          setUser(user);
        } catch (error) {
          console.error('Error signing in:', error);
        }
        // Auth.verifyCurrentUserAttribute('phone_number')
        //     .then((result) => {
        //         // Handle verification code sent successfully
        //         console.log('Verification code sent:', result);
        //     })
        //     .catch((error) => {
        //         // Handle verification code sending failure
        //         console.error('Error sending verification code:', error);
        //     });
    }

    async function updateUser(user) {
        try{
            console.log(user)
            setUser(user)
        } catch(error) {
            if(error) throw error
        }
    }

    async function signOut() {
        try {
            await DataStore.clear()
            await Auth.signOut();
            setUser(null);
            setAppToLoad('unauthenticated')
            setLoggedIn(false)
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    return (
        <AuthContext.Provider value={{ user, updateUser, isLoading, signIn, signOut, loggedIn, setLoggedIn }}>
						{/* {user ? <AuthenticatedApp user={user}/> : <UnAuthenticatedApp />} */}
                        {/* {children} */}
                        {renderChildComponent()}
        </AuthContext.Provider>
    );
}

const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: '#fff'
        },
    };