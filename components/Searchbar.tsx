import { Image, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import search from '@/app/(tabs)/search'
import { icons } from '@/constants/icons'

interface Props{
  placeholder: string;
  onPress: () => void;

}

const SearchBar = ({placeholder, onPress}) => {
  return (
    <View style={styles.searchBarContainer}>
     <Image source={icons.search} resizeMode="contain" tintColor="#ab8bff"></Image>
     <TextInput 
     style={styles.searchPlaceholder}
     onPress={onPress}
     placeholder={placeholder}
     value=''
     onChangeText={()=>{}}
     ></TextInput>
    </View>
  )
}

export default SearchBar

const styles = StyleSheet.create({
 searchBarContainer: {
  flex: 1,
  flexDirection: "row",
  alignItems: "flex-start",

  backgroundColor: "#1F2937", // example dark color
  borderRadius: 9999,        // rounded-full equivalent
  paddingHorizontal: 10,
  paddingVertical: 8,
},
searchPlaceholder: {
  color: '#fff',
  fontSize: 16,
  gap: 8,
  marginLeft: 8,
  paddingHorizontal: 15,
}

})