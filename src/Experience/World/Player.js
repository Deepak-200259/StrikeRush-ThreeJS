import Experience from "../Experience.js";
import EndGamePopup from "./EndGamePopUp.js";
import { getPhysicsBody } from "../Utils/PhycisBodyHelper.js";
import { ShapeType } from "three-to-cannon";

import { Mesh, MeshStandardMaterial, Group, Color, Skeleton } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { gsap } from "gsap";
import * as THREE from "three";
import { COLLISION_BODIES } from "../Utils/Constants.js";
// import Hand from "./Hand.js";

export default class Player {
  constructor(playerMaterial, options, endWallPositionZ) {
    this.experience = new Experience();
    const { scene, audioManager, resources, time, physicsWorld, camera } =
      this.experience;
    this.scene = scene;
    this.audioManager = audioManager;
    this.resources = resources;
    this.time = time;
    this.physicsWorld = physicsWorld;
    this.camera = camera;
    this.playerMaterial = playerMaterial;
    this.endAnimation = false;
    this.endWallPositionZ = endWallPositionZ;
    // this.PlayerBallModel = this.resources.items.HealthBall;
    // this.playerBallGeometry = this.PlayerBallModel.children[0].geometry;
    // this.PlayerBallModel.children[0].geometry = null;
    // this.PlayerBallModel.children[0].material = null;
    this.gemModel = this.resources.items.GemBall;
    // console.log(this.gemModel.children[0].geometry.attributes.position.array); 
    this.gemCollected = 0;

    this.RigidBodiesArr = [];
    this.bodyMeshesArr = [];
    this.sphereRadius = 0.3;
    this.headBody = null;
    this.isReachedDestination = false; // weather player reached to endblock or not
    // this.playerVelocity = 0;

    this.createPlayer(7);
    this.eventsRegistered = false;
    this.headBody = this.RigidBodiesArr[0];
    // this.playerVelocity = this.headBody.velocity.x;
    this.onClick();
    // this.hand = new Hand();
    this.playerBallCnt = this.createPlayerCntText(
      this.RigidBodiesArr.length.toString()
    );
  }

  createScoreText(score, size, headBodyPosition, positionZ) {
    // Score Popups
    const textGeometry = new TextGeometry(score, {
      font: this.resources.items.scoreFont,
      size: size,
      height: 0.3,
      fontWeight: 200,
    });
    textGeometry.center();
    const textMesh = new Mesh(
      textGeometry,
      new MeshStandardMaterial({ color: 0x000000 })
    );

    textMesh.position.x = this.headBody.position.x;
    textMesh.position.z = headBodyPosition;
    textMesh.position.y = 0;

    this.scene.add(textMesh);
    textMesh.material.transparent = true;
    gsap
      .to(textMesh.position, {
        duration: 0.5,
        y: Math.random() + 5,
        x: Math.random() * (4 - -4) + -4,
        z: headBodyPosition + positionZ,
      })
      .then(() => {
        gsap
          .to(textMesh.material, {
            duration: 0.4,
            opacity: 0,
          })
          .then(() => {
            textGeometry.dispose();
            textMesh.material.dispose();
            this.scene.remove(textMesh);
          });
      });
  }

  createPlayer(noOfBalls) {
    let size = 0.4;
    this.mass = 3; // Ball Mass
    let space = 1 * size;

    // Create Mesh for rigidbodies
    for (let i = 0; i < noOfBalls; i++) {
      let spMsh = this.createBodyMesh();
      const sphereBody = this.addPhysicsToBodyMesh(spMsh);
      sphereBody.name = i;
      sphereBody.position.set(
        0,
        2,
        -((noOfBalls - i) * (size * 2 + 2 * space) + size * 2 + space) + 1
      );

      // Storing the references of body mesh and rigidbodies for future use
      this.bodyMeshesArr.push(spMsh);
      this.RigidBodiesArr.push(sphereBody);

      // add to the world to visulaize the bodies
      this.scene.add(spMsh);
      this.physicsWorld.addBody(sphereBody);
      this.checkCollisionForBody(sphereBody);
    }
  }

