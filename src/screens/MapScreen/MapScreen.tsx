import * as React from 'react'
import { Platform, StatusBar, KeyboardAvoidingView } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import { useAuth } from '../../hooks/auth'

import * as Location from 'expo-location'
import { useEffect, useRef, useState } from 'react'
import { credentials } from '../../utils/credentials'
import MapViewDirections from 'react-native-maps-directions'
import { images } from '../../utils/searchAssets'
import { RFValue } from 'react-native-responsive-fontsize'
import { Coordinator } from '../../navigation/coordinator/coordinator'
import { Search } from './Search'
import theme from '../../global/theme'
import {
  CardRun,
  CardTitle,
  ContainerCardTitle,
  DescriptionText,
  ImageDog,
  PaymentIconButton,
  PriceButton,
  PriceButtonDescription,
  PriceText,
  ProfileButton,
  ProfilePicture,
  ResumeRideContainer,
  StyledContainer,
  TitleResumeRide,
} from './styles'

export const MapScreen: React.FC<any> = ({ navigation }) => {
  const mapEl = useRef()
  const [origin, setOrigin] = useState()
  const [errorMsg, setErrorMsg] = useState()
  const [destination, setDestination] = useState()
  const [distance, setDistance] = useState()
  const [price, setPrice] = useState(0)

  const { user } = useAuth()

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      })
    })()
    const resetDestination = navigation.addListener('focus', () => {
      setDistance(null)
      return resetDestination
    })
  }, [])

  const setRouteInDestinationLocale = (result: any) => {
    const priceValue = result.distance * 3
    setDistance(result.distance)
    setPrice(priceValue)
    setTimeout(
      () =>
        mapEl?.current.fitToCoordinates(result?.coordinates, {
          edgePadding: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        }),
      100
    )
  }

  const setDestinationGoogleInput = (data: any, details: any) => {
    setDestination({
      latitude: details?.geometry.location.lat,
      longitude: details?.geometry.location.lng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      title: data?.structured_formatting.main_text,
    })
  }

  return (
    <>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />
      <StyledContainer>
        <MapView
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          region={origin}
          showsUserLocation
          ref={mapEl}>
          {destination && (
            <>
              <MapViewDirections
                apikey={credentials.googleApi}
                destination={destination}
                origin={origin}
                strokeWidth={3}
                onReady={setRouteInDestinationLocale}
              />
              <Marker
                coordinate={destination}
                anchor={{ x: 0, y: 0 }}
                image={images.marker}
              />
            </>
          )}
          {Platform.OS === 'ios' && (
            <ProfileButton onPress={Coordinator.goToProfileScreen}>
              <ProfilePicture source={{ uri: user.photo }} />
            </ProfileButton>
          )}
        </MapView>
        <CardRun behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ContainerCardTitle>
            <CardTitle>{`Boa tarde, ${user.name}`}</CardTitle>
          </ContainerCardTitle>
          <Search handleSetDestination={setDestinationGoogleInput} />

          {distance && (
            <ResumeRideContainer>
              <TitleResumeRide>Popular</TitleResumeRide>
              <DescriptionText>{`A distancia da viagem e de ${distance
                .toFixed(2)
                .replace('.', ',')} km`}</DescriptionText>
              <ImageDog resizeMode="contain" source={images.dogCarImage} />
              <PriceText>{`R$: ${price
                .toFixed(2)
                .replace('.', ',')}`}</PriceText>
              <PriceButton
                onPress={() =>
                  Coordinator.goToCheckoutScreen({
                    price: price.toFixed(2),
                    address: destination?.title,
                  })
                }>
                <PriceButtonDescription>
                  SOLICIAR CORRIDA
                </PriceButtonDescription>
              </PriceButton>
            </ResumeRideContainer>
          )}
        </CardRun>
      </StyledContainer>
    </>
  )
}