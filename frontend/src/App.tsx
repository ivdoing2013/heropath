import { useState } from 'react'
import './App.css'

function App() {
  const [activeStage, setActiveStage] = useState(0)
  const [messages, setMessages] = useState([
    { id: 1, sender: 'wang', text: '嗨，我是王编导。🎬 20年了，我见过太多故事胎死腹中——不是才华不够，是方向不清。我不是来给你模板的，我是来帮你把这团火烧成一把剑的。' }
  ])
  const [inputText, setInputText] = useState('')

  const stages = [
    { id: 'departure', name: '启程', steps: ['平凡世界', '冒险召唤', '拒斥召唤', '遇见导师', '跨越门槛'] },
    { id: 'initiation', name: '启蒙', steps: ['考验盟友敌人', '接近洞穴', '严峻考验', '获得奖赏'] },
    { id: 'return', name: '回归', steps: ['踏上归途', '浴火重生', '回归赐福'] }
  ]

  const handleSend = () => {
    if (!inputText.trim()) return
    setMessages([...messages, { id: Date.now(), sender: 'user', text: inputText }])
    setInputText('')
  }

  return (
    <div className="heropath-container">
      {/* 左侧：王编导面板 */}
      <aside className="wang-panel">
        <div className="wang-header">
          <div className="wang-avatar">🎬</div>
          <div className="wang-info">
            <h2>王编导</h2>
            <span className="wang-status">在线</span>
          </div>
        </div>
        
        <div className="chat-area">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.sender === 'wang' && <div className="avatar">🎬</div>}
              <div className="bubble">{msg.text}</div>
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="和王编导聊聊你的故事..."
          />
          <button onClick={handleSend}>发送</button>
        </div>
      </aside>

      {/* 中间：创作画布 */}
      <main className="creation-canvas">
        <header className="canvas-header">
          <h1>HeroPath</h1>
          <div className="creator-types">
            <button className="type-btn active">抒情散文</button>
            <button className="type-btn">男欢女爱</button>
            <button className="type-btn">英雄之旅</button>
          </div>
        </header>

        <div className="canvas-content">
          <div className="welcome-card">
            <h2>🎯 开始你的英雄之旅</h2>
            <p>选择一个创作类型，王编导将陪伴你完成12个节点的创作</p>
            <div className="torch-progress">
              <div className="torch">🔥</div>
              <div className="path-line"></div>
            </div>
          </div>

          <div className="stage-cards">
            {stages.map((stage, idx) => (
              <div 
                key={stage.id} 
                className={`stage-card ${activeStage === idx ? 'active' : ''}`}
                onClick={() => setActiveStage(idx)}
              >
                <h3>{stage.name}</h3>
                <ul>
                  {stage.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 右侧：故事地图 */}
      <aside className="story-map">
        <h3>📍 故事地图</h3>
        <div className="map-timeline">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="timeline-section">
              <div className="timeline-header">{stage.name}</div>
              {stage.steps.map((step, i) => (
                <div key={i} className="timeline-node">
                  <span className="node-dot">○</span>
                  <span className="node-name">{step}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="heartbeats">
          <h4>💓 心跳时刻</h4>
          <div className="heartbeat-list">
            <div className="heartbeat-item">
              <span className="hb-time">刚刚</span>
              <span className="hb-text">开启创作之旅</span>
            </div>
          </div>
        </div>

        <div className="shortcuts">
          <p>快捷键：Ctrl+H 标记心跳时刻</p>
        </div>
      </aside>
    </div>
  )
}

export default App
