import * as Phaser from 'phaser';
import { Agent } from '../entities/Agent';
import { EventBus, GameEvents } from '../utils/EventBus';
import { AgentRole, Phase } from '@/types';
import { GAME_CONFIG } from '../config';

export class OfficeScene extends Phaser.Scene {
  private agents: Map<AgentRole, Agent> = new Map();

  constructor() {
    super({ key: 'OfficeScene' });
  }

  create(): void {
    this.createPixelBackground();
    this.createOfficeLayout();
    this.createFurniture();
    this.createDecorations();
    this.createAgents();
    this.setupEventListeners();

    // 게임 준비 완료 이벤트
    EventBus.emit(GameEvents.GAME_READY);
  }

  private createPixelBackground(): void {
    const { width, height } = GAME_CONFIG;

    // 전체 바닥 타일로 채우기
    this.createOfficeTiles(0, 0, width, height);
  }

  private createOfficeTiles(x: number, y: number, w: number, h: number): void {
    const g = this.add.graphics();
    g.setDepth(-60);

    const tileSize = 32;
    for (let tx = x; tx < x + w; tx += tileSize) {
      for (let ty = y; ty < y + h; ty += tileSize) {
        const isEven = (Math.floor((tx - x) / tileSize) + Math.floor((ty - y) / tileSize)) % 2 === 0;
        g.fillStyle(isEven ? 0x9b8465 : 0x8a7555, 1);
        g.fillRect(tx, ty, tileSize, tileSize);
      }
    }

    // 타일 그리드 라인
    g.lineStyle(1, 0x6a5540, 0.3);
    for (let tx = x; tx <= x + w; tx += tileSize) {
      g.lineBetween(tx, y, tx, y + h);
    }
    for (let ty = y; ty <= y + h; ty += tileSize) {
      g.lineBetween(x, ty, x + w, ty);
    }
  }

  private createOfficeLayout(): void {
    const { width } = GAME_CONFIG;

    // 회의실 (Design Phase) - 좌상단
    this.createRoom(20, 40, 420, 210, 'MEETING', 0x4a90d9);

    // 개발실 (Coding Phase) - 우상단
    this.createRoom(460, 40, 420, 210, 'DEV ROOM', 0x50c878);

    // 테스트실 (Testing Phase) - 좌하단
    this.createRoom(20, 270, 420, 210, 'TEST LAB', 0xff6b6b);

    // 휴게실 - 우하단
    this.createRoom(460, 270, 420, 210, 'BREAK', 0xffa500);

    // 상단 타이틀
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x2c3e50, 0.95);
    titleBg.fillRect(width / 2 - 110, 5, 220, 30);
    titleBg.lineStyle(3, 0x3498db);
    titleBg.strokeRect(width / 2 - 110, 5, 220, 30);

