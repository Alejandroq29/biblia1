CREATE TYPE "BibliaStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "biblia_stories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(180) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "min_age" INTEGER NOT NULL,
    "max_age" INTEGER NOT NULL,
    "status" "BibliaStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "biblia_stories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "biblia_levels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL,
    "status" "BibliaStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "biblia_levels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "biblia_story_levels" (
    "story_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    CONSTRAINT "biblia_story_levels_pkey" PRIMARY KEY ("story_id", "level_id")
);

CREATE TABLE "biblia_games" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "story_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "game_type" VARCHAR(50) NOT NULL,
    "max_score" INTEGER NOT NULL DEFAULT 100,
    "status" "BibliaStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "biblia_games_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "biblia_game_questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "question_order" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "correct_answer" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "biblia_game_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "biblia_game_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "story_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "answers" JSONB,
    "completed_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "biblia_game_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "biblia_progress" (
    "user_id" UUID NOT NULL,
    "story_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "best_score" INTEGER NOT NULL DEFAULT 0,
    "attempts_count" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "last_played_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "biblia_progress_pkey" PRIMARY KEY ("user_id", "story_id", "level_id")
);

CREATE UNIQUE INDEX "biblia_stories_slug_key" ON "biblia_stories"("slug");
CREATE UNIQUE INDEX "biblia_levels_code_key" ON "biblia_levels"("code");
CREATE UNIQUE INDEX "biblia_game_questions_game_id_question_order_key" ON "biblia_game_questions"("game_id", "question_order");
CREATE INDEX "biblia_stories_status_deleted_at_idx" ON "biblia_stories"("status", "deleted_at");
CREATE INDEX "biblia_stories_min_age_max_age_idx" ON "biblia_stories"("min_age", "max_age");
CREATE INDEX "biblia_levels_status_deleted_at_idx" ON "biblia_levels"("status", "deleted_at");
CREATE INDEX "biblia_levels_sort_order_idx" ON "biblia_levels"("sort_order");
CREATE INDEX "biblia_games_story_id_level_id_idx" ON "biblia_games"("story_id", "level_id");
CREATE INDEX "biblia_games_status_deleted_at_idx" ON "biblia_games"("status", "deleted_at");
CREATE INDEX "biblia_game_attempts_user_id_story_id_level_id_idx" ON "biblia_game_attempts"("user_id", "story_id", "level_id");
CREATE INDEX "biblia_game_attempts_game_id_created_at_idx" ON "biblia_game_attempts"("game_id", "created_at");
CREATE INDEX "biblia_progress_user_id_completed_idx" ON "biblia_progress"("user_id", "completed");

ALTER TABLE "biblia_story_levels" ADD CONSTRAINT "biblia_story_levels_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "biblia_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biblia_story_levels" ADD CONSTRAINT "biblia_story_levels_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "biblia_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biblia_games" ADD CONSTRAINT "biblia_games_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "biblia_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biblia_games" ADD CONSTRAINT "biblia_games_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "biblia_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "biblia_game_questions" ADD CONSTRAINT "biblia_game_questions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "biblia_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biblia_game_attempts" ADD CONSTRAINT "biblia_game_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biblia_game_attempts" ADD CONSTRAINT "biblia_game_attempts_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "biblia_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biblia_game_attempts" ADD CONSTRAINT "biblia_game_attempts_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "biblia_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biblia_game_attempts" ADD CONSTRAINT "biblia_game_attempts_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "biblia_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "biblia_progress" ADD CONSTRAINT "biblia_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biblia_progress" ADD CONSTRAINT "biblia_progress_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "biblia_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biblia_progress" ADD CONSTRAINT "biblia_progress_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "biblia_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
