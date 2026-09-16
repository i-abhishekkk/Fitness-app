import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, type Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export interface CoachMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: Timestamp
}

/** Persists one message immediately (not batched/debounced like the rest of app state) —
 *  a chat history is only trustworthy if every turn actually lands, not just the latest
 *  snapshot after a delay. */
export async function saveCoachMessage(uid: string, role: CoachMessage['role'], content: string): Promise<void> {
  if (!db) return
  await addDoc(collection(db, 'users', uid, 'coachMessages'), { role, content, createdAt: serverTimestamp() })
}

export async function loadCoachHistory(uid: string, max = 100): Promise<CoachMessage[]> {
  if (!db) return []
  const q = query(collection(db, 'users', uid, 'coachMessages'), orderBy('createdAt', 'asc'), limit(max))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CoachMessage, 'id'>) }))
}
