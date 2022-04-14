import {KeycloakInstance} from 'keycloak-js';
import React, {useContext} from 'react'

export interface AppUserInfo {
    id: string
    name: string
}

export interface UserInfo {
    sub: string
    name: string
    preferred_username: string
    given_name: string
    family_name: string
    email: string
    app?: AppUserInfo
}

export interface AppContextStruct {
    keycloak: KeycloakInstance,
    userInfo?: UserInfo
}

export const AppContext = React.createContext<Partial<AppContextStruct>>({})

export const useAppContext = () => {
    return useContext(AppContext)
}