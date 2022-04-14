import React, { FC, MutableRefObject, useState, useEffect } from 'react';
import { ApolloClient, ApolloProvider, HttpLink, NormalizedCacheObject, useApolloClient } from '@apollo/client';

import { cache } from '../cache'
import { AppTabs } from './AppTabs'

import { AppContext, UserInfo } from "./AppContext"

import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { Spin } from "antd";

export interface ServiceData {
  appAddress: string
  initApolloClient: MutableRefObject<boolean>
}

export const AppProvider: FC<ServiceData> = ({ appAddress, initApolloClient }) => {

  const [keycloak, setKeycloak] = useState<KeycloakInstance>(Keycloak('/keycloak.json'))
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [userInfo, setUserInfo] = useState<UserInfo>()

  const initClient = () => {

    return new ApolloClient({
      cache: cache,
      uri: process.env.NODE_ENV === 'production' ? appAddress : '/graphql',
      headers: {
        "Authorization": "Bearer " + keycloak.token 
      }
    })
  }

  var apolloClient: ApolloClient<NormalizedCacheObject> | undefined

  if (initApolloClient.current) {

    if (authenticated) {

      apolloClient = initClient()

      if (!userInfo) {
        keycloak.loadUserInfo().then(value => {
          setUserInfo(value as UserInfo)
        })
      }

      if (userInfo) {
        initApolloClient.current = false
        return (
          <AppContext.Provider value={{ keycloak: keycloak, userInfo: userInfo }}>
            <ApolloProvider client={apolloClient!}>
              <AppTabs />
            </ApolloProvider>
          </AppContext.Provider>
        )
      }
    } else {
      keycloak.init({ onLoad: 'login-required' }).then(auth => {
        setKeycloak(keycloak)
        setAuthenticated(auth)
      })
    }

    return (
      <Spin style={{
        margin: 0,
        position: "absolute",
        top: "45%",
        left: "45%"
      }} tip="...Authentication process..." size={"large"} />
    )

  }

  return <p>Please enter authorization data...</p>



}