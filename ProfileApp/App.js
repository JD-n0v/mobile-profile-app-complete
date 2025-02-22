import {
  Text,
  SafeAreaView,
  StyleSheet,
  Platform,
  StatusBar,
  View,
  Image,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

function CustomButton({ text, boxStyle, textStyle, handleEvent }) {
  return (
    <Pressable style={boxStyle} onPress={handleEvent}>
      <Text style={textStyle}>{text}</Text>
    </Pressable>
  );
}

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [imgModalVisible, setImgModalVisible] = useState(false);
  const [pfp, setPfp] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userInfo, setUserInfo] = useState({
    first_name: "",
    last_name: "",
    DOB: "",
    nationality: "",
    bio: "",
  });
  const [newName, setNewName] = useState(null);
  const [newLastName, setNewLastName] = useState(null);
  const [newNationality, setNewNationality] = useState(null);
  const [newDob, setNewDob] = useState(null);
  const [newBio, setNewBio] = useState(null);

  const getUser = async () => {
    try {
      const userValue = await AsyncStorage.getItem("@user");
      const user = JSON.parse(userValue);
      if (user != null) {
        setNewName(user.first_name);
        setNewLastName(user.last_name);
        setNewDob(user.DOB);
        setNewNationality(user.nationality);
        setNewBio(user.bio);
        setUserInfo(user);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getPfp = async () => {
    try {
      const pfpValue = await AsyncStorage.getItem("@pfp");
      setPfp(pfpValue);
    } catch (e) {
      console.log(e);
    }
  };
  const saveUserChanges = async () => {
    const newUser = {
      first_name: newName,
      last_name: newLastName,
      DOB: newDob,
      nationality: newNationality,
      bio: newBio,
    };

    await AsyncStorage.setItem("@user", JSON.stringify(newUser));
    setUserInfo(newUser);
  };

  const uploadImage = async (mode) => {
    let result = {};
    try {
      if (mode === "gallery") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 1,
          aspect: [1, 1],
        });
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front,
          allowsEditing: true,
          quality: 1,
          aspect: [1, 1],
        });
      }

      if (!result.canceled) {
        await saveImage(result.assets[0].uri);
      }
    } catch (error) {
      alert(error);
      setImgModalVisible(!imgModalVisible);
    }
  };

  const saveImage = async (image) => {
    try {
      await AsyncStorage.setItem("@pfp", image);
      setPfp(image);
      setImgModalVisible(!imgModalVisible);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    getUser();
    getPfp();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType={"slide"}
        transparent={true}
        visible={imgModalVisible}
        onRequestClose={() => {
          setImgModalVisible(!imgModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.imgModal}>
            <Text style={styles.imgModalLabel}>Profile Picture</Text>
            <View style={styles.imgModalBtnContainer}>
              <Pressable style={styles.imgModalBtn} onPress={uploadImage}>
                <Image
                  source={require("./assets/photo-camera-interface-symbol-for-button.png")}
                  style={styles.imgModalIcon}
                />
                <Text>Camera</Text>
              </Pressable>
              <Pressable
                style={styles.imgModalBtn}
                onPress={() => uploadImage("gallery")}
              >
                <Image
                  source={require("./assets/gallery.png")}
                  style={styles.imgModalIcon}
                />
                <Text>Gallery</Text>
              </Pressable>
            </View>
            <CustomButton
              boxStyle={styles.cancelBtn}
              handleEvent={() => {
                setImgModalVisible(!imgModalVisible);
              }}
              text={"Cancel"}
            ></CustomButton>
          </View>
        </View>
      </Modal>
      <Modal
        animationType={"slide"}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>First name:</Text>
            <TextInput
              style={styles.input}
              placeholder={"First name"}
              value={newName !== null ? newName : userInfo.first_name}
              onChangeText={setNewName}
            />
            <Text>Last name:</Text>
            <TextInput
              style={styles.input}
              placeholder={"Last name"}
              value={newLastName !== null ? newLastName : userInfo.last_name}
              onChangeText={setNewLastName}
            />
            <Text>Date of birth:</Text>
            {showDatePicker && (
              <DateTimePicker
                mode="date"
                value={new Date()}
                display="spinner"
                maximumDate={new Date()}
                onChange={({ type }, selectedDate) => {
                  if (type === "set") {
                    const currentDate = selectedDate;
                    setNewDob(currentDate);

                    if (Platform.OS === "android") {
                      setShowDatePicker(!showDatePicker);
                      setNewDob(currentDate.toLocaleDateString());
                    }
                  } else {
                    setShowDatePicker(!showDatePicker);
                  }
                }}
                style={styles.datePicker}
              />
            )}
            {showDatePicker && Platform.OS === "ios" && (
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
              >
                <Pressable
                  style={styles.datePickerBtn}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                >
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.datePickerBtn}
                  onPress={() => {
                    setNewDob(new Date().toDateString());
                    setShowDatePicker(!showDatePicker);
                  }}
                >
                  <Text>Confirm</Text>
                </Pressable>
              </View>
            )}

            {!showDatePicker && (
              <Pressable onPress={() => setShowDatePicker(!showDatePicker)}>
                <TextInput
                  style={styles.input}
                  placeholder={"Date of birth"}
                  value={newDob !== null ? newDob : userInfo.DOB}
                  onChangeText={setNewLastName}
                  editable={false}
                  onPressIn={() => setShowDatePicker(!showDatePicker)}
                />
              </Pressable>
            )}
            <Text>Nationality:</Text>
            <TextInput
              style={styles.input}
              placeholder={"Nationality"}
              value={
                newNationality !== null ? newNationality : userInfo.nationality
              }
              onChangeText={setNewNationality}
            />
            <Text>Bio description:</Text>
            <TextInput
              style={styles.input}
              placeholder={"Bio description"}
              value={newBio !== null ? newBio : userInfo.bio}
              onChangeText={setNewBio}
            />
            <View style={styles.modalBtns}>
              <CustomButton
                text={"Cancel"}
                boxStyle={styles.cancelBtn}
                textStyle={styles.btnText}
                handleEvent={() => {
                  setModalVisible(!modalVisible);
                }}
              ></CustomButton>
              <CustomButton
                text={"Save Changes"}
                boxStyle={styles.saveBtn}
                textStyle={styles.btnText}
                handleEvent={() => {
                  saveUserChanges();
                  setModalVisible(!modalVisible);
                }}
              ></CustomButton>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.profileContainer}>
        <Pressable
          onPress={() => {
            setImgModalVisible(true);
          }}
        >
          <Image
            style={styles.pfpImage}
            source={
              pfp === null ? require("./assets/favicon.png") : { uri: pfp }
            }
          />
        </Pressable>
        <Text style={(styles.profileTxt, styles.nameTxt)}>
          {!userInfo.first_name && !userInfo.last_name
            ? "Sample name"
            : `${userInfo.first_name} ${userInfo.last_name}`}
        </Text>
        <Text style={styles.profileTxt}>
          {" "}
          {!userInfo.DOB ? "00/00/00" : userInfo.DOB}{" "}
        </Text>
        <Text style={styles.profileTxt}>
          {" "}
          {!userInfo.nationality
            ? "Sample Nationality"
            : userInfo.nationality}{" "}
        </Text>
        <Text style={styles.profileTxt}>
          {" "}
          {!userInfo.bio ? "Sample bio" : userInfo.bio}{" "}
        </Text>
        <CustomButton
          text={"Edit Profile"}
          boxStyle={styles.editBtn}
          textStyle={styles.btnText}
          handleEvent={() => {
            setModalVisible(true);
          }}
        ></CustomButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 8,
    alignItems: "center",
    marginTop: Platform.OS === "android" && StatusBar.currentHeight,
  },
  profileContainer: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "lightgray",
    height: "25rem",
    width: "90%",
    marginVertical: 10,
    alignItems: "center",
    padding: 20,
  },
  pfpImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 1,
  },
  profileTxt: {
    margin: 10,
  },
  nameTxt: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  editBtn: {
    backgroundColor: "lightblue",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(60,60,60,0.7)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "left",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  imgModal: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
  },
  imgModalLabel: {
    fontSize: 26,
    fontWeight: "bold",
  },
  imgModalBtnContainer: {
    flexDirection: "row",
  },
  imgModalBtn: {
    marginHorizontal: 10,
    marginVertical: 20,
  },
  imgModalIcon: {
    height: 50,
    width: 50,
  },
  cancelBtn: {
    backgroundColor: "tomato",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    margin: 5,
  },
  saveBtn: {
    backgroundColor: "lightgreen",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    margin: 5,
  },
  modalBtns: {
    flexDirection: "row",
  },
  input: {
    height: 40,
    borderWidth: 1,
    margin: 5,
    width: 300,
  },
  datePicker: {
    height: 100,
    marginTop: -10,
  },
  datePickerBtn: {
    backgroundColor: "lightgrey",
    padding: 10,
    borderRadius: 5,
  },
});
