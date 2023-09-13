import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { gsap } from "gsap";
import Experience from "../../Experience";
import { COLLISION_BODIES, OBJECTS_PARTS } from "../../Utils/Constants";
import { getPhysicsBody } from "../../Utils/PhycisBodyHelper";
import { ShapeType } from "three-to-cannon";

export default class GrinderObstacle {
  constructor(
    position = { x: 0, y: 0, z: 0 },
    obstacleMaterial = COLLISION_BODIES.OBSTACLE
  ) {
    this.experience = new Experience();
    const { scene, physicsWorld, resources } = this.experience;
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.resources = resources;
    this.obstacleMaterial = obstacleMaterial;
    this.grinderObj = OBJECTS_PARTS.GRINDER;
    this.grinder = this.grinderObj.GRINDER;
    this.grinderHandle = this.grinderObj.GRINDER_HANDLE;
    this.objectsToUpdate = [];
    this.position = position;
    this.setBodyAndMesh();
  }

  setBodyAndMesh() {
    //MESH
    const geometry = new BufferGeometry();
    const material = new MeshBasicMaterial({
      // map: this.resources.items.SpinnerObstacleTexture,
    });
    const grinderGeometryArray = new Float32Array([...this.grinder.position]);
    const grinderHandleGeometryArray = new Float32Array([
      ...this.grinderHandle.position,
    ]);
    // const grinderGeometryUVArray = new Float32Array([...this.grinder.uv]);
    // const grinderHandleGeometryUVArray = new Float32Array([
    //   ...this.grinderHandle.uv,
    // ]);
    this.grinderMesh = this.constructModel(
      geometry,
      material,
      grinderGeometryArray
      // grinderGeometryUVArray
    );
    this.grinderMesh.material.color = new Color(0xff0000);
    this.grinderHandleMesh = this.constructModel(
      geometry,
      material,
      grinderHandleGeometryArray
      // grinderHandleGeometryUVArray
    );
    this.grinderHandleMesh.material.color = new Color(0x000000);
    this.objectsToUpdate.push(this.grinderMesh);
    this.scene.add(this.grinderMesh, this.grinderHandleMesh);
    this.grinderMesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );
    this.grinderHandleMesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );

    //BODY
    this.grinderBody = this.createRigidBody(this.grinderMesh);
    this.grinderHandleBody = this.createRigidBody(this.grinderHandleMesh);
    this.physicsWorld.addBody(this.grinderBody);
    this.physicsWorld.addBody(this.grinderHandleBody);

    this.startAnimation();
  }

  constructModel(geometry, material, positionsArray) {
    const positionBufferAttribute = new BufferAttribute(positionsArray, 3);
    // const uvBufferAttribute = new BufferAttribute(uvArray, 3);
    const meshGeometry = geometry.clone();
    meshGeometry.setAttribute("position", positionBufferAttribute);
    // meshGeometry.setAttribute("uv", uvBufferAttribute);
    const mesh = new Mesh(meshGeometry, material.clone());
    mesh.scale.set(0.01, 0.01, 0.01);
    return mesh;
  }

  startAnimation() {
    const animation = gsap.timeline();
    animation
      .to(this.objectsToUpdate[0].rotation, {
        duration: 0.09,
        y: this.objectsToUpdate[0].rotation.y - (Math.PI / 180) * 30,
      })
      .to(this.objectsToUpdate[0].rotation, {
        duration: 0.09,
        y: this.objectsToUpdate[0].rotation.y - (Math.PI / 180) * 60,
      })
      .to(this.objectsToUpdate[0].rotation, {
        duration: 0.09,
        y: this.objectsToUpdate[0].rotation.y - (Math.PI / 180) * 90,
      })
      .repeat(-1);
  }

  createRigidBody(mesh) {
    return getPhysicsBody(mesh, ShapeType.BOX, this.obstacleMaterial);
  }

  update() {
    this.grinderBody.quaternion.copy(this.grinderMesh.quaternion);
    this.grinderHandleBody.quaternion.copy(this.grinderHandleMesh.quaternion);
  }
}
