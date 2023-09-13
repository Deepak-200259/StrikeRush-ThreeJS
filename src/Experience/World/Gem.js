import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
} from "three";
import Experience from "../Experience";
import { COLLISION_BODIES, OBJECTS_PARTS } from "../Utils/Constants";
import { getPhysicsBody } from "../Utils/PhycisBodyHelper";
import { ShapeType } from "three-to-cannon";
import { Material } from "cannon-es";

export default class Gem {
  constructor(
    position = { x: 0, y: 0, z: 0 },
    gemMaterial = new Material(COLLISION_BODIES.GEM),
    totalGems
  ) {
    this.experience = new Experience();
    const { scene, physicsWorld, resources } = this.experience;
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.resources = resources;
    this.gemMaterial = gemMaterial;
    this.position = position;
    this.totalGems = totalGems;
    this.gemsMeshes = [];
    this.gemsBodies = [];
    this.gem = OBJECTS_PARTS.COLLECTIBLES.GEM;
    this.setMeshAnBody();
  }

  setMeshAnBody() {
    // MESH
    const geometry = new BufferGeometry();
    const material = new MeshBasicMaterial({ color: 0x6668ff });
    const gemGeometryArray = new Float32Array([...this.gem.position]);
    for (let i = 0; i < this.totalGems; i++) {
      for (let j = 0; j < this.totalGems; j++) {
        const gemMesh = this.constructModel(
          geometry,
          material,
          gemGeometryArray
        );
        gemMesh.position.set(
          this.position.x + i * 2,
          this.position.y,
          this.position.z + j * 3.5
        );
        this.scene.add(gemMesh);
        this.gemsMeshes.push(gemMesh);
        const gemBody = this.createRigidBody(gemMesh);
        gemBody.collisionResponse = false;
        this.physicsWorld.addBody(gemBody);
        gemBody.position.copy(gemMesh.position);
        this.gemsBodies.push(gemBody);
      }
    }
  }

  constructModel(geometry, material, positionsArray) {
    const bufferAttribute = new BufferAttribute(positionsArray, 3);
    const meshGeometry = geometry.clone();
    meshGeometry.setAttribute("position", bufferAttribute);
    const mesh = new Mesh(meshGeometry, material.clone());
    mesh.scale.set(0.008, 0.008, 0.008);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  createRigidBody(mesh) {
    return getPhysicsBody(mesh, ShapeType.BOX, this.gemMaterial);
  }

  update() {
    for (let i = 0; i < this.gemsMeshes.length; i++) {
      this.gemsMeshes[i].position.copy(this.gemsBodies[i].position);
      this.gemsMeshes[i].quaternion.copy(this.gemsBodies[i].quaternion);
    }
  }
}
