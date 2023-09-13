import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
} from "three";
import Experience from "../../Experience";
import { OBJECTS_PARTS } from "../../Utils/Constants";
import { Bounce, gsap } from "gsap";
import { getPhysicsBody } from "../../Utils/PhycisBodyHelper";
import { ShapeType } from "three-to-cannon";
import { Color } from "three";

export default class HammerObstacle {
  constructor(position = { x: 0, y: 0, z: 0 }, obstacleMaterial) {
    this.experience = new Experience();
    const { scene, physicsWorld, resources } = this.experience;
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.resources = resources;
    this.position = position;
    this.obstacleMaterial = obstacleMaterial;
    this.hammerObj = OBJECTS_PARTS.HAMMER;
    this.hammer = this.hammerObj.HAMMER;
    this.hammerHandle = this.hammerObj.HAMMER_HANDLE;
    this.setMeshAndBody();
    this.startAnimation();
  }

  setMeshAndBody() {
    // MESH
    const geometry = new BufferGeometry();
    const material = new MeshBasicMaterial({
      map: this.resources.items.HammerObstacleTexture,
    });
    const hammerGeometryArray = new Float32Array([...this.hammer.position]);
    const hammerHandleGeometryArray = new Float32Array([
      ...this.hammerHandle.position,
    ]);
    const hammerGeometryUVArray = new Float32Array([...this.hammer.uv]);
    const hammerHandleGeometryUVArray = new Float32Array([
      ...this.hammerHandle.uv,
    ]);
    this.hammerMesh = this.constructModel(
      geometry,
      material,
      hammerGeometryArray,
      hammerGeometryUVArray
    );
    this.hammerMesh.material.color = new Color(0xff0000);
    this.hammerHandleMesh = this.constructModel(
      geometry,
      material,
      hammerHandleGeometryArray,
      hammerHandleGeometryUVArray
    );
    this.hammerHandleMesh.material.color = new Color(0x000000);
    this.hammerMesh.position.set(
      this.position.x,
      this.position.y + 1,
      this.position.z
    );
    this.hammerHandleMesh.position.set(
      this.position.x,
      this.position.y - 2,
      this.position.z
    );
    this.scene.add(this.hammerMesh, this.hammerHandleMesh);

    // BODY
    this.hammerBody = this.createRigidBody(this.hammerMesh);
    this.hammerHandleBody = this.createRigidBody(this.hammerHandleMesh);
    this.physicsWorld.addBody(this.hammerBody);
    this.physicsWorld.addBody(this.hammerHandleBody);
    this.hammerBody.position.copy(this.hammerMesh.position);
    this.hammerHandleBody.position.copy(this.hammerHandleMesh.position);
  }

  constructModel(geometry, material, positionsArray, uvArray) {
    const bufferPositionAttribute = new Float32BufferAttribute(
      positionsArray,
      3
    );
    // const bufferUVAttribute = new Float32BufferAttribute(uvArray, 3);
    // console.log(bufferUVAttribute);

    const meshGeometry = geometry.clone();
    meshGeometry.setAttribute("position", bufferPositionAttribute);
    // meshGeometry.setAttribute("uv", bufferUVAttribute);
    const mesh = new Mesh(meshGeometry, material.clone());
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.normalizeNormals();
    mesh.scale.set(0.01, 0.01, 0.01);
    return mesh;
  }

  startAnimation() {
    const animation = gsap.timeline();
    animation
      .to(this.hammerMesh.rotation, {
        duration: 0.4,
        z: (Math.PI / 180) * 120,
      })
      .to(this.hammerMesh.rotation, {
        duration: 0.7,
        z: 0,
        ease: Bounce.easeOut,
      })
      .repeatDelay(0.5)
      .repeat(-1);
  }

  createRigidBody(mesh) {
    return getPhysicsBody(mesh, ShapeType.BOX, this.obstacleMaterial);
  }

  update() {
    this.hammerBody.quaternion.copy(this.hammerMesh.quaternion);
    this.hammerHandleBody.quaternion.copy(this.hammerHandleMesh.quaternion);
  }
}
