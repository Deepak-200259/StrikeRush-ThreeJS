import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Vector3,
} from "three";
import Experience from "../../Experience";
import { OBJECTS_PARTS } from "../../Utils/Constants";
import { getPhysicsBody } from "../../Utils/PhycisBodyHelper";
import { ShapeType } from "three-to-cannon";

export default class BowlingPinObstacle {
  constructor(
    position = { x: 0, y: 0, z: 0 },
    numberOfPins = 1,
    obstacleMaterial
  ) {
    this.experience = new Experience();
    const { scene, physicsWorld } = this.experience;
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.totalPinsRows = numberOfPins;
    this.positionOfPins = position;
    this.obstacleMaterial = obstacleMaterial;
    this.bowlPinMeshes = [];
    this.bowlPinBodies = [];
    this.bowlPin = OBJECTS_PARTS.OBSTACLE.BOWLINGPIN;
    this.setMeshAndBody();
  }

  setMeshAndBody() {
    // MESH
    const geometry = new BufferGeometry();
    const material = new MeshBasicMaterial({});
    const bowlPinGeometryArray = new Float32Array([...this.bowlPin.position]);
    let n = this.totalPinsRows;
    let gap = this.totalPinsRows;
    for (let i = 1; i <= n; i++) {
      for (let j = 0; j < i; j++) {
        const startingGap = -j * 0.5;
        const position = new Vector3(
          this.positionOfPins.x + i,
          this.positionOfPins.y,
          this.positionOfPins.z + j + 0.5
        );
        const bowlPin = this.constructModel(
          geometry,
          material,
          bowlPinGeometryArray
        );
        bowlPin.position.set(
          startingGap + position.x - gap,
          position.y,
          position.z
        );
        bowlPin.material.color = new Color(0x999900);
        this.scene.add(bowlPin);
        this.bowlPinMeshes.push(bowlPin);
        //BODY
        const bowlPinBody = this.createRigidBody(bowlPin);
        this.physicsWorld.addBody(bowlPinBody);
        bowlPinBody.position.copy(bowlPin.position);
        bowlPinBody.quaternion.copy(bowlPin.quaternion);

        this.bowlPinBodies.push(bowlPinBody);
      }
    }
  }

  constructModel(geometry, material, positionsArray) {
    const bufferAttribute = new BufferAttribute(positionsArray, 3);
    const meshGeometry = geometry.clone();
    meshGeometry.setAttribute("position", bufferAttribute);
    const mesh = new Mesh(meshGeometry, material.clone());
    mesh.scale.set(0.015, 0.015, 0.015);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  createRigidBody(mesh) {
    return getPhysicsBody(mesh, ShapeType.BOX, this.obstacleMaterial, 0.4);
  }

  update() {
    for (let i = 0; i < this.bowlPinMeshes.length; i++) {
      this.bowlPinMeshes[i].position.copy(this.bowlPinBodies[i].position);
      this.bowlPinMeshes[i].quaternion.copy(this.bowlPinBodies[i].quaternion);
    }
  }
}
