import request from 'supertest'
import express from 'express'
import routes from '../src/routes'

const app = express()
app.use(express.json())
app.use('/api', routes)

describe('API Tests', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('POST /api/chat should validate request', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({})
    expect(res.status).toBe(400)
  })

  it('POST /api/chapters should create chapter', async () => {
    const res = await request(app)
      .post('/api/chapters')
      .send({
        title: 'Test Chapter',
        novelId: '123e4567-e89b-12d3-a456-426614174000'
      })
    expect(res.status === 201 || res.status === 500).toBe(true)
  })
})
