// WebRTC 多人协作工具
export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private localStream: MediaStream | null = null;
  private onMessageCallback: ((data: any) => void) | null = null;

  constructor() {
    this.initializePeerConnection();
  }

  // 初始化对等连接
  private initializePeerConnection() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    // 创建本地连接
    const localConnection = new RTCPeerConnection(configuration);
    this.peerConnections.set('local', localConnection);

    // 创建数据通道
    const dataChannel = localConnection.createDataChannel('gameData');
    this.setupDataChannel(dataChannel);
    this.dataChannels.set('local', dataChannel);
  }

  // 设置数据通道
  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      console.log('数据通道已打开');
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (error) {
        console.error('解析消息失败:', error);
      }
    };

    channel.onerror = (error) => {
      console.error('数据通道错误:', error);
    };
  }

  // 创建邀请链接
  async createInvitation(): Promise<string> {
    const localConnection = this.peerConnections.get('local');
    if (!localConnection) throw new Error('本地连接未初始化');

    const offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);

    // 生成邀请码
    const invitationCode = this.generateInvitationCode();
    
    return JSON.stringify({
      type: 'offer',
      sdp: offer.sdp,
      invitationCode
    });
  }

  // 加入会话
  async joinSession(invitationData: string): Promise<void> {
    try {
      const data = JSON.parse(invitationData);
      const remoteConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // 设置远程描述
      await remoteConnection.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: data.sdp
      }));

      // 创建应答
      const answer = await remoteConnection.createAnswer();
      await remoteConnection.setLocalDescription(answer);

      // 设置数据通道
      remoteConnection.ondatachannel = (event) => {
        this.setupDataChannel(event.channel);
        this.dataChannels.set('remote', event.channel);
      };

      this.peerConnections.set('remote', remoteConnection);

      // 发送应答给主机
      this.sendToHost({
        type: 'answer',
        sdp: answer.sdp
      });

    } catch (error) {
      console.error('加入会话失败:', error);
      throw error;
    }
  }

  // 发送消息给所有连接
  sendMessage(message: any) {
    this.dataChannels.forEach((channel, key) => {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify(message));
      }
    });
  }

  // 设置消息接收回调
  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback;
  }

  // 生成邀请码
  private generateInvitationCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // 发送给主机
  private sendToHost(data: any) {
    const localChannel = this.dataChannels.get('local');
    if (localChannel && localChannel.readyState === 'open') {
      localChannel.send(JSON.stringify(data));
    }
  }

  // 获取连接状态
  getConnectionStatus(): string {
    const localChannel = this.dataChannels.get('local');
    const remoteChannel = this.dataChannels.get('remote');
    
    if (localChannel?.readyState === 'open' && remoteChannel?.readyState === 'open') {
      return 'connected';
    } else if (localChannel?.readyState === 'open') {
      return 'hosting';
    } else {
      return 'disconnected';
    }
  }

  // 断开连接
  disconnect() {
    this.dataChannels.forEach(channel => {
      if (channel.readyState === 'open') {
        channel.close();
      }
    });
    this.peerConnections.forEach(connection => {
      connection.close();
    });
    this.dataChannels.clear();
    this.peerConnections.clear();
  }
} 