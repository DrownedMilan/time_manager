// src/services/clocks.ts
import { api } from './api'

export async function getUserClocks(userId: number) {
	try {
		const res = await api.get(`/users/${userId}/clocks/`)
		return res.data
	} catch (error) {
		console.error('❌ Erreur récupération des clocks utilisateur :', error)
		return []
	}
}

export async function toggleClock(userId: number) {
	try {
		const res = await api.post('/clocks/', { user_id: userId })
		return res.data
	} catch (error) {
		console.error('❌ Erreur Clock IN/OUT :', error)
		throw error
	}
}