  createPlayerCntText(count) {
    let ballCnt = new Group();

    // create text
    let textGeometry = new TextGeometry(count, {
      font: this.resources.items.scoreFont,
      size: 0.6,
      height: 0.6,
    });
    textGeometry.center();
    let textMesh = new Mesh(
      textGeometry,
      new MeshStandardMaterial({ color: 0xffffff })
    );
    textMesh.position.z = 0.4;
    textMesh.position.y = 0.2;
    textMesh.rotation.x = (Math.PI / 180) * -30;
    // crete text base
    this.textBaseMesh = new Mesh(
      new RoundedBoxGeometry(1.1, 1.1, 1, 10, 0.2),
      new MeshStandardMaterial({ color: "#FF10F0" })
    );
    this.textBaseMesh.lookAt(
      this.camera.instance.position.x,
      this.camera.instance.position.y,
      this.camera.instance.position.z
    );
    this.textBaseMesh.position.y = 0.1;

    ballCnt.add(textMesh);
    ballCnt.add(this.textBaseMesh);
    ballCnt.position.y = 2;
    this.scene.add(ballCnt);

    return ballCnt;
  }

  startScreenAnimation(e) {
    gsap
      .to(this.camera.instance.position, { duration: 1, x: 0, y: 15, z: 45 })
      .then(() => {
        this.registerEvents();
      });
  }

  onClick() {
    window.addEventListener("click", (e) => this.startScreenAnimation(e));
  }

  registerEvents() {
    // window.removeEventListener("click", () => this.startScreenAnimation());

    // this.hand.removeModel();
    this.eventsRegistered = true;
    if (this.experience.detectDevice()) {
      window.addEventListener("touchmove", (event) => {
        const mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        if (this.headBody && !this.isReachedDestination) {
          this.headBody.position.x = mouseX * 4;
          this.RigidBodiesArr.forEach((body, index) => {
            if (index > 0) {
              gsap.to(this.RigidBodiesArr[index].position, {
                duration: 0.1,
                x: this.RigidBodiesArr[index - 1].position.x,
              });
            }
          });
        }
      });
    } else {
      window.addEventListener("mousemove", (event) => {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        if (this.headBody && !this.isReachedDestination) {
          this.headBody.position.x = mouseX * 4;
          this.RigidBodiesArr.forEach((body, index) => {
            if (index > 0) {
              gsap.to(this.RigidBodiesArr[index].position, {
                duration: 0.1,
                x: this.RigidBodiesArr[index - 1].position.x,
              });
            }
          });
        }
      });
    }
  }

