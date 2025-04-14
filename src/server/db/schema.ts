// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  boolean,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { type Assignment, type Course } from "~/common/types/teachassist";
import { relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `teachassist-community_${name}`,
);

export const assignment = createTable("assignment", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  feedback: text("feedback"),
  categories: jsonb("categories").notNull().$type<Assignment["categories"]>(), // ← stores KU, T, C, A, O
  courseId: text("course_id").notNull().references(() => course.id, {
    onDelete: "cascade",
  }),
});

export const course = createTable("course", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name"),
  block: numeric("block").notNull(),
  room: text("room").notNull(),
  times: jsonb("times").notNull().$type<Course["times"]>(), // ← stores startTime, endTime, droppedTime
  overallMark: numeric("overall_mark"),
  isFinal: boolean("is_final").notNull().default(false),
  isMidterm: boolean("is_midterm").notNull().default(false),
  link: text("link"),
  schoolIdentifier: text("school_identifier"),
  isAnonymous: boolean("is_anonymous").notNull().default(true),
  userId: text("user_id").notNull().references(() => user.id, {
    onDelete: "cascade",
  })
});

export const courseRelations = relations(course, ({ many }) => ({
  assignments: many(assignment),
}));

export const assignmentRelations = relations(assignment, ({ one }) => ({
  course: one(course, {
    fields: [assignment.courseId],
    references: [course.id],
  }),
}));

export const user = createTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  taPassword: text('ta_password').notNull(),
  studentId: text('student_id').notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const session = createTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = createTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = createTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