    this.add
      .text(width / 2, 20, 'CHATDEV OFFICE', {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
  }

  private createRoom(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number
  ): void {
    const g = this.add.graphics();
    g.setDepth(10);

    // 테두리
    g.lineStyle(4, color, 1);
    g.strokeRect(x, y, width, height);

    // 라벨 배경
    const labelWidth = label.length * 9 + 20;
    g.fillStyle(color, 1);
    g.fillRect(x + 10, y + 8, labelWidth, 20);

    // 라벨 텍스트
    this.add
      .text(x + 10 + labelWidth / 2, y + 18, label, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(11);
  }

  private createFurniture(): void {
    // ===== 회의실 (MEETING - 좌상단) =====
    // 대형 회의 테이블 구성 (책상 4개 붙이기)
    this.addFurniture('desk', 180, 140, 1.6);
    this.addFurniture('desk', 280, 140, 1.6);
    this.addFurniture('desk', 180, 190, 1.6);
    this.addFurniture('desk', 280, 190, 1.6);

    // 회의실 의자 배치 (테이블 주변)
    this.addFurniture('chair', 130, 140, 1.2); // 좌
    this.addFurniture('chair', 130, 190, 1.2); // 좌
    this.addFurniture('chair', 330, 140, 1.2); // 우
    this.addFurniture('chair', 330, 190, 1.2); // 우
    this.addFurniture('chair', 230, 100, 1.2); // 상
    this.addFurniture('chair', 230, 230, 1.2); // 하

    // 프레젠테이션 영역
    this.addFurniture('cabinet', 380, 80, 1.4); // 스크린/보드 대용
    this.addFurniture('plant', 420, 80, 1.5);

    // 입구 쪽 장식
    this.addFurniture('plant', 40, 230, 1.8);
    this.addFurniture('trash', 400, 230, 1.4);

    // ===== 개발실 (DEV ROOM - 우상단) =====
    // 개발자 워크스테이션 (3열 배치)
    // 1열
    this.addFurniture('desk-with-pc', 520, 100, 1.4);
    this.addFurniture('chair', 520, 130, 1.1);
    this.addFurniture('partition1', 570, 110, 0.8);

    this.addFurniture('desk-with-pc', 620, 100, 1.4);
    this.addFurniture('chair', 620, 130, 1.1);
    this.addFurniture('partition1', 670, 110, 0.8);

    this.addFurniture('desk-with-pc', 720, 100, 1.4);
    this.addFurniture('chair', 720, 130, 1.1);

    // 2열
    this.addFurniture('desk-with-pc', 520, 180, 1.4);
    this.addFurniture('chair', 520, 210, 1.1);
    this.addFurniture('partition1', 570, 190, 0.8);

    this.addFurniture('desk-with-pc', 620, 180, 1.4);
    this.addFurniture('chair', 620, 210, 1.1);
    this.addFurniture('partition1', 670, 190, 0.8);

    this.addFurniture('desk-with-pc', 720, 180, 1.4);
    this.addFurniture('chair', 720, 210, 1.1);

    // 서버/장비 영역 (우측 벽면)
    this.addFurniture('cabinet', 840, 70, 1.3);
    this.addFurniture('cabinet', 840, 130, 1.3);
    this.addFurniture('printer', 840, 190, 1.3);
    this.addFurniture('cabinet', 840, 230, 1.3);

    // 장식
    this.addFurniture('plant', 480, 70, 1.6);
    this.addFurniture('trash', 480, 230, 1.4);

    // ===== 테스트실 (TEST LAB - 좌하단) =====
    // 테스트 벤치 (좌측 벽면)
    this.addFurniture('writing-table', 80, 320, 1.4);
    this.addFurniture('pc1', 80, 310, 1.2);
    this.addFurniture('chair', 80, 350, 1.1);

    this.addFurniture('writing-table', 80, 420, 1.4);
    this.addFurniture('pc2', 80, 410, 1.2);
    this.addFurniture('chair', 80, 450, 1.1);

    // 중앙 분석 테이블
    this.addFurniture('stamping-table', 230, 370, 1.5);
    this.addFurniture('stamping-table', 330, 370, 1.5);
    this.addFurniture('pc1', 230, 360, 1.2);
    this.addFurniture('pc2', 330, 360, 1.2);

    // 의자들
    this.addFurniture('chair', 230, 400, 1.1);
    this.addFurniture('chair', 330, 400, 1.1);

    // 자료 보관함
    this.addFurniture('cabinet', 400, 310, 1.3);
    this.addFurniture('cabinet', 400, 450, 1.3);

    // 장식
    this.addFurniture('plant', 40, 460, 1.6);
    this.addFurniture('trash', 230, 460, 1.4);

    // ===== 휴게실 (BREAK - 우하단) =====
    // 키친 영역 (상단 벽면)
    this.addFurniture('cabinet', 500, 300, 1.3);
    this.addFurniture('coffee-maker', 500, 290, 1.4);

    this.addFurniture('cabinet', 560, 300, 1.3);
    this.addFurniture('water-cooler', 560, 290, 1.4);

    this.addFurniture('sink', 640, 300, 1.4);

    this.addFurniture('cabinet', 720, 300, 1.3);
    this.addFurniture('cabinet', 780, 300, 1.3);

    // 라운지 테이블 (원형 배치 느낌)
    this.addFurniture('desk', 600, 400, 1.4);
    this.addFurniture('desk', 700, 400, 1.4);

    this.addFurniture('chair', 560, 400, 1.1); // 좌
    this.addFurniture('chair', 740, 400, 1.1); // 우
    this.addFurniture('chair', 650, 360, 1.1); // 상
    this.addFurniture('chair', 650, 440, 1.1); // 하

    // 휴식 공간 장식
    this.addFurniture('plant', 840, 300, 1.8);
    this.addFurniture('plant', 840, 460, 1.8);
    this.addFurniture('trash', 480, 460, 1.4);
  }

  private createDecorations(): void {
    // 복도 및 구분선

    // 중앙 수직 복도 (위아래 방 사이)
    this.addFurniture('plant', 440, 150, 1.2);
    this.addFurniture('plant', 440, 370, 1.2);

    // 중앙 수평 복도 (좌우 방 사이)
    // 파티션으로 명확한 구분
    this.addFurniture('partition2', 120, 250, 1.0);
    this.addFurniture('partition2', 320, 250, 1.0);
    this.addFurniture('partition2', 580, 250, 1.0);
    this.addFurniture('partition2', 780, 250, 1.0);
  }

  private addFurniture(key: string, x: number, y: number, scale: number): void {
    const sprite = this.add.image(x, y, key);
    sprite.setScale(scale);
    sprite.setDepth(y);
  }

  private createAgents(): void {
    // 에이전트 위치 - 가구 배치에 맞춰 조정
    const adjustedPositions: Record<AgentRole, { x: number; y: number }> = {
      CEO: { x: 230, y: 120 },        // 회의실 상석
      CTO: { x: 230, y: 210 },        // 회의실 맞은편
      Programmer: { x: 620, y: 130 }, // 개발실 중앙 데스크
      Reviewer: { x: 230, y: 400 },   // 테스트실 중앙
      Tester: { x: 330, y: 400 },     // 테스트실 중앙 우측
    };

    const roles: AgentRole[] = ['CEO', 'CTO', 'Programmer', 'Reviewer', 'Tester'];

    roles.forEach((role) => {
      const pos = adjustedPositions[role];
      const agent = new Agent(this, pos.x, pos.y, role);
      agent.setDepth(pos.y + 100);

      agent.on('pointerdown', () => {
        EventBus.emit(GameEvents.AGENT_CLICKED, role);
      });

      this.agents.set(role, agent);
    });
  }

  private setupEventListeners(): void {
    // 에이전트 이동
    EventBus.on(
      GameEvents.MOVE_AGENT,
      async (data: { role: AgentRole; x: number; y: number }) => {
        const agent = this.agents.get(data.role);
        if (agent) {
          await agent.moveToPosition(data.x, data.y);
          agent.setDepth(data.y + 100);
          EventBus.emit(GameEvents.AGENT_MOVED, data.role);
        }
      }
    );

    // 에이전트 활성화
    EventBus.on(
      GameEvents.SET_AGENT_ACTIVE,
      (data: { role: AgentRole; active: boolean }) => {
        const agent = this.agents.get(data.role);
        if (agent) {
          agent.setActive(data.active);
        }
      }
    );

    // 말풍선 표시
    EventBus.on(
      GameEvents.SHOW_BUBBLE,
      (data: { role: AgentRole; text: string }) => {
        const agent = this.agents.get(data.role);
        if (agent) {
          agent.showBubble(data.text);
        }
      }
    );

    // 말풍선 숨김
    EventBus.on(GameEvents.HIDE_BUBBLE, (role: AgentRole) => {
      const agent = this.agents.get(role);
      if (agent) {
        agent.hideBubble();
      }
    });

    // 대화 시작 (에이전트들을 대화 위치로 이동)
    EventBus.on(
      GameEvents.START_CONVERSATION,
      async (data: { instructor: AgentRole; assistant: AgentRole; phase: Phase }) => {
        const instructor = this.agents.get(data.instructor);
        const assistant = this.agents.get(data.assistant);

        if (instructor && assistant) {
          // 모든 에이전트 비활성화
          this.agents.forEach((a) => a.setActive(false));

          // 페이즈에 따른 대화 위치 결정 (가구 배치를 고려하여 조정)
          let targetX = 230;
          let targetY = 160; // 회의실 테이블 위

          if (data.phase === 'coding') {
            targetX = 620;
            targetY = 160; // 개발실 중앙 통로
          } else if (data.phase === 'testing') {
            targetX = 280;
            targetY = 400; // 테스트실 중앙
          }

          // 두 에이전트를 대화 위치로 이동
          await Promise.all([
            instructor.moveToPosition(targetX - 50, targetY),
            assistant.moveToPosition(targetX + 50, targetY),
          ]);

          // 이동 후 depth 업데이트
          instructor.setDepth(targetY + 100);
          assistant.setDepth(targetY + 100);

          // 활성화
          instructor.setActive(true);
          assistant.setActive(true);
        }
      }
    );
  }

  update(): void {
    // 게임 루프 업데이트
  }
}
