import { mockUsers } from "./mocks";

export async function getUsers() {
  // temporairement, retourne les mocks
  return Promise.resolve(mockUsers);
}
