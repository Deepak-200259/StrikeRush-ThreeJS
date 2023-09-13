import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
} from "three";
import Experience from "../../Experience";
import { COLLISION_BODIES, OBJECTS_PARTS } from "../../Utils/Constants";
import { getPhysicsBody } from "../../Utils/PhycisBodyHelper";
import { ShapeType } from "three-to-cannon";

export default class MidRamp {
  constructor(
    position = { x: 0, y: 0, z: 0 },
    rampMaterial = COLLISION_BODIES.CENTERRAMP
  ) {
    this.experience = new Experience();
    const { scene, physicsWorld, resources } = this.experience;
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.resources = resources;
    this.position = position;
    this.rampMaterial = rampMaterial;
    this.objects = OBJECTS_PARTS;
    this.midRamp = this.objects.RAMPS.CENTER_RAMP;
    this.setMeshAndBody();
  }

  setMeshAndBody() {
    // MESH
    const geometry = new BufferGeometry();
    const material = new MeshBasicMaterial({});
    const midRampGeometryArray = new Float32Array([...this.midRamp.position]);
    this.midRampMesh = this.constructModel(
      geometry,
      material,
      midRampGeometryArray
    );
    this.midRampMesh.material.color = new Color(0xbbbb00);
    this.midRampMesh.position.set(
      this.position.x,
      this.position.y + 1,
      this.position.z
    );
    this.scene.add(this.midRampMesh);

    // BODY
    this.midRampBody = this.createRigidBody(this.midRampMesh);
    this.physicsWorld.addBody(this.midRampBody);
    this.midRampBody.position.copy(this.midRampMesh.position);
  }

  constructModel(geometry, material, positionsArray) {
    const bufferAttribute = new BufferAttribute(positionsArray, 3);
    const meshGeometry = geometry.clone();
    meshGeometry.setAttribute("position", bufferAttribute);
    const mesh = new Mesh(meshGeometry, material.clone());
    mesh.scale.set(0.015, 0.03, 0.013);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  createRigidBody(mesh) {
    return getPhysicsBody(mesh, ShapeType.HULL, this.rampMaterial);
  }
}
