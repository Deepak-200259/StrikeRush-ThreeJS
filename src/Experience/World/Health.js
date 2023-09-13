import { Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from "three";
import Experience from "../Experience";
import { Material } from "cannon-es";
import { COLLISION_BODIES } from "../Utils/Constants";
import { getPhysicsBody } from "../Utils/PhycisBodyHelper";
import { ShapeType } from "three-to-cannon";

export default class Health {
  constructor(
    position = new Vector3(0, 0, 0),
    healthCount = 1,
    healthMaterial = new Material(COLLISION_BODIES.HEALTH)
  ) {
    this.experience = new Experience();
    const { scene, physicsWorld, resources } = this.experience;
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.resources = resources;
    this.position = position;
    this.healthCount = healthCount;
    this.healthMaterial = healthMaterial;
    this.ballMeshes = [];
    this.ballBodies = [];
    this.createHealthBlock();
  }

  createHealthBlock() {
    const radius = 0.5;
    const geometry = new SphereGeometry(radius, 32, 32);
    const material = new MeshStandardMaterial({
      color: 0x0065ff,
      roughness: 1,
      map: this.resources.items.PlayerBall,
    });
    for (let i = 0; i < this.healthCount; i++) {
      for (let j = 0; j < this.healthCount; j++) {
        const ballMesh = new Mesh(geometry, material);
        ballMesh.position.set(
          this.position.x - i * radius * 2,
          0.7,
          this.position.z + j * radius * 2
        );
        this.scene.add(ballMesh);
        this.ballMeshes.push(ballMesh);

        const ballBody = getPhysicsBody(
          ballMesh,
          ShapeType.BOX,
          this.healthMaterial,
          0
        );
        ballBody.collisionResponse = false;
        this.physicsWorld.addBody(ballBody);
        ballBody.myData = {
          score: this.healthCount / this.healthCount,
          scoreBlock: this.healthMaterial,
        };
        this.ballBodies.push(ballBody);
      }
    }
  }

  update() {
    for (let i = 0; i < this.ballMeshes.length; i++) {
      this.ballMeshes[i].position.copy(this.ballBodies[i].position);
      this.ballMeshes[i].quaternion.copy(this.ballBodies[i].quaternion);
    }
  }
}
