import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { GLView } from "expo-gl";
import { Renderer, TextureLoader } from "expo-three";
import {
  Scene,
  PerspectiveCamera,
  AmbientLight,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from "three";

const ARmodeScreen = ({ route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [nft, setNft] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();

    if (route.params && route.params.nft) {
      setNft(route.params.nft);
    }
  }, [route.params]);

  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const sceneColor = 0x6ad6f0;

    // Create a WebGLRenderer without a DOM element
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(sceneColor);

    const camera = new PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.set(2, 5, 5);

    const scene = new Scene();
    scene.add(new AmbientLight(0x404040));

    if (nft) {
      const texture = await TextureLoader.load(nft.image);
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ map: texture });
      const cube = new Mesh(geometry, material);
      scene.add(cube);
    }

    // Setup an animation loop
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={Camera.Constants.Type.back}>
        <GLView style={styles.glView} onContextCreate={onContextCreate} />
      </Camera>
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          AR Mode: Viewing {nft ? nft.name : "NFT"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  overlayText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

export default ARmodeScreen;
