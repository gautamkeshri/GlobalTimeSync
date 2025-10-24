import {
  type User,
  type InsertUser,
  type Timezone,
  type InsertTimezone,
  type Team,
  type InsertTeam,
  type TeamTimezone,
} from '../shared/schema';

export interface IStorage {
  createOrUpdateUser(user: InsertUser): Promise<User>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserTimezones(userId: number): Promise<Timezone[]>;
  createTimezone(timezone: InsertTimezone): Promise<Timezone>;
  deleteTimezone(id: number, userId: number): Promise<void>;
  setPrimaryTimezone(id: number, userId: number): Promise<void>;
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamByShareId(shareId: string): Promise<(Team & { timezones: TeamTimezone[] }) | undefined>;
  copyUserTimezonesToTeam(userId: number, teamId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private timezones: Map<number, Timezone> = new Map();
  private teams: Map<number, Team> = new Map();
  private teamTimezones: Map<number, TeamTimezone> = new Map();
  private userIdCounter = 1;
  private timezoneIdCounter = 1;
  private teamIdCounter = 1;
  private teamTimezoneIdCounter = 1;

  async createOrUpdateUser(insertUser: InsertUser): Promise<User> {
    const existing = Array.from(this.users.values()).find(
      user => user.firebaseUid === insertUser.firebaseUid
    );

    if (existing) {
      const updated = {
        ...existing,
        ...insertUser,
        displayName: insertUser.displayName ?? null,
        photoURL: insertUser.photoURL ?? null,
      };
      this.users.set(existing.id, updated);
      return updated;
    }

    const user: User = {
      id: this.userIdCounter++,
      firebaseUid: insertUser.firebaseUid,
      email: insertUser.email,
      displayName: insertUser.displayName ?? null,
      photoURL: insertUser.photoURL ?? null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);

    // Add default timezones for new users
    await this.addDefaultTimezones(user.id);

    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.firebaseUid === firebaseUid
    );
  }

  async getUserTimezones(userId: number): Promise<Timezone[]> {
    return Array.from(this.timezones.values()).filter(
      timezone => timezone.userId === userId
    );
  }

  async createTimezone(insertTimezone: InsertTimezone): Promise<Timezone> {
    // If this is set as primary, unset all other primary timezones for this user
    if (insertTimezone.isPrimary) {
      for (const [id, timezone] of Array.from(this.timezones.entries())) {
        if (timezone.userId === insertTimezone.userId && timezone.isPrimary) {
          this.timezones.set(id, { ...timezone, isPrimary: false });
        }
      }
    }

    const timezone: Timezone = {
      id: this.timezoneIdCounter++,
      name: insertTimezone.name,
      timezone: insertTimezone.timezone,
      city: insertTimezone.city,
      country: insertTimezone.country,
      userId: insertTimezone.userId ?? null,
      isPrimary: insertTimezone.isPrimary ?? null,
      createdAt: new Date(),
    };
    this.timezones.set(timezone.id, timezone);
    return timezone;
  }

  async deleteTimezone(id: number, userId: number): Promise<void> {
    const timezone = this.timezones.get(id);
    if (timezone && timezone.userId === userId) {
      this.timezones.delete(id);
    }
  }

  async setPrimaryTimezone(id: number, userId: number): Promise<void> {
    // First, unset all primary timezones for this user
    for (const [tzId, timezone] of Array.from(this.timezones.entries())) {
      if (timezone.userId === userId && timezone.isPrimary) {
        this.timezones.set(tzId, { ...timezone, isPrimary: false });
      }
    }

    // Then set the specified timezone as primary
    const timezone = this.timezones.get(id);
    if (timezone && timezone.userId === userId) {
      this.timezones.set(id, { ...timezone, isPrimary: true });
    }
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const team: Team = {
      id: this.teamIdCounter++,
      name: insertTeam.name,
      shareId: insertTeam.shareId,
      ownerId: insertTeam.ownerId ?? null,
      settings: insertTeam.settings ?? {},
      createdAt: new Date(),
    };
    this.teams.set(team.id, team);

    // Copy user's timezones to team
    if (insertTeam.ownerId) {
      await this.copyUserTimezonesToTeam(insertTeam.ownerId, team.id);
    }

    return team;
  }

  async getTeamByShareId(shareId: string): Promise<(Team & { timezones: TeamTimezone[] }) | undefined> {
    const team = Array.from(this.teams.values()).find(
      team => team.shareId === shareId
    );

    if (!team) return undefined;

    const timezones = Array.from(this.teamTimezones.values()).filter(
      tz => tz.teamId === team.id
    );

    return { ...team, timezones };
  }

  async copyUserTimezonesToTeam(userId: number, teamId: number): Promise<void> {
    const userTimezones = await this.getUserTimezones(userId);

    for (const timezone of userTimezones) {
      const teamTimezone: TeamTimezone = {
        id: this.teamTimezoneIdCounter++,
        teamId,
        name: timezone.name,
        timezone: timezone.timezone,
        city: timezone.city,
        country: timezone.country,
        isPrimary: timezone.isPrimary,
        createdAt: new Date(),
      };
      this.teamTimezones.set(teamTimezone.id, teamTimezone);
    }
  }

  private async addDefaultTimezones(userId: number): Promise<void> {
    const defaultTimezones = [
      {
        name: "New York",
        timezone: "America/New_York",
        city: "New York",
        country: "United States",
        isPrimary: true,
      },
      {
        name: "Los Angeles",
        timezone: "America/Los_Angeles",
        city: "Los Angeles",
        country: "United States",
        isPrimary: false,
      },
      {
        name: "London",
        timezone: "Europe/London",
        city: "London",
        country: "United Kingdom",
        isPrimary: false,
      },
      {
        name: "Tokyo",
        timezone: "Asia/Tokyo",
        city: "Tokyo",
        country: "Japan",
        isPrimary: false,
      },
    ];

    for (const tz of defaultTimezones) {
      const timezone: Timezone = {
        id: this.timezoneIdCounter++,
        userId,
        name: tz.name,
        timezone: tz.timezone,
        city: tz.city,
        country: tz.country,
        isPrimary: tz.isPrimary,
        createdAt: new Date(),
      };
      this.timezones.set(timezone.id, timezone);
    }
  }
}