  checkCollisionForBody(rigidBody) {
    rigidBody.addEventListener("collide", (collide) => {
      const bodyType = collide.body.material.name;

      switch (bodyType) {
        case COLLISION_BODIES.HEALTH: {
          this.audioManager.playAudio(this.resources.items.HealthCollect);
          collide.body.collisionFilterMask = 0; // dont take collision again with already collided body
          collide.body.position.set(200, 200, 200);
          this.addPlayerBalls(collide.body.myData.score);
          this.scene.remove(collide.body.myData.scoreBlock);
          this.physicsWorld.removeBody(collide.body);

          this.createScoreText(
            `+${collide.body.myData.score.toString()}`,
            0.7,
            this.headBody.position.z,
            0
          );
          // Update Ball Text
          this.scene.remove(this.playerBallCnt);
          this.playerBallCnt = this.createPlayerCntText(
            this.RigidBodiesArr.length.toString()
          );
          break;
        }
        case COLLISION_BODIES.GEM: {
          this.audioManager.playAudio(this.resources.items.GemCollect);
          ++this.gemCollected;
          document.getElementById("gemsCollected").textContent =
            this.gemCollected;
          this.createScoreText("+1", 0.7, this.headBody.position.z, 0);
          gsap.to(collide.body.position, { duration: 0.3, y: 7 });
          gsap.to(collide.body.position, {
            delay: 0.3,
            duration: 0.4,
            x: 7,
            y: 17,
            z: collide.body.position.z,
          });

          // this.openPopup()

          break;
        }
        case COLLISION_BODIES.OBSTACLE: {
          // collide.body.collisionFilterMask = 0;
          // collide.body.collisionResponse = false;
          if (this.RigidBodiesArr.length) {
            // gsap.delayedCall(5, this.removePlayerBalls());
            this.removePlayerBalls(); // Subtracting Player's Health by removing the balls
            this.headBody = this.RigidBodiesArr[0];
          } else {
            // this.endGamePopup();
            console.log("*********** Game Stopped ************");
          }

          this.scene.remove(this.playerBallCnt);
          this.playerBallCnt = this.createPlayerCntText(
            this.RigidBodiesArr.length.toString()
          );

          break;
        }
        case COLLISION_BODIES.ENDRAMP: {
          const deltaTime = this.time.delta / 1000;
          this.isReachedDestination = true;
          this.scene.remove(this.playerBallCnt);
          this.endCameraAnimation();
          for (let i = 0; i < this.RigidBodiesArr.length; i++) {
            this.camera.instance.lookAt(
              this.camera.instance.position.x,
              this.camera.instance.position.y,
              this.camera.instance.position.z - 80
            );
            gsap.to(this.camera.instance.rotation, {
              duration: 0.1,
              x: this.camera.instance.rotation.x + (Math.PI / 180) * 5,
              z: 0,
            });
            gsap
              .to(this.RigidBodiesArr[i].velocity, {
                duration: 0.7,
                x: -1 + (0.4 * i) / 2,
                y: 10,
                z: -20 - i * 2,
              })
              .then(() => {
                gsap
                  .to(this.RigidBodiesArr[i].velocity, {
                    duration: 2,
                    x: 0,
                    y: -0.5 * deltaTime,
                    z: 0,
                  })
                  .then(() => {
                    this.RigidBodiesArr[i].angularDamping = 1;
                    this.RigidBodiesArr[i].mass = 0.15;
                  });
              });
          }
          break;
        }
        case COLLISION_BODIES.SCOREBOX: {
          const impact = collide.contact.getImpactVelocityAlongNormal();
          if (impact > 0.7) {
            this.audioManager.playAudio(this.resources.items.Score);
            this.createScoreText(
              collide.body.myData.score,
              1.7,
              this.headBody.position.z,
              6
            );
            for (let i = 0; i < Number(collide.body.myData.score[0]); i++) {
              let gemCollected = this.gemModel.clone().children.shift();
              gemCollected.position.set(
                Math.random() * (6.2 - -6.2) + -6.2,
                collide.body.position.y + 5,
                collide.body.position.z
              );
              this.scene.add(gemCollected);

              const timeline = gsap.timeline();
              timeline
                .to(gemCollected.position, {
                  duration: Math.random(),
                  y: collide.target.position.y + Math.random() * 7,
                })
                .to(gemCollected.scale, {
                  duration: Math.random(),
                  x: 0.02,
                  y: 0.02,
                  z: 0.02,
                }) // Scale in
                .to(gemCollected.scale, {
                  duration: Math.random(),
                  x: 0.015,
                  y: 0.015,
                  z: 0.015,
                }) // Scale out
                .to(gemCollected.position, {
                  duration: Math.random(),
                  x: 9,
                  y: 42.5,
                  z: this.endWallPositionZ,
                })
                .then(() => {
                  ++this.gemCollected;
                  document.getElementById("gemsCollected").textContent =
                    this.gemCollected;
                  gemCollected.material.dispose();
                  gemCollected.geometry.dispose();
                  this.scene.remove(gemCollected);
                });
            } // Gem Animation
          }
          collide.body.position.set(900, 200, 0);
          break;
        }
      }
    });
  }

  openPopup() {
    this.endGamePopup = new EndGamePopup(this.gemCollected, 2002);
  }

  removePlayerBalls() {
    let rigidBody = this.RigidBodiesArr.shift();
    let mesh = this.bodyMeshesArr.shift();

    rigidBody.collisionResponse = false;
    rigidBody.collisionFilterMask = 0;
    rigidBody.collisionFilterGroup = 0;

    // Remove object from scene and Dispose of the mesh's geometry and material to free up resources
    this.scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();

    // Remove the rigid body from the Physics World
    rigidBody.position.y += 10;
    rigidBody.position.x += 100;
  }

  removeFromScene(obj) {
    // Remove object from scene and Dispose of the mesh's geometry and material to free up resources
    this.scene.remove(obj);
    obj.geometry.dispose();
    obj.material.dispose();
  }

