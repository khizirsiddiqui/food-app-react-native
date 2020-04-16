import React, { Component } from 'react';
import { TextInput, Image, Dimensions, ScrollView, View, Text, StyleSheet, Button, AsyncStorage, Alert } from 'react-native';

import Loader from './loader'

const Device_Width = Dimensions.get('window').width;

export default class App extends Component {
  
  state = {
    loading: true,
    error: false,
    posts: [],
    searchQuery: '',
    headingText: 'Food App',
  }

  constructor(props) {
    super(props);
    this.getDataFromAPI();
  }

  updateSearchQuery = (searchQuery) => {
    this.setState({searchQuery})
  }
  
  searchData = async () => {
    const { searchQuery } = this.state
    if (searchQuery != '') {
      this.setState({loading: true})
      try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + searchQuery)
        const foodItem = await response.json()
        const posts = foodItem.meals;
        this.setState({loading: false, headingText:searchQuery, posts})
      } catch (e) {
        this.setState({loading: false, error: true})
      }
    }
    else {
      Alert.alert("Please Enter a Search Query. :/")
    }
  }

  saveToLibrary = async (post) => {
    try {
      await AsyncStorage.setItem(post.idMeal, JSON.stringify({
        idMeal: post.idMeal,
        strMeal: post.strMeal,
        strMealThumb: post.strMealThumb}));
      Alert.alert(post.strMeal + " saved. :)");
    } catch (e) {
      console.error('Failed to save', e)
    }
  }

  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  loadFromLibary = async () => {
    this.setState({
      posts: [],
      loading: true,
    })
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys != null){
        keys.forEach(elem => {
          if (this.isNumeric(elem)) {
            AsyncStorage.getItem(elem)
            .then(resp => {
              const data = JSON.parse(resp);
              const { posts } = this.state 
              this.setState({
                posts: [...posts, data],
                headingText: "Library",
              })
            })
          }
        })
      }
    } catch (e) {
      console.error('Failed to save', e)
    }
    this.setState({loading: false})
  }

  deleteFromLibrary = (idMeal, strMeal) => {
    AsyncStorage.removeItem(idMeal)
    .then(() => Alert.alert(strMeal + " deleted."))
    .catch((e) => Alert.alert(e))
  }

  getDataFromAPI = async () => {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
      const foodItem = await response.json()
      const posts = foodItem.meals;
      this.setState({loading: false, posts})
    } catch (e) {
      this.setState({loading: false, error: true})
    }
  }


  renderPost = ({idMeal, strMeal, strMealThumb}) => {
    var renderButton = (
      <Button 
        title="Save To Library"
        color='green'
        onPress={() => this.saveToLibrary({idMeal, strMeal, strMealThumb})}
      />
    )
    if (this.state.headingText == 'Library')
      renderButton = (
        <Button 
          title="Delete"
          color='red'
          onPress={() => this.deleteFromLibrary(idMeal, strMeal)}
        />
      )
    if (this.state.posts.length == 0)
        renderButton = null
    return (
      <View
        key={idMeal}
      >
        <View style={styles.center, styles.singlePost}>
          <Image 
            style={styles.postImage}
            source={{ uri: strMealThumb}}
          />
          <Text style={styles.postTitle}>
            {strMeal}
          </Text>
          { renderButton }
        </View>
      </View>
    )
  }

  render() {
    const {posts, headingText, loading} = this.state;
    return (
      <View style={styles.defaultContainer}>
      <View>
        <Loader
          loading={loading}
        />
      </View>
      <View>
        <Text style={styles.heading}>
          { headingText }
        </Text>
      </View>

      <ScrollView
        horizontal = { true } 
        showsHorizontalScrollIndicator = {true}
        pagingEnabled = { true }
        contentContainerStyle = {styles.searchContainer}
      >
        {posts.map(this.renderPost)}
      </ScrollView>
      <View>  
      <TextInput
        style={styles.searchBar}
        placeholder="Type Search Here..."
        onChangeText={(text) => this.updateSearchQuery(text)}
      />
      <Button
        title="Search"
        style={styles.searchButton}
        onPress={() => this.searchData()}
      />
      <Button
        title="Load Saved"
        style={styles.loadButton}
        color='blue'
        onPress={() => this.loadFromLibary()}
      />
      </View>
      </View>
    )
    }
}

const styles = StyleSheet.create({
  defaultContainer: {
    flex: 1
  },
  searchContainer: {
    margin: 10,
  },
  post: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: Device_Width 
  },
  postTitle: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 34,
    letterSpacing: 0.364,
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    padding: 15,
    backgroundColor: 'skyblue',
  },
  postImage: {
    alignContent: 'center',
    width: 420,
    height: 420,
    borderRadius: 15,
  },
  searchBar: {
    height: 40,
    textAlign: 'center',
    borderColor: 'gray',
    borderWidth: 1
  },
  searchView :{
    height: 40,
    marginBottom: 0,
  },
  searchButton: {
    height: 40,
  },
  loadButton: {
    height: 40,
  },
  singlePost: {
    margin: 10,
  },
  heading: {
    marginTop: 40,
    fontSize: 40,
    textAlign: "center",
  }
})
