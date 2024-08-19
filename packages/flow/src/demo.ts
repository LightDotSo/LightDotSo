// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type { PostgresTable } from "@gregnr/postgres-meta/base";

export const demoPostgresTable: PostgresTable = {
  id: 1,
  schema: "public",
  name: "users",
  // biome-ignore lint/style/useNamingConvention: <explanation>
  rls_enabled: false,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  rls_forced: false,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  replica_identity: "DEFAULT",
  bytes: 8192,
  size: "8 kB",
  // biome-ignore lint/style/useNamingConvention: <explanation>
  live_rows_estimate: 100,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  dead_rows_estimate: 0,
  comment: "Table storing user information",
  columns: [
    {
      // biome-ignore lint/style/useNamingConvention: <explanation>
      table_id: 1,
      schema: "public",
      table: "users",
      id: "1",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      ordinal_position: 1,
      name: "id",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      default_value: null,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      data_type: "integer",
      format: "int4",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_identity: true,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      identity_generation: "BY DEFAULT",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_generated: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_nullable: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_updatable: true,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_unique: true,
      enums: [],
      check: null,
      comment: "Primary key for users table",
    },
    {
      // biome-ignore lint/style/useNamingConvention: <explanation>
      table_id: 1,
      schema: "public",
      table: "users",
      id: "2",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      ordinal_position: 2,
      name: "username",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      default_value: null,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      data_type: "character varying",
      format: "varchar",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_identity: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      identity_generation: null,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_generated: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_nullable: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_updatable: true,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_unique: true,
      enums: [],
      check: null,
      comment: "Unique username for the user",
    },
  ],
  // biome-ignore lint/style/useNamingConvention: <explanation>
  primary_keys: [
    {
      schema: "public",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      table_name: "users",
      name: "users_pkey",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      table_id: 1,
    },
  ],
  relationships: [
    {
      id: 1,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      constraint_name: "users_profile_id_fkey",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      source_schema: "public",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      source_table_name: "users",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      source_column_name: "profile_id",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      target_table_schema: "public",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      target_table_name: "profiles",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      target_column_name: "id",
    },
  ],
};

export const demoUserPostsTable: PostgresTable = {
  id: 2,
  schema: "public",
  name: "user_posts",
  // biome-ignore lint/style/useNamingConvention: <explanation>
  rls_enabled: false,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  rls_forced: false,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  replica_identity: "DEFAULT",
  bytes: 16384,
  size: "16 kB",
  // biome-ignore lint/style/useNamingConvention: <explanation>
  live_rows_estimate: 500,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  dead_rows_estimate: 0,
  comment: "Table storing user posts",
  columns: [
    {
      // biome-ignore lint/style/useNamingConvention: <explanation>
      table_id: 2,
      schema: "public",
      table: "user_posts",
      id: "1",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      ordinal_position: 1,
      name: "id",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      default_value: null,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      data_type: "integer",
      format: "int4",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_identity: true,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      identity_generation: "BY DEFAULT",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_generated: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_nullable: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_updatable: true,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_unique: true,
      enums: [],
      check: null,
      comment: "Primary key for user_posts table",
    },
    {
      // biome-ignore lint/style/useNamingConvention: <explanation>
      table_id: 2,
      schema: "public",
      table: "user_posts",
      id: "2",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      ordinal_position: 2,
      name: "user_id",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      default_value: null,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      data_type: "integer",
      format: "int4",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_identity: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      identity_generation: null,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_generated: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_nullable: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_updatable: true,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_unique: false,
      enums: [],
      check: null,
      comment: "Foreign key referencing users table",
    },
    {
      // biome-ignore lint/style/useNamingConvention: <explanation>
      table_id: 2,
      schema: "public",
      table: "user_posts",
      id: "3",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      ordinal_position: 3,
      name: "content",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      default_value: null,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      data_type: "text",
      format: "text",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_identity: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      identity_generation: null,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_generated: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_nullable: false,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_updatable: true,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_unique: false,
      enums: [],
      check: null,
      comment: "Content of the user post",
    },
  ],
  // biome-ignore lint/style/useNamingConvention: <explanation>
  primary_keys: [
    {
      schema: "public",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      table_name: "user_posts",
      name: "user_posts_pkey",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      table_id: 2,
    },
  ],
  relationships: [
    {
      id: 2,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      constraint_name: "user_posts_user_id_fkey",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      source_schema: "public",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      source_table_name: "user_posts",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      source_column_name: "user_id",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      target_table_schema: "public",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      target_table_name: "users",
      // biome-ignore lint/style/useNamingConvention: <explanation>
      target_column_name: "id",
    },
  ],
};