  createBodyMesh() {
    // Create Mesh for rigidbodies
    // let spMsh = this.PlayerBallModel.clone();
    // let sphereBody = spMsh.children.shift();
    // sphereBody.material = new MeshStandardMaterial({
    //   color: 0x0065ff,
    //   map: this.resources.items.PlayerBall,
    //   roughness: 1,
    // });
    // sphereBody.material.color = new Color(0x0065ff);
    // sphereBody.geometry = this.playerBallGeometry;
    // sphereBody.scale.set(0.012, 0.012, 0.012);
    // sphereBody.castShadow = true;
    // return sphereBody;

    const sphere = new THREE.SphereGeometry(0.6);

    const sphereMaterial = new MeshStandardMaterial({
      color: 0x0065ff,
      map: this.resources.items.PlayerBall,
      roughness: 1,
    });
    const sphereMesh = new Mesh(sphere, sphereMaterial);
    return sphereMesh;
  }

  addPhysicsToBodyMesh(bodyMesh) {
    let sphereBody = getPhysicsBody(
      bodyMesh,
      ShapeType.SPHERE,
      this.playerMaterial,
      this.mass
    );
    sphereBody.linearDamping = 0;
    sphereBody.angularDamping = 0;
    sphereBody.position.set(-4, 4, 0);
    sphereBody.fixedRotation = true;
    sphereBody.angularDamping = 0;
    return sphereBody;
  }

  endCameraAnimation() {
    gsap.to(this.camera.instance.position, {
      duration: 1,
      onStart: () => {
        this.camera.instance.lookAt(0, 0, -400);
      },
      y: this.camera.instance.position.y,
      z: this.camera.instance.position.z - 15,
    });
    this.endAnimation = true;
  }

  addPlayerBalls(noOfBallsToAdd) {
    for (let i = 0; i < noOfBallsToAdd; i++) {
      let bodyMesh = this.createBodyMesh();
      let rigidBody = this.addPhysicsToBodyMesh(bodyMesh);

      rigidBody.name = 4 + i;
      this.checkCollisionForBody(rigidBody);
      // Visulaize the bodies
      this.scene.add(bodyMesh);
      this.physicsWorld.addBody(rigidBody);

      this.bodyMeshesArr.push(bodyMesh);
      this.RigidBodiesArr.push(rigidBody);

      gsap.to(rigidBody.position, {
        duration: 0.3,
        x: this.headBody.position.x,
      });
      rigidBody.position.y = this.headBody.position.y;
    }
  }

  update() {
    // if (this.hand) this.hand.update();
    if (this.eventsRegistered) {
      // Update snake's head position based on this.direction
      const deltaTime = this.time.delta / 1000;
      if (this.headBody && !this.isReachedDestination) {
        // this.headBody.velocity.z = Math.round(this.playerVelocity);
        this.headBody.velocity.z = -15 * deltaTime;
        this.headBody.velocity.x = 0 * deltaTime;
        if (this.headBody.velocity.z > -10) {
          this.headBody.velocity.z = -15;
        }
      }

      for (
        let body = 1;
        body < this.RigidBodiesArr.length && !this.isReachedDestination;
        body++
      ) {
        this.RigidBodiesArr[body].velocity.x = 0;
        this.RigidBodiesArr[body].position.z =
          this.RigidBodiesArr[body - 1].position.z + 2;

        if (body > 0) {
          gsap.to(this.RigidBodiesArr[body].position, {
            duration: 0.1,
            x: this.RigidBodiesArr[body - 1].position.x,
          });
        }
      }

      if (this.RigidBodiesArr.length && !this.isReachedDestination) {
        this.camera.instance.position.set(
          0,
          this.RigidBodiesArr[0].position.y + 15,
          this.RigidBodiesArr[0].position.z + 45
        );

        this.camera.instance.lookAt(
          0,
          this.RigidBodiesArr[0].position.y,
          this.RigidBodiesArr[0].position.z
        );
      }
    } else {
      this.camera.instance.lookAt(0, 0, 0);
    }
    // Update Three.js sphere positions based on physics simulation
    for (let i = 0; i < this.RigidBodiesArr.length; i++) {
      let sphereBody = this.RigidBodiesArr[i];
      let sphereMesh = this.bodyMeshesArr[i];
      sphereMesh.position.copy(sphereBody.position);
      sphereMesh.quaternion.copy(sphereBody.quaternion);
    }
    if (this.headBody) {
      this.textBaseMesh.lookAt(
        this.camera.instance.position.x,
        this.camera.instance.position.y,
        this.camera.instance.position.z
      );
      this.playerBallCnt.position.x = this.headBody.position.x;
      this.playerBallCnt.position.y = this.headBody.position.y + 1.5;
      this.playerBallCnt.position.z = this.headBody.position.z;
    }
  }
}
