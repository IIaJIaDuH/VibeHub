-- pgTAP tests for RLS policies + triggers on profiles, posts, comments.
-- Run: supabase test db
--
-- Covers plan P0 item 5:
--   - anon SELECT allowed (profiles, posts, comments)
--   - owner INSERT/UPDATE allowed (authenticated, own rows)
--   - чужой write denied (INSERT as another user, UPDATE чужой = 0 rows)
--   - accepted_answer_id must reference a comment on the same post

BEGIN;
SELECT plan(11);

-- ============================================================
-- Seed: two test users (triggers create their profiles).
-- ============================================================
INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

-- Seed content as superuser (bypasses RLS).
INSERT INTO public.posts (id, author_id, type, title, content) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'discussion', 'Alice post', 'content'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'question',  'Bob post',   'content');

INSERT INTO public.comments (id, author_id, post_id, content) VALUES
  -- comment on Bob's own post
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bob on Bob post'),
  -- comment on Alice's post (by Bob)
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bob on Alice post');

-- ============================================================
-- anon: public read, no writes
-- ============================================================
SET ROLE anon;

SELECT isnt_empty(
  'SELECT * FROM public.profiles',
  'anon can SELECT profiles'
);

SELECT isnt_empty(
  'SELECT * FROM public.posts',
  'anon can SELECT posts'
);

SELECT isnt_empty(
  'SELECT * FROM public.comments',
  'anon can SELECT comments'
);

SELECT throws_ok(
  'INSERT INTO public.posts (author_id, type, title, content) VALUES (''11111111-1111-1111-1111-111111111111'', ''discussion'', ''x'', ''y'')',
  'permission denied for table posts',
  'anon cannot INSERT posts'
);

RESET ROLE;

-- ============================================================
-- authenticated owner: can write own rows
-- ============================================================
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

SELECT lives_ok(
  'INSERT INTO public.posts (author_id, type, title, content) VALUES (''11111111-1111-1111-1111-111111111111'', ''guide'', ''Alice new'', ''y'')',
  'owner can INSERT own post'
);

SELECT lives_ok(
  'UPDATE public.posts SET title = ''Alice updated'' WHERE id = ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa''',
  'owner can UPDATE own post'
);

RESET ROLE;

-- ============================================================
-- authenticated cannot write as another user
-- ============================================================
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

SELECT throws_ok(
  'INSERT INTO public.posts (author_id, type, title, content) VALUES (''22222222-2222-2222-2222-222222222222'', ''guide'', ''x'', ''y'')',
  'new row violates row-level security policy for table "posts"',
  'cannot INSERT post as another user'
);

-- UPDATE on чужой post: 0 rows affected, no error, data unchanged.
SELECT lives_ok(
  'UPDATE public.posts SET title = ''hacked'' WHERE id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
  'UPDATE on чужой post не падает (0 rows)'
);

SELECT is(
  (SELECT title FROM public.posts WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  'Bob post'::text,
  'чужой post не изменён после UPDATE'
);

RESET ROLE;

-- ============================================================
-- validate_accepted_answer trigger
-- ============================================================

-- accepted_answer_id referencing a comment on the SAME post — OK.
SELECT lives_ok(
  'UPDATE public.posts SET accepted_answer_id = ''dddddddd-dddd-dddd-dddd-dddddddddddd'' WHERE id = ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa''',
  'accepted_answer from same post — OK'
);

-- accepted_answer_id referencing a comment on a DIFFERENT post — denied.
SELECT throws_ok(
  'UPDATE public.posts SET accepted_answer_id = ''cccccccc-cccc-cccc-cccc-cccccccccccc'' WHERE id = ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa''',
  'accepted_answer_id must reference a comment on the same post',
  'accepted_answer from different post — denied'
);

SELECT * FROM finish();
ROLLBACK;
