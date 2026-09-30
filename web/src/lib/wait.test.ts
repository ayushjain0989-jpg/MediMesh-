import { describe, expect, it } from 'vitest'
import { nextToken, tokenNumber } from './wait'
import type { QueueTicket } from '../types'

describe('OPD tokens', () => {
  it('reads the numeric part of a token', () => {
    expect(tokenNumber('S-11')).toBe(11)
    expect(tokenNumber('bad')).toBe(0)
  })

  it('issues the next token for one hospital only', () => {
    const queue: QueueTicket[] = [
      {
        id: 'q1',
        hospitalId: 'sunrise',
        patientId: 'a',
        token: 'S-11',
        department: 'General',
        status: 'waiting',
        urgent: false,
        arrivedAt: '09:00',
      },
      {
        id: 'q2',
        hospitalId: 'lotus',
        patientId: 'b',
        token: 'L-40',
        department: 'General',
        status: 'waiting',
        urgent: false,
        arrivedAt: '09:00',
      },
    ]
    expect(nextToken('S', queue, 'sunrise')).toBe('S-12')
  })
})
