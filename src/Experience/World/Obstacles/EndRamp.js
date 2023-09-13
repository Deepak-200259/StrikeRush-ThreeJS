import { Body, Box, Material, Shape, Vec3 } from "cannon-es";
import Experience from "../../Experience";
import { COLLISION_BODIES, OBJECTS_PARTS } from "../../Utils/Constants";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { getPhysicsBody } from "../../Utils/PhycisBodyHelper";
import { ShapeType } from "three-to-cannon";

export default class EndRamp {
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
    this.endRamp = this.objects.RAMPS.END_RAMP;
    this.setMeshAndBody();
    this.setJumperBody();
  }

  setMeshAndBody() {
    // MESH
    const geometry = new BufferGeometry();
    const material = new MeshBasicMaterial({});
    const rampGeometryArray = new Float32Array([...this.endRamp.position]);
    this.rampMesh = this.constructModel(geometry, material, rampGeometryArray);
    this.rampMesh.material.color = new Color(0xbbbb00);
    this.rampMesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );
    this.scene.add(this.rampMesh);

    // BODY
    this.rampBody = this.createRigidBody(this.rampMesh);
    this.physicsWorld.addBody(this.rampBody);
    this.rampBody.position.copy(this.rampMesh.position);
  }

  constructModel(geometry, material, positionsArray) {
    const bufferAttribute = new BufferAttribute(positionsArray, 3);
    const meshGeometry = geometry.clone();
    meshGeometry.setAttribute("position", bufferAttribute);
    const mesh = new Mesh(meshGeometry, material.clone());
    mesh.scale.set(0.05, 0.035, 0.05);
    mesh.rotation.y = Math.PI;
    return mesh;
  }

  createRigidBody(mesh) {
    return getPhysicsBody(mesh, ShapeType.HULL, COLLISION_BODIES.CENTERRAMP);
  }

  setJumperBody() {
    const jumperShape = new Box(new Vec3(5, 4, 10));
    const jumper = new Body({
      shape: jumperShape,
      material: this.rampMaterial,
      mass: 0,
    });
    jumper.position.copy(this.position);
    jumper.position.z = jumper.position.z - 12;
    this.physicsWorld.addBody(jumper);
  }
}
