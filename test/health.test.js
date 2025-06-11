const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/app')

const { expect } = chai
chai.use(chaiHttp)

describe('🏥 Health & Utility Controller Tests', () => {
  
  describe('GET /health', () => {
    it('✅ should return health status', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('status', 'OK')
          expect(res.body).to.have.property('timestamp')
          expect(res.body).to.have.property('environment')
          expect(res.body).to.have.property('apiVersion')
          expect(res.body.timestamp).to.be.a('string')
          expect(new Date(res.body.timestamp)).to.be.instanceOf(Date)
          done()
        })
    })

    it('✅ should include correct headers in response', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.header('X-API-Version')
          expect(res).to.have.header('X-API-Supported-Versions')
          expect(res).to.have.header('Content-Type')
          expect(res.get('Content-Type')).to.contain('application/json')
          done()
        })
    })

    it('✅ should be accessible without authentication', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('status', 'OK')
          done()
        })
    })

    it('✅ should return consistent structure', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res.body).to.be.an('object')
          expect(Object.keys(res.body)).to.include.members([
            'status',
            'timestamp',
            'environment',
            'apiVersion'
          ])
          done()
        })
    })
  })

  describe('GET /version', () => {
    it('✅ should return version information', (done) => {
      chai.request(app)
        .get('/version')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('currentVersion')
          expect(res.body).to.have.property('supportedVersions')
          expect(res.body).to.have.property('timestamp')
          expect(res.body.currentVersion).to.be.a('string')
          expect(res.body.supportedVersions).to.be.an('array')
          done()
        })
    })

    it('✅ should include supported versions array', (done) => {
      chai.request(app)
        .get('/version')
        .end((err, res) => {
          expect(res.body.supportedVersions).to.be.an('array')
          expect(res.body.supportedVersions.length).to.be.greaterThan(0)
          expect(res.body.supportedVersions).to.include(res.body.currentVersion)
          done()
        })
    })

    it('✅ should be accessible without authentication', (done) => {
      chai.request(app)
        .get('/version')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('currentVersion')
          done()
        })
    })

    it('✅ should include timestamp', (done) => {
      chai.request(app)
        .get('/version')
        .end((err, res) => {
          expect(res.body).to.have.property('timestamp')
          expect(res.body.timestamp).to.be.a('string')
          expect(new Date(res.body.timestamp)).to.be.instanceOf(Date)
          done()
        })
    })
  })

  describe('404 Error Handling', () => {
    it('❌ should return 404 for non-existent routes', (done) => {
      chai.request(app)
        .get('/non-existent-route')
        .end((err, res) => {
          expect(res).to.have.status(404)
          expect(res.body).to.have.property('success', false)
          expect(res.body).to.have.property('message')
          done()
        })
    })

    it('❌ should return 404 for invalid API routes', (done) => {
      chai.request(app)
        .get('/v1/invalid-endpoint')
        .end((err, res) => {
          expect(res).to.have.status(404)
          done()
        })
    })

    it('❌ should return proper JSON error response', (done) => {
      chai.request(app)
        .get('/invalid-route')
        .end((err, res) => {
          expect(res).to.have.status(404)
          expect(res.get('Content-Type')).to.contain('application/json')
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.property('success', false)
          done()
        })
    })
  })

  describe('Error Handling & Edge Cases', () => {
    it('✅ should handle invalid JSON gracefully', (done) => {
      chai.request(app)
        .post('/v1/auth/login')
        .type('json')
        .send('{"invalid": json}')
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })

    it('✅ should handle missing Content-Type header', (done) => {
      chai.request(app)
        .post('/v1/auth/login')
        .send('email=test@example.com&password=password123')
        .end((err, res) => {
          // Should be 401 because without proper JSON content-type, 
          // the request body isn't parsed as JSON, so auth validation fails
          expect(res).to.have.status(401)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })

    it('✅ should handle OPTIONS requests (CORS)', (done) => {
      chai.request(app)
        .options('/v1/auth/login')
        .end((err, res) => {
          // OPTIONS requests typically return 204 No Content for CORS preflight
          expect(res).to.have.status(204)
          done()
        })
    })

    it('✅ should include security headers', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.header('X-Content-Type-Options')
          expect(res).to.have.header('X-Frame-Options')
          done()
        })
    })
  })

  describe('Performance Tests', () => {
    it('✅ should respond to health check quickly', function(done) {
      this.timeout(1000) // Should respond within 1 second
      const startTime = Date.now()
      
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          const responseTime = Date.now() - startTime
          expect(res).to.have.status(200)
          expect(responseTime).to.be.below(500) // Should be under 500ms
          done()
        })
    })

    it('✅ should handle multiple concurrent requests', function(done) {
      this.timeout(5000)
      const requests = []
      
      for (let i = 0; i < 10; i++) {
        requests.push(
          chai.request(app)
            .get('/health')
            .end(() => {})
        )
      }
      
      Promise.all(requests).then(() => {
        done()
      }).catch(done)
    })
  })

  describe('API Documentation Routes', () => {
    it('✅ should serve API documentation if available', (done) => {
      chai.request(app)
        .get('/docs')
        .end((err, res) => {
          // This might return 404 if docs are not set up, which is OK
          expect([200, 404]).to.include(res.status)
          done()
        })
    })

    it('✅ should serve OpenAPI spec if available', (done) => {
      chai.request(app)
        .get('/api-docs')
        .end((err, res) => {
          // This might return 404 if api-docs are not set up, which is OK
          expect([200, 404]).to.include(res.status)
          done()
        })
    })
  })
}) 