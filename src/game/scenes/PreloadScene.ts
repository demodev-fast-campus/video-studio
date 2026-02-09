import * as Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 픽셀 스타일 로딩 화면 배경
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

    // 픽셀 스타일 로딩 박스
    progressBox.fillStyle(0x0a0a1a, 1);
    progressBox.fillRect(width / 2 - 162, height / 2 - 27, 324, 54);
    progressBox.lineStyle(4, 0x4a90d9);
    progressBox.strokeRect(width / 2 - 162, height / 2 - 27, 324, 54);

    const loadingText = this.add.text(width / 2, height / 2 - 60, 'LOADING...', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#4a90d9',
    });
    loadingText.setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5);

    // 로딩 진행률
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4a90d9, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    const assetPath = '/assets';

    // 배경 이미지
    this.load.image('bg', `${assetPath}/bg.jpeg`);

    // 정적 캐릭터 스프라이트 (64x64)
    this.load.image('boss', `${assetPath}/boss.png`);
    this.load.image('worker1', `${assetPath}/worker1.png`);
    this.load.image('worker2', `${assetPath}/worker2.png`);
    this.load.image('worker4', `${assetPath}/worker4.png`);

    // Julia 스프라이트 시트 (애니메이션용)
    // Julia-Idle.png: 128x32 → 4 frames of 32x32
    this.load.spritesheet('julia-idle', `${assetPath}/Julia-Idle.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
    // Julia_walk_*.png: 256x64 → 4 frames of 64x64
    this.load.spritesheet('julia-walk-down', `${assetPath}/Julia_walk_Foward.png`, {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('julia-walk-left', `${assetPath}/Julia_walk_Left.png`, {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('julia-walk-right', `${assetPath}/Julia_walk_Rigth.png`, {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('julia-walk-up', `${assetPath}/Julia_walk_Up.png`, {
      frameWidth: 64,
      frameHeight: 64,
    });
    // Julia_PC.png: 384x64 → 6 frames of 64x64
    this.load.spritesheet('julia-pc', `${assetPath}/Julia_PC.png`, {
      frameWidth: 64,
      frameHeight: 64,
    });
    // Julia_Drinking_Coffee.png: 96x32 → 3 frames of 32x32
    this.load.spritesheet('julia-coffee', `${assetPath}/Julia_Drinking_Coffee.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 오피스 가구
    this.load.image('desk', `${assetPath}/desk.png`);
    this.load.image('desk-with-pc', `${assetPath}/desk-with-pc.png`);
    this.load.image('chair', `${assetPath}/Chair.png`);
    this.load.image('pc1', `${assetPath}/PC1.png`);
    this.load.image('pc2', `${assetPath}/PC2.png`);
    this.load.image('cabinet', `${assetPath}/cabinet.png`);
    this.load.image('plant', `${assetPath}/plant.png`);
    this.load.image('printer', `${assetPath}/printer.png`);
    this.load.image('coffee-maker', `${assetPath}/coffee-maker.png`);
    this.load.image('water-cooler', `${assetPath}/water-cooler.png`);
    this.load.image('trash', `${assetPath}/Trash.png`);
    this.load.image('sink', `${assetPath}/sink.png`);
    this.load.image('stamping-table', `${assetPath}/stamping-table.png`);
    this.load.image('writing-table', `${assetPath}/writing-table.png`);

    // 오피스 파티션
    this.load.image('partition1', `${assetPath}/office-partitions-1.png`);
    this.load.image('partition2', `${assetPath}/office-partitions-2.png`);
  }

  create(): void {
    // Julia 애니메이션 생성
    this.anims.create({
      key: 'julia-idle-anim',
      frames: this.anims.generateFrameNumbers('julia-idle', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: 'julia-walk-down-anim',
      frames: this.anims.generateFrameNumbers('julia-walk-down', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'julia-walk-left-anim',
      frames: this.anims.generateFrameNumbers('julia-walk-left', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'julia-walk-right-anim',
      frames: this.anims.generateFrameNumbers('julia-walk-right', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'julia-walk-up-anim',
      frames: this.anims.generateFrameNumbers('julia-walk-up', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'julia-pc-anim',
      frames: this.anims.generateFrameNumbers('julia-pc', { start: 0, end: 5 }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: 'julia-coffee-anim',
      frames: this.anims.generateFrameNumbers('julia-coffee', { start: 0, end: 2 }),
      frameRate: 4,
      repeat: -1,
    });

    this.scene.start('OfficeScene');
  }
}
