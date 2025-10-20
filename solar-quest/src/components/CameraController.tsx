import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetData } from "./PlanetScene1";

const defaultCameraPosition = new THREE.Vector3(0, 20, 40);
const defaultLookAt = new THREE.Vector3(0, 0, 0);

export default function CameraController({
  selectedPlanet,
}: {
  selectedPlanet: PlanetData | null;
}) {
  const { camera, scene } = useThree();

  useEffect(() => {
    if (selectedPlanet) {
      // Try to find the planet's 3D object in the scene and use its position;
      // fall back to a zero vector if the object isn't available yet.
      const planetObject = scene.getObjectByName(selectedPlanet.name) as
        | THREE.Object3D
        | undefined;
      const targetPosition = planetObject
        ? planetObject.position.clone()
        : new THREE.Vector3();
      camera.position.set(
        targetPosition.x,
        targetPosition.y + 10,
        targetPosition.z + 50
      );
      camera.lookAt(planetObject ? planetObject.position : defaultLookAt);
    } else {
      // Reset to default overview when no planet is selected
      camera.position.copy(defaultCameraPosition);
      camera.lookAt(defaultLookAt);
    }
  }, [selectedPlanet, camera, scene]);

  useFrame(() => {
    let targetPosition: THREE.Vector3;
    let lookAtPosition: THREE.Vector3;

    if (selectedPlanet) {
      // Find the 3D object of the selected planet in the scene
      const planetObject = scene.getObjectByName(selectedPlanet.name);

      if (planetObject) {
        // Calculate target camera position: behind and above the planet
        const offset = new THREE.Vector3(
          0,
          selectedPlanet.radius * 1.5,
          selectedPlanet.radius * 4
        );
        targetPosition = planetObject.position.clone().add(offset);
        lookAtPosition = planetObject.position;
      } else {
        // Fallback if the object is not found yet
        targetPosition = defaultCameraPosition;
        lookAtPosition = defaultLookAt;
      }
    } else {
      // If no planet is selected, return to the default overview position
      targetPosition = defaultCameraPosition;
      lookAtPosition = defaultLookAt;
    }

    // Smoothly interpolate camera position (lerp)
    if (camera.position.distanceTo(targetPosition) > 0.01) {
      camera.position.lerp(targetPosition, 0.05);
    }

    // Smoothly interpolate the point the camera is looking at
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt).add(camera.position); // Get current lookAt point
    const newLookAt = currentLookAt.lerp(lookAtPosition, 0.05);
    camera.lookAt(newLookAt);
  });

  return null;
}
