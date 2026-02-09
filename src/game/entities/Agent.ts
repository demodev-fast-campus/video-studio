import * as Phaser from 'phaser';
import { AgentRole, AGENT_NAMES, AGENT_SPRITES, AGENT_COLORS } from '@/types';

// 픽셀 아트 스프라이트 기반 에이전트
export class Agent extends Phaser.GameObjects.Container {
  public role: AgentRole;
  private sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  private nameText: Phaser.GameObjects.Text;
  private bubble: Phaser.GameObjects.Container | null = null;
  private bubbleText: Phaser.GameObjects.Text | null = null;
  private isActiveAgent: boolean = false;
  private shadow: Phaser.GameObjects.Ellipse;
  private activeGlow: Phaser.GameObjects.Graphics | null = null;
  private isJulia: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, role: AgentRole) {
    super(scene, x, y);
    this.role = role;
    this.isJulia = role === 'QAReviewer'; // QAReviewer(Eve)가 Julia

    // 그림자
    this.shadow = scene.add.ellipse(0, 40, 50, 14, 0x000000, 0.4);
    this.add(this.shadow);

    // 캐릭터 스프라이트
    if (this.isJulia) {
      // Julia는 애니메이션 스프라이트
      // idle: 32x32, walk: 64x64 - idle은 스케일 다르게 적용
      this.sprite = scene.add.sprite(0, 0, 'julia-idle');
      (this.sprite as Phaser.GameObjects.Sprite).play('julia-idle-anim');
      this.sprite.setScale(2); // 32x32 * 2 = 64x64 -> then * 1.25 = 80
    } else {
      // 다른 에이전트는 정적 이미지 (64x64)
      const spriteKey = AGENT_SPRITES[role];
      this.sprite = scene.add.image(0, 0, spriteKey);
      this.sprite.setScale(1.5); // 64x64 * 1.5 = 96x96
    }
    this.add(this.sprite);

    // 에이전트 이름
    const color = AGENT_COLORS[role];
    const hexColor = '#' + color.toString(16).padStart(6, '0');

    this.nameText = scene.add.text(0, 55, AGENT_NAMES[role], {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: hexColor,
      backgroundColor: '#000000cc',
      padding: { x: 4, y: 2 },
    });
    this.nameText.setOrigin(0.5);
    this.add(this.nameText);

    // 인터랙티브 설정
    this.setSize(48, 64);
    this.setInteractive();

    scene.add.existing(this);
  }

  setActive(active: boolean): this {
    this.isActiveAgent = active;

    // Scene이 파괴된 후 호출될 수 있음 (HMR 등)
    if (!this.scene || !this.scene.sys?.isActive()) return this;

    if (active) {
      // 활성화 시 글로우 효과
      if (!this.activeGlow) {
        this.activeGlow = this.scene.add.graphics();
        const color = AGENT_COLORS[this.role];
        this.activeGlow.lineStyle(3, color, 0.8);
        this.activeGlow.strokeRect(-30, -38, 60, 76);
        this.add(this.activeGlow);
        this.sendToBack(this.activeGlow);
        this.sendToBack(this.shadow);
      }

      // 활성화 펄스 애니메이션
      this.scene.tweens.add({
        targets: this.activeGlow,
        alpha: { from: 1, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    } else {
      if (this.activeGlow) {
        this.scene.tweens.killTweensOf(this.activeGlow);
        this.activeGlow.destroy();
        this.activeGlow = null;
      }

      // Julia는 idle 애니메이션으로 복귀
      if (this.isJulia && this.sprite instanceof Phaser.GameObjects.Sprite && this.sprite.anims) {
        this.sprite.setScale(2); // idle scale (32x32 * 2)
        this.sprite.play('julia-idle-anim');
      }
    }
    return this;
  }

  showBubble(text: string): void {
    this.hideBubble();

    // Scene이 파괴된 후 호출될 수 있음 (HMR 등)
    if (!this.scene || !this.scene.sys?.isActive()) return;

    const maxWidth = 180;
    const padding = 8;

    // 말풍선 텍스트
    this.bubbleText = this.scene.add.text(0, -55, text, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#000000',
      wordWrap: { width: maxWidth - padding * 2 },
      align: 'center',
    });
    this.bubbleText.setOrigin(0.5, 1);

    const bubbleWidth = Math.min(
      Math.max(this.bubbleText.width + padding * 2, 60),
      maxWidth
    );
    const bubbleHeight = this.bubbleText.height + padding * 2;

    const bubble = this.scene.add.graphics();

    // 말풍선 배경
    bubble.fillStyle(0xffffff, 1);
    bubble.fillRect(-bubbleWidth / 2, -55 - bubbleHeight, bubbleWidth, bubbleHeight);

    // 픽셀 테두리
    bubble.fillStyle(0x000000);
    bubble.fillRect(-bubbleWidth / 2 - 2, -55 - bubbleHeight - 2, bubbleWidth + 4, 2);
    bubble.fillRect(-bubbleWidth / 2 - 2, -55 - bubbleHeight, 2, bubbleHeight + 2);
    bubble.fillStyle(0x666666);
    bubble.fillRect(-bubbleWidth / 2, -53, bubbleWidth + 2, 2);
    bubble.fillRect(bubbleWidth / 2, -55 - bubbleHeight, 2, bubbleHeight);

    // 말풍선 꼬리
    bubble.fillStyle(0xffffff);
    bubble.fillRect(-4, -56, 8, 4);
    bubble.fillStyle(0x000000);
    bubble.fillRect(-6, -56, 2, 2);
    bubble.fillRect(4, -56, 2, 2);

    this.bubble = this.scene.add.container(0, 0, [bubble, this.bubbleText]);
    this.add(this.bubble);

    this.scene.time.delayedCall(4000, () => {
      this.hideBubble();
    });
  }

  hideBubble(): void {
    if (this.bubble) {
      this.bubble.destroy();
      this.bubble = null;
      this.bubbleText = null;
    }
  }

  moveToPosition(x: number, y: number, duration: number = 800): Promise<void> {
    return new Promise((resolve) => {
      if (!this.scene || !this.scene.sys?.isActive()) {
        resolve();
        return;
      }

      // 이동 방향 계산
      const dx = x - this.x;
      const dy = y - this.y;

      // Julia만 방향에 따른 걷기 애니메이션
      if (this.isJulia && this.sprite instanceof Phaser.GameObjects.Sprite && this.sprite.anims) {
        // Walk sprites are 64x64, scale 1 to match workers
        this.sprite.setScale(1);
        if (Math.abs(dx) > Math.abs(dy)) {
          // 좌우 이동
          if (dx > 0) {
            this.sprite.play('julia-walk-right-anim');
          } else {
            this.sprite.play('julia-walk-left-anim');
          }
        } else {
          // 상하 이동
          if (dy > 0) {
            this.sprite.play('julia-walk-down-anim');
          } else {
            this.sprite.play('julia-walk-up-anim');
          }
        }
      }

      // 이동 애니메이션
      this.scene.tweens.add({
        targets: this,
        x,
        y,
        duration,
        ease: 'Power2',
        onComplete: () => {
          // Julia는 이동 완료 후 idle 애니메이션
          if (this.isJulia && this.sprite instanceof Phaser.GameObjects.Sprite && this.sprite.anims) {
            this.sprite.setScale(2); // Back to idle scale (32x32 * 2 = 64)
            this.sprite.play('julia-idle-anim');
          }
          resolve();
        },
      });
    });
  }

  // Julia가 PC 작업 중일 때 애니메이션
  playWorkAnimation(): void {
    if (this.isJulia && this.sprite instanceof Phaser.GameObjects.Sprite && this.sprite.anims) {
      this.sprite.play('julia-pc-anim');
    }
  }

  // Julia가 커피 마시는 애니메이션
  playCoffeeAnimation(): void {
    if (this.isJulia && this.sprite instanceof Phaser.GameObjects.Sprite && this.sprite.anims) {
      this.sprite.play('julia-coffee-anim');
    }
  }
}
