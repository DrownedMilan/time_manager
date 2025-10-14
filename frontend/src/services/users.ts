// src/services/users.ts
import { api } from './api'
import type { User } from '@/types/users'

export async function getUsers(): Promise<User[]> {
	try {
		const response = await api.get<User[]>('/users')
		return response.data
	} catch (error) {
		console.error('Erreur lors du chargement des utilisateurs :', error)
		return [] // on retourne un tableau vide en cas d’erreur
	}
}
