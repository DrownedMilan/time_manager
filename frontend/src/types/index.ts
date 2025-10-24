// Type definitions based on API models

export enum UserRole {
  EMPLOYEE = "Employee",
  MANAGER = "Manager",
  ORGANIZATION = "Organization"
}

export interface UserMinimal {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  manager_id: number | null;
  created_at: string;
  manager: UserMinimal | null;
  members: UserMinimal[];
}

export interface Clock {
  id: number;
  user_id: number;
  clock_in: string;
  clock_out: string | null;
  user: UserMinimal | null;
  created_at: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  created_at: string;
  clocks: Clock[];
  managed_team: Team | null;
  team: Team | null;
}
