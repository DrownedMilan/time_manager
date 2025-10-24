import { User, UserRole, Team, Clock } from "../types";

// Mock users data
export const mockUsers: User[] = [
  {
    id: 1,
    first_name: "Sophie",
    last_name: "MARTIN",
    email: "sophie.martin@bank.fr",
    phone_number: "+33612345678",
    role: UserRole.ORGANIZATION,
    created_at: "2024-01-15T08:00:00Z",
    clocks: [],
    managed_team: null,
    team: null
  },
  {
    id: 2,
    first_name: "Thomas",
    last_name: "DUBOIS",
    email: "thomas.dubois@bank.fr",
    phone_number: "+33612345679",
    role: UserRole.MANAGER,
    created_at: "2024-02-10T08:00:00Z",
    clocks: [],
    managed_team: null,
    team: null
  },
  {
    id: 3,
    first_name: "Marie",
    last_name: "BERNARD",
    email: "marie.bernard@bank.fr",
    phone_number: "+33612345680",
    role: UserRole.EMPLOYEE,
    created_at: "2024-03-05T08:00:00Z",
    clocks: [],
    managed_team: null,
    team: null
  },
  {
    id: 4,
    first_name: "Lucas",
    last_name: "PETIT",
    email: "lucas.petit@bank.fr",
    phone_number: "+33612345681",
    role: UserRole.EMPLOYEE,
    created_at: "2024-03-12T08:00:00Z",
    clocks: [],
    managed_team: null,
    team: null
  },
  {
    id: 5,
    first_name: "Emma",
    last_name: "ROUX",
    email: "emma.roux@bank.fr",
    phone_number: "+33612345682",
    role: UserRole.MANAGER,
    created_at: "2024-02-20T08:00:00Z",
    clocks: [],
    managed_team: null,
    team: null
  },
  {
    id: 6,
    first_name: "Antoine",
    last_name: "MOREAU",
    email: "antoine.moreau@bank.fr",
    phone_number: "+33612345683",
    role: UserRole.EMPLOYEE,
    created_at: "2024-04-01T08:00:00Z",
    clocks: [],
    managed_team: null,
    team: null
  },
  {
    id: 7,
    first_name: "Camille",
    last_name: "LAURENT",
    email: "camille.laurent@bank.fr",
    phone_number: "+33612345684",
    role: UserRole.EMPLOYEE,
    created_at: "2024-04-08T08:00:00Z",
    clocks: [],
    managed_team: null,
    team: null
  }
];

// Mock teams
export const mockTeams: Team[] = [
  {
    id: 1,
    name: "Investment Banking",
    description: "Handles corporate finance and investment strategies",
    manager_id: 2,
    created_at: "2024-02-10T08:00:00Z",
    manager: {
      id: 2,
      first_name: "Thomas",
      last_name: "DUBOIS",
      email: "thomas.dubois@bank.fr",
      role: UserRole.MANAGER
    },
    members: [
      {
        id: 3,
        first_name: "Marie",
        last_name: "BERNARD",
        email: "marie.bernard@bank.fr",
        role: UserRole.EMPLOYEE
      },
      {
        id: 4,
        first_name: "Lucas",
        last_name: "PETIT",
        email: "lucas.petit@bank.fr",
        role: UserRole.EMPLOYEE
      }
    ]
  },
  {
    id: 2,
    name: "Retail Banking",
    description: "Customer-facing banking services and accounts",
    manager_id: 5,
    created_at: "2024-02-20T08:00:00Z",
    manager: {
      id: 5,
      first_name: "Emma",
      last_name: "ROUX",
      email: "emma.roux@bank.fr",
      role: UserRole.MANAGER
    },
    members: [
      {
        id: 6,
        first_name: "Antoine",
        last_name: "MOREAU",
        email: "antoine.moreau@bank.fr",
        role: UserRole.EMPLOYEE
      },
      {
        id: 7,
        first_name: "Camille",
        last_name: "LAURENT",
        email: "camille.laurent@bank.fr",
        role: UserRole.EMPLOYEE
      }
    ]
  }
];

// Mock clock records
export const mockClocks: Clock[] = [
  // Today's clocks
  {
    id: 1,
    user_id: 3,
    clock_in: "2025-10-17T08:30:00Z",
    clock_out: null,
    created_at: "2025-10-17T08:30:00Z",
    user: {
      id: 3,
      first_name: "Marie",
      last_name: "BERNARD",
      email: "marie.bernard@bank.fr",
      role: UserRole.EMPLOYEE
    }
  },
  {
    id: 2,
    user_id: 4,
    clock_in: "2025-10-17T08:45:00Z",
    clock_out: null,
    created_at: "2025-10-17T08:45:00Z",
    user: {
      id: 4,
      first_name: "Lucas",
      last_name: "PETIT",
      email: "lucas.petit@bank.fr",
      role: UserRole.EMPLOYEE
    }
  },
  {
    id: 3,
    user_id: 6,
    clock_in: "2025-10-17T09:00:00Z",
    clock_out: null,
    created_at: "2025-10-17T09:00:00Z",
    user: {
      id: 6,
      first_name: "Antoine",
      last_name: "MOREAU",
      email: "antoine.moreau@bank.fr",
      role: UserRole.EMPLOYEE
    }
  },
  // Yesterday's clocks
  {
    id: 4,
    user_id: 3,
    clock_in: "2025-10-16T08:15:00Z",
    clock_out: "2025-10-16T17:30:00Z",
    created_at: "2025-10-16T08:15:00Z",
    user: {
      id: 3,
      first_name: "Marie",
      last_name: "BERNARD",
      email: "marie.bernard@bank.fr",
      role: UserRole.EMPLOYEE
    }
  },
  {
    id: 5,
    user_id: 4,
    clock_in: "2025-10-16T08:30:00Z",
    clock_out: "2025-10-16T17:15:00Z",
    created_at: "2025-10-16T08:30:00Z",
    user: {
      id: 4,
      first_name: "Lucas",
      last_name: "PETIT",
      email: "lucas.petit@bank.fr",
      role: UserRole.EMPLOYEE
    }
  },
  {
    id: 6,
    user_id: 6,
    clock_in: "2025-10-16T09:00:00Z",
    clock_out: "2025-10-16T18:00:00Z",
    created_at: "2025-10-16T09:00:00Z",
    user: {
      id: 6,
      first_name: "Antoine",
      last_name: "MOREAU",
      email: "antoine.moreau@bank.fr",
      role: UserRole.EMPLOYEE
    }
  },
  {
    id: 7,
    user_id: 7,
    clock_in: "2025-10-16T08:45:00Z",
    clock_out: "2025-10-16T17:45:00Z",
    created_at: "2025-10-16T08:45:00Z",
    user: {
      id: 7,
      first_name: "Camille",
      last_name: "LAURENT",
      email: "camille.laurent@bank.fr",
      role: UserRole.EMPLOYEE
    }
  }
];

// Update users with team associations
mockUsers[2].team = mockTeams[0];
mockUsers[3].team = mockTeams[0];
mockUsers[6].team = mockTeams[1];
mockUsers[5].team = mockTeams[1];
mockUsers[1].managed_team = mockTeams[0];
mockUsers[4].managed_team = mockTeams[1];
