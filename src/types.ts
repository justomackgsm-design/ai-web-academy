export interface Episode {
  id: string;
  seasonId: string;
  title: string;
  description: string;
  videoPath: string; // URL path like /api/videos/filename
  originalName: string;
  duration?: string;
  createdAt: string;
}

export interface Season {
  id: string;
  title: string;
  description: string;
}

export interface AccessCode {
  code: string;
  referralCode?: string;
  deviceLock: string | null;
  isPaid: boolean;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  referralBalance?: number;
  referredBy?: string;
  usdtAddress?: string;
  withdrawals?: Array<{
    id: string;
    amount: number;
    usdtAddress: string;
    status: "pending" | "completed";
    createdAt: string;
  }>;
}

export interface UserProfile {
  code: string;
  referralCode: string;
  firstName: string;
  lastName: string;
  email: string;
  referralBalance: number;
  referredBy?: string;
  usdtAddress?: string;
  withdrawals: Array<{
    id: string;
    amount: number;
    usdtAddress: string;
    status: "pending" | "completed";
    createdAt: string;
  }>;
}

export interface AppState {
  seasons: Season[];
  episodes: Episode[];
  codes: AccessCode[];
}
